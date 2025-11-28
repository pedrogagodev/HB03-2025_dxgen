import type { Document } from "@langchain/core/documents";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createMiddleware } from "langchain";

import { formatContext, invokeLLM } from "../llm/client";
import { extractContent } from "../utils/utils";

/**
 * Analyzes the codebase to determine if it contains API endpoints
 */
async function hasApiEndpoints(documents: Document[]): Promise<boolean> {
  if (documents.length === 0) {
    return false;
  }

  const context = formatContext(documents, {
    maxEntries: 15,
    maxCharsPerEntry: 1_500,
  });

  const prompt = [
    new SystemMessage(
      [
        "You are a code analysis expert specialized in detecting API endpoints.",
        "Analyze the provided codebase context to determine if this project exposes API endpoints.",
        "",
        "Look for indicators such as:",
        "- HTTP route definitions (Express, Fastify, Hono, etc.)",
        "- REST API controllers or handlers",
        "- GraphQL schemas and resolvers",
        "- API decorators (@Get, @Post, @Controller, etc.)",
        "- OpenAPI/Swagger specifications",
        "- API gateway configurations",
        "",
        'Respond with ONLY a JSON object: {"hasApi": true} or {"hasApi": false}',
        "Be strict: only return true if there are clear API endpoint definitions.",
      ].join(" "),
    ),
    new HumanMessage(
      [
        "Analyze this codebase and determine if it contains API endpoints:",
        "",
        context,
      ].join("\n"),
    ),
  ];

  try {
    const response = await invokeLLM({
      prompt,
      maxContextTokens: 3_000,
    });

    const content = extractContent(response);
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { hasApi: boolean };
      return parsed.hasApi;
    }

    return false;
  } catch (error) {
    console.warn("API detection failed:", (error as Error).message);
    return false;
  }
}

/**
 * Guardrail middleware that prevents API documentation generation
 * for projects that don't contain API endpoints.
 * Uses beforeAgent hook to block execution before processing.
 */
export function createApiDocsGuardrail(documents: Document[]) {
  return createMiddleware({
    name: "ApiDocsGuardrail",
    beforeAgent: async (state) => {
      // Verificar se há mensagens no estado
      if (!state.messages || state.messages.length === 0) {
        return;
      }

      // Pegar a última mensagem do usuário
      const lastMessage = state.messages[state.messages.length - 1];
      const content = lastMessage.content?.toString().toLowerCase() || "";

      // Verificar se o usuário está solicitando documentação de API
      if (content.includes("api-docs") || content.includes("api docs")) {
        console.log(
          "\n🛡️  API Docs Guardrail: Checking if project has API endpoints...",
        );

        const hasApi = await hasApiEndpoints(documents);

        if (!hasApi) {
          console.log(
            "   ❌ No API endpoints detected. Blocking API docs generation.",
          );

          // Bloquear a execução e retornar mensagem de erro
          return {
            messages: [
              new AIMessage(
                "Cannot generate API documentation: This project does not appear to contain API endpoints. " +
                  "Consider using 'readme' or 'summary' documentation instead.",
              ),
            ],
            jumpTo: "end" as const,
          };
        }

        console.log(
          "   ✅ API endpoints detected. Proceeding with API docs generation.",
        );
      }

      return;
    },
  });
}
