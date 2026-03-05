# Garderobe-Wizard — Wix Studio Element Setup Checklist

> **Reference this while building your page in Wix Studio.**
> Every `#elementId` below must exist as an element nickname for the Velo page code to work.
>
> ✅ = Must have  |  ⭘ = Optional (code handles missing gracefully)

---

## 1. Multi-State Box: `#wizardStates`

Create a **Multi-State Box** with 9 states. The state IDs MUST match exactly:

| # | State ID           | Purpose                   | ✅ |
|---|---------------------|---------------------------|----|
| 1 | `stateTypAuswahl`  | Type selection (Schriftzug vs Berg) | ✅ |
| 2 | `stateConfig`      | Step toggle configuration | ✅ |
| 3 | `stateHolzart`     | Wood type picker          | ✅ |
| 4 | `stateMasse`       | Dimensions input          | ✅ |
| 5 | `stateAusfuehrung` | Surface & hooks config    | ✅ |
| 6 | `stateExtras`      | Extras selection          | ✅ |
| 7 | `stateKontakt`     | Contact form              | ✅ |
| 8 | `stateUebersicht`  | Summary / review          | ✅ |
| 9 | `stateDone`        | Success/thank-you screen  | ✅ |

---

## 2. Navigation Bar (outside MSB, always visible during wizard)

| Element              | Type             | ID                  | ✅ | Notes |
|----------------------|------------------|---------------------|----|-------|
| Step counter         | Text             | `#txtStepCounter`   | ✅ | Shows "2 / 5" |
| Progress bar         | Progress Bar     | `#progressBar`      | ✅ | 0-100 value |
| Back button          | Button           | `#btnBack`          | ✅ | "← ZURÜCK" / "← ANPASSEN" |
| Next button          | Button           | `#btnNext`          | ✅ | "WEITER →" |
| Submit button        | Button           | `#btnSubmit`        | ✅ | "ANFRAGE SENDEN ✓" (hidden until last step) |
| Error message        | Text             | `#txtError`         | ⭘ | Hidden by default, shows validation errors |

---

## 3. State: `stateTypAuswahl` — Type Selection

| Element              | Type             | ID                   | ✅ | Notes |
|----------------------|------------------|----------------------|----|-------|
| Schriftzug card      | Box/Container    | `#boxSchriftzug`     | ✅ | Clickable card |
| Bergmotiv card       | Box/Container    | `#boxBergmotiv`      | ✅ | Clickable card |
| **Schriftzug section** (show/hide) | Container | `#sectionSchriftzug` | ⭘ | Wraps inputs below, hidden initially |
| Schriftzug text input| Text Input       | `#inputSchriftzug`   | ✅ | Max 30 chars |
| Character counter    | Text             | `#txtCharCount`      | ⭘ | "30 Zeichen übrig" |
| Font picker          | Selection Tags   | `#tagsSchriftart`    | ✅ | 6 options: sans, serif, slab, condensed, rounded, script |
| **Berg section** (show/hide) | Container | `#sectionBerge`     | ⭘ | Wraps repeater below |
| Berg repeater        | Repeater         | `#repeaterBerge`     | ✅ | 7 items |
| ↳ Berg container     | Box (in repeater)| `#containerBerg`     | ✅ | Clickable |
| ↳ Berg name          | Text (in repeater)| `#txtBergName`      | ✅ | e.g. "Matterhorn" |
| ↳ Berg info          | Text (in repeater)| `#txtBergInfo`      | ✅ | e.g. "4'478 m · Wallis" |
| Continue button      | Button           | `#btnTypWeiter`      | ✅ | "WEITER ZUR KONFIGURATION →" |

### Font picker options (for `#tagsSchriftart`):
```
Value: sans       Label: Modern
Value: serif      Label: Klassisch
Value: slab       Label: Slab
Value: condensed  Label: Schmal
Value: rounded    Label: Rund
Value: script     Label: Handschrift
```

---

## 4. State: `stateConfig` — Step Toggles

| Element              | Type             | ID                   | ✅ | Notes |
|----------------------|------------------|----------------------|----|-------|
| Type badge text      | Text             | `#txtConfigTyp`      | ✅ | Shows "✏️ Schriftzug..." or "⛰️ Matterhorn" |
| Change type button   | Button           | `#btnConfigChange`   | ✅ | Goes back to type selection |
| Holzart toggle       | Switch           | `#switchHolzart`     | ✅ | Default: ON |
| Masse toggle (info)  | Text/Switch      | –                    | – | Always on, show "immer enthalten" badge |
| Ausführung toggle    | Switch           | `#switchAusfuehrung` | ✅ | Default: ON |
| Extras toggle        | Switch           | `#switchExtras`      | ✅ | Default: OFF |
| Back button          | Button           | `#btnConfigBack`     | ✅ | Goes back to type selection |
| Start wizard button  | Button           | `#btnConfigStart`    | ✅ | "LOS GEHT'S →" |

---

## 5. State: `stateHolzart` — Wood Type

| Element              | Type             | ID                   | ✅ | Notes |
|----------------------|------------------|----------------------|----|-------|
| Wood repeater        | Repeater         | `#repeaterHolz`      | ✅ | 5 items |
| ↳ Wood card          | Box (in repeater)| `#containerHolz`     | ✅ | Clickable |
| ↳ Wood emoji         | Text (in repeater)| `#txtHolzEmoji`     | ✅ | 🪵 🌿 🌰 🍁 🌲 |
| ↳ Wood name          | Text (in repeater)| `#txtHolzName`      | ✅ | Name |
| ↳ Wood description   | Text (in repeater)| `#txtHolzDesc`      | ✅ | Description |

---

## 6. State: `stateMasse` — Dimensions

| Element              | Type             | ID                   | ✅ | Notes |
|----------------------|------------------|----------------------|----|-------|
| Width input          | Text Input       | `#inputBreite`       | ✅ | Number, default 120 |
| Height input         | Text Input       | `#inputHoehe`        | ✅ | Number, default 180 |
| Depth input          | Text Input       | `#inputTiefe`        | ✅ | Number, default 35 |
| Dimensions preview   | Text             | `#txtMassePreview`   | ✅ | "120 × 180 × 35 cm" |

---

## 7. State: `stateAusfuehrung` — Surface & Hooks

| Element              | Type             | ID                   | ✅ | Notes |
|----------------------|------------------|----------------------|----|-------|
| Surface dropdown     | Dropdown         | `#dropOberflaeche`   | ✅ | 5 options (populated by code) |
| Hook count dropdown  | Dropdown         | `#dropHaken`         | ✅ | 5 options: 4/6/8/10/Individuell |
| Hook material dropdown| Dropdown        | `#dropMaterial`      | ✅ | 4 options (populated by code) |
| Hat shelf radio      | Radio Buttons    | `#radioHutablage`    | ✅ | "Ja" / "Nein" |

---

## 8. State: `stateExtras`

| Element              | Type             | ID                   | ✅ | Notes |
|----------------------|------------------|----------------------|----|-------|
| Extras selection     | Selection Tags   | `#tagsExtras`        | ✅ | 5 options (populated by code), multi-select |
| Remarks input        | Text Box         | `#inputBemerkungen`  | ✅ | Multi-line |

---

## 9. State: `stateKontakt` — Contact Form

| Element              | Type             | ID                   | ✅ | Notes |
|----------------------|------------------|----------------------|----|-------|
| Salutation dropdown  | Dropdown         | `#dropAnrede`        | ✅ | 4 options (populated by code) |
| First name input     | Text Input       | `#inputVorname`      | ✅ | Required |
| Last name input      | Text Input       | `#inputNachname`     | ✅ | Required |
| Email input          | Text Input       | `#inputEmail`        | ✅ | Required, email validation |
| Phone input          | Text Input       | `#inputTelefon`      | ⭘ | Optional |
| Street input         | Text Input       | `#inputStrasse`      | ⭘ | |
| PLZ input            | Text Input       | `#inputPlz`          | ✅ | Required |
| City input           | Text Input       | `#inputOrt`          | ✅ | Required |
| Privacy checkbox     | Checkbox         | `#checkDatenschutz`  | ✅ | Must check before submit |

---

## 10. State: `stateUebersicht` — Summary

| Element              | Type             | ID                    | ✅ | Notes |
|----------------------|------------------|-----------------------|----|-------|
| Type summary         | Text             | `#txtSummaryTyp`      | ✅ | "✏️ Schriftzug: ..." or "⛰️ Berg: ..." |
| Wood summary         | Text             | `#txtSummaryHolz`     | ✅ | "Eiche" |
| Dimensions summary   | Text             | `#txtSummaryMasse`    | ✅ | "120 × 180 × 35 cm" |
| Surface summary      | Text             | `#txtSummaryOberflaeche` | ✅ | "Natur geölt" |
| Hooks summary        | Text             | `#txtSummaryHaken`    | ✅ | "6× Holz" |
| Hat shelf summary    | Text             | `#txtSummaryHutablage`| ✅ | "Ja" / "Nein" |
| Extras summary       | Text             | `#txtSummaryExtras`   | ⭘ | Hidden if no extras |
| Name summary         | Text             | `#txtSummaryName`     | ✅ | "Max Muster" |
| Email summary        | Text             | `#txtSummaryEmail`    | ✅ | |

---

## 11. State: `stateDone` — Confirmation

| Element              | Type             | ID                   | ✅ | Notes |
|----------------------|------------------|----------------------|----|-------|
| Restart button       | Button           | `#btnNeustart`       | ⭘ | "NEUE BESTELLUNG" |
| Success message      | Text             | –                    | – | Static text, no ID needed |

---

## 12. CMS Collection: `GarderobeBestellungen`

Create this collection with these fields:

| Field Name      | Field Key       | Type    | Notes |
|-----------------|-----------------|---------|-------|
| Title           | `title`         | Text    | Auto: "Vorname Nachname – typ" |
| Typ             | `typ`           | Text    | "schriftzug" or "bergmotiv" |
| Schriftzug      | `schriftzug`    | Text    | |
| Schriftart      | `schriftart`    | Text    | |
| Berg            | `berg`          | Text    | |
| Holzart         | `holzart`       | Text    | |
| Breite          | `breite`        | Number  | cm |
| Höhe            | `hoehe`         | Number  | cm |
| Tiefe           | `tiefe`         | Number  | cm |
| Oberfläche      | `oberflaeche`   | Text    | |
| Haken           | `haken`         | Text    | |
| Hakenmaterial   | `hakenmaterial` | Text    | |
| Hutablage       | `hutablage`     | Text    | "ja" / "nein" |
| Extras          | `extras`        | Text    | Comma-separated |
| Bemerkungen     | `bemerkungen`   | Text    | |
| Anrede          | `anrede`        | Text    | |
| Vorname         | `vorname`       | Text    | |
| Nachname        | `nachname`      | Text    | |
| Email           | `email`         | Text    | |
| Telefon         | `telefon`       | Text    | |
| Strasse         | `strasse`       | Text    | |
| PLZ             | `plz`           | Text    | |
| Ort             | `ort`           | Text    | |
| Status          | `status`        | Text    | Default: "NEU" |

---

## 13. Quick Setup Order

Follow this sequence in Wix Studio:

1. **Create the CMS Collection** first (section 12)
2. **Add the page** "Garderobe bestellen"
3. **Add the Multi-State Box** `#wizardStates` and create all 9 states
4. **Build each state's UI** following sections 3–11  
   → Add elements, set nicknames (IDs) in the Properties panel
5. **Add the nav bar elements** outside the MSB (section 2)
6. **Paste the page code** from `velo-code/page-garderobe-bestellen.js`
7. **Create the backend file** `backend/bestellung.jsw` from `velo-code/backend-bestellung.jsw`
8. **Preview & test** — the code handles all logic once element IDs match

---

## Design Tokens (from JSX brand)

Use these colors consistently:

| Token    | Hex       | Usage |
|----------|-----------|-------|
| bg       | `#f3f1ea` | Page background |
| text     | `#1f2a23` | Body text |
| brand    | `#1f3b31` | Primary / borders |
| accent   | `#3a6b54` | Secondary actions |
| muted    | `#c8c5bb` | Borders, disabled |
| surface  | `#faf9f6` | Card backgrounds |
| cardHover| `rgba(31,59,49,0.06)` | Selected card bg |
| radius   | `14px`    | Border radius |
