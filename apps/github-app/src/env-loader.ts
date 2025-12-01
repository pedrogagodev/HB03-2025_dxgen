/**
 * Environment loader - MUST be imported first before any other modules
 * that use environment variables
 */
import { config } from "dotenv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Load .env from app directory or monorepo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appRoot = join(__dirname, "..");
const monorepoRoot = join(appRoot, "../..");

// Try to load .env from app directory first, then monorepo root
// This ensures environment variables are available before any other imports
config({ path: join(appRoot, ".env") });
config({ path: join(monorepoRoot, ".env") });

// Re-export dotenv/config to ensure it's loaded
export {};

