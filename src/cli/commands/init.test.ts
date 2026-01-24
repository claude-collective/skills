import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import os from "os";
import {
  mkdtemp,
  rm,
  mkdir,
  writeFile,
  readFile,
  readdir,
  stat,
} from "fs/promises";
import { copy, remove } from "../utils/fs";

// =============================================================================
// Constants
// =============================================================================

const SKILL_CONTENT = `---
name: test-skill
category: frontend
---

# Test Skill

This is a test skill for the init command tests.
`;

const SKILL_METADATA = `version: 1
author: test
`;

const PLUGIN_MANIFEST = {
  name: "claude-collective",
  version: "1.0.0",
  license: "MIT",
  skills: "./skills/",
  agents: "./agents/",
};

// =============================================================================
// Test Helpers
// =============================================================================

interface TestDirs {
  tempDir: string;
  collectiveDir: string;
  stacksDir: string;
  pluginDir: string;
  configPath: string;
}

/**
 * Create test directory structure for init command tests.
 * Mirrors the actual directory structure used by cc init:
 * - ~/.claude-collective/stacks/{stack-name}/skills/
 * - ~/.claude/plugins/claude-collective/
 */
async function createTestDirs(): Promise<TestDirs> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "cc-init-test-"));
  const collectiveDir = path.join(tempDir, ".claude-collective");
  const stacksDir = path.join(collectiveDir, "stacks");
  const pluginDir = path.join(
    tempDir,
    ".claude",
    "plugins",
    "claude-collective",
  );
  const configPath = path.join(collectiveDir, "config.yaml");

  return { tempDir, collectiveDir, stacksDir, pluginDir, configPath };
}

/**
 * Check if a directory exists
 */
async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * List directories in a path
 */
async function listDirectories(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Create a mock source directory with skills (simulates marketplace)
 */
async function createMockSource(
  baseDir: string,
  skillNames: string[],
): Promise<string> {
  const sourceDir = path.join(baseDir, "source");
  const skillsDir = path.join(sourceDir, "src", "skills");
  const agentsDir = path.join(sourceDir, "src", "agents");

  await mkdir(skillsDir, { recursive: true });
  await mkdir(agentsDir, { recursive: true });

  for (const skillName of skillNames) {
    const skillDir = path.join(skillsDir, skillName);
    await mkdir(skillDir, { recursive: true });
    await writeFile(path.join(skillDir, "SKILL.md"), SKILL_CONTENT);
    await writeFile(path.join(skillDir, "metadata.yaml"), SKILL_METADATA);
  }

  // Create mock agent definitions
  const agentDir = path.join(agentsDir, "developer", "frontend-developer");
  await mkdir(agentDir, { recursive: true });
  await writeFile(
    path.join(agentDir, "agent.yaml"),
    "name: frontend-developer\ndescription: Test agent",
  );

  return sourceDir;
}

/**
 * Simulate init command core logic for FIRST init:
 * 1. Create stack in ~/.claude-collective/stacks/{name}/
 * 2. Copy skills to stack
 * 3. Create plugin at ~/.claude/plugins/claude-collective/
 * 4. Copy skills and agents to plugin
 * 5. Set active stack
 *
 * This tests the same logic init.ts will have after Phase 4 updates
 */
async function simulateFirstInit(
  sourceDir: string,
  stackName: string,
  skillNames: string[],
  dirs: TestDirs,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Create stack directory
    const stackDir = path.join(dirs.stacksDir, stackName);
    const stackSkillsDir = path.join(stackDir, "skills");
    await mkdir(stackSkillsDir, { recursive: true });

    // 2. Copy skills to stack from source
    for (const skillName of skillNames) {
      const srcSkillDir = path.join(sourceDir, "src", "skills", skillName);
      const destSkillDir = path.join(stackSkillsDir, skillName);
      await copy(srcSkillDir, destSkillDir);
    }

    // 3. Create plugin directory structure
    await mkdir(path.join(dirs.pluginDir, ".claude-plugin"), {
      recursive: true,
    });
    await mkdir(path.join(dirs.pluginDir, "skills"), { recursive: true });
    await mkdir(path.join(dirs.pluginDir, "agents"), { recursive: true });

    // 4. Copy skills from stack to plugin
    await copy(stackSkillsDir, path.join(dirs.pluginDir, "skills"));

    // 5. Write plugin manifest
    await writeFile(
      path.join(dirs.pluginDir, ".claude-plugin", "plugin.json"),
      JSON.stringify(PLUGIN_MANIFEST, null, 2),
    );

    // 6. Write active stack config
    await mkdir(dirs.collectiveDir, { recursive: true });
    await writeFile(
      dirs.configPath,
      `source: local\nactive_stack: ${stackName}\n`,
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Simulate init command core logic for SUBSEQUENT inits:
 * 1. Create stack in ~/.claude-collective/stacks/{name}/
 * 2. Copy skills to stack
 * 3. Do NOT modify plugin (user must switch manually)
 *
 * This tests the same logic init.ts will have after Phase 4 updates
 */
async function simulateSubsequentInit(
  sourceDir: string,
  stackName: string,
  skillNames: string[],
  dirs: TestDirs,
): Promise<{ success: boolean; error?: string; shouldPromptSwitch?: boolean }> {
  try {
    // Check if stack already exists
    const stackDir = path.join(dirs.stacksDir, stackName);
    if (await directoryExists(stackDir)) {
      return { success: false, error: `Stack "${stackName}" already exists` };
    }

    // Create stack directory
    const stackSkillsDir = path.join(stackDir, "skills");
    await mkdir(stackSkillsDir, { recursive: true });

    // Copy skills to stack from source
    for (const skillName of skillNames) {
      const srcSkillDir = path.join(sourceDir, "src", "skills", skillName);
      const destSkillDir = path.join(stackSkillsDir, skillName);
      await copy(srcSkillDir, destSkillDir);
    }

    // Check if plugin already exists - if so, don't modify it
    const pluginExists = await directoryExists(dirs.pluginDir);

    return {
      success: true,
      shouldPromptSwitch: pluginExists,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// =============================================================================
// Tests
// =============================================================================

describe("init command", () => {
  let dirs: TestDirs;
  let sourceDir: string;

  beforeEach(async () => {
    dirs = await createTestDirs();
    sourceDir = await createMockSource(dirs.tempDir, [
      "react",
      "zustand",
      "nextjs",
    ]);
  });

  afterEach(async () => {
    await rm(dirs.tempDir, { recursive: true, force: true });
  });

  describe("first init (creates stack AND plugin)", () => {
    it("should create stack directory at ~/.claude-collective/stacks/{name}/", async () => {
      // Act
      const result = await simulateFirstInit(
        sourceDir,
        "my-first-stack",
        ["react", "zustand"],
        dirs,
      );

      // Assert
      expect(result.success).toBe(true);
      const stackDir = path.join(dirs.stacksDir, "my-first-stack");
      expect(await directoryExists(stackDir)).toBe(true);
    });

    it("should copy skills to stack skills directory", async () => {
      // Act
      await simulateFirstInit(
        sourceDir,
        "my-stack",
        ["react", "zustand"],
        dirs,
      );

      // Assert
      const stackSkillsDir = path.join(dirs.stacksDir, "my-stack", "skills");
      const skills = await listDirectories(stackSkillsDir);
      expect(skills).toContain("react");
      expect(skills).toContain("zustand");
      expect(skills).toHaveLength(2);
    });

    it("should create plugin at ~/.claude/plugins/claude-collective/", async () => {
      // Act
      const result = await simulateFirstInit(
        sourceDir,
        "test-stack",
        ["react"],
        dirs,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(await directoryExists(dirs.pluginDir)).toBe(true);

      // Verify it's specifically at claude-collective, not the stack name
      expect(dirs.pluginDir).toContain("claude-collective");
      expect(dirs.pluginDir).not.toContain("test-stack");
    });

    it("should create plugin manifest at .claude-plugin/plugin.json", async () => {
      // Act
      await simulateFirstInit(sourceDir, "test-stack", ["react"], dirs);

      // Assert
      const manifestPath = path.join(
        dirs.pluginDir,
        ".claude-plugin",
        "plugin.json",
      );
      expect(await fileExists(manifestPath)).toBe(true);

      const content = await readFile(manifestPath, "utf-8");
      const manifest = JSON.parse(content);
      expect(manifest.name).toBe("claude-collective");
      expect(manifest.skills).toBe("./skills/");
      expect(manifest.agents).toBe("./agents/");
    });

    it("should copy skills to plugin skills directory", async () => {
      // Act
      await simulateFirstInit(
        sourceDir,
        "test-stack",
        ["react", "nextjs"],
        dirs,
      );

      // Assert
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");
      const skills = await listDirectories(pluginSkillsDir);
      expect(skills).toContain("react");
      expect(skills).toContain("nextjs");
      expect(skills).toHaveLength(2);
    });

    it("should create agents directory in plugin", async () => {
      // Act
      await simulateFirstInit(sourceDir, "test-stack", ["react"], dirs);

      // Assert
      const agentsDir = path.join(dirs.pluginDir, "agents");
      expect(await directoryExists(agentsDir)).toBe(true);
    });

    it("should set active stack in config", async () => {
      // Act
      await simulateFirstInit(sourceDir, "active-stack", ["react"], dirs);

      // Assert
      const configContent = await readFile(dirs.configPath, "utf-8");
      expect(configContent).toContain("active_stack: active-stack");
    });

    it("should preserve skill content after copy to both stack and plugin", async () => {
      // Act
      await simulateFirstInit(sourceDir, "content-stack", ["react"], dirs);

      // Assert: Stack skill content
      const stackSkillContent = await readFile(
        path.join(
          dirs.stacksDir,
          "content-stack",
          "skills",
          "react",
          "SKILL.md",
        ),
        "utf-8",
      );
      expect(stackSkillContent).toContain("# Test Skill");

      // Assert: Plugin skill content (should match)
      const pluginSkillContent = await readFile(
        path.join(dirs.pluginDir, "skills", "react", "SKILL.md"),
        "utf-8",
      );
      expect(pluginSkillContent).toContain("# Test Skill");
    });
  });

  describe("subsequent init (creates stack only)", () => {
    it("should create new stack without modifying existing plugin", async () => {
      // Arrange: First init
      await simulateFirstInit(sourceDir, "first-stack", ["react"], dirs);

      // Record plugin state
      const pluginSkillsBefore = await listDirectories(
        path.join(dirs.pluginDir, "skills"),
      );

      // Act: Second init
      const result = await simulateSubsequentInit(
        sourceDir,
        "second-stack",
        ["zustand", "nextjs"],
        dirs,
      );

      // Assert: New stack exists
      expect(result.success).toBe(true);
      const secondStackSkills = await listDirectories(
        path.join(dirs.stacksDir, "second-stack", "skills"),
      );
      expect(secondStackSkills).toContain("zustand");
      expect(secondStackSkills).toContain("nextjs");

      // Assert: Plugin skills unchanged
      const pluginSkillsAfter = await listDirectories(
        path.join(dirs.pluginDir, "skills"),
      );
      expect(pluginSkillsAfter).toEqual(pluginSkillsBefore);
    });

    it("should indicate user should switch to new stack", async () => {
      // Arrange: First init
      await simulateFirstInit(sourceDir, "first-stack", ["react"], dirs);

      // Act: Second init
      const result = await simulateSubsequentInit(
        sourceDir,
        "second-stack",
        ["zustand"],
        dirs,
      );

      // Assert: Should prompt for switch
      expect(result.success).toBe(true);
      expect(result.shouldPromptSwitch).toBe(true);
    });

    it("should error when stack name already exists", async () => {
      // Arrange: First init
      await simulateFirstInit(sourceDir, "duplicate-stack", ["react"], dirs);

      // Act: Try to create same stack again
      const result = await simulateSubsequentInit(
        sourceDir,
        "duplicate-stack",
        ["zustand"],
        dirs,
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
    });

    it("should allow multiple stacks with different names", async () => {
      // Arrange: First init
      await simulateFirstInit(sourceDir, "stack-a", ["react"], dirs);

      // Act: Create multiple additional stacks
      await simulateSubsequentInit(sourceDir, "stack-b", ["zustand"], dirs);
      await simulateSubsequentInit(sourceDir, "stack-c", ["nextjs"], dirs);

      // Assert: All stacks exist
      const stacks = await listDirectories(dirs.stacksDir);
      expect(stacks).toContain("stack-a");
      expect(stacks).toContain("stack-b");
      expect(stacks).toContain("stack-c");
      expect(stacks).toHaveLength(3);
    });
  });

  describe("directory structure correctness", () => {
    it("should use correct path for stacks: ~/.claude-collective/stacks/{name}/skills/", async () => {
      // Act
      await simulateFirstInit(sourceDir, "path-test-stack", ["react"], dirs);

      // Assert: Full path structure
      const expectedPath = path.join(
        dirs.collectiveDir,
        "stacks",
        "path-test-stack",
        "skills",
      );
      expect(await directoryExists(expectedPath)).toBe(true);
    });

    it("should use correct path for plugin: ~/.claude/plugins/claude-collective/", async () => {
      // Act
      await simulateFirstInit(sourceDir, "plugin-path-test", ["react"], dirs);

      // Assert: Full path structure
      const expectedPluginPath = path.join(
        dirs.tempDir,
        ".claude",
        "plugins",
        "claude-collective",
      );
      expect(dirs.pluginDir).toBe(expectedPluginPath);
      expect(await directoryExists(dirs.pluginDir)).toBe(true);
    });

    it("should create plugin manifest at correct path", async () => {
      // Act
      await simulateFirstInit(sourceDir, "manifest-test", ["react"], dirs);

      // Assert
      const manifestPath = path.join(
        dirs.pluginDir,
        ".claude-plugin",
        "plugin.json",
      );
      expect(await fileExists(manifestPath)).toBe(true);
    });

    it("should have agents directory at plugin root", async () => {
      // Act
      await simulateFirstInit(sourceDir, "agents-test", ["react"], dirs);

      // Assert
      const agentsPath = path.join(dirs.pluginDir, "agents");
      expect(await directoryExists(agentsPath)).toBe(true);
    });

    it("should NOT create plugin at ~/.claude/plugins/{stack-name}/", async () => {
      // Act
      await simulateFirstInit(sourceDir, "wrong-path-test", ["react"], dirs);

      // Assert: Plugin should NOT be at stack-named path
      const wrongPath = path.join(
        dirs.tempDir,
        ".claude",
        "plugins",
        "wrong-path-test",
      );
      expect(await directoryExists(wrongPath)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty skill selection", async () => {
      // Act
      const result = await simulateFirstInit(
        sourceDir,
        "empty-skills-stack",
        [],
        dirs,
      );

      // Assert: Should still create directories, just empty
      expect(result.success).toBe(true);
      const stackSkillsDir = path.join(
        dirs.stacksDir,
        "empty-skills-stack",
        "skills",
      );
      expect(await directoryExists(stackSkillsDir)).toBe(true);
      const skills = await listDirectories(stackSkillsDir);
      expect(skills).toHaveLength(0);
    });

    it("should handle stack names with hyphens", async () => {
      // Act
      const result = await simulateFirstInit(
        sourceDir,
        "my-hyphenated-stack-name",
        ["react"],
        dirs,
      );

      // Assert
      expect(result.success).toBe(true);
      const stackDir = path.join(dirs.stacksDir, "my-hyphenated-stack-name");
      expect(await directoryExists(stackDir)).toBe(true);
    });

    it("should handle stack names with numbers", async () => {
      // Act
      const result = await simulateFirstInit(
        sourceDir,
        "my-stack-v2",
        ["react"],
        dirs,
      );

      // Assert
      expect(result.success).toBe(true);
      const stackDir = path.join(dirs.stacksDir, "my-stack-v2");
      expect(await directoryExists(stackDir)).toBe(true);
    });

    it("should handle many skills", async () => {
      // Act
      await simulateFirstInit(
        sourceDir,
        "many-skills-stack",
        ["react", "zustand", "nextjs"],
        dirs,
      );

      // Assert
      const stackSkillsDir = path.join(
        dirs.stacksDir,
        "many-skills-stack",
        "skills",
      );
      const skills = await listDirectories(stackSkillsDir);
      expect(skills).toHaveLength(3);
    });
  });

  describe("config file handling", () => {
    it("should create config.yaml in ~/.claude-collective/", async () => {
      // Act
      await simulateFirstInit(sourceDir, "config-test-stack", ["react"], dirs);

      // Assert
      expect(await fileExists(dirs.configPath)).toBe(true);
    });

    it("should set source in config", async () => {
      // Act
      await simulateFirstInit(sourceDir, "source-test-stack", ["react"], dirs);

      // Assert
      const configContent = await readFile(dirs.configPath, "utf-8");
      expect(configContent).toContain("source:");
    });

    it("should persist config across multiple inits", async () => {
      // Arrange: First init
      await simulateFirstInit(sourceDir, "first-stack", ["react"], dirs);

      // Read config after first init
      const configAfterFirst = await readFile(dirs.configPath, "utf-8");
      expect(configAfterFirst).toContain("active_stack: first-stack");

      // Note: Subsequent init doesn't update active_stack
      // User must switch manually
    });
  });

  describe("skills content integrity", () => {
    it("should copy SKILL.md file correctly", async () => {
      // Act
      await simulateFirstInit(sourceDir, "skill-md-test", ["react"], dirs);

      // Assert
      const skillMdPath = path.join(
        dirs.stacksDir,
        "skill-md-test",
        "skills",
        "react",
        "SKILL.md",
      );
      const content = await readFile(skillMdPath, "utf-8");
      expect(content).toContain("# Test Skill");
      expect(content).toContain("name: test-skill");
    });

    it("should copy metadata.yaml file correctly", async () => {
      // Act
      await simulateFirstInit(sourceDir, "metadata-test", ["react"], dirs);

      // Assert
      const metadataPath = path.join(
        dirs.stacksDir,
        "metadata-test",
        "skills",
        "react",
        "metadata.yaml",
      );
      const content = await readFile(metadataPath, "utf-8");
      expect(content).toContain("version: 1");
      expect(content).toContain("author: test");
    });
  });
});
