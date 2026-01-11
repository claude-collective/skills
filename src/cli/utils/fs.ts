import fs from 'fs-extra';
import fg from 'fast-glob';
import path from 'path';

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function readFileOptional(filePath: string, fallback = ''): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return fallback;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

export async function glob(pattern: string, cwd: string): Promise<string[]> {
  return fg(pattern, { cwd, onlyFiles: true });
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function remove(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

export async function copy(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

export { fs };
