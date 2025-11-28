import type { Document } from "@langchain/core/documents";
import { tool } from "langchain";
import * as z from "zod";

import type { DetectedStack } from "../types";

export function createApiDocsTool(
  _documents: Document[],
  stack?: DetectedStack,
) {
  return tool(
    async ({ rootPath: _rootPath, outputDir, style }) => {
      const stackInfo = stack
        ? `\n\nStack detectada: linguagem=${stack.language}${
            stack.framework ? `, framework=${stack.framework}` : ""
          }`
        : "";

      // TODO: Implement actual API docs generation with LLM
      return JSON.stringify({
        kind: "api-docs",
        suggestedPath: "docs/api.md",
        content: `# API Docs (stub)\n\nDocumentação de API gerada pelo API Docs Agent.\n\nEstilo desejado: ${style}\nOutput dir: ${outputDir}${stackInfo}\n`,
      });
    },
    {
      name: "generate_api_docs",
      description:
        "Generates comprehensive API documentation for REST or GraphQL endpoints. Use this tool ONLY when the project is confirmed to be an API or backend service with exposed endpoints.",
      schema: z.object({
        rootPath: z.string().describe("The root path of the project"),
        outputDir: z.string().describe("The output directory for the API docs"),
        style: z.string().describe("The desired documentation style"),
      }),
    },
  );
}
