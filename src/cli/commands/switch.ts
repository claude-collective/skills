import path from "path";
import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { directoryExists, remove, copy } from "../utils/fs";
import { getUserStacksDir } from "../consts";
import { getCollectivePluginDir } from "../lib/plugin-finder";
import { setActiveStack } from "../lib/config";
import { getStacksInfo, formatStackOption } from "../lib/stack-list";

export const switchCommand = new Command("switch")
  .description("Switch to a different skill stack")
  .argument(
    "[stack]",
    "Stack name to switch to (optional - shows selector if omitted)",
  )
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async (stackNameArg?: string) => {
    let stackName = stackNameArg;

    // If no stack name provided, show interactive selector
    if (!stackName) {
      const stacks = await getStacksInfo();

      if (stacks.length === 0) {
        p.log.warn("No stacks found.");
        p.log.info(`Run ${pc.cyan("cc init --name <name>")} to create one.`);
        process.exit(1);
      }

      if (stacks.length === 1) {
        stackName = stacks[0].name;
        if (stacks[0].isActive) {
          p.log.info(`Already on the only stack: ${pc.bold(stackName)}`);
          return;
        }
      } else {
        const selected = await p.select({
          message: "Select a stack to switch to:",
          options: stacks.map(formatStackOption),
        });

        if (p.isCancel(selected)) {
          p.cancel("Switch cancelled");
          process.exit(0);
        }

        stackName = selected as string;
      }
    }

    // Check if already on this stack
    const stacks = await getStacksInfo();
    const targetStack = stacks.find((s) => s.name === stackName);

    if (targetStack?.isActive) {
      p.log.info(`Already on stack: ${pc.bold(stackName)}`);
      return;
    }

    p.intro(pc.cyan(`Switch Stack: ${stackName}`));

    const s = p.spinner();

    // 1. Validate stack exists
    s.start("Validating stack...");
    const stackSkillsDir = path.join(getUserStacksDir(), stackName, "skills");

    if (!(await directoryExists(stackSkillsDir))) {
      s.stop("Stack not found");
      p.log.error(`Stack "${stackName}" not found.`);
      p.log.info(`Run ${pc.cyan("cc list")} to see available stacks.`);
      p.log.info(`Stacks are stored in: ${pc.dim(getUserStacksDir())}`);
      process.exit(1);
    }
    s.stop(`Stack found: ${stackName}`);

    // 2. Remove existing skills from plugin
    const pluginSkillsDir = path.join(getCollectivePluginDir(), "skills");

    s.start("Switching skills...");
    if (await directoryExists(pluginSkillsDir)) {
      await remove(pluginSkillsDir);
    }

    // 3. Copy skills from stack to plugin
    await copy(stackSkillsDir, pluginSkillsDir);
    s.stop("Skills switched");

    // 4. Update active stack in config
    s.start("Updating configuration...");
    await setActiveStack(stackName);
    s.stop("Configuration updated");

    // 5. Show success
    console.log("");
    p.outro(pc.green(`Switched to ${pc.bold(stackName)}!`));
  });
