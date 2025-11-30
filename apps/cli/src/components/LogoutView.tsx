import { Box, Text } from "ink";
import React from "react";
import { Header } from "./Header";
import { InfoBox } from "./InfoBox";

interface LogoutViewProps {
  type: "not_logged_in" | "success" | "error";
  email?: string;
  sessionPath?: string;
  error?: string;
}

export const LogoutView: React.FC<LogoutViewProps> = ({
  type,
  email,
  sessionPath,
  error,
}) => {
  if (type === "not_logged_in") {
    return (
      <Box flexDirection="column">
        <Header title="👋 Sign Out" />
        <InfoBox type="info" title="Not Logged In">
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
  }

  if (type === "error" && error) {
    return (
      <Box flexDirection="column">
        <Header title="👋 Sign Out" />
        <InfoBox type="error" title="Logout Failed">
          <Text>{error}</Text>
        </InfoBox>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header title="👋 Sign Out" />
      <InfoBox type="success" title="Signed Out Successfully">
        <Box flexDirection="column" gap={1}>
          {email && (
            <Text>
              Signed out <Text color="cyan">{email}</Text>
            </Text>
          )}
          {sessionPath && (
            <Text dimColor>Session file removed: {sessionPath}</Text>
          )}
          <Box marginTop={1}>
            <Text>
              Run{" "}
              <Text bold color="cyan">
                dxgen login
              </Text>{" "}
              to sign in again.
            </Text>
          </Box>
        </Box>
      </InfoBox>
    </Box>
  );
};
