import { z } from "zod";

/**
 * Environment variable schema for RAG package configuration.
 * All values have fallbacks to ensure the system works without explicit configuration.
 */
const ragEnvSchema = z.object({
  // Chunking configuration
  RAG_CHUNK_SIZE: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  RAG_CHUNK_OVERLAP: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  // Retrieval configuration
  RAG_TOP_K_DEFAULT: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  RAG_TOP_K_README: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  // Embedding model configuration
  RAG_EMBEDDING_MODEL: z.string().optional(),
});

/**
 * Validated and parsed RAG environment configuration with fallbacks.
 */
export interface RagEnvConfig {
  chunkSize: number;
  chunkOverlap: number;
  topKDefault: number;
  topKReadme: number;
  embeddingModel: string;
}

/**
 * Parse and validate RAG environment variables with fallbacks.
 */
export function getRagEnvConfig(): RagEnvConfig {
  const raw = ragEnvSchema.parse(process.env);

  return {
    chunkSize: raw.RAG_CHUNK_SIZE ?? 1500,
    chunkOverlap: raw.RAG_CHUNK_OVERLAP ?? 200,
    topKDefault: raw.RAG_TOP_K_DEFAULT ?? 25,
    topKReadme: raw.RAG_TOP_K_README ?? 35,
    embeddingModel: raw.RAG_EMBEDDING_MODEL ?? "text-embedding-3-small",
  };
}

