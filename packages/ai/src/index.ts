import { createApiDocs } from "./specialists/api-docs";
import { createDiagrams } from "./specialists/diagrams";
import { createReadme } from "./specialists/readme";
import { createSummary } from "./specialists/summary";
import type { GenerateRequest, GenerateResult, WizardFeature } from "./types";

async function runAgentForFeature(
  feature: WizardFeature,
  request: GenerateRequest,
): Promise<GenerateResult> {
  switch (feature) {
    case "readme":
      return createReadme({ request });
    case "api-docs":
      return createApiDocs({ request });
    case "diagram":
      return createDiagrams({ request });
    case "summary":
      return createSummary({ request });
  }
}

export async function runGenerateCommand(
  request: GenerateRequest,
): Promise<GenerateResult> {
  const result = await runAgentForFeature(request.wizard.feature, request);

  return result;
}

export type * from "./types";
