import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { formatContext, invokeLLM } from "../llm/client";
import type { DetectedStack, GenerateResult, ProjectContext } from "../types";
import { extractContent } from "../utils/utils";

const DIAGRAM_SYSTEM_PROMPT = `You are an expert software architect specializing in creating clear system architecture diagrams using Mermaid.

## YOUR MISSION

Generate **clear, accurate architecture diagrams** that:
- Show high-level system architecture
- Illustrate component relationships and data flow
- Use Mermaid syntax for easy rendering
- Document key integration points
- Explain design patterns and architectural decisions

## OUTPUT FORMAT RULES

1. Output PURE MARKDOWN only (no code fences around your response)
2. Use Mermaid diagram syntax
3. Extract REAL architecture from the provided codebase
4. NEVER use generic placeholders

## DIAGRAM STRUCTURE

### 1. System Overview
Brief description of the overall architecture.

### 2. Architecture Diagram
\`\`\`mermaid
graph TB
    Client[Client Application]
    API[API Server]
    DB[(Database)]
    Cache[(Cache)]
    
    Client -->|HTTP/REST| API
    API -->|Query| DB
    API -->|Read/Write| Cache
\`\`\`

### 3. Component Diagram
\`\`\`mermaid
graph LR
    subgraph Frontend
        UI[UI Components]
        State[State Management]
    end
    
    subgraph Backend
        Routes[API Routes]
        Services[Business Logic]
        Models[Data Models]
    end
    
    UI --> State
    State --> Routes
    Routes --> Services
    Services --> Models
\`\`\`

### 4. Data Flow Diagram
Show how data flows through the system.

### 5. Key Components
Document major components and their responsibilities.

### 6. Design Patterns
Architectural patterns used (e.g., MVC, Repository, Microservices).

## EXTRACTION GUIDELINES

From the codebase:
- Identify main modules/packages and their relationships
- Find service layers, controllers, models
- Locate external integrations (databases, APIs, caches)
- Understand the project structure (frontend, backend, shared libraries)
- Detect patterns (monorepo, microservices, layered architecture)

Now generate comprehensive architecture diagrams based on the provided context.`;

/**
 * Generate architecture diagrams.
 * Creates Mermaid diagrams showing system structure and data flow.
 */
export async function generateDiagrams(params: {
  rootPath: string;
  outputDir: string;
  style: string;
  documents: Document[];
  stack?: DetectedStack;
  projectContext?: ProjectContext;
}): Promise<GenerateResult> {
  const { rootPath, outputDir, style, documents, stack, projectContext } = params;

  console.log("\n📊 Generating architecture diagrams...");
  console.log(`  Documents: ${documents.length}`);

  const contextPrompt = [
    `## PROJECT CONTEXT`,
    `- **Root Path**: ${rootPath}`,
    `- **Output Directory**: ${outputDir}`,
    `- **Style**: ${style || "Technical architecture documentation"}`,
    stack ? `- **Stack**: ${stack.language}${stack.framework ? ` + ${stack.framework}` : ""}` : "",
    projectContext?.packages.length
      ? `- **Packages**: ${projectContext.packages.map((p) => p.name || p.path).join(", ")}`
      : "",
    "",
    "## CODEBASE STRUCTURE",
    "",
    formatContext(documents.slice(0, 30), {
      maxEntries: 30,
      maxCharsPerEntry: 1800,
    }),
  ].filter(Boolean).join("\n");

  const prompt = [
    new SystemMessage(DIAGRAM_SYSTEM_PROMPT),
    new SystemMessage(contextPrompt),
    new HumanMessage(
      "Generate comprehensive architecture diagrams for this project based on the provided codebase context.",
    ),
  ];

  try {
    const response = await invokeLLM({
      prompt,
      maxContextTokens: 40_000,
    });

    const content = extractContent(response);

    if (content.trim().length === 0) {
      throw new Error("Empty LLM response");
    }

    return {
      kind: "diagram",
      suggestedPath: "ARCHITECTURE.md",
      content,
    };
  } catch (error) {
    const errorMsg = (error as Error).message;

    return {
      kind: "diagram",
      suggestedPath: "ARCHITECTURE.md",
      content: `# Architecture Diagram Generation Failed\n\nFailed to generate diagrams: ${errorMsg}\n`,
    };
  }
}

