import { defineConfig, devices } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const apiUrl = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:4000/api";
const collabUrl =
  process.env.PLAYWRIGHT_COLLAB_URL ?? "ws://localhost:1234";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: baseUrl,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: [
    {
      command: "cmd /c npm run dev -w server",
      url: "http://localhost:4000/health",
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        CLIENT_ORIGIN: baseUrl
      }
    },
    {
      command: "cmd /c npm run dev -w client",
      url: baseUrl,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: apiUrl,
        NEXT_PUBLIC_COLLAB_URL: collabUrl
      }
    }
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
