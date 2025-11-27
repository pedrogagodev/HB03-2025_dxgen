import type { Document } from "@langchain/core/documents";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import type { FormatContextOptions, InvokeOptions, TokenUsage } from "../types";
import "dotenv/config";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY is required. Define it in .env before generating docs.",
  );
}

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey,
  temperature: 0.7,
  maxRetries: 3,
});

export function formatContext(
  documents: Document[],
  options: FormatContextOptions = {},
): string {
  const maxEntries = options.maxEntries ?? 8;
  const maxCharsPerEntry = options.maxCharsPerEntry ?? 1_200;

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

const logTokenUsage = (usage: TokenUsage) => {
  const { promptTokens, completionTokens, totalTokens } = usage;
  console.log("\n📊 Token Usage:");
  console.log(`  Input tokens:  ${promptTokens.toLocaleString()}`);
  console.log(`  Output tokens: ${completionTokens.toLocaleString()}`);
  console.log(`  Total tokens:  ${totalTokens.toLocaleString()}`);
};

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

  // Extract token usage from response metadata
  const usage = response.response_metadata?.usage;
  if (usage && typeof usage === "object") {
    const tokenUsage: TokenUsage = {
      promptTokens: (usage as { prompt_tokens?: number }).prompt_tokens ?? 0,
      completionTokens:
        (usage as { completion_tokens?: number }).completion_tokens ?? 0,
      totalTokens: (usage as { total_tokens?: number }).total_tokens ?? 0,
    };
    logTokenUsage(tokenUsage);
  }

  return response;
}
