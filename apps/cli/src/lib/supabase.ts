import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { FileStorage } from "./auth/storage";

let supabaseClient: SupabaseClient | null = null;
let initAttempted = false;

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

export function isSupabaseConfigured(): boolean {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (initAttempted && !supabaseClient) {
    throw new SupabaseConfigError(
      "Supabase client initialization failed previously",
    );
  }

  initAttempted = true;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new SupabaseConfigError(
      "Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file",
    );
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: FileStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export function __resetSupabaseClient(): void {
  supabaseClient = null;
  initAttempted = false;
}
