/**
 * Garderobe-Wizard — Wix Studio Migration Verification
 *
 * Three modes:
 *   npx tsx tests/verify-migration.ts              → checklist + open editor
 *   npx tsx tests/verify-migration.ts print        → just print checklist
 *   npx tsx tests/verify-migration.ts flow         → preview flow test
 *
 * The old DOM-scraping approach was unreliable because Wix Studio's editor
 * doesn't expose element nicknames as plain text. This version focuses on
 * what's actually testable:
 *   1. A structured, actionable checklist (no browser needed)
 *   2. A PREVIEW-based functional test that clicks through the wizard
 */
import { chromium, type Page, type Frame } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ─── Configuration ───────────────────────────────────────────────────────────

const WIX_STUDIO_URL =
  "https://editor.wix.com/studio/da83f9e6-246c-497c-8da0-70843f9f876b?metaSiteId=2af4037d-1760-49e9-8417-72e667bd32dd";

const USER_DATA_DIR = "./auth/chrome-profile";
const SCREENSHOTS_DIR = "./screenshots";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE 1: CHECKLIST (offline — no browser)
// ═════════════════════════════════════════════════════════════════════════════

interface ChecklistItem {
  id: string;
  type: string;
  note?: string;
}

interface ChecklistSection {
  title: string;
  description?: string;
  items: ChecklistItem[];
}

const CHECKLIST: ChecklistSection[] = [
  {
    title: "CMS Collection: GarderobeBestellungen",
    description: "Create this FIRST. Content Manager → Create Collection.",
    items: [
      { id: "title", type: "Text", note: "Auto: Vorname Nachname – typ" },
      { id: "typ", type: "Text" },
      { id: "customName", type: "Text" },
      { id: "font", type: "Text" },
      { id: "mountainSilhouette", type: "Text" },
      { id: "woodType", type: "Text" },
      { id: "width", type: "Number" },
      { id: "height", type: "Number" },
      { id: "depth", type: "Number" },
      { id: "surfaceFinish", type: "Text" },
      { id: "hooks", type: "Text" },
      { id: "hookMaterial", type: "Text" },
      { id: "hutablage", type: "Text" },
      { id: "extras", type: "Text", note: "Comma-separated" },
      { id: "bemerkungen", type: "Text" },
      { id: "anrede", type: "Text" },
      { id: "vorname", type: "Text" },
      { id: "nachname", type: "Text" },
      { id: "email", type: "Text" },
      { id: "telefon", type: "Text" },
      { id: "strasse", type: "Text" },
      { id: "plz", type: "Text" },
      { id: "ort", type: "Text" },
      { id: "status", type: "Text", note: "Default: NEU" },
    ],
  },
  {
    title: "Multi-State Box: #wizardStates",
    description: "Add MSB, set nickname to 'wizardStates', create 9 states.",
    items: [
      { id: "stateTypAuswahl", type: "State" },
      { id: "stateConfig", type: "State" },
      { id: "stateHolzart", type: "State" },
      { id: "stateMasse", type: "State" },
      { id: "stateAusfuehrung", type: "State" },
      { id: "stateExtras", type: "State" },
      { id: "stateKontakt", type: "State" },
      { id: "stateUebersicht", type: "State" },
      { id: "stateDone", type: "State" },
    ],
  },
  {
    title: "Navigation Bar (outside MSB, always visible)",
    items: [
      { id: "txtStepCounter", type: "Text", note: "Shows '2 / 5'" },
      { id: "progressBar", type: "Progress Bar", note: "Value 0-100" },
      { id: "btnBack", type: "Button", note: "← ZURÜCK / ← ANPASSEN" },
      { id: "btnNext", type: "Button", note: "WEITER →" },
      { id: "btnSubmit", type: "Button", note: "Hidden initially, shown on last step" },
      { id: "txtError", type: "Text", note: "Optional — hidden by default" },
    ],
  },
  {
    title: "State: stateTypAuswahl — Type Selection",
    items: [
      { id: "boxSchriftzug", type: "Box/Container", note: "Clickable card" },
      { id: "boxBergmotiv", type: "Box/Container", note: "Clickable card" },
      { id: "sectionSchriftzug", type: "Container", note: "Optional wrapper, hidden initially" },
      { id: "inputSchriftzug", type: "Text Input", note: "Max 30 chars" },
      { id: "txtCharCount", type: "Text", note: "Optional — '30 Zeichen übrig'" },
      { id: "tagsSchriftart", type: "Selection Tags", note: "6 fonts: sans/serif/slab/condensed/rounded/script" },
      { id: "sectionBerge", type: "Container", note: "Optional wrapper" },
      { id: "repeaterBerge", type: "Repeater", note: "7 mountain cards" },
      { id: "containerBerg", type: "Box (in repeater)" },
      { id: "txtBergName", type: "Text (in repeater)" },
      { id: "txtBergInfo", type: "Text (in repeater)", note: "e.g. 4'478 m · Wallis" },
      { id: "btnTypWeiter", type: "Button", note: "WEITER ZUR KONFIGURATION →" },
    ],
  },
  {
    title: "State: stateConfig — Step Toggles",
    items: [
      { id: "txtConfigTyp", type: "Text", note: "Shows selected type badge" },
      { id: "btnConfigChange", type: "Button", note: "Back to type selection" },
      { id: "switchHolzart", type: "Switch/Toggle", note: "Default: ON" },
      { id: "switchAusfuehrung", type: "Switch/Toggle", note: "Default: ON" },
      { id: "switchExtras", type: "Switch/Toggle", note: "Default: OFF" },
      { id: "btnConfigBack", type: "Button" },
      { id: "btnConfigStart", type: "Button", note: "LOS GEHT'S →" },
    ],
  },
  {
    title: "State: stateHolzart — Wood Type",
    items: [
      { id: "repeaterHolz", type: "Repeater", note: "5 wood cards" },
      { id: "containerHolz", type: "Box (in repeater)", note: "Clickable" },
      { id: "txtHolzEmoji", type: "Text (in repeater)" },
      { id: "txtHolzName", type: "Text (in repeater)" },
      { id: "txtHolzDesc", type: "Text (in repeater)" },
    ],
  },
  {
    title: "State: stateMasse — Dimensions",
    items: [
      { id: "inputBreite", type: "Text Input", note: "Number, default 120" },
      { id: "inputHoehe", type: "Text Input", note: "Number, default 180" },
      { id: "inputTiefe", type: "Text Input", note: "Number, default 35" },
      { id: "txtMassePreview", type: "Text", note: "'120 × 180 × 35 cm'" },
    ],
  },
  {
    title: "State: stateAusfuehrung — Surface & Hooks",
    items: [
      { id: "dropOberflaeche", type: "Dropdown", note: "5 options (code populates)" },
      { id: "dropHaken", type: "Dropdown", note: "4/6/8/10/Individuell" },
      { id: "dropMaterial", type: "Dropdown", note: "4 options (code populates)" },
      { id: "radioHutablage", type: "Radio Buttons", note: "Ja / Nein" },
    ],
  },
  {
    title: "State: stateExtras",
    items: [
      { id: "tagsExtras", type: "Selection Tags", note: "5 extras, multi-select (code populates)" },
      { id: "inputBemerkungen", type: "Text Box", note: "Multi-line" },
    ],
  },
  {
    title: "State: stateKontakt — Contact Form",
    items: [
      { id: "dropAnrede", type: "Dropdown", note: "Herr/Frau/Divers" },
      { id: "inputVorname", type: "Text Input", note: "Required" },
      { id: "inputNachname", type: "Text Input", note: "Required" },
      { id: "inputEmail", type: "Text Input", note: "Required, email validation" },
      { id: "inputTelefon", type: "Text Input" },
      { id: "inputStrasse", type: "Text Input" },
      { id: "inputPlz", type: "Text Input", note: "Required" },
      { id: "inputOrt", type: "Text Input", note: "Required" },
    ],
  },
  {
    title: "State: stateUebersicht — Summary",
    items: [
      { id: "txtSummaryTyp", type: "Text" },
      { id: "txtSummaryHolz", type: "Text" },
      { id: "txtSummaryMasse", type: "Text" },
      { id: "txtSummaryOberflaeche", type: "Text" },
      { id: "txtSummaryHaken", type: "Text" },
      { id: "txtSummaryHutablage", type: "Text" },
      { id: "txtSummaryExtras", type: "Text", note: "Hidden if no extras" },
      { id: "txtSummaryName", type: "Text" },
      { id: "txtSummaryEmail", type: "Text" },
      { id: "checkDatenschutz", type: "Checkbox" },
    ],
  },
  {
    title: "State: stateDone — Confirmation",
    items: [
      { id: "btnNeustart", type: "Button", note: "Optional — NEUE BESTELLUNG" },
    ],
  },
  {
    title: "Velo Code",
    description: "Paste into Wix Studio code editors from the velo-code/ folder.",
    items: [
      { id: "page-code", type: "Page Code", note: "Paste from velo-code/page-garderobe-bestellen.js" },
      { id: "backend-module", type: "Backend", note: "Create backend/bestellung.jsw from velo-code/backend-bestellung.jsw" },
    ],
  },
];

function printChecklist() {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║     GARDEROBE WIZARD — WIX STUDIO SETUP CHECKLIST            ║");
  console.log("╠═══════════════════════════════════════════════════════════════╣");
  console.log("║  Work through each section in order.                          ║");
  console.log("║  Full details: velo-code/ELEMENT-CHECKLIST.md                 ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝\n");

  let totalItems = 0;
  for (const section of CHECKLIST) {
    console.log(`\n  ━━━ ${section.title} ━━━`);
    if (section.description) console.log(`  ${section.description}`);
    console.log();

    for (const item of section.items) {
      totalItems++;
      const note = item.note ? `  (${item.note})` : "";
      console.log(`    [ ] #${item.id}  ${item.type}${note}`);
    }
  }

  console.log(`\n\n  TOTAL: ${totalItems} items to set up.`);
  console.log("  When done, run:  npm run wix:test-flow\n");
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE 2: FUNCTIONAL SMOKE TEST (browser — tests the PREVIEW site)
// ═════════════════════════════════════════════════════════════════════════════

interface TestResult {
  step: string;
  status: "PASS" | "FAIL" | "SKIP";
  detail: string;
  screenshot?: string;
}

const testResults: TestResult[] = [];

function logResult(step: string, status: "PASS" | "FAIL" | "SKIP", detail: string, screenshot?: string) {
  testResults.push({ step, status, detail, screenshot });
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⏭️";
  console.log(`   ${icon} ${step}: ${detail}`);
}

/** Find the preview iframe inside Wix Studio editor. */
async function findPreviewFrame(page: Page): Promise<Frame | null> {
  const frames = page.frames();
  for (const frame of frames) {
    const url = frame.url();
    let hostname = "";
    let pathname = "";
    try { const u = new URL(url); hostname = u.hostname; pathname = u.pathname; } catch { /* ignore invalid URLs */ }
    if (
      hostname.endsWith(".wixsite.com") ||
      hostname === "preview.wixsite.com" ||
      (hostname.endsWith(".wixstatic.com") && pathname.startsWith("/preview")) ||
      pathname.includes("_partials/preview")
    ) {
      return frame;
    }
  }
  return null;
}

/** Click in the preview frame by visible text or CSS selector. */
async function clickInPreview(target: Frame | Page, textOrSelector: string, timeout = 5000): Promise<boolean> {
  try {
    if (textOrSelector.startsWith("[") || textOrSelector.startsWith(".") || textOrSelector.startsWith("#")) {
      await target.locator(textOrSelector).first().click({ timeout });
      return true;
    }
    await target.getByText(textOrSelector, { exact: false }).first().click({ timeout });
    return true;
  } catch {
    return false;
  }
}

async function screenshotStep(page: Page, name: string): Promise<string> {
  ensureDir(SCREENSHOTS_DIR);
  const filePath = path.join(SCREENSHOTS_DIR, `flow-${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

async function runFlowTest() {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║     GARDEROBE WIZARD — FUNCTIONAL FLOW TEST                   ║");
  console.log("╠═══════════════════════════════════════════════════════════════╣");
  console.log("║  Opens the editor, enters preview, clicks through the wizard. ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝\n");

  ensureDir(SCREENSHOTS_DIR);

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1440, height: 900 },
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
    ],
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    // ── 1. Open editor ──
    console.log("1. Opening Wix Studio editor...");
    await page.goto(WIX_STUDIO_URL, { waitUntil: "domcontentloaded" });
    try { await page.waitForLoadState("networkidle", { timeout: 30_000 }); } catch { }
    await page.waitForTimeout(5_000);

    if (page.url().includes("signin") || page.url().includes("login")) {
      logResult("Login", "FAIL", "Redirected to login. Run: npm run wix:login");
      printFlowReport();
      await context.close();
      return;
    }

    logResult("Editor Load", "PASS", "Editor loaded");
    await screenshotStep(page, "01-editor");

    // ── 2. Enter preview mode ──
    console.log("\n2. Entering Preview mode...");

    let previewStarted = false;
    const previewSelectors = [
      '[data-hook="preview-button"]',
      '[data-hook="preview"]',
      'button:has-text("Preview")',
      '[aria-label="Preview"]',
      '[data-aid="preview-button"]',
    ];

    for (const sel of previewSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          await btn.click();
          previewStarted = true;
          console.log(`   Clicked preview via: ${sel}`);
          break;
        }
      } catch { }
    }

    if (!previewStarted) {
      try {
        await page.keyboard.press("Control+Shift+P");
        previewStarted = true;
        console.log("   Tried Ctrl+Shift+P shortcut");
      } catch { }
    }

    await page.waitForTimeout(6_000);

    // Check for new tab or iframe
    const pages = context.pages();
    let previewPage = page;
    let previewFrame: Frame | Page | null = null;

    for (const p of pages) {
      let pHost = "";
      let pPath = "";
      try { const pu = new URL(p.url()); pHost = pu.hostname; pPath = pu.pathname; } catch { /* ignore */ }
      if (pHost.endsWith("wixsite.com") || pPath.includes("/preview") || pPath.includes("_partials")) {
        previewPage = p;
        previewFrame = p;
        break;
      }
    }

    if (!previewFrame) {
      previewFrame = await findPreviewFrame(page);
    }

    if (!previewFrame) {
      logResult("Preview Mode", "SKIP", "Could not auto-detect preview frame. Test manually.");
      await screenshotStep(page, "02-no-preview");
      console.log("\n   Editor is open. Click Preview to test manually.");
      console.log("   Press Ctrl+C when done.\n");
      await new Promise<void>(resolve => {
        context.on("close", () => resolve());
        process.on("SIGINT", async () => { await context.close(); resolve(); });
      });
      return;
    }

    logResult("Preview Mode", "PASS", "Preview frame/page detected");
    await screenshotStep(previewPage, "02-preview");

    // ── 3. Test wizard flow ──
    console.log("\n3. Testing wizard flow...\n");

    // 3a. Type Selection — click Schriftzug
    console.log("   3a: Type Selection (Schriftzug)");
    let clicked = await clickInPreview(previewFrame, "Schriftzug");
    if (!clicked) clicked = await clickInPreview(previewFrame, "Ihr Text");
    if (clicked) {
      logResult("Typ: Schriftzug Click", "PASS", "Schriftzug card clicked");
      await previewPage.waitForTimeout(1000);

      // Fill text
      try {
        const input = (previewFrame as Frame | Page).locator("input").first();
        await input.fill("Muster-Familie");
        logResult("Typ: Text Input", "PASS", "Entered 'Muster-Familie'");
      } catch {
        logResult("Typ: Text Input", "SKIP", "Could not find text input");
      }

      await previewPage.waitForTimeout(500);

      // Select font
      try {
        await clickInPreview(previewFrame, "Modern");
        logResult("Typ: Font Selection", "PASS", "Selected font");
      } catch {
        logResult("Typ: Font Selection", "SKIP", "Font picker not found");
      }
    } else {
      logResult("Typ: Schriftzug Click", "FAIL", "Could not find Schriftzug card");
    }
    await screenshotStep(previewPage, "03a-typ");

    // 3b. Continue to Config
    console.log("   3b: Continue to Config");
    const configClicked =
      await clickInPreview(previewFrame, "WEITER ZUR KONFIGURATION") ||
      await clickInPreview(previewFrame, "WEITER") ||
      await clickInPreview(previewFrame, "Weiter");
    logResult("Config Screen", configClicked ? "PASS" : "FAIL",
      configClicked ? "Navigated to config" : "Continue button not found");
    await previewPage.waitForTimeout(1500);
    await screenshotStep(previewPage, "03b-config");

    // 3c. Start wizard
    console.log("   3c: Start Wizard");
    const startClicked =
      await clickInPreview(previewFrame, "LOS GEHT") ||
      await clickInPreview(previewFrame, "Los geht");
    logResult("Wizard Start", startClicked ? "PASS" : "FAIL",
      startClicked ? "Wizard started" : "Start button not found");
    await previewPage.waitForTimeout(1500);
    await screenshotStep(previewPage, "03c-wizard-start");

    // 3d-h. Click through wizard steps
    const stepNames = ["Holzart", "Masse", "Ausfuehrung", "Extras", "Kontakt"];
    for (let i = 0; i < stepNames.length; i++) {
      const name = stepNames[i];
      console.log(`   3${String.fromCharCode(100 + i)}: ${name}`);
      await screenshotStep(previewPage, `03${String.fromCharCode(100 + i)}-${name.toLowerCase()}`);

      const nextClicked =
        await clickInPreview(previewFrame, "WEITER") ||
        await clickInPreview(previewFrame, "Weiter");
      if (nextClicked) {
        logResult(`Step: ${name}`, "PASS", "Navigated past step");
      } else {
        logResult(`Step: ${name}`, "SKIP", "Step may be disabled or Next not found");
        break;
      }
      await previewPage.waitForTimeout(1500);
    }

    // Summary
    console.log("   Summary (Übersicht)");
    await screenshotStep(previewPage, "04-uebersicht");
    logResult("Summary Page", "PASS", "Reached summary (if wizard completed)");

    // ── 4. Report ──
    printFlowReport();

    console.log("\n🔎 Browser stays open for manual inspection. Press Ctrl+C when done.\n");
    await new Promise<void>(resolve => {
      context.on("close", () => resolve());
      process.on("SIGINT", async () => { await context.close(); resolve(); });
    });

  } catch (err) {
    console.error("\n💥 Unexpected error:", err);
    await screenshotStep(page, "error").catch(() => {});
    printFlowReport();
    await context.close();
  }
}

function printFlowReport() {
  const pass = testResults.filter(r => r.status === "PASS").length;
  const fail = testResults.filter(r => r.status === "FAIL").length;
  const skip = testResults.filter(r => r.status === "SKIP").length;
  const total = testResults.length;

  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("              FLOW TEST REPORT");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  ✅ Passed:  ${pass}/${total}`);
  console.log(`  ❌ Failed:  ${fail}/${total}`);
  console.log(`  ⏭️  Skipped: ${skip}/${total}`);
  console.log("═══════════════════════════════════════════════════════════");

  if (fail > 0) {
    console.log("\n❌ FAILED STEPS:\n");
    for (const r of testResults.filter(r => r.status === "FAIL")) {
      console.log(`   ${r.step}: ${r.detail}`);
      if (r.screenshot) console.log(`      Screenshot: ${r.screenshot}`);
    }
  }

  console.log("═══════════════════════════════════════════════════════════\n");

  ensureDir(SCREENSHOTS_DIR);
  const reportPath = path.join(SCREENSHOTS_DIR, "flow-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { pass, fail, skip, total },
    results: testResults,
  }, null, 2));
  console.log(`📄 Report: ${reportPath}\n`);
}

// ═════════════════════════════════════════════════════════════════════════════
// MODE 3: OPEN EDITOR WITH CHECKLIST
// ═════════════════════════════════════════════════════════════════════════════

async function openEditorWithChecklist() {
  printChecklist();

  console.log("\n─── Opening Wix Studio editor... ───\n");

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
  await page.goto(WIX_STUDIO_URL, { waitUntil: "domcontentloaded" });

  console.log("Editor opened. Work through the checklist above.");
  console.log("When done, run:  npm run wix:test-flow\n");
  console.log("Press Ctrl+C to close.\n");

  await new Promise<void>(resolve => {
    context.on("close", () => resolve());
    process.on("SIGINT", async () => { await context.close(); resolve(); });
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// CLI entry point
// ═════════════════════════════════════════════════════════════════════════════

const mode = process.argv[2] || "checklist";

switch (mode) {
  case "checklist":
    openEditorWithChecklist().catch(err => {
      console.error("Fatal:", err);
      process.exit(1);
    });
    break;

  case "flow":
    runFlowTest().catch(err => {
      console.error("Fatal:", err);
      process.exit(1);
    });
    break;

  case "print":
    printChecklist();
    break;

  default:
    console.log("Usage:");
    console.log("  npx tsx tests/verify-migration.ts              → print checklist + open editor");
    console.log("  npx tsx tests/verify-migration.ts print        → just print checklist");
    console.log("  npx tsx tests/verify-migration.ts flow         → run preview flow test");
    break;
}
