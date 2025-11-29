import {
  createPromptFileExistsHandler,
  detectStack,
  runGenerateCommand,
  writeDocumentationFile,
} from "@repo/ai";
import { buildRagQuery, runRagPipeline } from "@repo/rag";
import type { User } from "@supabase/supabase-js";
import { Box, render, Text } from "ink";
import React from "react";
import { GenerateApp } from "../components/GenerateApp";
import { InfoBox } from "../components/InfoBox";
import { SpinnerComponent } from "../components/Spinner";
import { requireAuth } from "../lib/auth";
import { checkUsageLimits, incrementUsage } from "../lib/usage";
import { mapGenerateAnswersToRequest } from "../mappers/generateRequest.mappers";
import { getGenerateAnswers } from "../prompts/generate.prompts";
import type { Stage } from "../types/progress.types";

export async function handleGenerate(): Promise<void> {
  // Show loading spinner during auth and setup
  const loadingInstance = render(
    <Box>
      <SpinnerComponent label="Initializing..." type="dots" />
    </Box>,
  );

  let user: User;

  try {
    user = await requireAuth();
  } catch (_error) {
    loadingInstance.unmount();
    render(
      <InfoBox type="error" title="Authentication Required">
        <Text>Run "dxgen login" to authenticate</Text>
      </InfoBox>,
    );
    process.exit(1);
  }

  if (!process.stdin.isTTY) {
    loadingInstance.unmount();
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
      loadingInstance.unmount();
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
    loadingInstance.unmount();
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

  // Unmount loading spinner before showing prompts
  loadingInstance.unmount();

  const answers = await getGenerateAnswers();

  if (!answers) {
    console.log("No answer received.");
    process.exit(0);
  }

  const request = mapGenerateAnswersToRequest(answers);

  // Create callbacks for UI updates
  let updateStage:
    | ((stageId: string, updates: Partial<Stage>) => void)
    | undefined;
  let addGeneratedFile: ((filePath: string) => void) | undefined;
  let completeGeneration: (() => void) | undefined;
  let setError: ((error: string) => void) | undefined;

  // Start the Ink app AFTER collecting input
  const { waitUntilExit } = render(
    React.createElement(GenerateApp, {
      onProgressInit: (callbacks) => {
        updateStage = callbacks.updateStage;
        addGeneratedFile = callbacks.addGeneratedFile;
        completeGeneration = callbacks.completeGeneration;
      },
      onError: (callback) => {
        setError = callback;
      },
    }),
  );

  // Give UI time to initialize
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    // Stage 1: Detecting stack - start
    updateStage?.("detecting-stack", { status: "in_progress" });

    // Stage 2: Building query and running pipeline
    updateStage?.("indexing", {
      status: "in_progress",
    });

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
        topK: 50,
      },
    });

    // Detect stack from documents
    const stackInfo = await detectStack(documents);
    const stackParts: string[] = [];

    if (stackInfo.language && stackInfo.language !== "other") {
      stackParts.push(stackInfo.language.toUpperCase());
    }

    if (stackInfo.framework) {
      const frameworks = Array.isArray(stackInfo.framework)
        ? stackInfo.framework
        : [stackInfo.framework];
      stackParts.push(...frameworks);
    }

    // Complete detecting stack with detected info
    updateStage?.("detecting-stack", {
      status: "completed",
      details: stackParts.length > 0 ? stackParts.join(" + ") : undefined,
    });

    // Complete indexing with file count (using upsertedCount as proxy)
    const fileCount = syncSummary?.upsertedCount || 0;
    updateStage?.("indexing", {
      status: "completed",
      details: `${fileCount} files`,
    });

    // Stage 3: Understanding architecture (no details)
    updateStage?.("understanding", {
      status: "in_progress",
    });

    updateStage?.("understanding", {
      status: "completed",
    });

    // Stage 4: Generating documentation
    updateStage?.("generating", {
      status: "in_progress",
    });

    const result = await runGenerateCommand(request, { documents });

    if (!result) {
      setError?.("No documentation was generated");
      await waitUntilExit();
      process.exit(0);
    }

    // Writing file
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

    // Add generated file to list
    addGeneratedFile?.(writeResult.filePath);

    // Updating usage (silently, don't show in UI)
    try {
      await incrementUsage(user.id);
    } catch (error) {
      // Continue even if usage update fails
      console.warn("\n⚠️  Warning: Could not update usage counter");
      console.warn(`Error: ${(error as Error).message}`);
    }

    // Complete generating stage
    updateStage?.("generating", {
      status: "completed",
    });

    // Mark generation as complete
    completeGeneration?.();

    await waitUntilExit();
    process.exit(0);
  } catch (error) {
    setError?.((error as Error).message);
    await waitUntilExit();
    process.exit(1);
  }
}
