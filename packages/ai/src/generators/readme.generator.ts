import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { formatContext, invokeLLM } from "../llm/client";
import type {
  DetectedStack,
  GenerateResult,
  ProjectContext,
  ProjectStructureNode,
} from "../types";
import { extractContent } from "../utils/utils";

/**
 * World-class README generation system prompt.
 * Direct, focused, and production-ready.
 */
const README_SYSTEM_PROMPT = `You are a world-class technical documentation engineer who has written README files for Fortune 500 companies, top open-source projects (React, Next.js, Prisma, tRPC), and Y Combinator startups.

## YOUR MISSION

Generate a **production-ready, industry-leading README.md** that:
- Immediately communicates project value and purpose
- Enables developers to get started in under 5 minutes
- Follows the exact structure and quality of top GitHub repositories
- Uses ONLY real data extracted from the provided codebase context

## ABSOLUTE RULES

### Rule 1: OUTPUT FORMAT
Your response must be PURE MARKDOWN content only.
- Do NOT wrap your response in \`\`\`markdown or \`\`\` code fences
- Do NOT start with \`\`\`markdown
- Do NOT end with \`\`\`
- Start directly with the README content
- Output ONLY the raw README.md content, nothing else

### Rule 2: ZERO PLACEHOLDERS
NEVER write placeholder text such as:
- "[insert project name]", "[your-repo]", "[insert purpose]"
- "TODO: add description", "TBD", "Coming soon"
- Generic text like "This project does X" without specifics

### Rule 3: EXTRACT REAL DATA
From the codebase context, you MUST extract and use:
- **package.json**: name, description, version, scripts, dependencies, workspaces
- **Config files**: tsconfig.json, .env.example, docker-compose.yml, etc.
- **Folder structure**: Actual directories and their purposes
- **Code patterns**: Architecture decisions visible in the codebase

### Rule 4: INFER INTELLIGENTLY
When explicit data isn't available, INFER from context:
- Monorepo? → Look for workspaces, turbo.json
- API project? → Look for routes, controllers, endpoints
- CLI tool? → Look for bin field, commander/yargs dependencies
- Full-stack? → Look for frontend + backend folders

### Rule 5: USE EXACT STRUCTURE FROM CONTEXT
The context includes a **PROJECT STRUCTURE** section with the ACTUAL directory tree.
- DO NOT infer or guess directory names
- DO NOT generalize paths (e.g., changing \`apps/\` to \`packages/\`)
- Use the EXACT paths shown in the structure tree
- If the structure shows \`apps/cli/\`, document it as \`apps/cli/\`, NOT \`packages/cli/\`
- Copy the structure verbatim - it's from the actual filesystem scan

## README STRUCTURE (FOLLOW THIS EXACT ORDER)

### 1. HEADER SECTION
\`\`\`markdown
<div align="center">
  <h1>🚀 Project Name</h1>
  <p><strong>One-line compelling description extracted from package.json or inferred</strong></p>

  <p>
    <a href="#installation"><img src="https://img.shields.io/badge/install-guide-blue?style=for-the-badge" alt="Installation" /></a>
    <a href="#quick-start"><img src="https://img.shields.io/badge/quick-start-green?style=for-the-badge" alt="Quick Start" /></a>
  </p>
</div>
\`\`\`

### 2. HIGHLIGHTS / FEATURES (Use bullet points with emojis)
- ⚡ **Key Feature 1** – Brief explanation
- 🔒 **Key Feature 2** – Brief explanation
- 🎯 **Key Feature 3** – Brief explanation

### 3. TABLE OF CONTENTS
Use a clean, navigable TOC linking to all major sections.

### 4. PREREQUISITES
List actual requirements found in the codebase:
- Node.js version (from package.json engines or .nvmrc)
- Package manager (npm, yarn, pnpm based on lock file)
- Database requirements (from docker-compose or dependencies)
- Environment variables (from .env.example)

### 5. INSTALLATION
\`\`\`bash
# Clone the repository
git clone <actual-repo-url-if-available>
cd <project-folder-name>

# Install dependencies (use the actual package manager)
npm install  # or yarn, pnpm based on lock file

# Setup environment
cp .env.example .env
\`\`\`

### 6. QUICK START
Show the minimal steps to run the project:
\`\`\`bash
npm run dev  # Use actual script from package.json
\`\`\`

### 7. AVAILABLE SCRIPTS
Create a table with ALL scripts from package.json:
| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Build for production |
| ... |  |

### 8. PROJECT STRUCTURE
**CRITICAL**: In the context, you will receive a "PROJECT STRUCTURE (EXACT FILESYSTEM TREE)" section.

**YOU MUST:**
- Copy the structure EXACTLY as provided, character-by-character
- Include ALL comments and descriptions (lines with \`# Description\`)
- Maintain ALL levels of depth shown (minimum 2-3 levels for directories)
- Preserve the tree format with ├──, │, └── characters
- DO NOT remove or omit any descriptions

**Example of CORRECT output (with descriptions):**
\`\`\`
project-name/
├── apps/     # Application packages
│   ├── cli/     # CLI tool
│   │   ├── src/     # Source code
│   │   └── package.json     # Package configuration
│   └── web/     # Web application
│       ├── src/     # Source code
│       └── package.json     # Package configuration
├── packages/     # Shared packages/libraries
│   └── ui/     # UI component library
├── package.json     # Package configuration
├── tsconfig.json     # TypeScript config
└── turbo.json     # Turborepo config
\`\`\`

**Example of INCORRECT output (missing descriptions):**
\`\`\`
project-name/
├── apps/
├── packages/
└── package.json
\`\`\`

**If the context shows shallow structure, STILL include the descriptions for what IS shown.**

### 9. CONFIGURATION
Document actual config files found:
- Environment variables with descriptions
- Config file purposes

### 10. ARCHITECTURE (For complex projects)
Briefly explain the architecture if it's a monorepo or has specific patterns.

### 11. CONTRIBUTING
Standard contribution guidelines.

### 12. LICENSE
If LICENSE file exists, reference it.

## QUALITY CHECKLIST

✅ Project name matches package.json "name" field exactly
✅ All scripts from package.json are documented with real commands
✅ Folder structure reflects actual directories in context
✅ No placeholder text exists anywhere
✅ Installation commands use the correct package manager
✅ Quick start section gets developers running in <5 minutes
✅ Professional tone with strategic emoji usage (not excessive)
✅ Proper Markdown formatting (headers, code blocks, tables)

## FINAL INSTRUCTIONS

1. **OUTPUT RAW MARKDOWN ONLY** - Do NOT wrap in \`\`\`markdown code fences
2. Read ALL provided context files carefully
3. Extract REAL values from package.json, config files, and folder structure
4. Generate a README following the exact structure above
5. Ensure ZERO placeholders exist in your output
6. Match the quality and professionalism of top open-source projects
7. Adapt sections based on what's relevant (skip sections that don't apply)

Now generate the README based on the codebase context provided below.`;

function buildProjectMetadataContext(
  projectContext: ProjectContext | undefined,
  rootPath: string,
  outputDir: string,
  style: string,
  stack?: DetectedStack,
): string {
  const primaryPackage =
    projectContext?.packages.find(
      (pkg) => pkg.path === "." || pkg.path === "apps/cli" || pkg.path === "apps/web",
    ) ?? projectContext?.packages[0];

  const projectName =
    primaryPackage?.name ??
    projectContext?.packages[0]?.name ??
    rootPath.split("/").filter(Boolean).slice(-1)[0] ??
    "Project";

  const description =
    primaryPackage?.description ??
    "Production-grade developer documentation powered by DXGen.";

  const stackInfo = stack
    ? `- **Detected Stack**: ${stack.language}${stack.framework ? ` + ${stack.framework}` : ""}${stack.notes ? ` (${stack.notes})` : ""}`
    : "";

  return [
    "## PROJECT METADATA",
    "",
    `- **Project Name**: ${projectName}`,
    `- **Root Path**: ${rootPath}`,
    `- **Output Directory**: ${outputDir}`,
    `- **Requested Style**: ${style || "Professional technical documentation optimized for developer onboarding"}`,
    stackInfo,
    `- **Primary Description**: ${description}`,
    "",
  ].filter(Boolean).join("\n");
}

function buildPackageScriptsContext(projectContext: ProjectContext | undefined): string {
  if (!projectContext?.packages.length) {
    return "## AVAILABLE SCRIPTS\n\n_No scripts detected. Infer common workflows from context._\n";
  }

  const rows: string[] = ["## AVAILABLE SCRIPTS", ""];

  for (const pkg of projectContext.packages) {
    if (!pkg.scripts || Object.keys(pkg.scripts).length === 0) continue;

    rows.push(`### Package: \`${pkg.name ?? pkg.path}\``, "");
    rows.push("| Command | Script |");
    rows.push("|---------|--------|");

    for (const [name, cmd] of Object.entries(pkg.scripts)) {
      rows.push(`| \`npm run ${name}\` | \`${cmd}\` |`);
    }

    rows.push("");
  }

  if (rows.length === 2) {
    return "## AVAILABLE SCRIPTS\n\n_No scripts found in package.json files._\n";
  }

  return rows.join("\n");
}

/**
 * Convert ProjectContext.structure tree to human-readable format.
 * This provides the LLM with the EXACT directory structure.
 * 
 * Strategy:
 * - Show full depth for important directories (apps/, packages/, src/)
 * - Limit files shown at root level (only important config files)
 * - Show structure up to 4 levels deep for clarity
 * - Add descriptions from package.json or common directory purposes
 */
function serializeStructureTree(
  nodes: ProjectStructureNode[],
  projectContext: ProjectContext | undefined,
  indent = "",
  currentDepth = 0,
  maxDisplayDepth = 4,
): string {
  if (currentDepth >= maxDisplayDepth) return "";

  const lines: string[] = [];

  // Important directories that should always be fully expanded
  const IMPORTANT_DIRS = [
    // Monorepo & workspace
    "apps", "packages", "libs", "modules",
    // Source code
    "src", "lib", "core", "shared", "common",
    // Frontend
    "components", "pages", "views", "screens", "layouts", "hooks", "contexts", "store", "styles", "assets", "public", "static",
    // Backend
    "api", "routes", "controllers", "models", "services", "middleware", "handlers", "resolvers", "schemas",
    // Database & data
    "database", "db", "migrations", "seeds", "queries",
    // Testing
    "tests", "test", "__tests__", "spec", "e2e", "cypress", "playwright",
    // Configuration & tooling
    "config", "configs", "scripts", "tools", "build", "dist", "out",
    // Documentation
    "docs", "documentation",
    // Go-specific
    "cmd", "pkg", "internal",
    // Python-specific
    "app", "main", "utils",
    // Types
    "types", "typings", "@types",
  ];
  
  // Important files to show (config files at various levels)
  const IMPORTANT_FILES = [
    // Package managers (JS/TS)
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
    // TypeScript
    "tsconfig.json", "tsconfig.base.json", "tsconfig.build.json",
    // Build tools & bundlers
    "turbo.json", "nx.json", "next.config.js", "next.config.ts", "next.config.mjs",
    "vite.config.js", "vite.config.ts", "webpack.config.js", "rollup.config.js",
    "esbuild.config.js", "tsup.config.ts",
    // Styling
    "tailwind.config.js", "tailwind.config.ts", "postcss.config.js", "postcss.config.mjs",
    // Linting & formatting
    ".eslintrc", ".eslintrc.js", ".eslintrc.json", ".prettierrc", ".prettierrc.json",
    "biome.json", ".editorconfig",
    // Testing
    "jest.config.js", "jest.config.ts", "vitest.config.ts", "cypress.config.js", "playwright.config.ts",
    // Python
    "requirements.txt", "setup.py", "pyproject.toml", "Pipfile", "Pipfile.lock", "poetry.lock",
    "pytest.ini", "tox.ini", "setup.cfg",
    // Go
    "go.mod", "go.sum", "Makefile",
    // Rust
    "Cargo.toml", "Cargo.lock", "rust-toolchain", "rust-toolchain.toml",
    // Ruby
    "Gemfile", "Gemfile.lock", "Rakefile",
    // PHP
    "composer.json", "composer.lock",
    // Java/Kotlin
    "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle",
    // Docker & containerization
    "Dockerfile", "docker-compose.yml", "docker-compose.yaml", ".dockerignore",
    // Environment & secrets
    ".env", ".env.example", ".env.local", ".env.development", ".env.production",
    // Git & version control
    ".gitignore", ".gitattributes",
    // CI/CD
    ".gitlab-ci.yml", ".travis.yml", "Jenkinsfile", "azure-pipelines.yml",
    // Documentation
    "README.md", "CHANGELOG.md", "CONTRIBUTING.md", "LICENSE", "LICENSE.md",
    // Miscellaneous
    "Procfile", "vercel.json", "netlify.toml", ".nvmrc", ".node-version",
  ];
  
  // Helper to get description for a directory/file
  const getDescription = (node: ProjectStructureNode): string => {
    // Try to find package.json description for this path
    if (projectContext?.packages) {
      const pkg = projectContext.packages.find(p => 
        node.path === p.path || node.path.startsWith(p.path + "/")
      );
      if (pkg?.description) {
        return `# ${pkg.description}`;
      }
    }
    
    // Common directory descriptions
    const dirDescriptions: Record<string, string> = {
      "apps": "# Application packages",
      "packages": "# Shared packages/libraries",
      "libs": "# Shared libraries",
      "src": "# Source code",
      "lib": "# Library code",
      "components": "# React/UI components",
      "pages": "# Page components",
      "api": "# API routes/endpoints",
      "routes": "# Application routes",
      "services": "# Business logic services",
      "utils": "# Utility functions",
      "hooks": "# Custom React hooks",
      "contexts": "# React contexts",
      "store": "# State management",
      "types": "# TypeScript type definitions",
      "middleware": "# Middleware functions",
      "models": "# Data models",
      "schemas": "# Data schemas",
      "controllers": "# API controllers",
      "config": "# Configuration files",
      "docs": "# Documentation",
      "tests": "# Test files",
      "e2e": "# End-to-end tests",
      "public": "# Public static assets",
      "assets": "# Static assets",
      "styles": "# Stylesheets",
    };
    
    // File descriptions
    const fileDescriptions: Record<string, string> = {
      "package.json": "# Package configuration",
      "tsconfig.json": "# TypeScript config",
      "turbo.json": "# Turborepo config",
      "next.config.ts": "# Next.js config",
      "vite.config.ts": "# Vite config",
      "tailwind.config.ts": "# Tailwind config",
      "biome.json": "# Biome config",
      ".env.example": "# Environment variables template",
    };
    
    if (node.type === "dir") {
      return dirDescriptions[node.name] || "";
    } else {
      return fileDescriptions[node.name] || "";
    }
  };
  
  // Separate directories and files
  const dirs = nodes.filter(n => n.type === "dir").sort((a, b) => {
    // Prioritize important directories
    const aImportant = IMPORTANT_DIRS.includes(a.name);
    const bImportant = IMPORTANT_DIRS.includes(b.name);
    if (aImportant && !bImportant) return -1;
    if (!aImportant && bImportant) return 1;
    return a.name.localeCompare(b.name);
  });
  
  const files = nodes.filter(n => n.type === "file");
  
  // At root level, only show important config files
  const isRootLevel = currentDepth === 0;
  const filesToShow = isRootLevel 
    ? files.filter(f => IMPORTANT_FILES.includes(f.name))
    : files.slice(0, 15); // Show up to 15 files in subdirectories

  // Process directories first (always show them)
  for (let i = 0; i < dirs.length; i++) {
    const node = dirs[i]!;
    const isLastInGroup = i === dirs.length - 1 && filesToShow.length === 0;
    const prefix = indent + (isLastInGroup ? "└── " : "├── ");
    const nextIndent = indent + (isLastInGroup ? "    " : "│   ");

    const description = getDescription(node);
    const descriptionSuffix = description ? `     ${description}` : "";
    lines.push(`${prefix}${node.name}/${descriptionSuffix}`);

    // Recursively add children (always expand if we haven't hit max depth)
    if (node.children && node.children.length > 0 && currentDepth < maxDisplayDepth - 1) {
      const childTree = serializeStructureTree(
        node.children,
        projectContext,
        nextIndent,
        currentDepth + 1,
        maxDisplayDepth,
      );
      if (childTree) {
        lines.push(childTree);
      }
    }
  }

  // Process files
  // At root level, only show important config files
  // At subdirectories, show all files (up to a reasonable limit)
  for (let i = 0; i < filesToShow.length; i++) {
    const node = filesToShow[i]!;
    const isLastNode = i === filesToShow.length - 1;
    const prefix = indent + (isLastNode ? "└── " : "├── ");
    
    const description = getDescription(node);
    const descriptionSuffix = description ? `     ${description}` : "";
    lines.push(`${prefix}${node.name}${descriptionSuffix}`);
  }

  // Add note if we skipped files
  if (files.length > filesToShow.length) {
    const skippedCount = files.length - filesToShow.length;
    const notePrefix = filesToShow.length === 0 && dirs.length > 0 ? "└── " : "├── ";
    
    // Adjust the last item's prefix if needed
    if (filesToShow.length > 0) {
      const lastIndex = lines.length - 1;
      if (lines[lastIndex]!.includes("└── ")) {
        lines[lastIndex] = lines[lastIndex]!.replace("└── ", "├── ");
      }
    }
    
    const noteText = isRootLevel 
      ? `... (${skippedCount} other config/doc files)`
      : `... (${skippedCount} more files)`;
    lines.push(`${indent}└── ${noteText}`);
  }

  return lines.join("\n");
}

/**
 * Build a formatted project structure context from the filesystem tree.
 * This is the PRIMARY source of truth for project structure!
 */
function buildProjectStructureContext(
  projectContext: ProjectContext | undefined,
): string {
  if (!projectContext?.structure.length) {
    return "## PROJECT STRUCTURE\n\n_No structure available. Infer from file paths._\n";
  }

  // Get the project name from the root path
  const projectName = projectContext.rootPath.split("/").filter(Boolean).pop() || "project";
  
  // Serialize the tree with descriptions
  const tree = serializeStructureTree(projectContext.structure, projectContext);

  return [
    "## PROJECT STRUCTURE (EXACT FILESYSTEM TREE)",
    "",
    "⚠️ **COPY THIS EXACTLY INTO THE README - INCLUDING ALL DESCRIPTIONS**",
    "",
    "**MANDATORY REQUIREMENTS**:",
    "1. Copy this tree CHARACTER-BY-CHARACTER into your README",
    "2. Include EVERY line with '# Description' - these are vital for user understanding",
    "3. Maintain ALL levels of depth shown",
    "4. Preserve the tree format (├──, │, └──) and indentation",
    "5. If a line has a comment like '# Some description', YOU MUST include it",
    "6. DO NOT remove descriptions to 'clean up' the output",
    "",
    "**THE TREE TO COPY (with descriptions)**:",
    "```",
    `${projectName}/`,
    tree,
    "```",
    "",
    "Remember: Show what's INSIDE important directories like apps/, packages/, src/, etc.",
    "If the tree above shows subdirectories (e.g., apps/cli/, packages/ai/), INCLUDE THEM!",
    "",
  ].join("\n");
}

function buildFileListContext(documents: Document[]): string {
  const paths = new Set<string>();

  documents.forEach((doc) => {
    const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
    const path =
      (typeof metadata.relativePath === "string" && metadata.relativePath) ||
      (typeof metadata.path === "string" && metadata.path) ||
      "";
    if (path) {
      paths.add(path);
    }
  });

  const sorted = Array.from(paths).sort();

  if (sorted.length === 0) {
    return "## FILE INDEX\n\n_No file paths available._\n";
  }

  return [
    "## FILE INDEX (RAG-Retrieved Files)",
    "",
    "These files were retrieved by semantic search (for content reference):",
    "",
    ...sorted.slice(0, 50).map((p) => `- \`${p}\``),
    "",
  ].join("\n");
}

/**
 * Score and select the most relevant documents for README generation.
 */
function selectReadmeDocuments(documents: Document[]): Document[] {
  if (documents.length === 0) return [];

  // Deduplicate by file path
  const byFile = new Map<string, Document>();

  for (const doc of documents) {
    const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
    const path =
      (typeof metadata.relativePath === "string" && metadata.relativePath) ||
      (typeof metadata.path === "string" && metadata.path) ||
      "";
    const key = path || `__snippet_${byFile.size}`;
    if (!byFile.has(key)) {
      byFile.set(key, doc);
    }
  }

  const uniqueDocs = Array.from(byFile.values());

  // Score documents by relevance
  uniqueDocs.sort((a, b) => {
    const scoreA = scoreDocumentForReadme(a);
    const scoreB = scoreDocumentForReadme(b);
    return scoreB - scoreA;
  });

  // Select top 30 most relevant documents
  return uniqueDocs.slice(0, 30);
}

function scoreDocumentForReadme(doc: Document): number {
  const metadata = (doc.metadata ?? {}) as Record<string, unknown>;
  const path =
    (typeof metadata.relativePath === "string" && metadata.relativePath) ||
    (typeof metadata.path === "string" && metadata.path) ||
    "";
  const lower = path.toLowerCase();
  const fileType =
    typeof metadata.fileType === "string" ? metadata.fileType : undefined;

  let score = 0;

  // High-value files for README
  if (lower.endsWith("package.json")) score += 15;
  if (lower === "package.json") score += 10;
  if (lower === "turbo.json") score += 12;
  if (lower.includes("readme")) score += 10;
  if (lower.endsWith(".md") || lower.endsWith(".mdx")) score += 6;
  if (lower.endsWith(".env.example")) score += 8;
  if (lower.endsWith("tsconfig.json")) score += 5;
  if (lower.includes("config")) score += 3;

  // Semantic file type boost
  if (fileType === "config") score += 7;
  if (fileType === "docs") score += 8;
  if (fileType === "code") score += 4;

  // Semantic score from RAG
  const semanticScore =
    typeof metadata.score === "number" ? Number(metadata.score.toFixed(2)) : 0;

  return score * 10 + semanticScore;
}

function buildCodebaseContext(documents: Document[]): string {
  if (documents.length === 0) {
    return "## CODEBASE CONTEXT\n\n_No vector-retrieved context available. Use deterministic metadata only._\n";
  }

  const selectedDocs = selectReadmeDocuments(documents);

  const context = formatContext(selectedDocs, {
    maxEntries: 30,
    maxCharsPerEntry: 2000,
  });

  return [
    "## CODEBASE CONTEXT",
    "",
    "Representative files from the project. Use these to ground all statements:",
    "",
    context,
    "",
  ].join("\n");
}

/**
 * Generate README documentation.
 * Simple, direct, and performant.
 */
export async function generateReadme(params: {
  rootPath: string;
  outputDir: string;
  style: string;
  documents: Document[];
  stack?: DetectedStack;
  projectContext?: ProjectContext;
}): Promise<GenerateResult> {
  const { rootPath, outputDir, style, documents, stack, projectContext } = params;

  console.log("\n📘 Generating README documentation...");
  console.log(`  Documents: ${documents.length}`);
  console.log(`  Selected: ${selectReadmeDocuments(documents).length}`);
  console.log(`  Packages: ${projectContext?.packages.length ?? 0}`);

  // Build comprehensive context for LLM
  const contextSections = [
    buildProjectMetadataContext(projectContext, rootPath, outputDir, style, stack),
    buildProjectStructureContext(projectContext), // ← PRIMARY source of structure truth!
    buildFileListContext(documents),
    buildPackageScriptsContext(projectContext),
    buildCodebaseContext(documents),
  ];

  const contextPrompt = contextSections.join("\n---\n\n");

  const prompt = [
    new SystemMessage(README_SYSTEM_PROMPT),
    new SystemMessage(contextPrompt),
    new HumanMessage(
      "Generate a production-ready README.md for this project, following the system instructions and using only information grounded in the project metadata and codebase context.",
    ),
  ];

  try {
    const response = await invokeLLM({
      prompt,
      maxContextTokens: 50_000,
    });

    const content = extractContent(response);

    if (content.trim().length === 0) {
      throw new Error("Empty LLM response");
    }

    return {
      kind: "readme",
      suggestedPath: "README.md",
      content,
    };
  } catch (error) {
    const errorMsg = (error as Error).message;

    return {
      kind: "readme",
      suggestedPath: "README.md",
      content: `# README Generation Failed\n\nFailed to generate README: ${errorMsg}\n\nStyle: ${style}\nOutput dir: ${outputDir}\n`,
    };
  }
}

