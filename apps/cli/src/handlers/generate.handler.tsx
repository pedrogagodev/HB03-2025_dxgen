import {
  createPromptFileExistsHandler,
  runGenerateCommand,
  writeDocumentationFile,
} from "@repo/ai";
import { buildRagQuery, runRagPipeline } from "@repo/rag";
import type { User } from "@supabase/supabase-js";
import { Box, render, Text } from "ink";
import React from "react";
import { GenerateApp, type GenerateStage } from "../components/GenerateApp";
import { InfoBox } from "../components/InfoBox";
import { requireAuth } from "../lib/auth";
import { checkUsageLimits, incrementUsage } from "../lib/usage";
import { mapGenerateAnswersToRequest } from "../mappers/generateRequest.mappers";
import { getGenerateAnswers } from "../prompts/generate.prompts";

export async function handleGenerate(): Promise<void> {
  let user: User;

  try {
    user = await requireAuth();
  } catch (_error) {
    render(
      <InfoBox type="error" title="Authentication Required">
        <Text>Run "dxgen login" to authenticate</Text>
      </InfoBox>,
    );
    process.exit(1);
  }

  if (!process.stdin.isTTY) {
    console.error("Error: This command requires an interactive terminal.");
    console.error(
      "Please execute the command directly in the terminal, not through pipes or redirection.",
    );
    process.exit(1);
  }

  // Check usage limits before starting UI
  try {
    const usageStatus = await checkUsageLimits(user.id);

    if (!usageStatus.can_generate) {
      render(
        <InfoBox type="error" title="Monthly Limit Reached">
          <Box flexDirection="column">
            <Text>
              {`Usage: ${usageStatus.docs_used}/${usageStatus.limit_value} docs this month`}
            </Text>
            <Text>{`Resets in: ${usageStatus.days_until_reset} days`}</Text>
            <Box marginTop={1}>
              <Text color="cyan">{"🚀 Upgrade to Pro for 500 docs/month"}</Text>
            </Box>
          </Box>
        </InfoBox>,
      );
      process.exit(1);
    }
  } catch (error) {
    const errorMsg = (error as Error).message;

    if (errorMsg === "PROFILE_NOT_FOUND") {
      render(
        <InfoBox type="error" title="User Profile Not Found">
          <Text>
            {'Please logout and login again: "dxgen logout && dxgen login"'}
          </Text>
        </InfoBox>,
      );
      process.exit(1);
    }

    render(
      <InfoBox type="error" title="Failed to Check Usage Limits">
        <Text>{errorMsg}</Text>
      </InfoBox>,
    );
    process.exit(1);
  }

  const answers = await getGenerateAnswers();

  if (!answers) {
    console.log("No answer received.");
    process.exit(0);
  }

  const request = mapGenerateAnswersToRequest(answers);

  // Create callbacks for UI updates
  let setStage: ((stage: GenerateStage) => void) | undefined;
  let setError: ((error: string) => void) | undefined;
  let setComplete:
    | ((data: {
        filePath: string;
        usage?: { current: number; limit: number; remaining: number };
      }) => void)
    | undefined;

  // Start the Ink app AFTER collecting input
  const { waitUntilExit } = render(
    React.createElement(GenerateApp, {
      onStageChange: (callback) => {
        setStage = callback;
      },
      onError: (callback) => {
        setError = callback;
      },
      onComplete: (callback) => {
        setComplete = callback;
      },
    }),
  );

  // Give UI time to initialize
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    // Stage 2: Building query
    setStage?.("building_query");
    const queryToFindRelevantFiles = buildRagQuery(request);

    // Stage 3: Running pipeline
    setStage?.("running_pipeline");
    const { documents } = await runRagPipeline({
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
        topK: 50,
      },
    });

    // Stage 4: Generating documentation
    setStage?.("generating");
    const result = await runGenerateCommand(request, { documents });

    if (!result) {
      setError?.("No documentation was generated");
      await waitUntilExit();
      process.exit(0);
    }

    // Stage 5: Writing file
    setStage?.("writing_file");
    const writeResult = await writeDocumentationFile(request, result, {
      onFileExists: await createPromptFileExistsHandler(),
    });

    if (!writeResult.success) {
      setError?.(
        `Failed to write file: ${writeResult.error}\nPath: ${writeResult.filePath}`,
      );
      await waitUntilExit();
      process.exit(1);
    }

    // Stage 6: Updating usage
    setStage?.("updating_usage");
    let usageResult: Awaited<ReturnType<typeof incrementUsage>> | undefined;
    try {
      usageResult = await incrementUsage(user.id);
    } catch (error) {
      // Continue even if usage update fails
      console.warn("\n⚠️  Warning: Could not update usage counter");
      console.warn(`Error: ${(error as Error).message}`);
    }

    // Stage 7: Complete
    setComplete?.({
      filePath: writeResult.filePath,
      usage: usageResult
        ? {
            current: usageResult.new_count,
            limit: usageResult.limit_value,
            remaining: usageResult.limit_value - usageResult.new_count,
          }
        : undefined,
    });

    await waitUntilExit();
    process.exit(0);
  } catch (error) {
    setError?.((error as Error).message);
    await waitUntilExit();
    process.exit(1);
  }
}
