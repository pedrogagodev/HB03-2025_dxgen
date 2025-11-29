import { Box, Text, useApp } from "ink";
import React from "react";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { InfoBox } from "./InfoBox";
import { SpinnerComponent } from "./Spinner";

interface GenerateViewProps {
  stage:
    | "building_query"
    | "running_pipeline"
    | "generating"
    | "writing_file"
    | "updating_usage"
    | "complete"
    | "error";
  error?: string;
  usageInfo?: {
    current: number;
    limit: number;
    remaining: number;
  };
  resultPath?: string;
}

export const GenerateView: React.FC<GenerateViewProps> = ({
  stage,
  error,
  usageInfo,
  resultPath,
}) => {
  const { exit } = useApp();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Exit Ink when generation is complete or errored
  useEffect(() => {
    if (stage === "complete" || stage === "error") {
      // Give user time to read the final message
      const timer = setTimeout(() => {
        exit();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stage, exit]);

  const stageMessages = {
    building_query: "Building query for relevant files",
    running_pipeline: "Running RAG pipeline",
    generating: "Generating documentation",
    writing_file: "Writing documentation file",
    updating_usage: "Updating usage statistics",
    complete: "Complete",
    error: "Error",
  };

  if (stage === "error" && error) {
    return (
      <Box flexDirection="column">
        <Header title="🤖 Documentation Generator" />
        <InfoBox type="error" title="Generation Failed">
          <Text>{error}</Text>
        </InfoBox>
      </Box>
    );
  }

  if (stage === "complete" && resultPath) {
    return (
      <Box flexDirection="column">
        <Header title="🤖 Documentation Generator" />
        <InfoBox type="success" title="Documentation Generated Successfully">
          <Box flexDirection="column" gap={1}>
            <Text>
              <Text bold>File: </Text>
              <Text color="cyan">{resultPath}</Text>
            </Text>
            {usageInfo && (
              <Box marginTop={1} flexDirection="column">
                <Text bold>Usage Statistics:</Text>
                <Text>
                  <Text>Docs generated: </Text>
                  <Text color="cyan">
                    {usageInfo.current}/{usageInfo.limit}
                  </Text>
                  <Text> this month</Text>
                </Text>
                <Text>
                  <Text>Remaining: </Text>
                  <Text color="cyan">{usageInfo.remaining} docs</Text>
                </Text>
                {usageInfo.remaining <= 5 && (
                  <Text color="yellow" marginTop={1}>
                    💡 Running low! Consider upgrading to Pro.
                  </Text>
                )}
              </Box>
            )}
          </Box>
        </InfoBox>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header title="🤖 Documentation Generator" />
      <InfoBox type="info">
        <Box flexDirection="column" gap={1}>
          <SpinnerComponent
            label={`${stageMessages[stage]}${dots}`}
            type="dots"
          />
          {stage === "running_pipeline" && (
            <Text dimColor marginTop={1}>
              This may take a few moments...
            </Text>
          )}
          {stage === "generating" && (
            <Text dimColor marginTop={1}>
              AI is analyzing your code and generating documentation...
            </Text>
          )}
        </Box>
      </InfoBox>
    </Box>
  );
};
