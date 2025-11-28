import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { DetectedStack } from "../types";
import { formatContext, invokeLLM } from "./client";
import { COMMON_LANGUAGES } from "./languages";
import { stackCache } from "./stack-cache";
import { extractContent } from "./utils";

export async function detectStack(
  documents: Document[],
): Promise<DetectedStack> {
  if (documents.length === 0) {
    return { language: "other" };
  }

  const cached = stackCache.get(documents);
  if (cached) {
    return cached;
  }

  stackCache.clearExpired();

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
        "If it's a monorepo (workspaces in package.json), mention the it in notes.",
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
      // Cache the result
      stackCache.set(documents, parsed);
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
