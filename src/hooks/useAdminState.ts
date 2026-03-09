import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { send } from "../bridge";
import { holzarten, OPTIONAL_STEPS } from "../data/constants";
import type { UseWizardStateReturn } from "./useWizardState";

const PANEL_STEP_MAP: Record<string, string | null> = {
  holzarten: 'holzart',
  oberflaechen: 'ausfuehrung',
  extras: 'extras',
  hakenMaterialien: 'ausfuehrung',
  darstellungen: 'darstellung',
  bergDisplay: null,
};

export interface UseAdminStateReturn {
  activeAdminSection: string;
  setActiveAdminSection: React.Dispatch<React.SetStateAction<string>>;
  saveStatus: "idle" | "saving" | "saved";
  previewStepOverride: string | null;
  handleOptionPanelChange: (panelId: string | null) => void;
  adminSummaries: Record<string, string>;
}

export default function useAdminState(ws: UseWizardStateReturn): UseAdminStateReturn {
  const [activeAdminSection, setActiveAdminSection] = useState("products");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [previewStepOverride, setPreviewStepOverride] = useState<string | null>(null);

  const handleOptionPanelChange = useCallback((panelId: string | null) => {
    setPreviewStepOverride(panelId ? (PANEL_STEP_MAP[panelId] ?? null) : null);
  }, []);

  useEffect(() => {
    if (activeAdminSection !== 'options') setPreviewStepOverride(null);
  }, [activeAdminSection]);

  const adminSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ws.isAdmin) return;
    if (adminSaveRef.current) clearTimeout(adminSaveRef.current);
    setSaveStatus("saving");
    adminSaveRef.current = setTimeout(() => {
      const config = ws.configManagerRef.current!.getConfig();
      send("config-save", { config });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800);
    return () => { if (adminSaveRef.current) clearTimeout(adminSaveRef.current); };
  }, [ws.isAdmin, ws.configManager.getConfig]);

  const adminSummaries = useMemo(() => ({
    products: `${ws.products.filter(p => p.enabled).length} aktiv, ${ws.products.filter(p => p.comingSoon).length} coming soon`,
    options: [
      `${ws.holzToggle.active.length} Holz`,
      `${ws.oberflaechenList.activeItems.length} Ofl.`,
      `${ws.extrasList.activeItems.length} Extras`,
    ].join(", "),
    produktwahl: (ws.texts.produktwahl?.heading as string) || "Dein Unikat gestalten",
    dimensions: `${ws.constr.MIN_W}–${ws.constr.MAX_W} × ${ws.constr.MIN_H}–${ws.constr.MAX_H} cm`,
    steps: `${OPTIONAL_STEPS.filter(s => ws.enabledSteps[s.id]).length} von ${OPTIONAL_STEPS.length} aktiv`,
    pricing: `Marge ${ws.pricing.margin}x (${Math.round((ws.pricing.margin - 1) * 100)}%)`,
    showroom: `${ws.showroom.presets.filter(p => p.enabled).length} Presets`,
    fusion: ws.fusionEnabled ? "Aktiviert" : "Deaktiviert",
    importExport: "JSON Import/Export",
  }), [ws.products, ws.holzToggle.active.length, ws.oberflaechenList.activeItems.length, ws.extrasList.activeItems.length,
    ws.constr, ws.enabledSteps, ws.pricing, ws.fusionEnabled, ws.showroom, ws.texts.produktwahl?.heading]);

  return {
    activeAdminSection, setActiveAdminSection,
    saveStatus, previewStepOverride,
    handleOptionPanelChange, adminSummaries,
  };
}
