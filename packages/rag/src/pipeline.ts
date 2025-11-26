import { chunkProjectFiles } from "./chunker.js";
import { scanProjectFiles } from "./file-scanner.js";
import { buildIndex, resetPineconeNamespace } from "./pinecone-sync.js";
import { createRetriever } from "./retriever.js";
import type {
  RagPipelineOptions,
  RagPipelineResult,
  ScanOptions,
  SyncOptions,
  SyncSummary,
} from "./types.js";

const buildScanOptions = (
  rootDir: string,
  overrides: RagPipelineOptions["scanOptions"],
): ScanOptions => ({
  rootDir,
  includeExtensions: overrides?.includeExtensions,
  excludeGlobs: overrides?.excludeGlobs,
  maxFileSizeBytes: overrides?.maxFileSizeBytes,
});

export const runRagPipeline = async (
  options: RagPipelineOptions,
): Promise<RagPipelineResult> => {
  const { rootDir, query } = options;
  if (!rootDir) {
    throw new Error("rootDir is required to run the RAG pipeline");
  }

  let syncSummary: SyncSummary | undefined;

  if (options.sync?.enabled) {
    const scanResult = await scanProjectFiles(
      buildScanOptions(rootDir, options.scanOptions),
    );
    const chunks = await chunkProjectFiles(
      scanResult.files,
      options.chunkOptions,
    );

    const syncOptions: SyncOptions = {
      pinecone: options.pinecone,
      embeddings: options.embeddings,
      context: options.context,
      chunkOptions: options.chunkOptions,
    };

    if (options.sync.fullReindex) {
      await resetPineconeNamespace(syncOptions);
    }

    syncSummary = await buildIndex(chunks, syncOptions);
  }

  const retriever = createRetriever({
    pinecone: options.pinecone,
    context: options.context,
    embeddings: options.embeddings,
    ...options.retrieverOptions,
  });

  const documents = await retriever._getRelevantDocuments(query);

  return { documents, syncSummary };
};
