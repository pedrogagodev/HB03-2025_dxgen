import type { Context } from "probot";

export interface PRContext {
  prNumber: number;
  title: string;
  description: string;
  author: string;
  modifiedFiles: string[];
  baseBranch: string;
  headBranch: string;
  repoOwner: string;
  repoName: string;
  repoFullName: string;
}

/**
 * Extract PR context from webhook payload
 */
export async function extractPRContext(
  context: Context<"pull_request.opened">,
): Promise<PRContext> {
  const { pull_request, repository } = context.payload;

  // Get list of modified files
  const files = await context.octokit.pulls.listFiles({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: pull_request.number,
    per_page: 100,
  });

  const modifiedFiles = files.data.map((file) => file.filename);

  return {
    prNumber: pull_request.number,
    title: pull_request.title,
    description: pull_request.body || "",
    author: pull_request.user.login,
    modifiedFiles,
    baseBranch: pull_request.base.ref,
    headBranch: pull_request.head.ref,
    repoOwner: repository.owner.login,
    repoName: repository.name,
    repoFullName: repository.full_name,
  };
}

/**
 * Build a RAG query focused on the modified files in the PR
 */
export function buildPRFocusedQuery(prContext: PRContext): string {
  const fileList = prContext.modifiedFiles.slice(0, 20).join(", ");
  
  return `Retrieve context for a pull request that modifies the following files: ${fileList}. 
Focus on: configuration files, entry points, related modules, and dependencies of these modified files.
Pull request: "${prContext.title}"`;
}

