import path from "path";
import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { Liquid } from "liquidjs";
import {
  directoryExists,
  ensureDir,
  remove,
  copy,
  writeFile,
} from "../utils/fs";
import { getUserStacksDir, DIRS } from "../consts";
import { getCollectivePluginDir } from "../lib/plugin-finder";
import { getActiveStack, resolveSource } from "../lib/config";
import { loadSkillsMatrixFromSource } from "../lib/source-loader";
import {
  runWizard,
  clearTerminal,
  renderSelectionsHeader,
} from "../lib/wizard";
import { copySkillsToStackFromSource } from "../lib/skill-copier";
import { recompileAgents } from "../lib/agent-recompiler";
import { bumpPluginVersion } from "../lib/plugin-version";
import { fetchAgentDefinitions } from "../lib/agent-fetcher";
import { getStackSkillIds } from "../lib/stack-skills";

export const editCommand = new Command("edit")
  .description("Edit skills in the active stack")
  .option(
    "--source <url>",
    "Marketplace source URL (e.g., github:org/repo or local path)",
  )
  .option("--refresh", "Force refresh from marketplace", false)
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async (options) => {
    // 1. Get active stack
    const activeStack = await getActiveStack();

    if (!activeStack) {
      p.log.error("No active stack. Run 'cc init --name <name>' first.");
      process.exit(1);
    }

    const stackDir = path.join(getUserStacksDir(), activeStack);
    const stackSkillsDir = path.join(stackDir, "skills");

    if (!(await directoryExists(stackSkillsDir))) {
      p.log.error(`Stack "${activeStack}" not found.`);
      p.log.info(`Run ${pc.cyan("cc list")} to see available stacks.`);
      process.exit(1);
    }

    p.intro(pc.cyan(`Edit Stack: ${activeStack}`));

    const s = p.spinner();

    // 2. Resolve source
    s.start("Resolving marketplace source...");
    let sourceConfig;
    try {
      sourceConfig = await resolveSource(options.source);
      s.stop(`Source: ${sourceConfig.sourceOrigin}`);
    } catch (error) {
      s.stop("Failed to resolve source");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // 3. Load skills matrix
    s.start("Loading skills matrix...");
    let sourceResult;
    try {
      sourceResult = await loadSkillsMatrixFromSource({
        sourceFlag: options.source,
        projectDir: process.cwd(),
        forceRefresh: options.refresh,
      });
      s.stop(`Loaded ${Object.keys(sourceResult.matrix.skills).length} skills`);
    } catch (error) {
      s.stop("Failed to load skills matrix");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // 4. Get current stack's skill IDs
    s.start("Reading current skills...");
    let currentSkillIds: string[];
    try {
      currentSkillIds = await getStackSkillIds(
        stackSkillsDir,
        sourceResult.matrix,
      );
      s.stop(`Current stack has ${currentSkillIds.length} skills`);
    } catch (error) {
      s.stop("Failed to read current skills");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // 5. Run wizard with current skills pre-selected
    const result = await runWizard(sourceResult.matrix, {
      initialSkills: currentSkillIds,
    });

    if (!result) {
      p.cancel("Edit cancelled");
      process.exit(0);
    }

    // Validate the result
    if (!result.validation.valid) {
      p.log.error("Selection has validation errors:");
      for (const error of result.validation.errors) {
        p.log.error(`  ${error.message}`);
      }
      process.exit(1);
    }

    // Show final summary
    clearTerminal();
    renderSelectionsHeader(result.selectedSkills, sourceResult.matrix);

    // Show warnings if any
    if (result.validation.warnings.length > 0) {
      console.log(pc.yellow("Warnings:"));
      for (const warning of result.validation.warnings) {
        console.log(`  ${pc.yellow("!")} ${warning.message}`);
      }
      console.log("");
    }

    // Check if anything changed
    const addedSkills = result.selectedSkills.filter(
      (id) => !currentSkillIds.includes(id),
    );
    const removedSkills = currentSkillIds.filter(
      (id) => !result.selectedSkills.includes(id),
    );

    if (addedSkills.length === 0 && removedSkills.length === 0) {
      p.log.info("No changes made.");
      p.outro(pc.dim("Stack unchanged"));
      return;
    }

    // Show what changed
    console.log(pc.bold("Changes:"));
    for (const skillId of addedSkills) {
      const skill = sourceResult.matrix.skills[skillId];
      console.log(`  ${pc.green("+")} ${skill?.name || skillId}`);
    }
    for (const skillId of removedSkills) {
      const skill = sourceResult.matrix.skills[skillId];
      console.log(`  ${pc.red("-")} ${skill?.name || skillId}`);
    }
    console.log("");

    // 6. Apply changes to stack
    s.start("Updating stack skills...");
    try {
      // Remove existing skills from stack
      if (await directoryExists(stackSkillsDir)) {
        await remove(stackSkillsDir);
      }
      await ensureDir(stackSkillsDir);

      // Copy new selection to stack
      await copySkillsToStackFromSource(
        result.selectedSkills,
        stackDir,
        sourceResult.matrix,
        sourceResult,
      );
      s.stop(`Stack updated with ${result.selectedSkills.length} skills`);
    } catch (error) {
      s.stop("Failed to update stack");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // 7. Sync skills to plugin
    s.start("Syncing skills to plugin...");
    const pluginDir = getCollectivePluginDir();
    const pluginSkillsDir = path.join(pluginDir, "skills");
    try {
      if (await directoryExists(pluginSkillsDir)) {
        await remove(pluginSkillsDir);
      }
      await copy(stackSkillsDir, pluginSkillsDir);
      s.stop("Skills synced to plugin");
    } catch (error) {
      s.stop("Failed to sync skills");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // 8. Get source path for agent definitions
    let sourcePath: string;

    if (sourceResult.isLocal) {
      // Use local source path directly
      sourcePath = sourceResult.sourcePath;
    } else {
      // Fetch agent definitions from remote
      s.start("Fetching agent definitions...");
      try {
        const agentDefs = await fetchAgentDefinitions(sourceConfig.source, {
          forceRefresh: options.refresh,
        });
        sourcePath = agentDefs.sourcePath;
        s.stop("Agent definitions fetched");
      } catch (error) {
        s.stop("Failed to fetch agent definitions");
        p.log.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    }

    // 9. Recompile agents with updated skills
    s.start("Recompiling agents...");
    try {
      const recompileResult = await recompileAgents({
        pluginDir,
        sourcePath,
      });

      if (recompileResult.failed.length > 0) {
        s.stop(
          `Recompiled ${recompileResult.compiled.length} agents (${recompileResult.failed.length} failed)`,
        );
        for (const warning of recompileResult.warnings) {
          p.log.warn(warning);
        }
      } else if (recompileResult.compiled.length > 0) {
        s.stop(`Recompiled ${recompileResult.compiled.length} agents`);
      } else {
        s.stop("No agents to recompile");
      }
    } catch (error) {
      s.stop("Failed to recompile agents");
      p.log.warn(
        `Agent recompilation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      p.log.info(pc.dim("You can manually recompile with 'cc compile'."));
    }

    // 10. Bump patch version
    s.start("Updating plugin version...");
    try {
      const newVersion = await bumpPluginVersion(pluginDir, "patch");
      s.stop(`Version bumped to ${newVersion}`);
    } catch (error) {
      s.stop("Failed to update version");
      p.log.error(error instanceof Error ? error.message : String(error));
      // Don't exit - skills were updated successfully
    }

    // Success message
    console.log("");
    p.outro(
      pc.green(
        `Stack "${activeStack}" updated! (${addedSkills.length} added, ${removedSkills.length} removed)`,
      ),
    );
  });
