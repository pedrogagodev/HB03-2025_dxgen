type RagWizardFeature = "readme" | "api-docs" | "diagram" | "summary";

interface RagWizardAnswers {
  feature: RagWizardFeature;
  style: string;
}

interface RagGenerateRequest {
  wizard: RagWizardAnswers;
}

/**
 * Mapeia cada feature para instruções específicas sobre quais tipos de arquivos
 * são mais relevantes para a geração da documentação.
 */
const FEATURE_FILE_PRIORITIES: Record<
  RagWizardFeature,
  {
    priorityFiles: string[];
    priorityPatterns: string[];
    description: string;
  }
> = {
  "api-docs": {
    priorityFiles: [
      "API routes",
      "endpoints",
      "controllers",
      "handlers",
      "route definitions",
      "request/response types",
      "API schemas",
      "middleware",
      "authentication",
      "authorization",
    ],
    priorityPatterns: [
      "routes",
      "api",
      "controllers",
      "handlers",
      "endpoints",
      "middleware",
    ],
    description:
      "API documentation focusing on endpoints, routes, request/response schemas, and API contracts",
  },
  readme: {
    priorityFiles: [
      "main entry points",
      "configuration files",
      "package.json",
      "setup instructions",
      "installation guides",
      "project structure",
      "getting started",
      "main features",
      "architecture overview",
    ],
    priorityPatterns: [
      "README",
      "package.json",
      "config",
      "setup",
      "main",
      "index",
      "entry",
    ],
    description:
      "README documentation covering project overview, setup, installation, and main features",
  },
  diagram: {
    priorityFiles: [
      "architecture files",
      "component structure",
      "data flow",
      "system design",
      "module relationships",
      "dependency graphs",
      "service definitions",
      "database schemas",
    ],
    priorityPatterns: [
      "architecture",
      "components",
      "services",
      "modules",
      "schema",
      "models",
      "types",
    ],
    description:
      "Architecture diagrams showing system structure, component relationships, and data flow",
  },
  summary: {
    priorityFiles: [
      "all project files",
      "source code",
      "documentation",
      "configuration",
      "tests",
      "scripts",
    ],
    priorityPatterns: ["*"],
    description:
      "Comprehensive repository summary covering all aspects of the project",
  },
};

export function buildRagQuery(request: RagGenerateRequest): string {
  const { feature, style } = request.wizard;
  const featureConfig = FEATURE_FILE_PRIORITIES[feature];

  const basePrompt = `Retrieve files relevant for ${featureConfig.description}.`;

  const fileTypesInstruction = `Prioritize files related to: ${featureConfig.priorityFiles.join(", ")}.`;

  const patternsInstruction = `Look for files matching these patterns: ${featureConfig.priorityPatterns.join(", ")}.`;

  let styleInstruction = "";
  if (style && style.trim().length > 0) {
    styleInstruction = `The documentation style should be: "${style}". Consider this when selecting files that match the desired tone and depth.`;
  }

  const exclusionInstruction = `Exclude: test files, build artifacts, node_modules, .git, temporary files, and generated code unless directly relevant to the ${feature} generation.`;

  const completenessInstruction = `Return a comprehensive set of files that together provide enough context to generate accurate ${feature}. Include both high-level overview files and detailed implementation files when relevant.`;

  const queryParts = [
    basePrompt,
    fileTypesInstruction,
    patternsInstruction,
    styleInstruction,
    exclusionInstruction,
    completenessInstruction,
  ].filter(Boolean);

  return queryParts.join(" ");
}
