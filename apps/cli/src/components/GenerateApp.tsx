import { Box } from "ink";
import React, { useEffect, useState } from "react";
import type { ProgressState, Stage } from "../types/progress.types";
import { initializeStages } from "../utils/stage.utils";
import { GenerateView } from "./GenerateView";

interface GenerateAppProps {
  onProgressInit: (callbacks: {
    updateStage: (stageId: string, updates: Partial<Stage>) => void;
    addGeneratedFile: (filePath: string) => void;
    completeGeneration: () => void;
  }) => void;
  onError: (callback: (error: string) => void) => void;
}

export const GenerateApp: React.FC<GenerateAppProps> = ({
  onProgressInit,
  onError,
}) => {
  const [progressState, setProgressState] = useState<ProgressState>({
    stages: initializeStages(),
    currentStageIndex: 0,
    startTime: Date.now(),
    generatedFiles: [],
  });
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    onProgressInit({
      updateStage: (stageId: string, updates: Partial<Stage>) => {
        setProgressState((prev) => {
          const newStages = prev.stages.map((stage) =>
            stage.id === stageId ? { ...stage, ...updates } : stage,
          );
          return {
            ...prev,
            stages: newStages,
          };
        });
      },
      addGeneratedFile: (filePath: string) => {
        setProgressState((prev) => ({
          ...prev,
          generatedFiles: [...prev.generatedFiles, filePath],
        }));
      },
      completeGeneration: () => {
        setProgressState((prev) => ({
          ...prev,
          endTime: Date.now(),
        }));
      },
    });
    onError(setError);
  }, [onProgressInit, onError]);

  const isComplete = progressState.endTime !== undefined;

  return (
    <Box>
      <GenerateView
        progressState={progressState}
        error={error}
        isComplete={isComplete}
      />
    </Box>
  );
};
