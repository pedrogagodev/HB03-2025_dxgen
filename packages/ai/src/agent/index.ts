import "dotenv/config";
import type { Document } from "@langchain/core/documents";
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

/**
 * Creates a centralized documentation generation agent with all specialist tools
 */
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

/**
 * Executes the documentation generation by calling the appropriate tool directly
 */
export async function executeDocAgent(
  request: GenerateRequest,
  options: DocGenerationAgentOptions,
): Promise<GenerateResult> {
  const { documents, stack } = options;
  const { wizard, project } = request;

  // Create the appropriate tool based on the feature
  const toolMap = {
    readme: createReadmeTool(documents, stack),
    "api-docs": createApiDocsTool(documents, stack),
    diagram: createDiagramsTool(documents, stack),
    summary: createSummaryTool(documents, stack),
  };

  const tool = toolMap[wizard.feature];
  if (!tool) {
    throw new Error(`Unknown feature: ${wizard.feature}`);
  }

  try {
    // Call the tool directly with the required parameters
    const resultJson = await tool.invoke({
      rootPath: project.rootPath,
      outputDir: wizard.outputDir,
      style: wizard.style,
    });

    // Parse the result
    const result = JSON.parse(resultJson) as GenerateResult;
    return result;
  } catch (error) {
    const errorMessage = (error as Error).message;

    // If it's a guardrail error, return a user-friendly result
    if (errorMessage.includes("Cannot generate API documentation")) {
      return {
        kind: wizard.feature as GenerateResult["kind"],
        suggestedPath: "docs/error.md",
        content: `# ❌ Documentation Generation Failed\n\n${errorMessage}\n`,
      };
    }

    // Generic error fallback
    return {
      kind: wizard.feature as GenerateResult["kind"],
      suggestedPath: "docs/error.md",
      content: `# ❌ Error\n\nFailed to generate ${wizard.feature} documentation: ${errorMessage}\n`,
    };
  }
}
