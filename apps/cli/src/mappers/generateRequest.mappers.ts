import type { GenerateRequest } from "@repo/ai";
import type { GenerateAnswers } from "../types/generate.types";

export function mapGenerateAnswersToRequest(
  answers: GenerateAnswers,
): GenerateRequest {

  return {
    wizard: {
      outputDir: answers.outputDir,
      feature: answers.feature,
      sync: answers.sync,
      style: answers.style,
    },
    project: {
      rootPath: process.cwd(),
    },
  };
}
