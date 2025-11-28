import type { Document } from "@langchain/core/documents";
import { tool } from "langchain";
import * as z from "zod";

import type { DetectedStack } from "../types";

export function createSummaryTool(
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

      // TODO: Implement actual summary generation with LLM
      return JSON.stringify({
        kind: "summary",
        suggestedPath: "docs/summary.md",
        content: `# Project Summary (stub)\n\nResumo gerado pelo Summary Agent.\n\nEstilo desejado: ${style}\nOutput dir: ${outputDir}${stackInfo}\n`,
      });
    },
    {
      name: "generate_summary",
      description:
        "Generates a concise summary of the project, including its purpose, key features, technologies used, and overall architecture.",
      schema: z.object({
        rootPath: z.string().describe("The root path of the project"),
        outputDir: z.string().describe("The output directory for the summary"),
        style: z.string().describe("The desired documentation style"),
      }),
    },
  );
}
