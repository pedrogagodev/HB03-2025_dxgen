import prompts from "prompts";
import type { InitAnswers } from "../types/init.types";

export async function getInitAnswers(): Promise<InitAnswers | null> {
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
          type: "multiselect",
          name: "features",
          message: "What types of documentation do you want to generate?",
          choices: [
            { title: "README", value: "readme", selected: true },
            { title: "API Docs", value: "api-docs", selected: true },
            { title: "Diagrams", value: "diagram", selected: true },
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

    return answers as InitAnswers;
  } catch (error) {
    console.error("Error executing prompts:", error);
    process.exit(1);
  }
}
