import { Box, Text } from "ink";
import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  width?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = true,
  width = 30,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  const bar = "█".repeat(filled) + "░".repeat(empty);

  let color = "green";
  if (percentage >= 75) color = "yellow";
  if (percentage >= 90) color = "red";

  return (
    <Box flexDirection="column">
      {label && (
        <Text>
          {label}
          {showPercentage && ` (${percentage.toFixed(0)}%)`}
        </Text>
      )}
      <Box>
        <Text color={color}>{bar}</Text>
        <Text dimColor>
          {" "}
          {value}/{max}
        </Text>
      </Box>
    </Box>
  );
};
