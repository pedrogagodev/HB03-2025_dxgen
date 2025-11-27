import { runGenerateCommand } from "@repo/ai";
import { buildRagQuery, runRagPipeline } from "@repo/rag";
import type { User } from "@supabase/supabase-js";
import { Command } from "commander";
import { checkUsageLimits, incrementUsage } from "../lib/usage";
import { mapGenerateAnswersToRequest } from "../mappers/generateRequest.mappers";
import { getGenerateAnswers } from "../prompts/generate.prompts";


export const generateCommand = new Command("generate").description(
  "Generate documentation for a project",
);

generateCommand.action(async (_options, command) => {
  const user = command.getOptionValue("__authenticatedUser") as User;

  if (!user) {
    console.error("\n❌ Authentication required");
    console.error("Run: dxgen login\n");
    process.exit(1);
  }

  if (!process.stdin.isTTY) {
    console.error("Error: This command requires an interactive terminal.");
    console.error(
      "Please execute the command directly in the terminal, not through pipes or redirection.",
    );
    process.exit(1);
  }

  try {
    const usageStatus = await checkUsageLimits(user.id);

    if (!usageStatus.can_generate) {
      console.error("\n❌ Monthly limit reached!");
      console.error(
        `\nUsage: ${usageStatus.docs_used}/${usageStatus.limit_value} docs this month`,
      );
      console.error(`Resets in: ${usageStatus.days_until_reset} days\n`);
      console.error("🚀 Upgrade to Pro for 500 docs/month");
      console.error("   Visit: https://dxgen.io/pricing\n");
      process.exit(1);
    }
  } catch (error) {
    const errorMsg = (error as Error).message;

    if (errorMsg === "PROFILE_NOT_FOUND") {
      console.error("\n⚠️  User profile not found");
      console.error("\nPlease logout and login again:");
      console.error("  dxgen logout && dxgen login\n");
      process.exit(1);
    }

    console.error("\n❌ Failed to check usage limits");
    console.error(`Error: ${errorMsg}\n`);
    process.exit(1);
  }

  const answers = await getGenerateAnswers();

  if (!answers) {
    console.log("No answer received.");
    return;
  }

  const request = mapGenerateAnswersToRequest(answers);
  console.log({ request });

  // Run the pipeline
  const queryToFindRelevantFiles = buildRagQuery(request);

  const { documents, syncSummary } = await runRagPipeline({
    rootDir: process.cwd(),
    query: queryToFindRelevantFiles,
    pinecone: {
      index: "dxgen-docs",
      apiKey: process.env.PINECONE_API_KEY,
    },
    context: {
      userId: user.id,
      projectId: request.project.rootPath,
    },
    sync: {
      enabled: request.wizard.sync,
      fullReindex: request.wizard.sync,
    },
    retrieverOptions: {
      topK: 20,
    },
  });

  console.log({ queryToFindRelevantFiles });

  console.log("documents: ", JSON.stringify(documents, null, 2));
  console.log({ syncSummary });

  const result = await runGenerateCommand(request); // langchain.llm

  if (!result) {
    console.log("No documentation was generated.");
    return;
  }

  // Por enquanto apenas mostra o(s) resultado(s) no terminal.
  // Falta integrar com o package `writers` para salvar em arquivos.
  console.log("\nGenerated documentation kind:", result.kind);
  console.log("Suggested path:", result.suggestedPath);
  console.log("\n----- Generated content (preview) -----\n");
  console.log(result.content);
  console.log("\n========================================\n");

  try {
    const usageResult = await incrementUsage(user.id);

    console.log("\n📊 Usage Statistics:");
    console.log(
      `  Docs generated: ${usageResult.new_count}/${usageResult.limit_value} this month`,
    );

    if (usageResult.limit_reached) {
      console.log("\n⚠️  You've reached your monthly limit!");
      console.log("🚀 Upgrade to Pro: https://dxgen.io/pricing\n");
    } else {
      const remaining = usageResult.limit_value - usageResult.new_count;
      console.log(`  Remaining: ${remaining} docs`);

      if (remaining <= 5) {
        console.log("\n💡 Running low! Consider upgrading to Pro.");
      }
    }
  } catch (error) {
    console.warn("\n⚠️  Warning: Could not update usage counter");
    console.warn("Your documentation was generated successfully.");
    console.warn(`Error: ${(error as Error).message}\n`);
  }
});
