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

const calculateBatchSize = (records: PineconeRecord[]): number => {
  try {
    const payload = {
      vectors: records.map((r) => ({
        id: r.id,
        values: r.values || [],
        metadata: r.metadata,
      })),
    };
    return Buffer.byteLength(JSON.stringify(payload), "utf8");
  } catch {
    return records.reduce((size, record) => {
      const idSize = Buffer.byteLength(record.id, "utf8");
      const valuesSize = (record.values?.length ?? 0) * 4; // float32 = 4 bytes
      const metadataSize = JSON.stringify(record.metadata || {}).length;
      return size + idSize + valuesSize + metadataSize + 100; // +100 to overhead
    }, 0);
  }
};

const batchRecords = (
  records: PineconeRecord[],
  maxSizeBytes: number = 3_500_000,
): PineconeRecord[][] => {
  if (records.length === 0) return [];

  const batches: PineconeRecord[][] = [];
  let currentBatch: PineconeRecord[] = [];

  for (const record of records) {
    const recordSize = calculateBatchSize([record]);
    if (recordSize > maxSizeBytes) {
      if (currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [];
      }
      console.warn(
        `⚠️  Record ${record.id} excede o limite de tamanho (${recordSize} bytes). Tentando enviar mesmo assim.`,
      );
      batches.push([record]);
      continue;
    }

    const testBatch = [...currentBatch, record];
    const testBatchSize = calculateBatchSize(testBatch);

    if (testBatchSize > maxSizeBytes && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [record];
    } else {
      currentBatch.push(record);
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
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

  const batches = batchRecords(records);
  let totalUpserted = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      await index.upsert(batch);
      totalUpserted += batch.length;
      if (batches.length > 1) {
        console.log(
          `📦 Batch ${i + 1}/${batches.length}: ${batch.length} records enviados (${totalUpserted}/${records.length} total)`,
        );
      }
    } catch (error) {
      const err = error as Error;
      console.error(
        `❌ Erro ao enviar batch ${i + 1}/${batches.length}:`,
        err.message,
      );
      if (
        err.message.includes("message length too large") ||
        err.message.includes("too large")
      ) {
        console.log(
          `🔄 Tentando dividir batch ${i + 1} em lotes menores...`,
        );
        const halfSize = Math.ceil(batch.length / 2);
        const subBatches = [
          batch.slice(0, halfSize),
          batch.slice(halfSize),
        ].filter((b) => b.length > 0);

        for (const subBatch of subBatches) {
          try {
            await index.upsert(subBatch);
            totalUpserted += subBatch.length;
          } catch (subError) {
            console.error(
              `❌ Erro ao enviar sub-batch:`,
              (subError as Error).message,
            );
            throw subError;
          }
        }
      } else {
        throw error;
      }
    }
  }

  return {
    index: options.pinecone.index,
    namespace,
    upsertedCount: totalUpserted,
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
