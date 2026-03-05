// ═══════════════════════════════════════════════════════════════════════════════
// Garderobe-Wizard — Wix Velo Page Code
// ═══════════════════════════════════════════════════════════════════════════════
//
// PASTE THIS into the Page Code editor for your "Garderobe bestellen" page.
//
// Before pasting, make sure you've created all UI elements with the correct IDs
// as documented in migration-guide-wix-velo.md (Phase 2).
//
// ═══════════════════════════════════════════════════════════════════════════════

import wixData from 'wix-data';
import wixWindow from 'wix-window';

// ── Data (mirrored from garderobe-wizard.jsx) ────────────────────────────────

const holzarten = [
  { value: "eiche", label: "Eiche", desc: "Robust & zeitlos", emoji: "🪵" },
  { value: "esche", label: "Esche", desc: "Hell & elegant", emoji: "🌿" },
  { value: "nussbaum", label: "Nussbaum", desc: "Warm & edel", emoji: "🌰" },
  { value: "ahorn", label: "Ahorn", desc: "Fein & hell", emoji: "🍁" },
  { value: "arve", label: "Arve / Zirbe", desc: "Duftend & alpin", emoji: "🌲" },
];

const oberflaechen = [
  { label: 'Natur geölt', value: 'natur-geoelt' },
  { label: 'Weiss geölt', value: 'weiss-geoelt' },
  { label: 'Gewachst', value: 'gewachst' },
  { label: 'Lackiert (matt)', value: 'lackiert' },
  { label: 'Unbehandelt', value: 'unbehandelt' },
];

const hakenMaterialien = [
  { label: 'Holz (passend)', value: 'holz' },
  { label: 'Edelstahl', value: 'edelstahl' },
  { label: 'Messing', value: 'messing' },
  { label: 'Schwarz Metall', value: 'schwarz-metall' },
];

const hakenAnzahl = [
  { label: '4', value: '4' },
  { label: '6', value: '6' },
  { label: '8', value: '8' },
  { label: '10', value: '10' },
  { label: 'Individuell', value: 'individuell' },
];

const extrasOptions = [
  { label: '🪞 Spiegel', value: 'spiegel' },
  { label: '👟 Schuhablage', value: 'schuhablage' },
  { label: '🗄 Schublade', value: 'schublade' },
  { label: '🔑 Schlüsselleiste', value: 'schluesselleiste' },
  { label: '🪑 Sitzbank', value: 'sitzbank' },
];

const anredeOptions = [
  { label: 'Bitte wählen', value: '' },
  { label: 'Herr', value: 'herr' },
  { label: 'Frau', value: 'frau' },
  { label: 'Divers', value: 'divers' },
];

const berge = [
  { value: "matterhorn", label: "Matterhorn", hoehe: "4'478 m", region: "Wallis" },
  { value: "eiger", label: "Eiger", hoehe: "3'967 m", region: "Berner Oberland" },
  { value: "jungfrau", label: "Jungfrau", hoehe: "4'158 m", region: "Berner Oberland" },
  { value: "pilatus", label: "Pilatus", hoehe: "2'128 m", region: "Zentralschweiz" },
  { value: "saentis", label: "Säntis", hoehe: "2'502 m", region: "Appenzell" },
  { value: "titlis", label: "Titlis", hoehe: "3'238 m", region: "Obwalden" },
  { value: "rigi", label: "Rigi", hoehe: "1'797 m", region: "Zentralschweiz" },
];

const schriftarten = [
  { value: "sans", label: "Modern" },
  { value: "serif", label: "Klassisch" },
  { value: "slab", label: "Slab" },
  { value: "condensed", label: "Schmal" },
  { value: "rounded", label: "Rund" },
  { value: "script", label: "Handschrift" },
];

// ── Form state (replaces React useState) ─────────────────────────────────────

let formData = {
  typ: '',          // 'schriftzug' | 'bergmotiv'
  schriftzug: '',
  schriftart: '',   // NOTE: missing from original migration guide
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
  ort: '',
};

// ── Wizard step control ──────────────────────────────────────────────────────

const OPTIONAL_STEPS = [
  { id: 'holzart',     defaultOn: true,  required: false, defaults: { holzart: 'eiche' } },
  { id: 'masse',       defaultOn: true,  required: true,  defaults: { breite: 120, hoehe: 180, tiefe: 35 } },
  { id: 'ausfuehrung', defaultOn: true,  required: false, defaults: { oberflaeche: 'natur-geoelt', haken: '6', hakenmaterial: 'holz', hutablage: 'ja' } },
  { id: 'extras',      defaultOn: false, required: false, defaults: { extras: [], bemerkungen: '' } },
];

let enabledSteps = {
  holzart: true,
  masse: true,
  ausfuehrung: true,
  extras: false,
};

let activeSteps = [];
let currentIndex = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildActiveSteps() {
  const optional = ['holzart', 'masse', 'ausfuehrung', 'extras']
    .filter(id => enabledSteps[id]);
  activeSteps = [...optional, 'kontakt', 'uebersicht'];
}

function applyDefaults() {
  OPTIONAL_STEPS.forEach(s => {
    if (!enabledSteps[s.id] && s.defaults) {
      Object.assign(formData, s.defaults);
    }
  });
}

const STATE_MAP = {
  holzart: 'stateHolzart',
  masse: 'stateMasse',
  ausfuehrung: 'stateAusfuehrung',
  extras: 'stateExtras',
  kontakt: 'stateKontakt',
  uebersicht: 'stateUebersicht',
};

function getStateId(stepId) {
  return STATE_MAP[stepId];
}

function updateProgress() {
  const total = activeSteps.length;
  const current = currentIndex + 1;
  $w('#txtStepCounter').text = `${current} / ${total}`;
  $w('#progressBar').value = (current / total) * 100;
}

function updateNavButtons() {
  const stepId = activeSteps[currentIndex];

  // Back button label
  $w('#btnBack').label = currentIndex === 0 ? '← ANPASSEN' : '← ZURÜCK';

  // Show Submit on last step, Next on all others
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
  const stepId = activeSteps[index];
  const stateId = getStateId(stepId);

  $w('#wizardStates').changeState(stateId).then(() => {
    // Populate step-specific data after state change
    if (stepId === 'uebersicht') fillSummary();
    if (stepId === 'masse') updateMassePreview();
  });

  updateProgress();
  updateNavButtons();
  wixWindow.scrollTo(0, 0);
}

function updateMassePreview() {
  $w('#txtMassePreview').text =
    `${formData.breite} × ${formData.hoehe} × ${formData.tiefe} cm`;
}

// ── Validation ───────────────────────────────────────────────────────────────

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
      if (!formData.breite || !formData.hoehe || !formData.tiefe) {
        showError('Bitte alle Masse ausfüllen.');
        return false;
      }
      break;

    case 'kontakt': {
      const requiredFields = [
        '#inputVorname', '#inputNachname', '#inputEmail', '#inputPlz', '#inputOrt'
      ];
      for (const id of requiredFields) {
        if (!$w(id).valid) {
          $w(id).updateValidityIndication();
          showError('Bitte Pflichtfelder ausfüllen.');
          return false;
        }
      }
      break;
    }
  }
  return true;
}

function showError(msg) {
  // Option A: Use a text element on the page
  // Make sure you have a #txtError element (hidden by default)
  try {
    $w('#txtError').text = msg;
    $w('#txtError').show('fade', { duration: 300 });
    setTimeout(() => $w('#txtError').hide('fade', { duration: 300 }), 4000);
  } catch {
    console.error('Error:', msg);
  }
}

// ── Data collection ──────────────────────────────────────────────────────────

function collectCurrentStepData() {
  const step = activeSteps[currentIndex];

  switch (step) {
    case 'masse':
      formData.breite = Number($w('#inputBreite').value) || 120;
      formData.hoehe = Number($w('#inputHoehe').value) || 180;
      formData.tiefe = Number($w('#inputTiefe').value) || 35;
      break;

    case 'ausfuehrung':
      formData.oberflaeche = $w('#dropOberflaeche').value;
      formData.haken = $w('#dropHaken').value;
      formData.hakenmaterial = $w('#dropMaterial').value;
      formData.hutablage = $w('#radioHutablage').value;
      break;

    case 'extras':
      formData.extras = $w('#tagsExtras').value || [];
      formData.bemerkungen = $w('#inputBemerkungen').value;
      break;

    case 'kontakt':
      formData.anrede = $w('#dropAnrede').value;
      formData.vorname = $w('#inputVorname').value;
      formData.nachname = $w('#inputNachname').value;
      formData.email = $w('#inputEmail').value;
      formData.telefon = $w('#inputTelefon').value;
      formData.strasse = $w('#inputStrasse').value;
      formData.plz = $w('#inputPlz').value;
      formData.ort = $w('#inputOrt').value;
      break;
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────

function fillSummary() {
  const labels = {
    holzart: { eiche: 'Eiche', esche: 'Esche', nussbaum: 'Nussbaum', ahorn: 'Ahorn', arve: 'Arve / Zirbe' },
    oberflaeche: { 'natur-geoelt': 'Natur geölt', 'weiss-geoelt': 'Weiss geölt', gewachst: 'Gewachst', lackiert: 'Lackiert', unbehandelt: 'Unbehandelt' },
    hakenmaterial: { holz: 'Holz', edelstahl: 'Edelstahl', messing: 'Messing', 'schwarz-metall': 'Schwarz Metall' },
    berg: { matterhorn: 'Matterhorn', eiger: 'Eiger', jungfrau: 'Jungfrau', pilatus: 'Pilatus', saentis: 'Säntis', titlis: 'Titlis', rigi: 'Rigi' },
    schriftart: { sans: 'Modern', serif: 'Klassisch', slab: 'Slab', condensed: 'Schmal', rounded: 'Rund', script: 'Handschrift' },
  };

  // Typ
  if (formData.typ === 'schriftzug') {
    const fontLabel = labels.schriftart[formData.schriftart] || '';
    $w('#txtSummaryTyp').text = `✏️ Schriftzug: „${formData.schriftzug}" · ${fontLabel}`;
  } else {
    $w('#txtSummaryTyp').text = `⛰️ Bergmotiv: ${labels.berg[formData.berg] || '–'}`;
  }

  $w('#txtSummaryHolz').text = labels.holzart[formData.holzart] || '–';
  $w('#txtSummaryMasse').text = `${formData.breite} × ${formData.hoehe} × ${formData.tiefe} cm`;
  $w('#txtSummaryOberflaeche').text = labels.oberflaeche[formData.oberflaeche] || '–';
  $w('#txtSummaryHaken').text = `${formData.haken}× ${labels.hakenmaterial[formData.hakenmaterial] || ''}`;
  $w('#txtSummaryHutablage').text = formData.hutablage === 'ja' ? 'Ja' : 'Nein';

  // Extras
  if (formData.extras.length > 0) {
    const extLabels = formData.extras.map(v => {
      const opt = extrasOptions.find(e => e.value === v);
      return opt ? opt.label : v;
    });
    $w('#txtSummaryExtras').text = extLabels.join(', ');
    $w('#txtSummaryExtras').show();
  } else {
    try { $w('#txtSummaryExtras').hide(); } catch { }
  }

  // Contact
  $w('#txtSummaryName').text = `${formData.vorname} ${formData.nachname}`;
  $w('#txtSummaryEmail').text = formData.email;
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function submitForm() {
  try {
    // Prefer backend web module for security
    // import { submitBestellung } from 'backend/bestellung.jsw';
    // await submitBestellung(formData);

    // Fallback: direct insert (less secure, but works without backend)
    const item = {
      ...formData,
      extras: formData.extras.join(', '),  // Tags → comma string for CMS
      _createdDate: new Date(),
    };
    await wixData.insert('GarderobeBestellungen', item);

    // Switch to done state
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

// ═════════════════════════════════════════════════════════════════════════════
// $w.onReady — MAIN ENTRY POINT
// ═════════════════════════════════════════════════════════════════════════════

$w.onReady(function () {

  // ── Initial state ──
  $w('#wizardStates').changeState('stateTypAuswahl');
  $w('#btnSubmit').hide();
  $w('#progressBar').hide();
  $w('#txtStepCounter').hide();
  $w('#btnBack').hide();
  $w('#btnNext').hide();

  // ══════════════════════════════════════════
  // STATE: stateTypAuswahl
  // ══════════════════════════════════════════

  $w('#boxSchriftzug').onClick(() => {
    formData.typ = 'schriftzug';
    formData.berg = '';
    // Highlight selected card (use Wix style overrides)
    $w('#boxSchriftzug').style.borderColor = '#1f3b31';
    $w('#boxSchriftzug').style.backgroundColor = 'rgba(31,59,49,0.06)';
    $w('#boxBergmotiv').style.borderColor = '#c8c5bb';
    $w('#boxBergmotiv').style.backgroundColor = '#faf9f6';
    // Show schriftzug input section
    try { $w('#sectionSchriftzug').show('fade', { duration: 250 }); } catch { }
    try { $w('#sectionBerge').hide('fade', { duration: 200 }); } catch { }
  });

  $w('#boxBergmotiv').onClick(() => {
    formData.typ = 'bergmotiv';
    formData.schriftzug = '';
    formData.schriftart = '';
    $w('#boxBergmotiv').style.borderColor = '#1f3b31';
    $w('#boxBergmotiv').style.backgroundColor = 'rgba(31,59,49,0.06)';
    $w('#boxSchriftzug').style.borderColor = '#c8c5bb';
    $w('#boxSchriftzug').style.backgroundColor = '#faf9f6';
    try { $w('#sectionBerge').show('fade', { duration: 250 }); } catch { }
    try { $w('#sectionSchriftzug').hide('fade', { duration: 200 }); } catch { }
  });

  // Schriftzug text input
  $w('#inputSchriftzug').onInput((event) => {
    formData.schriftzug = event.target.value;
    // Update character counter if you have one
    try {
      $w('#txtCharCount').text = `${30 - formData.schriftzug.length} Zeichen übrig`;
    } catch { }
  });

  // Schriftart selection (if using a repeater #repeaterFonts or selection tags)
  // Adapt this to your chosen UI element!
  try {
    $w('#tagsSchriftart').onChange((event) => {
      formData.schriftart = event.target.value[0] || '';
    });
  } catch { }

  // Berg selection via repeater
  try {
    $w('#repeaterBerge').onItemReady(($item, itemData) => {
      $item('#txtBergName').text = itemData.label;
      $item('#txtBergInfo').text = `${itemData.hoehe} · ${itemData.region}`;
      // Berg SVG would need to be set as image or custom element
    });
    $w('#repeaterBerge').data = berge;

    $w('#repeaterBerge').forEachItem(($item, itemData) => {
      $item('#containerBerg').onClick(() => {
        formData.berg = itemData.value;
        // Highlight: reset all, then highlight selected
        $w('#repeaterBerge').forEachItem(($i, iData) => {
          const isSelected = iData.value === itemData.value;
          $i('#containerBerg').style.borderColor = isSelected ? '#1f3b31' : '#c8c5bb';
          $i('#containerBerg').style.backgroundColor = isSelected ? 'rgba(31,59,49,0.06)' : '#faf9f6';
        });
      });
    });
  } catch (e) {
    console.log('repeaterBerge setup skipped:', e.message);
  }

  // Typ continue button
  $w('#btnTypWeiter').onClick(() => {
    if (!formData.typ) return showError('Bitte Typ wählen.');
    if (formData.typ === 'schriftzug') {
      if (!formData.schriftzug.trim()) return showError('Bitte Schriftzug eingeben.');
      if (!formData.schriftart) return showError('Bitte Schriftart wählen.');
    }
    if (formData.typ === 'bergmotiv' && !formData.berg) return showError('Bitte Berg wählen.');

    $w('#wizardStates').changeState('stateConfig');
    updateConfigBadge();
  });

  // ══════════════════════════════════════════
  // STATE: stateConfig
  // ══════════════════════════════════════════

  function updateConfigBadge() {
    if (formData.typ === 'schriftzug') {
      const fontLabel = schriftarten.find(f => f.value === formData.schriftart)?.label || '';
      $w('#txtConfigTyp').text = `✏️ „${formData.schriftzug}" · ${fontLabel}`;
    } else {
      const bergLabel = berge.find(b => b.value === formData.berg)?.label || '';
      $w('#txtConfigTyp').text = `⛰️ ${bergLabel}`;
    }
  }

  $w('#btnConfigChange').onClick(() => {
    $w('#wizardStates').changeState('stateTypAuswahl');
  });

  // Step toggles
  $w('#switchHolzart').onChange((e) => { enabledSteps.holzart = e.target.checked; });
  $w('#switchAusfuehrung').onChange((e) => { enabledSteps.ausfuehrung = e.target.checked; });
  $w('#switchExtras').onChange((e) => { enabledSteps.extras = e.target.checked; });
  // switchMasse is always on & disabled in editor

  $w('#btnConfigBack').onClick(() => {
    $w('#wizardStates').changeState('stateTypAuswahl');
  });

  $w('#btnConfigStart').onClick(() => {
    buildActiveSteps();
    applyDefaults();
    currentIndex = 0;
    $w('#progressBar').show();
    $w('#txtStepCounter').show();
    $w('#btnBack').show();
    $w('#btnNext').show();
    goToStep(0);
  });

  // ══════════════════════════════════════════
  // STATE: stateHolzart (if using repeater)
  // ══════════════════════════════════════════

  try {
    $w('#repeaterHolz').onItemReady(($item, itemData) => {
      $item('#txtHolzName').text = itemData.label;
      $item('#txtHolzDesc').text = itemData.desc;
      $item('#txtHolzEmoji').text = itemData.emoji;
    });
    $w('#repeaterHolz').data = holzarten.map(h => ({ ...h, _id: h.value }));

    $w('#repeaterHolz').forEachItem(($item, itemData) => {
      $item('#containerHolz').onClick(() => {
        formData.holzart = itemData.value;
        $w('#repeaterHolz').forEachItem(($i, iData) => {
          const on = iData.value === itemData.value;
          $i('#containerHolz').style.borderColor = on ? '#1f3b31' : '#c8c5bb';
          $i('#containerHolz').style.backgroundColor = on ? 'rgba(31,59,49,0.06)' : '#faf9f6';
        });
      });
    });
  } catch { }

  // ══════════════════════════════════════════
  // STATE: stateMasse
  // ══════════════════════════════════════════

  $w('#inputBreite').onInput((e) => {
    formData.breite = Number(e.target.value) || 0;
    updateMassePreview();
  });
  $w('#inputHoehe').onInput((e) => {
    formData.hoehe = Number(e.target.value) || 0;
    updateMassePreview();
  });
  $w('#inputTiefe').onInput((e) => {
    formData.tiefe = Number(e.target.value) || 0;
    updateMassePreview();
  });

  // Set initial values
  $w('#inputBreite').value = String(formData.breite);
  $w('#inputHoehe').value = String(formData.hoehe);
  $w('#inputTiefe').value = String(formData.tiefe);

  // ══════════════════════════════════════════
  // STATE: stateAusfuehrung — Populate dropdowns
  // ══════════════════════════════════════════

  $w('#dropOberflaeche').options = oberflaechen;
  $w('#dropOberflaeche').value = formData.oberflaeche;

  $w('#dropHaken').options = hakenAnzahl;
  $w('#dropHaken').value = formData.haken;

  $w('#dropMaterial').options = hakenMaterialien;
  $w('#dropMaterial').value = formData.hakenmaterial;

  // radioHutablage default
  try { $w('#radioHutablage').value = formData.hutablage; } catch { }

  // ══════════════════════════════════════════
  // STATE: stateExtras
  // ══════════════════════════════════════════

  $w('#tagsExtras').options = extrasOptions;

  // ══════════════════════════════════════════
  // STATE: stateKontakt
  // ══════════════════════════════════════════

  $w('#dropAnrede').options = anredeOptions;

  // ══════════════════════════════════════════
  // WIZARD NAVIGATION (outside the MSB)
  // ══════════════════════════════════════════

  $w('#btnBack').onClick(() => {
    if (currentIndex === 0) {
      // Back to config
      $w('#progressBar').hide();
      $w('#txtStepCounter').hide();
      $w('#btnBack').hide();
      $w('#btnNext').show();
      $w('#btnSubmit').hide();
      $w('#wizardStates').changeState('stateConfig');
    } else {
      goToStep(currentIndex - 1);
    }
  });

  $w('#btnNext').onClick(() => {
    collectCurrentStepData();
    if (validateCurrentStep()) {
      goToStep(currentIndex + 1);
    }
  });

  $w('#btnSubmit').onClick(() => {
    collectCurrentStepData();
    if (!$w('#checkDatenschutz').checked) {
      return showError('Bitte Datenschutzerklärung akzeptieren.');
    }
    submitForm();
  });

  // ══════════════════════════════════════════
  // STATE: stateDone
  // ══════════════════════════════════════════

  try {
    $w('#btnNeustart').onClick(() => {
      // Full page reload to reset everything
      wixWindow.openUrl(wixWindow.location.url, '_self');
    });
  } catch { }

}); // end $w.onReady
