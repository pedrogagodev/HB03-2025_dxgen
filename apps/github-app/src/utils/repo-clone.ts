import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Context } from "probot";

export interface ClonedRepo {
  path: string;
  cleanup: () => void;
}

/**
 * Clone a repository to a temporary directory
 */
export async function cloneRepository(
  context: Context<"pull_request.opened">,
): Promise<ClonedRepo> {
  const { repository, pull_request } = context.payload;

  // Create a temporary directory
  const tempDir = mkdtempSync(join(tmpdir(), "dxgen-"));

  const logger = context.log;
  logger.info(`[Clone] Cloning repository to ${tempDir}`);
  logger.info(`[Clone] Repository: ${repository.full_name}`);
  logger.info(`[Clone] Branch: ${pull_request.head.ref}`);
  logger.info(
    `[Clone] Clone URL: ${repository.clone_url.replace(/:[^@]*@/, ":***@")}`,
  );

  try {
    // Get installation token for authentication
    const { token } = (await context.octokit.auth({
      type: "installation",
    })) as { token: string };

    // Clone the repository using the head branch
    const cloneUrl = repository.clone_url.replace(
      "https://",
      `https://x-access-token:${token}@`,
    );

    execSync(
      `git clone --depth=1 --branch=${pull_request.head.ref} ${cloneUrl} ${tempDir}`,
      {
        stdio: "pipe",
        timeout: 60000, // 60 second timeout
      },
    );

    logger.info(
      `[Clone] Repository ${repository.full_name} cloned successfully`,
    );
    logger.info(`[Clone] Cloned path: ${tempDir}`);

    return {
      path: tempDir,
      cleanup: () => {
        try {
          rmSync(tempDir, { recursive: true, force: true });
          logger.info(`Cleaned up temporary directory: ${tempDir}`);
        } catch (error) {
          logger.error(
            { err: error },
            `Failed to cleanup directory ${tempDir}`,
          );
        }
      },
    };
  } catch (error) {
    // Cleanup on error
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to clone repository: ${(error as Error).message}`);
  }
}
