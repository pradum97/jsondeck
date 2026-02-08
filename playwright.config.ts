import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./apps/frontend/e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4000",
    trace: "on-first-retry",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev --workspace apps/frontend",
        port: 4000,
        reuseExistingServer: !process.env.CI,
      },
});
