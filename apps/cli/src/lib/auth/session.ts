import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const CONFIG_DIR = path.join(os.homedir(), ".dxgen");
const SESSION_FILE = path.join(CONFIG_DIR, "session.json");

export async function ensureConfigDir() {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export async function writeSessionFile(data: string) {
  await ensureConfigDir();
  await fs.writeFile(SESSION_FILE, data, {
    encoding: "utf-8",
    mode: 0o600,
  });
}

export async function readSessionFile(): Promise<string | null> {
  try {
    return await fs.readFile(SESSION_FILE, "utf-8");
  } catch (_error) {
    return null;
  }
}

export async function deleteSessionFile() {
  try {
    await fs.unlink(SESSION_FILE);
  } catch {
  }
}

export function getSessionFilePath(): string {
  return SESSION_FILE;
}
