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
3. NEVER use placeholders like "[endpoint]", "TODO", etc.
4. Document actual routes, methods, and schemas found in the code

## DOCUMENTATION STRUCTURE

### 1. API Overview
- Base URL
- Authentication method
- API version

### 2. Authentication
- How to authenticate
- Token format and usage
- Example requests

### 3. Endpoints
For each endpoint:
- **Method and Path**: \`GET /api/users\`
- **Description**: What the endpoint does
- **Authentication**: Required/Optional
- **Request Parameters**: Query params, path params, body schema
- **Response Schema**: Success response structure
- **Error Responses**: Possible error codes and messages
- **Example Request**:
\`\`\`bash
curl -X GET "https://api.example.com/users?limit=10" \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`
- **Example Response**:
\`\`\`json
{
  "users": [{"id": 1, "name": "John"}],
  "total": 100
}
\`\`\`

### 4. Error Codes
Common HTTP status codes and their meanings in your API.

### 5. Rate Limiting
Rate limit policies if applicable.

## EXTRACTION GUIDELINES

From the codebase:
- Extract route definitions (e.g., \`/api/users\`, \`/api/posts/:id\`)
- Identify HTTP methods (GET, POST, PUT, DELETE, etc.)
- Find request/response types, schemas, validators
- Locate authentication middleware
- Document any API versioning

Now generate comprehensive API documentation based on the provided context.`;

/**
 * Generate API documentation.
 * Focused on endpoints, schemas, and integration details.
 */
export async function generateApiDocs(params: {
  rootPath: string;
  outputDir: string;
  style: string;
  documents: Document[];
  stack?: DetectedStack;
  projectContext?: ProjectContext;
}): Promise<GenerateResult> {
  const { rootPath, outputDir, style, documents, stack } = params;

  console.log("\n📡 Generating API documentation...");
  console.log(`  Documents: ${documents.length}`);

  // Filter for API-relevant documents
  const apiDocs = documents.filter((doc) => {
    const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
    const path =
      (typeof metadata.relativePath === "string" && metadata.relativePath) ||
      "";
    const lower = path.toLowerCase();

    // Prioritize API-related files
    return (
      lower.includes("api") ||
      lower.includes("route") ||
      lower.includes("controller") ||
      lower.includes("handler") ||
      lower.includes("endpoint") ||
      lower.includes("schema")
    );
  });

  console.log(`  API-relevant: ${apiDocs.length}`);

  const contextPrompt = [
    `## PROJECT CONTEXT`,
    `- **Root Path**: ${rootPath}`,
    `- **Output Directory**: ${outputDir}`,
    `- **Style**: ${style || "Technical API documentation"}`,
    stack ? `- **Stack**: ${stack.language}${stack.framework ? ` + ${stack.framework}` : ""}` : "",
    "",
    "## API-RELATED CODE",
    "",
    formatContext(apiDocs.slice(0, 25), {
      maxEntries: 25,
      maxCharsPerEntry: 2000,
    }),
  ].filter(Boolean).join("\n");

  const prompt = [
    new SystemMessage(API_DOCS_SYSTEM_PROMPT),
    new SystemMessage(contextPrompt),
    new HumanMessage(
      "Generate comprehensive API documentation for this project based on the provided codebase context.",
    ),
  ];

  try {
    const response = await invokeLLM({
      prompt,
      maxContextTokens: 40_000,
    });

    const content = extractContent(response);

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

    return {
      kind: "api-docs",
      suggestedPath: "API.md",
      content: `# API Documentation Generation Failed\n\nFailed to generate API docs: ${errorMsg}\n`,
    };
  }
}

