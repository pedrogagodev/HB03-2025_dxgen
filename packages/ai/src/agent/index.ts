import type { Document } from "@langchain/core/documents";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";
import { createAgent } from "langchain";

import { getAiEnvConfig } from "../env.js";
import type {
  DetectedStack,
  GenerateRequest,
  GenerateResult,
  ProjectContext,
} from "../types";
import {
  createApiDetectorTool,
  createStackDetectorTool,
  createStructureAnalyzerTool,
} from "./tools/detection.tools";
import {
  createApiDocsGeneratorTool,
  createDiagramsGeneratorTool,
  createReadmeGeneratorTool,
  createSummaryGeneratorTool,
} from "./tools/generation.tools";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required");
}

const envConfig = getAiEnvConfig();
const model = new ChatOpenAI({
  model: envConfig.openaiModel,
  apiKey,
  temperature: envConfig.temperature,
  maxRetries: envConfig.maxRetries,
});

/**
 * Documentation Agent
 *
 * An intelligent agent that:
 * 1. Analyzes the codebase using detection tools
 * 2. Validates documentation requests with guardrails
 * 3. Generates appropriate documentation
 * 4. Suggests alternatives when needed
 */
export async function createDocumentationAgent(
  documents: Document[],
  stack: DetectedStack | undefined,
  projectContext: ProjectContext | undefined,
): Promise<ReturnType<typeof createAgent>> {
  // Create all tools for the agent
  const tools = [
    // Detection tools
    createStackDetectorTool(documents),
    createApiDetectorTool(documents),
    createStructureAnalyzerTool(documents),

    // Generation tools
    createReadmeGeneratorTool(documents, stack, projectContext),
    createApiDocsGeneratorTool(documents, stack, projectContext),
    createDiagramsGeneratorTool(documents, stack, projectContext),
    createSummaryGeneratorTool(documents, stack, projectContext),
  ];

  const agent = createAgent({
    model,
    tools,
  });

  return agent;
}

/**
 * Execute the documentation agent
 *
 * The agent will:
 * 1. Use detection tools to understand the codebase
 * 2. Apply guardrails to validate the request
 * 3. Generate documentation or suggest alternatives
 */
export async function executeDocumentationAgent(
  request: GenerateRequest,
  documents: Document[],
  stack: DetectedStack | undefined,
  projectContext: ProjectContext | undefined,
): Promise<GenerateResult> {
  const { wizard } = request;

  // Create the agent
  const agent = await createDocumentationAgent(
    documents,
    stack,
    projectContext,
  );

  // Build the agent's task
  const agentPrompt = buildAgentPrompt(request);

  try {
    // Invoke the agent
    const response = await agent.invoke({
      messages: [new HumanMessage(agentPrompt)],
    });

    // Extract the result - check for tool calls first
    const messages = response.messages;

    // Look for the last tool message (which contains our JSON result)
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];

      // Check if this is a tool message
      if (msg._getType && msg._getType() === "tool") {
        try {
          const toolContent = msg.content?.toString() || "";
          const result = JSON.parse(toolContent) as GenerateResult;
          return result;
        } catch (parseError) {
          // Continue looking at other messages
          continue;
        }
      }

      // Also check AI messages that might contain JSON
      if (msg._getType && msg._getType() === "ai") {
        const content = msg.content?.toString() || "";

        // Try to extract JSON from the content
        const jsonMatch = content.match(
          /\{[\s\S]*"kind"\s*:\s*"[^"]+"\s*,[\s\S]*"content"\s*:[\s\S]*\}/,
        );
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]) as GenerateResult;
            return result;
          } catch (parseError) {}
        }
      }
    }

    // If we couldn't find a valid result, throw an error
    throw new Error("Could not extract valid result from agent response");
  } catch (error) {
    console.error("\n❌ Agent encountered an error:", (error as Error).message);

    // Fallback result
    return {
      kind: wizard.feature as GenerateResult["kind"],
      suggestedPath: "ERROR.md",
      content: `# Documentation Generation Failed\n\n${(error as Error).message}\n\nPlease try again or request a different documentation type.`,
    };
  }
}

/**
 * Build the agent's task prompt
 * This guides the agent's reasoning and tool use
 */
function buildAgentPrompt(request: GenerateRequest): string {
  const { wizard, project } = request;

  const featureInstructions: Record<typeof wizard.feature, string> = {
    readme: `
      Task: Generate README.md documentation.
      
      Steps:
      1. Optionally use detect_stack to understand the technology
      2. Call generate_readme tool with the parameters
      3. The tool will return a JSON result - output ONLY that JSON
      
      IMPORTANT: Return ONLY the JSON from generate_readme. Do not add explanations.
    `,
    "api-docs": `
      Task: Generate API documentation.
      
      Steps:
      1. MUST use detect_api_endpoints first to check if APIs exist
      2. If no APIs found:
         - Explain that no APIs were detected
         - Suggest README or Summary instead
         - DO NOT call generate_api_docs
      3. If APIs found:
         - Call generate_api_docs with the parameters
         - Return ONLY the JSON from the tool
      
      IMPORTANT: Return ONLY the JSON from the generation tool. No explanations.
    `,
    diagram: `
      Task: Generate architecture diagrams.
      
      Steps:
      1. Optionally use analyze_project_structure
      2. Call generate_diagrams with the parameters
      3. Return ONLY the JSON from the tool
      
      IMPORTANT: Return ONLY the JSON from generate_diagrams. No explanations.
    `,
    summary: `
      Task: Generate project summary.
      
      Steps:
      1. Optionally use detect_stack and analyze_project_structure
      2. Call generate_summary with the parameters
      3. Return ONLY the JSON from the tool
      
      IMPORTANT: Return ONLY the JSON from generate_summary. No explanations.
    `,
  };

  return `
You are a Documentation Agent. Your job is to call the right tools and return their JSON results.

**Task:**
${featureInstructions[wizard.feature]}

**Parameters for generation tools:**
- rootPath: "${project.rootPath}"
- outputDir: "${wizard.outputDir}"
- style: "${wizard.style || "Professional technical documentation"}"

**Available Tools:**
- detect_stack: Understand technology stack
- detect_api_endpoints: Check for API routes (REQUIRED before API docs!)
- analyze_project_structure: Understand complexity
- generate_readme: Create README → Returns JSON
- generate_api_docs: Create API docs → Returns JSON
- generate_diagrams: Create diagrams → Returns JSON
- generate_summary: Create summary → Returns JSON

**Critical Rules:**
1. For API docs: ALWAYS check detect_api_endpoints FIRST
2. When you call a generation tool, it returns JSON
3. Output ONLY that JSON, nothing else
4. Do not add explanations or markdown formatting
5. Just the raw JSON object from the tool

Execute the task now.
  `.trim();
}
