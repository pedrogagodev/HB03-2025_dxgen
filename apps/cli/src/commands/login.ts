import { Command } from "commander";
import { executeLoginFlow } from "../lib/auth/login-flow";

export const loginCommand = new Command("login")
  .description("Authenticate with dxgen using GitHub")
  .action(async () => {
    const loginResult = await executeLoginFlow({
      silent: false,
      checkIfLoggedIn: true,
    });

    if (loginResult.success) {
      process.exit(0);
    }

    process.exit(1);
  });
