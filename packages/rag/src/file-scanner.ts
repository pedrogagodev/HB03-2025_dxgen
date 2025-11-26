import { globby } from "globby";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_EXCLUDES,
  DEFAULT_INCLUDE_EXTENSIONS,
  DEFAULT_MAX_FILE_SIZE,
} from "./constants.js";
import type { ProjectFile, ScanOptions, ScanResult } from "./types.js";

const normalizeExtension = (ext: string) =>
  ext.startsWith(".") ? ext.slice(1) : ext;

export async function scanProjectFiles(
  options: ScanOptions,
): Promise<ScanResult> {
  const {
    rootDir,
    includeExtensions = DEFAULT_INCLUDE_EXTENSIONS,
    excludeGlobs = [],
    maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE,
  } = options;

  const extensionPattern = Array.from(new Set(includeExtensions))
    .map(normalizeExtension)
    .filter(Boolean)
    .join(",");

  const searchPatterns = extensionPattern
    ? [`**/*.{${extensionPattern}}`]
    : ["**/*"];

  const ignore = [...DEFAULT_EXCLUDES, ...excludeGlobs];

  const candidatePaths = await globby(searchPatterns, {
    cwd: rootDir,
    absolute: false,
    gitignore: true,
    ignore,
  });

  const files: ProjectFile[] = [];

  for (const relativePath of candidatePaths) {
    const fullPath = path.join(rootDir, relativePath);
    const fileStats = await stat(fullPath);
    if (!fileStats.isFile()) continue;
    if (fileStats.size > maxFileSizeBytes) continue;

    const content = await readFile(fullPath, "utf8");

    files.push({
      fullPath,
      relativePath,
      size: fileStats.size,
      content,
    });
  }

  return { files };
}
