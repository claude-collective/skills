import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  getExistingStacks,
  writeActiveStack,
  readActiveStack,
} from "../lib/active-stack";

export const switchCommand = new Command("switch")
  .description("Switch active stack")
  .argument("<name>", "Stack name to switch to")
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async (stackName: string) => {
    const projectDir = process.cwd();

    // Validate stack exists
    const existingStacks = await getExistingStacks(projectDir);

    if (existingStacks.length === 0) {
      p.log.error("No stacks found.");
      p.log.info(`Run ${pc.cyan("cc init")} to create a stack first.`);
      process.exit(1);
    }

    if (!existingStacks.includes(stackName)) {
      p.log.error(`Stack "${stackName}" not found.`);
      p.log.info(`Available stacks: ${existingStacks.join(", ")}`);
      process.exit(1);
    }

    // Check if already active
    const currentActive = await readActiveStack(projectDir);
    if (currentActive === stackName) {
      p.log.info(`Stack "${stackName}" is already active.`);
      process.exit(0);
    }

    // Set active stack
    await writeActiveStack(projectDir, stackName);
    p.outro(pc.green(`Switched to stack "${stackName}"`));
    p.log.info(`Run ${pc.cyan("cc compile")} to compile the stack.`);
  });
