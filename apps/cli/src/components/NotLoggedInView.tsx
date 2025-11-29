import { Box, Text } from "ink";
import React from "react";
import { Header } from "./Header";
import { InfoBox } from "./InfoBox";

export const NotLoggedInView: React.FC = () => {
  return (
    <Box flexDirection="column">
      <Header title="📊 Authentication Status" />

      <InfoBox type="warning" title="Not Authenticated">
        <Box flexDirection="column" gap={1}>
          <Text>You are not currently logged in.</Text>
          <Box marginTop={1}>
            <Text>
              Run{" "}
              <Text bold color="cyan">
                dxgen login
              </Text>{" "}
              to authenticate.
            </Text>
          </Box>
        </Box>
      </InfoBox>
    </Box>
  );
};
