import type { GenerateRequest } from "@repo/ai";
import type * as Rag from "@repo/rag";
import type { User } from "@supabase/supabase-js";

/**
 * Builds RAG pipeline options from a generate request and user.
 * Centralizes the configuration logic to avoid duplication.
 */
export function buildRagPipelineOptions(
  request: GenerateRequest,
  user: User,
  rootDir: string = process.cwd(),
): Rag.RagPipelineOptions {
  // Optimized retrieval parameters
  // Use more documents for README to get better structure coverage
  const topK = request.wizard.feature === "readme" ? 35 : 25;

  return {
    rootDir,
    query: "", // Will be set by caller using buildRagQuery
    pinecone: {
      index: "dxgen-docs",
      apiKey: process.env.PINECONE_API_KEY,
    },
    context: {
      userId: user.id,
      projectId: request.project.rootPath,
    },
    sync: {
      enabled: request.wizard.sync,
      fullReindex: request.wizard.sync,
    },
    retrieverOptions: {
      topK,
    },
  };
}
