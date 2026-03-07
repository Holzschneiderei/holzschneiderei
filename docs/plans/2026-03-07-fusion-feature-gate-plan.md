# Fusion 360 Feature Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add admin-controlled feature gate for Fusion 360 script generation with backend health checks and test email capability.

**Architecture:** Two new Vercel serverless endpoints (`fusion-status`, `fusion-test`) check env var configuration and send test emails. A new `AdminFusion` component in a "Werkstatt" nav group shows connection status and provides an enable/disable toggle. The `fusionEnabled` flag is persisted in the existing admin config system via Wix parent postMessage.

**Tech Stack:** React, Vercel Serverless Functions, Resend email SDK

---

### Task 1: Create fusion-status API endpoint

**Files:**
- Create: `api/fusion-status.js`

**Step 1: Create the endpoint**

```js
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const workshopEmail = process.env.WORKSHOP_EMAIL;

  const missing = [];
  if (!apiKey) missing.push('RESEND_API_KEY');
  if (!workshopEmail) missing.push('WORKSHOP_EMAIL');

  if (missing.length > 0) {
    return res.status(200).json({ configured: false, missing });
  }

  // Mask email: first char + *** + @domain
  const [local, domain] = workshopEmail.split('@');
  const masked = local.charAt(0) + '***@' + (domain || '');

  return res.status(200).json({ configured: true, workshopEmail: masked });
}
```

**Step 2: Commit**

```
feat: add fusion-status API endpoint
```

---

### Task 2: Create fusion-test API endpoint and update vercel.json

**Files:**
- Create: `api/fusion-test.js`
- Modify: `vercel.json`

**Step 1: Create the endpoint**

```js
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const workshopEmail = process.env.WORKSHOP_EMAIL;
  const fromEmail = process.env.FROM_EMAIL || 'konfigurator@holzschneiderei.ch';

  if (!apiKey || !workshopEmail) {
    return res.status(400).json({ success: false, error: 'Env vars not configured' });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: workshopEmail,
      subject: 'Holzschneiderei Konfigurator – Testmail',
      text: [
        'Dies ist eine Testmail vom Holzschneiderei Konfigurator.',
        '',
        'Wenn Sie diese E-Mail erhalten, ist die Fusion 360 Script-Zustellung korrekt konfiguriert.',
        '',
        `Gesendet: ${new Date().toLocaleString('de-CH')}`,
      ].join('\n'),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('fusion-test error:', err);
    return res.status(200).json({ success: false, error: err.message || 'Email send failed' });
  }
}
```

**Step 2: Update vercel.json**

Add both new endpoints to the `functions` config:

```json
{
  "functions": {
    "api/send-script.js": { "maxDuration": 30 },
    "api/fusion-status.js": { "maxDuration": 10 },
    "api/fusion-test.js": { "maxDuration": 10 }
  }
}
```

**Step 3: Commit**

```
feat: add fusion-test API endpoint
```

---

### Task 3: Wire fusionEnabled into config persistence

**Files:**
- Modify: `src/Konfigurator.jsx` — add `fusionEnabled` state, pass to config manager, gate `generateAndSendScript`
- Modify: `src/hooks/useConfigManager.js` — add `fusionEnabled` to getConfig/applyConfig

**Step 1: Add fusionEnabled to useConfigManager**

In `useConfigManager.js`:

- Add `fusionEnabled, setFusionEnabled` to the destructured params (line 75-86)
- Add `fusionEnabled` to the `getConfig()` return object (line 87-91)
- Add `if (typeof data.fusionEnabled === 'boolean') setFusionEnabled(data.fusionEnabled);` to `applyConfig()` (after line 111)
- Add `fusionEnabled` to the `getConfig` dependency array (line 90-91)

**Step 2: Add fusionEnabled state and wiring in Konfigurator.jsx**

- Add state: `const [fusionEnabled, setFusionEnabled] = useState(false);` (near line 95, after products state)
- Add ref: `const fusionEnabledRef = useRef(fusionEnabled); fusionEnabledRef.current = fusionEnabled;` (near line 150, after constrRef)
- Pass to `useConfigManager`: add `fusionEnabled, setFusionEnabled` to the object at lines 114-126
- Gate the generateAndSendScript call at line 258-260: wrap with `if (fusionEnabledRef.current) { ... }`
- Add `fusionEnabled` to the auto-save dependency array at line 319-321

**Step 3: Commit**

```
feat: wire fusionEnabled into config persistence
```

---

### Task 4: Create AdminFusion component

**Files:**
- Create: `src/components/admin/AdminFusion.jsx`

**Step 1: Create the component**

The component should:

1. On mount, fetch `GET /api/fusion-status` and store result in local state
2. Show a status indicator (green/red dot with label)
3. When configured, show masked workshop email
4. When not configured, list missing env vars
5. "Testmail senden" button — only visible when configured. On click, POST to `/api/fusion-test`, show loading state, then success/error inline
6. Enable/disable toggle — label "Fusion 360 Script bei Bestellung generieren". Disabled (greyed out) when not configured. Calls `onToggle(bool)` prop

Props: `{ enabled, onToggle }`

Follow the visual style of `AdminImportExport.jsx` — cards with icon + description + action button.

Use these CSS classes consistently:
- Card: `p-3 bg-field border border-border rounded`
- Title: `text-[12px] font-bold text-text mb-0.5`
- Description: `text-[11px] text-muted leading-snug`
- Button: `wz-btn wz-btn-ghost h-8 px-4 text-[11px]`
- Status dot: `w-2.5 h-2.5 rounded-full` with `bg-[#4caf50]` (green) or `bg-[#e53935]` (red)

**Step 2: Commit**

```
feat: add AdminFusion component
```

---

### Task 5: Add Werkstatt nav group and wire AdminFusion into admin layout

**Files:**
- Modify: `src/components/admin/AdminLayout.jsx` — add Werkstatt nav group (lines 12-46)
- Modify: `src/Konfigurator.jsx` — import AdminFusion, add section content entry, add admin summary

**Step 1: Add nav group in AdminLayout.jsx**

Insert a new group between "Regeln & Preise" (index 2) and "System" (index 3) at line 39:

```js
{
  label: 'Werkstatt',
  sections: [
    { id: 'fusion', label: 'Fusion 360', short: 'Fusion', icon: 'F' },
  ],
},
```

**Step 2: Wire into Konfigurator.jsx**

- Import: `import AdminFusion from "./components/admin/AdminFusion";` (after line 49)
- Add to `adminSectionContent` (after the `importExport` entry, around line 357):
  ```js
  fusion: {
    title: "Fusion 360",
    desc: "Automatische Script-Generierung für die Werkstatt",
    content: <AdminFusion enabled={fusionEnabled} onToggle={setFusionEnabled} />
  },
  ```
- Add to `adminSummaries` (around line 336):
  ```js
  fusion: fusionEnabled ? "Aktiviert" : "Deaktiviert",
  ```

**Step 3: Commit**

```
feat: add Werkstatt nav group with Fusion 360 admin section
```

---

### Task 6: Add admin notice in StepUebersicht

**Files:**
- Modify: `src/components/steps/StepUebersicht.jsx`
- Modify: `src/context/WizardContext.jsx` — expose `fusionEnabled` if not already available

**Step 1: Check if isAdmin and fusionEnabled are available in WizardContext**

Read `src/context/WizardContext.jsx`. The wizard context is built in `Konfigurator.jsx` at lines 290-300. We need to add `fusionEnabled` to the context value there.

In `Konfigurator.jsx`, add `fusionEnabled` to the `wizardCtx` useMemo (line 290-300).

**Step 2: Add notice in StepUebersicht**

After the "Richtpreis" card (line 68) and before the datenschutz checkbox (line 70), add:

```jsx
{isAdmin && !fusionEnabled && (
  <div className="mt-3 px-3.5 py-2.5 bg-[rgba(200,197,187,0.15)] rounded flex items-center gap-2">
    <span className="text-[11px] text-muted">Fusion 360 Script: deaktiviert</span>
  </div>
)}
```

The `isAdmin` flag is not currently in the wizard context. Since this is admin-only UI, check if `mode` is available or pass `isAdmin` through the context. The simplest approach: the notice only shows in admin preview, so we can check by adding `isAdmin` to the wizard context in `Konfigurator.jsx`.

Alternatively, since `StepUebersicht` is rendered inside the admin preview, and the admin preview wraps content in `WizardProvider`, we can add a simple `isAdmin` boolean to the context.

**Step 3: Commit**

```
feat: show Fusion 360 status notice in admin summary view
```

---

### Task 7: Build verification and cleanup

**Step 1: Run build**

```bash
npm run build --prefix /c/dev/tweakch/holzschneiderei
```

Expected: Build succeeds with no errors.

**Step 2: Verify admin loads**

Start dev server (`npm run dev`) and open `?mode=admin`. Navigate to Werkstatt > Fusion 360. Verify:
- Status shows red (env vars not configured in dev)
- Toggle is disabled
- Test button is hidden

**Step 3: Final commit if any fixes needed**
