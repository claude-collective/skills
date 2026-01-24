import path from "path";
import pc from "picocolors";
import { listDirectories, glob } from "../utils/fs";
import { getUserStacksDir } from "../consts";
import { getActiveStack } from "./config";

/**
 * Information about a stack
 */
export interface StackInfo {
  name: string;
  skillCount: number;
  isActive: boolean;
}

/**
 * Get information about all stacks
 */
export async function getStacksInfo(): Promise<StackInfo[]> {
  const stacksDir = getUserStacksDir();
  const stackNames = await listDirectories(stacksDir);
  const activeStack = await getActiveStack();

  const stacks: StackInfo[] = [];

  for (const name of stackNames) {
    const skillsDir = path.join(stacksDir, name, "skills");
    // Count SKILL.md files to get actual skill count (skills are nested in categories)
    const skillFiles = await glob("**/SKILL.md", skillsDir);

    stacks.push({
      name,
      skillCount: skillFiles.length,
      isActive: name === activeStack,
    });
  }

  return stacks;
}

/**
 * Format a stack for display (used in both list and switch)
 */
export function formatStackDisplay(stack: StackInfo): string {
  const marker = stack.isActive ? pc.green("*") : " ";
  const name = stack.isActive ? pc.green(pc.bold(stack.name)) : stack.name;
  const count = pc.dim(
    `(${stack.skillCount} skill${stack.skillCount === 1 ? "" : "s"})`,
  );

  return `${marker} ${name} ${count}`;
}

/**
 * Format a stack for select options (label and hint)
 */
export function formatStackOption(stack: StackInfo): {
  value: string;
  label: string;
  hint?: string;
} {
  const label = stack.isActive
    ? `${pc.green("*")} ${pc.green(pc.bold(stack.name))}`
    : `  ${stack.name}`;

  return {
    value: stack.name,
    label,
    hint: `${stack.skillCount} skill${stack.skillCount === 1 ? "" : "s"}${stack.isActive ? " (active)" : ""}`,
  };
}
