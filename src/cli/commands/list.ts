import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { listStacks } from "../lib/active-stack";

export const listCommand = new Command("list")
  .alias("ls")
  .description("List all stacks")
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async () => {
    const projectDir = process.cwd();
    const stacks = await listStacks(projectDir);

    if (stacks.length === 0) {
      p.log.warn("No stacks found.");
      p.log.info(`Run ${pc.cyan("cc init")} to create a stack.`);
      process.exit(0);
    }

    console.log("\nStacks:");
    for (const stack of stacks) {
      const marker = stack.isActive ? pc.green("*") : " ";
      const activeLabel = stack.isActive ? pc.green(" (active)") : "";
      console.log(
        `  ${marker} ${pc.cyan(stack.name)}${activeLabel} ${pc.dim(`(${stack.skillCount} skills)`)}`,
      );
    }
    console.log("");
  });
