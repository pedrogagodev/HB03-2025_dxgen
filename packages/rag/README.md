# @dxgen/rag

RAG toolkit used by the DXGen CLI to scan a repository, chunk the relevant files,
store embeddings in Pinecone (per user + project), and retrieve context for
LangChain / LangGraph chains.

## Features

- File system scanner with configurable extensions & ignore globs.
- Chunking via LangChain `RecursiveCharacterTextSplitter` with source metadata
  (path, chunk index, line ranges).
- Pinecone sync helpers for both incremental updates and full namespace resets.
- Pinecone-backed LangChain retriever with optional fallback for hybrid flows.
- High-level `runRagPipeline` helper that can `sync` (scan→chunk→index) or run
  read-only retrieval depending on CLI flags.

## Environment variables

| Variable | Purpose |
| - | - |
| `OPENAI_API_KEY` | Required for embeddings via `@langchain/openai`. |
| `PINECONE_API_KEY` | Required for Pinecone data plane access. |
| `PINECONE_CONTROLLER_HOST` | Optional. Override when using multiple Pinecone projects. |

## Usage

```ts
import {
  runRagPipeline,
  scanProjectFiles,
  chunkProjectFiles,
  buildIndex,
  createRetriever,
} from "@dxgen/rag";

const context = { userId: "user-123", projectId: "repo-abc" };

// 1) Full sync (dxgen sync)
const scan = await scanProjectFiles({ rootDir: process.cwd() });
const chunks = await chunkProjectFiles(scan.files);
await buildIndex(chunks, { pinecone, embeddings, context });

// 2) Retrieval only (dxgen generate)
const retriever = createRetriever({ pinecone, context });
const docs = await retriever.getRelevantDocuments("Explain the API routes");

// 3) All-in-one helper
const { documents, syncSummary } = await runRagPipeline({
  rootDir: process.cwd(),
  query: "Generate README",
  pinecone,
  context,
  sync: { enabled: true, fullReindex: true },
});
```

### CLI workflow reference

- `dxgen sync`: sets `sync.enabled=true` and optionally `fullReindex` when the
  user requests a clean refresh. Chunks are stored in Pinecone namespace
  `dxgen-{userId}-{projectId}`.
- `dxgen generate`: skips ingestion, instantiates the retriever, and streams the
  documents to the LangGraph chain chosen by the agent.

### Pinecone configuration

```ts
const pinecone = {
  index: "dxgen-docs",
  apiKey: process.env.PINECONE_API_KEY,
  controllerHostUrl: process.env.PINECONE_CONTROLLER_HOST,
};
```

Namespaces default to `dxgen-{userId}-{projectId}` but can be overridden via
`pinecone.namespace`.

## Testing

```
npm run test --workspace=@dxgen/rag
```

Vitest covers chunk metadata extraction plus the retriever’s Pinecone + fallback
behaviour. Add integration tests alongside the CLI once the end-to-end flow is
wired.
