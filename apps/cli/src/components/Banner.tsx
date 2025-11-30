import gradient from "gradient-string";
import { Box, Text } from "ink";
import React from "react";

export const Banner: React.FC = () => {
  const banner = `
██████╗ ██╗  ██╗ ██████╗ ███████╗███╗   ██╗
██╔══██╗╚██╗██╔╝██╔════╝ ██╔════╝████╗  ██║
██║  ██║ ╚███╔╝ ██║  ███╗█████╗  ██╔██╗ ██║
██║  ██║ ██╔██╗ ██║   ██║██╔══╝  ██║╚██╗██║
██████╔╝██╔╝ ██╗╚██████╔╝███████╗██║ ╚████║
╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝
  `.trim();

  const gradientBanner = gradient.cristal.multiline(banner);

  return (
    <Box flexDirection="column" marginY={1}>
      <Text>{gradientBanner}</Text>
      <Text dimColor>AI Documentation Agent - CLI-first tool</Text>
    </Box>
  );
};
