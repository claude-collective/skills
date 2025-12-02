#!/usr/bin/env node
/**
 * Simple Markdown Preprocessor
 *
 * Processes .src.md files and resolves @include(path) directives
 * Usage: node compile.mjs [source-file]
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENTS_DIR = path.join(__dirname, "..", ".claude", "agents");
const SOURCES_DIR = path.join(__dirname, "agents");
const SKILLS_DIR = path.join(__dirname, "..", ".claude", "skills");
const SKILLS_SOURCE_DIR = path.join(__dirname, "skills");

/**
 * Recursively resolves @include() directives in content
 * @param {string} content - The content to process
 * @param {string} basePath - Base path for resolving relative includes
 * @param {Set<string>} visited - Track visited files to prevent circular includes
 * @returns {Promise<string>} - Processed content with includes resolved
 */
async function resolveIncludes(content, basePath, visited = new Set()) {
  // Negative lookbehind to skip @include inside backticks (inline code)
  const includeRegex = /(?<!`)@include\(([^)]+)\)/g;
  let result = content;

  // Find all @include directives with their positions
  const matches = [...content.matchAll(includeRegex)];

  // Process in REVERSE order to preserve indices during replacement
  for (const match of matches.reverse()) {
    const relativePath = match[1].trim();
    const absolutePath = path.resolve(basePath, relativePath);

    // Check for circular includes
    if (visited.has(absolutePath)) {
      console.warn(`⚠️  Warning: Circular include detected: ${relativePath}`);
      continue;
    }

    try {
      // Read the included file
      const includeContent = await fs.readFile(absolutePath, "utf-8");

      // Recursively resolve includes in the included content
      visited.add(absolutePath);
      const resolvedContent = await resolveIncludes(
        includeContent,
        path.dirname(absolutePath),
        visited,
      );

      // Replace at EXACT match position (not first occurrence)
      result =
        result.substring(0, match.index) +
        resolvedContent +
        result.substring(match.index + match[0].length);
    } catch (error) {
      console.error(`❌ Error including ${relativePath}:`, error.message);
      // Leave the directive in place if file not found
    }
  }

  return result;
}

/**
 * Compile a single source file
 * @param {string} sourceFile - Path to .src.md file
 * @returns {Promise<string>} - Path to output file
 */
async function compile(sourceFile) {
  const sourcePath = path.resolve(sourceFile);
  const fileName = path.basename(sourceFile).replace(".src.md", ".md");
  const outputPath = path.join(AGENTS_DIR, fileName);

  console.log(`📄 Compiling ${path.basename(sourceFile)}...`);

  try {
    // Read source file
    const sourceContent = await fs.readFile(sourcePath, "utf-8");

    // Resolve all @include directives
    const compiledContent = await resolveIncludes(sourceContent, path.dirname(sourcePath));

    // Ensure output directory exists
    await fs.mkdir(AGENTS_DIR, { recursive: true });

    // Write compiled file
    await fs.writeFile(outputPath, compiledContent, "utf-8");

    console.log(`✅ Created ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Error compiling ${sourceFile}:`, error.message);
    throw error;
  }
}

/**
 * Compile a single skill
 * @param {string} category - Category name (e.g., 'frontend', 'backend')
 * @param {string} skillFile - Path to skill .md file
 * @returns {Promise<string>} - Path to output file
 */
async function compileSkill(category, skillFile) {
  const skillName = path.basename(skillFile, ".md");
  const outputDirName = `${category}-${skillName}`;
  const outputDir = path.join(SKILLS_DIR, outputDirName);
  const outputPath = path.join(outputDir, "SKILL.md");

  console.log(`📄 Compiling skill: ${outputDirName}...`);

  try {
    // Read source file
    const sourceContent = await fs.readFile(skillFile, "utf-8");

    // Resolve all @include directives
    const compiledContent = await resolveIncludes(sourceContent, path.dirname(skillFile));

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Write compiled file
    await fs.writeFile(outputPath, compiledContent, "utf-8");

    console.log(`✅ Created ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Error compiling skill ${outputDirName}:`, error.message);
    throw error;
  }
}

/**
 * Compile all source files
 */
async function compileAll() {
  try {
    const files = await fs.readdir(SOURCES_DIR);
    const sourceFiles = files
      .filter((f) => f.endsWith(".src.md"))
      .map((f) => path.join(SOURCES_DIR, f));

    if (sourceFiles.length === 0) {
      console.log("No .src.md files found in sources directory");
      return;
    }

    console.log(`\n🚀 Compiling ${sourceFiles.length} source files...\n`);

    for (const sourceFile of sourceFiles) {
      await compile(sourceFile);
    }

    console.log(`\n✨ All agents compiled successfully!\n`);
  } catch (error) {
    console.error("Error during compilation:", error);
    process.exit(1);
  }
}

/**
 * Compile all skills
 */
async function compileAllSkills() {
  try {
    const categoryDirs = await fs.readdir(SKILLS_SOURCE_DIR);
    const skillsToCompile = [];

    // Iterate over category directories (frontend, backend, security, setup)
    for (const category of categoryDirs) {
      const categoryPath = path.join(SKILLS_SOURCE_DIR, category);
      const stat = await fs.stat(categoryPath);

      if (stat.isDirectory()) {
        // Get all .md files in this category
        const files = await fs.readdir(categoryPath);
        const mdFiles = files.filter((f) => f.endsWith(".md"));

        for (const mdFile of mdFiles) {
          const skillFile = path.join(categoryPath, mdFile);
          skillsToCompile.push({ category, skillFile });
        }
      }
    }

    if (skillsToCompile.length === 0) {
      console.log("No skills found to compile");
      return;
    }

    console.log(`\n🚀 Compiling ${skillsToCompile.length} skills...\n`);

    for (const { category, skillFile } of skillsToCompile) {
      await compileSkill(category, skillFile);
    }

    console.log(`\n✨ All skills compiled successfully!\n`);
  } catch (error) {
    console.error("Error during skills compilation:", error);
    process.exit(1);
  }
}

/**
 * Compile everything (agents and skills)
 */
async function compileEverything() {
  await compileAll();
  await compileAllSkills();
}

// Run compilation
const args = process.argv.slice(2);

if (args.length > 0) {
  // Compile specific file
  compile(args[0]).catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  // Compile everything (agents and skills)
  compileEverything();
}
