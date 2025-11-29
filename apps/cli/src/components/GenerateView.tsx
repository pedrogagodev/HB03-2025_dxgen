import { Box, Text, useApp } from "ink";
import React, { useEffect } from "react";
import type { ProgressState } from "../types/progress.types";
import { CompletionSummary } from "./CompletionSummary";
import { FileList } from "./FileList";
import { InfoBox } from "./InfoBox";
import { ProgressStages } from "./ProgressStages";

interface GenerateViewProps {
  progressState: ProgressState;
  error?: string;
  isComplete: boolean;
}

export const GenerateView = ({
  progressState,
  error,
  isComplete,
}: GenerateViewProps) => {
  const { exit } = useApp();

  // Exit Ink when generation is complete or errored
  useEffect(() => {
    if (isComplete || error) {
      // Give user time to read the final message
      const timer = setTimeout(() => {
        exit();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isComplete, error, exit]);

  if (error) {
    return (
      <Box flexDirection="column">
        <InfoBox type="error" title="Generation Failed">
          <Text>{error}</Text>
        </InfoBox>
      </Box>
    );
  }

  if (isComplete) {
    return (
      <Box flexDirection="column">
        <ProgressStages stages={progressState.stages} />
        <Box marginY={1}>
          <FileList files={progressState.generatedFiles} />
        </Box>
        <CompletionSummary
          duration={progressState.endTime! - progressState.startTime}
          fileCount={progressState.generatedFiles.length}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <ProgressStages stages={progressState.stages} />
    </Box>
  );
};
