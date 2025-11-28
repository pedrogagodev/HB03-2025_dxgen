import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "langchain";
import * as z from "zod";

import { formatContext, invokeLLM } from "../llm/client";
import type { DetectedStack } from "../types";
import { COMMON_LANGUAGES } from "../utils/languages";
import { extractContent } from "../utils/utils";

/**
 * Detects the technology stack from the provided documents
 */
async function detectStack(documents: Document[]): Promise<DetectedStack> {
  if (documents.length === 0) {
    return { language: "other" };
  }

  const context = formatContext(documents, {
    maxEntries: 20,
    maxCharsPerEntry: 2_000,
  });

  const prompt = [
    new SystemMessage(
      [
        "You are a code analysis expert. Analyze the provided codebase context to detect:",
        `1. Primary programming language (common languages include: ${COMMON_LANGUAGES.join(", ")}, or others)`,
        "2. Framework/library (if evident from package.json, imports, or file structure)",
        "3. Key architectural notes (monorepo, build tool, etc.)",
        "",
        "Respond ONLY with a valid JSON object in this exact format:",
        '{"language": "ts" | "js" | "py" | "go" | etc..., "framework": the frameworks/libraries used, "notes": "string or undefined"}',
        "",
        "Be specific: if you see TypeScript files, use 'ts'. If you see React/Vue/Next.js, mention it in framework.",
        "If it's a monorepo, mention all the packages and their dependencies in notes.",
      ].join(" "),
    ),
    new HumanMessage(
      [
        "Analyze the following codebase context and detect the stack:",
        "",
        context,
      ].join("\n"),
    ),
  ];

  try {
    const response = await invokeLLM({
      prompt,
      maxContextTokens: 5_000,
    });

    const content = extractContent(response);

    // Extract JSON from response (might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as DetectedStack;
      return parsed;
    }

    // Fallback if JSON parsing fails
    return {
      language: "other",
      notes: "Could not parse stack detection response",
    };
  } catch (error) {
    console.warn("Stack detection failed:", (error as Error).message);
    return { language: "other", notes: "Stack detection error" };
  }
}

/**
 * Creates a tool for detecting the technology stack
 */
export function createStackDetectorTool(documents: Document[]) {
  return tool(
    async () => {
      const stack = await detectStack(documents);
      return JSON.stringify(stack);
    },
    {
      name: "detect_stack",
      description:
        "Analyzes the codebase to detect the technology stack including programming language, framework, and architectural patterns. Use this tool to understand the project's technical foundation before generating documentation.",
      schema: z.object({}),
    },
  );
}

/**
 * Standalone function to detect stack (used outside of tool context)
 */
export { detectStack };
