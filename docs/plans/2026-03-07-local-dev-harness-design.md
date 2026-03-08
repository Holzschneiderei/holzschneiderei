# Local Dev Fallbacks + Mock Wix Harness — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make all bridge features functional locally and provide a mock Wix CMS harness for integration testing.

**Architecture:** Two modes — `npm run dev` uses localStorage fallbacks in `bridge.js` when not iframed; `npm run test` serves `harness.html` which embeds the app in an iframe with mock `$w`/`wixData` APIs. The harness handler code is written in Wix Velo style so it's portable to the real Wix site.

**Tech Stack:** Vanilla JS (harness), Vite dev server, localStorage

---

### Task 1: Bridge local fallbacks

**Files:**
- Modify: `src/bridge.js`

**Step 1: Add `localFallback()` and modify `send()`**

Replace the entire contents of `src/bridge.js` with:

```js
const CHANNEL = "holzschneiderei";

function isIframed() {
  try { return window.self !== window.top; } catch { return true; }
}

/* ── Local fallback (standalone dev mode, no iframe parent) ── */

function dispatch(type, payload = {}) {
  window.postMessage({ channel: CHANNEL, type, ...payload }, "*");
}

function localFallback(type, payload) {
  switch (type) {
    case "save-progress":
      localStorage.setItem("hz:progress", JSON.stringify(payload.state));
      break;
    case "load-progress": {
      const raw = localStorage.getItem("hz:progress");
      dispatch("progress-loaded", { state: raw ? JSON.parse(raw) : null });
      break;
    }
    case "clear-progress":
      localStorage.removeItem("hz:progress");
      break;
    case "submit-config": {
      const configId = "local-" + Date.now();
      localStorage.setItem("hz:config:" + configId, JSON.stringify(payload.config));
      setTimeout(() => dispatch("config-saved", { success: true, configId }), 100);
      break;
    }
    case "request-checkout":
      setTimeout(() => dispatch("checkout-ready", { checkoutUrl: "#local-checkout" }), 500);
      break;
    case "save-settings":
      localStorage.setItem("hz:settings", JSON.stringify({ pricing: payload.pricing, constraints: payload.constraints }));
      dispatch("settings-saved");
      break;
    case "config-save":
      localStorage.setItem("hz:config", JSON.stringify(payload.config));
      break;
    default:
      console.debug("[bridge:local]", type, payload);
  }
}

/** Send a typed message to the parent window */
export function send(type, payload = {}) {
  if (!isIframed()) { localFallback(type, payload); return; }
  window.parent.postMessage({ channel: CHANNEL, type, ...payload }, "*");
}

/** Listen for messages from the parent window. Returns cleanup function. */
export function listen(handlers) {
  const onMessage = (e) => {
    const d = e.data;
    if (!d || d.channel !== CHANNEL) return;
    const handler = handlers[d.type];
    if (handler) handler(d);
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}

/** Observe body height and post resize events to parent. Returns cleanup function. */
export function autoResize() {
  if (!isIframed()) return () => {};
  let last = 0;
  const notify = () => {
    const h = document.documentElement.scrollHeight;
    if (h !== last) { last = h; send("resize", { height: h }); }
  };
  const ro = new ResizeObserver(notify);
  ro.observe(document.body);
  notify();
  return () => ro.disconnect();
}

/* ── Progress persistence (parent-side localStorage) ── */

/** Ask parent to save wizard state to localStorage */
export function saveProgress(state) {
  send("save-progress", { state });
}

/** Ask parent to load saved wizard state */
export function loadProgress() {
  send("load-progress");
}

/** Ask parent to clear saved wizard state */
export function clearProgress() {
  send("clear-progress");
}

/* ── Configuration submission & checkout ── */

/** Submit a completed configuration to Wix CMS via parent */
export function submitConfig(config, sessionId) {
  send("submit-config", { config, sessionId });
}

/** Request a Wix eCommerce checkout via parent */
export function requestCheckout(configId, price, summary) {
  send("request-checkout", { configId, price, summary });
}

/* ── Admin settings ── */

/** Save admin settings (pricing, constraints) via parent */
export function saveSettings(pricing, constraints) {
  send("save-settings", { pricing, constraints });
}
```

**Step 2: Smoke test**

Run: `npm run dev`
- Open `http://localhost:5173` (not in iframe)
- Open browser console — should see `[bridge:local] ready {}` on load
- Navigate through wizard — progress should persist across page reload
- Submit a config — should reach the "done" phase without errors

**Step 3: Commit**

```bash
git add src/bridge.js
git commit -m "feat: add localStorage fallbacks to bridge for standalone dev mode"
```

---

### Task 2: Mock Wix harness

**Files:**
- Create: `harness.html` (project root)

**Step 1: Create `harness.html`**

Create `harness.html` in the project root with this content. The file has three sections: (A) mock `$w` + `wixData` APIs, (B) Wix Velo-style message handler, (C) CMS dashboard UI.

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Holzschneiderei — Wix Dev Harness</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a2e; color: #e0e0e0; height: 100vh; display: flex; }
    #cms { width: 40%; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; border-right: 2px solid #16213e; }
    #app { width: 60%; }
    #app iframe { width: 100%; height: 100%; border: none; }
    h1 { font-size: 16px; color: #a8b2d1; letter-spacing: 1px; text-transform: uppercase; }
    h2 { font-size: 13px; color: #64ffda; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { background: #16213e; border-radius: 8px; padding: 12px; }
    .controls { display: flex; flex-wrap: wrap; gap: 8px; }
    .controls button, .controls select, .controls input { font-size: 12px; padding: 6px 12px; border-radius: 4px; border: 1px solid #0f3460; background: #0f3460; color: #e0e0e0; cursor: pointer; }
    .controls button:hover { background: #1a5276; }
    .controls button.danger { background: #6b2737; border-color: #6b2737; }
    .controls button.danger:hover { background: #8b3a4a; }
    .log { max-height: 200px; overflow-y: auto; font-family: 'Consolas', monospace; font-size: 11px; line-height: 1.6; }
    .log-entry { padding: 2px 6px; border-bottom: 1px solid #1a1a2e; }
    .log-entry.outgoing { color: #64ffda; }
    .log-entry.incoming { color: #ffd866; }
    .log-time { color: #666; margin-right: 6px; }
    .log-type { font-weight: bold; margin-right: 4px; }
    table { width: 100%; font-size: 11px; border-collapse: collapse; }
    th { text-align: left; color: #64ffda; padding: 4px 6px; border-bottom: 1px solid #0f3460; }
    td { padding: 4px 6px; border-bottom: 1px solid #1a1a2e; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .empty { color: #555; font-style: italic; font-size: 11px; }
    #collection-tabs { display: flex; gap: 4px; margin-bottom: 8px; }
    #collection-tabs button { background: none; border: 1px solid #0f3460; font-size: 11px; padding: 4px 10px; color: #a8b2d1; border-radius: 4px; cursor: pointer; }
    #collection-tabs button.active { background: #0f3460; color: #64ffda; }
  </style>
</head>
<body>

<div id="cms">
  <h1>Wix Dev Harness</h1>

  <!-- Controls -->
  <div class="section">
    <h2>Controls</h2>
    <div class="controls">
      <button onclick="sendToApp('set-mode', {mode:'workflow'})">Workflow</button>
      <button onclick="sendToApp('set-mode', {mode:'admin'})">Admin</button>
      <button onclick="sendToApp('set-background', {color: document.getElementById('bg-color').value})">Set BG</button>
      <input type="color" id="bg-color" value="#ffffff" title="Background color">
      <button onclick="loadConfigFile()">Load Config</button>
      <button class="danger" onclick="clearAll()">Clear All</button>
    </div>
  </div>

  <!-- Message Log -->
  <div class="section" style="flex:1; min-height:0; display:flex; flex-direction:column;">
    <h2>Message Log</h2>
    <div class="log" id="log"></div>
  </div>

  <!-- CMS Collections -->
  <div class="section">
    <h2>CMS Collections</h2>
    <div id="collection-tabs"></div>
    <div id="collection-view"></div>
  </div>
</div>

<div id="app">
  <iframe id="configuratorEmbed" src="/"></iframe>
</div>

<script>
/* ================================================================
   A) Mock Wix APIs — $w and wixData
   ================================================================ */

const CHANNEL = "holzschneiderei";
const LS_PREFIX = "hz:harness:";
const iframe = document.getElementById("configuratorEmbed");

// --- $w mock ---
const elements = {
  "#configuratorEmbed": {
    _handlers: [],
    onMessage(cb) { this._handlers.push(cb); },
    postMessage(data) {
      iframe.contentWindow.postMessage({ channel: CHANNEL, ...data }, "*");
      logMessage("outgoing", data.type, data);
    }
  }
};

function $w(selector) {
  const el = elements[selector];
  if (!el) throw new Error("$w: unknown selector " + selector);
  return el;
}

// Route iframe messages to $w handlers
window.addEventListener("message", (e) => {
  const d = e.data;
  if (!d || d.channel !== CHANNEL || e.source === window) return;
  logMessage("incoming", d.type, d);
  elements["#configuratorEmbed"]._handlers.forEach(cb => cb({ data: d }));
});

// --- wixData mock ---
function _loadCollections() {
  try { return JSON.parse(localStorage.getItem(LS_PREFIX + "collections")) || {}; } catch { return {}; }
}
function _saveCollections(c) {
  localStorage.setItem(LS_PREFIX + "collections", JSON.stringify(c));
}

const wixData = {
  async insert(collection, item) {
    const cols = _loadCollections();
    if (!cols[collection]) cols[collection] = [];
    const record = { _id: crypto.randomUUID(), _createdDate: new Date().toISOString(), ...item };
    cols[collection].push(record);
    _saveCollections(cols);
    renderCollections();
    return record;
  },
  query(collection) {
    return {
      async find() {
        const cols = _loadCollections();
        return { items: cols[collection] || [] };
      }
    };
  },
  async remove(collection, id) {
    const cols = _loadCollections();
    if (cols[collection]) {
      cols[collection] = cols[collection].filter(i => i._id !== id);
      _saveCollections(cols);
      renderCollections();
    }
  },
  async truncate(collection) {
    const cols = _loadCollections();
    delete cols[collection];
    _saveCollections(cols);
    renderCollections();
  }
};

/* ================================================================
   B) Wix Velo-style message handler (portable to real Wix site)
   ================================================================ */

$w('#configuratorEmbed').onMessage(async (event) => {
  const d = event.data;
  const embed = $w('#configuratorEmbed');

  switch (d.type) {
    case "ready":
      // Load saved admin config if any
      const { items: cfgs } = await wixData.query("Settings").find();
      if (cfgs.length > 0) {
        embed.postMessage({ type: "config-load", config: cfgs[cfgs.length - 1].config });
      }
      break;

    case "save-progress": {
      // Upsert: keep only latest progress
      await wixData.truncate("Progress");
      await wixData.insert("Progress", { state: d.state });
      break;
    }

    case "load-progress": {
      const { items } = await wixData.query("Progress").find();
      const state = items.length > 0 ? items[items.length - 1].state : null;
      embed.postMessage({ type: "progress-loaded", state });
      break;
    }

    case "clear-progress":
      await wixData.truncate("Progress");
      break;

    case "submit-config": {
      const item = await wixData.insert("Configurations", {
        config: d.config, sessionId: d.sessionId
      });
      embed.postMessage({ type: "config-saved", success: true, configId: item._id });
      break;
    }

    case "request-checkout":
      // Simulate checkout creation with a short delay
      setTimeout(() => {
        embed.postMessage({ type: "checkout-ready", checkoutUrl: "#mock-checkout-" + d.configId });
      }, 500);
      break;

    case "save-settings": {
      await wixData.truncate("Settings");
      await wixData.insert("Settings", { pricing: d.pricing, constraints: d.constraints });
      embed.postMessage({ type: "settings-saved" });
      break;
    }

    case "config-save": {
      await wixData.truncate("Settings");
      await wixData.insert("Settings", { config: d.config });
      break;
    }
  }
});

/* ================================================================
   C) Dashboard UI
   ================================================================ */

// --- Message log ---
function logMessage(dir, type, data) {
  const log = document.getElementById("log");
  const entry = document.createElement("div");
  entry.className = "log-entry " + dir;
  const time = new Date().toLocaleTimeString("de-CH", { hour12: false, fractionalSecondDigits: 1 });
  const arrow = dir === "incoming" ? "\u2B05" : "\u27A1";
  const payload = { ...data }; delete payload.channel; delete payload.type;
  const detail = Object.keys(payload).length ? " " + JSON.stringify(payload).slice(0, 120) : "";
  entry.innerHTML = '<span class="log-time">' + time + '</span>' + arrow + ' <span class="log-type">' + type + '</span>' + detail;
  log.prepend(entry);
  // Keep max 200 entries
  while (log.children.length > 200) log.lastChild.remove();
}

// --- Collection viewer ---
let activeCollection = null;

function renderCollections() {
  const cols = _loadCollections();
  const names = Object.keys(cols);
  const tabs = document.getElementById("collection-tabs");
  const view = document.getElementById("collection-view");

  // Auto-select first tab if current is gone
  if (!activeCollection || !cols[activeCollection]) activeCollection = names[0] || null;

  tabs.innerHTML = "";
  names.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name + " (" + cols[name].length + ")";
    btn.className = name === activeCollection ? "active" : "";
    btn.onclick = () => { activeCollection = name; renderCollections(); };
    tabs.appendChild(btn);
  });

  if (!activeCollection || !cols[activeCollection] || cols[activeCollection].length === 0) {
    view.innerHTML = '<div class="empty">No data</div>';
    return;
  }

  const items = cols[activeCollection];
  const keys = [...new Set(items.flatMap(i => Object.keys(i)))].filter(k => k !== "_id");
  // Put _id first
  const allKeys = ["_id", ...keys];

  let html = "<table><tr>";
  allKeys.forEach(k => { html += "<th>" + k + "</th>"; });
  html += "</tr>";
  items.forEach(item => {
    html += "<tr>";
    allKeys.forEach(k => {
      const v = item[k];
      const display = typeof v === "object" ? JSON.stringify(v).slice(0, 60) : String(v ?? "");
      html += "<td title='" + String(v ?? "").replace(/'/g, "&#39;") + "'>" + display + "</td>";
    });
    html += "</tr>";
  });
  html += "</table>";
  view.innerHTML = html;
}

// --- Control actions ---
function sendToApp(type, payload) {
  $w('#configuratorEmbed').postMessage({ type, ...payload });
}

function loadConfigFile() {
  const input = document.createElement("input");
  input.type = "file"; input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target.result);
        sendToApp("config-load", { config });
      } catch { alert("Invalid JSON file"); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearAll() {
  localStorage.removeItem(LS_PREFIX + "collections");
  renderCollections();
  iframe.src = iframe.src; // reload iframe
}

// Initial render
renderCollections();
</script>

</body>
</html>
```

**Step 2: Smoke test**

Run: `npm run test` (after Task 3)
- Should open browser at `http://localhost:5173/harness.html`
- Left panel shows CMS dashboard, right panel shows configurator in iframe
- Walk through wizard — message log should show all bridge messages
- Submit a config — `Configurations` collection should appear with the entry
- Switch to admin mode via button — mode changes in iframe
- "Clear All" resets everything

**Step 3: Commit**

```bash
git add harness.html
git commit -m "feat: add mock Wix harness with $w/wixData APIs"
```

---

### Task 3: Add npm script

**Files:**
- Modify: `package.json`

**Step 1: Add test script**

In `package.json`, add `"test"` to the `"scripts"` object:

```json
"test": "vite --open /harness.html"
```

**Step 2: Verify**

Run: `npm run test`
Expected: Vite dev server starts and browser opens at `/harness.html`

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add npm run test script for Wix dev harness"
```

---

## Verification Checklist

After all tasks:

1. `npm run dev` — open `localhost:5173` standalone, walk through wizard, verify progress persists across reload, verify checkout flow completes
2. `npm run test` — open harness, verify side-by-side layout, verify all message types appear in log, verify CMS collections populate, verify Clear All works
3. No changes to `Konfigurator.jsx`, `vite.config.js`, or any component files
