/**
 * Run this script ONCE to log in to Wix interactively.
 * It opens a browser, waits for you to sign in, then saves the session
 * to auth/wix-session.json so subsequent scripts skip the login step.
 *
 * Usage:  npx playwright test tests/auth-setup.spec.ts --headed
 */
import { test, expect } from "@playwright/test";
import path from "path";

test("Login to Wix and save session", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Navigate to Wix login
  await page.goto("https://users.wix.com/signin");

  // ── Wait for the user to complete login manually ──
  // You can use email + password, Google SSO, etc.
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  Please log in to Wix in the browser window  ║");
  console.log("║  The script will continue automatically once  ║");
  console.log("║  you reach the Wix dashboard.                 ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // Wait until we land on a Wix dashboard or manage page (post-login)
  await page.waitForURL(/manage\.wix\.com|www\.wix\.com\/(dashboard|my-account)/, {
    timeout: 300_000,  // 5 minutes to log in
  });

  console.log("✅ Login detected! Saving session...");

  // Save the authenticated state
  const authPath = path.resolve(__dirname, "../auth/wix-session.json");
  await context.storageState({ path: authPath });

  console.log(`✅ Session saved to ${authPath}`);
  await context.close();
});
