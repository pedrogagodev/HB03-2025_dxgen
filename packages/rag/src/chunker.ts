import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import path from "node:path";

import type { ChunkOptions, FileChunk, ProjectFile } from "./types.js";

// Optimized chunking parameters for better semantic retrieval
const DEFAULT_CHUNK_SIZE = 1500;
const DEFAULT_CHUNK_OVERLAP = 200;

const countLinesUntil = (text: string, index: number) => {
  if (index <= 0) return 1;
  const slice = text.slice(0, index);
  return slice.split(/\r?\n/).length;
};

const inferSemanticMetadata = (relativePath: string) => {
  const lower = relativePath.toLowerCase();
  const ext = path.extname(lower);

  const isReadme =
    lower === "readme.md" ||
    lower.endsWith("/readme.md") ||
    lower.includes("/docs/");
  const isEnvExample = path.basename(lower) === ".env.example";
  const isCiConfig =
    lower.startsWith(".github/workflows/") ||
    lower.startsWith(".gitlab-ci") ||
    lower.endsWith("/docker-compose.yml") ||
    lower.endsWith("/docker-compose.yaml");
  const isPackageJson = lower.endsWith("package.json");

  let fileType: "code" | "config" | "docs" | "test" | "other" = "other";

  if (isReadme || ext === ".md" || ext === ".mdx") {
    fileType = "docs";
  } else if (
    ext === ".json" ||
    ext === ".yml" ||
    ext === ".yaml" ||
    lower.includes("config")
  ) {
    fileType = "config";
  } else if (lower.includes("test") || lower.includes(".spec.")) {
    fileType = "test";
  } else if (
    [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".py",
      ".go",
      ".rb",
      ".php",
    ].includes(ext)
  ) {
    fileType = "code";
  }

  const isConfig =
    fileType === "config" || isPackageJson || isEnvExample || isCiConfig;

  return {
    fileType,
    isConfig,
    isPackageJson,
    isReadme,
    isEnvExample,
    isCiConfig,
  } as const;
};

export async function chunkProjectFiles(
  files: ProjectFile[],
  options: ChunkOptions = {},
): Promise<FileChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options.chunkSize ?? DEFAULT_CHUNK_SIZE,
    chunkOverlap: options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
  });

  const chunks: FileChunk[] = [];

  for (const file of files) {
    const semantic = inferSemanticMetadata(file.relativePath);

    const rawChunks = await splitter.splitText(file.content);
    const chunkCount = rawChunks.length;
    let searchCursor = 0;

    rawChunks.forEach((text, chunkIndex) => {
      const start = file.content.indexOf(text, searchCursor);
      const end = start === -1 ? -1 : start + text.length;
      if (start !== -1) {
        searchCursor = end;
      }

      const startLine = start === -1 ? 1 : countLinesUntil(file.content, start);
      const endLine =
        end === -1 ? startLine : countLinesUntil(file.content, end);

      chunks.push({
        id: `${file.relativePath}:${chunkIndex}`,
        text,
        metadata: {
          source: file.fullPath,
          relativePath: file.relativePath,
          chunkIndex,
          chunkCount,
          startLine,
          endLine,
          ...semantic,
        },
      });
    });
  }

  return chunks;
}
