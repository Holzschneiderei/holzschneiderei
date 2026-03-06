import { chromium } from "@playwright/test";

/**
 * Exploratory test: click through the admin backend and take screenshots.
 * Run with: npx playwright test tests/explore-admin.ts --config=playwright-local.config.ts
 */
async function exploreAdmin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const baseURL = "http://localhost:5173";
  const screenshotDir = "test-screenshots";

  const notes: string[] = [];
  const note = (msg: string) => { notes.push(msg); console.log(`NOTE: ${msg}`); };

  await page.goto(`${baseURL}/?mode=admin`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/01-admin-products.png`, fullPage: true });

  // Check header
  const header = page.locator("header");
  const headerText = await header.textContent();
  console.log(`Header: ${headerText?.trim()}`);
  if (!headerText?.includes("Admin")) note("Header doesn't clearly say 'Admin' mode");

  // Check if preview panel is visible on desktop
  const previewAside = page.locator(".admin-with-preview-aside");
  const asideVisible = await previewAside.isVisible();
  console.log(`Preview panel visible: ${asideVisible}`);
  if (!asideVisible) note("Preview panel not visible at 1400px width — expected side-by-side layout");

  // Check FAB visibility
  const fab = page.locator(".admin-preview-fab");
  const fabVisible = await fab.isVisible();
  console.log(`Preview FAB visible: ${fabVisible}`);
  if (fabVisible) note("FAB visible on desktop — should only show on mobile");

  // Click through each section in the sidebar
  const sections = [
    "Produkte", "Produkt-Typ", "Bergmotiv", "Produktgrenzen",
    "Holzarten", "Oberflächen", "Extras", "Hakenmaterial",
    "Darstellungen", "Abmessungen", "Wizard-Schritte",
    "Preiskalkulation", "Import / Export",
  ];

  for (let i = 0; i < sections.length; i++) {
    const label = sections[i];
    const btn = page.locator(".admin-sidebar button", { hasText: label }).first();
    const exists = await btn.count();
    if (exists === 0) {
      note(`Section "${label}" not found in sidebar`);
      continue;
    }
    await btn.click();
    await page.waitForTimeout(500);

    const idx = String(i + 2).padStart(2, "0");
    const slug = label.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
    await page.screenshot({ path: `${screenshotDir}/${idx}-admin-${slug}.png`, fullPage: true });

    // Check that section content rendered
    const sectionTitle = page.locator(".admin-section-title");
    const titleText = await sectionTitle.textContent();
    console.log(`Section "${label}" -> title: "${titleText?.trim()}"`);
    if (!titleText?.trim()) note(`Section "${label}" has empty title`);
  }

  // Now test some interactions

  // 1. Products section: toggle a product
  console.log("\n--- Testing Products interactions ---");
  await page.locator(".admin-sidebar button", { hasText: "Produkte" }).first().click();
  await page.waitForTimeout(300);

  // Check how many product cards
  const productCards = page.locator(".admin-card > div > div");
  const productCount = await productCards.count();
  console.log(`Product cards rendered: ${productCount}`);

  // 2. Test AdminOptionList in Oberflaechen section
  console.log("\n--- Testing Oberflächen interactions ---");
  await page.locator(".admin-sidebar button", { hasText: "Oberflächen" }).first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${screenshotDir}/20-oberflaechen-detail.png`, fullPage: true });

  // Try adding a new item
  const addInput = page.locator('input[placeholder*="Neue Oberfl"]');
  if (await addInput.count() > 0) {
    await addInput.fill("Lasiert");
    await page.locator("button", { hasText: "Hinzufügen" }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${screenshotDir}/21-oberflaechen-added.png`, fullPage: true });
    console.log("Added 'Lasiert' to Oberflächen");
  } else {
    note("Add input not found in Oberflächen section");
  }

  // Try reordering
  const upButtons = page.locator(".admin-card button:has-text('▲')");
  const upCount = await upButtons.count();
  console.log(`Up arrow buttons: ${upCount}`);
  if (upCount > 1) {
    await upButtons.nth(1).click(); // Move 2nd item up
    await page.waitForTimeout(300);
    console.log("Reordered item up");
  }

  // 3. Test Extras section
  console.log("\n--- Testing Extras interactions ---");
  await page.locator(".admin-sidebar button", { hasText: "Extras" }).first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${screenshotDir}/22-extras.png`, fullPage: true });

  // 4. Test Wizard-Schritte
  console.log("\n--- Testing Wizard-Schritte ---");
  await page.locator(".admin-sidebar button", { hasText: "Wizard-Schritte" }).first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${screenshotDir}/23-wizard-schritte.png`, fullPage: true });

  // Check for arrow buttons
  const stepArrows = page.locator(".admin-card .flex.flex-col.gap-0\\.5 button");
  const arrowCount = await stepArrows.count();
  console.log(`Step reorder arrows: ${arrowCount}`);

  // 5. Test mobile view
  console.log("\n--- Testing Mobile view ---");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${screenshotDir}/30-mobile-admin.png`, fullPage: true });

  // Check FAB appears on mobile
  const fabMobile = page.locator(".admin-preview-fab");
  const fabMobileVisible = await fabMobile.isVisible();
  console.log(`Mobile FAB visible: ${fabMobileVisible}`);
  if (!fabMobileVisible) note("FAB not visible on mobile — should appear for preview toggle");

  // Click FAB if visible
  if (fabMobileVisible) {
    await fabMobile.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotDir}/31-mobile-preview-overlay.png`, fullPage: true });
    const overlay = page.locator(".admin-preview-overlay");
    if (await overlay.isVisible()) {
      console.log("Mobile preview overlay opened");
      // Close it
      await page.locator(".admin-preview-overlay-content button:has-text('×')").click();
      await page.waitForTimeout(300);
    }
  }

  // Check mobile tabs
  const mobileTabs = page.locator(".admin-mobile-tabs");
  const mobileTabsVisible = await mobileTabs.isVisible();
  console.log(`Mobile tabs visible: ${mobileTabsVisible}`);

  // 6. Test tablet view
  console.log("\n--- Testing Tablet view ---");
  await page.setViewportSize({ width: 900, height: 768 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${screenshotDir}/32-tablet-admin.png`, fullPage: true });

  // 7. Test "Kunde" button opens new tab
  console.log("\n--- Testing Kunde button ---");
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForTimeout(300);
  const kundeBtn = page.locator("header button", { hasText: "Kunde" });
  if (await kundeBtn.count() > 0) {
    console.log("'Kunde' button found in header");
  } else {
    note("'Kunde' button NOT found in header");
  }

  // Summary
  console.log("\n========== NOTES ==========");
  if (notes.length === 0) {
    console.log("No issues found!");
  } else {
    notes.forEach((n, i) => console.log(`${i + 1}. ${n}`));
  }
  console.log("===========================\n");

  await browser.close();
}

exploreAdmin().catch(console.error);
