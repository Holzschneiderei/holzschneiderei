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
