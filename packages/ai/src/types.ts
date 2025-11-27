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
  language: "ts" | "js" | "py" | "go" | "other";
  framework?: string;
  notes?: string;
}

