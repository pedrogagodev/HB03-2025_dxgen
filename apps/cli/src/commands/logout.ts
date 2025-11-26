import { Command } from "commander";
import { checkAuth, logout } from "../lib/auth";
import { getSessionFilePath } from "../lib/auth/session";

export const logoutCommand = new Command("logout")
  .description("Sign out and clear local session")
  .action(async () => {
    const user = await checkAuth();
    if (!user) {
      console.log("ℹ️  Not currently logged in.");
      console.log('👉 Run "dxgen login" to authenticate.');
      return;
    }

    console.log(`👋 Signing out ${user.email || user.id}...`);

    try {
      await logout();
      console.log(`🗑️  Session file removed: ${getSessionFilePath()}`);
      console.log('\n👉 Run "dxgen login" to sign in again.');
    } catch (error) {
      console.error("❌ Logout failed:", error);
      process.exit(1);
    }
  });
