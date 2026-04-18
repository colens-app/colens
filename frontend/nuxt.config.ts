import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/icon"],
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  compatibilityDate: "2025-07-15",
  vite: {
    plugins: [
      // @ts-expect-error - Nuxt build issue with types
      tailwindcss(),
    ],
  },
  eslint: {
    config: {
      stylistic: {
        braceStyle: "1tbs",
        indent: 2,
        quotes: "double",
        semi: false,
        quoteProps: "consistent-as-needed",
        commaDangle: "always-multiline",
      },
    },
  },
})
