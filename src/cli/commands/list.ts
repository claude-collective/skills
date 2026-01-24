import path from "path";
import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { listDirectories } from "../utils/fs";
import { getUserStacksDir } from "../consts";
import { getActiveStack } from "../lib/config";

export const listCommand = new Command("list")
  .alias("ls")
  .description("List all stacks")
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async () => {
    const stacksDir = getUserStacksDir();
    const stacks = await listDirectories(stacksDir);

    if (stacks.length === 0) {
      p.log.warn("No stacks found.");
      p.log.info(`Run ${pc.cyan("cc init --name <name>")} to create one.`);
      return;
    }

    const activeStack = await getActiveStack();

    console.log("");
    console.log(pc.bold("Stacks:"));

    for (const stackName of stacks) {
      const skillsDir = path.join(stacksDir, stackName, "skills");
      const skills = await listDirectories(skillsDir);
      const skillCount = skills.length;

      const isActive = stackName === activeStack;
      const marker = isActive ? pc.green("*") : " ";
      const name = isActive ? pc.bold(stackName) : stackName;
      const count = pc.dim(
        `(${skillCount} skill${skillCount === 1 ? "" : "s"})`,
      );

      console.log(`  ${marker} ${name} ${count}`);
    }

    console.log("");
  });
