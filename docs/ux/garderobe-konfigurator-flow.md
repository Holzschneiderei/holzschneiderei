# User Flow: Garderobe-Konfigurator

## Einstiegspunkt

Nutzerin landet auf `holzschneiderei.ch/garderobe-konfigurieren` via Google, Social Media oder Direktlink.
Der Konfigurator ist als Iframe in die Wix-Seite eingebettet.

---

## Flow-Schritte

### 1. Produktwahl (PhaseTypen)

**Anzeige**: Karten für alle verfügbaren Produkte (Schriftzug mit Garderobe-Variante, Bergmotiv „Demnächst")

**Primäre Aktion**: Produkt auswählen → „Weiter konfigurieren"

**Abzweigungen**:
- Schriftzug → Varianten-Selektor (Garderobe mit Haken / Nur Schriftzug)
- Bergmotiv (Coming Soon) → E-Mail-Benachrichtigung eintragen

**Ausgang**: Produktauswahl bestätigt → Wizard startet (PhaseWizard)

**Validierung**:
- Produkt muss ausgewählt sein
- Bei Schriftzug: Text und Schriftart müssen ausgefüllt sein

---

### 2. Holzart wählen (StepHolzart)

**Anzeige**: Raster mit 5 Holzarten (Eiche, Esche, Nussbaum, Ahorn, Arve/Zirbe)
- Jede Karte: Emoji + Name + Kurzbeschreibung
- Ausgewählte Karte: visuell hervorgehoben (Checkmark + Rahmen)

**Primäre Aktion**: Holzart anklicken → automatisch ausgewählt

**Ausgang**: Weiter zu Masse

**Edge Cases**:
- Wenn Admin die Kategorie deaktiviert: erster verfügbarer Eintrag wird automatisch vorausgewählt, Schritt zeigt Auswahl als „vorausgewählt" an

---

### 3. Masse eingeben (StepMasse)

**Anzeige**: Dimensionseingabe (Breite, Höhe, Tiefe) mit Min/Max-Anzeige
- Modus: Pill-Buttons (Preset-Werte) oder Freitexteingabe (je nach Admin-Konfiguration)
- Live-Aktualisierung des SVG-Previews

**Primäre Aktion**: Werte eingeben oder Presets auswählen

**Validierung (onBlur)**:
- Pflichtfelder: Breite, Höhe, Tiefe (wenn aktiviert)
- Werte ausserhalb Min/Max: Inline-Fehlermeldung
- Fehler werden via `role="alert"` für Screen-Reader angekündigt

**Ausgang**: Weiter zu Ausführung (oder Darstellung bei Schriftzug-Produkt)

---

### 4a. Ausführung wählen – Garderobe (StepAusfuehrung)

**Anzeige**: Drei Konfigurationsbereiche:
1. **Oberfläche**: Karten (Natur geölt, Weiss geölt, Gewachst, Lackiert, Unbehandelt)
2. **Hakenmaterial**: Karten (Holz, Edelstahl, Messing, Schwarz Metall)
3. **Hakenanzahl**: Eingabefeld oder Pill-Buttons (automatisch auf Min/Max geclippt)

**Primäre Aktion**: Optionen auswählen → Weiter

**Edge Cases**:
- Hakenanzahl wird bei Breitenänderung automatisch auf erlaubten Bereich angepasst (useEffect)

---

### 4b. Darstellung wählen – Schriftzug (StepDarstellung)

**Anzeige**: Darstellungsoptionen (Wandmontage, mit Ständer, etc.)

**Primäre Aktion**: Darstellung auswählen → Weiter

---

### 5. Extras wählen (StepExtras) — nur bei Garderobe

**Anzeige**: Toggle-Karten für Extras:
- Spiegel 🪞
- Schuhablage 👟
- Schublade 🗄
- Schlüsselleiste 🔑
- Sitzbank 🪑

**Primäre Aktion**: Beliebige Extras an-/abwählen (Mehrfachauswahl) → Weiter

**Keine Pflichtauswahl** – alle Extras optional

---

### 6. Kontaktdaten eingeben (StepKontakt)

**Anzeige**: Kontaktformular
- Anrede (Dropdown): Herr / Frau / Divers
- Vorname*, Nachname* (inline nebeneinander)
- E-Mail* (Validierung: Format-Prüfung)
- Telefon (optional)
- Feld-Labels sind per `htmlFor`/`id` mit Inputs verknüpft

**Validierung (onBlur + Submit)**:
- Pflichtfelder: Vorname, Nachname, E-Mail
- E-Mail-Format: `aria-invalid`, Fehlermeldung via `role="alert"`

**Trust-Signal** (Empfehlung): Kurze Erklärung unter dem Formular

**Ausgang**: Weiter zu Übersicht

---

### 7. Übersicht & Absenden (StepUebersicht)

**Anzeige**: Konfigurationszusammenfassung
- Produktname + Produktbild/SVG-Vorschau
- Alle gewählten Optionen (Holzart, Masse, Oberfläche, Extras, Kontakt)
- **Gesamtpreis** prominent angezeigt
- „Jetzt anfragen"-Button (primär) + „Zurück"-Navigation

**Primäre Aktion**: „Jetzt anfragen" → Konfiguration wird gespeichert + Checkout eingeleitet

**Edge Cases**:
- Checkout-Fehler: Fehlermeldung in rotem Box unter dem Button
- Netzwerkfehler: Retry-Möglichkeit

**Ausgang**: PhaseDone

---

### 8. Abschluss (PhaseDone)

**Anzeige**:
- Bestätigungsicon (✓ in Brand-Farbe)
- „Vielen Dank!"-Überschrift
- Erklärungstext: „Ihre Konfiguration wurde gespeichert. Sie werden in Kürze zur Bezahlung weitergeleitet."
- Bei Fehler: Fehler-Box mit Meldung
- Button: „Neue Konfiguration starten"

**Ausgang**: Neue Konfiguration (zurück zu PhaseTypen + Reset)

---

## Fortschrittsanzeige

Der Wizard zeigt oben eine Schritt-Navigation (SideRail / Progress Indicator):
- Aktueller Schritt: `aria-current="step"`
- Abgeschlossene Schritte: visuell abgehakt
- Navigation zu bereits besuchten Schritten möglich

---

## Preis-Anzeige

Der aktuelle Preis wird während des gesamten Wizards sichtbar angezeigt:
- Berechnung basiert auf Breite × Holzart (Fixpreistabelle) + Extras
- Aktualisiert sich live bei jeder Optionsänderung
- `aria-live="polite"` sorgt dafür, dass Screen-Reader Preisänderungen ankündigen

---

## Design-Prinzipien

### 1. Progressive Disclosure
- Nicht alle Optionen gleichzeitig zeigen
- Extras erst nach Grundkonfiguration (Schritt 5)
- Admin kann Kategorien ausblenden, die für das Produkt irrelevant sind

### 2. Konstanter Preisüberblick
- Preis immer sichtbar (nicht erst in der Übersicht)
- Holzart-Wechsel → sofortige Preisänderung sichtbar

### 3. Kontext-sensitive Hilfe
- Min/Max-Werte direkt bei Eingabefeldern
- Validierungs-Fehler inline (nicht erst beim Submit)
- Erklärungen ohne externe Dokumentation

### 4. Vertrauen aufbauen
- Trust-Signal bei Kontaktformular
- Klare Erwartung: „Sie erhalten innert 24h eine Offerte"
- Schweizer Qualitätsversprechen (Handwerk, Holzart-Beschreibungen)

### 5. Mobile-First
- Einspaltige Layouts für Smartphone
- Pill-Buttons und Cards touch-friendly (min. 44px Trefferbereich)
- Container-Query-basiertes Layout passt sich dem Iframe-Width an

---

## Zugänglichkeits-Anforderungen (Accessibility)

Basierend auf WCAG 2.1/2.2 AA:

### Tastaturnavigation
- [x] Alle interaktiven Elemente per Tab erreichbar
- [x] Logische Tab-Reihenfolge (von links oben nach rechts unten)
- [x] Sichtbare Fokusindikatoren (`:focus-visible` mit 2px Umriss)
- [x] Enter/Space aktiviert Buttons und Cards
- [x] Skip-Link zu Wizard-Inhalt (PhaseWizard)

### Screen-Reader-Unterstützung
- [x] Produktkarten: `role="radio"` + `aria-checked`
- [x] Schritt-Navigation: `aria-current="step"` auf aktivem Schritt
- [x] Seitennavigation: `aria-label` auf `<nav>`
- [x] Formular-Inputs: `<label>` per `htmlFor`/`id` verknüpft
- [x] Validierungs-Fehler: `role="alert"` und `aria-describedby`
- [x] Preis-Anzeige: `aria-live="polite"`
- [x] Dekorative SVGs und Emojis: `aria-hidden="true"`

### Visuelle Zugänglichkeit
- [ ] Text-Kontrast min. 4.5:1 (WCAG AA) — **zu überprüfen** für Muted-Texte auf hellen Hintergründen
- [x] Interaktive Elemente min. 44×44px auf Mobile
- [x] Farbe nicht allein als Information verwendet (Checkmark + Rahmen für Auswahl)
- [x] Text-Vergrösserung auf 200% ohne Layout-Bruch (Container-Queries)

### Bewegungsreduzierung
- [x] `prefers-reduced-motion`: Fade/Transition-Animationen deaktiviert wenn gewünscht

---

## Handoff an Design-Team

**Bereitgestellte Research-Artifacts**:
- Jobs-to-be-Done: `docs/ux/garderobe-konfigurator-jtbd.md`
- User Journey: `docs/ux/garderobe-konfigurator-journey.md`
- Flow-Spezifikation: `docs/ux/garderobe-konfigurator-flow.md` (dieses Dokument)

**Empfohlene nächste Design-Schritte**:
1. User Journey reviewen, um emotionale Zustände in jedem Schritt zu verstehen
2. Identifizierte Pain-Points (Produktwahl, Masseingabe, Kontaktvertrauen) in Figma-Designs adressieren
3. Materialfotos für Holzarten und Extras beschaffen/erstellen
4. Prototype erstellen und mit 3–5 Nutzerinnen gegen die JTBD-Erfolgskriterien testen
5. Kontrast-Werte prüfen (insbesondere `text-muted` auf hellen Hintergründen)

**Key Success Metric**: Nutzerin schließt Konfiguration in < 5 Minuten ab, ohne externe Hilfe
