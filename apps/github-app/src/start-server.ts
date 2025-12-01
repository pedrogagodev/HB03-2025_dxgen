/**
 * Start Probot server manually
 */

// Load .env first
import { config } from "dotenv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appRoot = join(__dirname, "..");
const monorepoRoot = join(appRoot, "../..");

config({ path: join(appRoot, ".env") });
config({ path: join(monorepoRoot, ".env") });

import { run } from "probot";
import app from "./index.js";

// Verify environment variables are loaded
if (!process.env.APP_ID || !process.env.PRIVATE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   APP_ID and PRIVATE_KEY are required");
  process.exit(1);
}

// Set PORT in process.env if not set
if (!process.env.PORT) {
  process.env.PORT = "3001";
}

const port = parseInt(process.env.PORT, 10);

// Log environment check
console.log("🔍 Verificando configuração:");
console.log(`   APP_ID: ${process.env.APP_ID ? "✅" : "❌"}`);
console.log(`   PRIVATE_KEY: ${process.env.PRIVATE_KEY ? "✅" : "❌"}`);
console.log(`   PORT: ${port}`);
console.log(`   Webhook Path: /\n`);

// Set WEBHOOK_PATH environment variable
process.env.WEBHOOK_PATH = "/";

// Use Probot's run function - it reads webhookPath from WEBHOOK_PATH env var
run(app).then((server) => {
  const actualPort = server.expressApp.get("port") || port;
  console.log(`🚀 Probot server running on http://localhost:${actualPort}`);
  console.log(`📡 Webhook endpoint: http://localhost:${actualPort}/`);
  console.log(`\n✅ Server is running. Press Ctrl+C to stop.\n`);
  console.log(`💡 IMPORTANTE: Reinicie o servidor se ainda estiver rodando!\n`);
}).catch((error) => {
  console.error("❌ Failed to start server:", error);
  if (error instanceof Error && error.stack) {
    console.error("\nStack trace:");
    console.error(error.stack);
  }
  process.exit(1);
});
