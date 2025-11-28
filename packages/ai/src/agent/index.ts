import "dotenv/config";
import type { Document } from "@langchain/core/documents";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";

import { createApiDocsGuardrail } from "../guardrails/api-docs.guardrail";
import {
  createApiDocsTool,
  createDiagramsTool,
  createReadmeTool,
  createStackDetectorTool,
  createSummaryTool,
} from "../tools";
import type { DetectedStack, GenerateRequest, GenerateResult } from "../types";

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

interface DocGenerationAgentOptions {
  documents: Document[];
  stack?: DetectedStack;
}

// Creates a centralized documentation generation agent with all specialist tools
export function createDocGenerationAgent(
  options: DocGenerationAgentOptions,
): ReturnType<typeof createAgent> {
  const { documents, stack } = options;

  // Create all specialist tools
  const tools = [
    createStackDetectorTool(documents),
    createReadmeTool(documents, stack),
    createApiDocsTool(documents, stack),
    createDiagramsTool(documents, stack),
    createSummaryTool(documents, stack),
  ];

  // Create middleware with guardrails
  const middleware = [createApiDocsGuardrail(documents)];

  const agent = createAgent({
    model,
    tools,
    middleware,
  });

  return agent;
}

// Executes the documentation generation using the agent with middleware
export async function executeDocAgent(
  request: GenerateRequest,
  options: DocGenerationAgentOptions,
): Promise<GenerateResult> {
  const { wizard, project } = request;

  // Create the agent with all tools and middleware
  const agent = createDocGenerationAgent(options);

  try {
    // Invoke the agent with a human message following the documentation pattern
    const response = await agent.invoke({
      messages: [
        new HumanMessage(
          `Generate ${wizard.feature} documentation for the project. ` +
            `Use rootPath: "${project.rootPath}", outputDir: "${wizard.outputDir}", style: "${wizard.style}".`,
        ),
      ],
    });

    // Extract the last message from the agent response
    const lastMessage = response.messages[response.messages.length - 1];
    const content = lastMessage.content?.toString() || "";

    // Check if middleware blocked the request
    if (content.includes("Cannot generate API documentation")) {
      return {
        kind: wizard.feature as GenerateResult["kind"],
        suggestedPath: "docs/error.md",
        content: `# ❌ Documentation Generation Failed\n\n${content}\n`,
      };
    }

    // Parse the JSON result from the tool
    const result = JSON.parse(content) as GenerateResult;
    return result;
  } catch (error) {
    const errorMessage = (error as Error).message;

    // Generic error fallback
    return {
      kind: wizard.feature as GenerateResult["kind"],
      suggestedPath: "docs/error.md",
      content: `# ❌ Error\n\nFailed to generate ${wizard.feature} documentation: ${errorMessage}\n`,
    };
  }
}
