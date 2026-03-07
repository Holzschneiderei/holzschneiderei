# User Journey: Garderobe-Konfigurator

---

## User Persona

- **Wer**: Hausbesitzerin Petra, 42, Zürich – renoviert ihr Eingangsfoyer
- **Ziel**: Eine massgeschneiderte Massivholz-Garderobe mit Gravur konfigurieren und bestellen
- **Kontext**: Scrollt auf ihrem Smartphone über holzschneiderei.ch, hat 10 Minuten Zeit
- **Erfolgsmass**: Konfiguration abgeschlossen und Offerte-Anfrage gesendet

---

## Journey Stages

### Stage 1: Entdeckung (Entry Point: Wix-Seite)

**Was die Nutzerin tut**: Landet auf holzschneiderei.ch via Google-Suche „Garderobe Massivholz Schweiz personalisiert"

**Was sie denkt**: „Das sieht schön aus. Haben die auch einen Konfigurator? Bin gespannt, was das kostet."

**Was sie fühlt**: 🤩 Neugierig, vorsichtig optimistisch

**Pain Points**:

- Der Konfigurator ist in einen Wix-Iframe eingebettet – erster Ladevorgang kann langsam sein
- Kein klarer Call-to-Action, wenn der Konfigurator nicht sichtbar ist (Scroll erforderlich)

**Chancen**:

- Aussagekräftige Produktbilder über dem Konfigurator erhöhen Kaufwunsch
- Sofort sichtbarer Preis (z. B. „ab CHF 349") reduziert Unsicherheit

---

### Stage 2: Produktwahl (PhaseTypen)

**Was sie tut**: Sieht die Produktauswahl – Schriftzug (mit Garderobe-Variante) und Bergmotiv (demnächst)

**Was sie denkt**: „Ich möchte eine Garderobe. Ich verstehe nicht ganz den Unterschied zwischen ‚Schriftzug' und ‚Garderobe mit Haken'. Was nehme ich?"

**Was sie fühlt**: 🤔 Leicht verwirrt, braucht Klarheit

**Pain Points**:

- Gruppenlogik Schriftzug/Garderobe ist nicht intuitiv – der Name „Schriftzug" klingt nicht wie ein funktionales Möbelstück
- Varianten-Selektor (Garderobe mit Haken vs. Nur Schriftzug) erscheint erst nach erstem Klick

**Chancen**:

- Produktkarten mit Foto statt nur Emoji und Text
- „Garderobe" prominent als eigenständige Karte hervorheben
- Tooltip: „Garderobe = Schriftzug + Haken, Hutablage und Extras"

---

### Stage 3: Holzauswahl (StepHolzart)

**Was sie tut**: Scrollt durch die 5 Holzarten (Eiche, Esche, Nussbaum, Ahorn, Arve)

**Was sie denkt**: „Eiche oder Nussbaum? Ich weiss nicht, wie die in echt aussehen. Gibt es Fotos?"

**Was sie fühlt**: 😕 Unsicher, möchte sich vorstellen können, wie es aussieht

**Pain Points**:

- Nur Emoji + kurze Beschreibung – keine Materialfotos
- Keine Information über Preiswirkung der Holzwahl

**Chancen**:

- Materialfotos oder Farbmuster neben jeder Holzart
- Preisindikator: „Nussbaum: +CHF 80 gegenüber Buche"

---

### Stage 4: Masse eingeben (StepMasse)

**Was sie tut**: Gibt Breite (60 cm), Höhe (190 cm) und Tiefe (25 cm) ein

**Was sie denkt**: „Was ist die maximale Breite? Wie tief muss eine Garderobe sein? Passt das in meinen Flur?"

**Was sie fühlt**: 😰 Etwas überfordert, befürchtet Fehler zu machen

**Pain Points**:

- Min/Max-Werte sind sichtbar, aber die UX macht nicht klar, warum es Grenzen gibt
- Kein visuelles Feedback, wie die Masse im Raum wirken (kein Massstab)
- Validation-Fehler erscheinen erst beim Verlassen des Felds (onBlur)

**Chancen**:

- Visuelle Masszeichnung im SVG-Preview aktualisiert sich in Echtzeit
- Hilfstexte: „Typischer Flur: 60–80 cm Breite"
- Inline-Validierung mit sanfter Warnung (nicht erst beim Submit)

---

### Stage 5: Ausführung wählen (StepAusfuehrung)

**Was sie tut**: Wählt Oberfläche (Natur geölt), Hakenmaterial (Edelstahl) und Hakenzahl

**Was sie denkt**: „Was ist der Unterschied zwischen ‚Natur geölt' und ‚Gewachst'? Ist Edelstahl robuster als Holzhaken?"

**Was sie fühlt**: 🤔 Braucht mehr Kontext, schaut sich um

**Pain Points**:

- Keine Beschreibung der Unterschiede zwischen Oberflächenbehandlungen
- Keine Pflegehinweise (z. B. „Natur geölt = pflegeleicht")
- Hakenzahl-Eingabe: nicht intuitiv, ob das die Total- oder Mindestanzahl ist

**Chancen**:

- Aufklappbare Erklärungen pro Oberfläche
- Vergleichstabelle Oberfläche vs. Pflegeaufwand
- Hakenmaterial-Fotos

---

### Stage 6: Extras auswählen (StepExtras)

**Was sie tut**: Sieht die Extras – Spiegel, Schuhablage, Schublade, Schlüsselleiste, Sitzbank

**Was sie denkt**: „Ein Spiegel wäre toll! Kostet das extra? Wie sieht die Schuhablage aus?"

**Was sie fühlt**: 😊 Aufgeregt, sieht viele Möglichkeiten

**Pain Points**:

- Kein Preis pro Extra sichtbar
- Keine Vorschau, wie das Extra am Produkt aussieht

**Chancen**:

- Preis-Tag pro Extra (z. B. „+ CHF 49")
- Kleines Bild oder Zeichnung des Extras im Preview

---

### Stage 7: Kontakt eingeben (StepKontakt)

**Was sie tut**: Gibt Name, E-Mail und Telefonnummer ein

**Was sie denkt**: „Warum brauchen die meine Telefonnummer? Bekomme ich jetzt Spam-Anrufe?"

**Was sie fühlt**: 😬 Misstrauisch, zögert

**Pain Points**:

- Kein Trust-Signal (z. B. „Wir rufen Sie nur an, wenn nötig")
- Telefon als Pflichtfeld würde Abbruch auslösen (ist optional – gut!)
- Keine Angabe, was nach dem Absenden passiert (Wartezeit, nächste Schritte)

**Chancen**:

- Kurze Erklärung: „Nur für die Offerte – kein Newsletter"
- Erwartungsmanagement: „Sie erhalten innert 24h eine Offerte"
- Fortschrittsanzeige: „Letzter Schritt!"

---

### Stage 8: Übersicht & Absenden (StepUebersicht)

**Was sie tut**: Liest die Zusammenfassung und sendet die Konfiguration ab

**Was sie denkt**: „Alles korrekt? Kann ich noch etwas ändern? Was ist der Endpreis?"

**Was sie fühlt**: 😌 Erleichtert, überprüft alles noch einmal

**Pain Points**:

- Keine direkte Bearbeitung aus der Übersicht (muss zurück navigieren)
- Gesamtpreis muss klar hervorgehoben sein (inkl. Extras)

**Chancen**:

- „Bearbeiten"-Link pro Konfigurationsblock
- Klarer Gesamtpreis mit Auflistung der Extras

---

### Stage 9: Abschluss (PhaseDone)

**Was sie tut**: Sieht die Bestätigungsseite

**Was sie denkt**: „Super, gesendet. Wann höre ich etwas? Kann ich die Konfiguration speichern?"

**Was sie fühlt**: 😊 Erleichtert, gespannt

**Pain Points**:

- Keine Kopie der Konfiguration per E-Mail (nur Bestätigungstext auf Seite)
- Keine Möglichkeit, Link zur Konfiguration zu teilen (z. B. mit Partner besprechen)

**Chancen**:

- Automatische E-Mail-Bestätigung mit Konfigurationsübersicht
- „Konfiguration teilen"-Link

---

## Emotionskurve

```
Stufe:     1     2     3     4     5     6     7     8     9
           Entd. Prod. Holz  Mass  Ausf. Extr. Kont. Übers. Done
Emotion:   🤩    🤔    😕    😰    🤔    😊    😬    😌    😊
           Neu.  Konf. Uns.  Über. Brat. Freud. Verf. Erleich. Freude
```

**Kritische Momente** (höchstes Abbruchrisiko):

1. **Stage 2** – Produktwahl-Verwirrung → klare Produktbeschreibungen
2. **Stage 4** – Masseingabe-Überforderung → visuelle Hilfe
3. **Stage 7** – Kontakt-Misstrauen → Trust-Signale

---

## Abbruchs-Szenarien

| Szenario | Ursache | Mitigation |
|----------|---------|------------|
| Verlässt beim Laden | Zu langsam auf Mobile | Performance-Optimierung, Skeleton-Loader |
| Verlässt bei Holzwahl | Keine Fotos, keine Entscheidungsgrundlage | Materialfotos, Preisindikator |
| Verlässt bei Massen | Unsicher über Masse, Angst vor Fehler | Hilfstexte, Richtmasse |
| Verlässt bei Kontakt | Datenschutzbedenken | Trust-Signal, optionale Felder klar markieren |
| Verlässt nach Übersicht | Preis zu hoch | Preis früher sichtbar machen (ab Stage 3) |
