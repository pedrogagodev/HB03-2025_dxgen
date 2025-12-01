/**
 * Client for calling Supabase Edge Functions
 *
 * This client handles communication with Edge Functions that process
 * RAG pipeline and document generation, keeping API keys secure on the server.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const GITHUB_APP_SERVICE_TOKEN = process.env.GITHUB_APP_SERVICE_TOKEN;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !GITHUB_APP_SERVICE_TOKEN) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and GITHUB_APP_SERVICE_TOKEN must be set",
  );
}

export interface RAGPipelineRequest {
  chunks: Array<{
    id: string;
    text: string;
    metadata: {
      source: string;
      relativePath: string;
      chunkIndex: number;
      chunkCount: number;
      startLine: number;
      endLine: number;
      fileType?: "code" | "config" | "docs" | "test" | "other";
      isConfig?: boolean;
      isPackageJson?: boolean;
      isReadme?: boolean;
      isEnvExample?: boolean;
      isCiConfig?: boolean;
    };
  }>;
  query: string;
  prContext: {
    repoFullName: string;
    modifiedFiles: string[];
  };
  projectId: string;
  userId: string;
  syncOptions: {
    enabled: boolean;
    fullReindex: boolean;
  };
  retrieverOptions?: {
    topK?: number;
  };
}

export interface RAGPipelineResponse {
  documents: Array<{
    pageContent: string;
    metadata: {
      relativePath?: string;
      [key: string]: unknown;
    };
  }>;
  syncSummary?: {
    upsertedCount?: number;
    [key: string]: unknown;
  };
}

export interface GenerateSummaryRequest {
  rootPath: string;
  outputDir: string;
  style: string;
  documents: Array<{
    pageContent: string;
    metadata: Record<string, unknown>;
  }>;
  projectContext?: {
    rootPath: string;
    packages?: Array<{ name?: string; path?: string }>;
    structure?: unknown;
    [key: string]: unknown;
  };
}

export interface GenerateSummaryResponse {
  kind: "readme" | "api-docs" | "diagram" | "summary";
  content: string;
  suggestedPath: string;
}

/**
 * Call Edge Function to process RAG pipeline
 */
export async function callRAGPipeline(
  request: RAGPipelineRequest,
): Promise<RAGPipelineResponse> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/github-app-process`;

  console.log(`[EdgeFunction] Calling RAG pipeline: ${functionUrl}`);
  console.log(`[EdgeFunction] Repository: ${request.prContext.repoFullName}`);
  console.log(`[EdgeFunction] Chunks: ${request.chunks.length}`);
  console.log(`[EdgeFunction] Query: ${request.query.substring(0, 100)}...`);

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_APP_SERVICE_TOKEN}`,
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY || "",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorText;
    } catch {
      errorMessage =
        errorText || `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(
      `RAG pipeline failed: ${errorMessage} (status: ${response.status})`,
    );
  }

  const data = (await response.json()) as {
    success: boolean;
    result?: RAGPipelineResponse;
    error?: string;
  };

  if (!data.success) {
    throw new Error(
      data.error || "RAG pipeline returned unsuccessful response",
    );
  }

  if (!data.result) {
    throw new Error("RAG pipeline returned no result");
  }

  console.log(
    `[EdgeFunction] RAG pipeline completed: ${data.result?.documents?.length || 0} documents`,
  );

  return data.result;
}

/**
 * Call Edge Function to generate summary
 */
export async function callGenerateSummary(
  request: GenerateSummaryRequest,
): Promise<GenerateSummaryResponse> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/github-app-generate`;

  console.log(`[EdgeFunction] Calling generate summary: ${functionUrl}`);
  console.log(`[EdgeFunction] Root path: ${request.rootPath}`);
  console.log(`[EdgeFunction] Documents: ${request.documents.length}`);

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_APP_SERVICE_TOKEN}`,
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY || "",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorText;
    } catch {
      errorMessage =
        errorText || `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(
      `Generate summary failed: ${errorMessage} (status: ${response.status})`,
    );
  }

  const data = (await response.json()) as {
    success: boolean;
    result?: GenerateSummaryResponse;
    error?: string;
  };

  if (!data.success) {
    throw new Error(
      data.error || "Generate summary returned unsuccessful response",
    );
  }

  if (!data.result) {
    throw new Error("Generate summary returned no result");
  }

  console.log(`[EdgeFunction] Summary generated successfully`);

  return data.result;
}

/**
 * Check if Edge Functions should be used
 * Returns true if SUPABASE_URL and GITHUB_APP_SERVICE_TOKEN are set
 */
export function shouldUseEdgeFunctions(): boolean {
  return !!(SUPABASE_URL && GITHUB_APP_SERVICE_TOKEN);
}
