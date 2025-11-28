import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "langchain";
import * as z from "zod";

import { formatContext, invokeLLM } from "../llm/client";
import type { DetectedStack } from "../types";
import { extractContent } from "../utils/utils";

const buildStackSummary = (stack?: DetectedStack): string => {
  if (!stack) {
    return "Stack: not detected.";
  }
  const framework = stack.framework ? `, framework=${stack.framework}` : "";
  return `Detected Stack: language=${stack.language}${framework}`;
};

const SYSTEM_PROMPT = `You are a world-class technical documentation engineer who has written README files for Fortune 500 companies, top open-source projects (React, Next.js, Prisma, tRPC), and Y Combinator startups. Your READMEs are known for being exceptionally clear, developer-friendly, and comprehensive.

## YOUR MISSION

Generate a **production-ready, industry-leading README.md** that:
- Immediately communicates project value and purpose
- Enables developers to get started in under 5 minutes
- Follows the exact structure and quality of top GitHub repositories
- Uses ONLY real data extracted from the provided codebase context

---

## ABSOLUTE RULES (VIOLATIONS WILL RESULT IN FAILURE)

### Rule 0: OUTPUT FORMAT
Your response must be PURE MARKDOWN content only.
- Do NOT wrap your response in \`\`\`markdown or \`\`\` code fences
- Do NOT start with \`\`\`markdown
- Do NOT end with \`\`\`
- Start directly with the README content (e.g., <div align="center"> or # Project Name)
- Output ONLY the raw README.md content, nothing else

### Rule 1: ZERO PLACEHOLDERS
NEVER write placeholder text such as:
- "[insert project name]", "[your-repo]", "[insert purpose]"
- "TODO: add description", "TBD", "Coming soon"
- Generic text like "This project does X" without specifics

### Rule 2: EXTRACT REAL DATA
From the codebase context, you MUST extract and use:
- **package.json**: name, description, version, scripts, dependencies, workspaces
- **Config files**: tsconfig.json, .env.example, docker-compose.yml, etc.
- **Folder structure**: Actual directories and their purposes
- **Code patterns**: Architecture decisions visible in the codebase

### Rule 3: INFER INTELLIGENTLY
When explicit data isn't available, INFER from context:
- Monorepo? → Look for workspaces, turbo.json, nx.json, lerna.json
- API project? → Look for routes, controllers, endpoints
- CLI tool? → Look for bin field, commander/yargs dependencies
- Full-stack? → Look for frontend + backend folders

---

## README STRUCTURE (FOLLOW THIS EXACT ORDER)

### 1. HEADER SECTION
\`\`\`markdown
<div align="center">
  <h1>🚀 Project Name</h1>
  <p><strong>One-line compelling description extracted from package.json or inferred</strong></p>

  <p>
    <a href="#installation"><img src="https://img.shields.io/badge/install-guide-blue?style=for-the-badge" alt="Installation" /></a>
    <a href="#quick-start"><img src="https://img.shields.io/badge/quick-start-green?style=for-the-badge" alt="Quick Start" /></a>
    <a href="#documentation"><img src="https://img.shields.io/badge/docs-orange?style=for-the-badge" alt="Documentation" /></a>
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
git clone <actual-repo-url-if-available-or-use-generic>
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
Use a tree view showing actual folders:
\`\`\`
project-name/
├── apps/                 # Application packages (if monorepo)
│   ├── web/              # Frontend application
│   └── api/              # Backend API
├── packages/             # Shared packages
│   └── ui/               # Shared UI components
├── package.json          # Root package configuration
└── turbo.json            # Turborepo configuration (if applicable)
\`\`\`

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

---

## QUALITY CHECKLIST (YOUR OUTPUT MUST PASS ALL)

✅ Project name matches package.json "name" field exactly
✅ All scripts from package.json are documented with real commands
✅ Folder structure reflects actual directories in context
✅ No placeholder text exists anywhere
✅ Installation commands use the correct package manager
✅ Quick start section gets developers running in <5 minutes
✅ Professional tone with strategic emoji usage (not excessive)
✅ Proper Markdown formatting (headers, code blocks, tables)
✅ All links are functional or marked clearly if external

---

## FINAL INSTRUCTIONS

1. **OUTPUT RAW MARKDOWN ONLY** - Do NOT wrap in \`\`\`markdown code fences. Start directly with the content.
2. Read ALL provided context files carefully
3. Extract REAL values from package.json, config files, and folder structure
4. Generate a README following the exact structure above
5. Ensure ZERO placeholders exist in your output
6. Match the quality and professionalism of the example
7. Adapt sections based on what's relevant to the specific project (skip sections that don't apply)

Now generate the README based on the codebase context provided below. Remember: output ONLY raw markdown, no code fences.`;

const buildHumanPrompt = (
  rootPath: string,
  outputDir: string,
  style: string,
  stack?: DetectedStack,
): string => {
  return [
    "## PROJECT METADATA",
    "",
    `- **Root Path**: ${rootPath}`,
    `- **Output Directory**: ${outputDir}`,
    `- **Requested Style**: ${style || "Professional technical documentation optimized for developer onboarding and comprehension"}`,
    `- ${buildStackSummary(stack)}`,
    "",
    "---",
    "",
    "## YOUR TASK",
    "",
    "Analyze the codebase context below and generate a **production-ready README.md** following the structure and quality standards from the system prompt.",
    "",
    "**Remember:**",
    "- **OUTPUT RAW MARKDOWN ONLY** - Do NOT wrap in \\`\\`\\`markdown code fences",
    "- Extract the project name, description, and scripts from package.json (or equivalent)",
    "- Document the REAL folder structure you see",
    "- Use the ACTUAL commands and configurations",
    "- NEVER use placeholder text",
    "- Adapt the template to fit this specific project's needs",
    "",
    "---",
    "",
    "## CODEBASE CONTEXT",
    "",
    "The following are actual files from the project. Use this information to populate the README:",
    "",
  ].join("\n");
};

export function createReadmeTool(documents: Document[], stack?: DetectedStack) {
  return tool(
    async ({ rootPath, outputDir, style }) => {
      const prompt = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(buildHumanPrompt(rootPath, outputDir, style, stack)),
      ];

      const context =
        documents.length > 0
          ? formatContext(documents, {
              maxEntries: 30,
              maxCharsPerEntry: 3_000,
            })
          : "";

      try {
        const response = await invokeLLM({
          prompt,
          context,
          maxContextTokens: 20_000,
        });

        const content = extractContent(response);

        if (content.trim().length === 0) {
          throw new Error("Empty LLM response");
        }

        return JSON.stringify({
          kind: "readme",
          suggestedPath: "README.md",
          content,
        });
      } catch (error) {
        const stackInfo = buildStackSummary(stack);

        return JSON.stringify({
          kind: "readme",
          suggestedPath: "README.md",
          content: `# README (fallback)\n\nNão foi possível gerar o README automaticamente (${(error as Error).message}).\n\nEstilo desejado: ${style}\nOutput dir: ${outputDir}\n${stackInfo}\n`,
        });
      }
    },
    {
      name: "generate_readme",
      description:
        "Generates a professional, production-ready README.md file for the project based on the codebase analysis. Use this tool when the user wants to create comprehensive project documentation.",
      schema: z.object({
        rootPath: z.string().describe("The root path of the project"),
        outputDir: z.string().describe("The output directory for the README"),
        style: z.string().describe("The desired documentation style"),
      }),
    },
  );
}
