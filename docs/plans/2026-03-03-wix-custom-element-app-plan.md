# Wix Custom Element App — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wrap the existing GarderobeWizard React component as a Wix Custom Element site widget, with admin settings panel and CMS integration for read/write.

**Architecture:** Wix CLI app project in `spike/` directory. The existing 1545-line React component becomes the widget's `element.tsx`, wrapped via `react-to-webcomponent`. Admin config goes in a settings panel (`element.panel.tsx`). Backend web methods handle CMS read/write. Two CMS collections: `GarderobeConfig` (admin settings) and `GarderobeBestellungen` (customer orders).

**Tech Stack:** Wix CLI, React, `react-to-webcomponent`, `@wix/sdk`, `@wix/data`, `@wix/design-system`, `@wix/editor` (widget API), TypeScript.

**Source:** `app/garderobe-wizard (3).jsx` (1545 lines, the existing component)

---

### Task 1: Scaffold the Wix CLI Project Structure

**Files:**
- Create: `spike/package.json`
- Create: `spike/tsconfig.json`
- Create: `spike/wix.config.ts`
- Create: `spike/.gitignore`

**Step 1: Create the spike directory and package.json**

```json
{
  "name": "holzschneiderei-garderobe-widget",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wix dev",
    "build": "wix build",
    "preview": "wix preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-to-webcomponent": "^2.0.0"
  },
  "devDependencies": {
    "@anthropic/sdk": "latest",
    "@wix/sdk": "latest",
    "@wix/data": "latest",
    "@wix/design-system": "latest",
    "@wix/editor": "latest",
    "@wix/web-methods": "latest",
    "@wix/cli": "latest",
    "typescript": "^5.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create wix.config.ts**

```typescript
import { defineConfig } from '@wix/cli';

export default defineConfig({});
```

**Step 4: Create .gitignore**

```
node_modules/
dist/
.wix/
```

**Step 5: Commit**

```bash
git add spike/
git commit -m "feat: scaffold Wix CLI project structure in spike/"
```

---

### Task 2: Create the Widget Extension Config

**Files:**
- Create: `spike/src/site/widgets/garderobe-wizard/element.extension.ts`
- Create: `spike/public/thumb.png` (placeholder)

**Step 1: Create directory structure**

```bash
mkdir -p spike/src/site/widgets/garderobe-wizard
mkdir -p spike/src/backend
mkdir -p spike/public
```

**Step 2: Create element.extension.ts**

```typescript
import { extensions } from '@wix/astro/builders';

export default extensions.customElement({
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Garderobe Wizard',
  width: {
    defaultWidth: 600,
    allowStretch: true,
  },
  height: {
    defaultHeight: 800,
  },
  installation: {
    autoAdd: true,
  },
  tagName: 'garderobe-wizard',
  element: './element.tsx',
  settings: './element.panel.tsx',
  presets: [
    {
      id: 'f1e2d3c4-b5a6-7890-fedc-ba0987654321',
      name: 'Default',
      thumbnailUrl: '{{BASE_URL}}/public/thumb.png',
    },
  ],
});
```

**Step 3: Create a placeholder thumbnail**

Create a simple 200x200 PNG placeholder. For now, just create an empty file — the real thumbnail comes later.

**Step 4: Commit**

```bash
git add spike/src/site/widgets/garderobe-wizard/element.extension.ts spike/public/
git commit -m "feat: add widget extension config and thumbnail placeholder"
```

---

### Task 3: Create the Web Component Wrapper (element.tsx)

This is the core task — wrapping the existing GarderobeWizard as a web component.

**Files:**
- Create: `spike/src/site/widgets/garderobe-wizard/element.tsx`

**Step 1: Create element.tsx**

This file does three things:
1. Copies the entire GarderobeWizard component (all 1545 lines of data, logic, styles, sub-components)
2. Adds a thin wrapper that accepts config as a prop from Wix attributes
3. Converts the React component to a web component using `reactToWebComponent`

The structure:

```tsx
import React, { useState, useEffect, useRef, useMemo, useCallback, type FC } from 'react';
import ReactDOM from 'react-dom';
import reactToWebComponent from 'react-to-webcomponent';

// ============================================================
// Everything below is copied from app/garderobe-wizard (3).jsx
// with these modifications:
//   1. GarderobeWizard accepts `configJson` and `initialMode` props
//   2. doSubmit() calls window.dispatchEvent with order data
//      (the parent Velo page code listens and writes to CMS)
//   3. On mount, if configJson is provided, parse and apply it
// ============================================================

/* ── Brand tokens ── */
const t = { /* ... exact copy from source ... */ };

/* ── Data ── */
// ... exact copy of all data arrays ...

/* ── All helper functions ── */
// ... exact copy of computeLimits, computePrice, makeDefaultDimConfig ...

/* ── Main component ── */
interface WizardProps {
  configJson?: string;   // JSON string of GarderobeConfig
  initialMode?: string;  // "workflow" | "admin" | "preview"
}

const GarderobeWizard: FC<WizardProps> = ({ configJson, initialMode = 'workflow' }) => {
  // ... existing component code ...
  // MODIFICATION 1: mode initialization uses initialMode prop instead of URL param
  const [mode, setMode] = useState(initialMode);

  // MODIFICATION 2: on mount, parse configJson and apply to state
  useEffect(() => {
    if (!configJson) return;
    try {
      const cfg = JSON.parse(configJson);
      if (cfg.constr) setConstr(cfg.constr);
      if (cfg.dimConfig) setDimConfig(cfg.dimConfig);
      if (cfg.enabledHolzarten) setEnabledHolzarten(cfg.enabledHolzarten);
      if (cfg.enabledSteps) setEnabledSteps(cfg.enabledSteps);
      if (cfg.pricing) setPricing(cfg.pricing);
      if (cfg.stepOrder) setStepOrder(cfg.stepOrder);
    } catch { /* ignore bad config */ }
  }, [configJson]);

  // MODIFICATION 3: doSubmit dispatches a custom event
  const doSubmit = () => {
    if (!validate()) return;
    // Dispatch order data as custom event for Velo/parent to handle
    const orderData = { ...form };
    window.dispatchEvent(new CustomEvent('garderobe-order', {
      detail: orderData,
      bubbles: true,
    }));
    setPhase("done");
  };

  // ... rest of component unchanged ...
};

/* ── All sub-components ── */
// ... exact copy of all sub-components (StepHolzart, StepMasse, etc.) ...

/* ── Styles ── */
const S = { /* ... exact copy ... */ };

// ============================================================
// Web Component conversion
// ============================================================
const customElement = reactToWebComponent(
  GarderobeWizard,
  React,
  ReactDOM as any,
  {
    props: {
      configJson: 'string',
      initialMode: 'string',
    },
  }
);

export default customElement;
```

**Step 2: Actually copy the full source**

Copy the full content of `app/garderobe-wizard (3).jsx` into `element.tsx`, applying the three modifications listed above. The file will be ~1600 lines.

Key modifications to make:
1. **Line 146-152** — Replace URL param detection with `initialMode` prop:
   ```tsx
   const [mode, setMode] = useState(initialMode || 'workflow');
   ```
2. **Line 284** — Replace `doSubmit` to dispatch custom event (shown above)
3. **Add useEffect** after state declarations to parse `configJson` prop
4. **Add imports** — `react-to-webcomponent`, TypeScript types
5. **Add web component conversion** at bottom of file
6. **Remove** the `export default` from `GarderobeWizard` function signature (it's exported via the web component wrapper instead)

**Step 3: Commit**

```bash
git add spike/src/site/widgets/garderobe-wizard/element.tsx
git commit -m "feat: wrap GarderobeWizard as Wix custom element web component"
```

---

### Task 4: Create the Admin Settings Panel

**Files:**
- Create: `spike/src/site/widgets/garderobe-wizard/element.panel.tsx`

**Step 1: Create element.panel.tsx**

The settings panel lets the site admin configure the wizard from the Wix Editor sidebar.
It reads/writes to the `GarderobeConfig` CMS collection.

```tsx
import React, { type FC, useState, useEffect, useCallback } from 'react';
import { widget } from '@wix/editor';
import {
  SidePanel,
  WixDesignSystemProvider,
  Input,
  FormField,
  ToggleSwitch,
  NumberInput,
  Button,
  Heading,
  Text,
  Divider,
  Box,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';

// Wood types available for toggling
const WOOD_TYPES = [
  { value: 'eiche', label: 'Eiche' },
  { value: 'esche', label: 'Esche' },
  { value: 'nussbaum', label: 'Nussbaum' },
  { value: 'ahorn', label: 'Ahorn' },
  { value: 'arve', label: 'Arve / Zirbe' },
];

// Optional wizard steps
const OPTIONAL_STEPS = [
  { id: 'holzart', label: 'Holzart', required: false },
  { id: 'masse', label: 'Abmessungen', required: true },
  { id: 'ausfuehrung', label: 'Ausführung', required: false },
  { id: 'extras', label: 'Extras & Wünsche', required: false },
];

const DEFAULT_CONFIG = {
  enabledHolzarten: { eiche: true, esche: true, nussbaum: true, ahorn: true, arve: true },
  enabledSteps: { holzart: true, masse: true, ausfuehrung: true, extras: false },
  pricing: {
    woodCosts: { eiche: 85, esche: 75, nussbaum: 120, ahorn: 70, arve: 95 },
    labourRate: 75,
    hoursBase: 4,
    hoursPerM2: 2,
    extrasCosts: { spiegel: 120, schuhablage: 180, schublade: 220, schluesselleiste: 45, sitzbank: 280 },
    margin: 1.8,
  },
  constr: {
    MIN_W: 30, MAX_W: 100,
    MIN_H: 80, MAX_H: 250,
    MIN_D: 20, MAX_D: 60,
    HOOK_SPACING: 10, EDGE_MARGIN: 5,
    LETTER_W: 5, LETTER_MARGIN: 4,
  },
};

const Panel: FC = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Load current config from widget prop on mount
  useEffect(() => {
    widget.getProp('config-json')
      .then((json: string) => {
        if (json) {
          try {
            setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(json) });
          } catch { /* use defaults */ }
        }
      })
      .catch(() => { /* use defaults */ });
  }, []);

  // Push config changes to the widget
  const pushConfig = useCallback((newConfig: typeof config) => {
    setConfig(newConfig);
    widget.setProp('config-json', JSON.stringify(newConfig));
  }, []);

  // Toggle a wood type
  const toggleWood = (value: string) => {
    const next = {
      ...config,
      enabledHolzarten: {
        ...config.enabledHolzarten,
        [value]: !config.enabledHolzarten[value],
      },
    };
    pushConfig(next);
  };

  // Toggle a step
  const toggleStep = (id: string) => {
    const step = OPTIONAL_STEPS.find(s => s.id === id);
    if (step?.required) return;
    const next = {
      ...config,
      enabledSteps: {
        ...config.enabledSteps,
        [id]: !config.enabledSteps[id],
      },
    };
    pushConfig(next);
  };

  // Update pricing field
  const setPricingField = (key: string, value: number) => {
    const next = {
      ...config,
      pricing: { ...config.pricing, [key]: value },
    };
    pushConfig(next);
  };

  // Update constraint field
  const setConstrField = (key: string, value: number) => {
    const next = {
      ...config,
      constr: { ...config.constr, [key]: value },
    };
    pushConfig(next);
  };

  return (
    <WixDesignSystemProvider>
      <SidePanel width="300" height="100vh">
        <SidePanel.Content noPadding stretchVertically>
          {/* Wood Types */}
          <SidePanel.Field>
            <Heading size="tiny">Holzarten</Heading>
            {WOOD_TYPES.map(wood => (
              <Box key={wood.value} direction="horizontal" align="space-between" padding="4px 0">
                <Text size="small">{wood.label}</Text>
                <ToggleSwitch
                  checked={config.enabledHolzarten[wood.value]}
                  onChange={() => toggleWood(wood.value)}
                  size="small"
                />
              </Box>
            ))}
          </SidePanel.Field>

          <Divider />

          {/* Wizard Steps */}
          <SidePanel.Field>
            <Heading size="tiny">Wizard-Schritte</Heading>
            {OPTIONAL_STEPS.map(step => (
              <Box key={step.id} direction="horizontal" align="space-between" padding="4px 0">
                <Text size="small">{step.label} {step.required && '(Pflicht)'}</Text>
                <ToggleSwitch
                  checked={config.enabledSteps[step.id]}
                  onChange={() => toggleStep(step.id)}
                  disabled={step.required}
                  size="small"
                />
              </Box>
            ))}
          </SidePanel.Field>

          <Divider />

          {/* Pricing */}
          <SidePanel.Field>
            <Heading size="tiny">Preiskalkulation</Heading>
            <FormField label="Stundensatz (CHF)">
              <NumberInput
                value={config.pricing.labourRate}
                onChange={(val) => setPricingField('labourRate', val || 0)}
                min={0}
              />
            </FormField>
            <FormField label="Basis-Stunden">
              <NumberInput
                value={config.pricing.hoursBase}
                onChange={(val) => setPricingField('hoursBase', val || 0)}
                min={0}
              />
            </FormField>
            <FormField label="Marge (Multiplikator)">
              <NumberInput
                value={config.pricing.margin}
                onChange={(val) => setPricingField('margin', val || 1)}
                min={1}
                step={0.1}
              />
            </FormField>
          </SidePanel.Field>

          <Divider />

          {/* Constraints */}
          <SidePanel.Field>
            <Heading size="tiny">Produktgrenzen</Heading>
            <Box direction="horizontal" gap="8px">
              <FormField label="Min Breite">
                <NumberInput
                  value={config.constr.MIN_W}
                  onChange={(val) => setConstrField('MIN_W', val || 0)}
                  min={0}
                />
              </FormField>
              <FormField label="Max Breite">
                <NumberInput
                  value={config.constr.MAX_W}
                  onChange={(val) => setConstrField('MAX_W', val || 0)}
                  min={0}
                />
              </FormField>
            </Box>
            <Box direction="horizontal" gap="8px">
              <FormField label="Min Höhe">
                <NumberInput
                  value={config.constr.MIN_H}
                  onChange={(val) => setConstrField('MIN_H', val || 0)}
                  min={0}
                />
              </FormField>
              <FormField label="Max Höhe">
                <NumberInput
                  value={config.constr.MAX_H}
                  onChange={(val) => setConstrField('MAX_H', val || 0)}
                  min={0}
                />
              </FormField>
            </Box>
          </SidePanel.Field>
        </SidePanel.Content>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
```

**Step 2: Commit**

```bash
git add spike/src/site/widgets/garderobe-wizard/element.panel.tsx
git commit -m "feat: add admin settings panel for widget configuration"
```

---

### Task 5: Create Backend Web Methods

**Files:**
- Create: `spike/src/backend/bestellung.ts`
- Create: `spike/src/backend/config.ts`

**Step 1: Create bestellung.ts — order submission**

```typescript
import { webMethod, Permissions } from '@wix/web-methods';
import { items } from '@wix/data';

interface OrderData {
  typ: string;
  schriftzug?: string;
  schriftart?: string;
  berg?: string;
  holzart: string;
  breite: string;
  hoehe: string;
  tiefe: string;
  oberflaeche: string;
  haken: string;
  hakenmaterial: string;
  hutablage: string;
  extras: string[];
  bemerkungen?: string;
  anrede?: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  strasse?: string;
  plz: string;
  ort: string;
}

export const submitOrder = webMethod(
  Permissions.Anyone,
  async (orderData: OrderData) => {
    // Validate required fields
    if (!orderData.vorname || !orderData.nachname || !orderData.email || !orderData.plz || !orderData.ort) {
      throw new Error('Required fields missing: vorname, nachname, email, plz, ort');
    }

    const item = {
      title: `${orderData.vorname} ${orderData.nachname} - ${orderData.typ}`,
      typ: orderData.typ,
      schriftzug: orderData.schriftzug || '',
      schriftart: orderData.schriftart || '',
      berg: orderData.berg || '',
      holzart: orderData.holzart,
      breite: parseInt(orderData.breite) || 0,
      hoehe: parseInt(orderData.hoehe) || 0,
      tiefe: parseInt(orderData.tiefe) || 0,
      oberflaeche: orderData.oberflaeche,
      haken: orderData.haken,
      hakenmaterial: orderData.hakenmaterial,
      hutablage: orderData.hutablage,
      extras: (orderData.extras || []).join(', '),
      bemerkungen: orderData.bemerkungen || '',
      anrede: orderData.anrede || '',
      vorname: orderData.vorname,
      nachname: orderData.nachname,
      email: orderData.email,
      telefon: orderData.telefon || '',
      strasse: orderData.strasse || '',
      plz: orderData.plz,
      ort: orderData.ort,
      status: 'NEU',
    };

    const result = await items.insert('GarderobeBestellungen', item);
    return { success: true, id: result._id };
  }
);
```

**Step 2: Create config.ts — config read/write**

```typescript
import { webMethod, Permissions } from '@wix/web-methods';
import { items } from '@wix/data';

const COLLECTION_ID = 'GarderobeConfig';
const CONFIG_ITEM_TITLE = 'default';

export const loadConfig = webMethod(
  Permissions.Anyone,
  async () => {
    try {
      const result = await items.query(COLLECTION_ID)
        .eq('title', CONFIG_ITEM_TITLE)
        .find();

      if (result.items.length > 0) {
        const item = result.items[0];
        return {
          enabledHolzarten: JSON.parse(item.data.enabledHolzarten || '{}'),
          enabledSteps: JSON.parse(item.data.enabledSteps || '{}'),
          stepOrder: JSON.parse(item.data.stepOrder || '[]'),
          constraints: JSON.parse(item.data.constraints || '{}'),
          pricing: JSON.parse(item.data.pricing || '{}'),
          defaults: JSON.parse(item.data.defaults || '{}'),
        };
      }
      return null; // No config found, use component defaults
    } catch (err) {
      console.error('Failed to load config:', err);
      return null;
    }
  }
);

export const saveConfig = webMethod(
  Permissions.Admin,
  async (config: {
    enabledHolzarten?: Record<string, boolean>;
    enabledSteps?: Record<string, boolean>;
    stepOrder?: string[];
    constraints?: Record<string, number>;
    pricing?: Record<string, any>;
    defaults?: Record<string, any>;
  }) => {
    const data = {
      title: CONFIG_ITEM_TITLE,
      enabledHolzarten: JSON.stringify(config.enabledHolzarten || {}),
      enabledSteps: JSON.stringify(config.enabledSteps || {}),
      stepOrder: JSON.stringify(config.stepOrder || []),
      constraints: JSON.stringify(config.constraints || {}),
      pricing: JSON.stringify(config.pricing || {}),
      defaults: JSON.stringify(config.defaults || {}),
    };

    // Check if config already exists
    const existing = await items.query(COLLECTION_ID)
      .eq('title', CONFIG_ITEM_TITLE)
      .find();

    if (existing.items.length > 0) {
      await items.update(COLLECTION_ID, {
        _id: existing.items[0]._id,
        data,
      });
    } else {
      await items.insert(COLLECTION_ID, data);
    }

    return { success: true };
  }
);
```

**Step 3: Commit**

```bash
git add spike/src/backend/
git commit -m "feat: add backend web methods for order submission and config"
```

---

### Task 6: Create CSS Module

**Files:**
- Create: `spike/src/site/widgets/garderobe-wizard/element.module.css`

**Step 1: Create element.module.css**

Minimal CSS module — most styling is CSS-in-JS in the component. This just sets the host element container.

```css
.root {
  width: 100%;
  min-height: 400px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

**Step 2: Commit**

```bash
git add spike/src/site/widgets/garderobe-wizard/element.module.css
git commit -m "feat: add minimal CSS module for widget container"
```

---

### Task 7: Wire Up CMS Integration in element.tsx

This task modifies the element.tsx created in Task 3 to actually call the backend web methods.

**Files:**
- Modify: `spike/src/site/widgets/garderobe-wizard/element.tsx`

**Step 1: Add imports for backend methods**

At the top of element.tsx, add:

```tsx
import { submitOrder } from '../../backend/bestellung';
import { loadConfig } from '../../backend/config';
```

**Step 2: Modify the GarderobeWizard component's mount effect**

Add a useEffect that loads config from CMS on mount:

```tsx
// Load config from CMS on mount
useEffect(() => {
  loadConfig().then((cfg) => {
    if (!cfg) return;
    if (cfg.constraints) setConstr(prev => ({ ...prev, ...cfg.constraints }));
    if (cfg.enabledHolzarten) setEnabledHolzarten(cfg.enabledHolzarten);
    if (cfg.enabledSteps) setEnabledSteps(prev => ({ ...prev, ...cfg.enabledSteps }));
    if (cfg.pricing) setPricing(prev => ({ ...prev, ...cfg.pricing }));
    if (cfg.stepOrder && cfg.stepOrder.length) setStepOrder(cfg.stepOrder);
  }).catch(console.error);
}, []);
```

**Step 3: Modify doSubmit to call backend**

Replace the custom event dispatch with an actual backend call:

```tsx
const doSubmit = async () => {
  if (!validate()) return;
  try {
    await submitOrder({ ...form });
    setPhase("done");
  } catch (err) {
    console.error('Order submission failed:', err);
    setErrors({ submit: true });
  }
};
```

**Step 4: Commit**

```bash
git add spike/src/site/widgets/garderobe-wizard/element.tsx
git commit -m "feat: wire up CMS read/write in widget component"
```

---

### Task 8: Create a README for the Spike

**Files:**
- Create: `spike/README.md`

**Step 1: Write README**

```markdown
# Holzschneiderei Garderobe Wizard — Wix Custom Element Spike

This spike wraps the existing GarderobeWizard React component as a Wix Custom Element
site widget using the Wix CLI.

## Setup

1. Install dependencies:
   ```bash
   cd spike && npm install
   ```

2. Log into Wix CLI:
   ```bash
   npx wix login
   ```

3. Start local dev:
   ```bash
   npx wix dev
   ```

## Structure

- `src/site/widgets/garderobe-wizard/` — The widget (React → Web Component)
  - `element.tsx` — GarderobeWizard component wrapped as custom element
  - `element.panel.tsx` — Admin settings panel (editor sidebar)
  - `element.extension.ts` — Widget config (size, tag name, presets)
  - `element.module.css` — Container styles
- `src/backend/` — Server-side web methods
  - `bestellung.ts` — Order submission to CMS
  - `config.ts` — Config read/write from CMS

## CMS Collections Required

Create these in the Wix dashboard before testing:

1. **GarderobeConfig** — single-row config (Text fields: enabledHolzarten, enabledSteps,
   stepOrder, constraints, pricing, defaults — all store JSON strings)
2. **GarderobeBestellungen** — order submissions (see design doc for full schema)

## How It Works

1. Site owner adds the widget to a page via the Wix Editor Add Elements panel
2. Widget loads config from GarderobeConfig CMS collection on mount
3. Admin configures the widget via the editor settings panel (sidebar)
4. Customer fills out the wizard and submits
5. Submission is saved to GarderobeBestellungen CMS collection via backend web method
```

**Step 2: Commit**

```bash
git add spike/README.md
git commit -m "docs: add README for spike project"
```

---

### Task 9: Verify Project Structure

**Step 1: Verify all files exist**

```bash
find spike/ -type f -not -path '*/node_modules/*' | sort
```

Expected output:
```
spike/.gitignore
spike/README.md
spike/package.json
spike/public/thumb.png
spike/src/backend/bestellung.ts
spike/src/backend/config.ts
spike/src/site/widgets/garderobe-wizard/element.extension.ts
spike/src/site/widgets/garderobe-wizard/element.module.css
spike/src/site/widgets/garderobe-wizard/element.panel.tsx
spike/src/site/widgets/garderobe-wizard/element.tsx
spike/tsconfig.json
spike/wix.config.ts
```

**Step 2: Install dependencies and verify no TypeScript errors**

```bash
cd spike && npm install && npx tsc --noEmit
```

Expected: Clean compilation with no errors (or only minor type warnings from Wix SDK).

**Step 3: Final commit**

```bash
git add -A spike/
git commit -m "feat: complete Wix custom element spike - ready for testing"
```
