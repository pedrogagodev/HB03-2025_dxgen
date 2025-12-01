// IMPORTANT: Load .env FIRST before any other imports
// This ensures environment variables are available when other packages (like @repo/ai) load
import "./env-loader.js";

import type { Probot } from "probot";
import { handlePROpened } from "./handlers/pr-opened.handler";
import { validateEnvironment } from "./utils/env-validation";
import { shouldUseEdgeFunctions } from "./utils/edge-function-client";

/**
 * Main Probot application
 * Listens to pull_request.opened events and generates documentation
 */
export default (app: Probot) => {
  app.log.info("DXGen GitHub App initialized");

  // Validate environment on startup
  const validation = validateEnvironment();

  if (!validation.valid) {
    app.log.error("Environment validation failed:");
    validation.errors.forEach((error) => {
      app.log.error(`  • ${error}`);
    });
    app.log.error(
      "App may not function correctly. Please check your environment variables.",
    );
  }

  if (validation.warnings.length > 0) {
    app.log.warn("Environment warnings:");
    validation.warnings.forEach((warning) => {
      app.log.warn(`  • ${warning}`);
    });
  }

  // Log which mode we're using
  if (shouldUseEdgeFunctions()) {
    app.log.info("Using Edge Functions mode (keys stored in Supabase)");
  } else {
    app.log.info("Using direct mode (API keys from environment)");
  }

  // Listen to pull_request.opened events
  app.on("pull_request.opened", async (context) => {
    app.log.info(
      `Received pull_request.opened event for PR #${context.payload.pull_request.number}`,
    );

    try {
      await handlePROpened(context);
    } catch (error) {
      app.log.error({ err: error }, "Failed to handle PR opened event");
      // Error is already logged and commented on the PR in the handler
    }
  });

  // Health check endpoint
  app.on("ping", async () => {
    app.log.info("Received ping event");
  });
};
