import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { formatContext, invokeLLM } from "../llm/client";
import type {
  DetectedStack,
  GenerateResult,
  ProjectContext,
  ProjectPackage,
  ProjectStructureNode,
} from "../types";
import { extractContent } from "../utils/utils";

const DIAGRAM_SYSTEM_PROMPT = `You are an expert software architect specializing in writing clear, concise architecture documentation with Mermaid diagrams.

## YOUR MISSION

Produce an **architecture document** (not just raw diagrams) that:
- Explains the system at a high level.
- Shows the **entire execution flow** from entry points through core components to external services and back.
- Uses a **small number of complementary diagrams** instead of many redundant ones.

## OUTPUT FORMAT RULES

1. Output **pure Markdown** (headings, paragraphs, lists, and \`mermaid\` code fences).
2. Use Mermaid diagrams with **VALID node IDs**.
3. **Use ONLY real elements** from the project context:
   - Real apps, packages, modules, and file paths.
   - External services that can be inferred from dependencies.
4. **Avoid redundancy**:
   - Do **not** create multiple diagrams that show essentially the same structure.
   - Text should explain **purpose, responsibilities, and decisions**, not restate every edge in the diagrams.

## MERMAID SYNTAX REQUIREMENTS

**CRITICAL**: Mermaid node IDs must be valid identifiers (alphanumeric, no special characters like @ or / or - at the start).

✅ **CORRECT Mermaid Syntax**:
\`\`\`mermaid
graph TB
    CLI[apps/cli]
    Frontend[apps/frontend]
    RepoAI["@repo/ai"]
    
    CLI --> RepoAI
\`\`\`

❌ **WRONG Mermaid Syntax**:
\`\`\`mermaid
graph TB
    @repo/ai --> @repo/rag  ❌ Invalid node ID
\`\`\`

## DOCUMENT STRUCTURE

### 1. Introduction & High-Level Overview
- 1–3 short paragraphs summarizing:
  - What this system does.
  - The main apps/packages (from PROJECT CONTEXT).
  - Key external services (from dependencies).
- Mention if this is a monorepo or single package and what the main entry points are.

### 2. System Context & Architecture (Single Main Diagram)
Create **one comprehensive Mermaid diagram** (typically \`graph TB\`) that visualizes the main structural view.

**Requirements:**
- **Entry Points**: Start with the Client/CLI/Frontend/API entry points from PROJECT CONTEXT.
- **Internal Structure**: Show how these entry points connect to internal packages/modules.
- **External Integrations**: Connect to databases, queues, and external APIs **only if they appear in dependencies**.
- **Completeness Check**: Ensure there is a visible path from each entry point to core logic and to any external services it uses.

\`\`\`mermaid
graph TB
    subgraph "Entry Points"
        CLI["apps/cli"]
    end
    
    subgraph "Core Packages"
        RepoAI["@repo/ai"]
    end
    
    subgraph "Infrastructure"
        OpenAI[("OpenAI API")]
    end
    
    CLI --> RepoAI
    RepoAI --> OpenAI
\`\`\`

Add 2–4 sentences under the diagram briefly explaining how these layers relate (without narrating every single arrow).

### 3. Core End-to-End Flow (Behavioral View)
Select the **most important user journey or request flow** and visualize it end-to-end.
For example: "User runs CLI command → Agent resolves project context → LLM client calls provider → Response post-processed → Result returned."

**Requirements:**
- Trace the flow: **Input → Processing → Storage/External Services → Output**.
- Use:
  - A **Sequence Diagram** (\`sequenceDiagram\`) if temporal order and actors are important, **or**
  - A **Flowchart** (\`graph LR\`) if the structural path is more important.
- Write a short paragraph before or after the diagram explaining **what scenario** this flow represents and why it is important.

### 4. Optional Focused Views (Only If Non-Redundant)
Optionally add **up to 2 additional diagrams** only if each adds **new information** that is not obvious from the previous diagrams, such as:
- Internal module structure of a critical package.
- A dedicated view of how one specific external service is integrated.

Rules for optional diagrams:
- Do **not** recreate the same System Context diagram with a slightly different layout.
- Each extra diagram must have a **clear purpose statement** (1–2 sentences) that explains what new perspective it adds.

### 5. Architectural Summary & Coverage Check
- Summarize, in a few bullet points:
  - Main apps and what they are responsible for.
  - Key internal packages and their roles.
  - Important external services and how they are used.
- Add a **Coverage Check** bullet list:
  - Confirm that all major **entry points** from PROJECT CONTEXT appear in at least one diagram.
  - Confirm that main **external services** (from dependencies) appear where relevant.
  - If any major component from the context is intentionally omitted, briefly say why.

## EXTRACTION & VERIFICATION GUIDELINES

1. **Use Entry Points** from PROJECT CONTEXT as the starting nodes of your flows.
2. **Trace imports and dependencies** to see which internal packages/modules each entry point touches.
3. **Identify leaf nodes** where data ultimately goes (external APIs, databases, queues, files).
4. **Connect the chain**: Entry → Intermediaries → Leaf nodes, making sure there are no unexplained gaps.
5. **Self-check**: Before finalizing, mentally verify that:
   - Every important area of the project structure is either mentioned in text or visible in a diagram.
   - Diagrams do not duplicate each other, but instead show different **levels or perspectives** of the same system.
`;

/**
 * Fix invalid Mermaid node IDs that contain special characters
 * Converts: ServiceLayer[@repo/ai] → ServiceLayer["@repo/ai"]
 * Converts: @repo/ai --> X → RepoAi["@repo/ai"] --> X
 */
function fixMermaidSyntax(content: string): string {
  let fixed = content;

  // Fix pattern 1: NodeID[text with @ or /] → NodeID["text"]
  // Match: word characters followed by [ and text containing @ or / without quotes
  fixed = fixed.replace(
    /(\w+)\[([^\]"]*[@/][^\]"]*)\]/g,
    (match, nodeId, text) => {
      // If text already has quotes, leave it
      if (text.trim().startsWith('"') || text.trim().startsWith("'")) {
        return match;
      }
      // Add quotes around the text
      return `${nodeId}["${text}"]`;
    },
  );

  // Fix pattern 2: Direct use of @ or / in node IDs (e.g., @repo/ai -->)
  // This is trickier - we need to replace invalid node IDs with valid ones
  // Pattern: @something/something or path/to/something used as node ID
  fixed = fixed.replace(
    /(@[\w-]+\/[\w-]+|[\w-]+\/[\w-]+\/[\w-]+)\s*(-->|---|-\.->|\[)/g,
    (match, invalidId, arrow) => {
      // Create a valid camelCase ID from the path
      const validId = invalidId
        .replace(/@/g, "")
        .replace(/\//g, "")
        .replace(/-/g, "")
        .split(/[^a-zA-Z0-9]/)
        .filter(Boolean)
        .map((word: string, i: number) =>
          i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
        )
        .join("");

      // Return the valid ID with the original as display name in quotes
      return `${validId}["${invalidId}"] ${arrow}`;
    },
  );

  return fixed;
}

/**
 * Maps package names to recognizable service names
 */
function mapDependencyToService(depName: string): string | null {
  // Database services
  if (depName.includes("supabase")) return "Supabase";
  if (depName === "prisma" || depName === "@prisma/client") return "Prisma";
  if (depName === "mongodb" || depName === "mongoose") return "MongoDB";
  if (depName === "pg" || depName === "postgres") return "PostgreSQL";
  if (depName === "mysql" || depName === "mysql2") return "MySQL";

  // Vector/AI services
  if (depName.includes("pinecone")) return "Pinecone";
  if (depName.includes("openai")) return "OpenAI";
  if (depName.includes("anthropic")) return "Anthropic";
  if (depName === "langchain" || depName.includes("@langchain"))
    return "LangChain";

  // Cache/Queue
  if (depName === "redis" || depName.includes("ioredis")) return "Redis";
  if (depName.includes("rabbitmq")) return "RabbitMQ";
  if (depName.includes("kafka")) return "Kafka";

  // Cloud providers
  if (depName.includes("aws-sdk") || depName.includes("@aws-sdk")) return "AWS";
  if (depName.includes("@google-cloud")) return "Google Cloud";
  if (depName.includes("@azure")) return "Azure";

  return null;
}

/**
 * Detect app type based on package.json and structure
 * Priority: dependencies > scripts > bin field > folder name
 */
function detectAppType(
  appName: string,
  pkg?: ProjectPackage,
): "cli" | "frontend" | "backend" | "unknown" {
  // PRIORITY 1: Check dependencies first (most reliable)
  if (pkg?.dependencies || pkg?.devDependencies) {
    const allDeps = [
      ...Object.keys(pkg?.dependencies || {}),
      ...Object.keys(pkg?.devDependencies || {}),
    ];
    const depsStr = allDeps.join(",").toLowerCase();

    // Frontend frameworks - HIGHEST PRIORITY
    // Next.js, React, Vue, Svelte, Angular, Vite
    if (
      depsStr.includes("next") ||
      allDeps.some((d) => d === "react" || d === "react-dom") ||
      depsStr.includes("vue") ||
      depsStr.includes("svelte") ||
      depsStr.includes("@angular/core") ||
      depsStr.includes("vite")
    ) {
      return "frontend";
    }

    // Backend frameworks
    if (
      depsStr.includes("express") ||
      depsStr.includes("fastify") ||
      depsStr.includes("@nestjs/core") ||
      depsStr.includes("koa") ||
      depsStr.includes("hapi")
    ) {
      return "backend";
    }

    // CLI tools (only if no frontend/backend indicators)
    if (
      depsStr.includes("commander") ||
      depsStr.includes("yargs") ||
      depsStr.includes("inquirer") ||
      depsStr.includes("prompts")
    ) {
      return "cli";
    }
  }

  // PRIORITY 2: Check scripts
  if (pkg?.scripts) {
    const scriptsStr = JSON.stringify(pkg.scripts).toLowerCase();

    // Frontend indicators in scripts
    if (
      scriptsStr.includes("next dev") ||
      scriptsStr.includes("next build") ||
      scriptsStr.includes("vite") ||
      scriptsStr.includes("react-scripts") ||
      scriptsStr.includes("vue-cli")
    ) {
      return "frontend";
    }

    // Backend indicators in scripts
    if (
      scriptsStr.includes("express") ||
      scriptsStr.includes("fastify") ||
      scriptsStr.includes("nest start")
    ) {
      return "backend";
    }
  }

  // PRIORITY 3: Check bin field (only for true CLI tools)
  // But ONLY if we haven't detected it as frontend/backend above
  if (pkg?.bin) {
    return "cli";
  }

  // PRIORITY 4: Fallback to name-based detection (least reliable)
  const lowerName = appName.toLowerCase();
  if (
    lowerName.includes("frontend") ||
    lowerName.includes("web") ||
    lowerName.includes("ui")
  )
    return "frontend";
  if (
    lowerName.includes("backend") ||
    lowerName.includes("api") ||
    lowerName.includes("server")
  )
    return "backend";
  if (lowerName.includes("cli")) return "cli";

  return "unknown";
}

/**
 * Analyzes project structure to extract architectural insights
 */
function analyzeProjectArchitecture(
  documents: Document[],
  projectContext?: ProjectContext,
): {
  isMonorepo: boolean;
  apps: { name: string; type: "cli" | "frontend" | "backend" | "unknown" }[];
  packages: string[];
  externalServices: Set<string>;
  keyDirectories: Set<string>;
  entryPoints: string[];
} {
  const apps = new Map<
    string,
    { name: string; type: "cli" | "frontend" | "backend" | "unknown" }
  >();
  const packages = new Set<string>();
  const externalServices = new Set<string>();
  const keyDirectories = new Set<string>();

  // Analyze from project context structure
  if (projectContext?.structure) {
    for (const node of projectContext.structure) {
      if (node.name === "apps" && node.children) {
        for (const app of node.children) {
          // Find the package for this app
          const appPkg = projectContext.packages.find(
            (p) =>
              p.path.includes(`apps/${app.name}`) ||
              p.path === `apps/${app.name}`,
          );
          const appType = detectAppType(app.name, appPkg);
          apps.set(app.name, { name: app.name, type: appType });
        }
      }
      if (node.name === "packages" && node.children) {
        for (const pkg of node.children) {
          packages.add(pkg.name);
        }
      }
      keyDirectories.add(node.name);
    }
  }

  // Extract external services from package.json dependencies
  if (projectContext?.packages) {
    for (const pkg of projectContext.packages) {
      const allDeps = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
      ];

      for (const dep of allDeps) {
        const service = mapDependencyToService(dep);
        if (service) {
          externalServices.add(service);
        }
      }
    }
  }

  const isMonorepo =
    apps.size > 0 ||
    packages.size > 0 ||
    projectContext?.configFiles.turbo !== undefined ||
    (projectContext?.packages.some((p) => p.workspaces) ?? false);

  // Determine entry points based on app types
  const entryPoints: string[] = [];
  const appsArray = Array.from(apps.values());

  if (isMonorepo && appsArray.length > 0) {
    // For monorepo: prioritize CLI and Frontend as entry points
    const cliApps = appsArray.filter((a) => a.type === "cli");
    const frontendApps = appsArray.filter((a) => a.type === "frontend");
    const backendApps = appsArray.filter((a) => a.type === "backend");

    // Add entry points in priority order
    if (cliApps.length > 0) {
      entryPoints.push(...cliApps.map((a) => `apps/${a.name} (CLI)`));
    }
    if (frontendApps.length > 0) {
      entryPoints.push(...frontendApps.map((a) => `apps/${a.name} (Frontend)`));
    }
    if (
      backendApps.length > 0 &&
      cliApps.length === 0 &&
      frontendApps.length === 0
    ) {
      // Only show backend as entry point if there's no CLI or frontend
      entryPoints.push(...backendApps.map((a) => `apps/${a.name} (API)`));
    }
  } else if (projectContext?.packages) {
    // For single-package projects: detect type from root package
    const rootPkg = projectContext.packages.find((p) => p.path === ".");
    if (rootPkg) {
      const rootType = detectAppType("root", rootPkg);

      if (rootType === "frontend") {
        entryPoints.push("Frontend Application");
      } else if (rootType === "cli") {
        entryPoints.push("CLI Application");
      } else if (rootType === "backend") {
        entryPoints.push("API Server");
      } else {
        // Generic fallback
        entryPoints.push("Application");
      }
    }
  }

  return {
    isMonorepo,
    apps: appsArray,
    packages: Array.from(packages),
    externalServices,
    keyDirectories,
    entryPoints,
  };
}

/**
 * Build rich context for diagram generation
 */
function buildDiagramContext(
  rootPath: string,
  style: string,
  documents: Document[],
  stack?: DetectedStack,
  projectContext?: ProjectContext,
): string {
  const analysis = analyzeProjectArchitecture(documents, projectContext);

  const parts: string[] = [
    `## PROJECT CONTEXT`,
    `- **Root Path**: ${rootPath}`,
    `- **Style**: ${style || "Technical architecture documentation"}`,
  ];

  if (stack) {
    parts.push(
      `- **Primary Stack**: ${stack.language}${stack.framework ? ` + ${stack.framework}` : ""}`,
    );
    if (stack.notes) {
      parts.push(`- **Stack Notes**: ${stack.notes}`);
    }
  }

  parts.push(
    `- **Architecture Type**: ${analysis.isMonorepo ? "Monorepo" : "Single Package"}`,
  );

  if (analysis.entryPoints.length > 0) {
    parts.push(`- **Entry Points**: ${analysis.entryPoints.join(", ")}`);
  }

  if (analysis.isMonorepo) {
    if (analysis.apps.length > 0) {
      const appsInfo = analysis.apps
        .map((a) => `${a.name} (${a.type})`)
        .join(", ");
      parts.push(`- **Apps**: ${appsInfo}`);
    }
    if (analysis.packages.length > 0) {
      parts.push(`- **Packages**: ${analysis.packages.join(", ")}`);
    }
  }

  if (analysis.externalServices.size > 0) {
    parts.push(
      `- **External Services (from dependencies)**: ${Array.from(analysis.externalServices).join(", ")}`,
    );
  }

  // Add package information
  if (projectContext?.packages.length) {
    parts.push("", "## PACKAGES IN PROJECT");
    for (const pkg of projectContext.packages) {
      const pkgInfo = [`- **${pkg.name || pkg.path}**`];
      if (pkg.description) {
        pkgInfo.push(`  - Description: ${pkg.description}`);
      }
      if (pkg.path !== ".") {
        pkgInfo.push(`  - Path: ${pkg.path}`);
      }
      const deps = [
        ...Object.keys(
          (pkg as { dependencies?: Record<string, string> }).dependencies || {},
        ),
        ...Object.keys(
          (pkg as { devDependencies?: Record<string, string> })
            .devDependencies || {},
        ),
      ];
      if (deps.length > 0) {
        pkgInfo.push(
          `  - Key Dependencies: ${deps.slice(0, 8).join(", ")}${deps.length > 8 ? "..." : ""}`,
        );
      }
      parts.push(pkgInfo.join("\n"));
    }
  }

  // Add project structure tree
  if (projectContext?.structure) {
    parts.push("", "## PROJECT STRUCTURE TREE");
    parts.push("```");

    function printTree(nodes: ProjectStructureNode[], indent = ""): string {
      let result = "";
      for (const node of nodes) {
        const icon = node.type === "dir" ? "📁" : "📄";
        result += `${indent}${icon} ${node.name}\n`;
        if (node.children && node.children.length > 0) {
          result += printTree(node.children, indent + "  ");
        }
      }
      return result;
    }

    parts.push(printTree(projectContext.structure));
    parts.push("```");
  }

  // Add key source files
  parts.push("", "## KEY SOURCE FILES");
  parts.push(
    formatContext(documents.slice(0, 25), {
      maxEntries: 25,
      maxCharsPerEntry: 2000,
    }),
  );

  return parts.join("\n");
}

/**
 * Generate architecture diagrams.
 * Creates Mermaid diagrams showing system structure and data flow.
 *
 * USES ACTUAL PROJECT CONTEXT:
 * - Real package names and structure
 * - Real file paths and modules
 * - Real dependencies and integrations
 * - Never generates placeholder/example data
 */
export async function generateDiagrams(params: {
  rootPath: string;
  outputDir: string;
  style: string;
  documents: Document[];
  stack?: DetectedStack;
  projectContext?: ProjectContext;
}): Promise<GenerateResult> {
  const { rootPath, style, documents, stack, projectContext } = params;

  if (documents.length === 0) {
    return {
      kind: "diagram",
      suggestedPath: "ARCHITECTURE.md",
      content: `# Architecture Diagram Not Available

No source files were provided to analyze. Cannot generate architecture diagrams without code to analyze.

Please ensure the project has been properly scanned.
`,
    };
  }

  const contextPrompt = buildDiagramContext(
    rootPath,
    style,
    documents,
    stack,
    projectContext,
  );

  const prompt = [
    new SystemMessage(DIAGRAM_SYSTEM_PROMPT),
    new SystemMessage(contextPrompt),
    new HumanMessage(
      "Generate comprehensive architecture diagrams for this project. Use ONLY the actual project structure, package names, file paths, and dependencies provided in the PROJECT CONTEXT. Reference real components by their actual names.",
    ),
  ];

  try {
    const response = await invokeLLM({
      prompt,
      maxContextTokens: 60_000,
    });

    const content = extractContent(response);

    if (content.trim().length === 0) {
      throw new Error("Empty LLM response");
    }

    // Fix any invalid Mermaid syntax before returning
    const fixedContent = fixMermaidSyntax(content);

    return {
      kind: "diagram",
      suggestedPath: "ARCHITECTURE.md",
      content: fixedContent,
    };
  } catch (error) {
    const errorMsg = (error as Error).message;
    console.error("  ❌ Error:", errorMsg);

    return {
      kind: "diagram",
      suggestedPath: "ARCHITECTURE.md",
      content: `# Architecture Diagram Generation Failed

An error occurred while generating architecture diagrams:

\`\`\`
${errorMsg}
\`\`\`

Please try again or report this issue if it persists.
`,
    };
  }
}
