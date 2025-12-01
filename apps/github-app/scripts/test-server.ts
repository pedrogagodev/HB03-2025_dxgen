#!/usr/bin/env tsx
/**
 * Test script to verify the server can start
 * This simulates Probot initialization without actually starting the server
 */

import { config } from "dotenv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Probot } from "probot";

// Load .env from app directory or monorepo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appRoot = join(__dirname, "..");
const monorepoRoot = join(appRoot, "../..");

// Try to load .env from app directory first, then monorepo root
config({ path: join(appRoot, ".env") });
config({ path: join(monorepoRoot, ".env") });

async function testServer() {
  console.log("🧪 Testing server initialization...\n");

  // Check environment variables
  const required = ["APP_ID", "PRIVATE_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
    console.error("   Please configure your .env file");
    process.exit(1);
  }

  try {
    // Try to create Probot instance
    console.log("1. Creating Probot instance...");
    const probot = new Probot({
      appId: process.env.APP_ID!,
      privateKey: process.env.PRIVATE_KEY!,
      secret: process.env.WEBHOOK_SECRET,
    });
    console.log("   ✅ Probot instance created");

    // Try to import the app
    console.log("2. Importing app module...");
    const app = (await import("../src/index.js")).default;
    console.log("   ✅ App module imported");

    // Try to initialize the app
    console.log("3. Initializing app with Probot...");
    app(probot);
    console.log("   ✅ App initialized successfully");

    console.log("\n✅ All server tests passed!");
    console.log("\nYou can now run 'npm run dev' to start the server.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Server test failed:");
    console.error(error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testServer();

