/**
 * Server entry point for Probot
 * This file starts the Probot server using the Probot CLI
 */

// IMPORTANT: Load .env FIRST before any other imports
// This ensures environment variables from monorepo root are loaded
import { config } from "dotenv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Load .env from app directory or monorepo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appRoot = join(__dirname, "..");
const monorepoRoot = join(appRoot, "../..");

// Try to load .env from app directory first, then monorepo root
config({ path: join(appRoot, ".env") });
config({ path: join(monorepoRoot, ".env") });

// Verify environment variables are loaded
if (!process.env.APP_ID || !process.env.PRIVATE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   APP_ID and PRIVATE_KEY are required");
  console.error("   Make sure your .env file is in the monorepo root or apps/github-app/");
  process.exit(1);
}

// Export the app function for Probot CLI
// Probot CLI will automatically load this file and start the server
export { default } from "./index.js";

