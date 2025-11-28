import type { User } from "@supabase/supabase-js";
import open from "open";
import ora from "ora";
import { supabase } from "../supabase";
import { checkAuth } from "./index";
import { startOAuthServer } from "./oauth-server";
import { getSessionFilePath } from "./session";

export interface LoginFlowResult {
  success: boolean;
  user?: User;
  error?: Error;
  errorType?:
    | "already_logged_in"
    | "oauth_error"
    | "session_error"
    | "profile_error"
    | "profile_creation_failed"
    | "not_on_allowlist"
    | "allowlist_check_failed"
    | "timeout"
    | "port_in_use"
    | "cancelled";
}

export interface LoginFlowOptions {
  silent?: boolean;
  checkIfLoggedIn?: boolean;
}

async function checkAllowlist(githubUsername: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_allowlist", {
    username: githubUsername,
  });

  if (error) {
    throw new Error(`Allowlist check failed: ${error.message}`);
  }

  return data === true;
}

export async function executeLoginFlow(
  options: LoginFlowOptions = {},
): Promise<LoginFlowResult> {
  const { silent = false, checkIfLoggedIn = false } = options;

  if (checkIfLoggedIn) {
    const user = await checkAuth();
    if (user) {
      if (!silent) {
        console.log(`\n✅ Already logged in as: ${user.email || user.id}`);
        console.log('👉 Run "dxgen logout" to sign out first.\n');
      }
      return {
        success: true,
        user,
        errorType: "already_logged_in",
      };
    }
  }

  if (!silent) {
    console.log("\n🔐 GitHub Authentication\n");
  }

  let server: Awaited<ReturnType<typeof startOAuthServer>> | null = null;
  let spinner: ReturnType<typeof ora> | null = null;
  let handleInterrupt: (() => void) | null = null;

  try {
    if (!silent) {
      console.log("🔧 Starting local callback server...");
    }
    server = await startOAuthServer(54321);
    if (!silent) {
      console.log(`🔗 Local server: ${server.callbackUrl}\n`);
    }

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

    if (!silent) {
      console.log("🌐 Opening browser for GitHub login...\n");
      console.log("If the browser doesn't open, visit this URL manually:");
      console.log(`${data.url}\n`);
    }

    try {
      await open(data.url);
    } catch {
      if (!silent) {
        console.log("Browser opening failed, user can use manual URL");
      }
    }

    if (!silent) {
      spinner = ora({
        text: "Waiting for authorization... (Press Ctrl+C to cancel)",
        spinner: "dots",
      }).start();
    }

    let cancelled = false;

    handleInterrupt = () => {
      cancelled = true;
      if (spinner) {
        spinner.fail("Authorization cancelled");
      }
      if (server) {
        server.close();
      }
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

      if (cancelled) {
        return {
          success: false,
          error: new Error("Login cancelled by user"),
          errorType: "cancelled",
        };
      }

      if (spinner) {
        spinner.succeed("Authorization received!");
      }

      const spinnerSession = !silent
        ? ora({
            text: "Completing login...",
            spinner: "dots",
          }).start()
        : null;

      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        });

      if (sessionError || !sessionData.user) {
        if (spinnerSession) {
          spinnerSession.fail("Login failed!");
        }
        throw new Error(
          `Failed to create session: ${sessionError?.message || "Unknown error"}`,
        );
      }

      if (spinnerSession) {
        spinnerSession.succeed("Login complete!");
      }

      const allowlistSpinner = !silent
        ? ora("Checking access...").start()
        : null;

      try {
        const githubUsername = sessionData.user.user_metadata?.user_name;
        if (!githubUsername) {
          throw new Error("Could not retrieve GitHub username");
        }

        const isAllowed = await checkAllowlist(githubUsername);

        if (!isAllowed) {
          if (allowlistSpinner) {
            allowlistSpinner.fail("Access denied");
          }
          if (!silent) {
            console.log("\n You're not on the allowlist.");
            console.log(`Visit ${process.env.FRONTEND_URL} to join the waitlist and request access.\n`);
          }
          await supabase.auth.signOut();

          // Notify frontend about allowlist failure
          if (server) {
            server.setStatus('not_allowed', "You're not on the allowlist");
          }

          return {
            success: false,
            error: new Error(
              "You're not on the allowlist. Join the waitlist to request access.",
            ),
            errorType: "not_on_allowlist",
          };
        }

        if (allowlistSpinner) {
          allowlistSpinner.succeed("Access verified!");
        }
      } catch (allowlistError) {
        if (allowlistSpinner) {
          allowlistSpinner.fail("Access check failed");
        }
        if (!silent) {
          console.error(
            `\n Could not verify access: ${(allowlistError as Error).message}`,
          );
          console.error("Please try again later.\n");
        }
        await supabase.auth.signOut();

        // Notify frontend about allowlist check error
        if (server) {
          server.setStatus('error', (allowlistError as Error).message);
        }

        return {
          success: false,
          error: allowlistError as Error,
          errorType: "allowlist_check_failed",
        };
      }

      const profileSpinner = !silent
        ? ora("Setting up profile...").start()
        : null;

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
            if (profileSpinner) {
              profileSpinner.fail("Profile creation failed");
            }
            if (!silent) {
              console.error("\n Profile creation failed.");
              console.error("Please try logging in again.\n");
            }
            await supabase.auth.signOut();
            return {
              success: false,
              error: new Error(
                "Profile creation failed. Please try logging in again.",
              ),
              errorType: "profile_creation_failed",
            };
          } else {
            if (profileSpinner) {
              profileSpinner.succeed("Profile created!");
            }
          }
        } else if (profileError) {
          if (profileSpinner) {
            profileSpinner.fail("Profile check failed");
          }
          if (!silent) {
            console.warn(`\n⚠️  ${profileError.message}\n`);
          }
        } else {
          if (profileSpinner) {
            profileSpinner.succeed("Profile ready!");
          }
        }
      } catch (error) {
        if (profileSpinner) {
          profileSpinner.fail("Profile setup error");
        }
        if (!silent) {
          console.warn(`\n⚠️  ${(error as Error).message}\n`);
        }
      }

      if (!silent) {
        console.log(
          `\n✅ Successfully logged in as: ${sessionData.user.email || sessionData.user.id}`,
        );
        console.log(`💾 Session saved to: ${getSessionFilePath()}`);
        console.log("\n👉 You can now use dxgen commands!\n");
      }

      // Notify frontend about successful authentication
      if (server) {
        server.setStatus('success');
      }

      return {
        success: true,
        user: sessionData.user,
      };
    } finally {
      if (handleInterrupt) {
        process.off("SIGINT", handleInterrupt);
      }
    }
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (!silent) {
      console.error(`\n❌ ${errorMessage}`);
    }

    let errorType: LoginFlowResult["errorType"] = "oauth_error";

    if (errorMessage.includes("timeout")) {
      errorType = "timeout";
      if (!silent) {
        console.error(
          '\nThe authorization window expired. Please run "dxgen login" to try again.',
        );
      }
    } else if (errorMessage.includes("EADDRINUSE")) {
      errorType = "port_in_use";
      if (!silent) {
        console.error(
          "\nThe local callback server port is in use. Please close any other instances of dxgen and try again.",
        );
      }
    } else if (errorMessage.includes("session")) {
      errorType = "session_error";
      if (!silent) {
        console.error("\nPlease check your internet connection and try again.");
      }
    } else {
      if (!silent) {
        console.error("\nPlease check your internet connection and try again.");
      }
    }

    // Notify frontend about error
    if (server) {
      server.setStatus('error', errorMessage);
    }

    return {
      success: false,
      error: error as Error,
      errorType,
    };
  } finally {
    if (server) {
      if (server.useFrontend) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      server.close();
    }
  }
}
