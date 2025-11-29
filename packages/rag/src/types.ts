export type PathLike = string;

export interface ScanOptions {
  /** Absolute path to the repo or project root */
  rootDir: string;
  /** File extensions to include (e.g., .ts, .js). Defaults to code/doc list. */
  includeExtensions?: string[];
  /** Glob patterns to ignore relative to rootDir. */
  excludeGlobs?: string[];
  /** Maximum file size in bytes (defaults to 1 MB). */
  maxFileSizeBytes?: number;
}

export interface ProjectFile {
  /** Absolute path */
  fullPath: string;
  /** Relative path from rootDir */
  relativePath: string;
  size: number;
  content: string;
}

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface FileChunkMetadata {
  source: string;
  relativePath: string;
  chunkIndex: number;
  chunkCount: number;
  startLine: number;
  endLine: number;
  /**
   * Optional semantic flags to improve retrieval and downstream context assembly.
   * These are derived from file path and content heuristics during chunking.
   */
  fileType?: "code" | "config" | "docs" | "test" | "other";
  isConfig?: boolean;
  isPackageJson?: boolean;
  isReadme?: boolean;
  isEnvExample?: boolean;
  isCiConfig?: boolean;
}

export interface FileChunk {
  id: string;
  text: string;
  metadata: FileChunkMetadata;
}

export interface ScanResult {
  files: ProjectFile[];
}

export interface ChunkResult {
  chunks: FileChunk[];
}

export interface SyncSummary {
  index: string;
  namespace: string;
  upsertedCount: number;
}

export interface EmbeddingConfig {
  model?: string;
  apiKey?: string;
  dimensions?: number;
}

export interface PineconeConfig {
  apiKey?: string;
  index: string;
  namespace?: string;
  controllerHostUrl?: string;
  indexHostUrl?: string;
}

export interface SyncContext {
  userId: string;
  projectId: string;
  branch?: string;
  commitSha?: string;
  extraMetadata?: Record<string, string>;
}

export interface SyncOptions {
  pinecone: PineconeConfig;
  embeddings?: EmbeddingConfig;
  context: SyncContext;
  chunkOptions?: ChunkOptions;
}

export interface RetrieverOptions {
  pinecone: PineconeConfig;
  context: SyncContext;
  embeddings?: EmbeddingConfig;
  topK?: number;
  scoreThreshold?: number;
  filter?: Record<string, unknown>;
  hybridFallback?: import("@langchain/core/retrievers").BaseRetriever;
  /**
   * Optional list of path prefixes (using forward slashes) for relativePath metadata
   * that should be excluded from retrieval results. This is applied as a
   * post-filter on returned Documents, so it also works with existing indexes.
   */
  excludeRelativePathPrefixes?: string[];
}

export interface RagPipelineOptions {
  rootDir: string;
  query: string;
  pinecone: PineconeConfig;
  context: SyncContext;
  embeddings?: EmbeddingConfig;
  scanOptions?: Omit<ScanOptions, "rootDir">;
  chunkOptions?: ChunkOptions;
  retrieverOptions?: Omit<
    RetrieverOptions,
    "pinecone" | "context" | "embeddings"
  > & {
    /**
     * Optional list of path prefixes (using forward slashes) for relativePath metadata
     * that should be excluded from retrieval results.
     */
    excludeRelativePathPrefixes?: string[];
  };
  sync?: {
    enabled?: boolean;
    fullReindex?: boolean;
  };
}

export interface RagPipelineResult {
  documents: import("@langchain/core/documents").Document[];
  syncSummary?: SyncSummary;
}
