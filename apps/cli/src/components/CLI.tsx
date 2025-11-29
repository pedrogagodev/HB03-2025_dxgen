import { Box, Text } from "ink";
import React from "react";
import { Banner } from "./Banner";

export const CLI: React.FC = () => {
  return (
    <Box flexDirection="column">
      <Banner />
      <Box flexDirection="column" marginTop={1}>
        <Text bold>Usage:</Text>
        <Text dimColor> dxgen [command] [options]</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Commands:</Text>
        <Box flexDirection="column" marginLeft={2}>
          <Text>
            <Text color="cyan">login</Text>
            <Text dimColor> Authenticate with dxgen using GitHub</Text>
          </Text>
          <Text>
            <Text color="cyan">logout</Text>
            <Text dimColor> Sign out and clear local session</Text>
          </Text>
          <Text>
            <Text color="cyan">status</Text>
            <Text dimColor> Show current authentication status</Text>
          </Text>
          <Text>
            <Text color="cyan">generate</Text>
            <Text dimColor> Generate documentation for a project</Text>
          </Text>
          <Text>
            <Text color="cyan">help</Text>
            <Text dimColor> Display help information</Text>
          </Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Options:</Text>
        <Box flexDirection="column" marginLeft={2}>
          <Text>
            <Text color="cyan">-v, --version</Text>
            <Text dimColor> Show version number</Text>
          </Text>
          <Text>
            <Text color="cyan">-h, --help</Text>
            <Text dimColor> Show this help message</Text>
          </Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>For more information, visit: https://dxgen.io</Text>
      </Box>
    </Box>
  );
};
