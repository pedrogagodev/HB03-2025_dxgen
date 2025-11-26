import { describe, expect, it } from "vitest";

import { chunkProjectFiles } from "./chunker.js";
import type { ProjectFile } from "./types.js";

const buildFile = (content: string): ProjectFile => ({
  fullPath: "/repo/src/example.ts",
  relativePath: "src/example.ts",
  size: content.length,
  content,
});

describe("chunkProjectFiles", () => {
  it("splits content and preserves source metadata", async () => {
    const file = buildFile("const a = 1;\nconst b = 2;\nconst c = 3;\n");
    const chunks = await chunkProjectFiles([file], {
      chunkSize: 12,
      chunkOverlap: 0,
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].metadata.relativePath).toBe("src/example.ts");
    expect(chunks[0].metadata.startLine).toBe(1);
    expect(chunks.at(-1)?.metadata.endLine).toBeGreaterThanOrEqual(2);
  });
});
