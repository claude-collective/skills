import path from "path";
import {
  readFile,
  writeFile,
  fileExists,
  ensureDir,
  directoryExists,
  listDirectories,
} from "../utils/fs";
import {
  COLLECTIVE_DIR,
  COLLECTIVE_STACKS_SUBDIR,
  ACTIVE_STACK_FILE,
} from "../consts";
import { readStackConfig } from "./stack-config";

/**
 * Read the active stack name from .claude-collective/active-stack
 * Returns null if file doesn't exist or is empty
 */
export async function readActiveStack(
  projectDir: string,
): Promise<string | null> {
  const filePath = path.join(projectDir, COLLECTIVE_DIR, ACTIVE_STACK_FILE);
  if (!(await fileExists(filePath))) return null;
  const content = await readFile(filePath);
  return content.trim() || null;
}

/**
 * Write the active stack name to .claude-collective/active-stack
 */
export async function writeActiveStack(
  projectDir: string,
  stackName: string,
): Promise<void> {
  const collectiveDir = path.join(projectDir, COLLECTIVE_DIR);
  await ensureDir(collectiveDir);
  const filePath = path.join(collectiveDir, ACTIVE_STACK_FILE);
  await writeFile(filePath, stackName.trim());
}

/**
 * Stack list item with metadata
 */
export interface StackListItem {
  name: string;
  isActive: boolean;
  skillCount: number;
}

/**
 * Get the stacks directory path for a project
 */
export function getCollectiveStacksDir(projectDir: string): string {
  return path.join(projectDir, COLLECTIVE_DIR, COLLECTIVE_STACKS_SUBDIR);
}

/**
 * List all stacks in a project with their metadata
 */
export async function listStacks(projectDir: string): Promise<StackListItem[]> {
  const stacksDir = getCollectiveStacksDir(projectDir);

  if (!(await directoryExists(stacksDir))) {
    return [];
  }

  const stackNames = await listDirectories(stacksDir);
  const activeStack = await readActiveStack(projectDir);

  const stacks: StackListItem[] = [];

  for (const name of stackNames) {
    const stackDir = path.join(stacksDir, name);
    const config = await readStackConfig(stackDir);
    const skillCount = config?.skill_ids?.length ?? 0;

    stacks.push({
      name,
      isActive: name === activeStack,
      skillCount,
    });
  }

  return stacks;
}

/**
 * Get list of existing stack names in .claude-collective/stacks/
 */
export async function getExistingStacks(projectDir: string): Promise<string[]> {
  const stacksDir = getCollectiveStacksDir(projectDir);
  return listDirectories(stacksDir);
}
