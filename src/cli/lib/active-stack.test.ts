import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs-extra";
import os from "os";
import {
  readActiveStack,
  writeActiveStack,
  listStacks,
  getExistingStacks,
  getCollectiveStacksDir,
} from "./active-stack";
import {
  COLLECTIVE_DIR,
  COLLECTIVE_STACKS_SUBDIR,
  ACTIVE_STACK_FILE,
} from "../consts";

describe("active-stack", () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a unique temp directory for each test
    tempDir = path.join(os.tmpdir(), `active-stack-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(tempDir);
  });

  describe("getCollectiveStacksDir", () => {
    it("should return correct stacks directory path", () => {
      const result = getCollectiveStacksDir("/my/project");
      expect(result).toBe("/my/project/.claude-collective/stacks");
    });
  });

  describe("readActiveStack", () => {
    it("should return null if active-stack file does not exist", async () => {
      const result = await readActiveStack(tempDir);
      expect(result).toBeNull();
    });

    it("should return null if active-stack file is empty", async () => {
      const collectiveDir = path.join(tempDir, COLLECTIVE_DIR);
      await fs.ensureDir(collectiveDir);
      await fs.writeFile(path.join(collectiveDir, ACTIVE_STACK_FILE), "");

      const result = await readActiveStack(tempDir);
      expect(result).toBeNull();
    });

    it("should return the stack name from active-stack file", async () => {
      const collectiveDir = path.join(tempDir, COLLECTIVE_DIR);
      await fs.ensureDir(collectiveDir);
      await fs.writeFile(
        path.join(collectiveDir, ACTIVE_STACK_FILE),
        "fullstack-react",
      );

      const result = await readActiveStack(tempDir);
      expect(result).toBe("fullstack-react");
    });

    it("should trim whitespace from stack name", async () => {
      const collectiveDir = path.join(tempDir, COLLECTIVE_DIR);
      await fs.ensureDir(collectiveDir);
      await fs.writeFile(
        path.join(collectiveDir, ACTIVE_STACK_FILE),
        "  fullstack-react  \n",
      );

      const result = await readActiveStack(tempDir);
      expect(result).toBe("fullstack-react");
    });
  });

  describe("writeActiveStack", () => {
    it("should create the collective directory if it does not exist", async () => {
      await writeActiveStack(tempDir, "my-stack");

      const collectiveDir = path.join(tempDir, COLLECTIVE_DIR);
      expect(await fs.pathExists(collectiveDir)).toBe(true);
    });

    it("should write the stack name to active-stack file", async () => {
      await writeActiveStack(tempDir, "my-stack");

      const filePath = path.join(tempDir, COLLECTIVE_DIR, ACTIVE_STACK_FILE);
      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toBe("my-stack");
    });

    it("should trim whitespace from stack name before writing", async () => {
      await writeActiveStack(tempDir, "  my-stack  ");

      const filePath = path.join(tempDir, COLLECTIVE_DIR, ACTIVE_STACK_FILE);
      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toBe("my-stack");
    });

    it("should overwrite existing active stack", async () => {
      await writeActiveStack(tempDir, "first-stack");
      await writeActiveStack(tempDir, "second-stack");

      const result = await readActiveStack(tempDir);
      expect(result).toBe("second-stack");
    });
  });

  describe("getExistingStacks", () => {
    it("should return empty array if stacks directory does not exist", async () => {
      const result = await getExistingStacks(tempDir);
      expect(result).toEqual([]);
    });

    it("should return list of stack directories", async () => {
      const stacksDir = path.join(
        tempDir,
        COLLECTIVE_DIR,
        COLLECTIVE_STACKS_SUBDIR,
      );
      await fs.ensureDir(path.join(stacksDir, "fullstack-react"));
      await fs.ensureDir(path.join(stacksDir, "work-stack"));

      const result = await getExistingStacks(tempDir);
      expect(result).toContain("fullstack-react");
      expect(result).toContain("work-stack");
      expect(result).toHaveLength(2);
    });

    it("should not include files (only directories)", async () => {
      const stacksDir = path.join(
        tempDir,
        COLLECTIVE_DIR,
        COLLECTIVE_STACKS_SUBDIR,
      );
      await fs.ensureDir(path.join(stacksDir, "fullstack-react"));
      await fs.writeFile(path.join(stacksDir, "some-file.txt"), "content");

      const result = await getExistingStacks(tempDir);
      expect(result).toEqual(["fullstack-react"]);
    });
  });

  describe("listStacks", () => {
    it("should return empty array if stacks directory does not exist", async () => {
      const result = await listStacks(tempDir);
      expect(result).toEqual([]);
    });

    it("should return stacks with isActive set correctly", async () => {
      const stacksDir = path.join(
        tempDir,
        COLLECTIVE_DIR,
        COLLECTIVE_STACKS_SUBDIR,
      );

      // Create stacks with config.yaml
      await fs.ensureDir(path.join(stacksDir, "fullstack-react"));
      await fs.writeFile(
        path.join(stacksDir, "fullstack-react", "config.yaml"),
        "name: Home Stack\nskill_ids:\n  - skill-a\n  - skill-b",
      );

      await fs.ensureDir(path.join(stacksDir, "work-stack"));
      await fs.writeFile(
        path.join(stacksDir, "work-stack", "config.yaml"),
        "name: Work Stack\nskill_ids:\n  - skill-c",
      );

      // Set active stack
      await writeActiveStack(tempDir, "fullstack-react");

      const result = await listStacks(tempDir);

      expect(result).toHaveLength(2);

      const homeStack = result.find((s) => s.name === "fullstack-react");
      expect(homeStack).toBeDefined();
      expect(homeStack?.isActive).toBe(true);
      expect(homeStack?.skillCount).toBe(2);

      const workStack = result.find((s) => s.name === "work-stack");
      expect(workStack).toBeDefined();
      expect(workStack?.isActive).toBe(false);
      expect(workStack?.skillCount).toBe(1);
    });

    it("should return skillCount of 0 if config is missing skill_ids", async () => {
      const stacksDir = path.join(
        tempDir,
        COLLECTIVE_DIR,
        COLLECTIVE_STACKS_SUBDIR,
      );

      await fs.ensureDir(path.join(stacksDir, "empty-stack"));
      await fs.writeFile(
        path.join(stacksDir, "empty-stack", "config.yaml"),
        "name: Empty Stack",
      );

      const result = await listStacks(tempDir);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("empty-stack");
      expect(result[0].skillCount).toBe(0);
    });
  });
});
