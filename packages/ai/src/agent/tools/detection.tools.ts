import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "langchain";
import * as z from "zod";

import { formatContext, invokeLLM } from "../../llm/client";
import type { DetectedStack } from "../../types";
import { COMMON_LANGUAGES } from "../../utils/languages";
import { extractContent } from "../../utils/utils";

/**
 * Tool: Detect technology stack from codebase
 * Analyzes documents to identify language, framework, and architecture
 */
export function createStackDetectorTool(documents: Document[]) {
  return tool(
    async () => {
      console.log("  🔍 Agent: Detecting technology stack...");

      if (documents.length === 0) {
        return JSON.stringify({ language: "other", notes: "No documents to analyze" });
      }

      const context = formatContext(documents, {
        maxEntries: 20,
        maxCharsPerEntry: 2_000,
      });

      const prompt = [
        new SystemMessage(
          [
            "You are a code analysis expert. Analyze the codebase to detect:",
            `1. Primary language (${COMMON_LANGUAGES.join(", ")}, or others)`,
            "2. Framework/library (React, Next.js, Express, FastAPI, etc.)",
            "3. Architecture notes (monorepo, microservices, etc.)",
            "",
            "Respond ONLY with valid JSON:",
            '{"language": "ts|js|py|go|...", "framework": "...", "notes": "..."}',
          ].join(" "),
        ),
        new HumanMessage(`Analyze this codebase:\n\n${context}`),
      ];

      const response = await invokeLLM({ prompt, maxContextTokens: 5_000 });
      const content = extractContent(response);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as DetectedStack;
        console.log(`     ✓ Detected: ${parsed.language}${parsed.framework ? ` + ${parsed.framework}` : ""}`);
        return JSON.stringify(parsed);
      }

      return JSON.stringify({ language: "other", notes: "Could not parse detection" });
    },
    {
      name: "detect_stack",
      description: "Detects the technology stack (language, framework, architecture) from the codebase. Use this first to understand what kind of project you're analyzing.",
      schema: z.object({}),
    },
  );
}

/**
 * Tool: Detect API endpoints in codebase
 * Returns whether project has API routes and what type
 */
export function createApiDetectorTool(documents: Document[]) {
  return tool(
    async () => {
      console.log("  🔍 Agent: Checking for API endpoints...");

      const apiRelatedDocs = documents.filter((doc) => {
        const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
        const path =
          (typeof metadata.relativePath === "string" && metadata.relativePath) ||
          (typeof metadata.path === "string" && metadata.path) ||
          "";
        const lower = path.toLowerCase();
        const content = doc.pageContent.toLowerCase();

        return (
          lower.includes("api") ||
          lower.includes("route") ||
          lower.includes("controller") ||
          lower.includes("endpoint") ||
          content.includes("@route") ||
          content.includes("@app.") ||
          content.includes("app.get") ||
          content.includes("app.post") ||
          content.includes("router.") ||
          content.includes("express(") ||
          content.includes("fastapi")
        );
      });

      const hasApi = apiRelatedDocs.length > 0;

      if (hasApi) {
        const context = formatContext(apiRelatedDocs.slice(0, 10), {
          maxEntries: 10,
          maxCharsPerEntry: 1_000,
        });

        const prompt = [
          new SystemMessage(
            "Analyze these files and determine the API type. Respond ONLY with JSON: " +
            '{"hasApi": true, "apiType": "REST|GraphQL|gRPC", "endpointCount": number, "notes": "..."}'
          ),
          new HumanMessage(`Analyze:\n\n${context}`),
        ];

        const response = await invokeLLM({ prompt, maxContextTokens: 3_000 });
        const content = extractContent(response);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          console.log(`     ✓ API detected: ${result.apiType} (${result.endpointCount} endpoints)`);
          return JSON.stringify(result);
        }
      }

      console.log("     ✓ No API endpoints found");
      return JSON.stringify({
        hasApi: false,
        apiType: null,
        endpointCount: 0,
        notes: "No API routes detected in codebase",
      });
    },
    {
      name: "detect_api_endpoints",
      description: "Checks if the project has API endpoints (REST, GraphQL, etc.). Use this before generating API documentation to validate the request makes sense.",
      schema: z.object({}),
    },
  );
}

/**
 * Tool: Analyze project structure and complexity
 * Determines if project is simple, moderate, or complex
 */
export function createStructureAnalyzerTool(documents: Document[]) {
  return tool(
    async () => {
      console.log("  🔍 Agent: Analyzing project structure...");

      const paths = new Set<string>();
      documents.forEach((doc) => {
        const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
        const path =
          (typeof metadata.relativePath === "string" && metadata.relativePath) ||
          "";
        if (path) paths.add(path);
      });

      const uniquePaths = Array.from(paths);
      const hasMonorepo = uniquePaths.some(
        (p) => p.includes("packages/") || p.includes("apps/")
      );
      const hasMultipleServices = uniquePaths.filter(
        (p) => p.includes("service") || p.includes("microservice")
      ).length > 1;
      const hasDatabaseSchemas = uniquePaths.some(
        (p) => p.includes("schema") || p.includes("migration") || p.includes("prisma")
      );

      let complexity: "simple" | "moderate" | "complex" = "simple";
      if (hasMonorepo || hasMultipleServices) {
        complexity = "complex";
      } else if (hasDatabaseSchemas || uniquePaths.length > 30) {
        complexity = "moderate";
      }

      const result = {
        fileCount: uniquePaths.length,
        isMonorepo: hasMonorepo,
        hasMultipleServices,
        hasDatabaseSchemas,
        complexity,
        notes: `${complexity.charAt(0).toUpperCase() + complexity.slice(1)} project with ${uniquePaths.length} files`,
      };

      console.log(`     ✓ Structure: ${result.complexity} (${result.fileCount} files)`);
      return JSON.stringify(result);
    },
    {
      name: "analyze_project_structure",
      description: "Analyzes project structure to understand complexity (simple/moderate/complex), whether it's a monorepo, and architecture patterns. Useful for deciding which documentation types are most valuable.",
      schema: z.object({}),
    },
  );
}

