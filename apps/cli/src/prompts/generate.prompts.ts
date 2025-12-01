import prompts from "prompts";
import type { GenerateAnswers } from "../types/generate.types";

export async function getGenerateAnswers(): Promise<GenerateAnswers | null> {
  try {
    const answers = await prompts(
      [
        {
          type: "text",
          name: "outputDir",
          message: "Output directory for docs:",
          initial: "./docs",
        },
        {
          type: "confirm",
          name: "sync",
          message: "Do you want to sync your project?",
          initial: true,
        },
        {
          type: "select",
          name: "feature",
          message: "What types of documentation do you want to generate?",
          choices: [
            { title: "README", value: "readme" },
            { title: "Diagrams", value: "diagram" },
            { title: "Repository Summary", value: "summary" },
          ],
        },
        {
          type: "text",
          name: "style",
          message: `Style of the documentation: Onboarding for new users, Technical documentation, Performance optimization, etc.`,
          initial: "",
        },
      ],
      {
        onCancel: () => {
          console.log("\nOperation cancelled.");
          process.exit(0);
        },
      },
    );

    if (!answers) {
      return null;
    }

    return answers as GenerateAnswers;
  } catch (error) {
    console.error("Error executing prompts:", error);
    process.exit(1);
  }
}
