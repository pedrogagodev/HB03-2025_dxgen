import type { Document } from "@langchain/core/documents";
import type { DetectedStack, GenerateRequest, GenerateResult } from "../types";

export async function createSummary(args: {
  request: GenerateRequest;
  stack?: DetectedStack;
  documents?: Document[];
}): Promise<GenerateResult> {
  const { request, stack, documents: _documents } = args;
  void _documents;
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
