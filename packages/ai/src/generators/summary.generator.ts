import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { formatContext, invokeLLM } from "../llm/client";
import type { DetectedStack, GenerateResult, ProjectContext } from "../types";
import { extractContent } from "../utils/utils";

const SUMMARY_SYSTEM_PROMPT = `You are an expert technical writer specializing in creating comprehensive repository summaries.

## YOUR MISSION

Generate a **comprehensive repository summary** that:
- Provides a high-level overview of the entire project
- Explains the purpose, goals, and key features
- Documents the technology stack and architecture
- Highlights important patterns and design decisions
- Serves as a quick reference for developers

## OUTPUT FORMAT RULES

1. Output PURE MARKDOWN only (no code fences around your response)
2. Use ONLY real data from the provided codebase
3. NEVER use placeholders
4. Be comprehensive but concise

## SUMMARY STRUCTURE

### 1. Project Overview
- What is this project?
- What problem does it solve?
- Who is it for?

### 2. Key Features
Bullet-pointed list of main features and capabilities.

### 3. Technology Stack
- **Language**: (e.g., TypeScript)
- **Framework**: (e.g., Next.js, Express)
- **Database**: (e.g., PostgreSQL, MongoDB)
- **Key Dependencies**: Major libraries used
- **Tools**: Build tools, testing frameworks

### 4. Architecture
High-level description of how the system is structured:
- Monorepo or single package?
- Frontend + Backend separation?
- Key architectural patterns

### 5. Project Structure
Overview of main directories and their purposes.

### 6. Key Modules/Components
Document the most important modules and what they do.

### 7. Development Workflow
- How to set up the project
- How to run tests
- How to build for production
- How to deploy

### 8. Notable Patterns
Design patterns, coding standards, or conventions used.

### 9. Dependencies Overview
Summary of major dependencies and why they're used.

### 10. Future Roadmap (if available)
Planned features or improvements mentioned in the code/docs.

## EXTRACTION GUIDELINES

From the codebase:
- Read package.json for dependencies and scripts
- Analyze project structure from file paths
- Identify main entry points and core modules
- Extract technology choices and patterns
- Review existing documentation for context

Now generate a comprehensive repository summary based on the provided context.`;

/**
 * Generate comprehensive repository summary.
 * Provides a high-level overview of the entire project.
 */
export async function generateSummary(params: {
  rootPath: string;
  outputDir: string;
  style: string;
  documents: Document[];
  stack?: DetectedStack;
  projectContext?: ProjectContext;
}): Promise<GenerateResult> {
  const { rootPath, outputDir, style, documents, stack, projectContext } = params;

  console.log("\n📝 Generating repository summary...");
  console.log(`  Documents: ${documents.length}`);

  const contextPrompt = [
    `## PROJECT CONTEXT`,
    `- **Root Path**: ${rootPath}`,
    `- **Output Directory**: ${outputDir}`,
    `- **Style**: ${style || "Comprehensive technical summary"}`,
    stack ? `- **Stack**: ${stack.language}${stack.framework ? ` + ${stack.framework}` : ""}` : "",
    projectContext?.packages.length
      ? `- **Packages**: ${projectContext.packages.map((p) => p.name || p.path).join(", ")}`
      : "",
    "",
    "## PROJECT OVERVIEW",
    "",
    projectContext?.packages[0]?.description
      ? `Project Description: ${projectContext.packages[0].description}`
      : "",
    "",
    "## CODEBASE SAMPLE",
    "",
    formatContext(documents.slice(0, 35), {
      maxEntries: 35,
      maxCharsPerEntry: 1500,
    }),
  ].filter(Boolean).join("\n");

  const prompt = [
    new SystemMessage(SUMMARY_SYSTEM_PROMPT),
    new SystemMessage(contextPrompt),
    new HumanMessage(
      "Generate a comprehensive repository summary for this project based on the provided codebase context.",
    ),
  ];

  try {
    const response = await invokeLLM({
      prompt,
      maxContextTokens: 45_000,
    });

    const content = extractContent(response);

    if (content.trim().length === 0) {
      throw new Error("Empty LLM response");
    }

    return {
      kind: "summary",
      suggestedPath: "SUMMARY.md",
      content,
    };
  } catch (error) {
    const errorMsg = (error as Error).message;

    return {
      kind: "summary",
      suggestedPath: "SUMMARY.md",
      content: `# Repository Summary Generation Failed\n\nFailed to generate summary: ${errorMsg}\n`,
    };
  }
}

