import type { AppConfig, Pricing, Constraints, FormState } from "./config";

/* ── Messages sent from iframe to parent ── */

export type OutboundMessageType =
  | "ready"
  | "resize"
  | "step-change"
  | "order-submit"
  | "config-save"
  | "save-progress"
  | "load-progress"
  | "clear-progress"
  | "submit-config"
  | "request-checkout"
  | "save-settings";

/* ── Messages received from parent ── */

export interface InboundMessageMap {
  "config-load": { config: AppConfig };
  "set-mode": { mode: string };
  "set-background": { color: string };
  "progress-loaded": { state: { form?: Partial<FormState>; phase?: string; wizardIndex?: number } | null };
  "admin-settings": { pricing?: Pricing; constraints?: Constraints };
  "settings-saved": Record<string, unknown>;
  "config-saved": { success: boolean; configId?: string; error?: string };
  "checkout-ready": { checkoutUrl: string };
  "checkout-error": { error: string };
}

export type InboundHandlers = {
  [K in keyof InboundMessageMap]?: (msg: InboundMessageMap[K]) => void;
};
