import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import type { ChunkOptions, FileChunk, ProjectFile } from "./types.js";

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 150;

const countLinesUntil = (text: string, index: number) => {
  if (index <= 0) return 1;
  const slice = text.slice(0, index);
  return slice.split(/\r?\n/).length;
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
        },
      });
    });
  }

  return chunks;
}
