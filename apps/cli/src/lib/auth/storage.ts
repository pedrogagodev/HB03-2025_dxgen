import type { SupportedStorage } from "@supabase/supabase-js";
import {
  deleteSessionFile,
  readSessionFile,
  writeSessionFile,
} from "./session";

export const FileStorage: SupportedStorage = {
  async getItem(_key: string): Promise<string | null> {
    const session = await readSessionFile();
    return session;
  },

  async setItem(_key: string, value: string): Promise<void> {
    await writeSessionFile(value);
  },

  async removeItem(_key: string): Promise<void> {
    await deleteSessionFile();
  },
};
