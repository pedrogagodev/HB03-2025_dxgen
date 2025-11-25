import fs from "node:fs/promises";
import path from "node:path";
import { RunnableLambda } from "@langchain/core/runnables";
import { initChatModel } from "langchain";
import type { FileHint, ProjectSnapshot } from "./stackDetection.types";
import type { DetectedStack, ProjectMetadata } from "./types";

async function readPackageJson(
  rootPath: string,
): Promise<Record<string, unknown> | null> {
  try {
    const pkgPath = path.join(rootPath, "package.json");
    const content = await fs.readFile(pkgPath, "utf8");
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function readTextFileSafe(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function readFirstLine(filePath: string): Promise<string | undefined> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const line = content.split(/\r?\n/, 1)[0];
    return line.slice(0, 200);
  } catch {
    return undefined;
  }
}

async function buildProjectSnapshot(
  rootPath: string,
  maxFiles = 80,
): Promise<ProjectSnapshot> {
  const files: FileHint[] = [];
  const extCounts: Record<string, number> = {};

  const manifests: ProjectSnapshot["manifests"] = {
    packageJson: await readPackageJson(rootPath),
    pyprojectToml: null,
    goMod: null,
    cargoToml: null,
  };

  const ignoreDirs = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    ".turbo",
    ".next",
    "out",
    "coverage",
  ]);

  const codeExtensions = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".go",
  ]);

  const preferredCodeDirs = ["src", "app", "pages", "api", "server"];

  const queue: string[] = [rootPath];

  while (queue.length > 0 && files.length < maxFiles) {
    const currentDir = queue.pop() as string | undefined;
    if (!currentDir) break;

    let dirEntries: Array<import("node:fs").Dirent>;
    try {
      dirEntries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of dirEntries) {
      const name = entry.name.toString();
      const fullPath = path.join(currentDir, name);
      const relPath = path.relative(rootPath, fullPath);

      if (entry.isDirectory()) {
        if (ignoreDirs.has(name) || files.length >= maxFiles) continue;

        // Damos preferência a diretórios típicos de código, colocando-os
        // no final da fila (para serem processados antes, já que usamos pop()).
        const isPreferredDir = preferredCodeDirs.includes(name);
        if (isPreferredDir) {
          queue.push(fullPath);
        } else {
          queue.unshift(fullPath);
        }
        continue;
      }

      if (!entry.isFile()) continue;

      // Manifests especiais
      if (name === "pyproject.toml" && !manifests.pyprojectToml) {
        manifests.pyprojectToml = await readTextFileSafe(fullPath);
        continue;
      }
      if (name === "go.mod" && !manifests.goMod) {
        manifests.goMod = await readTextFileSafe(fullPath);
        continue;
      }
      if (name === "Cargo.toml" && !manifests.cargoToml) {
        manifests.cargoToml = await readTextFileSafe(fullPath);
        continue;
      }

      if (files.length >= maxFiles) break;

      const ext = path.extname(name).toLowerCase();

      // Só consideramos arquivos de código principais para mandar pra LLM.
      if (!codeExtensions.has(ext)) {
        extCounts[ext] = (extCounts[ext] ?? 0) + 1;
        continue;
      }

      const firstLine = await readFirstLine(fullPath);

      files.push({
        path: relPath || name,
        ext,
        firstLine,
      });

      extCounts[ext] = (extCounts[ext] ?? 0) + 1;
    }
  }

  return {
    rootPath,
    files,
    extCounts,
    manifests,
  };
}

function cleanLLMJsonText(raw: string): string {
  let text = raw.trim();

  // Remove cercas de markdown iniciais (```json, ```).
  if (text.startsWith("```")) {
    const firstNewline = text.indexOf("\n");
    if (firstNewline !== -1) {
      text = text.slice(firstNewline + 1);
    }
  }

  // Remove cerca de markdown final.
  if (text.endsWith("```")) {
    text = text.slice(0, -3);
  }

  text = text.trim();

  // Tenta isolar apenas o trecho entre o primeiro `{` e o último `}`.
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}

function buildLLMPromptForStack(snapshot: ProjectSnapshot): string {
  const { extCounts, files, manifests } = snapshot;

  const extSummary = Object.entries(extCounts)
    .filter(([ext]) => ext)
    .sort((a, b) => b[1] - a[1])
    .map(([ext, count]) => `${ext}: ${count}`)
    .join(", ");

  const fileSamples = files
    .slice(0, 25)
    .map(
      (f) =>
        `- ${f.path} (${f.ext || "no-ext"}) -> ${f.firstLine ?? "<sem primeira linha>"}`,
    )
    .join("\n");

  const manifestParts: string[] = [];

  if (manifests.packageJson) {
    manifestParts.push(
      "package.json:",
      "```json",
      JSON.stringify(manifests.packageJson, null, 2),
      "```",
    );
  }
  if (manifests.pyprojectToml) {
    manifestParts.push(
      "pyproject.toml:",
      "```toml",
      manifests.pyprojectToml,
      "```",
    );
  }
  if (manifests.goMod) {
    manifestParts.push("go.mod:", "```", manifests.goMod, "```");
  }
  if (manifests.cargoToml) {
    manifestParts.push("Cargo.toml:", "```toml", manifests.cargoToml, "```");
  }

  return [
    "Você é um assistente que identifica a stack de um projeto a partir de um snapshot da codebase.",
    "Responda SOMENTE com um JSON válido, sem texto extra, sem markdown e sem crases, no formato exato:",
    '{ "language": "ts|js|py|go|other", "framework": "string|null", "notes": "string" }',
    "",
    "Resumo de extensões de arquivos:",
    extSummary || "<nenhuma extensão relevante encontrada>",
    "",
    "Alguns arquivos do projeto (caminho, extensão, primeira linha):",
    fileSamples || "<nenhum arquivo listado>",
    "",
    "Manifests (se existirem):",
    manifestParts.join("\n") || "<nenhum manifest encontrado>",
  ].join("\n");
}

const stackDetectorRunnable = RunnableLambda.from(
  async (snapshot: ProjectSnapshot): Promise<DetectedStack | null> => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn(
        "[dxgen][stackDetection] GOOGLE_API_KEY não configurada; não será chamada a LLM de stack.",
      );
      return null;
    }

    const rawModel = process.env.DXGEN_STACK_MODEL ?? "gemini-2.5-flash-lite";
    const modelId = rawModel.includes(":")
      ? rawModel
      : `google-genai:${rawModel}`;

    let text: string | undefined;

    try {
      console.log("[dxgen][stackDetection] Chamando modelo de stack via LLM.", {
        modelId,
        fileCount: snapshot.files.length,
      });

      const model = await initChatModel(modelId, {
        temperature: 0,
      });

      const prompt = buildLLMPromptForStack(snapshot);
      const response = (await model.invoke(prompt)) as unknown as {
        content?: unknown;
      };

      console.log(
        "[dxgen][stackDetection] Resposta bruta da LLM de stack recebida.",
        {
          hasContent: !!(response as { content?: unknown })?.content,
          responseType: typeof response,
        },
      );

      const content = (response as { content?: unknown })?.content ?? response;

      if (typeof content === "string") {
        text = content;
      } else if (Array.isArray(content)) {
        // Conteúdo em blocos (mensagens estruturadas do LangChain).
        text = (content as Array<unknown>)
          .map((block) => {
            if (typeof block === "string") return block;
            if (
              block &&
              typeof block === "object" &&
              "text" in block &&
              typeof (block as { text?: unknown }).text === "string"
            ) {
              return (block as { text: string }).text;
            }
            if (
              block &&
              typeof block === "object" &&
              "content" in block &&
              typeof (block as { content?: unknown }).content === "string"
            ) {
              return (block as { content: string }).content;
            }
            return "";
          })
          .join(" ")
          .trim();
      }
    } catch (err) {
      console.error(
        "[dxgen][stackDetection] Erro ao invocar LLM para detecção de stack.",
        err,
      );
      return null;
    }

    if (!text || typeof text !== "string") {
      return null;
    }

    try {
      const cleaned = cleanLLMJsonText(text);

      const parsed = JSON.parse(cleaned) as {
        language?: string;
        framework?: string | null;
        notes?: string;
      };

      const language: DetectedStack["language"] =
        parsed.language === "ts" ||
        parsed.language === "js" ||
        parsed.language === "py" ||
        parsed.language === "go" ||
        parsed.language === "other"
          ? parsed.language
          : "other";

      const result: DetectedStack = {
        language,
        framework: parsed.framework ?? undefined,
        notes: parsed.notes,
      };

      console.log("[dxgen][stackDetection] Stack detectada pela LLM.", result);

      return result;
    } catch (err) {
      console.error(
        "[dxgen][stackDetection] Falha ao fazer parse da resposta da LLM de stack.",
        err,
      );
      return null;
    }
  },
);

async function detectStackWithLLMFromSnapshot(
  snapshot: ProjectSnapshot,
): Promise<DetectedStack | null> {
  return stackDetectorRunnable.invoke(snapshot);
}

export async function detectStack(
  project: ProjectMetadata,
): Promise<DetectedStack> {
  const snapshot = await buildProjectSnapshot(project.rootPath);

  console.log(
    "[dxgen][stackDetection] Snapshot de projeto construído para stack.",
    {
      rootPath: project.rootPath,
      fileCount: snapshot.files.length,
      hasPackageJson: !!snapshot.manifests.packageJson,
    },
  );

  const llmResult = await detectStackWithLLMFromSnapshot(snapshot);

  if (llmResult) {
    return llmResult;
  }

  // Se a LLM não estiver configurada ou retornar um resultado inválido,
  // não aplicamos nenhuma heurística de fallback — apenas sinalizamos
  // que a detecção não foi possível.
  return {
    language: "other",
    notes:
      "Não foi possível detectar a stack via LLM (verifique GOOGLE_API_KEY/DXGEN_STACK_MODEL ou a resposta do modelo).",
  };
}
