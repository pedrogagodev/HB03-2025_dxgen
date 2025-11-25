import type { GenerateRequest, WizardFeature } from "@dxgen/core-runtime";
import type { GenerateAnswers } from "../types/generate.types";

const WIZARD_FEATURES: WizardFeature[] = [
  "readme",
  "api-docs",
  "diagram",
  "summary",
];

function isWizardFeature(value: string): value is WizardFeature {
  return (WIZARD_FEATURES as string[]).includes(value);
}

export function mapGenerateAnswersToRequest(
  answers: GenerateAnswers,
): GenerateRequest {
  const features = answers.features.filter(isWizardFeature);

  return {
    wizard: {
      outputDir: answers.outputDir,
      features,
      style: answers.style,
    },
    project: {
      rootPath: process.cwd(),
    },
  };
}
