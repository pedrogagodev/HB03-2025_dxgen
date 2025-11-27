import type {
  DetectedStack,
  GenerateRequest,
  GenerateResult,
} from "../types";

export async function createSummary(args: {
  request: GenerateRequest;
  stack?: DetectedStack;
}): Promise<GenerateResult> {
  const { request, stack } = args;
  const { wizard } = request;

  const stackInfo = stack
    ? `\n\nStack detectada: linguagem=${stack.language}${
        stack.framework ? `, framework=${stack.framework}` : ""
      }`
    : "";

  return {
    kind: "summary",
    suggestedPath: "docs/repository-summary.md",
    content: `# Resumo do Repositório (stub)\n\nEste é um resumo gerado pelo Summary Agent.\n\nEstilo desejado: ${wizard.style}\nOutput dir: ${wizard.outputDir}${stackInfo}\n`,
  };
}
