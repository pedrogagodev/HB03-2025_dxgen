import { runApiDocsAgent } from "agents-api-docs";
import { runDiagramsAgent } from "agents-diagrams";
import { runReadmeAgent } from "agents-readme";
import { runSummaryAgent } from "agents-summary";
import type {
  GenerateRequest,
  GenerateResult,
  WizardFeature,
} from "core-runtime";

async function runAgentForFeature(
  feature: WizardFeature,
  request: GenerateRequest,
): Promise<GenerateResult> {
  switch (feature) {
    case "readme":
      return runReadmeAgent({ request });
    case "api-docs":
      return runApiDocsAgent({ request });
    case "diagram":
      return runDiagramsAgent({ request });
    case "summary":
      return runSummaryAgent({ request });
  }
}

export async function runGenerateGraph(
  request: GenerateRequest,
): Promise<GenerateResult[]> {
  const uniqueFeatures = Array.from(
    new Set(request.wizard.features),
  ) as WizardFeature[];

  if (uniqueFeatures.length === 0) {
    return [];
  }

  const results = await Promise.all(
    uniqueFeatures.map((feature) => runAgentForFeature(feature, request)),
  );

  return results;
}
