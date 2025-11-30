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

const DIAGRAM_SYSTEM_PROMPT = `You are an expert software architect specializing in creating clear system architecture diagrams using Mermaid.

## YOUR MISSION

Generate **clear, accurate architecture diagrams** that:
- Show high-level system architecture based on ACTUAL project structure
- Illustrate component relationships and data flow from REAL code
- Use Mermaid syntax for easy rendering
- Document key integration points found in the codebase
- Explain design patterns and architectural decisions detected in the code

## OUTPUT FORMAT RULES

1. Output PURE MARKDOWN only (no code fences around your response)
2. Use Mermaid diagram syntax with VALID node IDs
3. Extract REAL architecture from the provided codebase
4. NEVER use generic placeholders like "Client Application", "API Server", "Database"
5. Use ACTUAL component names from the project (packages, apps, modules found in PROJECT CONTEXT)
6. Reference REAL files and modules from the provided codebase

## MERMAID SYNTAX REQUIREMENTS

**CRITICAL**: Mermaid node IDs must be valid identifiers (alphanumeric, no special characters like @ or / or - at the start).

✅ **CORRECT Mermaid Syntax**:
\`\`\`mermaid
graph TB
    CLI[apps/cli]
    Frontend[apps/frontend]
    RepoAI["@repo/ai"]
    RepoRAG["@repo/rag"]
    
    CLI --> RepoAI
    Frontend --> RepoAI
    RepoAI --> RepoRAG
\`\`\`

❌ **WRONG Mermaid Syntax** (will cause parse errors):
\`\`\`mermaid
graph TB
    @repo/ai --> @repo/rag  ❌ Invalid node ID
    apps/cli --> @repo/ai   ❌ Invalid node ID
\`\`\`

**Rules for Node IDs**:
- Use camelCase or PascalCase: RepoAI, appsCli, frontendApp
- Put actual names in brackets: RepoAI["@repo/ai"]
- For paths with slashes, use descriptive IDs: AppsCli["apps/cli"]
- For files, remove extensions: DiagramGen["diagram.generator.ts"]

## DIAGRAM STRUCTURE

### 1. System Overview
Brief description of the ACTUAL project architecture based on the real structure provided.

### 2. High-Level Architecture Diagram
**CRITICAL**: Use the **Entry Points** information from PROJECT CONTEXT to determine the client layer.
- If Entry Points contains CLI, the client is the CLI application
- If Entry Points contains Frontend, the client is the frontend application
- Show the ACTUAL flow from entry points through the system

Use REAL package/app/module names from the PROJECT CONTEXT.

**Remember**: Use valid Mermaid node IDs (alphanumeric) and put display names in brackets.

\`\`\`mermaid
graph TB
    subgraph "Entry Points (from PROJECT CONTEXT)"
        ActualEntryPoint["The actual entry point detected"]
    end
    
    subgraph "Backend/Core Layer"
        CoreModule["Actual Core Module"]
        ServiceLayer["Actual Service"]
    end
    
    subgraph "External Services (from dependencies)"
        RealService[("Actual Service from package.json")]
    end
    
    ActualEntryPoint --> CoreModule
    CoreModule --> ServiceLayer
    ServiceLayer --> RealService
\`\`\`

**EXAMPLE with Real Names** (if project has CLI as entry point):
\`\`\`mermaid
graph TB
    subgraph "Entry Points"
        CLI["apps/cli"]
    end
    
    subgraph "Packages"
        RepoAI["@repo/ai"]
        RepoRAG["@repo/rag"]
    end
    
    subgraph "External Services"
        Supabase[("Supabase")]
        OpenAI[("OpenAI")]
    end
    
    CLI --> RepoAI
    RepoAI --> RepoRAG
    RepoRAG --> OpenAI
    CLI --> Supabase
\`\`\`

### 3. Component/Module Diagram
Show ACTUAL modules and their relationships from the codebase.

**Remember**: Use valid node IDs without special characters.

\`\`\`mermaid
graph LR
    subgraph "Package: [Real Package Name]"
        FileA["actual-file.ts"]
        FileB["another-file.ts"]
    end
    
    subgraph "Package: [Real Package Name 2]"
        FileC["real-module.ts"]
    end
    
    FileA --> FileB
    FileB --> FileC
\`\`\`

**EXAMPLE with Real Names** (if project has @repo/ai package):
\`\`\`mermaid
graph LR
    subgraph "Package: @repo/ai"
        AgentIndex["agent/index.ts"]
        Generators["generators/"]
        LLMClient["llm/client.ts"]
    end
    
    subgraph "Package: @repo/rag"
        Retriever["retriever.ts"]
        Embeddings["embeddings.ts"]
    end
    
    AgentIndex --> Generators
    AgentIndex --> LLMClient
    Generators --> Retriever
\`\`\`

### 4. Data Flow Diagram
Show how data flows through REAL components found in the code.
**Use the Entry Points from PROJECT CONTEXT as the starting point of the flow.**

### 5. Key Components
Document ACTUAL components found in the code:
- List REAL files and their purposes
- Reference ACTUAL classes/functions from the codebase
- Mention ACTUAL dependencies (from package.json in PROJECT CONTEXT)

### 6. Design Patterns
Architectural patterns detected in the ACTUAL code:
- Monorepo structure (if turbo.json or workspaces exist in PROJECT CONTEXT)
- Layered architecture (if clear separation exists in file structure)
- Other patterns based on actual folder structure

## EXTRACTION GUIDELINES

From the PROJECT CONTEXT provided below:
1. **Use the Entry Points field** - this tells you what the actual client/starting point is (CLI, Frontend, Backend API, etc.)
2. **Use the project structure tree** - map ACTUAL directories and files shown
3. **Use package.json data** - reference REAL package names and dependencies listed
4. **Use detected stack** - incorporate actual framework/language mentioned
5. **Analyze file paths in documents** - understand the real organization
6. **Use External Services (from dependencies)** - ONLY show services that are listed there, not generic placeholders
7. **Look for real patterns**:
   - Is this a monorepo? (check for workspaces, turbo.json, apps/, packages/ folders)
   - What are the main apps/packages? (from structure tree provided)
   - What external services exist? (ONLY from External Services field)
   - What are the key modules? (from file paths and import analysis)

## CRITICAL REQUIREMENTS

- **ALWAYS** check the Entry Points field to determine the actual client/entry point
- Reference ACTUAL file paths from the PROJECT CONTEXT (e.g., the real paths shown)
- Use REAL package names from the PROJECT CONTEXT (e.g., actual package.json names)
- Mention REAL dependencies from PROJECT CONTEXT (e.g., actual package.json dependencies)
- Show REAL relationships based on imports and usage patterns in the code
- **ONLY** show external services that are explicitly listed in "External Services (from dependencies)"
- DO NOT invent or assume external services like "PostgreSQL", "Redis", etc. unless they're in the dependencies list

## MERMAID SYNTAX - CRITICAL RULES

**ALWAYS follow these Mermaid rules to avoid parse errors:**

1. **Node IDs must be alphanumeric** (letters, numbers, underscores only)
   - ✅ Good: RepoAI, appsCli, frontendApp, DiagramGen
   - ❌ Bad: @repo/ai, apps/cli, @app, my-service

2. **Display names go in brackets or quotes**
   - ✅ Good: RepoAI["@repo/ai"] or AppsCli["apps/cli"]
   - ❌ Bad: @repo/ai (used directly as node ID)

3. **For file paths with slashes, create descriptive IDs**
   - ✅ Good: AppsCliCommands["apps/cli/src/commands/"]
   - ❌ Bad: apps/cli/src/commands/ (slashes not allowed in IDs)

4. **For packages with @ or scopes, remove special chars**
   - ✅ Good: RepoAI["@repo/ai"], NextCore["next"], SupabaseClient["@supabase/client"]
   - ❌ Bad: @repo/ai, @supabase/client (@ not allowed in IDs)

5. **Always define nodes before using them in connections**
   - ✅ Good: Define CLI["apps/cli"] then use CLI --> RepoAI
   - ❌ Bad: Using CLI in connection without defining it first

**Example of CORRECT syntax for a project with @repo/ai and apps/cli:**
\`\`\`mermaid
graph TB
    CLI["apps/cli"]
    Frontend["apps/frontend"]
    RepoAI["@repo/ai"]
    RepoRAG["@repo/rag"]
    Supabase[("Supabase")]
    Pinecone[("Pinecone")]
    
    CLI --> RepoAI
    Frontend --> RepoAI
    RepoAI --> RepoRAG
    RepoRAG --> Pinecone
    RepoAI --> Supabase
\`\`\`

Now generate comprehensive architecture diagrams based on the provided PROJECT CONTEXT and ACTUAL codebase structure below.`;

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
  if (depName === "langchain" || depName.includes("@langchain")) return "LangChain";
  
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
function detectAppType(appName: string, pkg?: ProjectPackage): "cli" | "frontend" | "backend" | "unknown" {
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
  if (lowerName.includes("frontend") || lowerName.includes("web") || lowerName.includes("ui")) return "frontend";
  if (lowerName.includes("backend") || lowerName.includes("api") || lowerName.includes("server")) return "backend";
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
  const apps = new Map<string, { name: string; type: "cli" | "frontend" | "backend" | "unknown" }>();
  const packages = new Set<string>();
  const externalServices = new Set<string>();
  const keyDirectories = new Set<string>();

  // Analyze from project context structure
  if (projectContext?.structure) {
    for (const node of projectContext.structure) {
      if (node.name === "apps" && node.children) {
        for (const app of node.children) {
          // Find the package for this app
          const appPkg = projectContext.packages.find((p) => 
            p.path.includes(`apps/${app.name}`) || p.path === `apps/${app.name}`
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
    if (backendApps.length > 0 && cliApps.length === 0 && frontendApps.length === 0) {
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
      const appsInfo = analysis.apps.map((a) => `${a.name} (${a.type})`).join(", ");
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
