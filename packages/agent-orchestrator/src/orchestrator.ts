import { runApiDocsAgent } from "agents-api-docs";
import { runDiagramsAgent } from "agents-diagrams";
import { runReadmeAgent } from "agents-readme";
import type {
  DetectedStack,
  GenerateRequest,
  GenerateResult,
  WizardFeature,
} from "core-runtime";
import { detectStack } from "core-runtime";

function buildStubResult(
  kind: WizardFeature,
  request: GenerateRequest,
  stack?: DetectedStack,
): GenerateResult {
  const base = request.wizard;

  const stackInfo = stack
    ? `\n\nStack detectada: linguagem=${stack.language}${
        stack.framework ? `, framework=${stack.framework}` : ""
      }`
    : "";

  const suggestedPath =
    kind === "readme"
      ? "README.md"
      : kind === "api-docs"
        ? "docs/api.md"
        : kind === "diagram"
          ? "docs/architecture-diagram.md"
          : "docs/repository-summary.md";

  return {
    kind,
    content: `# DXGen (stub)\n\nTipo: ${kind}\n\nEstilo: ${base.style}\n\nOutput dir: ${base.outputDir}${stackInfo}`,
    suggestedPath,
  };
}

async function runAgentForFeature(
  feature: WizardFeature,
  request: GenerateRequest,
  stack?: DetectedStack,
): Promise<GenerateResult> {
  switch (feature) {
    case "readme":
      return runReadmeAgent({ request, stack });
    case "api-docs":
      return runApiDocsAgent({ request, stack });
    case "diagram":
      return runDiagramsAgent({ request, stack });
    case "summary":
    default:
      // Ainda não temos um agents-summary, então mantemos um stub interno.
      return buildStubResult("summary", request, stack);
  }
}

async function safeDetectStack(
  request: GenerateRequest,
): Promise<DetectedStack | undefined> {
  try {
    return await detectStack(request.project);
  } catch {
    // Em caso de erro de IO ou parsing, seguimos sem stack detectada.
    return undefined;
  }
}

export async function runGenerateGraph(
  request: GenerateRequest,
): Promise<GenerateResult[]> {
  const stack = await safeDetectStack(request);

  const uniqueFeatures = Array.from(
    new Set(request.wizard.features),
  ) as WizardFeature[];

  if (uniqueFeatures.length === 0) {
    return [];
  }

  const results = await Promise.all(
    uniqueFeatures.map((feature) =>
      runAgentForFeature(feature, request, stack),
    ),
  );

  return results;
}
