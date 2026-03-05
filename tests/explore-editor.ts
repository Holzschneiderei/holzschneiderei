/**
 * Explore the Wix Studio editor and navigate to the Garderobe-bestellen page.
 * Takes screenshots and dumps DOM info for automation planning.
 */
import { chromium, type Page } from "@playwright/test";
import * as fs from "fs";

const WIX_STUDIO_URL =
  "https://editor.wix.com/studio/da83f9e6-246c-497c-8da0-70843f9f876b?metaSiteId=2af4037d-1760-49e9-8417-72e667bd32dd";

const USER_DATA_DIR = "./auth/chrome-profile";
const OUT_DIR = "./screenshots";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function shot(page: Page, name: string) {
  const p = `${OUT_DIR}/${name}.png`;
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${name}.png`);
  return p;
}

(async () => {
  ensureDir(OUT_DIR);
  console.log("🚀 Launching editor...\n");

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1920, height: 1080 },
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
    ],
  });

  const page = context.pages()[0] || await context.newPage();

  // Keep browser open even on error
  const keepOpen = async () => {
    console.log("\n🔎 Browser stays open. Press Ctrl+C to close.\n");
    await new Promise<void>(resolve => {
      context.on("close", () => resolve());
      process.on("SIGINT", async () => { await context.close(); resolve(); });
    });
  };

  try {
    await page.goto(WIX_STUDIO_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    if (page.url().includes("signin") || page.url().includes("login")) {
      console.log("❌ Not logged in. Run npm run wix:login first.");
      await context.close();
      process.exit(1);
    }

    console.log("✅ Editor loading...");
    await page.waitForTimeout(15000);
    await shot(page, "explore-01-loaded");
    console.log(`  URL: ${page.url()}`);
    console.log(`  Title: ${await page.title()}`);

    // ── Step 1: Find all buttons ──
    console.log("\n🔘 Visible buttons:");
    const buttons = await page.locator('button:visible').all();
    for (const btn of buttons.slice(0, 40)) {
      try {
        const text = (await btn.textContent() || '').trim().substring(0, 60);
        const label = await btn.getAttribute('aria-label');
        const hook = await btn.getAttribute('data-hook');
        if (text || label || hook) {
          console.log(`  btn: text="${text}" label="${label}" hook="${hook}"`);
        }
      } catch { }
    }

    // ── Step 2: Find the pages panel ──
    // Look for the page selector dropdown (top-left, currently showing "Coming So...")
    console.log("\n📄 Looking for page selector...");

    // Try clicking the page name dropdown in the top-left
    const pageDropdownSelectors = [
      // The top-left page selector
      'button:has-text("Coming So")',
      '[data-hook="page-selector"]',
      '[data-hook="pages-dropdown"]',
      '[class*="page-selector"]',
      '[class*="pageSelector"]',
    ];

    let clicked = false;
    for (const sel of pageDropdownSelectors) {
      try {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 2000 })) {
          await el.click();
          clicked = true;
          console.log(`  ✅ Clicked: ${sel}`);
          break;
        }
      } catch { }
    }

    if (!clicked) {
      // Try the left sidebar pages icon (looks like stacked pages icon)
      // From the screenshot, it's one of the icons in the left sidebar
      console.log("  Trying left sidebar icons...");
      const sidebarBtns = await page.locator('nav button, [role="tablist"] button, aside button').all();
      for (const btn of sidebarBtns.slice(0, 15)) {
        try {
          const label = await btn.getAttribute('aria-label');
          const text = (await btn.textContent() || '').trim();
          console.log(`    sidebar btn: label="${label}" text="${text}"`);
          if (label && (label.toLowerCase().includes('page') || label.toLowerCase().includes('seit'))) {
            await btn.click();
            clicked = true;
            console.log(`    ✅ Clicked pages button: ${label}`);
            break;
          }
        } catch { }
      }
    }

    await page.waitForTimeout(2000);
    await shot(page, "explore-02-pages-panel");

    // ── Step 3: Look for "garderobe" in the page list ──
    console.log("\n🔍 Searching for 'garderobe' in page list...");

    // Search for any text containing "garderobe" or "bestellen"
    const garderobeElements = await page.locator('text=/garderobe/i').all();
    console.log(`  Found ${garderobeElements.length} elements with 'garderobe'`);

    const bestellenElements = await page.locator('text=/bestellen/i').all();
    console.log(`  Found ${bestellenElements.length} elements with 'bestellen'`);

    // Also look for all clickable items that might be pages
    const pageItems = await page.locator('[data-hook*="page"], [class*="page-item"], [class*="pageItem"], a[href*="page"]').all();
    console.log(`  Found ${pageItems.length} page-like items`);
    for (const item of pageItems.slice(0, 10)) {
      try {
        const text = (await item.textContent() || '').trim().substring(0, 50);
        console.log(`    Page item: "${text}"`);
      } catch { }
    }

    // List all text content visible that might be page names
    const allLinks = await page.locator('[role="treeitem"], [role="option"], [role="menuitem"], [role="listitem"]').all();
    console.log(`\n  Tree/list items found: ${allLinks.length}`);
    for (const link of allLinks.slice(0, 20)) {
      try {
        const text = (await link.textContent() || '').trim().substring(0, 60);
        if (text) console.log(`    item: "${text}"`);
      } catch { }
    }

    // ── Step 4: List all frames ──
    console.log("\n📦 Frames:");
    const frames = page.frames();
    for (const frame of frames) {
      const url = frame.url();
      if (url && url !== 'about:blank') {
        console.log(`  ${url.substring(0, 120)}`);
      }
    }

    // ── Step 5: Dump key DOM structure ──
    console.log("\n🏗️ Key DOM selectors:");
    const keySelectors = [
      { name: 'data-hook elements', sel: '[data-hook]' },
      { name: 'data-aid elements', sel: '[data-aid]' },
      { name: 'data-comp-id elements', sel: '[data-comp-id]' },
      { name: 'aria-label elements', sel: '[aria-label]' },
    ];
    for (const { name, sel } of keySelectors) {
      try {
        const count = await page.locator(sel).count();
        console.log(`  ${name}: ${count}`);
      } catch { }
    }

    // Dump unique data-hook values
    console.log("\n🪝 Unique data-hook values:");
    const hooks = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-hook]');
      const hookSet = new Set<string>();
      elements.forEach(el => {
        const hook = el.getAttribute('data-hook');
        if (hook) hookSet.add(hook);
      });
      return [...hookSet].sort();
    });
    for (const h of hooks.slice(0, 50)) {
      console.log(`  ${h}`);
    }

    await shot(page, "explore-03-final");

    console.log("\n✅ Exploration complete!");
    await keepOpen();

  } catch (err) {
    console.error("💥 Error:", err);
    await shot(page, "explore-error").catch(() => {});
    await keepOpen();
  }
})();
