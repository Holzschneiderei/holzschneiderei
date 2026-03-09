# C4-Architekturdiagramme — Holzschneiderei Konfigurator

## 1. Systemkontextdiagramm (Level 1)

:::mermaid
C4Context
    title Systemkontext — Holzschneiderei Konfigurator

    Person(customer, "Kunde", "Konfiguriert und bestellt<br/>Garderoben, Schriftzüge<br/>oder Bergmotive")
    Person(admin, "Inhaber (Admin)", "Verwaltet Produkte, Preise,<br/>Optionen, Wizard-Schritte<br/>und Showroom-Vorlagen")
    Person(workshop, "Werkstatt", "Erhält Fusion-360-Skripte<br/>und fertigt das<br/>konfigurierte Produkt")


    System_Ext(wix, "Wix-Plattform", "Hostet holzschneiderei.ch.<br/>Bietet CMS, eCommerce-Checkout,<br/>Wix Storage, iframe-Einbettung<br/>via Velo Page Code")
    System_Ext(vercel, "Vercel", "Hostet React-SPA auf<br/>holzschneiderei.vercel.app<br/>und /api/send-script Funktion")
    System_Ext(resend, "Resend", "Transaktionale E-Mail-API<br/>für Fusion-360-Python-Skript-<br/>Zustellung an Werkstatt")
    System(configurator, "Holzschneiderei Konfigurator", "React-SPA Produktkonfigurator<br/>für Garderoben, Schriftzüge, Bergmotive.<br/>Dual-Modus: Kunde + Admin")

    Rel(customer, wix, "Besucht /garderobe-konfigurieren", "HTTPS")
    Rel(admin, wix, "Besucht /konfigurator-admin", "HTTPS")
    Rel(wix, configurator, "Bettet als iframe ein,<br/>leitet Config + Checkout weiter", "postMessage")
    Rel(configurator, wix, "Sendet Bestellungen, Einstellungen,<br/>Fortschritt, Resize", "postMessage")
    Rel(configurator, vercel, "Deployed auf / ausgeliefert von", "HTTPS")
    Rel_D(configurator, resend, "Sendet Skripte via<br/>/api/send-script", "HTTPS REST")
    Rel_L(resend, workshop, "Liefert .py-Skript<br/>als E-Mail-Anhang", "SMTP")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
:::

### Beschreibung

Dieses Level-1-Diagramm zeigt den Holzschneiderei Konfigurator und seine Beziehungen zu externen Akteuren und Systemen. Drei zentrale Architekturentscheidungen stechen hervor:

1. **Eingebettete Architektur** — Der Konfigurator wird unabhängig auf Vercel deployed, aber ausschliesslich als iframe innerhalb der Wix-Website konsumiert. Das entkoppelt den Release-Zyklus des Konfigurators von der Wix-Seite und nutzt gleichzeitig Wix für CMS, Zahlungen und Hosting.

2. **Bidirektionale Bridge** — Jeglicher Datenaustausch zwischen Konfigurator und Host erfolgt über ein strukturiertes postMessage-Protokoll auf dem `"holzschneiderei"`-Kanal. Der Wix-Velo-Page-Code fungiert als Relay zwischen iframe und Wix-Plattform-APIs (CMS, eCommerce, Storage).

3. **Fire-and-Forget-Fertigung** — Die Fusion-360-Skript-Generierung und -Zustellung via Resend ist asynchron und nicht-blockierend. Fehler bei der Skript-Generierung verhindern nicht, dass der Kunde den Checkout abschliesst.

---

## 2. Container-Diagramm (Level 2)

:::mermaid
C4Container
    title Container-Diagramm — Holzschneiderei Konfigurator

    Person(customer, "Kunde", "Konfiguriert Produkte")
    Person(admin, "Inhaber", "Verwaltet Einstellungen")
    Person(workshop, "Werkstatt", "Fertigt Produkte")

    System_Boundary(hz, "Holzschneiderei Konfigurator System") {
        Container(spa, "Konfigurator SPA", "React 18, Vite, Tailwind CSS v4", "Produktkonfigurations-Wizard mit<br/>Kunden-Workflow + Admin-Modus.<br/>Läuft im Browser als iframe.")
        Container(api, "Send-Script API", "Vercel Serverless, Node.js", "Empfängt Fusion-360-Skripte<br/>und sendet sie per E-Mail<br/>an die Werkstatt via Resend")
    }

    System_Boundary(wixplat, "Wix-Plattform") {
        Container(veloCustomer, "Kunden-Page-Code", "Wix Velo (JavaScript)", "Bettet iframe ein auf<br/>/garderobe-konfigurieren.<br/>Config laden, Bestellung senden,<br/>Checkout, Fortschritt speichern")
        Container(veloAdmin, "Admin-Page-Code", "Wix Velo (JavaScript)", "Bettet iframe ein auf<br/>/konfigurator-admin.<br/>Config laden/speichern ins CMS<br/>mit Upsert-Muster")
        ContainerDb(cms, "Wix CMS", "Wix Data Collections", "KonfiguratorAdmin-Collection<br/>(Admin-Config) und<br/>Konfigurationen-Collection<br/>(Kundenbestellungen)")
        Container(ecom, "Wix eCommerce", "Wix eCommerce API", "Erstellt Checkout-Sessions<br/>mit benutzerdefinierten Positionen<br/>für konfigurierte Produkte")
        ContainerDb(storage, "Wix Storage", "wix-storage-frontend", "Speichert Kunden-Entwurf<br/>über Seitenneuladen hinweg")
    }

    System_Ext(resend, "Resend", "E-Mail-API")

    Rel(customer, veloCustomer, "Besucht Seite", "HTTPS")
    Rel(admin, veloAdmin, "Besucht Admin-Seite", "HTTPS")
    Rel(veloCustomer, spa, "config-load, progress-loaded,<br/>config-saved, checkout-ready", "postMessage")
    Rel(veloAdmin, spa, "config-load, set-mode", "postMessage")
    Rel(spa, veloCustomer, "ready, submit-config,<br/>request-checkout,<br/>save-progress, resize", "postMessage")
    Rel(spa, veloAdmin, "ready, config-save<br/>(entprellt 800ms)", "postMessage")
    Rel(veloCustomer, cms, "Liest Config,<br/>schreibt Bestellungen", "wixData API")
    Rel(veloCustomer, ecom, "Erstellt Checkout-Sessions", "eCommerce API")
    Rel(veloCustomer, storage, "Liest/schreibt Entwurf", "wix-storage")
    Rel(veloAdmin, cms, "Liest/schreibt Config<br/>(Upsert-Muster)", "wixData API")
    Rel(spa, api, "POSTet Fusion-360-<br/>Skript-Payload", "HTTPS REST")
    Rel(api, resend, "Sendet E-Mail mit<br/>.py-Anhang", "Resend SDK")
    Rel(resend, workshop, "Liefert Skript<br/>per E-Mail", "SMTP")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
:::

### Beschreibung

Dieses Level-2-Diagramm zerlegt das System in deploybare Container. Die zentrale Aufteilung besteht zwischen der **React-SPA** (rein clientseitig, kein Server-State) und dem **Wix-Velo-Page-Code** (server-nah, läuft im Wix-Seitenkontext).

Wichtige Beobachtungen:

- Die SPA hat **keinerlei direkten Zugriff** auf Datenbanken oder Backends. Jegliche Persistenz läuft über die Wix-Velo-Bridge via postMessage. Das macht die SPA zustandslos und vollständig cachebar auf dem Vercel-CDN.
- Es gibt **zwei getrennte Velo-Page-Code-Instanzen** — eine für die Kundenseite und eine für die Admin-Seite. Sie teilen dasselbe postMessage-Protokoll, behandeln aber unterschiedliche Nachrichtentypen (Kundenseite ignoriert `config-save`; Admin-Seite ignoriert `submit-config`, `request-checkout` und Fortschritts-Nachrichten).
- Die `/api/send-script` Serverless-Funktion ist die einzige serverseitige Komponente des Konfigurators. Sie ist ein dünner Proxy, der das generierte Python-Skript an Resend zur E-Mail-Zustellung weiterleitet.

---

## 3. Komponentendiagramm (Level 3) — React-SPA

:::mermaid
C4Component
    title Komponentendiagramm — React-SPA (Konfigurator)

    Container_Boundary(spa, "Konfigurator SPA") {

        Component(konfig, "Konfigurator", "React-Komponente (597 LOC)", "Root-Komponente. Besitzt ALLEN State:<br/>form, phase, mode, pricing,<br/>constraints, products, step order,<br/>toggle sets, option lists.<br/>Verdrahtet Bridge + Auto-Save.")
        Component(bridge, "Bridge-Modul", "ES-Modul (bridge.js)", "Wix-iframe-Kommunikation.<br/>send(), listen(), autoResize(),<br/>saveProgress(), submitConfig(),<br/>requestCheckout().<br/>Fallback auf localStorage.")
        Component(wizCtx, "WizardContext", "React Context + Provider", "Verteilt Read-only-State<br/>(form, errors, limits, pricing,<br/>aktive Optionen, Produkte)<br/>via useWizard()-Hook.")

        Component(phaseTypen, "PhaseTypen", "React-Komponente", "Produktauswahlbildschirm.<br/>Gruppierte Produktkarten mit<br/>optionaler Showroom-Galerie.")
        Component(phaseWizard, "PhaseWizard", "React-Komponente", "Mehrstufige Wizard-Shell.<br/>SideRail-Navigation, Schrittinhalt,<br/>Zurück/Weiter/Absenden-Buttons.")
        Component(phaseDone, "PhaseDone", "React-Komponente", "Bestellbestätigungsbildschirm<br/>mit Erfolgsmeldung<br/>und Neustart-Option.")

        Component(steps, "Wizard-Schritte", "8 React-Komponenten", "StepMotiv, StepHolzart,<br/>StepMasse, StepAusfuehrung,<br/>StepExtras, StepDarstellung,<br/>StepKontakt, StepUebersicht.<br/>Jeder validiert eigene Felder.")

        Component(adminUI, "Admin-Oberfläche", "20 React-Komponenten", "AdminLayout, AdminWithPreview,<br/>AdminProducts, AdminOptions,<br/>AdminPricing, AdminSteps,<br/>AdminDimensions, AdminShowroom,<br/>AdminFusion, AdminImportExport.")

        Component(uiLib, "UI-Bausteine", "16 React-Komponenten", "Shell, Fade, SelectionCard,<br/>PhoneFrame, SideRail, StepHeader,<br/>SummaryRow, SelectField, TextField,<br/>ToggleSwitch, CheckBadge,<br/>ImageCarousel, CollapsibleSection")

        Component(dataLayer, "Datenschicht", "ES-Module (src/data/)", "constants.js, products.js,<br/>optionLists.js, pricing.js,<br/>showroom.js — Standardwerte,<br/>Produktdefinitionen, Preislogik")

        Component(hooks, "Custom Hooks", "3 React Hooks", "useToggleSet (Min-1-Constraint),<br/>useOptionList (CRUD für Arrays),<br/>useConfigManager (Export/Import)")

        Component(fusionLib, "Fusion-360-Generator", "ES-Module (src/lib/)", "fusion-script-generator.js,<br/>font-outline-extractor.js,<br/>svg-path-converter.js,<br/>fusion-templates/ (6 Module)")

        Component(validate, "Config-Validator", "ES-Modul", "14-Regel-Validierungsschema.<br/>Validiert bei Import und<br/>zur Build-Zeit.")
    }

    Container_Ext(veloPage, "Wix Velo Page Code", "postMessage-Relay")
    Container_Ext(sendApi, "Send-Script API", "Vercel Serverless")

    Rel(konfig, bridge, "send(), listen(), autoResize()<br/>beim Mount; submitConfig()<br/>bei Bestellabgabe")
    Rel(konfig, wizCtx, "Erstellt WizardProvider<br/>mit memoisiertem Context-Wert")
    Rel(konfig, phaseTypen, "Rendert bei phase=typen")
    Rel(konfig, phaseWizard, "Rendert bei phase=wizard")
    Rel(konfig, phaseDone, "Rendert bei phase=done")
    Rel(konfig, adminUI, "Rendert bei mode=admin")
    Rel(konfig, hooks, "useToggleSet x3,<br/>useOptionList x4,<br/>useConfigManager")
    Rel(konfig, dataLayer, "Importiert Standardwerte,<br/>Konstanten, Preislogik, Produktdefs")
    Rel(konfig, fusionLib, "generateAndSendScript()<br/>bei Bestellbestätigung")

    Rel(wizCtx, steps, "useWizard(): form, set(),<br/>errors, limits, options")
    Rel(wizCtx, phaseTypen, "useWizard(): products,<br/>texts, showroom")
    Rel(phaseWizard, steps, "Rendert aktiven Schritt<br/>nach currentStepId")
    Rel(steps, uiLib, "SelectionCard, StepHeader,<br/>TextField, SummaryRow, etc.")
    Rel(adminUI, uiLib, "Shell, PhoneFrame,<br/>ToggleSwitch, etc.")
    Rel(hooks, validate, "validateConfigShape()<br/>beim Import")
    Rel(fusionLib, dataLayer, "Liest Berge-Defs,<br/>computePrice(), hooksFor()")

    Rel(bridge, veloPage, "postMessage auf<br/>'holzschneiderei'-Kanal", "window.postMessage")
    Rel(fusionLib, sendApi, "POST /api/send-script<br/>mit generiertem Skript", "fetch() HTTPS")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
:::

### Beschreibung

Dieses Level-3-Diagramm zeigt die internen Komponenten der React-SPA. Die Architektur folgt einem **zentralisierter State, verteiltes Rendering**-Muster:

- **Konfigurator** ist eine "God Component", die allen veränderbaren State besitzt (597 Zeilen). Das ist ein bewusster Trade-off: State-Übergänge bleiben vorhersagbar und verteilte State-Bugs werden vermieden, aber die Komplexität konzentriert sich in einer Datei.
- **WizardContext** entkoppelt State-Besitz von State-Konsum. Step-Komponenten erhalten nie Props direkt vom Konfigurator — sie lesen ausschliesslich über Context via `useWizard()`.
- Die **Datenschicht** liefert Standardwerte und reine Berechnungsfunktionen (Preise, Limits, Hakenzahl). Sie hat keine Seiteneffekte und keine React-Abhängigkeiten und ist isoliert testbar.
- Der **Fusion-360-Generator** ist eine eigenständige Pipeline, die Formulardaten über sechs Template-Module in ein vollständiges Python-Skript transformiert. Er nutzt opentype.js für Schriftkonturen und einen eigenen SVG-zu-CAM-Konverter für Berggravuren.

---

## 4. Komponentendiagramm (Level 3) — Wix-Integration

:::mermaid
C4Component
    title Komponentendiagramm — Wix-Velo-Integrationsschicht

    Container_Boundary(wix, "Wix-Plattform (holzschneiderei.ch)") {

        Component(custPage, "Kunden-Page-Code", "Wix Velo JavaScript", "Läuft auf /garderobe-konfigurieren.<br/>Empfängt: ready, submit-config,<br/>request-checkout, save/load/clear-progress.<br/>Antwortet: config-load, config-saved,<br/>checkout-ready, progress-loaded.")
        Component(adminPage, "Admin-Page-Code", "Wix Velo JavaScript", "Läuft auf /konfigurator-admin.<br/>Empfängt: ready, config-save,<br/>save-settings.<br/>Antwortet: config-load, set-mode,<br/>settings-saved. Cached adminRow.")

        ComponentDb(configColl, "KonfiguratorAdmin", "Wix-CMS-Collection", "Einzeiler-Collection.<br/>Vollständiger Admin-Config-JSON-Blob.<br/>Felder: config (Text),<br/>updatedAt (Datum)")
        ComponentDb(ordersColl, "Konfigurationen", "Wix-CMS-Collection", "Eine Zeile pro Kundenbestellung.<br/>Felder: sessionId, holzart,<br/>breite, hoehe, tiefe, haken,<br/>extras, berg, typ, preis,<br/>vorname, nachname, email, status")

        Component(ecomApi, "Wix eCommerce API", "Wix-Plattform-API", "Erstellt Checkout-Sessions<br/>mit benutzerdef. Positionen.<br/>Gibt checkoutUrl zurück.<br/>(Derzeit Stub)")
        Component(wixStorage, "Wix Storage Frontend", "wix-storage-frontend", "Speichert Wizard-Entwurf<br/>(form, phase, wizardIndex)<br/>unter 'holzschneiderei_progress'.<br/>Überlebt Seitenneuladen.")
    }

    Container_Ext(spa, "Konfigurator SPA", "React-iframe")

    Rel(spa, custPage, "ready, submit-config,<br/>request-checkout,<br/>save/load-progress, resize", "postMessage")
    Rel(custPage, spa, "config-load, config-saved,<br/>checkout-ready/error,<br/>progress-loaded", "postMessage")
    Rel(spa, adminPage, "ready, config-save<br/>(entprellt 800ms),<br/>save-settings", "postMessage")
    Rel(adminPage, spa, "config-load, set-mode,<br/>settings-saved", "postMessage")

    Rel(custPage, configColl, "Liest Config bei 'ready'", "wixData.query()")
    Rel(custPage, ordersColl, "Fügt Bestellung ein<br/>bei 'submit-config'", "wixData.insert()")
    Rel(custPage, ecomApi, "Erstellt Checkout<br/>bei 'request-checkout'", "createCheckout()")
    Rel(custPage, wixStorage, "Liest/schreibt Entwurf", "getItem/setItem()")
    Rel(adminPage, configColl, "Liest bei 'ready',<br/>Upsert bei 'config-save'", "wixData API")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
:::

### Beschreibung

Dieses Level-3-Diagramm zeigt die Wix-seitige Integrationsschicht im Detail. Zwei unabhängige Velo-Page-Code-Instanzen fungieren als Brücken zwischen dem iframe und den Wix-Plattform-APIs.

Wichtige Details:

- Die **KonfiguratorAdmin**-Collection nutzt ein Einzeiler-Muster — es gibt genau ein Config-Dokument, das bei jedem Admin-Speichern per Upsert aktualisiert wird. Der Admin-Page-Code cached die Zeilenreferenz (`adminRow`), um bei jedem Speichern eine Abfrage zu vermeiden.
- Die **Konfigurationen**-Collection sammelt eine Zeile pro Kundenbestellung. Die Bestellung startet mit `status: 'draft'` und würde auf `'pending'` aktualisiert, sobald eCommerce vollständig verdrahtet ist.
- Die **Wix-eCommerce**-Integration ist derzeit ein Stub — der Page-Code enthält die vollständige Implementierung auskommentiert, mit einem `#order-confirmed`-Fallback, der den Kundenfluss trotzdem abschliessen lässt.
- Die **Fortschritts-Persistenz** nutzt `wix-storage-frontend` (das auf dem Wix-Domain auf Browser-localStorage abbildet), nicht das Wix-CMS. Das hält Entwurfs-Speicherungen schnell und vermeidet CMS-Schreibkontingente.

---

## 5. Dynamisches Diagramm — Kundenbestellablauf

:::mermaid
C4Dynamic
    title Kundenbestellablauf

    Person(customer, "Kunde")
    Container(browser, "Browser", "")
    Container(wixPage, "Wix-Kundenseite", "Velo")
    Container(spa, "Konfigurator SPA", "React")
    ContainerDb(cms, "Wix CMS", "")
    Container(ecom, "Wix eCommerce", "")
    ContainerDb(storage, "Wix Storage", "")
    Container(api, "Send-Script API", "Vercel")
    System_Ext(resend, "Resend", "")
    Person(workshop, "Werkstatt")

    Rel(customer, browser, "1. Öffnet /garderobe-konfigurieren")
    Rel(browser, wixPage, "2. Lädt Wix-Seite<br/>mit eingebettetem iframe")
    Rel(wixPage, spa, "3. iframe lädt SPA<br/>von Vercel-CDN")
    Rel(spa, wixPage, "4. send('ready')")
    Rel(wixPage, cms, "5. Abfrage KonfiguratorAdmin")
    Rel(wixPage, storage, "6. Gespeicherten Fortschritt lesen")
    Rel(wixPage, spa, "7. config-load +<br/>progress-loaded")
    Rel(customer, spa, "8. Produkt wählen")
    Rel(customer, spa, "9. Wizard-Schritte ausfüllen")
    Rel(spa, wixPage, "10. save-progress<br/>(entprellt 500ms)")
    Rel(wixPage, storage, "11. Entwurf speichern")
    Rel(customer, spa, "12. Bestellung absenden")
    Rel(spa, wixPage, "13. submitConfig()")
    Rel(wixPage, cms, "14. Einfügen in<br/>Konfigurationen")
    Rel(wixPage, spa, "15. config-saved<br/>mit configId")
    Rel(spa, wixPage, "16. requestCheckout()")
    Rel(wixPage, ecom, "17. Checkout-Session erstellen")
    Rel(wixPage, spa, "18. checkout-ready<br/>mit checkoutUrl")
    Rel(spa, api, "19. POST /api/send-script<br/>(parallel, falls aktiviert)")
    Rel(api, resend, "20. E-Mail senden<br/>mit .py-Anhang")
    Rel(resend, workshop, "21. Skript zustellen")
    Rel(browser, ecom, "22. Weiterleitung zum Checkout")
:::

### Beschreibung

Diese Sequenz zeigt den vollständigen Kundenweg vom Seitenaufruf bis zur Checkout-Weiterleitung und Werkstatt-Benachrichtigung. Der Ablauf hat drei bemerkenswerte Eigenschaften:

1. **Doppelte Initialisierung** — Bei `ready` lädt der Wix-Page-Code sowohl die Admin-Config (aus dem CMS) als auch den gespeicherten Kundenfortschritt (aus Wix Storage) parallel und liefert beides an die SPA. Das ermöglicht Sitzungswiederaufnahme über Seitenneuladen hinweg.

2. **Zweiphasige Bestellübermittlung** — Die Bestellung wird zuerst ins CMS gespeichert (Schritt 13–15), dann wird die Checkout-Session erstellt (Schritt 16–18). Das stellt sicher, dass der Bestelldatensatz im CMS existiert, auch wenn die Checkout-Erstellung fehlschlägt — kein Datenverlust.

3. **Nicht-blockierende Fertigung** — Die Fusion-360-Skript-Generierung (Schritt 19–21) läuft parallel zur Checkout-Weiterleitung. Sie ist Fire-and-Forget: Fehler werden abgefangen und geloggt, aber nie dem Kunden angezeigt. Der `generateAndSendScript()`-Aufruf nutzt `.catch()`, um Fehler still zu schlucken.

---

## 6. Dynamisches Diagramm — Admin-Konfigurationsablauf

:::mermaid
C4Dynamic
    title Admin-Konfigurationsablauf

    Person(admin, "Inhaber (Admin)")
    Container(browser, "Browser", "")
    Container(wixAdmin, "Wix-Admin-Seite", "Velo")
    Container(spa, "Konfigurator SPA", "React, mode=admin")
    ContainerDb(cms, "Wix CMS", "KonfiguratorAdmin")

    Rel(admin, browser, "1. Öffnet /konfigurator-admin")
    Rel(browser, wixAdmin, "2. Lädt Wix-Seite<br/>mit Admin-iframe")
    Rel(wixAdmin, spa, "3. iframe lädt SPA<br/>von Vercel-CDN")
    Rel(spa, wixAdmin, "4. send('ready')")
    Rel(wixAdmin, cms, "5. Abfrage KonfiguratorAdmin")
    Rel(wixAdmin, spa, "6. config-load<br/>mit vollst. Config-Blob")
    Rel(wixAdmin, spa, "7. set-mode: admin")
    Rel(spa, spa, "8. applyConfig() stellt<br/>gesamten State wieder her")
    Rel(admin, spa, "9. Einstellungen ändern<br/>(Split-Screen + Vorschau)")
    Rel(spa, spa, "10. Auto-Save useEffect<br/>(entprellt 800ms)")
    Rel(spa, wixAdmin, "11. config-save<br/>mit vollst. Config-Blob")
    Rel(wixAdmin, cms, "12. Upsert Zeile in<br/>KonfiguratorAdmin")
    Rel(spa, spa, "13. SaveStatus:<br/>idle→saving→saved→idle")
    Rel(admin, spa, "14. [optional] Config<br/>als JSON exportieren")
    Rel(admin, spa, "15. [optional] JSON importieren<br/>(validiert durch configShape)")
:::

### Beschreibung

Diese Sequenz zeigt den Admin-Konfigurationsworkflow. Die Admin-Oberfläche nutzt ein Split-Screen-Layout (AdminWithPreview), bei dem das linke Panel die Admin-Steuerungen und das rechte Panel eine Live-Kundenvorschau in einer PhoneFrame-Komponente zeigt.

Wichtige Designentscheidungen:

1. **Vollblob-Persistenz** — Jedes Speichern sendet das gesamte Konfigurationsobjekt an Wix-CMS, nicht einzelne Felder. Das vereinfacht das Protokoll (ein Nachrichtentyp) und vermeidet partielle-Update-Race-Conditions, auf Kosten geringfügig grösserer Payloads.

2. **Entprelltes Auto-Save** — Der Admin klickt nie manuell auf «Speichern». Jede State-Änderung löst nach 800ms Inaktivität ein entprelltes Speichern aus. Das `useEffect`-Dependency-Array enthält allen admin-editierbaren State, sodass keine Änderungen verloren gehen.

3. **Upsert-Muster** — Der Admin-Page-Code cached die CMS-Zeilenreferenz (`adminRow`) vom initialen Laden. Beim Speichern wird die bestehende Zeile aktualisiert oder eine neue eingefügt, falls keine existiert. Das macht das System selbstinitialisierend: Der erste Admin-Besuch erstellt die Config-Zeile automatisch.

---

## 7. Komponenteninteraktionskarte — State-Fluss

:::mermaid
flowchart TB
    subgraph "Einstieg & Routing"
        main["main.jsx"] --> konfig["Konfigurator (GarderobeWizard)"]
        konfig -->|"mode=workflow"| workflow["Kunden-Workflow"]
        konfig -->|"mode=admin"| adminMode["Admin-Oberfläche"]
    end

    subgraph "Kunden-Workflow-Phasen"
        workflow -->|"phase=typen"| phTypen["PhaseTypen"]
        workflow -->|"phase=wizard"| phWizard["PhaseWizard"]
        workflow -->|"phase=done"| phDone["PhaseDone"]
    end

    subgraph "Wizard-Schritte (gerendert von PhaseWizard)"
        phWizard --> motiv["StepMotiv"]
        phWizard --> holzart["StepHolzart"]
        phWizard --> masse["StepMasse"]
        phWizard --> ausf["StepAusfuehrung"]
        phWizard --> extras["StepExtras"]
        phWizard --> darst["StepDarstellung"]
        phWizard --> kontakt["StepKontakt"]
        phWizard --> ueber["StepUebersicht"]
    end

    subgraph "State-Verteilung"
        konfig -->|"erstellt"| provider["WizardProvider"]
        provider -->|"useWizard()"| motiv
        provider -->|"useWizard()"| holzart
        provider -->|"useWizard()"| masse
        provider -->|"useWizard()"| ausf
        provider -->|"useWizard()"| extras
        provider -->|"useWizard()"| darst
        provider -->|"useWizard()"| kontakt
        provider -->|"useWizard()"| ueber
        provider -->|"useWizard()"| phTypen
    end

    subgraph "Admin Split-Screen"
        adminMode --> adminHeader["AdminHeader (Speicherstatus)"]
        adminMode --> adminPreview["AdminWithPreview"]
        adminPreview -->|"linkes Panel"| adminLayout["AdminLayout (Sidebar + Bereiche)"]
        adminPreview -->|"rechtes Panel"| phoneFrame["PhoneFrame (Live-Vorschau)"]
        phoneFrame --> provider
    end

    subgraph "Daten & Hooks"
        konfig -->|"importiert"| constants["constants.js"]
        konfig -->|"importiert"| products["products.js"]
        konfig -->|"importiert"| pricing["pricing.js"]
        konfig -->|"importiert"| optLists["optionLists.js"]
        konfig -->|"importiert"| showroomData["showroom.js"]
        konfig -->|"nutzt"| toggleSet["useToggleSet x3"]
        konfig -->|"nutzt"| optList["useOptionList x4"]
        konfig -->|"nutzt"| configMgr["useConfigManager"]
    end

    subgraph "Bridge & Extern"
        konfig -->|"mount: listen()"| bridge["bridge.js"]
        konfig -->|"submit: submitConfig()"| bridge
        bridge <-->|"postMessage"| wix["Wix Velo Page Code"]
        konfig -->|"Fusion-Versand"| fusionGen["fusion-script-generator.js"]
        fusionGen -->|"fetch POST"| sendApi["/api/send-script"]
    end

    style konfig fill:#1a4d3a,color:#fff
    style provider fill:#2d6a4f,color:#fff
    style bridge fill:#40916c,color:#fff
    style wix fill:#6c757d,color:#fff
:::

### Beschreibung

Dieses ergänzende Flussdiagramm zeigt den Datenfluss durch die Anwendung zur Laufzeit. Es ist kein formales C4-Diagramm, ergänzt aber die Komponentendiagramme durch Visualisierung der tatsächlichen Import-/Render-/Context-Beziehungen.

Die zentrale Erkenntnis ist die **Sanduhrform** der Architektur: Aller State konvergiert im Konfigurator (die schmale Taille), der ihn dann über WizardContext nach aussen an alle Rendering-Komponenten verteilt. Das Bridge-Modul ist die einzige Komponente mit externen Seiteneffekten (postMessage, fetch). Das macht die Rendering-Schicht rein deklarativ und die Seiteneffekt-Grenze explizit.

---

## Anhang: Nachrichtenprotokoll-Referenz

Vollständiges postMessage-Protokoll zwischen SPA und Wix Velo:

| Richtung | Nachrichtentyp | Payload | Zweck |
|----------|---------------|---------|-------|
| SPA → Wix | `ready` | — | App initialisiert, Config + Fortschritt anfordern |
| SPA → Wix | `resize` | `{ height }` | iframe-Inhaltshöhe geändert |
| SPA → Wix | `step-change` | `{ step, index, total }` | Benutzer hat Wizard-Schritt gewechselt |
| SPA → Wix | `order-submit` | `{ order }` | Kunde hat Bestellung abgeschickt (informativ) |
| SPA → Wix | `submit-config` | `{ config, sessionId }` | Bestellung ins CMS speichern |
| SPA → Wix | `request-checkout` | `{ configId, price, summary }` | eCommerce-Checkout erstellen |
| SPA → Wix | `config-save` | `{ config }` | Admin-Auto-Save (entprellt 800ms) |
| SPA → Wix | `save-progress` | `{ state }` | Kundenentwurf speichern |
| SPA → Wix | `load-progress` | — | Gespeicherten Entwurf anfordern |
| SPA → Wix | `clear-progress` | — | Gespeicherten Entwurf löschen |
| SPA → Wix | `save-settings` | `{ pricing, constraints }` | Legacy-Admin-Speicherung |
| Wix → SPA | `config-load` | `{ config }` | Vollständiger Admin-Config-Blob |
| Wix → SPA | `set-mode` | `{ mode }` | Wechsel zu Admin/Workflow |
| Wix → SPA | `set-background` | `{ color }` | iframe-Hintergrund ändern |
| Wix → SPA | `progress-loaded` | `{ state }` | Wiederhergestellter Kundenentwurf |
| Wix → SPA | `settings-saved` | — | Legacy-Speicherbestätigung |
| Wix → SPA | `config-saved` | `{ success, configId, error }` | Bestellung im CMS gespeichert |
| Wix → SPA | `checkout-ready` | `{ checkoutUrl }` | Checkout-URL für Weiterleitung |
| Wix → SPA | `checkout-error` | `{ error }` | Checkout-Erstellung fehlgeschlagen |
