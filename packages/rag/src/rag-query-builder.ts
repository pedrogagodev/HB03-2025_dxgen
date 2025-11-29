type RagWizardFeature = "readme" | "api-docs" | "diagram" | "summary";

interface RagWizardAnswers {
  feature: RagWizardFeature;
  style: string;
}

interface RagGenerateRequest {
  wizard: RagWizardAnswers;
}

/**
 * Simple, focused RAG query builder.
 * Creates a single, well-crafted query for each documentation type.
 */
const FEATURE_QUERIES: Record<
  RagWizardFeature,
  (style: string) => string
> = {
  readme: (style: string) => {
    const baseQuery = "Retrieve the most important project files for creating a comprehensive README: package.json files, configuration files (tsconfig, turbo.json, .env.example), main entry points (index.ts, main.ts, server.ts), and existing README/documentation.";
    const styleHint = style ? ` Documentation style: "${style}".` : "";
    return `${baseQuery}${styleHint}`;
  },
  
  "api-docs": (style: string) => {
    const baseQuery = "Retrieve API-related files: route definitions, endpoint handlers, controllers, API schemas, request/response types, middleware, and authentication/authorization logic.";
    const styleHint = style ? ` Documentation style: "${style}".` : "";
    return `${baseQuery}${styleHint}`;
  },
  
  diagram: (style: string) => {
    const baseQuery = "Retrieve architecture and system design files: main modules, services, components, data models, database schemas, and key integration points.";
    const styleHint = style ? ` Documentation style: "${style}".` : "";
    return `${baseQuery}${styleHint}`;
  },
  
  summary: (style: string) => {
    const baseQuery = "Retrieve a representative sample of the project: configuration files, main entry points, core business logic, key modules, and documentation.";
    const styleHint = style ? ` Documentation style: "${style}".` : "";
    return `${baseQuery}${styleHint}`;
  },
};

/**
 * Build a single, focused RAG query for the given feature.
 * Simple and performant - one query per documentation type.
 */
export function buildRagQuery(request: RagGenerateRequest): string {
  const { feature, style } = request.wizard;
  return FEATURE_QUERIES[feature](style);
}

