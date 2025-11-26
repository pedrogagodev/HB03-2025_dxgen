import type { User } from "@supabase/supabase-js";
import prompts from "prompts";
import { SupabaseConfigError, supabase } from "../supabase";

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

export async function promptLogin(options: AuthOptions = {}): Promise<never> {
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
    console.log("\n👉 Please run: dxgen login\n");
    return onExit(1);
  }

  console.log("\nExiting...");
  return onExit(0);
}

export async function requireAuth(options: AuthOptions = {}): Promise<User> {
  const user = await checkAuth();

  if (!user) {
    await promptLogin(options);
    throw new Error("Authentication required but not provided");
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
