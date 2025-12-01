// IMPORTANT: Load .env before importing @repo/ai which uses environment variables
import "../env-loader.js";

import type { Context } from "probot";
import { extractPRContext } from "../utils/pr-context";
import { getRagDocumentsForPR } from "../utils/rag-integration";
import { generateSummary, buildProjectContext } from "@repo/ai";
import {
  formatSummaryComment,
  formatErrorComment,
} from "../utils/comment-formatter";
import { cloneRepository } from "../utils/repo-clone";
import {
  callGenerateSummary,
  shouldUseEdgeFunctions,
  type GenerateSummaryRequest,
} from "../utils/edge-function-client";
import type { GenerateResult } from "@repo/ai";

/**
 * Handle pull_request.opened event
 */
export async function handlePROpened(
  context: Context<"pull_request.opened">,
): Promise<void> {
  const logger = context.log;
  logger.info("Pull request opened, starting documentation generation");

  let cleanup: (() => void) | undefined;

  try {
    // Step 1: Extract PR context
    logger.info("Extracting PR context...");
    const prContext = await extractPRContext(context);
    logger.info(`PR #${prContext.prNumber}: ${prContext.title}`);
    logger.info(
      `Repository: ${prContext.repoFullName} (owner: ${prContext.repoOwner}, name: ${prContext.repoName})`,
    );
    logger.info(`Modified files: ${prContext.modifiedFiles.length}`);

    // Step 2: Clone repository to temporary directory
    logger.info("Cloning repository...");
    const clonedRepo = await cloneRepository(context);
    cleanup = clonedRepo.cleanup;
    const rootDir = clonedRepo.path;
    logger.info(`Repository cloned to: ${rootDir}`);
    logger.info(`Using rootDir for RAG pipeline: ${rootDir}`);

    // Step 3: Run RAG pipeline to get relevant documents
    logger.info("Running RAG pipeline...");
    logger.info(
      `RAG pipeline will process repository: ${prContext.repoFullName}`,
    );
    const documents = await getRagDocumentsForPR({
      rootDir,
      prContext,
      userId: prContext.repoOwner, // Use repo owner as userId
    });
    logger.info(
      `Retrieved ${documents.length} relevant documents from repository ${prContext.repoFullName}`,
    );

    // Step 4: Build project context from cloned repository
    logger.info("Building project context from cloned repository...");
    logger.info(`Building projectContext using rootPath: ${rootDir}`);
    const projectContext = await buildProjectContext(rootDir, {
      stack: undefined, // Will be detected if needed
    });
    logger.info(
      `ProjectContext built successfully for ${prContext.repoFullName}`,
    );

    // Step 5: Generate summary
    logger.info("Generating documentation summary...");
    logger.info(
      `Generating summary for repository: ${prContext.repoFullName} using rootPath: ${rootDir}`,
    );

    let result: GenerateResult;

    // Use Edge Functions if configured, otherwise use direct call
    if (shouldUseEdgeFunctions()) {
      logger.info("Using Edge Functions for summary generation");

      const request: GenerateSummaryRequest = {
        rootPath: rootDir,
        outputDir: "docs",
        style: `Technical summary focused on PR changes. PR Title: "${prContext.title}". Modified files: ${prContext.modifiedFiles.slice(0, 10).join(", ")}`,
        documents: documents.map((doc) => ({
          pageContent: doc.pageContent,
          metadata: doc.metadata,
        })),
        projectContext: projectContext
          ? {
              rootPath: projectContext.rootPath,
              packages: projectContext.packages,
              structure: projectContext.structure,
              configFiles: projectContext.configFiles,
              existingDocs: projectContext.existingDocs,
              stack: projectContext.stack,
            }
          : undefined,
      };

      const edgeResult = await callGenerateSummary(request);
      result = {
        kind: edgeResult.kind as GenerateResult["kind"],
        content: edgeResult.content,
        suggestedPath: edgeResult.suggestedPath,
      };
    } else {
      logger.info(
        "Using direct summary generation (Edge Functions not configured)",
      );
      result = await generateSummary({
        rootPath: rootDir,
        outputDir: "docs",
        style: `Technical summary focused on PR changes. PR Title: "${prContext.title}". Modified files: ${prContext.modifiedFiles.slice(0, 10).join(", ")}`,
        documents,
        projectContext,
      });
    }

    logger.info("Summary generated successfully");

    // Step 6: Format comment
    const commentBody = formatSummaryComment(result.content, prContext);

    // Step 7: Post comment
    logger.info("Posting comment to PR...");
    await context.octokit.issues.createComment({
      owner: prContext.repoOwner,
      repo: prContext.repoName,
      issue_number: prContext.prNumber,
      body: commentBody,
    });
    logger.info("Comment posted successfully");

    // Step 8: Create success check
    await context.octokit.checks.create({
      owner: prContext.repoOwner,
      repo: prContext.repoName,
      name: "DXGen Documentation",
      head_sha: context.payload.pull_request.head.sha,
      status: "completed",
      conclusion: "success",
      output: {
        title: "Documentation Generated",
        summary: `Generated documentation for ${prContext.modifiedFiles.length} modified files`,
      },
    });
    logger.info("Check created successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ err: error }, "Error handling PR opened event");

    // Try to extract PR context for error comment
    try {
      const prContext = await extractPRContext(context);
      const errorComment = formatErrorComment(
        error instanceof Error ? error : new Error(errorMessage),
        prContext,
      );

      await context.octokit.issues.createComment({
        owner: prContext.repoOwner,
        repo: prContext.repoName,
        issue_number: prContext.prNumber,
        body: errorComment,
      });

      // Create failure check
      await context.octokit.checks.create({
        owner: prContext.repoOwner,
        repo: prContext.repoName,
        name: "DXGen Documentation",
        head_sha: context.payload.pull_request.head.sha,
        status: "completed",
        conclusion: "failure",
        output: {
          title: "Documentation Generation Failed",
          summary: errorMessage,
        },
      });
    } catch (commentError) {
      logger.error({ err: commentError }, "Failed to post error comment");
    }

    // Re-throw to ensure Probot logs the error
    throw error;
  } finally {
    // Always cleanup cloned repository
    if (cleanup) {
      cleanup();
    }
  }
}
