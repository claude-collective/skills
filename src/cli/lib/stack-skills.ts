import path from "path";
import { glob, readFile } from "../utils/fs";
import type { MergedSkillsMatrix } from "../types-matrix";

/**
 * Get skill IDs from a stack's skills directory by reading SKILL.md files
 * and matching them to skills in the matrix.
 *
 * Uses the skill name from the SKILL.md frontmatter to find the matching
 * skill ID in the matrix.
 */
export async function getStackSkillIds(
  stackSkillsDir: string,
  matrix: MergedSkillsMatrix,
): Promise<string[]> {
  // Find all SKILL.md files
  const skillFiles = await glob("**/SKILL.md", stackSkillsDir);
  const skillIds: string[] = [];

  // Build a lookup map from skill names to IDs
  const nameToId = new Map<string, string>();
  for (const [id, skill] of Object.entries(matrix.skills)) {
    nameToId.set(skill.name.toLowerCase(), id);
    // Also map by alias if present
    if (skill.alias) {
      nameToId.set(skill.alias.toLowerCase(), id);
    }
  }

  // Build a lookup map from directory patterns to IDs
  // Skill directories are named like: category/skill-name/SKILL.md
  // We can try to match by the directory name
  const dirToId = new Map<string, string>();
  for (const [id, skill] of Object.entries(matrix.skills)) {
    // Create various possible directory name patterns
    const baseName = skill.name.toLowerCase().replace(/\s+/g, "-");
    dirToId.set(baseName, id);

    // Also try the skill's ID parts (e.g., "frontend-state-zustand" -> "zustand")
    const idParts = id.split("/");
    const lastPart = idParts[idParts.length - 1];
    if (lastPart) {
      dirToId.set(lastPart.toLowerCase(), id);
    }
  }

  for (const skillFile of skillFiles) {
    const fullPath = path.join(stackSkillsDir, skillFile);
    const content = await readFile(fullPath);

    // Try to extract skill name from frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const nameMatch = frontmatter.match(/^name:\s*["']?(.+?)["']?\s*$/m);
      if (nameMatch) {
        const skillName = nameMatch[1].trim();
        const skillId = nameToId.get(skillName.toLowerCase());
        if (skillId) {
          skillIds.push(skillId);
          continue;
        }
      }
    }

    // Fallback: try to match by directory name
    const dirPath = path.dirname(skillFile);
    const dirName = path.basename(dirPath);
    const skillId = dirToId.get(dirName.toLowerCase());
    if (skillId) {
      skillIds.push(skillId);
    }
  }

  return skillIds;
}
