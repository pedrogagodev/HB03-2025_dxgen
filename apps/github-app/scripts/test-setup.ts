#!/usr/bin/env tsx
/**
 * Test script to validate GitHub App setup and configuration
 * Run with: npm run test:setup
 */

import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const monorepoRoot = join(rootDir, "../..");

// Load .env from app directory or monorepo root
const localEnvPath = join(rootDir, ".env");
const monorepoEnvPath = join(monorepoRoot, ".env");

if (existsSync(localEnvPath)) {
  config({ path: localEnvPath });
} else if (existsSync(monorepoEnvPath)) {
  config({ path: monorepoEnvPath });
}

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean | string): void {
  try {
    const result = fn();
    if (typeof result === "string") {
      results.push({ name, passed: false, message: result });
    } else if (result) {
      results.push({ name, passed: true, message: "✓ Passed" });
    } else {
      results.push({ name, passed: false, message: "✗ Failed" });
    }
  } catch (error) {
    results.push({
      name,
      passed: false,
      message: `✗ Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

// Test 1: Check if .env file exists
test("Environment file exists", () => {
  const localEnvPath = join(rootDir, ".env");
  const monorepoEnvPath = join(monorepoRoot, ".env");
  
  if (existsSync(localEnvPath)) {
    return true; // Found in app directory
  }
  
  if (existsSync(monorepoEnvPath)) {
    return true; // Found in monorepo root
  }
  
  return "Create a .env file in apps/github-app/ or in the monorepo root";
});

// Test 2: Check required environment variables
test("Required environment variables are set", () => {
  const required = [
    "APP_ID",
    "PRIVATE_KEY",
    "WEBHOOK_SECRET",
    "OPENAI_API_KEY",
    "PINECONE_API_KEY",
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    return `Missing environment variables: ${missing.join(", ")}`;
  }

  // Validate PRIVATE_KEY format
  const privateKey = process.env.PRIVATE_KEY || "";
  if (!privateKey.includes("BEGIN RSA PRIVATE KEY") && !privateKey.includes("BEGIN PRIVATE KEY")) {
    return "PRIVATE_KEY doesn't appear to be a valid RSA private key";
  }

  return true;
});

// Test 3: Check if dependencies are installed
test("Dependencies are installed", () => {
  // Check both local and monorepo root node_modules
  const localNodeModules = join(rootDir, "node_modules");
  const monorepoRoot = join(rootDir, "../..");
  const monorepoNodeModules = join(monorepoRoot, "node_modules");
  
  if (!existsSync(localNodeModules) && !existsSync(monorepoNodeModules)) {
    return "Run 'npm install' from monorepo root to install dependencies";
  }
  return true;
});

// Test 4: Check if source files exist
test("Source files exist", () => {
  const requiredFiles = [
    "src/index.ts",
    "src/handlers/pr-opened.handler.ts",
    "src/utils/pr-context.ts",
    "src/utils/rag-integration.ts",
    "src/utils/comment-formatter.ts",
    "src/utils/repo-clone.ts",
  ];

  const missing: string[] = [];

  for (const file of requiredFiles) {
    const filePath = join(rootDir, file);
    if (!existsSync(filePath)) {
      missing.push(file);
    }
  }

  if (missing.length > 0) {
    return `Missing source files: ${missing.join(", ")}`;
  }

  return true;
});

// Test 5: Try to import main modules
test("Can import main modules", async () => {
  try {
    // Try importing the main app
    await import("../src/index.ts");
    return true;
  } catch (error) {
    return `Failed to import modules: ${error instanceof Error ? error.message : String(error)}`;
  }
});

// Test 6: Check if TypeScript compiles
test("TypeScript configuration is valid", () => {
  const tsconfigPath = join(rootDir, "tsconfig.json");
  if (!existsSync(tsconfigPath)) {
    return "tsconfig.json is missing";
  }

  try {
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
    if (!tsconfig.compilerOptions) {
      return "tsconfig.json is missing compilerOptions";
    }
    return true;
  } catch (error) {
    return `Invalid tsconfig.json: ${error instanceof Error ? error.message : String(error)}`;
  }
});

// Test 7: Validate package.json
test("package.json is valid", () => {
  const packageJsonPath = join(rootDir, "package.json");
  if (!existsSync(packageJsonPath)) {
    return "package.json is missing";
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    if (!packageJson.scripts || !packageJson.scripts.dev) {
      return "package.json is missing required scripts";
    }
    return true;
  } catch (error) {
    return `Invalid package.json: ${error instanceof Error ? error.message : String(error)}`;
  }
});

// Test 8: Check if Probot can be imported
test("Probot dependency is available", async () => {
  try {
    await import("probot");
    return true;
  } catch (error) {
    return `Probot not found. Run 'npm install': ${error instanceof Error ? error.message : String(error)}`;
  }
});

// Test 9: Check if internal packages are available
test("Internal packages (@repo/ai, @repo/rag) are available", async () => {
  try {
    await import("@repo/ai");
    await import("@repo/rag");
    return true;
  } catch (error) {
    return `Internal packages not found. Run 'npm install' from monorepo root: ${error instanceof Error ? error.message : String(error)}`;
  }
});

// Print results
console.log("\n🧪 GitHub App Setup Test\n");
console.log("=" .repeat(50));

for (const result of results) {
  const icon = result.passed ? "✅" : "❌";
  console.log(`${icon} ${result.name}`);
  if (!result.passed) {
    console.log(`   ${result.message}`);
  }
}

console.log("=" .repeat(50));

const passed = results.filter((r) => r.passed).length;
const total = results.length;

console.log(`\nResults: ${passed}/${total} tests passed\n`);

if (passed === total) {
  console.log("🎉 All tests passed! Your setup looks good.");
  console.log("\nNext steps:");
  console.log("1. Make sure your GitHub App is created and configured");
  console.log("2. Install the app on your test repository");
  console.log("3. Run 'npm run dev' to start the development server");
  console.log("4. Use smee.io to proxy webhooks for local testing");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed. Please fix the issues above.");
  process.exit(1);
}

