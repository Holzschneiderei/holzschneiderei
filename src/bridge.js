const CHANNEL = "holzschneiderei";

function isIframed() {
  try { return window.self !== window.top; } catch { return true; }
}

/** Send a typed message to the parent window */
export function send(type, payload = {}) {
  if (!isIframed()) return;
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
