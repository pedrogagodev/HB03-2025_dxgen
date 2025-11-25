import type { DocStyle, FinalDocKind, WizardFeature } from "core-runtime";

export async function classifyIntentWithLLM(
  features: WizardFeature[],
  style: DocStyle,
): Promise<FinalDocKind> {
  // Implementação heurística simples baseada nas features e no estilo.
  const lowerStyle = style.toLowerCase();
  const normalizedFeatures = features.map((f) => f.toLowerCase());

  if (
    normalizedFeatures.includes("api-docs") ||
    lowerStyle.includes("api") ||
    lowerStyle.includes("endpoint")
  ) {
    return "api-docs";
  }
  if (
    normalizedFeatures.includes("diagram") ||
    lowerStyle.includes("diagram") ||
    lowerStyle.includes("arquitetura")
  ) {
    return "diagram";
  }
  if (
    normalizedFeatures.includes("summary") ||
    lowerStyle.includes("resumo") ||
    lowerStyle.includes("overview")
  ) {
    return "summary";
  }
  if (
    normalizedFeatures.includes("readme") ||
    lowerStyle.includes("readme") ||
    lowerStyle.includes("onboarding")
  ) {
    return "readme";
  }

  // Fallback seguro padrão.
  return "readme";
}
