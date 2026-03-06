import { chromium } from "playwright";

/**
 * Exploratory walkthrough: click through the admin backend and take screenshots.
 * Run with: npx tsx tests/explore-admin.ts
 */
async function exploreAdmin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const baseURL = "http://localhost:5173";
  const screenshotDir = "test-screenshots";

  const notes: string[] = [];
  const note = (msg: string) => { notes.push(msg); console.log(`NOTE: ${msg}`); };

  // ─── Load admin page ───
  console.log("Loading admin page...");
  await page.goto(`${baseURL}/?mode=admin`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${screenshotDir}/01-admin-initial.png`, fullPage: true });

  // ─── Check header ───
  const header = page.locator("header");
  const headerText = await header.textContent();
  console.log(`Header text: "${headerText?.trim()}"`);

  // ─── Check preview panel on desktop ───
  const previewAside = page.locator(".admin-with-preview-aside");
  const asideVisible = await previewAside.isVisible();
  console.log(`Desktop preview panel visible: ${asideVisible}`);
  if (!asideVisible) note("Preview panel NOT visible at 1400px — expected side-by-side");

  // ─── Check FAB hidden on desktop ───
  const fab = page.locator(".admin-preview-fab");
  const fabVisible = await fab.isVisible();
  console.log(`Desktop FAB visible: ${fabVisible}`);
  if (fabVisible) note("FAB should be hidden on desktop (>=1200px)");

  // ─── Click through sidebar sections ───
  const sidebarBtns = page.locator(".admin-sidebar nav button");
  const sidebarCount = await sidebarBtns.count();
  console.log(`\nSidebar has ${sidebarCount} sections`);

  for (let i = 0; i < sidebarCount; i++) {
    const btn = sidebarBtns.nth(i);
    const btnText = (await btn.textContent())?.trim().split("\n")[0]?.trim() || `section-${i}`;
    await btn.click();
    await page.waitForTimeout(400);

    const sectionTitle = await page.locator(".admin-section-title").textContent();
    const slug = btnText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const idx = String(i + 1).padStart(2, "0");
    await page.screenshot({ path: `${screenshotDir}/${idx}-${slug}.png`, fullPage: true });
    console.log(`[${idx}] "${btnText}" → title: "${sectionTitle?.trim()}"`);

    if (!sectionTitle?.trim()) note(`Section "${btnText}" rendered with empty title`);

    // Check that .admin-card has content
    const cardContent = page.locator(".admin-card");
    const cardHTML = await cardContent.innerHTML();
    if (cardHTML.trim().length < 10) note(`Section "${btnText}" has empty/minimal card content`);
  }

  // ─── Test Produkte section interactions ───
  console.log("\n--- Produkte section ---");
  await sidebarBtns.first().click();
  await page.waitForTimeout(400);

  // Count product items
  const productItems = page.locator(".admin-card > div > div[class*='border']");
  const prodCount = await productItems.count();
  console.log(`Product items: ${prodCount}`);
  if (prodCount === 0) note("No product items rendered in Produkte section");

  // Check if toggles exist
  const toggles = page.locator(".admin-card [role='switch']");
  const toggleCount = await toggles.count();
  console.log(`Toggle switches: ${toggleCount}`);

  // ─── Test Oberflächen CRUD ───
  console.log("\n--- Oberflächen CRUD ---");
  await page.locator(".admin-sidebar button", { hasText: "Oberflächen" }).first().click();
  await page.waitForTimeout(400);

  // Count current items
  const oflItems = page.locator(".admin-card > div > div[class*='border-'][class*='rounded']");
  const oflCount = await oflItems.count();
  console.log(`Oberflächen items: ${oflCount}`);

  // Check for add input
  const addInput = page.locator("input[placeholder*='Neue']");
  const addInputExists = await addInput.count() > 0;
  console.log(`Add input present: ${addInputExists}`);
  if (!addInputExists) note("No 'add new item' input found in Oberflächen");

  // Try adding
  if (addInputExists) {
    await addInput.fill("Lasiert");
    await page.locator("button", { hasText: /Hinzuf/ }).click();
    await page.waitForTimeout(300);
    const newCount = await oflItems.count();
    console.log(`After adding: ${newCount} items (was ${oflCount})`);
    if (newCount <= oflCount) note("Adding item didn't increase count");
    await page.screenshot({ path: `${screenshotDir}/20-ofl-after-add.png`, fullPage: true });
  }

  // Check reorder arrows
  const upArrows = page.locator(".admin-card button:has-text('▲')");
  const upArrowCount = await upArrows.count();
  console.log(`Up arrows: ${upArrowCount}`);
  if (upArrowCount === 0) note("No reorder arrows found");

  // Check visibility toggles (eye icons)
  const visToggles = page.locator(".admin-card button[title*='Kunden']");
  const visToggleCount = await visToggles.count();
  console.log(`Visibility toggles: ${visToggleCount}`);

  // Check delete buttons (×)
  const deleteButtons = page.locator(".admin-card button[title='Löschen']");
  const deleteCount = await deleteButtons.count();
  console.log(`Delete buttons: ${deleteCount}`);

  // ─── Test Extras section ───
  console.log("\n--- Extras section ---");
  await page.locator(".admin-sidebar button", { hasText: "Extras" }).first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${screenshotDir}/21-extras.png`, fullPage: true });

  // Check if meta (icon) renders
  const extrasMeta = page.locator(".admin-card .text-sm");
  const metaCount = await extrasMeta.count();
  console.log(`Meta elements (icons): ${metaCount}`);

  // ─── Test Wizard-Schritte ───
  console.log("\n--- Wizard-Schritte ---");
  await page.locator(".admin-sidebar button", { hasText: "Wizard-Schritte" }).first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${screenshotDir}/22-wizard-schritte.png`, fullPage: true });

  // Count step items with arrow buttons
  const stepUpArrows = page.locator(".admin-card .flex.flex-col.gap-0\\.5 button");
  console.log(`Step reorder arrow buttons: ${await stepUpArrows.count()}`);

  // ─── Test Preiskalkulation ───
  console.log("\n--- Preiskalkulation ---");
  await page.locator(".admin-sidebar button", { hasText: "Preiskalkulation" }).first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${screenshotDir}/23-preiskalkulation.png`, fullPage: true });

  // Check FinancialSummary
  const finSummary = page.locator("text=Kundenpreis");
  const finExists = await finSummary.count() > 0;
  console.log(`Financial summary visible: ${finExists}`);

  // ─── Test mobile viewport ───
  console.log("\n--- Mobile (375px) ---");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${screenshotDir}/30-mobile.png`, fullPage: true });

  // Mobile tabs
  const mobileTabs = page.locator(".admin-mobile-tabs");
  const mobileTabsVis = await mobileTabs.isVisible();
  console.log(`Mobile tabs visible: ${mobileTabsVis}`);
  if (!mobileTabsVis) note("Mobile tabs not visible at 375px");

  // FAB on mobile
  const fabMobileVis = await fab.isVisible();
  console.log(`Mobile FAB visible: ${fabMobileVis}`);
  if (!fabMobileVis) note("FAB not visible on mobile — should appear");

  // Test FAB overlay
  if (fabMobileVis) {
    await fab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotDir}/31-mobile-overlay.png`, fullPage: true });
    const overlay = page.locator(".admin-preview-overlay");
    const overlayVis = await overlay.isVisible();
    console.log(`Preview overlay visible: ${overlayVis}`);
    if (!overlayVis) note("Preview overlay didn't open on FAB click");

    // Close overlay
    if (overlayVis) {
      const closeBtn = page.locator(".admin-preview-overlay-content button").first();
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
  }

  // Click through mobile tabs
  const mobileTabBtns = page.locator(".admin-mobile-tabs button");
  const mobileTabCount = await mobileTabBtns.count();
  console.log(`Mobile tab buttons: ${mobileTabCount}`);
  for (let i = 0; i < Math.min(mobileTabCount, 5); i++) {
    await mobileTabBtns.nth(i).click();
    await page.waitForTimeout(300);
    const text = await mobileTabBtns.nth(i).textContent();
    console.log(`  Tab ${i}: "${text?.trim()}"`);
  }
  await page.screenshot({ path: `${screenshotDir}/32-mobile-tab-nav.png`, fullPage: true });

  // ─── Test tablet viewport ───
  console.log("\n--- Tablet (900px) ---");
  await page.setViewportSize({ width: 900, height: 768 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${screenshotDir}/33-tablet.png`, fullPage: true });

  const tabletAside = await previewAside.isVisible();
  console.log(`Tablet preview strip visible: ${tabletAside}`);

  // ─── Test Kunde button ───
  console.log("\n--- Kunde button ---");
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForTimeout(300);
  const kundeBtn = page.locator("header button", { hasText: "Kunde" });
  const kundeExists = await kundeBtn.count() > 0;
  console.log(`Kunde button exists: ${kundeExists}`);
  if (!kundeExists) note("Kunde button NOT in header");

  // ─── Preview content ───
  console.log("\n--- Preview content check ---");
  const previewContent = page.locator(".admin-with-preview-aside");
  if (await previewContent.isVisible()) {
    const previewText = await previewContent.textContent();
    const hasLivePreview = previewText?.includes("Live-Vorschau") || previewText?.includes("Kunden-Ansicht");
    console.log(`Preview has content label: ${hasLivePreview}`);
    if (!hasLivePreview) note("Preview panel has no 'Live-Vorschau' or 'Kunden-Ansicht' label");

    // Check if PhoneFrame is there
    const phoneFrame = previewContent.locator(".phone-frame, [class*='phone']");
    const phoneExists = await phoneFrame.count() > 0;
    console.log(`PhoneFrame in preview: ${phoneExists}`);
  }

  // ═══════ SUMMARY ═══════
  console.log("\n========================================");
  console.log("  EXPLORATION NOTES");
  console.log("========================================");
  if (notes.length === 0) {
    console.log("  No issues found!");
  } else {
    notes.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));
  }
  console.log("========================================\n");

  await browser.close();
}

exploreAdmin().catch((err) => {
  console.error("Exploration failed:", err);
  process.exit(1);
});
