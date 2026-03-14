"""Verify the unified Schritte & Optionen admin section."""
import sys, os
os.environ["PYTHONIOENCODING"] = "utf-8"
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})

    page.goto("http://localhost:5173/?mode=admin")
    page.evaluate('sessionStorage.setItem("hz:admin-token", "dev-test-token")')
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)

    # Navigate to unified section
    page.locator("text=Schritte & Optionen").first.click()
    page.wait_for_timeout(800)

    body = page.locator("body").inner_text()

    # Check ALL steps are visible (including disabled ones)
    all_steps = ["Motiv", "Holzart", "Abmessungen", "Extras", "Darstellung", "Kontakt", "Absenden"]
    for step in all_steps:
        if step in body:
            sys.stdout.write(f"  [PASS] Step '{step}' visible\n")
        else:
            sys.stdout.write(f"  [FAIL] Step '{step}' NOT visible\n")

    # Check badges
    if "Pflicht" in body:
        sys.stdout.write("  [PASS] 'Pflicht' badge visible\n")
    if "fest" in body:
        sys.stdout.write("  [PASS] 'fest' badge visible\n")

    page.screenshot(path="/tmp/unified_all_steps.png", full_page=True)
    sys.stdout.write("[PASS] Screenshot saved\n")

    # Expand Ausfuehrung (has 2 panels: oberflaechen + hakenMaterialien)
    page.locator("text=Ausf").first.click()
    page.wait_for_timeout(800)
    page.screenshot(path="/tmp/unified_ausfuehrung.png", full_page=True)
    sys.stdout.write("[PASS] Expanded Ausfuehrung screenshot saved\n")

    browser.close()
    sys.stdout.write("\n[DONE]\n")
