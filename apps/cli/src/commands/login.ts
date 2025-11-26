import { Command } from "commander";
import open from "open";
import ora from "ora";
import { checkAuth } from "../lib/auth";
import { startOAuthServer } from "../lib/auth/oauth-server";
import { getSessionFilePath } from "../lib/auth/session";
import { supabase } from "../lib/supabase";

export const loginCommand = new Command("login")
  .description("Authenticate with dxgen using GitHub")
  .action(async () => {
    const user = await checkAuth();
    if (user) {
      console.log(`\n✅ Already logged in as: ${user.email || user.id}`);
      console.log('👉 Run "dxgen logout" to sign out first.\n');
      return;
    }

    console.log("\n🔐 GitHub Authentication\n");

    let server: Awaited<ReturnType<typeof startOAuthServer>> | null = null;

    try {
      console.log("🔧 Starting local callback server...");
      server = await startOAuthServer(54321);
      console.log(`🔗 Local server: ${server.callbackUrl}\n`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: server.callbackUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        throw new Error(
          `Failed to get OAuth URL: ${error?.message || "Unknown error"}`,
        );
      }

      console.log("🌐 Opening browser for GitHub login...\n");
      console.log("If the browser doesn't open, visit this URL manually:");
      console.log(`${data.url}\n`);

      try {
        await open(data.url);
      } catch {
        console.log("Browser opening failed, user can use manual URL");
      }

      const spinner = ora({
        text: "Waiting for authorization... (Press Ctrl+C to cancel)",
        spinner: "dots",
      }).start();

      const handleInterrupt = () => {
        spinner.fail("Authorization cancelled");
        if (server) server.close();
        process.exit(0);
      };
      process.on("SIGINT", handleInterrupt);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Authorization timed out after 2 minutes"));
        }, 120000); // 2 minutes
      });

      try {
        const tokens = await Promise.race([
          server.waitForCallback(),
          timeoutPromise,
        ]);

        spinner.succeed("Authorization received!");

        const spinnerSession = ora({
          text: "Completing login...",
          spinner: "dots",
        }).start();

        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          });

        if (sessionError || !sessionData.user) {
          throw new Error(
            `Failed to create session: ${sessionError?.message || "Unknown error"}`,
          );
        }

        spinnerSession.succeed("Login complete!");

        const profileSpinner = ora("Setting up profile...").start();

        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .select("id, email, tier, monthly_limit")
            .eq("id", sessionData.user.id)
            .single();

          if (profileError && profileError.code === "PGRST116") {
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: sessionData.user.id,
                email: sessionData.user.email,
                username: sessionData.user.user_metadata?.user_name || "user",
                avatar_url: sessionData.user.user_metadata?.avatar_url,
                tier: "free",
                monthly_limit: 50,
              });

            if (createError) {
              profileSpinner.fail("Profile setup failed");
              console.warn("\n⚠️  Could not create user profile");
              console.warn(
                "You may need to contact support if this persists.\n",
              );
            } else {
              profileSpinner.succeed("Profile created!");
            }
          } else if (profileError) {
            profileSpinner.fail("Profile check failed");
            console.warn(`\n⚠️  ${profileError.message}\n`);
          } else {
            profileSpinner.succeed("Profile ready!");
          }
        } catch (error) {
          profileSpinner.fail("Profile setup error");
          console.warn(`\n⚠️  ${(error as Error).message}\n`);
        }

        console.log(
          `\n✅ Successfully logged in as: ${sessionData.user.email || sessionData.user.id}`,
        );
        console.log(`💾 Session saved to: ${getSessionFilePath()}`);
        console.log("\n👉 You can now use dxgen commands!\n");

        process.exit(0);
      } finally {
        process.off("SIGINT", handleInterrupt);
      }
    } catch (error) {
      console.error(`\n❌ ${(error as Error).message}`);

      if ((error as Error).message.includes("timeout")) {
        console.error(
          '\nThe authorization window expired. Please run "dxgen login" to try again.',
        );
      } else if ((error as Error).message.includes("EADDRINUSE")) {
        console.error(
          "\nThe local callback server port is in use. Please close any other instances of dxgen and try again.",
        );
      } else {
        console.error("\nPlease check your internet connection and try again.");
        console.error(
          "If the problem persists, make sure GitHub OAuth is configured in your Supabase project.",
        );
      }

      process.exit(1);
    }
  });
