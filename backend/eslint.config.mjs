// @ts-check

import js from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"

import tseslint from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin"

export default defineConfig(
  globalIgnores(["dist/**", "node_modules/**"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    semi: false,
    braceStyle: "1tbs",
    commaDangle: "always-multiline",
    quoteProps: "consistent-as-needed",
  }),
  {
    name: "@colens/typescript-eslint",
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    name: "@colens/globals",
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
)
