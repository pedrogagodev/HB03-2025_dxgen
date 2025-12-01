import { runRagPipeline, scanProjectFiles, chunkProjectFiles } from "@repo/rag";
import type { Document } from "@langchain/core/documents";
import type { PRContext } from "./pr-context";
import { buildPRFocusedQuery } from "./pr-context";
import {
  callRAGPipeline,
  shouldUseEdgeFunctions,
  type RAGPipelineRequest,
} from "./edge-function-client";

export interface RAGOptions {
  rootDir: string;
  prContext: PRContext;
  userId: string;
}

/**
 * Run RAG pipeline to sync and retrieve relevant documents for a PR
 * Uses Edge Functions if configured, otherwise falls back to direct call
 */
export async function getRagDocumentsForPR(
  options: RAGOptions,
): Promise<Document[]> {
  const { rootDir, prContext, userId } = options;

  // Log RAG configuration
  console.log(`[RAG] Using rootDir: ${rootDir}`);
  console.log(`[RAG] Repository: ${prContext.repoFullName}`);
  console.log(`[RAG] ProjectId: ${prContext.repoFullName}`);
  console.log(`[RAG] UserId: ${userId}`);

  // Build a query focused on the modified files
  const query = buildPRFocusedQuery(prContext);

  let result: { documents: Document[]; syncSummary?: unknown };

  // Use Edge Functions if configured, otherwise use direct call
  if (shouldUseEdgeFunctions()) {
    console.log(`[RAG] Using Edge Functions for RAG pipeline`);
    console.log(
      `[RAG] Doing scan and chunk locally, then sending to Edge Function`,
    );

    // Do scan and chunk locally (doesn't need keys)
    console.log(`[RAG] Scanning files in ${rootDir}...`);
    const scanResult = await scanProjectFiles({
      rootDir,
    });
    console.log(`[RAG] Scanned ${scanResult.files.length} files`);

    console.log(`[RAG] Chunking files...`);
    const chunks = await chunkProjectFiles(scanResult.files);
    console.log(`[RAG] Created ${chunks.length} chunks`);

    // Send chunks to Edge Function for embeddings + Pinecone
    const request: RAGPipelineRequest = {
      chunks,
      query,
      prContext: {
        repoFullName: prContext.repoFullName,
        modifiedFiles: prContext.modifiedFiles,
      },
      projectId: prContext.repoFullName,
      userId,
      syncOptions: {
        enabled: true,
        fullReindex: true, // Always do full reindex on PR open to ensure fresh data
      },
      retrieverOptions: {
        topK: 30, // Get more documents since we're focusing on specific files
      },
    };

    const edgeResult = await callRAGPipeline(request);

    // Convert edge function response to Document format
    result = {
      documents: edgeResult.documents.map((doc) => ({
        pageContent: doc.pageContent,
        metadata: doc.metadata,
      })) as Document[],
      syncSummary: edgeResult.syncSummary,
    };
  } else {
    console.log(
      `[RAG] Using direct RAG pipeline (Edge Functions not configured)`,
    );

    // Fallback to direct call (for local development)
    if (!process.env.PINECONE_API_KEY) {
      throw new Error(
        "Either Edge Functions must be configured (SUPABASE_URL, GITHUB_APP_SERVICE_TOKEN) " +
          "or PINECONE_API_KEY must be set for direct RAG pipeline",
      );
    }

    result = await runRagPipeline({
      rootDir,
      query,
      pinecone: {
        index: "dxgen-docs",
        apiKey: process.env.PINECONE_API_KEY,
      },
      context: {
        userId,
        projectId: prContext.repoFullName,
      },
      sync: {
        enabled: true,
        fullReindex: true, // Always do full reindex on PR open to ensure fresh data
      },
      retrieverOptions: {
        topK: 30, // Get more documents since we're focusing on specific files
      },
    });
  }

  console.log(
    `[RAG] Retrieved ${result.documents.length} documents for project ${prContext.repoFullName}`,
  );

  console.log(
    `[RAG] Retrieved ${result.documents.length} documents for project ${prContext.repoFullName}`,
  );

  // Filter documents to prioritize files modified in the PR
  const modifiedFileSet = new Set(prContext.modifiedFiles);
  const priorityDocs: Document[] = [];
  const otherDocs: Document[] = [];

  for (const doc of result.documents) {
    const relativePath = doc.metadata.relativePath as string | undefined;
    if (relativePath && modifiedFileSet.has(relativePath)) {
      priorityDocs.push(doc);
    } else {
      otherDocs.push(doc);
    }
  }

  console.log(
    `[RAG] Priority documents (modified files): ${priorityDocs.length}`,
  );
  console.log(`[RAG] Other documents: ${otherDocs.length}`);

  // Return priority docs first, then others (up to a reasonable limit)
  return [...priorityDocs, ...otherDocs.slice(0, 20)];
}
