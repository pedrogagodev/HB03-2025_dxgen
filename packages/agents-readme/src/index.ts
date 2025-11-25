import type {
  DetectedStack,
  GenerateRequest,
  GenerateResult,
} from "@dxgen/core-runtime";

export async function runReadmeAgent(args: {
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
    kind: "readme",
    suggestedPath: "README.md",
    content: `# README (stub)\n\nEste é um README gerado pelo README Agent.\n\nEstilo desejado: ${wizard.style}\nOutput dir: ${wizard.outputDir}${stackInfo}\n`,
  };
}
