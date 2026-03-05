/**
 * Garderobe-Wizard — Rename MSB ID and configure 9 states
 */
import { chromium, type Page } from "@playwright/test";
import * as fs from "fs";

const WIX_STUDIO_URL =
  "https://editor.wix.com/studio/da83f9e6-246c-497c-8da0-70843f9f876b?metaSiteId=2af4037d-1760-49e9-8417-72e667bd32dd";
const USER_DATA_DIR = "./auth/chrome-profile";
const OUT_DIR = "./screenshots";

const STATE_NAMES = [
  'stateTypAuswahl',
  'stateConfig',
  'stateHolzart',
  'stateMasse',
  'stateAusfuehrung',
  'stateExtras',
  'stateKontakt',
  'stateUebersicht',
  'stateDone',
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

let stepNum = 0;
async function shot(page: Page, label: string) {
  stepNum++;
  const name = `cfg-${String(stepNum).padStart(2, "0")}-${label}`;
  await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

(async () => {
  ensureDir(OUT_DIR);
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║   CONFIGURE MSB — RENAME ID + 9 STATES       ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  try {
    const { execSync } = require('child_process');
    execSync('taskkill /F /IM chrome.exe 2>nul', { stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 2000));
  } catch { }

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1920, height: 1080 },
    ignoreDefaultArgs: ["--enable-automation"],
    args: ["--disable-blink-features=AutomationControlled", "--disable-infobars"],
  });

  const page = context.pages()[0] || await context.newPage();

  const keepOpen = async () => {
    console.log("\n🔎 Browser stays open. Press Ctrl+C to close.\n");
    await new Promise<void>(resolve => {
      context.on("close", () => resolve());
      process.on("SIGINT", async () => { await context.close(); resolve(); });
    });
  };

  try {
    // Load editor
    console.log("1️⃣  Loading editor...");
    await page.goto(WIX_STUDIO_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    if (page.url().includes("signin") || page.url().includes("login")) {
      console.log("❌ Not logged in."); await context.close(); process.exit(1);
    }
    await page.waitForTimeout(15000);
    console.log("  ✅ Editor loaded");

    // Navigate to Garderobe bestellen
    console.log("\n2️⃣  Navigating to Garderobe bestellen...");
    await page.locator('[data-hook="secondary-bar-command-button-pages-panel/toggle"]').first().click();
    await page.waitForTimeout(2000);
    await page.getByText('Garderobe bestellen', { exact: false }).first().click();
    await page.waitForTimeout(5000);
    await page.locator('[data-hook="secondary-bar-command-button-pages-panel/toggle"]').first().click();
    await page.waitForTimeout(500);
    console.log("  ✅ On Garderobe bestellen page");
    await shot(page, "page-loaded");

    // Click on the MSB to select it
    console.log("\n3️⃣  Selecting the Multi-State Box...");

    // The MSB should be on the canvas. Let's find it by clicking in the canvas area.
    // From the screenshot, it's in the center of the page.
    const canvasFrame = page.frames().find(f => f.url().includes('renderer/render/document'));

    if (canvasFrame) {
      // Try to find the MSB element in the canvas
      const msbElem = canvasFrame.locator('[data-comp-id]').filter({ hasText: /State|status/i });
      const msbCount = await msbElem.count();
      console.log(`  MSB-like elements in canvas: ${msbCount}`);

      // Try clicking the MSB component directly
      // Look for comp IDs that might be the MSB
      const compIds = await canvasFrame.evaluate(() => {
        const elements = document.querySelectorAll('[data-comp-id]');
        return Array.from(elements).map(el => ({
          id: el.getAttribute('data-comp-id'),
          tag: el.tagName,
          classes: el.className.toString().substring(0, 60),
          x: Math.round(el.getBoundingClientRect().x),
          y: Math.round(el.getBoundingClientRect().y),
          w: Math.round(el.getBoundingClientRect().width),
          h: Math.round(el.getBoundingClientRect().height),
        })).filter(e => e.w > 100 && e.h > 100);
      });

      console.log("  Large canvas components:");
      for (const comp of compIds.slice(0, 10)) {
        console.log(`    ${comp.id} (${comp.tag}) at (${comp.x},${comp.y}) ${comp.w}x${comp.h}`);
      }
    }

    // Try clicking on the MSB area in the canvas (based on the screenshot, it's roughly in the center)
    // Actually, let's use the canvas frame to click on the MSB component
    await page.mouse.click(700, 350);
    await page.waitForTimeout(2000);
    await shot(page, "after-click-canvas");

    // Check what's selected now
    let selectedElement = await page.evaluate(() => {
      const spans = document.querySelectorAll('span, div');
      for (const s of spans) {
        const text = s.textContent?.trim();
        if (text && text.includes('#multiStateBox') || text?.includes('#wizardStates')) {
          return text;
        }
      }
      return '';
    });
    console.log(`  Selected element: "${selectedElement}"`);

    // If not the MSB, try clicking where the MSB should be (from the screenshot)
    if (!selectedElement.includes('multiState') && !selectedElement.includes('wizardStates')) {
      console.log("  Trying different click location...");
      // Try clicking in the middle of the page content area
      await page.mouse.click(600, 300);
      await page.waitForTimeout(1000);

      selectedElement = await page.evaluate(() => {
        const spans = document.querySelectorAll('span, div');
        for (const s of spans) {
          const text = s.textContent?.trim();
          if (text && (text.includes('#multiStateBox') || text.includes('#wizardStates'))) {
            return text;
          }
        }
        return '';
      });
      console.log(`  Selected: "${selectedElement}"`);
    }

    // If still not found, try using the layers panel or element tree to find and select it
    if (!selectedElement.includes('multiState') && !selectedElement.includes('wizardStates')) {
      console.log("\n  Using element search to find MSB...");
      // Try Ctrl+Click or double-click
      await page.mouse.dblclick(600, 280);
      await page.waitForTimeout(1500);

      selectedElement = await page.evaluate(() => {
        const all = document.querySelectorAll('span, div, input');
        for (const el of all) {
          const text = el.textContent?.trim();
          if (text && (text.includes('multiStateBox') || text.includes('wizardStates') || text.includes('Multistatus'))) {
            return text.substring(0, 60);
          }
        }
        return '';
      });
      console.log(`  After double-click: "${selectedElement}"`);
    }

    await shot(page, "element-selected");

    // ── Step 4: Rename the ID ──
    console.log("\n4️⃣  Renaming ID to 'wizardStates'...");

    // Look for the ID input field in the right panel
    // From the previous run, the ID input had value "multiStateBox1"
    const idInputs = await page.locator('input').all();
    let idInput = null;
    for (const inp of idInputs) {
      try {
        const val = await inp.inputValue();
        if (val === 'multiStateBox1' || val === 'wizardStates') {
          idInput = inp;
          console.log(`  Found ID input with value: "${val}"`);
          break;
        }
      } catch { }
    }

    if (idInput) {
      // Clear and type new ID
      await idInput.click({ clickCount: 3 }); // Select all
      await idInput.fill('wizardStates');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      console.log("  ✅ Renamed to wizardStates");
    } else {
      console.log("  ⚠️ ID input not found. Looking in properties panel...");

      // Try finding the ID section in the code panel (bottom)
      // The code panel shows "ID" with an input field
      const idLabels = await page.getByText('ID', { exact: true }).all();
      console.log(`  Found ${idLabels.length} 'ID' labels`);

      for (const label of idLabels) {
        try {
          const box = await label.boundingBox();
          if (box && box.x > 1200) { // In the right panel area
            // Click near the ID label to find the input
            const nearbyInput = page.locator(`input[value="multiStateBox1"]`).first();
            if (await nearbyInput.isVisible({ timeout: 1000 })) {
              await nearbyInput.click({ clickCount: 3 });
              await nearbyInput.fill('wizardStates');
              await page.keyboard.press('Enter');
              console.log("  ✅ Renamed via nearby input");
              break;
            }
          }
        } catch { }
      }
    }

    await page.waitForTimeout(1000);
    await shot(page, "after-rename");

    // Verify the rename
    const newId = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      for (const inp of inputs) {
        if (inp.value === 'wizardStates') return 'wizardStates';
        if (inp.value === 'multiStateBox1') return 'multiStateBox1 (not renamed)';
      }
      // Also check for text display
      const spans = document.querySelectorAll('span, div');
      for (const s of spans) {
        if (s.textContent?.includes('wizardStates')) return 'wizardStates (in text)';
      }
      return 'unknown';
    });
    console.log(`  Current ID: ${newId}`);

    // ── Step 5: Open "Status verwalten" (Manage States) ──
    console.log("\n5️⃣  Opening state management...");

    // From the screenshot, "Status verwalten" is near the top of the MSB on the canvas
    // It was found at approximately (851, 302) in the previous run
    const manageStates = page.getByText('Status verwalten', { exact: false });
    if (await manageStates.count() > 0) {
      await manageStates.first().click();
      console.log("  ✅ Clicked 'Status verwalten'");
      await page.waitForTimeout(2000);
      await shot(page, "states-panel");

      // Dump what's in the states panel
      const statesPanelText = await page.evaluate(() => {
        const all = document.querySelectorAll('span, div, button, input');
        const texts: string[] = [];
        all.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 1 && text.length < 50) {
            const rect = el.getBoundingClientRect();
            // Focus on the popup/panel area (might be a floating panel)
            if (rect.width > 10 && rect.height > 10) {
              texts.push(text);
            }
          }
        });
        return [...new Set(texts)];
      });

      console.log("  States panel content:");
      for (const t of statesPanelText.slice(0, 30)) {
        console.log(`    "${t}"`);
      }

      // Look for existing state names and "add state" button
      const addStateBtn = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          const text = btn.textContent?.trim();
          if (text && (
            text.includes('Status hinzufügen') ||
            text.includes('Hinzufügen') ||
            text.includes('Add State') ||
            text.includes('Neuer Status')
          )) {
            const rect = btn.getBoundingClientRect();
            return { text, x: Math.round(rect.x), y: Math.round(rect.y) };
          }
        }
        return null;
      });

      if (addStateBtn) {
        console.log(`  Found add state button: "${addStateBtn.text}" at (${addStateBtn.x}, ${addStateBtn.y})`);
      }

      // Look for rename buttons or state name inputs
      const stateInputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        return Array.from(inputs).map(inp => ({
          value: inp.value,
          placeholder: inp.placeholder,
          x: Math.round(inp.getBoundingClientRect().x),
          y: Math.round(inp.getBoundingClientRect().y),
        })).filter(i => i.x > 0);
      });

      console.log("  Input fields:");
      for (const inp of stateInputs) {
        console.log(`    value="${inp.value}" placeholder="${inp.placeholder}" at (${inp.x}, ${inp.y})`);
      }

    } else {
      console.log("  ⚠️ 'Status verwalten' not found");
      // Try clicking where it should be
      await page.mouse.click(851, 302);
      await page.waitForTimeout(2000);
      await shot(page, "manual-click-states");
    }

    await shot(page, "final");

    console.log("\n═══════════════════════════════════════════════");
    console.log("  DONE — Check screenshots/");
    console.log("═══════════════════════════════════════════════");

    await keepOpen();

  } catch (err) {
    console.error("💥 Error:", err);
    await shot(page, "error").catch(() => {});
    await keepOpen();
  }
})();
