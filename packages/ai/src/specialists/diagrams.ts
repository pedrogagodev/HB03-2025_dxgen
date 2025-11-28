import type { Document } from "@langchain/core/documents";
import type { DetectedStack, GenerateRequest, GenerateResult } from "../types";

export async function createDiagrams(args: {
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
    kind: "diagram",
    suggestedPath: "docs/architecture-diagram.md",
    content: `# Diagramas (stub)\n\nDiagramas de arquitetura gerados pelo Diagrams Agent.\n\nEstilo desejado: ${wizard.style}\nOutput dir: ${wizard.outputDir}${stackInfo}\n`,
  };
}
