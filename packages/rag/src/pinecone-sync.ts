import crypto from "node:crypto";

import type { Embeddings } from "@langchain/core/embeddings";
import type { PineconeRecord } from "@pinecone-database/pinecone";

import { createEmbeddings } from "./embeddings.js";
import { getIndexForContext } from "./pinecone-utils.js";
import type { FileChunk, SyncOptions, SyncSummary } from "./types.js";

const chunkVectorId = (chunk: FileChunk, options: SyncOptions) =>
  crypto
    .createHash("sha256")
    .update(
      [
        options.context.userId,
        options.context.projectId,
        chunk.metadata.relativePath,
        String(chunk.metadata.chunkIndex),
      ].join(":"),
    )
    .digest("hex");

const buildMetadata = (chunk: FileChunk, options: SyncOptions) => {
  const metadata: Record<string, string | number | boolean> = {
    userId: options.context.userId,
    projectId: options.context.projectId,
    text: chunk.text,
    relativePath: chunk.metadata.relativePath,
    chunkIndex: chunk.metadata.chunkIndex,
    chunkCount: chunk.metadata.chunkCount,
    startLine: chunk.metadata.startLine,
    endLine: chunk.metadata.endLine,
  };

  if (options.context.branch) metadata.branch = options.context.branch;
  if (options.context.commitSha) metadata.commitSha = options.context.commitSha;

  if (options.context.extraMetadata) {
    Object.entries(options.context.extraMetadata).forEach(([key, value]) => {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        metadata[key] = value;
      }
    });
  }

  return metadata;
};

const embedChunks = async (
  chunks: FileChunk[],
  embeddings: Embeddings,
): Promise<number[][]> => {
  if (chunks.length === 0) return [];
  return embeddings.embedDocuments(chunks.map((chunk) => chunk.text));
};

export async function buildIndex(
  chunks: FileChunk[],
  options: SyncOptions,
): Promise<SyncSummary> {
  const embeddings = createEmbeddings(options.embeddings);
  const values = await embedChunks(chunks, embeddings);

  const { index, namespace } = getIndexForContext(
    options.pinecone,
    options.context,
  );

  const records: PineconeRecord[] = values.map((vector, idx) => ({
    id: chunkVectorId(chunks[idx], options),
    values: vector,
    metadata: buildMetadata(chunks[idx], options),
  }));

  if (records.length === 0) {
    return { index: options.pinecone.index, namespace, upsertedCount: 0 };
  }

  await index.upsert(records);

  return {
    index: options.pinecone.index,
    namespace,
    upsertedCount: records.length,
  };
}

export async function syncChunksToPinecone(
  chunks: FileChunk[],
  options: SyncOptions,
): Promise<SyncSummary> {
  return buildIndex(chunks, options);
}

export async function resetPineconeNamespace(options: SyncOptions) {
  const { index } = getIndexForContext(options.pinecone, options.context);
  try {
    await index.deleteAll();
  } catch (error) {
    const err = error as Error & { status?: number };
    const isNotFound =
      err?.name === "PineconeNotFoundError" || err?.status === 404;

    if (isNotFound) {
      return;
    }

    throw error;
  }
}
