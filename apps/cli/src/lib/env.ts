import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

import dotenv from "dotenv";

let envLoaded = false;

export function loadEnv(): void {
  if (envLoaded) {
    return;
  }

  const envPaths = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../.env"),
    resolve(process.cwd(), "../../.env"),
    resolve(import.meta.dirname, "../../../.env"),
    resolve(import.meta.dirname, "../../../../.env"),
    join(homedir(), ".dxgen", ".env"),
  ];

  let loaded = false;
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath });
      envLoaded = true;
      loaded = true;
      return;
    }
  }

  if (!loaded && process.env.NODE_ENV !== "production") {
    console.warn("⚠️  No .env file found. Using environment variables only.");
  }

  envLoaded = true;
}

export function __resetEnvLoaded(): void {
  envLoaded = false;
}

export function isEnvLoaded(): boolean {
  return envLoaded;
}
