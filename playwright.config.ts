import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ["list"],
    ["html", { outputFolder: "./tests/ui/reports", open: "never" }],
  ],

  outputDir: "./tests/ui/test-results",

  timeout: 30_000,

  projects: [
    {
      name: "chromium",
      testDir: "./tests/ui/specs",
      use: {
        baseURL: process.env.UI_BASE_URL ?? "https://www.saucedemo.com",
        headless: true,
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "on-first-retry",
        actionTimeout: 10_000,
        ...devices["Desktop Chrome"],
      },
    },
    // Uncomment to run against Firefox when needed (run: npx playwright install firefox):
    // {
    //   name: "firefox",
    //   testDir: "./tests/ui/specs",
    //   use: {
    //     baseURL: process.env.UI_BASE_URL ?? "https://www.saucedemo.com",
    //     headless: true,
    //     screenshot: "only-on-failure",
    //     video: "retain-on-failure",
    //     trace: "on-first-retry",
    //     actionTimeout: 10_000,
    //     ...devices["Desktop Firefox"],
    //   },
    // },
  ],
});
