import { Command } from "commander";
import { getInitAnswers } from "../prompts/init.prompts";

export const initCommand = new Command("init").description(
  "Initialize a new project",
);

initCommand.action(async () => {
  if (!process.stdin.isTTY) {
    console.error("Error: This command requires an interactive terminal.");
    console.error(
      "Please execute the command directly in the terminal, not through pipes or redirection.",
    );
    process.exit(1);
  }

  const answers = await getInitAnswers();

  if (!answers) {
    console.log("No answer received.");
    return;
  }

  console.log(answers);
});
