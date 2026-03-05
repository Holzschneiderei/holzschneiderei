# Garderobe-Wizard → Wix Velo: Migrationsguide

Schritt-für-Schritt-Anleitung, um den React-Wizard (garderobe-wizard.jsx) vollständig nach Wix Studio / Velo zu migrieren.

---

## Übersicht: Was sich ändert

| React-Konzept | Wix Velo-Äquivalent |
|---|---|
| `useState` (form state) | Globale Variable `let formData = {}` im Page-Code |
| `useState` (wizard step) | `$w('#wizardStates').changeState('stateHolzart')` |
| Bedingte Darstellung (`{phase === "wizard" && ...}`) | Multi-State Box mit States |
| React-Komponenten (StepHolzart, StepMasse, …) | Einzelne States in der Multi-State Box |
| onClick-Handler | `$w('#btnWeiter').onClick(...)` |
| CSS-in-JS (inline styles) | Wix Design-Editor + Custom CSS |
| `wixData.insert()` | Backend-Modul für Datenspeicherung |
| Animation (slideFromRight, fadeUp) | Wix Effect Options (`show()/hide()` mit Effekten) |

---

## Phase 1: Projekt vorbereiten

### 1.1 – Wix Studio öffnen & Coding aktivieren

1. Melde dich bei [Wix Studio](https://www.wix.com/studio) an.
2. Öffne dein Holzschneiderei-Projekt (oder erstelle ein neues).
3. Im linken Sidebar: Klicke auf das **Code-Icon** ( `{ }` ) → **Start Coding**.
4. Unten erscheint der Code-Editor (IDE). Links siehst du jetzt: Page Code, Backend, Packages usw.

### 1.2 – Neue Seite anlegen

1. Erstelle eine neue Seite: **„Garderobe bestellen"**
2. Setze den SEO-Slug auf `/garderobe-bestellen`
3. Entferne alle Standard-Elemente von der Seite (leere Leinwand).

### 1.3 – Datenbank-Collection anlegen

Gehe zu **CMS → Create Collection** und erstelle eine Collection namens **`GarderobeBestellungen`** mit diesen Feldern:

| Feld-ID | Feld-Typ | Beschreibung |
|---|---|---|
| `typ` | Text | "schriftzug" oder "bergmotiv" |
| `schriftzug` | Text | Benutzerdefinierter Text |
| `berg` | Text | z.B. "matterhorn" |
| `holzart` | Text | z.B. "eiche" |
| `breite` | Number | cm |
| `hoehe` | Number | cm |
| `tiefe` | Number | cm |
| `oberflaeche` | Text | z.B. "natur-geoelt" |
| `haken` | Text | z.B. "6" |
| `hakenmaterial` | Text | z.B. "holz" |
| `hutablage` | Text | "ja" / "nein" |
| `extras` | Tags | Mehrere Werte |
| `bemerkungen` | Text (long) | Freitext |
| `anrede` | Text | "herr" / "frau" / "divers" |
| `vorname` | Text | |
| `nachname` | Text | |
| `email` | Text | |
| `telefon` | Text | |
| `strasse` | Text | |
| `plz` | Text | |
| `ort` | Text | |

**Permissions:** Setze auf **"Form submissions"** – jeder kann schreiben, nur Admin kann lesen.

---

## Phase 2: Seitenstruktur aufbauen

### 2.1 – Header-Section erstellen

Füge eine **Section** oben auf der Seite hinzu mit:

| Element | ID | Zweck |
|---|---|---|
| Bild/SVG | `#imgLogo` | Holzschneiderei-Logo |
| Text | `#txtBrandName` | "HOLZSCHNEIDEREI" |
| Text | `#txtStepCounter` | "1 / 6" (wird per Code aktualisiert) |
| Progress Bar | `#progressBar` | Fortschrittsanzeige |

### 2.2 – Haupt-Multi-State-Box erstellen

Dies ist das Herzstück der Migration. Die Multi-State Box ersetzt die React-`phase`- und `wizardIndex`-Logik.

1. **Hinzufügen:** Add Elements → Layout Tools → **Multi-State Boxes**
2. Ziehe die Box in den Hauptbereich der Seite.
3. **ID ändern:** Wähle die Box → Properties Panel → ID auf **`#wizardStates`** setzen.
4. **States anlegen** (über „Manage States"):

| State-ID | Entspricht React-Phase/Step |
|---|---|
| `stateTypAuswahl` | phase "typen" → Schriftzug / Bergmotiv |
| `stateConfig` | phase "config" → Schritt-Toggles |
| `stateHolzart` | wizard step "holzart" |
| `stateMasse` | wizard step "masse" |
| `stateAusfuehrung` | wizard step "ausfuehrung" |
| `stateExtras` | wizard step "extras" |
| `stateKontakt` | wizard step "kontakt" |
| `stateUebersicht` | wizard step "uebersicht" |
| `stateDone` | phase "done" → Bestätigung |

**Tipp:** Dupliziere States und editiere sie, um ein konsistentes Design beizubehalten.

### 2.3 – Jeden State mit Inhalt füllen

Navigiere im Editor zu jedem State und füge die entsprechenden Elemente hinzu:

#### State: `stateTypAuswahl`

| Element | ID | Typ |
|---|---|---|
| Titel | `#txtTypTitle` | Text: "GARDEROBE BESTELLEN" |
| Untertitel | `#txtTypSub` | Text: "Massanfertigung aus Schweizer Holz" |
| Container Schriftzug | `#boxSchriftzug` | Box (klickbar) |
| Container Bergmotiv | `#boxBergmotiv` | Box (klickbar) |
| Bild Schriftzug | `#imgSchriftzugPreview` | Bild/SVG-Vorschau |
| Bild Bergmotiv | `#imgBergPreview` | Bild/SVG-Vorschau |
| Input Schriftzug | `#inputSchriftzug` | Textfeld (hidden by default) |
| Repeater Berge | `#repeaterBerge` | Repeater mit 7 Items |
| Weiter-Button | `#btnTypWeiter` | Button |

#### State: `stateConfig`

| Element | ID | Typ |
|---|---|---|
| Typ-Badge | `#txtConfigTyp` | Text: "✏️ Schriftzug: ‹text›" |
| Ändern-Button | `#btnConfigChange` | Text-Button |
| Toggle Holzart | `#switchHolzart` | Toggle Switch |
| Toggle Masse | `#switchMasse` | Toggle Switch (disabled=on) |
| Toggle Ausführung | `#switchAusfuehrung` | Toggle Switch |
| Toggle Extras | `#switchExtras` | Toggle Switch |
| Zurück-Button | `#btnConfigBack` | Button |
| Weiter-Button | `#btnConfigStart` | Button |

#### State: `stateHolzart`

| Element | ID | Typ |
|---|---|---|
| Titel | `#txtHolzTitle` | Text |
| Repeater/Container | `#repeaterHolz` | Repeater mit 5 Cards |
| (in Repeater) Bild | `#imgHolzIcon` | Emoji/Bild |
| (in Repeater) Name | `#txtHolzName` | Text |
| (in Repeater) Desc | `#txtHolzDesc` | Text |

Alternativ: Benutze eine **Selection Tags**-Komponente oder **Radio Button Group** für die Holzauswahl.

#### State: `stateMasse`

| Element | ID | Typ |
|---|---|---|
| Visualisierung | `#txtMassePreview` | Text: "120 × 180 × 35 cm" |
| Input Breite | `#inputBreite` | Number Input |
| Input Höhe | `#inputHoehe` | Number Input |
| Input Tiefe | `#inputTiefe` | Number Input |

#### State: `stateAusfuehrung`

| Element | ID | Typ |
|---|---|---|
| Dropdown Oberfläche | `#dropOberflaeche` | Dropdown |
| Dropdown Haken | `#dropHaken` | Dropdown |
| Dropdown Material | `#dropMaterial` | Dropdown |
| RadioGroup Hutablage | `#radioHutablage` | Radio Button Group |

#### State: `stateExtras`

| Element | ID | Typ |
|---|---|---|
| Selection Tags | `#tagsExtras` | Selection Tags (multi-select) |
| Textarea | `#inputBemerkungen` | Text Box (multiline) |

#### State: `stateKontakt`

| Element | ID | Typ |
|---|---|---|
| Dropdown Anrede | `#dropAnrede` | Dropdown |
| Input Vorname | `#inputVorname` | Text Input |
| Input Nachname | `#inputNachname` | Text Input |
| Input E-Mail | `#inputEmail` | Text Input |
| Input Telefon | `#inputTelefon` | Text Input |
| Input Strasse | `#inputStrasse` | Text Input |
| Input PLZ | `#inputPlz` | Text Input |
| Input Ort | `#inputOrt` | Text Input |

**Tipp:** Setze bei Pflichtfeldern im Editor „Required" auf `true` → die nativen Velo-Validierungen greifen dann automatisch.

#### State: `stateUebersicht`

| Element | ID | Typ |
|---|---|---|
| Repeater/Text-Elemente | diverse `#txtSummary*` | Zusammenfassungs-Zeilen |
| Checkbox Datenschutz | `#checkDatenschutz` | Checkbox |
| Link Datenschutz | `#linkDatenschutz` | Text-Link |

#### State: `stateDone`

| Element | ID | Typ |
|---|---|---|
| Bestätigungstext | `#txtDanke` | Text |
| Neu-starten-Button | `#btnNeustart` | Button |

### 2.4 – Navigations-Leiste (Footer-Bar)

Füge **ausserhalb der Multi-State Box** eine fixierte Navigationsleiste unten hinzu:

| Element | ID | Typ |
|---|---|---|
| Zurück-Button | `#btnBack` | Button: "← ZURÜCK" |
| Weiter-Button | `#btnNext` | Button: "WEITER →" |
| Absenden-Button | `#btnSubmit` | Button: "ABSENDEN ✓" (hidden by default) |

**Tipp:** Die Leiste kann in eine **Strip** am Seitenende platziert werden. Die Strip bleibt mit CSS `position: sticky` fixiert (über Custom CSS in Wix Studio möglich).

---

## Phase 3: Velo Page-Code schreiben

### 3.1 – Grundstruktur des Page-Codes

Öffne den Code-Editor unten. Du bist in der Datei `Page Code` der Bestellseite. Hier die Grundstruktur:

```javascript
// ── Imports ──
import wixData from 'wix-data';
import wixWindow from 'wix-window';

// ── Formular-Daten (ersetzt React useState) ──
let formData = {
  typ: '',
  schriftzug: '',
  berg: '',
  holzart: 'eiche',
  breite: 120,
  hoehe: 180,
  tiefe: 35,
  oberflaeche: 'natur-geoelt',
  haken: '6',
  hakenmaterial: 'holz',
  hutablage: 'ja',
  extras: [],
  bemerkungen: '',
  anrede: '',
  vorname: '',
  nachname: '',
  email: '',
  telefon: '',
  strasse: '',
  plz: '',
  ort: ''
};

// ── Wizard-Steuerung ──
let enabledSteps = {
  holzart: true,
  masse: true,
  ausfuehrung: true,
  extras: false
};

const STEP_DEFAULTS = {
  holzart:     { holzart: 'eiche' },
  masse:       { breite: 120, hoehe: 180, tiefe: 35 },
  ausfuehrung: { oberflaeche: 'natur-geoelt', haken: '6', hakenmaterial: 'holz', hutablage: 'ja' },
  extras:      { extras: [], bemerkungen: '' }
};

let activeSteps = [];
let currentIndex = 0;

// ── Hilfsfunktionen ──
function buildActiveSteps() {
  const optional = ['holzart', 'masse', 'ausfuehrung', 'extras']
    .filter(id => enabledSteps[id]);
  activeSteps = [...optional, 'kontakt', 'uebersicht'];
}

function applyDefaults() {
  Object.keys(enabledSteps).forEach(id => {
    if (!enabledSteps[id] && STEP_DEFAULTS[id]) {
      Object.assign(formData, STEP_DEFAULTS[id]);
    }
  });
}

function getStateId(stepId) {
  const map = {
    holzart: 'stateHolzart',
    masse: 'stateMasse',
    ausfuehrung: 'stateAusfuehrung',
    extras: 'stateExtras',
    kontakt: 'stateKontakt',
    uebersicht: 'stateUebersicht'
  };
  return map[stepId];
}

function updateProgress() {
  const total = activeSteps.length;
  const current = currentIndex + 1;
  $w('#txtStepCounter').text = `${current} / ${total}`;
  $w('#progressBar').value = (current / total) * 100;
}

function updateNavButtons() {
  const stepId = activeSteps[currentIndex];

  // Zurück-Button Text
  if (currentIndex === 0) {
    $w('#btnBack').label = '← ANPASSEN';
  } else {
    $w('#btnBack').label = '← ZURÜCK';
  }

  // Weiter vs. Absenden
  if (stepId === 'uebersicht') {
    $w('#btnNext').hide();
    $w('#btnSubmit').show();
  } else {
    $w('#btnNext').show();
    $w('#btnSubmit').hide();
  }
}

function goToStep(index) {
  currentIndex = index;
  const stateId = getStateId(activeSteps[index]);
  $w('#wizardStates').changeState(stateId);
  updateProgress();
  updateNavButtons();
  wixWindow.scrollTo(0, 0);
}
```

### 3.2 – onReady: Alles initialisieren

```javascript
$w.onReady(function () {
  // Starte mit Typ-Auswahl
  $w('#wizardStates').changeState('stateTypAuswahl');
  $w('#btnSubmit').hide();
  $w('#progressBar').hide();
  $w('#txtStepCounter').hide();

  // ── TYP-AUSWAHL Events ──
  $w('#boxSchriftzug').onClick(() => {
    formData.typ = 'schriftzug';
    formData.berg = '';
    highlightTyp('schriftzug');
  });

  $w('#boxBergmotiv').onClick(() => {
    formData.typ = 'bergmotiv';
    formData.schriftzug = '';
    highlightTyp('bergmotiv');
  });

  $w('#inputSchriftzug').onInput((event) => {
    formData.schriftzug = event.target.value;
  });

  $w('#btnTypWeiter').onClick(() => {
    if (!formData.typ) return showError('Bitte Typ wählen.');
    if (formData.typ === 'schriftzug' && !formData.schriftzug.trim())
      return showError('Bitte Schriftzug eingeben.');
    if (formData.typ === 'bergmotiv' && !formData.berg)
      return showError('Bitte Berg wählen.');

    $w('#wizardStates').changeState('stateConfig');
    updateConfigBadge();
  });

  // ── CONFIG Events ──
  $w('#btnConfigChange').onClick(() => {
    $w('#wizardStates').changeState('stateTypAuswahl');
  });

  $w('#switchHolzart').onChange((e) => { enabledSteps.holzart = e.target.checked; });
  $w('#switchAusfuehrung').onChange((e) => { enabledSteps.ausfuehrung = e.target.checked; });
  $w('#switchExtras').onChange((e) => { enabledSteps.extras = e.target.checked; });
  // switchMasse ist immer an (disabled im Editor)

  $w('#btnConfigBack').onClick(() => {
    $w('#wizardStates').changeState('stateTypAuswahl');
  });

  $w('#btnConfigStart').onClick(() => {
    buildActiveSteps();
    applyDefaults();
    currentIndex = 0;
    $w('#progressBar').show();
    $w('#txtStepCounter').show();
    goToStep(0);
  });

  // ── WIZARD Navigation ──
  $w('#btnBack').onClick(() => {
    if (currentIndex === 0) {
      // Zurück zur Config
      $w('#progressBar').hide();
      $w('#txtStepCounter').hide();
      $w('#btnNext').show();
      $w('#btnSubmit').hide();
      $w('#wizardStates').changeState('stateConfig');
    } else {
      goToStep(currentIndex - 1);
    }
  });

  $w('#btnNext').onClick(() => {
    if (validateCurrentStep()) {
      collectCurrentStepData();
      goToStep(currentIndex + 1);
    }
  });

  $w('#btnSubmit').onClick(() => {
    if (!$w('#checkDatenschutz').checked) {
      return showError('Bitte Datenschutzerklärung akzeptieren.');
    }
    collectCurrentStepData();
    submitForm();
  });

  // ── Input-Listener für Echtzeit-Updates ──
  setupInputListeners();
});
```

### 3.3 – Input-Listener & Daten sammeln

```javascript
function setupInputListeners() {
  // Masse: Live-Vorschau
  $w('#inputBreite').onInput((e) => {
    formData.breite = Number(e.target.value);
    $w('#txtMassePreview').text =
      `${formData.breite} × ${formData.hoehe} × ${formData.tiefe} cm`;
  });
  $w('#inputHoehe').onInput((e) => {
    formData.hoehe = Number(e.target.value);
    $w('#txtMassePreview').text =
      `${formData.breite} × ${formData.hoehe} × ${formData.tiefe} cm`;
  });
  $w('#inputTiefe').onInput((e) => {
    formData.tiefe = Number(e.target.value);
    $w('#txtMassePreview').text =
      `${formData.breite} × ${formData.hoehe} × ${formData.tiefe} cm`;
  });

  // Dropdowns
  $w('#dropOberflaeche').options = [
    { label: 'Natur geölt', value: 'natur-geoelt' },
    { label: 'Weiss geölt',  value: 'weiss-geoelt' },
    { label: 'Gewachst',     value: 'gewachst' },
    { label: 'Lackiert (matt)', value: 'lackiert' },
    { label: 'Unbehandelt',  value: 'unbehandelt' }
  ];
  $w('#dropOberflaeche').value = 'natur-geoelt';

  $w('#dropHaken').options = [
    { label: '4', value: '4' },
    { label: '6', value: '6' },
    { label: '8', value: '8' },
    { label: '10', value: '10' },
    { label: 'Individuell', value: 'individuell' }
  ];
  $w('#dropHaken').value = '6';

  $w('#dropMaterial').options = [
    { label: 'Holz (passend)', value: 'holz' },
    { label: 'Edelstahl',      value: 'edelstahl' },
    { label: 'Messing',        value: 'messing' },
    { label: 'Schwarz Metall', value: 'schwarz-metall' }
  ];
  $w('#dropMaterial').value = 'holz';

  $w('#dropAnrede').options = [
    { label: 'Bitte wählen', value: '' },
    { label: 'Herr',  value: 'herr' },
    { label: 'Frau',  value: 'frau' },
    { label: 'Divers', value: 'divers' }
  ];

  // Extras: Selection Tags
  $w('#tagsExtras').options = [
    { label: '🪞 Spiegel',        value: 'spiegel' },
    { label: '👟 Schuhablage',    value: 'schuhablage' },
    { label: '🗄 Schublade',       value: 'schublade' },
    { label: '🔑 Schlüsselleiste', value: 'schluesselleiste' },
    { label: '🪑 Sitzbank',       value: 'sitzbank' }
  ];
}

function collectCurrentStepData() {
  const step = activeSteps[currentIndex];

  switch (step) {
    case 'masse':
      formData.breite = Number($w('#inputBreite').value) || 120;
      formData.hoehe  = Number($w('#inputHoehe').value) || 180;
      formData.tiefe  = Number($w('#inputTiefe').value) || 35;
      break;
    case 'ausfuehrung':
      formData.oberflaeche  = $w('#dropOberflaeche').value;
      formData.haken        = $w('#dropHaken').value;
      formData.hakenmaterial = $w('#dropMaterial').value;
      formData.hutablage    = $w('#radioHutablage').value;
      break;
    case 'extras':
      formData.extras      = $w('#tagsExtras').value || [];
      formData.bemerkungen = $w('#inputBemerkungen').value;
      break;
    case 'kontakt':
      formData.anrede   = $w('#dropAnrede').value;
      formData.vorname  = $w('#inputVorname').value;
      formData.nachname = $w('#inputNachname').value;
      formData.email    = $w('#inputEmail').value;
      formData.telefon  = $w('#inputTelefon').value;
      formData.strasse  = $w('#inputStrasse').value;
      formData.plz      = $w('#inputPlz').value;
      formData.ort      = $w('#inputOrt').value;
      break;
  }
}
```

### 3.4 – Validierung

```javascript
function validateCurrentStep() {
  const step = activeSteps[currentIndex];

  switch (step) {
    case 'holzart':
      if (!formData.holzart) {
        showError('Bitte Holzart wählen.');
        return false;
      }
      break;
    case 'masse':
      if (!$w('#inputBreite').value || !$w('#inputHoehe').value || !$w('#inputTiefe').value) {
        showError('Bitte alle Masse ausfüllen.');
        return false;
      }
      break;
    case 'kontakt':
      const requiredFields = ['#inputVorname', '#inputNachname', '#inputEmail', '#inputPlz', '#inputOrt'];
      for (const id of requiredFields) {
        if (!$w(id).valid) {
          $w(id).updateValidityIndication();
          showError('Bitte Pflichtfelder ausfüllen.');
          return false;
        }
      }
      break;
  }
  return true;
}

function showError(msg) {
  // Option A: Wix LightBox
  wixWindow.openLightbox('ErrorMessage', { message: msg });

  // Option B: Text-Element on page
  // $w('#txtError').text = msg;
  // $w('#txtError').show('fade', { duration: 300 });
  // setTimeout(() => $w('#txtError').hide('fade'), 3000);
}
```

### 3.5 – Zusammenfassung befüllen

```javascript
// Aufrufen, wenn stateUebersicht angezeigt wird
// → In goToStep() für 'uebersicht' aufrufen

function fillSummary() {
  const labels = {
    holzart: { eiche:'Eiche', esche:'Esche', nussbaum:'Nussbaum', ahorn:'Ahorn', arve:'Arve' },
    oberflaeche: { 'natur-geoelt':'Natur geölt', 'weiss-geoelt':'Weiss geölt', gewachst:'Gewachst', lackiert:'Lackiert', unbehandelt:'Unbehandelt' },
    hakenmaterial: { holz:'Holz', edelstahl:'Edelstahl', messing:'Messing', 'schwarz-metall':'Schwarz Metall' },
    berg: { matterhorn:'Matterhorn', eiger:'Eiger', jungfrau:'Jungfrau', pilatus:'Pilatus', saentis:'Säntis', titlis:'Titlis', rigi:'Rigi' }
  };

  // Typ
  if (formData.typ === 'schriftzug') {
    $w('#txtSummaryTyp').text = `✏️ Schriftzug: „${formData.schriftzug}"`;
  } else {
    $w('#txtSummaryTyp').text = `⛰️ Bergmotiv: ${labels.berg[formData.berg] || '–'}`;
  }

  $w('#txtSummaryHolz').text       = labels.holzart[formData.holzart] || '–';
  $w('#txtSummaryMasse').text      = `${formData.breite} × ${formData.hoehe} × ${formData.tiefe} cm`;
  $w('#txtSummaryOberflaeche').text = labels.oberflaeche[formData.oberflaeche] || '–';
  $w('#txtSummaryHaken').text      = `${formData.haken}× ${labels.hakenmaterial[formData.hakenmaterial] || ''}`;
  $w('#txtSummaryHutablage').text  = formData.hutablage === 'ja' ? 'Ja' : 'Nein';
  $w('#txtSummaryName').text       = `${formData.vorname} ${formData.nachname}`;
  $w('#txtSummaryEmail').text      = formData.email;
}
```

### 3.6 – Formular absenden

```javascript
async function submitForm() {
  try {
    const item = {
      ...formData,
      _createdDate: new Date()
    };

    await wixData.insert('GarderobeBestellungen', item);

    // Zur Bestätigung wechseln
    $w('#progressBar').hide();
    $w('#txtStepCounter').hide();
    $w('#btnBack').hide();
    $w('#btnNext').hide();
    $w('#btnSubmit').hide();
    $w('#wizardStates').changeState('stateDone');
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    showError('Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
  }
}

// Neu starten
// In $w.onReady:
// $w('#btnNeustart').onClick(() => location.reload());
```

---

## Phase 4: Design & Styling

### 4.1 – Brand-Farben übertragen

Setze die Farben in den Wix-Design-Einstellungen (Site Design → Colors):

| Token | Hex | Verwendung |
|---|---|---|
| Primär | `#1f3b31` | Buttons, aktive Elemente |
| Hintergrund | `#f3f1ea` | Seiten-Hintergrund |
| Text | `#1f2a23` | Haupttext |
| Muted | `#5b615b` | Sekundärtext |
| Border | `#c8c5bb` | Ränder, inaktive Elemente |
| Feld-BG | `#faf9f6` | Input-Hintergründe |
| Error | `#a03030` | Fehlermeldungen |

### 4.2 – Custom CSS (Wix Studio)

In Wix Studio kannst du Custom CSS pro Element hinzufügen. Zum Beispiel für die Progress Bar:

```css
/* In Global CSS oder per-Element CSS */
.progress-bar-fill {
  background-color: #1f3b31;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 4.3 – Typografie

Setze die Schriftart im Site Design auf **System UI** oder die von dir gewählte Brand-Schrift. Imitiere die Styles aus dem Wizard:

- **Titel:** 800 weight, uppercase, letter-spacing 0.04–0.06em
- **Labels:** 600 weight, 12px, letter-spacing 0.03em
- **Body:** 400 weight, 14px

### 4.4 – Transitions / Animationen

Wix bietet Effect-Options bei `show()` und `hide()`. Du kannst beim State-Wechsel animieren:

```javascript
// Statt CSS @keyframes slideFromRight:
function goToStep(index) {
  currentIndex = index;
  const stateId = getStateId(activeSteps[index]);

  // Wix Multi-State Box wechselt States ohne eigene Animation,
  // aber du kannst Elemente innerhalb animieren:
  $w('#wizardStates').changeState(stateId).then(() => {
    // Elemente im neuen State einblenden
    // $w('#stepContent').show('slide', { direction: 'right', duration: 350 });
  });

  updateProgress();
  updateNavButtons();
  wixWindow.scrollTo(0, 0);
}
```

---

## Phase 5: Backend (optional, empfohlen)

### 5.1 – Backend-Modul für E-Mail-Benachrichtigung

Erstelle die Datei **backend/bestellung.jsw** (Web Module):

```javascript
// backend/bestellung.jsw
import wixData from 'wix-data';
import { triggeredEmails } from 'wix-crm';

export async function submitBestellung(data) {
  // 1. In Collection speichern
  const result = await wixData.insert('GarderobeBestellungen', data, { suppressAuth: true });

  // 2. Optional: E-Mail an Kunden senden (Triggered Email in Wix konfigurieren)
  // await triggeredEmails.emailContact('bestellbestaetigung', contactId, {
  //   variables: { vorname: data.vorname, typ: data.typ }
  // });

  return result;
}
```

Im Frontend dann:

```javascript
import { submitBestellung } from 'backend/bestellung.jsw';

async function submitForm() {
  try {
    await submitBestellung(formData);
    $w('#wizardStates').changeState('stateDone');
  } catch (err) {
    showError('Fehler beim Senden.');
  }
}
```

---

## Phase 6: Testen & Publizieren

### 6.1 – Preview-Modus

1. Klicke **Run** (oder das Preview-Icon oben rechts).
2. Gehe jeden Pfad durch:
   - Schriftzug-Garderobe → alle Schritte → Absenden
   - Bergmotiv-Garderobe → Schritte deaktivieren → schneller Durchlauf
3. Prüfe die Developer Console (unten) auf Fehler.
4. Prüfe in der CMS-Collection, ob die Daten korrekt ankommen.

### 6.2 – Mobile Optimierung

- Teste jeden State auf Mobile-Breakpoints im Editor.
- Stelle sicher, dass die Navigation (Zurück/Weiter) auf kleinen Screens nicht abgeschnitten wird.
- Nutze Wix Studio's responsive Einstellungen pro Breakpoint.

### 6.3 – Publizieren

1. Speichere alle Änderungen.
2. Klicke **Publish**.
3. Teste die Live-URL erneut.

---

## Checkliste

- [ ] Wix Studio mit Coding aktiviert
- [ ] Collection `GarderobeBestellungen` mit allen Feldern angelegt
- [ ] Multi-State Box mit 9 States erstellt
- [ ] Alle UI-Elemente in jedem State platziert & IDs vergeben
- [ ] Page Code: formData, Navigation, Validierung, Submit
- [ ] Dropdowns mit Options befüllt
- [ ] Zusammenfassung befüllt sich korrekt
- [ ] Daten werden in Collection gespeichert
- [ ] E-Mail-Benachrichtigung eingerichtet (optional)
- [ ] Mobile getestet
- [ ] Live getestet nach Publish

---

## Wichtige Unterschiede zu beachten

**Kein direkter DOM-Zugriff.** In Wix Velo kannst du nicht `document.querySelector()` oder jQuery verwenden. Alles läuft über die `$w()`-Selektor-Funktion.

**Kein React-Rendering.** Es gibt keinen Virtual DOM oder re-render Cycle. Wenn sich Daten ändern, musst du die UI-Elemente manuell updaten (`$w('#element').text = 'neuer Wert'`).

**Multi-State Box ≠ React State.** Die Multi-State Box ist ein visuelles Container-Element. Du steuerst den angezeigten State per `changeState()`, nicht per bedingtes Rendering.

**Backend-Code ist getrennt.** Dateien in `/backend` laufen serverseitig. Du importierst Funktionen daraus mit dem `.jsw`-Suffix (Web Module).

**Flow-Richtungs-Feature.** Das UX-Feature mit der Flussrichtungs-Umschaltung (→ ↓ ↑) lässt sich in Wix nur eingeschränkt umsetzen, da die Multi-State Box keine nativen Slide-Richtungen unterstützt. Workaround: Elemente innerhalb des States mit verschiedenen `show()`-Effekten einblenden (`slide` mit `direction: 'right'/'bottom'/'top'`).

---

## 7. ADDENDUM — Fehlende Features im Guide (aus JSX-Analyse)

> Die folgenden Features sind im Original-JSX vorhanden, aber in den Phasen 1–6 dieses Guides nicht vollständig abgedeckt.

### 7.1 Schriftart-Auswahl (Font Picker)

Das JSX hat ein `schriftart`-Feld mit 6 Optionen, das bei Typ "Schriftzug" angezeigt wird.

**CMS-Feld ergänzen:**

| Feld | Key | Typ |
|------|-----|-----|
| Schriftart | `schriftart` | Text |

**UI-Element (in `stateTypAuswahl`):**

| Element | ID | Typ | Hinweis |
|---------|----|-----|---------|
| Font-Auswahl | `#tagsSchriftart` | Selection Tags | 6 Optionen, Einzelwahl |

```
Optionen:
  Value: sans       Label: Modern
  Value: serif      Label: Klassisch
  Value: slab       Label: Slab
  Value: condensed  Label: Schmal
  Value: rounded    Label: Rund
  Value: script     Label: Handschrift
```

**Page Code (in `$w.onReady`, nach Schriftzug-Input):**

```js
$w('#tagsSchriftart').onChange((event) => {
  formData.schriftart = event.target.value[0] || '';
});
```

**Validierung (Typ-Weiter-Button):**

```js
if (formData.typ === 'schriftzug' && !formData.schriftart)
  return showError('Bitte Schriftart wählen.');
```

**Summary ergänzen:**

```js
const fontLabel = schriftarten.find(f => f.value === formData.schriftart)?.label || '';
$w('#txtSummaryTyp').text = `✏️ Schriftzug: „${formData.schriftzug}" · ${fontLabel}`;
```

### 7.2 Zeichen-Zähler

Das JSX zeigt „X Zeichen übrig" (max 30) beim Schriftzug-Input.

| Element | ID | Typ | Hinweis |
|---------|----|-----|---------|
| Zeichen-Zähler | `#txtCharCount` | Text | Optional, hidden by default |

```js
$w('#inputSchriftzug').onInput((event) => {
  formData.schriftzug = event.target.value;
  try {
    $w('#txtCharCount').text = `${30 - formData.schriftzug.length} Zeichen übrig`;
  } catch {}
});
```

### 7.3 Vollständige Velo-Code-Dateien

Vollständig generierte, sofort einfügbare Velo-Code-Dateien befinden sich im Ordner `velo-code/`:

- **`page-garderobe-bestellen.js`** — Kompletter Page Code (direkt in den Page Code Editor einfügen)
- **`backend-bestellung.jsw`** — Backend Web Module (als `backend/bestellung.jsw` erstellen)
- **`ELEMENT-CHECKLIST.md`** — Vollständige Element-ID-Checkliste mit allen Wix-Komponenten
