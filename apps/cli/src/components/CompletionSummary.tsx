import { Text } from "ink";
import React from "react";
import { formatDuration } from "../utils/stage.utils";

interface CompletionSummaryProps {
  duration: number;
  fileCount: number;
}

export const CompletionSummary: React.FC<CompletionSummaryProps> = ({
  duration,
  fileCount,
}) => {
  const fileText = fileCount === 1 ? "file" : "files";
  return (
    <Text>
      Done in {formatDuration(duration)}. {fileCount} {fileText} generated.
    </Text>
  );
};
