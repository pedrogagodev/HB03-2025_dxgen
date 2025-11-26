import type { Embeddings } from "@langchain/core/embeddings";
import { OpenAIEmbeddings } from "@langchain/openai";

import type { EmbeddingConfig } from "./types.js";

const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

export function createEmbeddings(config: EmbeddingConfig = {}): Embeddings {
  const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to generate embeddings");
  }

  return new OpenAIEmbeddings({
    apiKey,
    model: config.model ?? DEFAULT_EMBEDDING_MODEL,
    dimensions: config.dimensions,
  });
}
