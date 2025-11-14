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

const AGENTS_DIR = path.join(__dirname, "agents");
const SOURCES_DIR = path.join(__dirname, "agent-partials", "sources");

/**
 * Recursively resolves @include() directives in content
 * @param {string} content - The content to process
 * @param {string} basePath - Base path for resolving relative includes
 * @param {Set<string>} visited - Track visited files to prevent circular includes
 * @returns {Promise<string>} - Processed content with includes resolved
 */
async function resolveIncludes(content, basePath, visited = new Set()) {
  const includeRegex = /@include\(([^)]+)\)/g;
  let result = content;
  let hasIncludes = false;

  // Find all @include directives
  const matches = [...content.matchAll(includeRegex)];

  for (const match of matches) {
    hasIncludes = true;
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

      // Replace the @include directive with the resolved content
      result = result.replace(match[0], resolvedContent);
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

    console.log(`\n✨ All files compiled successfully!\n`);
  } catch (error) {
    console.error("Error during compilation:", error);
    process.exit(1);
  }
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
  // Compile all files
  compileAll();
}
