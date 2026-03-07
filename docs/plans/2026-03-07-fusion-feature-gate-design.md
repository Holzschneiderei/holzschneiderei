# Fusion 360 Feature Gate Design

## Problem

The `feat/fusion` branch adds Fusion 360 script generation at checkout, emailing scripts to the workshop via a Vercel serverless function. The API requires `RESEND_API_KEY` and `WORKSHOP_EMAIL` env vars. Without these, the feature silently fails. There's no way to verify the setup works or to disable the feature from the admin UI.

## Solution

Add a "Werkstatt" admin group with a "Fusion 360" section that lets the admin verify the backend connection and toggle the feature on/off. Only generate and send scripts when the feature is explicitly enabled.

## API Layer

### `GET /api/fusion-status`

Checks if required env vars are present. Returns:

```json
{ "configured": true, "workshopEmail": "w***@holzschneiderei.ch" }
```

or:

```json
{ "configured": false, "missing": ["RESEND_API_KEY", "WORKSHOP_EMAIL"] }
```

Email is masked (first char + `***` + domain).

### `POST /api/fusion-test`

Sends a test email to `WORKSHOP_EMAIL` using Resend. Returns:

```json
{ "success": true }
```

or:

```json
{ "success": false, "error": "..." }
```

Both endpoints added to `vercel.json` with `maxDuration: 10`.

## Admin UI

### Navigation

New nav group in `AdminLayout.jsx`:

```js
{ label: 'Werkstatt', sections: [{ id: 'fusion', label: 'Fusion 360' }] }
```

Placed between "Regeln & Preise" and "System".

### `AdminFusion.jsx`

- Status indicator: green dot + "Verbunden" or red dot + "Nicht konfiguriert"
- Masked workshop email when configured
- List of missing env vars when not configured
- "Testmail senden" button (only when status is green), with inline success/error feedback
- Enable/disable toggle: "Fusion 360 Script bei Bestellung generieren". Only activatable when status is green

Status fetched on section mount via `fetch('/api/fusion-status')`.

## Config & Integration

### Persistence

- `fusionEnabled: false` added to config shape in `useConfigManager.js`
- Included in `getConfig()` and `applyConfig()` with validation
- Auto-saved to Wix parent like all other admin settings

### Konfigurator.jsx

- New `fusionEnabled` state (default `false`)
- `generateAndSendScript` call (line 259) only runs when `fusionEnabled === true`
- `fusionEnabled` wired into `useConfigManager` for persistence

### Admin-only notice

- `StepUebersicht` shows "Fusion 360 Script: deaktiviert" when in admin mode and `fusionEnabled === false`
