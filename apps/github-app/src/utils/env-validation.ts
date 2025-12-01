/**
 * Environment variable validation
 *
 * Validates that required environment variables are set based on
 * whether Edge Functions are being used or direct API calls.
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate environment variables for GitHub App
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Always required
  const APP_ID = process.env.APP_ID;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!APP_ID) {
    errors.push("APP_ID is required");
  } else if (!/^\d+$/.test(APP_ID)) {
    errors.push("APP_ID must be a number");
  }

  if (!PRIVATE_KEY) {
    errors.push("PRIVATE_KEY is required");
  } else if (!PRIVATE_KEY.includes("BEGIN RSA PRIVATE KEY")) {
    warnings.push("PRIVATE_KEY doesn't appear to be a valid RSA private key");
  }

  if (!WEBHOOK_SECRET) {
    errors.push("WEBHOOK_SECRET is required");
  }

  // Check if Edge Functions are configured
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const GITHUB_APP_SERVICE_TOKEN = process.env.GITHUB_APP_SERVICE_TOKEN;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  const usingEdgeFunctions = !!(SUPABASE_URL && GITHUB_APP_SERVICE_TOKEN);

  if (usingEdgeFunctions) {
    // Edge Functions mode - these are required
    if (!SUPABASE_URL) {
      errors.push("SUPABASE_URL is required when using Edge Functions");
    }

    if (!GITHUB_APP_SERVICE_TOKEN) {
      errors.push(
        "GITHUB_APP_SERVICE_TOKEN is required when using Edge Functions",
      );
    }

    if (!SUPABASE_ANON_KEY) {
      warnings.push(
        "SUPABASE_ANON_KEY is recommended when using Edge Functions",
      );
    }

    // These should NOT be set when using Edge Functions
    if (process.env.OPENAI_API_KEY) {
      warnings.push(
        "OPENAI_API_KEY is set but not needed when using Edge Functions (keys are in Supabase)",
      );
    }

    if (process.env.PINECONE_API_KEY) {
      warnings.push(
        "PINECONE_API_KEY is set but not needed when using Edge Functions (keys are in Supabase)",
      );
    }
  } else {
    // Direct mode - API keys are required
    if (!process.env.OPENAI_API_KEY) {
      errors.push(
        "OPENAI_API_KEY is required when not using Edge Functions. " +
          "Either set OPENAI_API_KEY or configure Edge Functions (SUPABASE_URL, GITHUB_APP_SERVICE_TOKEN)",
      );
    }

    if (!process.env.PINECONE_API_KEY) {
      errors.push(
        "PINECONE_API_KEY is required when not using Edge Functions. " +
          "Either set PINECONE_API_KEY or configure Edge Functions (SUPABASE_URL, GITHUB_APP_SERVICE_TOKEN)",
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and throw if invalid
 */
export function requireValidEnvironment(): void {
  const validation = validateEnvironment();

  if (!validation.valid) {
    console.error("\n❌ Environment Validation Failed\n");
    validation.errors.forEach((error) => {
      console.error(`  • ${error}`);
    });
    console.error(
      "\nPlease check your .env file or Railway environment variables.\n",
    );
    throw new Error("Invalid environment configuration");
  }

  if (validation.warnings.length > 0) {
    console.warn("\n⚠️  Environment Warnings\n");
    validation.warnings.forEach((warning) => {
      console.warn(`  • ${warning}`);
    });
    console.warn("");
  }
}
