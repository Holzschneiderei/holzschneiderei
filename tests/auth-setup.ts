/**
 * Opens a persistent Chromium browser profile for Wix login.
 * Google allows sign-in here because it's a real browser profile, not "automated".
 *
 * Step 1: Run this once  →  npm run wix:login
 *         Sign in via Google in the browser that opens.
 *         Close the browser when done (or Ctrl+C).
 *
 * Step 2: Run the editor  →  npm run wix:editor
 *         Session is preserved in the browser profile.
 *
 * Usage:  npx playwright test tests/auth-setup.spec.ts --headed
 */
import { chromium } from "@playwright/test";

(async () => {
  const userDataDir = "./auth/chrome-profile";

  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║  A browser window will open.                       ║");
  console.log("║  Log in to Wix (Google SSO is fine here).          ║");
  console.log("║  Once you see the Wix dashboard, close the browser ║");
  console.log("║  or press Ctrl+C. Your session will be saved.      ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chrome",                                  // use real system Chrome
    headless: false,
    viewport: { width: 1440, height: 900 },
    ignoreDefaultArgs: ["--enable-automation"],          // don't expose automation
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
    ],
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://users.wix.com/signin");

  // Wait until user completes login and reaches dashboard
  try {
    await page.waitForURL(
      /manage\.wix\.com|www\.wix\.com\/(dashboard|my-account)/,
      { timeout: 300_000 } // 5 minutes
    );
    console.log("\n✅ Login successful! Session saved in ./auth/chrome-profile");
    console.log("   You can now run:  npm run wix:editor\n");
  } catch {
    console.log("\n⏳ Browser closed before reaching dashboard.");
    console.log("   If you logged in, the session may still be saved.\n");
  }

  await context.close();
})();
