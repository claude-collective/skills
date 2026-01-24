import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";

export const updateCommand = new Command("update")
  .description("Update an existing stack's skill selection")
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async () => {
    p.log.warn("Stack update is being migrated to new architecture.");
    p.log.info(
      `Use ${pc.cyan("cc add <skill>")} to add skills to your active stack.`,
    );
    p.log.info(`Use ${pc.cyan("cc switch <stack>")} to change active stack.`);
  });
