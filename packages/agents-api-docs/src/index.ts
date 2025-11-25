import type {
  DetectedStack,
  GenerateRequest,
  GenerateResult,
} from "@dxgen/core-runtime";

export async function runApiDocsAgent(args: {
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
    kind: "api-docs",
    suggestedPath: "docs/api.md",
    content: `# API Docs (stub)\n\nDocumentação de API gerada pelo API Docs Agent.\n\nEstilo desejado: ${wizard.style}\nOutput dir: ${wizard.outputDir}${stackInfo}\n`,
  };
}
