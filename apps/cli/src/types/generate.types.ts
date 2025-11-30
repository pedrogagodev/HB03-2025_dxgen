export interface GenerateAnswers {
  outputDir: string;
  sync: boolean;
  feature: "readme" | "api-docs" | "diagram" | "summary";
  style: string;
}
