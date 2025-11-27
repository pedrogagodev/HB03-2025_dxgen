import type { Document } from "@langchain/core/documents";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { formatContext, invokeLLM } from "../llm/client";
import { extractContent } from "../llm/utils";
import type { DetectedStack, GenerateRequest, GenerateResult } from "../types";

const buildStackSummary = (stack?: DetectedStack): string => {
  if (!stack) {
    return "Stack: not detected.";
  }
  const framework = stack.framework ? `, framework=${stack.framework}` : "";
  return `Stack detectada: linguagem=${stack.language}${framework}`;
};

export async function createReadme(args: {
  request: GenerateRequest;
  stack?: DetectedStack;
  documents?: Document[];
}): Promise<GenerateResult> {
  const { request, stack, documents = [] } = args;
  const { wizard } = request;

  const prompt = [
    new SystemMessage(
      [
        "You are an expert technical writer specialized in producing production-grade README files for professional software repositories. ✨",
        "Your writing must always be structured, clear, consistent, and helpful for onboarding new developers. 🧑‍💻",
        "",
        "**CRITICAL INSTRUCTIONS - READ CAREFULLY:**",
        "",
        "1. **USE REAL DATA FROM CONTEXT**: The context below contains actual files from the project. Extract and use REAL values:",
        "   - If package.json shows name='dxgen', use 'dxgen' (NOT '[insert project name]')",
        "   - If package.json shows description='AI Documentation Agent', use that exact description",
        "   - If scripts show 'dev: turbo run dev', document that exact command",
        "   - If workspaces show 'apps/*, packages/*', mention it's a monorepo with those workspaces",
        "",
        "2. **NEVER USE PLACEHOLDERS**: Do NOT write '[insert purpose]', '[your-repo]', '[insert module files]', etc.",
        "   Instead, infer from the context or write a reasonable description based on what you see.",
        "",
        "3. **EXTRACT FROM PACKAGE.JSON**: Look for the package.json file in the context and extract:",
        "   - Project name (use the 'name' field)",
        "   - Description (use the 'description' field)",
        "   - All scripts (list each script from 'scripts' object with its command)",
        "   - Dependencies (mention key ones if relevant)",
        "   - Workspaces (if present, mention monorepo structure)",
        "",
        "4. **INFER FROM CODE STRUCTURE**:",
        "   - If you see 'packages/' and 'apps/' folders, it's a monorepo",
        "   - If you see TypeScript files (.ts), mention TypeScript",
        "   - If you see specific frameworks in dependencies (React, Next.js, etc.), mention them",
        "",
        "5. **ONLY USE TODO WHEN ABSOLUTELY NECESSARY**: Only add TODO if information is completely missing and cannot be inferred.",
        "",
        "Your README files must ALWAYS include, when applicable:",
        "1. 📌 **Project Overview** – Use the real project name and description from package.json. Describe what the project does based on the codebase.",
        "2. 🏗️ **Architecture Summary** – Describe the actual tech stack you see (TypeScript, monorepo structure, etc.).",
        "3. 🚀 **Setup & Installation Instructions** – Use real commands or instructions from the codebase context to setup and install the project.",
        "4. 🧪 **Available Scripts / Commands** – List ALL scripts from package.json with their actual commands. Use the real commands from the codebase context.",
        "5. ⚙️ **Configuration Guide** – Mention actual config files you see and environment variables you see. Use the real values from the codebase context.",
        "6. 📂 **Project Structure** – Show the actual folder structure based on what's in the context. Use a tree view to show the structure.",
        "7. 🤝 **Contribution Guidelines** – Standard contribution workflow.",
        "",
        "Write everything using clean Markdown syntax, well-organized sections, and with a friendly but still professional tone.",
        "Use emojis sparingly but strategically to improve readability. Do NOT overuse them.",
      ].join(" "),
    ),
    new HumanMessage(
      [
        `Project root: ${request.project.rootPath}`,
        `Output directory: ${wizard.outputDir}`,
        `Desired style: ${wizard.style || "Technical documentation for developers onboarding to the repository so they can EXACTLY understand the project and how to contribute to it."}`,
        buildStackSummary(stack),
        "",
        "**IMPORTANT**: The context below contains REAL project files. Extract and use the ACTUAL values:",
        "- Find files like package.json or similar for other languages and use its 'name', 'description', and 'scripts' fields",
        "- Use real folder names and structure you see in the codebase context",
        "- Use real commands and configurations",
        "- Do NOT write placeholder text like '[insert...]' or '[your-repo]'",
        "",
        "Generate a comprehensive README using ONLY real information from the context below.",
      ].join("\n"),
    ),
  ];

  const context =
    documents.length > 0
      ? formatContext(documents, { maxEntries: 12, maxCharsPerEntry: 1_500 })
      : "";

  try {
    const response = await invokeLLM({
      prompt,
      context,
      maxContextTokens: 8_000,
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
    const stackInfo = buildStackSummary(stack);

    return {
      kind: "readme",
      suggestedPath: "README.md",
      content: `# README (fallback)\n\nNão foi possível gerar o README automaticamente (${(error as Error).message}).\n\nEstilo desejado: ${wizard.style}\nOutput dir: ${wizard.outputDir}\n${stackInfo}\n`,
    };
  }
}
