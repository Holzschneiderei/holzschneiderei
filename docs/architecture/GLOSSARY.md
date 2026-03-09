# Glossar — Holzschneiderei Konfigurator

## Fachbegriffe (Domäne)

| Begriff | Beschreibung |
|---------|-------------|
| **Garderobe** | Garderoben-Produkt aus Holz — das Hauptprodukt des Konfigurators. Besteht aus Brett, Haken, optionalem Regal und optionaler Gravur. |
| **Schriftzug** | Textgravur-Produkt. Individueller Text wird mit wählbarer Schriftart in Holz graviert. |
| **Bergmotiv** | Berggravur-Produkt. Eine Bergsilhouette (z.B. Matterhorn, Eiger) wird in das Holzbrett graviert. |
| **Holzart** | Holzsorte (z.B. Eiche, Nussbaum, Arve). Beeinflusst Preis und verfügbare Oberflächen. |
| **Oberfläche** | Oberflächenbehandlung des Holzes (z.B. geölt, lackiert, natur). |
| **Ausfuehrung** | Ausführungsvariante — bestimmt Details wie Hakentyp, Regalform etc. |
| **Haken** | Aufhängehaken an der Garderobe. Anzahl und Typ sind konfigurierbar. |
| **Extras** | Zusatzoptionen wie Regal, Hutablage oder spezielle Befestigungen. |
| **Showroom** | Vorkonfigurierte Produktvorlagen, die der Admin als Inspirationsgalerie für Kunden bereitstellt. |
| **Werkstatt** | Die Schreinerwerkstatt, die das konfigurierte Produkt herstellt. Erhält Fusion-360-Skripte per E-Mail. |

## Technische Begriffe

| Begriff | Beschreibung |
|---------|-------------|
| **SPA** | Single Page Application — die React-Anwendung läuft komplett im Browser ohne serverseitige Navigation. |
| **Bridge / Bridge-Modul** | Kommunikationsschicht (`bridge.js`) zwischen Konfigurator-iframe und Wix-Elternseite. Nutzt `window.postMessage` auf dem `"holzschneiderei"`-Kanal. |
| **postMessage** | Browser-API für sichere Kommunikation zwischen iframe und Elternfenster. Alle Daten zwischen SPA und Wix fliessen über diesen Kanal. |
| **Velo Page Code** | JavaScript-Code, der auf Wix-Seiten läuft (Wix Velo). Fungiert als Relay zwischen iframe-postMessage und Wix-Plattform-APIs. |
| **WizardContext** | React Context, der den gesamten Wizard-State (Formular, Fehler, Limits, Preise, Optionen) an alle Kind-Komponenten via `useWizard()`-Hook verteilt. |
| **God Component** | Architekturmuster, bei dem eine Komponente (hier: Konfigurator) allen veränderbaren State zentral besitzt. Bewusster Trade-off für Vorhersagbarkeit. |
| **Sanduhr-Architektur** | Das Architekturmuster dieser App: State konvergiert im Konfigurator (schmale Taille) und wird über Context nach aussen verteilt. |
| **Phase** | Navigations-Stufe im Kundenfluss: `typen` (Produktwahl), `wizard` (Schrittweise Konfiguration), `done` (Bestätigung). |
| **Step / Wizard-Schritt** | Einzelner Konfigurationsschritt innerhalb der Wizard-Phase (z.B. StepHolzart, StepMasse). |
| **Toggle Set** | Admin-Feature: Objekt `{ key: boolean }` zum Ein-/Ausschalten von Optionen (z.B. welche Holzarten verfügbar sind). Min-1-Constraint verhindert leere Sets. |
| **Option List** | Admin-verwaltete Liste von Auswahlmöglichkeiten (z.B. Holzarten, Oberflächen, Extras). CRUD-Operationen via `useOptionList`-Hook. |
| **Config-Blob** | Das vollständige Admin-Konfigurationsobjekt als JSON. Wird bei jedem Speichern komplett an Wix-CMS gesendet (Vollblob-Persistenz). |
| **Upsert-Muster** | Speicherstrategie: Bestehende CMS-Zeile aktualisieren oder neue einfügen, falls keine existiert. Macht das System selbstinitialisierend. |
| **Entprelltes Auto-Save** | Automatisches Speichern nach 800ms Inaktivität (Admin) bzw. 500ms (Kundenfortschritt). Verhindert übermässige API-Aufrufe. |
| **Fire-and-Forget** | Muster für die Fusion-360-Skript-Zustellung: Fehler werden geloggt aber nicht dem Kunden angezeigt. Blockiert den Checkout nicht. |
| **Fusion-360-Generator** | Pipeline aus 6 Template-Modulen, die Konfigurationsdaten in ein Python-Skript für Autodesk Fusion 360 transformiert. Nutzt opentype.js und SVG-zu-CAM-Konvertierung. |
| **Config-Validator** | 14-Regel-Validierungsschema (`validateConfig.js`). Prüft Config-Shape bei Import und zur Build-Zeit. |
| **PhoneFrame** | UI-Komponente, die eine Handy-Rahmen-Vorschau im Admin-Split-Screen rendert — zeigt dem Admin, wie der Kunde den Konfigurator sieht. |
| **SideRail** | Seitliche Navigationsleiste im Wizard, zeigt alle Schritte und den aktuellen Fortschritt an. |
| **CDN** | Content Delivery Network — Vercel liefert die SPA-Assets über ein globales CDN aus. |

## Wix-spezifische Begriffe

| Begriff | Beschreibung |
|---------|-------------|
| **Wix CMS / Data Collections** | Wix-eigene Datenbank. Zwei Collections: `KonfiguratorAdmin` (Einzeiler für Admin-Config) und `Konfigurationen` (eine Zeile pro Bestellung). |
| **wixData API** | Wix-JavaScript-API für CMS-Zugriff (`query()`, `insert()`, `update()`). |
| **Wix Storage Frontend** | `wix-storage-frontend` — Wix-Wrapper um Browser-localStorage auf der Wix-Domain. Speichert Kunden-Wizard-Entwürfe. |
| **Wix eCommerce API** | Wix-Plattform-API für Checkout-Session-Erstellung. Derzeit Stub mit `#order-confirmed`-Fallback. |
| **Einzeiler-Collection** | Muster der KonfiguratorAdmin-Collection: Genau eine Zeile enthält den gesamten Config-Blob. Upsert statt Insert/Update-Logik. |
