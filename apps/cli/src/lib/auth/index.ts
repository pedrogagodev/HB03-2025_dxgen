import type { User } from "@supabase/supabase-js";
import prompts from "prompts";
import { SupabaseConfigError, supabase } from "../supabase";
import { executeLoginFlow } from "./login-flow";

export interface AuthOptions {
  onExit?: (code: number) => never;
}

const defaultOptions: Required<AuthOptions> = {
  onExit: (code: number) => process.exit(code) as never,
};

export async function checkAuth(): Promise<User | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    return user;
  } catch (_error) {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await supabase.auth.signOut();
    console.log("✅ Logged out successfully!");
  } catch (error) {
    console.error("❌ Error during logout:", error);
    throw error;
  }
}

export async function promptLogin(
  options: AuthOptions = {},
): Promise<User | never> {
  const { onExit } = { ...defaultOptions, ...options };

  console.log("\n🔒 Authentication Required\n");
  console.log("You need to be logged in to use dxgen commands.");

  const response = await prompts(
    {
      type: "select",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { title: "Login now", value: "login" },
        { title: "Exit", value: "exit" },
      ],
      initial: 0,
    },
    {
      onCancel: () => {
        console.log("\nOperation cancelled.");
        onExit(0);
      },
    },
  );

  if (response.action === "login") {
    console.log("\n🔐 Starting GitHub authentication...\n");

    const loginResult = await executeLoginFlow({
      silent: false,
      checkIfLoggedIn: false,
    });

    if (loginResult.success && loginResult.user) {
      console.log("\n✅ Authentication successful!");
      console.log("👉 Continuing with your command...\n");
      return loginResult.user;
    }

    if (loginResult.errorType === "timeout") {
      console.error("\n❌ Login timed out after 2 minutes.");
    } else if (loginResult.errorType === "port_in_use") {
      console.error("\n❌ Port 54321 is already in use.");
      console.error("Please close other dxgen instances and try again.");
    } else if (loginResult.errorType === "cancelled") {
      console.log("\n❌ Login cancelled by user.");
    } else {
      console.error("\n❌ Login failed.");
      console.error(`Error: ${loginResult.error?.message || "Unknown error"}`);
    }

    console.error("Please try again.\n");
    return onExit(1);
  }

  console.log("\nExiting...");
  return onExit(0);
}

export async function requireAuth(options: AuthOptions = {}): Promise<User> {
  let user = await checkAuth();

  if (!user) {
    user = await promptLogin(options);
  }

  return user;
}

export function handleAuthenticationError(error: unknown): never {
  if (error instanceof Error) {
    if (
      error.name === "SupabaseConfigError" ||
      error instanceof SupabaseConfigError
    ) {
      console.error("\n❌ Configuration Error");
      console.error(error.message);
      console.error("\nPlease check your .env file:");
      console.error("  - SUPABASE_URL");
      console.error("  - SUPABASE_ANON_KEY");
      console.error("\nSee .env.example for reference.\n");
      process.exit(1);
    }

    if (error.message.includes("fetch") || error.message.includes("network")) {
      console.error("\n❌ Network Error");
      console.error("Could not connect to authentication service.");
      console.error("Please check your internet connection and try again.\n");
      process.exit(1);
    }

    console.error("\n❌ Authentication Error");
    console.error(error.message);
    console.error("\nIf this problem persists, try:");
    console.error("  dxgen logout && dxgen login\n");
    process.exit(1);
  }

  console.error("\n❌ Unexpected Error");
  console.error("An unexpected error occurred during authentication.");
  console.error('Try running "dxgen logout && dxgen login"\n');
  process.exit(1);
}
