import dotenv from "dotenv";
import path from "path";
import type { Config } from "jest";

// Load .env before Jest runs so API_BASE_URL and API_KEY are available in tests to use
dotenv.config({ path: path.resolve(__dirname, ".env") });

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Only look in tests/api – Playwright owns tests/ui so we keep them separate
  roots: ["<rootDir>/tests/api"],
  testMatch: ["**/*.test.ts"],

  reporters: [
    "default", // standard terminal output
    [
      "jest-html-reporter",
      {
        pageTitle: "API Test Report",
        outputPath: "tests/api/reports/api-report.html",
        includeFailureMsg: true,  // show assertion errors in the HTML report
        includeConsoleLog: true,
      },
    ],
  ],

  // API calls timeout, 15 seconds being set as default for now
  testTimeout: 15_000,
  verbose: true,
};

export default config;
