import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  outDir: "dist",
  platform: "node",
  target: "node18",
  // Mark workspace packages and problematic dependencies as external
  external: ["@repo/rag", "@repo/ai", "globby", "fast-glob"],
});
