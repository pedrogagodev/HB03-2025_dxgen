import { readFile } from "node:fs/promises";
import path from "node:path";

import { scanProjectFiles } from "@repo/rag";

import type {
  DetectedStack,
  ProjectConfigFile,
  ProjectContext,
  ProjectDocFile,
  ProjectEnvExampleFile,
  ProjectPackage,
  ProjectStructureNode,
} from "../types";

const isReadmePath = (relativePath: string): boolean => {
  const lower = relativePath.toLowerCase();
  return (
    lower === "readme.md" ||
    lower.endsWith("/readme.md") ||
    lower.startsWith("docs/") ||
    lower.includes("/docs/")
  );
};

const isCiConfigPath = (relativePath: string): boolean => {
  const lower = relativePath.toLowerCase();
  return (
    lower.startsWith(".github/workflows/") ||
    lower.startsWith(".gitlab-ci") ||
    lower.endsWith("/docker-compose.yml") ||
    lower.endsWith("/docker-compose.yaml")
  );
};

const isTurboConfigPath = (relativePath: string): boolean =>
  relativePath === "turbo.json";

const isTsconfigPath = (relativePath: string): boolean =>
  /^tsconfig.*\.json$/i.test(path.basename(relativePath));

const isEnvExamplePath = (relativePath: string): boolean =>
  path.basename(relativePath) === ".env.example";

const buildStructureTree = (
  relativePaths: string[],
  maxDepth: number,
): ProjectStructureNode[] => {
  const root: Record<string, ProjectStructureNode> = {};

  for (const rel of relativePaths) {
    const parts = rel.split("/").filter(Boolean);
    let currentLevel = root;
    let accumulatedPath = "";

    for (let i = 0; i < parts.length && i < maxDepth; i++) {
      const part = parts[i]!;
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;

      if (!currentLevel[part]) {
        const isLeafFile = i === parts.length - 1;
        currentLevel[part] = {
          name: part,
          path: accumulatedPath,
          type: isLeafFile ? "file" : "dir",
          children: isLeafFile ? undefined : [],
        };
      }

      const node = currentLevel[part]!;
      if (node.type === "dir" && !node.children) {
        node.children = [];
      }

      if (node.children && i < maxDepth - 1) {
        // eslint-disable-next-line no-param-reassign
        currentLevel = node.children.reduce<
          Record<string, ProjectStructureNode>
        >((acc, child) => {
          acc[child.name] = child;
          return acc;
        }, {});
      } else {
        break;
      }
    }
  }

  const mapToArray = (
    nodes: Record<string, ProjectStructureNode>,
  ): ProjectStructureNode[] =>
    Object.values(nodes).map((node) => {
      if (node.children && node.children.length > 0) {
        const childMap: Record<string, ProjectStructureNode> = {};
        node.children.forEach((child) => {
          childMap[child.name] = child;
        });
        return {
          ...node,
          children: mapToArray(childMap),
        };
      }
      return node;
    });

  return mapToArray(root);
};

const buildPackages = async (
  rootPath: string,
  packageJsonPaths: string[],
): Promise<ProjectPackage[]> => {
  const packages: ProjectPackage[] = [];

  for (const relPath of packageJsonPaths) {
    try {
      const fullPath = path.join(rootPath, relPath);
      const raw = await readFile(fullPath, "utf8");
      const json = JSON.parse(raw) as {
        name?: string;
        description?: string;
        private?: boolean;
        scripts?: Record<string, string>;
        workspaces?: string[] | Record<string, string[]>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        bin?: string | Record<string, string>;
      };

      packages.push({
        path: relPath === "package.json" ? "." : path.dirname(relPath),
        name: json.name,
        description: json.description,
        private: json.private,
        scripts: json.scripts,
        workspaces: json.workspaces,
        dependencies: json.dependencies,
        devDependencies: json.devDependencies,
        bin: json.bin,
      });
    } catch {}
  }

  return packages;
};

export interface BuildProjectContextOptions {
  /** Optional pre-detected stack information to attach to the context */
  stack?: DetectedStack;
  /** Maximum depth for the structure tree (default: 3) */
  maxStructureDepth?: number;
  /**
   * Extra glob patterns (relative to root) to exclude when scanning for
   * metadata/config/docs. DEFAULT_EXCLUDES from @repo/rag still apply.
   */
  excludeGlobs?: string[];
}

/**
 * Build a deterministic, high-level ProjectContext for a given repo root.
 * This uses direct filesystem inspection (via @repo/rag scanProjectFiles)
 * and does not depend on vector search, making it stable and explainable.
 */
export async function buildProjectContext(
  rootPath: string,
  options: BuildProjectContextOptions = {},
): Promise<ProjectContext> {
  const maxStructureDepth = options.maxStructureDepth ?? 3;

  const scanResult = await scanProjectFiles({
    rootDir: rootPath,
    // Reuse RAG defaults, letting @repo/rag decide sensible includes.
    includeExtensions: undefined,
    excludeGlobs: options.excludeGlobs,
  });

  const relativePaths = scanResult.files.map((f) => f.relativePath);

  const packageJsonPaths = relativePaths.filter((p) =>
    p.endsWith("package.json"),
  );

  const turboPath = relativePaths.find(isTurboConfigPath);
  const tsconfigPaths = relativePaths.filter(isTsconfigPath);
  const envExamplePath = relativePaths.find(isEnvExamplePath);
  const ciConfigPaths = relativePaths.filter(isCiConfigPath);

  const readmePaths = relativePaths.filter(isReadmePath);

  const packages = await buildPackages(rootPath, packageJsonPaths);

  const loadConfigFile = async (
    rel: string | undefined,
  ): Promise<ProjectConfigFile | undefined> => {
    if (!rel) return undefined;
    const fullPath = path.join(rootPath, rel);
    const content = await readFile(fullPath, "utf8");
    return { path: rel, content };
  };

  const loadEnvExample = async (
    rel: string | undefined,
  ): Promise<ProjectEnvExampleFile | undefined> => {
    if (!rel) return undefined;
    const fullPath = path.join(rootPath, rel);
    const content = await readFile(fullPath, "utf8");
    return { path: rel, content };
  };

  const loadDocs = async (paths: string[]): Promise<ProjectDocFile[]> => {
    const docs: ProjectDocFile[] = [];
    for (const rel of paths) {
      try {
        const fullPath = path.join(rootPath, rel);
        const content = await readFile(fullPath, "utf8");
        docs.push({ path: rel, content });
      } catch {}
    }
    return docs;
  };

  const turbo = await loadConfigFile(turboPath);

  const tsconfigs: ProjectConfigFile[] = [];
  for (const rel of tsconfigPaths) {
    const cfg = await loadConfigFile(rel);
    if (cfg) tsconfigs.push(cfg);
  }

  const envExample = await loadEnvExample(envExamplePath);

  const ciConfigs: ProjectConfigFile[] = [];
  for (const rel of ciConfigPaths) {
    const cfg = await loadConfigFile(rel);
    if (cfg) ciConfigs.push(cfg);
  }

  const knownConfigSet = new Set<string>(
    [...tsconfigPaths, turboPath, envExamplePath, ...ciConfigPaths].filter(
      (p): p is string => Boolean(p),
    ),
  );

  const otherConfigs: ProjectConfigFile[] = [];
  for (const rel of relativePaths) {
    const lower = rel.toLowerCase();
    const isJsonOrYaml =
      lower.endsWith(".json") ||
      lower.endsWith(".yml") ||
      lower.endsWith(".yaml");
    if (!isJsonOrYaml) continue;
    if (knownConfigSet.has(rel)) continue;
    if (rel.endsWith("package.json")) continue;

    try {
      const fullPath = path.join(rootPath, rel);
      const content = await readFile(fullPath, "utf8");
      otherConfigs.push({ path: rel, content });
    } catch {}
  }

  const existingDocs = await loadDocs(readmePaths);

  const structure = buildStructureTree(relativePaths, maxStructureDepth);

  const context: ProjectContext = {
    rootPath,
    packages,
    configFiles: {
      turbo,
      tsconfigs,
      envExample,
      ciConfigs,
      otherConfigs,
    },
    structure,
    existingDocs,
    stack: options.stack,
  };

  return context;
}
