import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { getStacksInfo, formatStackDisplay } from "../lib/stack-list";

export const listCommand = new Command("list")
  .alias("ls")
  .description("List all stacks")
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async () => {
    const stacks = await getStacksInfo();

    if (stacks.length === 0) {
      p.log.warn("No stacks found.");
      p.log.info(`Run ${pc.cyan("cc init --name <name>")} to create one.`);
      return;
    }

    console.log("");
    console.log(pc.bold("Stacks:"));

    for (const stack of stacks) {
      console.log(`  ${formatStackDisplay(stack)}`);
    }

    console.log("");
  });
