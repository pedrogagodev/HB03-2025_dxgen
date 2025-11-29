import { existsSync } from "node:fs";
import { render } from "ink";
import React from "react";
import { NotLoggedInView } from "../components/NotLoggedInView";
import { StatusView } from "../components/StatusView";
import { getSessionFilePath } from "../lib/auth/session";
import { supabase } from "../lib/supabase";
import { checkUsageLimits } from "../lib/usage";

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Expired";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export async function handleStatus(): Promise<void> {
  const sessionPath = getSessionFilePath();
  const sessionExists = existsSync(sessionPath);

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Error checking session:", error.message);
      return;
    }

    if (!session) {
      render(React.createElement(NotLoggedInView));
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("⚠️  Session exists but user validation failed");
      console.error('👉 Try running "dxgen logout" and "dxgen login" again.\n');
      return;
    }

    const expiresAt = session.expires_at
      ? new Date(session.expires_at * 1000)
      : null;
    const now = new Date();
    const isExpired = expiresAt ? expiresAt < now : false;

    let usageStatus: Awaited<ReturnType<typeof checkUsageLimits>> | undefined;
    let usageError: string | undefined;

    try {
      usageStatus = await checkUsageLimits(user.id);
    } catch (error) {
      const errorMsg = (error as Error).message;
      if (errorMsg === "PROFILE_NOT_FOUND") {
        usageError = "Profile not found. Try: dxgen logout && dxgen login";
      } else {
        usageError = "Could not fetch usage statistics";
      }
    }

    render(
      React.createElement(StatusView, {
        email: user.email || user.id,
        username: user.user_metadata?.user_name,
        provider: user.app_metadata?.provider,
        sessionPath,
        sessionExists,
        expiresIn: expiresAt
          ? formatTimeRemaining(expiresAt.getTime() - now.getTime())
          : undefined,
        isExpired,
        usageStatus,
        usageError,
      }),
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}
