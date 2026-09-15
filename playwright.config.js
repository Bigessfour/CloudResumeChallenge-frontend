import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:8000",
    trace: "on-first-retry",
    // Local runs use the installed Chrome so we do not re-download Playwright's
    // Chromium build. CI still installs bundled Chromium via `npx playwright install`.
    channel: process.env.CI ? undefined : "chrome",
  },
  webServer: {
    command: "python3 -m http.server 8000 --bind 127.0.0.1",
    url: "http://127.0.0.1:8000",
    reuseExistingServer: !process.env.CI,
  },
});
