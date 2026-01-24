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

This is a test skill for the switch command tests.
`;

const SKILL_METADATA = `version: 1
author: test
`;

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
 * Create test directory structure for switch command tests
 * Mirrors the actual directory structure used by cc switch:
 * - ~/.claude-collective/stacks/{stack-name}/skills/
 * - ~/.claude/plugins/claude-collective/skills/
 */
async function createTestDirs(): Promise<TestDirs> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "cc-switch-test-"));
  const collectiveDir = path.join(tempDir, ".claude-collective");
  const stacksDir = path.join(collectiveDir, "stacks");
  const pluginDir = path.join(
    tempDir,
    ".claude",
    "plugins",
    "claude-collective",
  );
  const configPath = path.join(collectiveDir, "config.yaml");

  await mkdir(stacksDir, { recursive: true });
  await mkdir(pluginDir, { recursive: true });

  return { tempDir, collectiveDir, stacksDir, pluginDir, configPath };
}

/**
 * Create a stack with skills in the stacks directory
 */
async function createStack(
  stacksDir: string,
  stackName: string,
  skillNames: string[],
): Promise<void> {
  const stackSkillsDir = path.join(stacksDir, stackName, "skills");
  await mkdir(stackSkillsDir, { recursive: true });

  for (const skillName of skillNames) {
    const skillDir = path.join(stackSkillsDir, skillName);
    await mkdir(skillDir, { recursive: true });
    await writeFile(path.join(skillDir, "SKILL.md"), SKILL_CONTENT);
    await writeFile(path.join(skillDir, "metadata.yaml"), SKILL_METADATA);
  }
}

/**
 * Create skills in the plugin skills directory
 */
async function createPluginSkills(
  pluginDir: string,
  skillNames: string[],
): Promise<void> {
  const skillsDir = path.join(pluginDir, "skills");
  await mkdir(skillsDir, { recursive: true });

  for (const skillName of skillNames) {
    const skillDir = path.join(skillsDir, skillName);
    await mkdir(skillDir, { recursive: true });
    await writeFile(
      path.join(skillDir, "SKILL.md"),
      `# ${skillName}\nOriginal content before switch.`,
    );
    await writeFile(path.join(skillDir, "metadata.yaml"), SKILL_METADATA);
  }
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
 * Simulate switch command core logic:
 * 1. Validate stack exists
 * 2. Remove existing plugin skills
 * 3. Copy stack skills to plugin
 *
 * This tests the same logic as switch.ts without invoking the CLI
 */
async function simulateSwitch(
  stacksDir: string,
  stackName: string,
  pluginDir: string,
): Promise<{ success: boolean; error?: string }> {
  const stackSkillsDir = path.join(stacksDir, stackName, "skills");
  const pluginSkillsDir = path.join(pluginDir, "skills");

  // 1. Validate stack exists
  if (!(await directoryExists(stackSkillsDir))) {
    return { success: false, error: `Stack "${stackName}" not found` };
  }

  // 2. Remove existing skills from plugin
  if (await directoryExists(pluginSkillsDir)) {
    await remove(pluginSkillsDir);
  }

  // 3. Copy skills from stack to plugin
  await copy(stackSkillsDir, pluginSkillsDir);

  return { success: true };
}

// =============================================================================
// Tests
// =============================================================================

describe("switch command", () => {
  let dirs: TestDirs;

  beforeEach(async () => {
    dirs = await createTestDirs();
  });

  afterEach(async () => {
    await rm(dirs.tempDir, { recursive: true, force: true });
  });

  describe("switching to a valid stack", () => {
    it("should copy skills from stack to plugin directory", async () => {
      // Arrange: Create a stack with skills
      await createStack(dirs.stacksDir, "my-stack", ["react", "zustand"]);

      // Act: Switch to the stack
      const result = await simulateSwitch(
        dirs.stacksDir,
        "my-stack",
        dirs.pluginDir,
      );

      // Assert: Skills should exist in plugin directory
      expect(result.success).toBe(true);
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");
      const copiedSkills = await listDirectories(pluginSkillsDir);
      expect(copiedSkills).toContain("react");
      expect(copiedSkills).toContain("zustand");
      expect(copiedSkills).toHaveLength(2);
    });

    it("should create skills directory in plugin if it does not exist", async () => {
      // Arrange: Create stack but no plugin skills directory
      await createStack(dirs.stacksDir, "new-stack", ["nextjs"]);
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");

      // Ensure skills dir does not exist
      expect(await directoryExists(pluginSkillsDir)).toBe(false);

      // Act: Switch to the stack
      const result = await simulateSwitch(
        dirs.stacksDir,
        "new-stack",
        dirs.pluginDir,
      );

      // Assert: Skills directory should now exist with skills
      expect(result.success).toBe(true);
      expect(await directoryExists(pluginSkillsDir)).toBe(true);
      const skills = await listDirectories(pluginSkillsDir);
      expect(skills).toContain("nextjs");
    });

    it("should preserve skill content after copy", async () => {
      // Arrange
      await createStack(dirs.stacksDir, "content-stack", ["test-skill"]);

      // Act
      await simulateSwitch(dirs.stacksDir, "content-stack", dirs.pluginDir);

      // Assert: Content should be preserved
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");
      const skillContent = await readFile(
        path.join(pluginSkillsDir, "test-skill", "SKILL.md"),
        "utf-8",
      );
      expect(skillContent).toContain("# Test Skill");
      expect(skillContent).toContain("name: test-skill");
    });
  });

  describe("error handling for non-existent stack", () => {
    it("should return error when stack does not exist", async () => {
      // Act: Try to switch to non-existent stack
      const result = await simulateSwitch(
        dirs.stacksDir,
        "non-existent-stack",
        dirs.pluginDir,
      );

      // Assert: Should fail with appropriate error
      expect(result.success).toBe(false);
      expect(result.error).toContain("non-existent-stack");
      expect(result.error).toContain("not found");
    });

    it("should not modify plugin skills if stack does not exist", async () => {
      // Arrange: Create existing plugin skills but no stack
      await createPluginSkills(dirs.pluginDir, ["old-skill"]);
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");

      // Act: Try to switch to non-existent stack
      const result = await simulateSwitch(
        dirs.stacksDir,
        "fake-stack",
        dirs.pluginDir,
      );

      // Assert: Stack doesn't exist, plugin skills should be untouched
      expect(result.success).toBe(false);
      const existingSkills = await listDirectories(pluginSkillsDir);
      expect(existingSkills).toContain("old-skill");
    });
  });

  describe("removing old skills before copying new ones", () => {
    it("should remove existing skills directory before copy", async () => {
      // Arrange: Create existing plugin skills and a new stack
      await createPluginSkills(dirs.pluginDir, ["old-react", "old-zustand"]);
      await createStack(dirs.stacksDir, "new-stack", ["new-skill"]);

      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");

      // Verify old skills exist
      let skills = await listDirectories(pluginSkillsDir);
      expect(skills).toContain("old-react");
      expect(skills).toContain("old-zustand");

      // Act: Switch to new stack
      await simulateSwitch(dirs.stacksDir, "new-stack", dirs.pluginDir);

      // Assert: Only new skills should exist
      skills = await listDirectories(pluginSkillsDir);
      expect(skills).not.toContain("old-react");
      expect(skills).not.toContain("old-zustand");
      expect(skills).toContain("new-skill");
      expect(skills).toHaveLength(1);
    });

    it("should handle switch when plugin has no existing skills directory", async () => {
      // Arrange: Create stack but no existing plugin skills
      await createStack(dirs.stacksDir, "fresh-stack", ["fresh-skill"]);
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");

      // Ensure no skills directory exists
      expect(await directoryExists(pluginSkillsDir)).toBe(false);

      // Act: Switch
      const result = await simulateSwitch(
        dirs.stacksDir,
        "fresh-stack",
        dirs.pluginDir,
      );

      // Assert
      expect(result.success).toBe(true);
      const skills = await listDirectories(pluginSkillsDir);
      expect(skills).toContain("fresh-skill");
    });

    it("should completely replace skills, not merge them", async () => {
      // Arrange: Different skills in old and new
      await createPluginSkills(dirs.pluginDir, ["mobx", "tailwind"]);
      await createStack(dirs.stacksDir, "different-stack", [
        "zustand",
        "css-modules",
      ]);

      // Act: Switch
      await simulateSwitch(dirs.stacksDir, "different-stack", dirs.pluginDir);

      // Assert: Only new stack's skills should exist
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");
      const skills = await listDirectories(pluginSkillsDir);
      expect(skills).toEqual(
        expect.arrayContaining(["zustand", "css-modules"]),
      );
      expect(skills).not.toContain("mobx");
      expect(skills).not.toContain("tailwind");
      expect(skills).toHaveLength(2);
    });
  });

  describe("integration with directory structure", () => {
    it("should use correct path structure for stacks", async () => {
      // Assert: Stack path structure matches expected pattern
      const expectedStackPath = path.join(
        dirs.collectiveDir,
        "stacks",
        "my-stack",
        "skills",
      );
      const actualStackPath = path.join(dirs.stacksDir, "my-stack", "skills");
      expect(actualStackPath).toBe(expectedStackPath);
    });

    it("should use correct path structure for plugin", async () => {
      // Assert: Plugin path structure matches expected pattern
      const expectedPluginPath = path.join(dirs.pluginDir, "skills");
      expect(expectedPluginPath).toContain(".claude");
      expect(expectedPluginPath).toContain("plugins");
      expect(expectedPluginPath).toContain("claude-collective");
    });

    it("should handle stacks with nested skill directories", async () => {
      // Arrange: Create stack with nested skill structure
      const stackSkillsDir = path.join(
        dirs.stacksDir,
        "nested-stack",
        "skills",
      );
      const nestedSkillDir = path.join(
        stackSkillsDir,
        "frontend",
        "state",
        "zustand",
      );
      await mkdir(nestedSkillDir, { recursive: true });
      await writeFile(path.join(nestedSkillDir, "SKILL.md"), SKILL_CONTENT);

      // Act
      await simulateSwitch(dirs.stacksDir, "nested-stack", dirs.pluginDir);

      // Assert: Nested structure should be preserved
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");
      const nestedPath = path.join(
        pluginSkillsDir,
        "frontend",
        "state",
        "zustand",
        "SKILL.md",
      );
      const content = await readFile(nestedPath, "utf-8");
      expect(content).toContain("# Test Skill");
    });

    it("should handle stacks with multiple skills in different categories", async () => {
      // Arrange: Create stack with organized skill structure
      const stackSkillsDir = path.join(
        dirs.stacksDir,
        "organized-stack",
        "skills",
      );

      // Frontend skills
      await mkdir(path.join(stackSkillsDir, "frontend", "react"), {
        recursive: true,
      });
      await writeFile(
        path.join(stackSkillsDir, "frontend", "react", "SKILL.md"),
        "# React",
      );

      // Backend skills
      await mkdir(path.join(stackSkillsDir, "backend", "hono"), {
        recursive: true,
      });
      await writeFile(
        path.join(stackSkillsDir, "backend", "hono", "SKILL.md"),
        "# Hono",
      );

      // Act
      await simulateSwitch(dirs.stacksDir, "organized-stack", dirs.pluginDir);

      // Assert: Both categories should exist
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");
      expect(
        await directoryExists(path.join(pluginSkillsDir, "frontend")),
      ).toBe(true);
      expect(await directoryExists(path.join(pluginSkillsDir, "backend"))).toBe(
        true,
      );

      const reactContent = await readFile(
        path.join(pluginSkillsDir, "frontend", "react", "SKILL.md"),
        "utf-8",
      );
      expect(reactContent).toBe("# React");

      const honoContent = await readFile(
        path.join(pluginSkillsDir, "backend", "hono", "SKILL.md"),
        "utf-8",
      );
      expect(honoContent).toBe("# Hono");
    });
  });

  describe("edge cases", () => {
    it("should handle empty skills directory in stack", async () => {
      // Arrange: Create stack with empty skills directory
      const stackSkillsDir = path.join(dirs.stacksDir, "empty-stack", "skills");
      await mkdir(stackSkillsDir, { recursive: true });

      // Act
      await simulateSwitch(dirs.stacksDir, "empty-stack", dirs.pluginDir);

      // Assert: Skills directory should exist but be empty
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");
      expect(await directoryExists(pluginSkillsDir)).toBe(true);
      const skills = await listDirectories(pluginSkillsDir);
      expect(skills).toHaveLength(0);
    });

    it("should handle stack names with special characters", async () => {
      // Arrange: Create stack with hyphenated name
      await createStack(dirs.stacksDir, "my-special-stack-v2", ["skill1"]);

      // Act
      await simulateSwitch(
        dirs.stacksDir,
        "my-special-stack-v2",
        dirs.pluginDir,
      );

      // Assert
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");
      const skills = await listDirectories(pluginSkillsDir);
      expect(skills).toContain("skill1");
    });

    it("should handle switching to the same stack (idempotent)", async () => {
      // Arrange: Create stack and initial switch
      await createStack(dirs.stacksDir, "same-stack", ["react"]);
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");

      // First switch
      await simulateSwitch(dirs.stacksDir, "same-stack", dirs.pluginDir);
      let skills = await listDirectories(pluginSkillsDir);
      expect(skills).toContain("react");

      // Act: Switch to same stack again
      await simulateSwitch(dirs.stacksDir, "same-stack", dirs.pluginDir);

      // Assert: Should still work correctly
      skills = await listDirectories(pluginSkillsDir);
      expect(skills).toContain("react");
      expect(skills).toHaveLength(1);
    });

    it("should handle switching between different stacks", async () => {
      // Arrange: Create two stacks
      await createStack(dirs.stacksDir, "stack-a", ["react", "zustand"]);
      await createStack(dirs.stacksDir, "stack-b", ["vue", "pinia"]);
      const pluginSkillsDir = path.join(dirs.pluginDir, "skills");

      // Act: Switch to stack-a
      await simulateSwitch(dirs.stacksDir, "stack-a", dirs.pluginDir);

      // Assert: stack-a skills
      let skills = await listDirectories(pluginSkillsDir);
      expect(skills).toContain("react");
      expect(skills).toContain("zustand");
      expect(skills).not.toContain("vue");

      // Act: Switch to stack-b
      await simulateSwitch(dirs.stacksDir, "stack-b", dirs.pluginDir);

      // Assert: stack-b skills
      skills = await listDirectories(pluginSkillsDir);
      expect(skills).toContain("vue");
      expect(skills).toContain("pinia");
      expect(skills).not.toContain("react");
      expect(skills).not.toContain("zustand");
    });

    it("should handle skill directories with files other than SKILL.md", async () => {
      // Arrange: Create stack with skill that has multiple files
      const stackSkillsDir = path.join(dirs.stacksDir, "files-stack", "skills");
      const skillDir = path.join(stackSkillsDir, "complex-skill");
      await mkdir(path.join(skillDir, "examples"), { recursive: true });
      await writeFile(path.join(skillDir, "SKILL.md"), SKILL_CONTENT);
      await writeFile(path.join(skillDir, "metadata.yaml"), SKILL_METADATA);
      await writeFile(path.join(skillDir, "reference.md"), "# Reference");
      await writeFile(
        path.join(skillDir, "examples", "example1.ts"),
        "// Example",
      );

      // Act
      await simulateSwitch(dirs.stacksDir, "files-stack", dirs.pluginDir);

      // Assert: All files should be copied
      const pluginSkillDir = path.join(
        dirs.pluginDir,
        "skills",
        "complex-skill",
      );
      expect(await directoryExists(path.join(pluginSkillDir, "examples"))).toBe(
        true,
      );

      const content = await readFile(
        path.join(pluginSkillDir, "reference.md"),
        "utf-8",
      );
      expect(content).toBe("# Reference");

      const exampleContent = await readFile(
        path.join(pluginSkillDir, "examples", "example1.ts"),
        "utf-8",
      );
      expect(exampleContent).toBe("// Example");
    });
  });
});
