import { defineConfig } from "@playwright/test";

const chrome = process.env.CHROME_PATH;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 390, height: 844 },
    ...(chrome ? { launchOptions: { executablePath: chrome } } : {}),
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    port: 4173,
    reuseExistingServer: false,
  },
});
