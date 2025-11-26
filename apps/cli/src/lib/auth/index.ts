import type { User } from "@supabase/supabase-js";
import prompts from "prompts";
import { supabase } from "../supabase";

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

export async function promptLogin(): Promise<void> {
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
        process.exit(0);
      },
    },
  );

  if (response.action === "login") {
    console.log("\n👉 Please run: dxgen login\n");
    process.exit(1);
  } else {
    console.log("\nExiting...");
    process.exit(0);
  }
}

export async function requireAuth(): Promise<User> {
  const user = await checkAuth();

  if (!user) {
    await promptLogin();
    process.exit(1);
  }

  return user;
}
