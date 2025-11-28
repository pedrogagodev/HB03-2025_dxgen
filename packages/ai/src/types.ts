import type { Document } from "@langchain/core/documents";
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

export interface AgentOptions {
  documents?: Document[];
  stack?: DetectedStack;
}

export interface InvokeOptions {
  prompt: BaseMessage[];
  context?: string;
  maxContextTokens?: number;
}

export interface FormatContextOptions {
  maxEntries?: number;
  maxCharsPerEntry?: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
