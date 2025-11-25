import { runGenerateGraph } from "@dxgen/agent-graph";
import { Command } from "commander";
import { mapGenerateAnswersToRequest } from "../mappers/generateRequest.mappers";
import { getGenerateAnswers } from "../prompts/generate.prompts";

export const generateCommand = new Command("generate").description(
  "Generate documentation for a project",
);

generateCommand.action(async () => {
  if (!process.stdin.isTTY) {
    console.error("Error: This command requires an interactive terminal.");
    console.error(
      "Please execute the command directly in the terminal, not through pipes or redirection.",
    );
    process.exit(1);
  }

  const answers = await getGenerateAnswers();

  if (!answers) {
    console.log("No answer received.");
    return;
  }

  const request = mapGenerateAnswersToRequest(answers);

  const result = await runGenerateGraph(request);

  // Por enquanto apenas mostra o resultado no terminal.
  // Falta integrar com o package `writers` para salvar em arquivos.
  console.log("\nGenerated documentation kind:", result.kind);
  console.log("Suggested path:", result.suggestedPath);
  console.log("\n----- Generated content (preview) -----\n");
  console.log(result.content);
});
