import { existsSync } from "node:fs";
import { resolve } from "node:path";

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
  ];

  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath });
      envLoaded = true;
      return;
    }
  }

  envLoaded = true;
}
