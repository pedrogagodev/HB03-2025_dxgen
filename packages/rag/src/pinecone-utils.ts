import { Pinecone } from "@pinecone-database/pinecone";

import type { PineconeConfig, SyncContext } from "./types.js";

const DEFAULT_NAMESPACE_PREFIX = "dxgen";

export const buildNamespace = (
  pinecone: PineconeConfig,
  context: SyncContext,
) => {
  if (pinecone.namespace) return pinecone.namespace;
  const slug = `${context.userId}-${context.projectId}`
    .replace(/[^a-z0-9-_]/gi, "-")
    .toLowerCase();
  return `${DEFAULT_NAMESPACE_PREFIX}-${slug}`;
};

export const ensurePineconeClient = (pinecone: PineconeConfig) => {
  const apiKey = pinecone.apiKey ?? process.env.PINECONE_API_KEY;
  if (!apiKey) {
    throw new Error("PINECONE_API_KEY is required to interact with Pinecone");
  }

  return new Pinecone({
    apiKey,
    controllerHostUrl:
      pinecone.controllerHostUrl ?? process.env.PINECONE_CONTROLLER_HOST,
  });
};

export const getIndexForContext = (
  pinecone: PineconeConfig,
  context: SyncContext,
) => {
  const client = ensurePineconeClient(pinecone);
  const namespace = buildNamespace(pinecone, context);
  const baseIndex = client.index(pinecone.index, pinecone.indexHostUrl);
  const index =
    namespace && namespace.length > 0
      ? baseIndex.namespace(namespace)
      : baseIndex;
  return { client, namespace, index };
};
