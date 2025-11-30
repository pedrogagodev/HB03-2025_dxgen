import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { formatContext, invokeLLM } from "../llm/client";
import type { DetectedStack, GenerateResult, ProjectContext } from "../types";
import { extractContent } from "../utils/utils";

const API_DOCS_SYSTEM_PROMPT = `You are an expert API documentation engineer specializing in creating clear, comprehensive API documentation.

## YOUR MISSION

Generate **production-ready API documentation** that:
- Documents all API endpoints with clear descriptions
- Provides request/response schemas with examples
- Explains authentication and authorization requirements
- Includes error handling and status codes
- Follows OpenAPI/REST/GraphQL best practices

## OUTPUT FORMAT RULES

1. Output PURE MARKDOWN only (no code fences around your response)
2. Use ONLY real data from the provided codebase
3. NEVER use placeholders like "[endpoint]", "TODO", "example.com", etc.
4. Document actual routes, methods, and schemas found in the code
5. If you cannot find real endpoints, return "NO_API_FOUND" as the response

## DOCUMENTATION STRUCTURE

### 1. API Overview
- Base URL (extract from config, env, or code)
- Authentication method (analyze middleware/decorators)
- API version (from routes or package.json)

### 2. Authentication
- How to authenticate (from actual middleware)
- Token format and usage (from actual code)
- Example requests (using real endpoint paths)

### 3. Endpoints
For each endpoint found in the code:
- **Method and Path**: \`GET /api/users\`
- **Description**: What the endpoint does (from code/comments)
- **Authentication**: Required/Optional (from middleware)
- **Request Parameters**: Query params, path params, body schema (from actual types/validation)
- **Response Schema**: Success response structure (from actual types)
- **Error Responses**: Possible error codes and messages (from actual error handling)
- **Example Request**: Using real endpoint paths
- **Example Response**: Based on actual return types

### 4. Error Codes
Extract from actual error handling code.

### 5. Rate Limiting
Document if rate limiting middleware is found.

## EXTRACTION GUIDELINES

From the codebase:
- Extract route definitions (e.g., \`/api/users\`, \`/api/posts/:id\`)
- Identify HTTP methods (GET, POST, PUT, DELETE, etc.)
- Find request/response types, schemas, validators (TypeScript interfaces, Zod schemas, etc.)
- Locate authentication middleware (JWT, OAuth, API keys)
- Document any API versioning (/v1/, /v2/)

## CRITICAL GUARDRAIL

If you cannot find at least 2 real API endpoints with actual paths, methods, and handlers in the provided code, return ONLY the text:
NO_API_FOUND

Do not make up examples. Do not use generic placeholders.

Now generate comprehensive API documentation based on the provided codebase context.`;

/**
 * Detects if the project actually has API endpoints by analyzing code content
 */
function detectApiEndpoints(documents: Document[]): {
  hasApi: boolean;
  endpointCount: number;
  apiFiles: Document[];
  reason: string;
} {
  const apiFiles: Document[] = [];
  const endpointPatterns = [
    // Express/Node.js
    /\.(get|post|put|delete|patch)\s*\(\s*['"`]\/[^'"`]+['"`]/gi,
    /router\.(get|post|put|delete|patch)\s*\(\s*['"`]\/[^'"`]+['"`]/gi,
    // Next.js API routes
    /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/gi,
    // FastAPI/Python
    /@(app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]\/[^'"]+['"]/gi,
    // NestJS
    /@(Get|Post|Put|Delete|Patch)\s*\(\s*['"`][^'"`]*['"`]?\s*\)/gi,
    // Go HTTP handlers
    /http\.HandleFunc\s*\(\s*['"`]\/[^'"`]+['"`]/gi,
  ];

  let totalEndpointMatches = 0;

  for (const doc of documents) {
    const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
    const path =
      (typeof metadata.relativePath === "string" && metadata.relativePath) ||
      "";
    const lower = path.toLowerCase();
    const content = doc.pageContent;

    // Check if file is API-related
    const isApiFile =
      lower.includes("/api/") ||
      lower.includes("/routes/") ||
      lower.includes("/controllers/") ||
      lower.includes("/handlers/") ||
      lower.includes("route.ts") ||
      lower.includes("route.js") ||
      lower.endsWith("_controller.py") ||
      lower.endsWith("_handler.go");

    if (!isApiFile) continue;

    // Check for actual endpoint definitions
    let fileEndpointCount = 0;
    for (const pattern of endpointPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        fileEndpointCount += matches.length;
      }
    }

    if (fileEndpointCount > 0) {
      apiFiles.push(doc);
      totalEndpointMatches += fileEndpointCount;
    }
  }

  const hasApi = apiFiles.length >= 1 && totalEndpointMatches >= 2;

  return {
    hasApi,
    endpointCount: totalEndpointMatches,
    apiFiles,
    reason: hasApi
      ? `Found ${totalEndpointMatches} endpoints in ${apiFiles.length} files`
      : `No API endpoints detected. Found ${apiFiles.length} API-related files but no endpoint definitions.`,
  };
}

/**
 * Generate API documentation.
 * Focused on endpoints, schemas, and integration details.
 * 
 * STRONG GUARDRAILS:
 * - Only generates docs if real API endpoints are detected
 * - Fails fast if no APIs exist
 * - Never generates placeholder/example data
 */
export async function generateApiDocs(params: {
  rootPath: string;
  outputDir: string;
  style: string;
  documents: Document[];
  stack?: DetectedStack;
  projectContext?: ProjectContext;
}): Promise<GenerateResult> {
  const { rootPath, style, documents, stack, projectContext } = params;

  // GUARDRAIL 1: Detect actual API endpoints
  const detection = detectApiEndpoints(documents);

  if (!detection.hasApi) {
    throw new Error("No API endpoints detected in the project. Cannot generate API documentation without actual endpoints.");
  }

  // GUARDRAIL 2: Ensure we have actual API code to analyze
  if (detection.apiFiles.length === 0) {
    throw new Error(`No API-related source files found. ${detection.reason}`);
  }

  // Build rich context including project structure
  const contextParts = [
    `## PROJECT CONTEXT`,
    `- **Root Path**: ${rootPath}`,
    `- **Style**: ${style || "Technical API documentation"}`,
    stack ? `- **Stack**: ${stack.language}${stack.framework ? ` + ${stack.framework}` : ""}` : "",
  ];

  if (projectContext) {
    const mainPackage = projectContext.packages.find((p) => p.path === ".");
    if (mainPackage?.name) {
      contextParts.push(`- **Project Name**: ${mainPackage.name}`);
    }
    if (mainPackage?.description) {
      contextParts.push(`- **Description**: ${mainPackage.description}`);
    }
  }

  contextParts.push(
    "",
    `## DETECTED API ENDPOINTS`,
    `Found ${detection.endpointCount} endpoints in ${detection.apiFiles.length} files.`,
    "",
    "## API SOURCE CODE",
    "",
    formatContext(detection.apiFiles, {
      maxEntries: 30,
      maxCharsPerEntry: 3000,
    }),
  );

  const contextPrompt = contextParts.filter(Boolean).join("\n");

  const prompt = [
    new SystemMessage(API_DOCS_SYSTEM_PROMPT),
    new SystemMessage(contextPrompt),
    new HumanMessage(
      "Generate comprehensive API documentation for this project. Extract ONLY real endpoints, types, and patterns from the provided code. Do not use placeholder data.",
    ),
  ];

  try {
    const response = await invokeLLM({
      prompt,
      maxContextTokens: 50_000,
    });

    const content = extractContent(response);

    // GUARDRAIL 3: Check if LLM returned the "no API" signal
    if (content.trim() === "NO_API_FOUND" || content.includes("example.com")) {
      throw new Error("Unable to extract real API endpoint information from the codebase. The AI could not confidently identify actual API routes.");
    }

    if (content.trim().length === 0) {
      throw new Error("Empty LLM response");
    }

    return {
      kind: "api-docs",
      suggestedPath: "API.md",
      content,
    };
  } catch (error) {
    const errorMsg = (error as Error).message;
    console.error("  ❌ Error:", errorMsg);

    return {
      kind: "api-docs",
      suggestedPath: "API.md",
      content: `# API Documentation Generation Failed

An error occurred while generating API documentation:

\`\`\`
${errorMsg}
\`\`\`

**Detection Result:** ${detection.reason}

Please try again or report this issue if it persists.
`,
    };
  }
}

