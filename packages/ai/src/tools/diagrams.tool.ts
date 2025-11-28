import type { Document } from "@langchain/core/documents";
import { tool } from "langchain";
import * as z from "zod";

import type { DetectedStack } from "../types";

export function createDiagramsTool(
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

      // TODO: Implement actual diagram generation with LLM
      return JSON.stringify({
        kind: "diagram",
        suggestedPath: "docs/architecture.md",
        content: `# Architecture Diagrams (stub)\n\nDiagramas gerados pelo Diagram Agent.\n\nEstilo desejado: ${style}\nOutput dir: ${outputDir}${stackInfo}\n`,
      });
    },
    {
      name: "generate_diagrams",
      description:
        "Generates architecture diagrams (Mermaid, PlantUML, or other formats) to visualize the project structure, data flow, or system architecture.",
      schema: z.object({
        rootPath: z.string().describe("The root path of the project"),
        outputDir: z.string().describe("The output directory for the diagrams"),
        style: z.string().describe("The desired documentation style"),
      }),
    },
  );
}
