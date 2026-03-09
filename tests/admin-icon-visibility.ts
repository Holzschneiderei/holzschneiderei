import { chromium } from "playwright";

/**
 * E2E test: verify that toggling "Icon anzeigen" in the admin panel
 * is reflected in the customer-facing product selection (PhaseTypen).
 *
 * Uses the local harness (harness.html) which mocks the Wix CMS layer.
 * Requires dev server running: npm run dev
 *
 * Run with: npx tsx tests/admin-icon-visibility.ts
 */

const BASE_URL = "http://localhost:5173";
const SCREENSHOT_DIR = "test-screenshots";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

/**
 * Poll until the product card's icon matches the expected visibility.
 * Returns true if the condition was met within the timeout.
 */
async function waitForIconState(
  frame: ReturnType<typeof import("playwright").Page.prototype.frameLocator>,
  visible: boolean,
  timeoutMs = 8000,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const card = frame.locator('[role="radio"]', { hasText: "Garderobe" }).first();
    if ((await card.count()) > 0) {
      const iconCount = await card.locator('span[aria-hidden="true"]').count();
      if (visible && iconCount > 0) return true;
      if (!visible && iconCount === 0) return true;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const frame = page.frameLocator("#app-iframe");

  page.on("console", (msg) => {
    if (msg.text().includes("config-load")) console.log(`  [iframe] ${msg.text()}`);
  });

  // ── Step 1: Load harness, verify icon visible by default ──
  console.log("\n1. Loading harness (workflow mode)...");
  await page.goto(`${BASE_URL}/harness.html`);

  const iconVisibleDefault = await waitForIconState(frame, true);
  assert(iconVisibleDefault, "Icon is visible in workflow mode by default");
  await page.screenshot({ path: `${SCREENSHOT_DIR}/icon-01-workflow-before.png`, fullPage: true });

  // ── Step 2: Switch to admin mode ──
  console.log("\n2. Switching to admin mode...");
  await page.locator("#btn-admin").click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/icon-02-admin-initial.png`, fullPage: true });

  // ── Step 3: Navigate to "Produkte & Typen" section ──
  console.log("\n3. Navigating to Produkte section...");
  const produkteNav = frame.locator('[role="button"]', { hasText: "Produkte & Typen" }).first();
  await produkteNav.click();
  await page.waitForTimeout(500);

  // ── Step 4: Find "Icon anzeigen" toggle for the first enabled product ──
  console.log("\n4. Finding and toggling 'Icon anzeigen'...");
  const iconToggleLabel = frame.getByText("Icon anzeigen").first();
  await iconToggleLabel.waitFor({ timeout: 5000 });

  const toggleRow = iconToggleLabel.locator("..");
  const toggle = toggleRow.locator('[role="switch"]');

  const checkedBefore = await toggle.getAttribute("aria-checked");
  assert(checkedBefore === "true", "Icon toggle is ON by default in admin");

  // Click to turn OFF
  await toggle.click();
  await page.waitForTimeout(300);

  const checkedAfter = await toggle.getAttribute("aria-checked");
  assert(checkedAfter === "false", "Icon toggle is OFF after click");
  await page.screenshot({ path: `${SCREENSHOT_DIR}/icon-03-admin-toggled.png`, fullPage: true });

  // Wait for auto-save debounce (800ms) + buffer
  await page.waitForTimeout(1200);

  // ── Step 5: Switch back to workflow mode ──
  console.log("\n5. Switching to workflow mode...");
  await page.locator("#btn-workflow").click();

  // ── Step 6: Verify icon is hidden in workflow mode ──
  console.log("\n6. Verifying icon is hidden in workflow...");
  const iconHiddenAfterToggle = await waitForIconState(frame, false);
  assert(iconHiddenAfterToggle, "Icon is hidden in workflow mode after admin toggle");
  await page.screenshot({ path: `${SCREENSHOT_DIR}/icon-04-workflow-after.png`, fullPage: true });

  // ── Step 7: Reload to test persistence via harness CMS ──
  console.log("\n7. Reloading to test persistence...");

  await page.reload();

  // After reload the app renders defaults first, then receives config-load
  // from the harness. Poll until the config is applied.
  const iconHiddenAfterReload = await waitForIconState(frame, false, 10000);
  assert(iconHiddenAfterReload, "Icon remains hidden after page reload (persistence works)");
  await page.screenshot({ path: `${SCREENSHOT_DIR}/icon-05-workflow-reload.png`, fullPage: true });

  // ── Step 8: Toggle back ON and verify ──
  console.log("\n8. Toggling icon back ON...");
  await page.locator("#btn-admin").click();
  await page.waitForTimeout(1500);

  await frame.locator('[role="button"]', { hasText: "Produkte & Typen" }).first().click();
  await page.waitForTimeout(500);

  const iconToggleLabel2 = frame.getByText("Icon anzeigen").first();
  const toggleRow2 = iconToggleLabel2.locator("..");
  const toggle2 = toggleRow2.locator('[role="switch"]');
  await toggle2.click();
  await page.waitForTimeout(1200);

  await page.locator("#btn-workflow").click();

  const iconVisibleRestored = await waitForIconState(frame, true);
  assert(iconVisibleRestored, "Icon is visible again after toggling back ON");
  await page.screenshot({ path: `${SCREENSHOT_DIR}/icon-06-workflow-restored.png`, fullPage: true });

  // ── Summary ──
  console.log("\n========================================");
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log("========================================\n");

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
