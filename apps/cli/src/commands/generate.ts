import {
  createPromptFileExistsHandler,
  runGenerateCommand,
  writeDocumentationFile,
} from "@repo/ai";
import * as Rag from "@repo/rag";
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
      console.error(`   Visit: ${process.env.FRONTEND_URL}\n`);
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

  // Get user answers for documentation generation
  const answers = await getGenerateAnswers();

  if (!answers) {
    console.log("No answer received.");
    process.exit(0);
  }

  const request = mapGenerateAnswersToRequest(answers);
  const projectRoot = process.cwd();

  console.log("\n🚀 Starting documentation generation...");
  console.log(`   Feature: ${request.wizard.feature}`);
  console.log(`   Style: ${request.wizard.style || "default"}`);
  console.log(`   Output: ${request.wizard.outputDir}\n`);

  // Build RAG query - single, focused query per feature
  const query = Rag.buildRagQuery(request);

  console.log("📡 Retrieving relevant files from codebase...");

  // Run RAG pipeline with optimized parameters
  const pipelineOptions: Rag.RagPipelineOptions = {
    rootDir: projectRoot,
    query,
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
    // Optimized retrieval parameters
    // Use more documents for README to get better structure coverage
    retrieverOptions: {
      topK: request.wizard.feature === "readme" ? 35 : 25,
    },
  };

  const { documents, syncSummary } = await Rag.runRagPipeline(pipelineOptions);

  console.log(`   Retrieved ${documents.length} relevant documents\n`);

  if (syncSummary) {
    console.log("📦 Sync Summary:");
    console.log(`   Index: ${syncSummary.index}`);
    console.log(`   Namespace: ${syncSummary.namespace}`);
    console.log(`   Upserted: ${syncSummary.upsertedCount} chunks\n`);
  }

  // Generate documentation using the streamlined pipeline
  const result = await runGenerateCommand(request, {
    documents,
  });

  if (!result) {
    console.log("No documentation was generated.");
    process.exit(0);
  }

  // Write the generated documentation to file
  const writeResult = await writeDocumentationFile(request, result, {
    onFileExists: await createPromptFileExistsHandler(),
  });

  if (!writeResult.success) {
    console.error(`\n❌ Error writing file: ${writeResult.error}`);
    console.error(`Path: ${writeResult.filePath}\n`);
    process.exit(1);
  }

  console.log(`\n✅ Documentation generated successfully!`);
  console.log(`📄 File: ${writeResult.filePath}\n`);

  // Update usage statistics
  try {
    const usageResult = await incrementUsage(user.id);

    console.log("\n📊 Usage Statistics:");
    console.log(
      `  Docs generated: ${usageResult.new_count}/${usageResult.limit_value} this month`,
    );

    if (usageResult.limit_reached) {
      console.log("\n⚠️  You've reached your monthly limit!");
      console.log(`🚀 Upgrade to Pro: ${process.env.FRONTEND_URL}\n`);
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

  process.exit(0);
});
