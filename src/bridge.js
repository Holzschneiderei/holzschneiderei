const CHANNEL = "holzschneiderei";

function isIframed() {
  try { return window.self !== window.top; } catch { return true; }
}

/** Post a message to self so `listen()` handlers pick it up. */
function dispatch(type, payload = {}) {
  window.postMessage({ channel: CHANNEL, type, ...payload }, "*");
}

/** Handle bridge messages locally via localStorage when not in an iframe. */
function localFallback(type, payload) {
  switch (type) {
    case "save-progress":
      localStorage.setItem("hz:progress", JSON.stringify(payload.state));
      break;
    case "load-progress": {
      const raw = localStorage.getItem("hz:progress");
      const state = raw ? JSON.parse(raw) : null;
      dispatch("progress-loaded", { state });
      break;
    }
    case "clear-progress":
      localStorage.removeItem("hz:progress");
      break;
    case "submit-config": {
      const configId = "local-" + Date.now();
      localStorage.setItem("hz:config:" + configId, JSON.stringify(payload));
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
      localStorage.setItem("hz:config-save", JSON.stringify(payload));
      break;
    default:
      console.debug("[bridge:local]", type, payload);
  }
}

/** Send a typed message to the parent window */
export function send(type, payload = {}) {
  if (!isIframed()) return localFallback(type, payload);
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
