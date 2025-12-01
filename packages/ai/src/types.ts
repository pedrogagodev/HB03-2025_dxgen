import type { BaseMessage } from "@langchain/core/messages";

export type WizardFeature = "readme" | "api-docs" | "diagram" | "summary";

export type DocStyle = string;

export interface WizardAnswers {
  outputDir: string;
  sync: boolean;
  feature: WizardFeature;
  style: DocStyle;
}

export interface ProjectMetadata {
  rootPath: string;
  extra?: Record<string, unknown>;
}

export interface GenerateRequest {
  wizard: WizardAnswers;
  project: ProjectMetadata;
}

export type FinalDocKind = "readme" | "api-docs" | "diagram" | "summary";

export interface GenerateResult {
  kind: FinalDocKind;
  content: string;
  suggestedPath: string;
}

export interface DetectedStack {
  language: string;
  framework?: string;
  notes?: string;
}

/**
 * High-level, deterministic view of a project's structure and metadata.
 * This is built from direct filesystem inspection and used to ground
 * documentation generation before any RAG retrieval.
 */
export interface ProjectPackage {
  path: string;
  name?: string;
  description?: string;
  private?: boolean;
  scripts?: Record<string, string>;
  workspaces?: string[] | Record<string, string[]>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  bin?: string | Record<string, string>;
}

export interface ProjectConfigFile {
  path: string;
  content: string;
}

export interface ProjectEnvExampleFile {
  path: string;
  content: string;
}

export interface ProjectDocFile {
  path: string;
  content: string;
}

export interface ProjectStructureNode {
  name: string;
  path: string;
  type: "dir" | "file";
  children?: ProjectStructureNode[];
}

export interface ProjectContext {
  rootPath: string;
  packages: ProjectPackage[];
  configFiles: {
    turbo?: ProjectConfigFile;
    tsconfigs: ProjectConfigFile[];
    envExample?: ProjectEnvExampleFile;
    ciConfigs: ProjectConfigFile[];
    otherConfigs: ProjectConfigFile[];
  };
  structure: ProjectStructureNode[];
  existingDocs: ProjectDocFile[];
  stack?: DetectedStack;
}

export interface InvokeOptions {
  prompt: BaseMessage[];
  context?: string;
  maxContextTokens?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface FormatContextOptions {
  maxEntries?: number;
  maxCharsPerEntry?: number;
}
