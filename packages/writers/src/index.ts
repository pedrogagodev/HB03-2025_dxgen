import { promises as fs } from "node:fs";
import path from "node:path";
import type { GenerateRequest, GenerateResult } from "@repo/ai";

export interface WriteFileOptions {
  /**
   * Se true, sobrescreve arquivos existentes sem perguntar
   * Se false, pergunta ao usuário antes de sobrescrever
   */
  overwrite?: boolean;

  /**
   * Callback para perguntar ao usuário se deve sobrescrever um arquivo existente
   * Retorna true para sobrescrever, false para cancelar
   */
  onFileExists?: (filePath: string) => Promise<boolean>;
}

export interface WriteResult {
  success: boolean;
  filePath: string;
  error?: string;
}

/**
 * Resolve o caminho final do arquivo combinando outputDir e suggestedPath
 */
export function resolveFilePath(
  request: GenerateRequest,
  result: GenerateResult,
): string {
  const { outputDir } = request.wizard;
  const { suggestedPath } = result;

  // Se o suggestedPath já é absoluto, use-o diretamente
  if (path.isAbsolute(suggestedPath)) {
    return suggestedPath;
  }

  // Se o suggestedPath começa com "./" ou é relativo, combine com outputDir
  const normalizedOutputDir = path.isAbsolute(outputDir)
    ? outputDir
    : path.resolve(request.project.rootPath, outputDir);

  // Se o suggestedPath já inclui o outputDir, use-o diretamente
  // Caso contrário, combine-os
  if (suggestedPath.startsWith(outputDir) || suggestedPath.startsWith("./")) {
    return path.resolve(request.project.rootPath, suggestedPath);
  }

  return path.resolve(normalizedOutputDir, suggestedPath);
}

/**
 * Cria os diretórios necessários para o arquivo
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Verifica se um arquivo existe
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Escreve o conteúdo da documentação gerada em um arquivo
 */
export async function writeDocumentationFile(
  request: GenerateRequest,
  result: GenerateResult,
  options: WriteFileOptions = {},
): Promise<WriteResult> {
  try {
    const filePath = resolveFilePath(request, result);

    // Verifica se o arquivo já existe
    const exists = await fileExists(filePath);

    if (exists && !options.overwrite) {
      // Se não está em modo overwrite, pergunta ao usuário
      if (options.onFileExists) {
        const shouldOverwrite = await options.onFileExists(filePath);
        if (!shouldOverwrite) {
          return {
            success: false,
            filePath,
            error: "Operação cancelada pelo usuário",
          };
        }
      } else {
        // Se não há callback, não sobrescreve por padrão
        return {
          success: false,
          filePath,
          error:
            "Arquivo já existe. Use overwrite: true ou forneça onFileExists",
        };
      }
    }

    // Cria os diretórios necessários
    await ensureDirectoryExists(filePath);

    // Escreve o arquivo
    await fs.writeFile(filePath, result.content, "utf-8");

    return {
      success: true,
      filePath,
    };
  } catch (error) {
    return {
      success: false,
      filePath: resolveFilePath(request, result),
      error: (error as Error).message,
    };
  }
}

/**
 * Função helper para perguntar ao usuário via prompts (para uso no CLI)
 */
export async function createPromptFileExistsHandler(): Promise<
  (filePath: string) => Promise<boolean>
> {
  // Importação dinâmica para evitar dependência direta do prompts no pacote
  const prompts = await import("prompts");

  return async (filePath: string): Promise<boolean> => {
    const response = await prompts.default({
      type: "confirm",
      name: "overwrite",
      message: `O arquivo ${filePath} já existe. Deseja sobrescrever?`,
      initial: false,
    });

    return response.overwrite === true;
  };
}
