import path from "path";
import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { directoryExists, ensureDir, glob, remove, copy } from "../utils/fs";
import { getCollectivePluginDir } from "../lib/plugin-finder";
import { bumpPluginVersion } from "../lib/plugin-version";
import { fetchMarketplace } from "../lib/source-fetcher";
import { fetchSkills } from "../lib/skill-fetcher";
import { fetchAgentDefinitions } from "../lib/agent-fetcher";
import { resolveSource, getActiveStack } from "../lib/config";
import { verbose } from "../utils/logger";
import { recompileAgents } from "../lib/agent-recompiler";
import { getUserStacksDir } from "../consts";

export const addCommand = new Command("add")
  .description("Add a skill to the active stack")
  .argument("<skill>", "Skill name to add (e.g., 'jotai', 'zustand')")
  .option(
    "--source <url>",
    "Marketplace source URL (e.g., github:org/repo or local path)",
  )
  .option("--refresh", "Force refresh from marketplace", false)
  .configureOutput({
    writeErr: (str) => console.error(pc.red(str)),
  })
  .showHelpAfterError(true)
  .action(async (skillName: string, options) => {
    p.intro(pc.cyan(`Add Skill: ${skillName}`));

    const s = p.spinner();

    // 1. Get active stack
    s.start("Finding active stack...");
    const activeStack = await getActiveStack();

    if (!activeStack) {
      s.stop("No active stack");
      p.log.error("No active stack. Run 'cc init --name <name>' first.");
      process.exit(1);
    }

    const stackDir = path.join(getUserStacksDir(), activeStack);
    const stackSkillsDir = path.join(stackDir, "skills");
    s.stop(`Active stack: ${activeStack}`);

    // 2. Check if skill already exists in stack
    if (await directoryExists(stackSkillsDir)) {
      // Check if this specific skill exists
      const existingSkills = await glob(
        `**/${skillName}*/SKILL.md`,
        stackSkillsDir,
      );

      if (existingSkills.length > 0) {
        p.log.error(
          `Skill "${skillName}" already exists in stack "${activeStack}".`,
        );
        p.log.info(`Found at: ${existingSkills[0]}`);
        process.exit(1);
      }
    }

    // 3. Resolve source
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

    // 4. Fetch marketplace
    s.start("Fetching marketplace...");
    let marketplaceResult;
    try {
      marketplaceResult = await fetchMarketplace(sourceConfig.source, {
        forceRefresh: options.refresh,
      });
      s.stop(
        `Marketplace loaded: ${marketplaceResult.marketplace.plugins.length} plugins`,
      );
    } catch (error) {
      s.stop("Failed to fetch marketplace");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // 5. Fetch and copy skill to stack
    s.start(`Fetching skill: ${skillName}...`);
    try {
      await ensureDir(stackSkillsDir);
      const copiedSkills = await fetchSkills(
        [skillName],
        marketplaceResult.marketplace,
        stackDir,
        marketplaceResult.sourcePath,
        { forceRefresh: options.refresh },
      );
      s.stop(`Skill fetched: ${copiedSkills.join(", ")}`);
    } catch (error) {
      s.stop("Failed to fetch skill");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // 6. Sync skills to plugin (like switch command does)
    s.start("Syncing skills to plugin...");
    const pluginDir = getCollectivePluginDir();
    const pluginSkillsDir = path.join(pluginDir, "skills");
    try {
      // Remove existing skills from plugin
      if (await directoryExists(pluginSkillsDir)) {
        await remove(pluginSkillsDir);
      }
      // Copy all skills from stack to plugin
      await copy(stackSkillsDir, pluginSkillsDir);
      s.stop("Skills synced to plugin");
    } catch (error) {
      s.stop("Failed to sync skills");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // 7. Fetch agent definitions
    s.start("Fetching agent definitions...");
    let agentDefs;
    try {
      agentDefs = await fetchAgentDefinitions(sourceConfig.source, {
        forceRefresh: options.refresh,
      });
      s.stop("Agent definitions fetched");
      verbose(`  Agents: ${agentDefs.agentsDir}`);
      verbose(`  Principles: ${agentDefs.principlesDir}`);
      verbose(`  Templates: ${agentDefs.templatesDir}`);
    } catch (error) {
      s.stop("Failed to fetch agent definitions");
      p.log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }

    // 8. Recompile agents with updated skills
    s.start("Recompiling agents...");
    try {
      // agentDefs contains paths to source directories
      // We need the parent directory that contains agents/, principles/, templates/
      const sourcePath = agentDefs.sourcePath;

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

    // 9. Bump patch version
    s.start("Updating plugin version...");
    try {
      const newVersion = await bumpPluginVersion(pluginDir, "patch");
      s.stop(`Version bumped to ${newVersion}`);
    } catch (error) {
      s.stop("Failed to update version");
      p.log.error(error instanceof Error ? error.message : String(error));
      // Don't exit - skill was added successfully
    }

    // Success message
    console.log("");
    p.outro(pc.green(`Skill "${skillName}" added to stack "${activeStack}"!`));
  });
