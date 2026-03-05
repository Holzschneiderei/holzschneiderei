import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  use: {
    headless: false,
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 30_000,
    baseURL: "https://www.wix.com",
    browserName: "chromium",
  },
  projects: [
    {
      name: "auth-setup",
      testMatch: "auth-setup.spec.ts",
      // No storageState — this is the login step
    },
    {
      name: "editor",
      testMatch: "open-editor.spec.ts",
      use: { storageState: "./auth/wix-session.json" },
    },
  ],
});
