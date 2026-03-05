/**
 * Opens the Wix Studio editor using the persistent browser profile.
 * Requires a prior login via:  npm run wix:login
 *
 * Usage:  npx playwright test tests/open-editor.ts --headed
 */
import { chromium } from "@playwright/test";

const WIX_STUDIO_URL =
  "https://editor.wix.com/studio/da83f9e6-246c-497c-8da0-70843f9f876b?metaSiteId=2af4037d-1760-49e9-8417-72e667bd32dd";

(async () => {
  const userDataDir = "./auth/chrome-profile";

  console.log("🚀 Opening Wix Studio Editor...\n");

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1920, height: 1080 },
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
    ],
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(WIX_STUDIO_URL, { waitUntil: "domcontentloaded" });

  // Check if we got redirected to login
  await page.waitForTimeout(3000);
  const url = page.url();

  if (url.includes("users.wix.com/signin") || url.includes("login")) {
    console.log("❌ Redirected to login! Run  npm run wix:login  first.");
    await context.close();
    process.exit(1);
  }

  console.log(`📍 Editor URL: ${url}`);

  // Take a screenshot
  await page.screenshot({ path: "screenshots/editor-loaded.png" });
  console.log("📸 Screenshot saved to screenshots/editor-loaded.png");

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  Editor is open! Work in the browser window.  ║");
  console.log("║  Press Ctrl+C in terminal when done.          ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // Keep alive — wait for browser to close
  await new Promise((resolve) => {
    context.on("close", resolve);
    // Also handle Ctrl+C gracefully
    process.on("SIGINT", async () => {
      await context.close();
      resolve(undefined);
    });
  });
})();
