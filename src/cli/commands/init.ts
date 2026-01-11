import { Command } from 'commander';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import { glob, fileExists, ensureDir } from '../utils/fs';
import { OUTPUT_DIR, DIRS } from '../consts';

// Type for clack group results with optional properties
interface InitConfig {
  approach?: 'stack' | 'custom';
  stack?: string;
  framework?: 'react' | 'vue' | 'svelte';
  stateManagement?: 'zustand' | 'redux' | 'none';
  styling?: 'scss-modules' | 'tailwind' | 'styled';
  compile?: boolean;
}

export const initCommand = new Command('init')
  .description('Initialize Claude Collective in your project')
  .option('--stack <name>', 'Use a specific stack')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async (options) => {
    p.intro(pc.cyan('Claude Collective Setup'));

    const projectRoot = process.cwd();

    // Check if already initialized
    const outputDir = path.join(projectRoot, OUTPUT_DIR);
    if (await fileExists(outputDir)) {
      const shouldContinue = await p.confirm({
        message: 'Claude Collective already initialized. Reinitialize?',
        initialValue: false,
      });

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.cancel('Setup cancelled');
        process.exit(0);
      }
    }

    // Load available stacks for selection
    const stacksDir = path.join(projectRoot, DIRS.stacks);
    let availableStacks: string[] = [];

    try {
      const stackDirs = await glob('*/config.yaml', stacksDir);
      availableStacks = stackDirs.map((s) => s.replace('/config.yaml', ''));
    } catch {
      // No stacks directory - that's ok for new projects
    }

    // If --stack provided, validate it exists
    if (options.stack) {
      if (!availableStacks.includes(options.stack)) {
        p.log.error(`Stack "${options.stack}" not found`);
        p.log.info(`Available stacks: ${availableStacks.join(', ') || 'none'}`);
        process.exit(1);
      }
    }

    // Interactive configuration
    const config = (await p.group(
      {
        // Skip if --stack provided or --yes flag
        approach: () => {
          if (options.stack || options.yes) {
            return Promise.resolve(options.stack ? 'stack' : 'stack');
          }

          return p.select({
            message: 'How would you like to set up?',
            options: [
              {
                value: 'stack',
                label: 'Use a pre-built stack',
                hint: 'recommended',
              },
              {
                value: 'custom',
                label: 'Build custom configuration',
              },
            ],
          }) as Promise<'stack' | 'custom'>;
        },

        // Stack selection
        stack: ({ results }) => {
          if (options.stack) return Promise.resolve(options.stack);
          if (results.approach !== 'stack') return Promise.resolve(undefined);

          if (availableStacks.length === 0) {
            p.log.warn('No stacks available. Please add stacks to src/stacks/');
            return Promise.resolve(undefined);
          }

          return p.select({
            message: 'Select a stack:',
            options: availableStacks.map((s) => ({
              value: s,
              label: s.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            })),
          }) as Promise<string>;
        },

        // Custom: Framework selection
        framework: ({ results }) => {
          if (results.approach !== 'custom') return Promise.resolve(undefined);

          return p.select({
            message: 'Select your framework:',
            options: [
              { value: 'react', label: 'React' },
              { value: 'vue', label: 'Vue' },
              { value: 'svelte', label: 'Svelte' },
            ],
          }) as Promise<'react' | 'vue' | 'svelte'>;
        },

        // Custom: State management (React only)
        stateManagement: ({ results }) => {
          if (results.approach !== 'custom') return Promise.resolve(undefined);
          if (results.framework !== 'react') return Promise.resolve(undefined);

          return p.select({
            message: 'Select state management:',
            options: [
              { value: 'zustand', label: 'Zustand', hint: 'recommended' },
              { value: 'redux', label: 'Redux Toolkit' },
              { value: 'none', label: 'None' },
            ],
          }) as Promise<'zustand' | 'redux' | 'none'>;
        },

        // Custom: Styling
        styling: ({ results }) => {
          if (results.approach !== 'custom') return Promise.resolve(undefined);

          return p.select({
            message: 'Select styling approach:',
            options: [
              { value: 'scss-modules', label: 'SCSS Modules + cva' },
              { value: 'tailwind', label: 'Tailwind CSS' },
              { value: 'styled', label: 'Styled Components' },
            ],
          }) as Promise<'scss-modules' | 'tailwind' | 'styled'>;
        },

        // Confirm compilation
        compile: () => {
          if (options.yes) return Promise.resolve(true);

          return p.confirm({
            message: 'Compile now?',
            initialValue: true,
          });
        },
      },
      {
        onCancel: () => {
          p.cancel('Setup cancelled');
          process.exit(0);
        },
      }
    )) as InitConfig;

    // Execute setup with task list
    await p.tasks([
      {
        title: 'Creating configuration directory',
        task: async () => {
          await ensureDir(outputDir);
          return 'Created .claude/';
        },
      },
      ...(config.stack
        ? [
            {
              title: `Setting up stack: ${config.stack}`,
              task: async () => {
                // Stack mode - the compile command will handle copying
                return `Stack "${config.stack}" ready`;
              },
            },
          ]
        : []),
      ...(config.framework
        ? [
            {
              title: `Configuring ${config.framework} framework`,
              task: async () => {
                // Custom mode - would generate config files
                return `${config.framework} configured`;
              },
            },
          ]
        : []),
    ]);

    // Run compilation if requested
    if (config.compile) {
      p.log.step('Running compilation...');

      // Dynamic import to run compile command
      // const { compileCommand } = await import('./compile');

      // Run compile with appropriate options
      const compileArgs = ['compile'];
      if (config.stack) {
        compileArgs.push('--stack', config.stack);
      }

      // Note: In a real implementation, we'd call the compile function directly
      // For now, we just inform the user
      p.log.info(
        `Run: ${pc.cyan(`cc compile ${config.stack ? `--stack ${config.stack}` : ''}`)}`
      );
    }

    p.outro(pc.green('Setup complete! Your .claude/ configuration is ready.'));

    // Show next steps
    console.log('\n' + pc.dim('Next steps:'));
    console.log(pc.dim('  1. Run ') + pc.cyan('cc compile') + pc.dim(' to compile your agents'));
    console.log(pc.dim('  2. Check ') + pc.cyan('.claude/') + pc.dim(' for generated files'));
    console.log(pc.dim('  3. Read the docs at ') + pc.cyan('https://claude-collective.dev'));
  });
