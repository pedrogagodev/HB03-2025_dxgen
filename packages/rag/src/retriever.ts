import { Document } from "@langchain/core/documents";
import { BaseRetriever } from "@langchain/core/retrievers";

import { getRagEnvConfig } from "./env.js";
import { createEmbeddings } from "./embeddings.js";
import { getIndexForContext } from "./pinecone-utils.js";
import type { RetrieverOptions } from "./types.js";

interface RuntimeRetrieverOptions extends RetrieverOptions {
  topK: number;
  scoreThreshold?: number;
}

class PineconeVectorRetriever extends BaseRetriever {
  get lc_namespace() {
    return ["dxgen", "rag", "pinecone_retriever"];
  }
  private readonly topK: number;
  private readonly scoreThreshold?: number;
  private readonly filter?: Record<string, unknown>;
  private readonly fallback?: BaseRetriever;
  private readonly excludeRelativePathPrefixes?: string[];
  private readonly embeddings;
  private readonly index;

  constructor(config: RuntimeRetrieverOptions) {
    super();
    this.topK = config.topK;
    this.scoreThreshold = config.scoreThreshold;
    this.filter = config.filter;
    this.fallback = config.hybridFallback;
    this.excludeRelativePathPrefixes = config.excludeRelativePathPrefixes;
    this.embeddings = createEmbeddings(config.embeddings);
    this.index = getIndexForContext(config.pinecone, config.context).index;
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    const queryVector = await this.embeddings.embedQuery(query);

    const response = await this.index.query({
      vector: queryVector,
      topK: this.topK,
      includeMetadata: true,
      filter: this.filter,
    });

    const docs = (response.matches ?? [])
      .filter((match) => {
        if (this.scoreThreshold === undefined) return true;
        if (typeof match.score !== "number") return true;
        return match.score >= this.scoreThreshold;
      })
      .map((match) => {
        const metadata = (match.metadata ?? {}) as Record<string, unknown>;
        const text = typeof metadata.text === "string" ? metadata.text : "";
        const { text: _text, ...rest } = metadata;
        return new Document({
          pageContent: text,
          metadata: {
            ...rest,
            score: match.score,
            vectorId: match.id,
          },
        });
      })
      .filter((doc) => doc.pageContent.length > 0)
      .filter((doc) => {
        if (!this.excludeRelativePathPrefixes?.length) return true;
        const relPath = (doc.metadata as { relativePath?: string } | undefined)
          ?.relativePath;
        if (typeof relPath !== "string") return true;
        return !this.excludeRelativePathPrefixes.some((prefix) =>
          relPath.startsWith(prefix),
        );
      });

    if (docs.length === 0 && this.fallback) {
      return this.fallback.invoke(query);
    }

    return docs;
  }
}

export const createRetriever = (options: RetrieverOptions): BaseRetriever => {
  if (!options.pinecone?.index) {
    throw new Error("pinecone.index is required to create a retriever");
  }

  const envConfig = getRagEnvConfig();
  return new PineconeVectorRetriever({
    ...options,
    topK: options.topK ?? envConfig.topKDefault,
  });
};
