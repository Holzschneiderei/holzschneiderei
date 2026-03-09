import { lazy, Suspense } from "react";
import { clearProgress } from "../bridge";
import { DEFAULT_FORM, holzarten, OPTIONAL_STEPS } from "../data/constants";
import { WizardProvider } from "../context/WizardContext";
import PhaseTypen from "./phases/PhaseTypen";
import PhaseWizard from "./phases/PhaseWizard";
import StepAusfuehrung from "./steps/StepAusfuehrung";
import StepDarstellung from "./steps/StepDarstellung";
import StepExtras from "./steps/StepExtras";
import StepHolzart from "./steps/StepHolzart";
import type { UseWizardStateReturn } from "../hooks/useWizardState";
import type { UseAdminStateReturn } from "../hooks/useAdminState";
import type { OptionPanel } from "./admin/AdminOptions";

const AdminHeader = lazy(() => import("./admin/AdminHeader"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminTypeDefaults = lazy(() => import("./admin/AdminTypeDefaults"));
const AdminBergDisplay = lazy(() => import("./admin/AdminBergDisplay"));
const AdminConstraints = lazy(() => import("./admin/AdminConstraints"));
const AdminWoodSelection = lazy(() => import("./admin/AdminWoodSelection"));
const AdminOptionList = lazy(() => import("./admin/AdminOptionList"));
const AdminDimensions = lazy(() => import("./admin/AdminDimensions"));
const AdminSteps = lazy(() => import("./admin/AdminSteps"));
const AdminPricing = lazy(() => import("./admin/AdminPricing"));
const AdminProducts = lazy(() => import("./admin/AdminProducts"));
const AdminImportExport = lazy(() => import("./admin/AdminImportExport"));
const AdminFusion = lazy(() => import("./admin/AdminFusion"));
const AdminWithPreview = lazy(() => import("./admin/AdminWithPreview"));
const AdminOptions = lazy(() => import("./admin/AdminOptions"));
const AdminProduktwahl = lazy(() => import("./admin/AdminProduktwahl"));
const AdminShowroom = lazy(() => import("./admin/AdminShowroom"));
const FinancialSummary = lazy(() => import("./admin/FinancialSummary"));

interface AdminModeProps {
  ws: UseWizardStateReturn;
  admin: UseAdminStateReturn;
}

export default function AdminMode({ ws, admin }: AdminModeProps) {
  const optionPanels: OptionPanel[] = [
    { id: 'holzarten', icon: 'H', label: 'Holzarten', categoryKey: 'holzarten',
      summary: ws.categoryVisibility.holzarten ? `${ws.holzToggle.active.length} von ${holzarten.length} aktiv` : "Ausgeblendet",
      content: <AdminWoodSelection enabledHolzarten={ws.holzToggle.enabled} toggleHolz={ws.holzToggle.toggle} activeCount={ws.holzToggle.active.length} /> },
    { id: 'oberflaechen', icon: 'O', label: 'Oberflächen', categoryKey: 'oberflaechen',
      summary: ws.categoryVisibility.oberflaechen ? `${ws.oberflaechenList.activeItems.length} von ${ws.oberflaechenList.items.length} aktiv` : "Ausgeblendet",
      content: <AdminOptionList items={ws.oberflaechenList.items} onToggle={ws.oberflaechenList.toggleItem} onAdd={ws.oberflaechenList.addItem} onRemove={ws.oberflaechenList.removeItem} onUpdate={ws.oberflaechenList.updateItem} onReorder={ws.oberflaechenList.reorderItems} addPlaceholder="Neue Oberfläche..." /> },
    { id: 'extras', icon: 'X', label: 'Extras', categoryKey: 'extras',
      summary: ws.categoryVisibility.extras ? `${ws.extrasList.activeItems.length} von ${ws.extrasList.items.length} aktiv` : "Ausgeblendet",
      content: <AdminOptionList items={ws.extrasList.items} onToggle={ws.extrasList.toggleItem} onAdd={ws.extrasList.addItem} onRemove={ws.extrasList.removeItem} onUpdate={ws.extrasList.updateItem} onReorder={ws.extrasList.reorderItems} addPlaceholder="Neues Extra..." renderMeta={(item) => item.meta?.icon ? <span className="text-sm">{item.meta.icon as string}</span> : null} /> },
    { id: 'hakenMaterialien', icon: 'K', label: 'Hakenmaterial', categoryKey: 'hakenMaterialien',
      summary: ws.categoryVisibility.hakenMaterialien ? `${ws.hakenMatList.activeItems.length} von ${ws.hakenMatList.items.length} aktiv` : "Ausgeblendet",
      content: <AdminOptionList items={ws.hakenMatList.items} onToggle={ws.hakenMatList.toggleItem} onAdd={ws.hakenMatList.addItem} onRemove={ws.hakenMatList.removeItem} onUpdate={ws.hakenMatList.updateItem} onReorder={ws.hakenMatList.reorderItems} addPlaceholder="Neues Material..." /> },
    { id: 'darstellungen', icon: 'D', label: 'Darstellungen', categoryKey: 'darstellungen',
      summary: ws.categoryVisibility.darstellungen ? `${ws.darstellungList.activeItems.length} von ${ws.darstellungList.items.length} aktiv` : "Ausgeblendet",
      content: <AdminOptionList items={ws.darstellungList.items} onToggle={ws.darstellungList.toggleItem} onAdd={ws.darstellungList.addItem} onRemove={ws.darstellungList.removeItem} onUpdate={ws.darstellungList.updateItem} onReorder={ws.darstellungList.reorderItems} addPlaceholder="Neue Darstellung..." /> },
    { id: 'bergDisplay', icon: 'B', label: 'Bergmotiv',
      summary: `${ws.bergDisplay.mode === "relief" ? "Relief" : "Clean"} · ${[ws.bergDisplay.showName && "Name", ws.bergDisplay.showHeight && "Höhe", ws.bergDisplay.showRegion && "Region"].filter(Boolean).join(", ") || "Keine Labels"}`,
      content: <AdminBergDisplay bergDisplay={ws.bergDisplay} setBergDisp={ws.setBergDisp} /> },
  ];

  const adminSectionContent: Record<string, { title: string; desc: string; content: React.ReactNode; after?: React.ReactNode }> = {
    products: {
      title: "Produkte & Typen", desc: "Produkte verwalten, Typ-Vorgaben und Schriftzug/Berg konfigurieren",
      content: (
        <>
          <AdminProducts products={ws.products} setProducts={ws.setProducts} />
          <div className="border-t border-border my-5" />
          <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted mb-3">Produkt-Typ Vorgaben</h3>
          <AdminTypeDefaults form={ws.form} set={ws.set} constr={ws.constr} limits={ws.limits} enabledSchriftarten={ws.schriftToggle.enabled} toggleSchriftart={ws.schriftToggle.toggle} enabledBerge={ws.bergToggle.enabled} toggleBerg={ws.bergToggle.toggle} bergDisplay={ws.bergDisplay} />
        </>
      ),
    },
    options: {
      title: "Optionen", desc: "Holzarten, Oberflächen, Extras und weitere Optionen verwalten",
      content: <AdminOptions panels={optionPanels} categoryVisibility={ws.categoryVisibility} onToggleCategory={ws.toggleCategory} onPanelChange={admin.handleOptionPanelChange} />,
    },
    produktwahl: {
      title: "Produktwahl", desc: "Texte auf der Startseite des Konfigurators anpassen",
      content: <AdminProduktwahl texts={ws.texts} setTexts={ws.setTexts} />,
    },
    dimensions: {
      title: "Masse & Grenzen", desc: "Abmessungen, Eingabemodi und Produktgrenzen",
      content: (
        <>
          <AdminConstraints constr={ws.constr} setConstrVal={ws.setConstrVal} limits={ws.limits} />
          <div className="border-t border-border my-5" />
          <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted mb-3">Eingabemodus & Presets</h3>
          <AdminDimensions constr={ws.constr} dimConfig={ws.dimConfig} setDim={ws.setDim} addPreset={ws.addPreset} removePreset={ws.removePreset} />
        </>
      ),
    },
    steps: { title: "Wizard-Schritte", desc: "Schritte aktivieren/deaktivieren und Reihenfolge", content: <AdminSteps enabledSteps={ws.enabledSteps} toggleStep={ws.toggleStep} stepOrder={ws.stepOrder} setStepOrder={ws.setStepOrder} /> },
    pricing: { title: "Preiskalkulation", desc: "Material-, Arbeits- und Extras-Kosten, Marge", content: <AdminPricing pricing={ws.pricing} setPricing={ws.setPricing} oberflaechenList={ws.oberflaechenList} extrasList={ws.extrasList} hakenMatList={ws.hakenMatList} />, after: <div className="mt-5"><FinancialSummary form={ws.form} pricing={ws.pricing} activeProduct={ws.activeProduct ?? undefined} /></div> },
    showroom: {
      title: "Showroom",
      desc: "Vorkonfigurierte Produkte als CTA-Karten auf der Startseite",
      content: <AdminShowroom showroom={ws.showroom} setShowroom={ws.setShowroom} products={ws.products} />,
    },
    fusion: { title: "Fusion 360", desc: "Automatische Script-Generierung für die Werkstatt", content: <AdminFusion enabled={ws.fusionEnabled} onToggle={ws.setFusionEnabled} /> },
    importExport: { title: "Import / Export", desc: "Konfiguration als JSON-Datei sichern oder laden", content: <AdminImportExport onExport={ws.configManager.exportParams} onImport={ws.configManager.importParams} /> },
  };

  const previewContent = (
    <WizardProvider value={ws.wizardCtx}>
      <div className="text-xs font-bold tracking-widest uppercase text-muted text-center py-2 bg-[rgba(31,59,49,0.04)]">Kunden-Ansicht</div>
      {admin.previewStepOverride && ws.isAdmin ? (
        <div className="p-3">
          <div className="text-[10px] font-bold tracking-[0.06em] uppercase text-muted text-center mb-3 pb-2 border-b border-border">
            {OPTIONAL_STEPS.find(s => s.id === admin.previewStepOverride)?.icon}{" "}
            {OPTIONAL_STEPS.find(s => s.id === admin.previewStepOverride)?.label || admin.previewStepOverride}
          </div>
          {admin.previewStepOverride === 'holzart' && <StepHolzart />}
          {admin.previewStepOverride === 'ausfuehrung' && <StepAusfuehrung />}
          {admin.previewStepOverride === 'extras' && <StepExtras />}
          {admin.previewStepOverride === 'darstellung' && <StepDarstellung />}
        </div>
      ) : (
        <>
          {ws.phase === "typen" && (
            <div className="p-3">
              <PhaseTypen startWizard={ws.startWizard} startPreset={ws.startPreset} triggerShake={ws.triggerShake} setErrors={ws.setErrors} />
            </div>
          )}
          {ws.phase === "wizard" && (
            <div className="p-3">
              <PhaseWizard
                activeSteps={ws.activeSteps} wizardIndex={ws.wizardIndex} currentStepId={ws.currentStepId}
                setPhase={ws.setPhase} prev={ws.prev} next={ws.next} doSubmit={ws.doSubmit} submitting={ws.submitting} checkoutError={ws.checkoutError}
                navDir={ws.navDir} animKey={ws.animKey} shake={ws.shake}
                setNavDir={ws.setNavDir} setWizardIndex={ws.setWizardIndex} setAnimKey={ws.setAnimKey}
                compact
              />
            </div>
          )}
          {ws.phase === "done" && (
            <div className="text-center p-5">
              <div className="text-4xl mb-3">{"\u2713"}</div>
              <p className="text-[13px] text-muted">Vielen Dank!</p>
              <button className="inline-flex items-center justify-center h-8 px-3 text-[10px] font-body font-bold tracking-normal uppercase rounded-sm cursor-pointer select-none whitespace-nowrap text-text bg-transparent border border-border mt-3" onClick={() => { ws.setPhase("typen"); ws.setForm({ ...DEFAULT_FORM }); ws.setConfigId(null); ws.setCheckoutError(null); ws.setSubmitting(false); clearProgress(); }}>Neu starten</button>
            </div>
          )}
        </>
      )}
    </WizardProvider>
  );

  const section = adminSectionContent[admin.activeAdminSection]!;
  const adminPanel = (
    <AdminLayout activeSection={admin.activeAdminSection} onSectionChange={admin.setActiveAdminSection} summaries={admin.adminSummaries}>
      <div key={admin.activeAdminSection} className="admin-section-animate">
        <div className="admin-section-header">
          <h2 className="admin-section-title">{section.title}</h2>
          <p className="admin-section-desc">{section.desc}</p>
        </div>
        <div className="admin-card">
          {section.content}
        </div>
        {section.after}
      </div>
    </AdminLayout>
  );

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <div className="wz-shell min-h-screen flex flex-col bg-[var(--wz-bg,transparent)] text-text overflow-y-auto font-body text-base leading-relaxed tracking-[0.06em] antialiased">
        <AdminHeader saveStatus={admin.saveStatus} />
        <AdminWithPreview
          adminContent={adminPanel}
          previewContent={previewContent}
        />
      </div>
    </Suspense>
  );
}
