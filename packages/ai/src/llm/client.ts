import type { Document } from "@langchain/core/documents";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";
import { getAiEnvConfig } from "../env.js";
import type { FormatContextOptions, InvokeOptions } from "../types";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY is required. Define it in .env before generating docs.",
  );
}

const envConfig = getAiEnvConfig();
const model = new ChatOpenAI({
  model: envConfig.openaiModel,
  apiKey,
  temperature: envConfig.temperature,
  maxRetries: envConfig.maxRetries,
});

export function formatContext(
  documents: Document[],
  options: FormatContextOptions = {},
): string {
  const envConfig = getAiEnvConfig();
  const maxEntries = options.maxEntries ?? envConfig.maxEntriesDefault;
  const maxCharsPerEntry =
    options.maxCharsPerEntry ?? envConfig.maxCharsPerEntryDefault;

  return documents
    .slice(0, maxEntries)
    .map((doc, index) => {
      const identifier =
        (typeof doc.metadata?.path === "string" && doc.metadata.path) ||
        (typeof doc.metadata?.source === "string" && doc.metadata.source) ||
        `Snippet ${index + 1}`;

      const score =
        typeof doc.metadata?.score === "number"
          ? ` (score: ${doc.metadata.score.toFixed(2)})`
          : "";

      const trimmedContent =
        doc.pageContent.length > maxCharsPerEntry
          ? `${doc.pageContent.slice(0, maxCharsPerEntry)}…`
          : doc.pageContent;

      return [
        `### ${identifier}${score}`,
        "```",
        trimmedContent.trim(),
        "```",
      ].join("\n");
    })
    .join("\n\n");
}

export async function invokeLLM({
  prompt,
  context,
  maxContextTokens,
}: InvokeOptions) {
  const finalContext =
    context && maxContextTokens ? context.slice(0, maxContextTokens) : context;

  const finalMessages = finalContext
    ? [...prompt, new HumanMessage(`Context:\n${finalContext}`)]
    : prompt;

  const response = await model.invoke(finalMessages);

  return response;
}
