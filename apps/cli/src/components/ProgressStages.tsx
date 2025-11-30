import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React from "react";
import type { Stage } from "../types/progress.types";
import { getStatusColor, getStatusSymbol } from "../utils/stage.utils";

interface ProgressStagesProps {
  stages: Stage[];
}

export const ProgressStages: React.FC<ProgressStagesProps> = ({ stages }) => {
  return (
    <Box flexDirection="column">
      {stages.map((stage) => (
        <Box key={stage.id}>
          {stage.status === "in_progress" ? (
            <Text color="cyan">
              <Spinner type="arc" /> {stage.label}
              {stage.details ? ` ${stage.details}` : "..."}
            </Text>
          ) : (
            <Text color={getStatusColor(stage.status)}>
              {getStatusSymbol(stage.status)} {stage.label}
              {stage.details ? ` ${stage.details}` : ""}
              {stage.status === "pending" ? "..." : ""}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  );
};
