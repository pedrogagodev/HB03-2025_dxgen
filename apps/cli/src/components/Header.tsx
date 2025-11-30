import gradient from "gradient-string";
import { Box, Text } from "ink";
import React from "react";

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const gradientTitle = gradient.cristal.multiline(title);

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold>{gradientTitle}</Text>
    </Box>
  );
};
