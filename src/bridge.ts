import type { Constraints, Pricing } from "./types/config";
import type { InboundHandlers } from "./types/bridge";

const CHANNEL = "holzschneiderei";
const PARENT_ORIGIN = "https://holzschneiderei.ch";

function isIframed(): boolean {
  try { return window.self !== window.top; } catch { return true; }
}

/**
 * Strip non-serializable values (functions, symbols, circular refs) so the
 * payload is safe for `postMessage` / structured-clone.  Falls back to the
 * raw object if it is already plain JSON.
 */
function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; }
}

function dispatch(type: string, payload: Record<string, unknown> = {}): void {
  window.postMessage({ channel: CHANNEL, type, ...payload }, window.location.origin);
}

function localFallback(type: string, payload: Record<string, unknown>): void {
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

export function send(type: string, payload: Record<string, unknown> = {}): void {
  if (!isIframed()) return localFallback(type, payload);
  const msg = sanitize({ channel: CHANNEL, type, ...payload });
  try {
    window.parent.postMessage(msg, PARENT_ORIGIN);
  } catch (err) {
    console.warn("[bridge] postMessage failed:", err);
  }
}

export function listen(handlers: InboundHandlers): () => void {
  const onMessage = (e: MessageEvent) => {
    if (e.origin !== PARENT_ORIGIN && e.origin !== window.location.origin) return;
    const d = e.data;
    if (!d || d.channel !== CHANNEL) return;
    const handler = handlers[d.type as keyof InboundHandlers];
    if (handler) (handler as (msg: Record<string, unknown>) => void)(d);
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}

export function autoResize(): () => void {
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

export function saveProgress(state: Record<string, unknown>): void {
  send("save-progress", { state });
}

export function loadProgress(): void {
  send("load-progress");
}

export function clearProgress(): void {
  send("clear-progress");
}

export function submitConfig(config: Record<string, unknown>, sessionId: string): void {
  send("submit-config", { config, sessionId });
}

export function requestCheckout(configId: string, price: number, summary: string): void {
  send("request-checkout", { configId, price, summary });
}

export function saveSettings(pricing: Pricing, constraints: Constraints): void {
  send("save-settings", { pricing, constraints } as unknown as Record<string, unknown>);
}
