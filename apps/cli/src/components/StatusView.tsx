import { Box, Text } from "ink";
import React from "react";
import { Header } from "./Header";
import { InfoBox } from "./InfoBox";
import { ProgressBar } from "./ProgressBar";

interface UsageStatus {
  docs_used: number;
  limit_value: number;
  days_until_reset: number;
  can_generate: boolean;
}

interface StatusViewProps {
  email?: string;
  username?: string;
  avatarUrl?: string;
  provider?: string;
  sessionPath: string;
  sessionExists: boolean;
  expiresIn?: string;
  isExpired?: boolean;
  usageStatus?: UsageStatus;
  usageError?: string;
}

export const StatusView: React.FC<StatusViewProps> = ({
  email,
  username,
  provider,
  sessionPath,
  sessionExists,
  expiresIn,
  isExpired,
  usageStatus,
  usageError,
}) => {
  const percentage = usageStatus
    ? (usageStatus.docs_used / usageStatus.limit_value) * 100
    : 0;

  return (
    <Box flexDirection="column">
      <Header title="📊 Authentication Status" />

      <InfoBox type="success" title="User Information">
        <Box flexDirection="column" gap={1}>
          {email && (
            <Text>
              <Text bold>Email: </Text>
              <Text color="cyan">{email}</Text>
            </Text>
          )}
          {username && (
            <Text>
              <Text bold>GitHub: </Text>
              <Text color="cyan">@{username}</Text>
            </Text>
          )}
          {provider && (
            <Text>
              <Text bold>Provider: </Text>
              <Text color="cyan">{provider}</Text>
            </Text>
          )}
        </Box>
      </InfoBox>

      <InfoBox type="info" title="Session Information">
        <Box flexDirection="column" gap={1}>
          <Text>
            <Text bold>Session file: </Text>
            <Text dimColor>{sessionPath}</Text>
          </Text>
          <Text>
            <Text bold>Status: </Text>
            {sessionExists ? (
              <Text color="green">Active ✓</Text>
            ) : (
              <Text color="red">Not found ✗</Text>
            )}
          </Text>
          {expiresIn && (
            <Text>
              <Text bold>Expires in: </Text>
              {isExpired ? (
                <Text color="yellow">{expiresIn} (will auto-refresh)</Text>
              ) : (
                <Text color="cyan">{expiresIn}</Text>
              )}
            </Text>
          )}
        </Box>
      </InfoBox>

      {usageStatus && (
        <InfoBox
          type={percentage >= 90 ? "warning" : "info"}
          title="Usage Statistics"
        >
          <Box flexDirection="column" gap={1}>
            <ProgressBar
              value={usageStatus.docs_used}
              max={usageStatus.limit_value}
              label="Docs generated this month"
            />
            <Text>
              <Text bold>Remaining: </Text>
              <Text color="cyan">
                {usageStatus.limit_value - usageStatus.docs_used} docs
              </Text>
            </Text>
            <Text>
              <Text bold>Resets in: </Text>
              <Text color="cyan">{usageStatus.days_until_reset} days</Text>
            </Text>

            {percentage >= 90 && (
              <Box marginTop={1}>
                <Text color="yellow">
                  ⚠️ Approaching monthly limit! Upgrade to Pro for more.
                </Text>
              </Box>
            )}

            {percentage >= 75 && percentage < 90 && (
              <Box marginTop={1}>
                <Text color="yellow">💡 75% of monthly limit used</Text>
              </Box>
            )}
          </Box>
        </InfoBox>
      )}

      {usageError && (
        <InfoBox type="warning" title="Usage Information Unavailable">
          <Text>{usageError}</Text>
        </InfoBox>
      )}
    </Box>
  );
};
