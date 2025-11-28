import { createHash } from "node:crypto";
import type { Document } from "@langchain/core/documents";
import type { DetectedStack } from "../types";

class StackCache {
  private cache = new Map<
    string,
    { stack: DetectedStack; timestamp: number }
  >();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(documents: Document[]): string {
    if (documents.length === 0) {
      return "empty";
    }

    const keyData = documents
      .map((doc) => {
        const id = doc.metadata?.vectorId ?? doc.metadata?.path ?? "";
        const preview = doc.pageContent.slice(0, 100);
        return `${id}:${preview}`;
      })
      .join("|");

    return createHash("sha256").update(keyData).digest("hex").slice(0, 16);
  }

  get(documents: Document[]): DetectedStack | null {
    const key = this.getCacheKey(documents);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    if (age > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return cached.stack;
  }

  set(documents: Document[], stack: DetectedStack): void {
    const key = this.getCacheKey(documents);
    this.cache.set(key, { stack, timestamp: Date.now() });
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL_MS) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const stackCache = new StackCache();
