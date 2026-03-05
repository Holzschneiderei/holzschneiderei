/**
 * Opens the Wix Studio editor for the Holzschneiderei project.
 * Requires a saved session from auth-setup.spec.ts.
 *
 * Usage:  npx playwright test tests/open-editor.spec.ts --headed
 */
import { test, expect } from "@playwright/test";

const WIX_STUDIO_URL =
  "https://editor.wix.com/studio/da83f9e6-246c-497c-8da0-70843f9f876b?metaSiteId=2af4037d-1760-49e9-8417-72e667bd32dd";

test("Open Wix Studio Editor", async ({ page }) => {
  // Navigate to the Studio editor
  console.log("🚀 Navigating to Wix Studio Editor...");
  await page.goto(WIX_STUDIO_URL, { waitUntil: "domcontentloaded" });

  // Wait for the editor to load — the Wix editor canvas typically
  // renders inside an iframe or has a distinctive element.
  // We wait generously because the editor can be slow to bootstrap.
  await page.waitForLoadState("networkidle", { timeout: 60_000 }).catch(() => {
    console.log("⏳ Network didn't fully idle — editor may still be loading");
  });

  // Verify we're in the editor (not redirected to login)
  const url = page.url();
  console.log(`📍 Current URL: ${url}`);

  if (url.includes("users.wix.com/signin") || url.includes("login")) {
    throw new Error(
      "Redirected to login! Run auth-setup first:\n" +
      "  npx playwright test tests/auth-setup.spec.ts --headed"
    );
  }

  // Take a screenshot for confirmation
  await page.screenshot({ path: "screenshots/editor-loaded.png", fullPage: false });
  console.log("📸 Screenshot saved to screenshots/editor-loaded.png");

  // Keep the browser open so you can interact with the editor manually.
  // Press Ctrl+C in the terminal when you're done.
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  Editor is open! Work in the browser window.  ║");
  console.log("║  Press Ctrl+C in terminal when done.          ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // Pause keeps browser open for interactive use
  await page.pause();
});
