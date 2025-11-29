import { Box, Text } from "ink";
import React from "react";

interface InfoBoxProps {
  title?: string;
  children: React.ReactNode;
  type?: "info" | "success" | "warning" | "error";
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  title,
  children,
  type = "info",
}) => {
  const borderColors = {
    info: "blue",
    success: "green",
    warning: "yellow",
    error: "red",
  };

  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColors[type]}
      paddingX={1}
      marginY={1}
    >
      {title && (
        <Text bold color={borderColors[type]}>
          {icons[type]} {title}
        </Text>
      )}
      <Box flexDirection="column" marginTop={title ? 1 : 0}>
        {children}
      </Box>
    </Box>
  );
};
