import { detectStack } from "./llm/stack-detector";
import { createApiDocs } from "./specialists/api-docs";
import { createDiagrams } from "./specialists/diagrams";
import { createReadme } from "./specialists/readme";
import { createSummary } from "./specialists/summary";
import type {
  AgentOptions,
  GenerateRequest,
  GenerateResult,
  WizardFeature,
} from "./types";

async function runAgentForFeature(
  feature: WizardFeature,
  request: GenerateRequest,
  options: AgentOptions = {},
): Promise<GenerateResult> {
  switch (feature) {
    case "readme":
      return createReadme({ request, ...options });
    case "api-docs":
      return createApiDocs({ request, ...options });
    case "diagram":
      return createDiagrams({ request, ...options });
    case "summary":
      return createSummary({ request, ...options });
  }
}

export async function runGenerateCommand(
  request: GenerateRequest,
  options: AgentOptions = {},
): Promise<GenerateResult> {
  // Auto-detect stack if documents are provided and stack is not already set
  let finalStack = options.stack;
  if (!finalStack && options.documents && options.documents.length > 0) {
    console.log("\n🔍 Detecting project stack...");
    finalStack = await detectStack(options.documents);
    console.log(
      `   Detected: ${finalStack.language}${finalStack.framework ? ` + ${finalStack.framework}` : ""}${finalStack.notes ? ` (${finalStack.notes})` : ""}\n`,
    );
  }

  const result = await runAgentForFeature(request.wizard.feature, request, {
    ...options,
    stack: finalStack,
  });

  return result;
}

export type * from "./types";
