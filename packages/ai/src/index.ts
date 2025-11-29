import type { Document } from "@langchain/core/documents";

import { executeDocumentationAgent } from "./agent";
import { buildProjectContext } from "./context/project-context";
import { detectStack } from "./tools/stack-detector.tool";
import type {
  DetectedStack,
  GenerateRequest,
  GenerateResult,
  ProjectContext,
} from "./types";

export interface GenerateOptions {
  documents: Document[];
  stack?: DetectedStack;
  projectContext?: ProjectContext;
}

/**
 * AI Agent Documentation Generation
 * 
 * Uses an intelligent agent that:
 * 1. Analyzes the codebase with detection tools
 * 2. Validates requests with guardrails
 * 3. Generates appropriate documentation
 * 4. Suggests alternatives when needed
 * 
 * Pipeline: User Request → Agent Analysis → Tool Use → Documentation
 */
export async function runGenerateCommand(
  request: GenerateRequest,
  options: GenerateOptions,
): Promise<GenerateResult> {
  const { documents, stack: providedStack, projectContext: providedContext } = options;

  console.log("\n🚀 Starting AI Documentation Agent...");
  console.log(`   Documents: ${documents.length}`);

  // Step 1: Auto-detect stack if not provided (for context)
  let stack = providedStack;
  if (!stack && documents.length > 0) {
    console.log("\n📊 Pre-analyzing technology stack...");
    stack = await detectStack(documents);
    console.log(
      `   ✓ Detected: ${stack.language}${stack.framework ? ` + ${stack.framework}` : ""}`,
    );
  }

  // Step 2: Build deterministic project context if not provided
  let projectContext = providedContext;
  if (!projectContext) {
    console.log("\n📂 Building project context...");
    projectContext = await buildProjectContext(request.project.rootPath, {
      stack,
      maxStructureDepth: 5, // Increased from 3 to 5 for better structure accuracy
    });
    console.log(`   ✓ Found ${projectContext.packages.length} package(s)`);
  }

  // Step 3: Execute the AI agent
  // The agent will:
  // - Use detection tools to understand the codebase
  // - Apply guardrails to validate the request
  // - Generate documentation or suggest alternatives
  const result = await executeDocumentationAgent(
    request,
    documents,
    stack,
    projectContext,
  );

  return result;
}

// Export types and utilities
export type * from "./types";
export * from "./writers";
export { buildProjectContext };

