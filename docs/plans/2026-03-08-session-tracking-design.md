# Session Tracking Design

## Problem

Admins have no visibility into how users navigate the wizard. They can't see where users drop off, what validation errors are common, or whether the step order causes confusion. Without this data, wizard improvements are guesswork.

## Solution

Client-side event collection with batch flush to Vercel KV (Redis). Admin UI in the Werkstatt group shows a funnel summary, top error fields, and a browsable session list with expandable event timelines. Tracking is off by default, enabled via admin toggle.

## Event Model

### Events (collected per session)

```js
{
  sessionId: "abc-123",       // crypto.randomUUID(), existing
  timestamp: 1709900000000,   // Date.now()
  type: "step-enter" | "step-leave" | "validation-fail" | "field-change" | "field-error" | "nav-back" | "session-start" | "session-end",
  step: "holzart",            // current step ID
  field: "breite",            // optional, for field-level events
  value: "60",                // optional, non-PII config fields only
  error: "Wert muss...",      // optional, for validation errors
  duration: 12500,            // optional, ms on step (on step-leave)
}
```

**PII exclusion:** Fields `vorname`, `nachname`, `email`, `telefon`, `strasse`, `plz`, `ort` are never tracked in `value`. Only config fields (holzart, breite, hoehe, etc.) get values recorded.

### Session metadata (stored once, updated on end)

```js
{
  sessionId, startedAt, endedAt,
  userAgent: navigator.userAgent,
  screenWidth: window.innerWidth,
  product: form.product,
  outcome: "completed" | "abandoned",
  stepCount: 5,
  lastStep: "masse",
}
```

## Client-Side Collection

### `useSessionTracker.js` hook

- Initialized in `Konfigurator.jsx` with existing `sessionId`
- In-memory event array via `useRef` (no re-renders)
- Exposes `track(type, data)` via WizardContext
- Gated by `trackingEnabled` config flag — when off, `track()` is a no-op

### Flush triggers

- On step transition (step-leave + step-enter, then flush batch)
- On session-end (checkout complete or browser `beforeunload`)
- Batches POST to `POST /api/track`
- `beforeunload` uses `navigator.sendBeacon` for reliability

### Emission points

| Event | Where |
|-------|-------|
| `session-start` | `startWizard()` |
| `step-enter` / `step-leave` | `next()`, `prev()`, `startWizard()` |
| `validation-fail` / `field-error` | `validate()`, `setFieldError()` |
| `field-change` | `set()` (throttled, non-PII only) |
| `nav-back` | `prev()` |
| `session-end` | Checkout success or `beforeunload` |

## API & Storage

### `POST /api/track`

Receives event batches. Request body:

```json
{
  "sessionId": "abc-123",
  "meta": { "startedAt": 1709900000000, "userAgent": "...", "screenWidth": 375, "product": "garderobe" },
  "events": [{ "type": "step-enter", "step": "holzart", "timestamp": 1709900001000 }]
}
```

Appends events to existing session (multiple flushes per session).

### KV key structure

- `session:{id}:meta` — session metadata JSON
- `session:{id}:events` — event array JSON (appended per flush)
- `sessions:index` — sorted set of session IDs by timestamp

No TTL — data persists until admin clears.

### `GET /api/track`

- `?list` — recent sessions (paginated from sorted set)
- `?id=abc-123` — full session with meta + events

### `DELETE /api/track`

- `?id=abc-123` — delete single session
- `?all=true` — purge all tracking data

### `vercel.json`

Add `api/track.js` with `maxDuration: 10`.

## Admin UI

### Navigation

New section in Werkstatt nav group: `{ id: 'tracking', label: 'Sessions', short: 'Sess.', icon: 'S' }`

### `AdminTracking.jsx`

Three stacked views:

**1. Toggle + status bar**
- Enable/disable toggle: "Wizard-Sessions aufzeichnen"
- Session count when enabled: "42 Sessions gespeichert"
- "Alle löschen" button with confirmation

**2. Funnel summary** (when sessions exist)
- Horizontal bar chart (plain divs + Tailwind) showing drop-off per step
- Below: "Top Fehlerfelder" — ranked list of fields with most validation errors

**3. Session list** (scrollable)
- Each row: timestamp, product, outcome badge (green "Bestellt" / amber "Abgebrochen"), last step, duration
- Click row to expand inline event timeline
- Vertical timeline with color-coded dots: green (forward), amber (back), red (error)

No separate detail page — expand/collapse inline.

## Config & Integration

### Persistence

- `trackingEnabled: false` in config shape (`useConfigManager.js`)
- Auto-saved to Wix parent like all admin settings

### Konfigurator.jsx

- New `trackingEnabled` state (default `false`)
- `useSessionTracker(sessionId, trackingEnabled)` hook
- `track` function added to WizardContext
- Event emissions in `next()`, `prev()`, `validate()`, `set()`, `startWizard()`, checkout handlers

### Dependencies

- `@vercel/kv` — Vercel KV client
- Env vars: `KV_REST_API_URL`, `KV_REST_API_TOKEN` (auto-configured when KV store linked in Vercel dashboard)
