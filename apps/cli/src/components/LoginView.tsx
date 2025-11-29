import { Box, Text } from "ink";
import React from "react";
import { Header } from "./Header";
import { InfoBox } from "./InfoBox";
import { SpinnerComponent } from "./Spinner";

interface LoginViewProps {
  stage:
    | "starting_server"
    | "opening_browser"
    | "waiting_auth"
    | "completing_login"
    | "checking_allowlist"
    | "setting_up_profile"
    | "success"
    | "error"
    | "already_logged_in";
  email?: string;
  sessionPath?: string;
  error?: string;
  oauthUrl?: string;
  callbackUrl?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  stage,
  email,
  sessionPath,
  error,
  oauthUrl,
  callbackUrl,
}) => {
  if (stage === "already_logged_in" && email) {
    return (
      <Box flexDirection="column">
        <Header title="🔐 GitHub Authentication" />
        <InfoBox type="info" title="Already Authenticated">
          <Box flexDirection="column" gap={1}>
            <Text>
              You are already logged in as <Text color="cyan">{email}</Text>
            </Text>
            <Box marginTop={1}>
              <Text>
                Run{" "}
                <Text bold color="cyan">
                  dxgen logout
                </Text>{" "}
                to sign out first.
              </Text>
            </Box>
          </Box>
        </InfoBox>
      </Box>
    );
  }

  if (stage === "error" && error) {
    return (
      <Box flexDirection="column">
        <Header title="🔐 GitHub Authentication" />
        <InfoBox type="error" title="Authentication Failed">
          <Box flexDirection="column" gap={1}>
            <Text>{error}</Text>
            <Box marginTop={1}>
              <Text dimColor>
                Please check your internet connection and try again.
              </Text>
            </Box>
          </Box>
        </InfoBox>
      </Box>
    );
  }

  if (stage === "success" && email) {
    return (
      <Box flexDirection="column">
        <Header title="🔐 GitHub Authentication" />
        <InfoBox type="success" title="Login Successful">
          <Box flexDirection="column" gap={1}>
            <Text>
              Logged in as{" "}
              <Text bold color="cyan">
                {email}
              </Text>
            </Text>
            {sessionPath && (
              <Text dimColor>
                Session saved to: <Text color="cyan">{sessionPath}</Text>
              </Text>
            )}
            <Box marginTop={1}>
              <Text color="green">You can now use dxgen commands!</Text>
            </Box>
          </Box>
        </InfoBox>
      </Box>
    );
  }

  const stageMessages: Record<string, string> = {
    starting_server: "Starting local callback server",
    opening_browser: "Opening browser for GitHub login",
    waiting_auth: "Waiting for authorization",
    completing_login: "Completing login",
    checking_allowlist: "Checking access",
    setting_up_profile: "Setting up profile",
  };

  return (
    <Box flexDirection="column">
      <Header title="🔐 GitHub Authentication" />
      <InfoBox type="info">
        <Box flexDirection="column" gap={1}>
          <SpinnerComponent
            label={stageMessages[stage] || "Processing"}
            type="dots"
          />

          {stage === "starting_server" && callbackUrl && (
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>Local server: {callbackUrl}</Text>
            </Box>
          )}

          {stage === "opening_browser" && oauthUrl && (
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>If browser doesn't open, visit:</Text>
              <Text color="cyan">{oauthUrl}</Text>
            </Box>
          )}

          {stage === "waiting_auth" && (
            <Box marginTop={1}>
              <Text dimColor>Press Ctrl+C to cancel</Text>
            </Box>
          )}
        </Box>
      </InfoBox>
    </Box>
  );
};
