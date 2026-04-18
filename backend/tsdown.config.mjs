import { defineConfig } from "tsdown"
import { spawn } from "node:child_process"

export default defineConfig(options => ({
  entry: ["./src/index.ts"],
  clean: true,
  outDir: "./dist",
  format: "esm",
  platform: "node",

  // Only generate source maps in watch mode (dev)
  sourcemap: options.watch,
}))
