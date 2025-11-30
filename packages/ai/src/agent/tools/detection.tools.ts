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
 * 
 * IMPROVED: More accurate detection with better pattern matching
 */
export function createApiDetectorTool(documents: Document[]) {
  return tool(
    async () => {
      // More comprehensive endpoint patterns
      const endpointPatterns = [
        // Express/Node.js
        /\.(get|post|put|delete|patch)\s*\(\s*['"`]\/[^'"`]+['"`]/gi,
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`]\/[^'"`]+['"`]/gi,
        // Next.js API routes
        /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/gi,
        // FastAPI/Python
        /@(app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]\/[^'"]+['"]/gi,
        // NestJS
        /@(Get|Post|Put|Delete|Patch)\s*\(\s*['"`][^'"`]*['"`]?\s*\)/gi,
        // Flask/Python
        /@(app|bp|blueprint)\.(route|get|post|put|delete|patch)/gi,
        // Go HTTP handlers
        /http\.HandleFunc\s*\(\s*['"`]\/[^'"`]+['"`]/gi,
        // Gin (Go)
        /router\.(GET|POST|PUT|DELETE|PATCH)\s*\(\s*['"`]\/[^'"`]+['"`]/gi,
      ];

      let totalEndpointCount = 0;
      const apiFilesFound: { path: string; endpointCount: number }[] = [];

      for (const doc of documents) {
        const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
        const path =
          (typeof metadata.relativePath === "string" && metadata.relativePath) ||
          (typeof metadata.path === "string" && metadata.path) ||
          "";
        const lower = path.toLowerCase();
        const content = doc.pageContent;

        // More comprehensive API file detection
        const isApiFile =
          // Path-based detection
          lower.includes("/api/") ||
          lower.includes("/routes/") ||
          lower.includes("/controllers/") ||
          lower.includes("/handlers/") ||
          lower.includes("/endpoints/") ||
          lower.includes("route.ts") ||
          lower.includes("route.js") ||
          lower.includes("router.ts") ||
          lower.includes("router.js") ||
          lower.endsWith("_controller.py") ||
          lower.endsWith("_handler.go") ||
          lower.endsWith("_routes.py") ||
          lower.endsWith("_routes.ts") ||
          lower.endsWith("_routes.js") ||
          // Content-based detection
          content.includes("@route") ||
          content.includes("@app.route") ||
          content.includes("app.get(") ||
          content.includes("app.post(") ||
          content.includes("router.get(") ||
          content.includes("router.post(") ||
          content.includes("express()") ||
          content.includes("from fastapi import") ||
          content.includes("from flask import");

        if (!isApiFile) continue;

        // Count actual endpoint definitions
        let fileEndpointCount = 0;
        for (const pattern of endpointPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            fileEndpointCount += matches.length;
          }
        }

        if (fileEndpointCount > 0) {
          apiFilesFound.push({ path, endpointCount: fileEndpointCount });
          totalEndpointCount += fileEndpointCount;
        }
      }

      const hasApi = apiFilesFound.length >= 1 && totalEndpointCount >= 2;

      if (!hasApi) {
        const reason = apiFilesFound.length === 0
          ? "No API files detected in the project"
          : `Found ${apiFilesFound.length} API-related files but only ${totalEndpointCount} endpoint(s) - need at least 2 endpoints`;

        return JSON.stringify({
          hasApi: false,
          apiType: null,
          endpointCount: totalEndpointCount,
          apiFiles: apiFilesFound,
          notes: reason,
        });
      }

      // If we have APIs, use LLM to determine type
      const apiDocs = documents.filter((doc) => {
        const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
        const path =
          (typeof metadata.relativePath === "string" && metadata.relativePath) ||
          "";
        return apiFilesFound.some((f) => f.path === path);
      });

      const context = formatContext(apiDocs.slice(0, 15), {
        maxEntries: 15,
        maxCharsPerEntry: 1_500,
      });

      const prompt = [
        new SystemMessage(
          "Analyze these API files and determine the API type. Respond ONLY with JSON: " +
          '{"hasApi": true, "apiType": "REST|GraphQL|gRPC|WebSocket", "endpointCount": number, "notes": "..."}'
        ),
        new HumanMessage(`Found ${totalEndpointCount} endpoints in ${apiFilesFound.length} files:\n\n${context}`),
      ];

      try {
        const response = await invokeLLM({ prompt, maxContextTokens: 5_000 });
        const content = extractContent(response);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]) as {
            hasApi: boolean;
            apiType: string;
            endpointCount: number;
            notes: string;
          };
          return JSON.stringify({
            ...result,
            endpointCount: totalEndpointCount,
            apiFiles: apiFilesFound,
          });
        }
      } catch {
        // LLM analysis failed, continue to fallback
      }

      // Fallback: we know we have APIs, just couldn't classify type
      const result = {
        hasApi: true,
        apiType: "REST", // Default assumption
        endpointCount: totalEndpointCount,
        apiFiles: apiFilesFound,
        notes: `Detected ${totalEndpointCount} endpoints across ${apiFilesFound.length} files`,
      };

      return JSON.stringify(result);
    },
    {
      name: "detect_api_endpoints",
      description: "Checks if the project has API endpoints (REST, GraphQL, WebSocket, etc.). Use this before generating API documentation to validate the request makes sense. This tool uses comprehensive pattern matching to detect actual endpoint definitions.",
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

      return JSON.stringify(result);
    },
    {
      name: "analyze_project_structure",
      description: "Analyzes project structure to understand complexity (simple/moderate/complex), whether it's a monorepo, and architecture patterns. Useful for deciding which documentation types are most valuable.",
      schema: z.object({}),
    },
  );
}

