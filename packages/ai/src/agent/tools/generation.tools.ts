import type { Document } from "@langchain/core/documents";
import { tool } from "langchain";
import * as z from "zod";

import { generateApiDocs } from "../../generators/api-docs.generator";
import { generateDiagrams } from "../../generators/diagram.generator";
import { generateReadme } from "../../generators/readme.generator";
import { generateSummary } from "../../generators/summary.generator";
import type { DetectedStack, ProjectContext } from "../../types";

/**
 * Tool: Generate README documentation
 * Always available for any project
 */
export function createReadmeGeneratorTool(
  documents: Document[],
  stack: DetectedStack | undefined,
  projectContext: ProjectContext | undefined,
) {
  return tool(
    async ({ rootPath, outputDir, style }) => {
      console.log("\n  📘 Agent: Generating README documentation...");

      const result = await generateReadme({
        rootPath,
        outputDir,
        style,
        documents,
        stack,
        projectContext,
      });

      console.log("     ✓ README generated successfully");
      return JSON.stringify(result);
    },
    {
      name: "generate_readme",
      description: "Generates a professional README.md file for the project. This is always appropriate for any codebase and provides overview, setup instructions, and usage examples.",
      schema: z.object({
        rootPath: z.string().describe("The root path of the project"),
        outputDir: z.string().describe("The output directory for documentation"),
        style: z.string().describe("The desired documentation style (e.g., 'technical', 'beginner-friendly', 'comprehensive')"),
      }),
    },
  );
}

/**
 * Tool: Generate API documentation
 * Should only be used if API endpoints exist
 */
export function createApiDocsGeneratorTool(
  documents: Document[],
  stack: DetectedStack | undefined,
  projectContext: ProjectContext | undefined,
) {
  return tool(
    async ({ rootPath, outputDir, style }) => {
      console.log("\n  📡 Agent: Generating API documentation...");

      const result = await generateApiDocs({
        rootPath,
        outputDir,
        style,
        documents,
        stack,
        projectContext,
      });

      console.log("     ✓ API documentation generated successfully");
      return JSON.stringify(result);
    },
    {
      name: "generate_api_docs",
      description: "Generates comprehensive API documentation including endpoints, request/response schemas, authentication, and examples. IMPORTANT: Only use this if detect_api_endpoints confirmed the project has API routes. Otherwise, suggest README instead.",
      schema: z.object({
        rootPath: z.string().describe("The root path of the project"),
        outputDir: z.string().describe("The output directory for documentation"),
        style: z.string().describe("The desired documentation style"),
      }),
    },
  );
}

/**
 * Tool: Generate architecture diagrams
 * Best for complex projects with multiple components
 */
export function createDiagramsGeneratorTool(
  documents: Document[],
  stack: DetectedStack | undefined,
  projectContext: ProjectContext | undefined,
) {
  return tool(
    async ({ rootPath, outputDir, style }) => {
      console.log("\n  📊 Agent: Generating architecture diagrams...");

      const result = await generateDiagrams({
        rootPath,
        outputDir,
        style,
        documents,
        stack,
        projectContext,
      });

      console.log("     ✓ Architecture diagrams generated successfully");
      return JSON.stringify(result);
    },
    {
      name: "generate_diagrams",
      description: "Generates architecture diagrams using Mermaid syntax showing system structure, component relationships, and data flow. Most valuable for moderate to complex projects with multiple services or modules.",
      schema: z.object({
        rootPath: z.string().describe("The root path of the project"),
        outputDir: z.string().describe("The output directory for documentation"),
        style: z.string().describe("The desired documentation style"),
      }),
    },
  );
}

/**
 * Tool: Generate project summary
 * Comprehensive overview of entire codebase
 */
export function createSummaryGeneratorTool(
  documents: Document[],
  stack: DetectedStack | undefined,
  projectContext: ProjectContext | undefined,
) {
  return tool(
    async ({ rootPath, outputDir, style }) => {
      console.log("\n  📝 Agent: Generating project summary...");

      const result = await generateSummary({
        rootPath,
        outputDir,
        style,
        documents,
        stack,
        projectContext,
      });

      console.log("     ✓ Project summary generated successfully");
      return JSON.stringify(result);
    },
    {
      name: "generate_summary",
      description: "Generates a comprehensive repository summary covering technology stack, architecture, key features, and development workflow. Useful for onboarding or high-level project understanding.",
      schema: z.object({
        rootPath: z.string().describe("The root path of the project"),
        outputDir: z.string().describe("The output directory for documentation"),
        style: z.string().describe("The desired documentation style"),
      }),
    },
  );
}

