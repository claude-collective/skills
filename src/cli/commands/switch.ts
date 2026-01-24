import path from "path";
import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { directoryExists, remove, copy } from "../utils/fs";
import { getUserStacksDir } from "../consts";
import { getCollectivePluginDir } from "../lib/plugin-finder";
import { setActiveStack, getActiveStack } from "../lib/config";

export const switchCommand = new Command("switch")
  .description("Switch to a different skill stack")
  .argument("<stack>", "Stack name to switch to")
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async (stackName: string) => {
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
    const previousStack = await getActiveStack();
    console.log("");
    p.outro(pc.green(`Switched to ${pc.bold(stackName)}!`));
  });
