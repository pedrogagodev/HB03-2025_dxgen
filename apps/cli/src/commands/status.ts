import { existsSync } from "node:fs";
import { Command } from "commander";
import { getSessionFilePath } from "../lib/auth/session";
import { supabase } from "../lib/supabase";
import { checkUsageLimits } from "../lib/usage";

export const statusCommand = new Command("status")
  .description("Show current authentication status")
  .action(async () => {
    console.log("\n📊 Authentication Status\n");

    const sessionPath = getSessionFilePath();
    const sessionExists = existsSync(sessionPath);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.log("❌ Error checking session:", error.message);
        return;
      }

      if (!session) {
        console.log("🔒 Not logged in");
        console.log('\n👉 Run "dxgen login" to authenticate.\n');
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("⚠️  Session exists but user validation failed");
        console.log('👉 Try running "dxgen logout" and "dxgen login" again.\n');
        return;
      }

      const expiresAt = session.expires_at
        ? new Date(session.expires_at * 1000)
        : null;
      const now = new Date();
      const isExpired = expiresAt ? expiresAt < now : false;

      console.log(`✅ Logged in as: ${user.email || user.id}`);

      if (user.user_metadata?.user_name) {
        console.log(`👤 GitHub username: ${user.user_metadata.user_name}`);
      }

      if (user.user_metadata?.avatar_url) {
        console.log(`🖼️  Avatar: ${user.user_metadata.avatar_url}`);
      }

      console.log("");

      if (expiresAt) {
        if (isExpired) {
          console.log(
            "⚠️  Access token: Expired (will auto-refresh on next command)",
          );
        } else {
          const timeLeft = formatTimeRemaining(
            expiresAt.getTime() - now.getTime(),
          );
          console.log(`🕐 Access token expires in: ${timeLeft}`);
        }
      }

      console.log(`📁 Session file: ${sessionPath}`);

      if (!sessionExists) {
        console.log("⚠️  Warning: Session file not found on disk");
      }

      if (user.app_metadata?.provider) {
        console.log(`🔐 Auth provider: ${user.app_metadata.provider}`);
      }

      try {
        const usageStatus = await checkUsageLimits(user.id);

        console.log("\n📊 Usage Statistics:");
        console.log(
          `  Docs generated: ${usageStatus.docs_used}/${usageStatus.limit_value} this month`,
        );

        const remaining = usageStatus.limit_value - usageStatus.docs_used;
        console.log(`  Remaining: ${remaining} docs`);
        console.log(`  Resets in: ${usageStatus.days_until_reset} days`);

        const percentage =
          (usageStatus.docs_used / usageStatus.limit_value) * 100;
        if (percentage >= 90) {
          console.log("\n⚠️  Approaching monthly limit!");
          console.log("🚀 Upgrade to Pro: https://dxgen.io/pricing");
        } else if (percentage >= 75) {
          console.log("\n💡 75% of monthly limit used");
        }
      } catch (error) {
        const errorMsg = (error as Error).message;
        console.log("\n⚠️  Could not fetch usage statistics");

        if (errorMsg === "PROFILE_NOT_FOUND") {
          console.log("Profile not found. Try: dxgen logout && dxgen login");
        }
      }

      console.log("");
    } catch (error) {
      console.error("❌ Unexpected error:", error);
    }
  });

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
