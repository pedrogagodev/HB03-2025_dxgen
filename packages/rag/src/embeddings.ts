import type { Embeddings } from "@langchain/core/embeddings";
import { OpenAIEmbeddings } from "@langchain/openai";

import { getRagEnvConfig } from "./env.js";
import type { EmbeddingConfig } from "./types.js";

export function createEmbeddings(config: EmbeddingConfig = {}): Embeddings {
  const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to generate embeddings");
  }

  const envConfig = getRagEnvConfig();

  return new OpenAIEmbeddings({
    apiKey,
    model: config.model ?? envConfig.embeddingModel,
    dimensions: config.dimensions,
  });
}
