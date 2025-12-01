export interface GenerateAnswers {
  outputDir: string;
  sync: boolean;
  feature: "readme" | "diagram" | "summary";
  style: string;
}
