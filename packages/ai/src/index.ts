import { executeDocAgent } from "./agent";
import { detectStack } from "./tools/stack-detector.tool";
import type { AgentOptions, GenerateRequest, GenerateResult } from "./types";

export async function runGenerateCommand(
  request: GenerateRequest,
  options: AgentOptions = {},
): Promise<GenerateResult> {
  // Ensure documents are provided
  if (!options.documents || options.documents.length === 0) {
    throw new Error(
      "No documents provided for analysis. Please provide codebase documents.",
    );
  }

  // Auto-detect stack if not already set
  let finalStack = options.stack;
  if (!finalStack) {
    console.log("\n🔍 Detecting project stack...");
    finalStack = await detectStack(options.documents);
    console.log(
      `   Detected: ${finalStack.language}${finalStack.framework ? ` + ${finalStack.framework}` : ""}${finalStack.notes ? ` (${finalStack.notes})` : ""}\n`,
    );
  }

  // Execute the centralized documentation agent
  console.log(
    `\n🤖 Starting documentation generation agent for: ${request.wizard.feature}\n`,
  );

  const result = await executeDocAgent(request, {
    documents: options.documents,
    stack: finalStack,
  });

  return result;
}

export type * from "./types";
export * from "./writers";
