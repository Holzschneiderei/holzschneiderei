# Responsive Web Application — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the garderobe wizard fully responsive across mobile (<640px), tablet (640-1024px), desktop (1024-1440px), and large (>1440px) screens using CSS container queries and a desktop side-rail navigation.

**Architecture:** Add CSS container queries to `GlobalStyles` targeting a container on the shell div. CSS class names applied via `className` alongside existing inline styles — inline styles remain the mobile baseline, `@container` rules override for larger sizes. A new `SideRail` component replaces the fixed bottom bar on desktop+. Admin layout switches to 2-column grid on desktop+.

**Tech Stack:** CSS Container Queries (`@container`), React inline styles + CSS classes, existing `S`/`t` token system.

---

### Task 1: Add container query infrastructure to GlobalStyles

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:1607-1618` (GlobalStyles component)

**Step 1: Update GlobalStyles to inject container query CSS**

Replace the current GlobalStyles component with one that includes container definitions and responsive class overrides. The shell gets `container-type: inline-size`.

```jsx
function GlobalStyles({ flow }) {
  return <style>{`
    @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideFromRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideFromLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideFromBottom{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideFromTop{from{opacity:0;transform:translateY(-40px)}to{opacity:1;transform:translateY(0)}}
    input:focus,select:focus,textarea:focus{outline:none;border-color:${t.brand} !important}
    input::placeholder,textarea::placeholder{color:${t.border}}

    /* ── Container query setup ── */
    .wz-shell{container-type:inline-size;container-name:shell}

    /* ── Tablet (≥640px) ── */
    @container shell (min-width:640px){
      .wz-main{padding:32px 24px 100px}
      .wz-card{max-width:640px}
      .wz-admin-card{max-width:640px}
      .wz-header-inner{max-width:700px}
      .wz-admin-header-inner{max-width:700px}
      .wz-berg-grid{grid-template-columns:1fr 1fr 1fr}
      .wz-wood-grid{grid-template-columns:1fr 1fr 1fr}
      .wz-footer-inner{width:min(920px,92vw)}
      .wz-config-title{font-size:clamp(22px,3vw,30px)}
      .wz-step-title{font-size:clamp(22px,3vw,28px)}
    }

    /* ── Desktop (≥1024px) ── */
    @container shell (min-width:1024px){
      .wz-main{padding:32px 32px 40px}
      .wz-card{max-width:720px}
      .wz-admin-card{max-width:960px}
      .wz-header-inner{max-width:960px}
      .wz-admin-header-inner{max-width:960px}
      .wz-berg-grid{grid-template-columns:1fr 1fr 1fr 1fr}
      .wz-extras-grid{grid-template-columns:1fr 1fr 1fr 1fr}
      .wz-admin-sections{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
      .wz-constraint-grid{grid-template-columns:1fr 1fr 1fr 1fr}
      .wz-bottom-bar{display:none}
      .wz-wizard-body{display:flex;gap:0}
      .wz-side-rail{display:flex}
      .wz-wizard-content{flex:1;min-width:0}
      .wz-step-title{font-size:clamp(24px,2.5vw,30px)}
    }

    /* ── Large (≥1440px) ── */
    @container shell (min-width:1440px){
      .wz-main{padding:40px 40px 48px}
      .wz-card{max-width:840px}
      .wz-admin-card{max-width:1100px}
      .wz-header-inner{max-width:1100px}
      .wz-admin-header-inner{max-width:1100px}
      .wz-wood-grid{grid-template-columns:1fr 1fr 1fr 1fr}
      .wz-pricing-grid{grid-template-columns:1fr 1fr 1fr 1fr}
    }

    /* ── Side rail (hidden on mobile/tablet, shown on desktop+) ── */
    .wz-side-rail{display:none}
    .wz-bottom-bar{display:flex}
  `}</style>;
}
```

**Step 2: Add `className="wz-shell"` to all shell divs**

Every `<div style={S.shell}>` needs `className="wz-shell"` added. There are 5 occurrences (search for `style={S.shell}`):
- Line ~336 (admin mode)
- Line ~388 (preview mode)
- Line ~473 (typen phase)
- Line ~638 (config phase)
- Line ~658 (wizard phase)

Also Shell component at line ~1584.

For each, change `<div style={S.shell}>` to `<div className="wz-shell" style={S.shell}>` (or `<div className="wz-shell" style={S.shell} ref={shellRef}>` where ref exists).

**Step 3: Verify**

Page loads without errors. No visual change on mobile-width viewport.

---

### Task 2: Add CSS class names to responsive grid elements

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — multiple locations where grids are rendered

**Step 1: Add `className` to berg grids**

Find all `style={S.bergGrid}` (or `style={S.bergGrid}`) and add `className="wz-berg-grid"`.

Customer-facing berg grid (~line 605):
```jsx
<div className="wz-berg-grid" style={S.bergGrid}>
```

Admin berg grid in AdminTypeDefaults (~line 1063):
```jsx
<div className="wz-berg-grid" style={S.bergGrid}>
```

**Step 2: Add `className` to wood grids**

Find `style={S.woodGrid}` and add `className="wz-wood-grid"`.

**Step 3: Add `className` to extras grids**

Find `style={S.extrasGrid}` and add `className="wz-extras-grid"`.

**Step 4: Add `className` to constraint grids**

Find `style={S.constraintGrid}` or `gridTemplateColumns: "1fr 1fr"` in AdminConstraints and add `className="wz-constraint-grid"`.

**Step 5: Add `className` to pricing grid**

Find the pricing grid in AdminPricing and add `className="wz-pricing-grid"`.

**Step 6: Verify**

Resize browser wide — grids should gain extra columns at breakpoints.

---

### Task 3: Add class names to main layout elements

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — main, card, header containers

**Step 1: Tag `<main>` elements**

All `<main style={S.main}>` get `className="wz-main"`:
```jsx
<main className="wz-main" style={S.main}>
```

For the preview mode main which has extra inline styles:
```jsx
<main className="wz-main" style={{ ...S.main, flexDirection: "column", alignItems: "center", gap: 24 }}>
```

**Step 2: Tag card divs**

Customer/wizard card divs get `className="wz-card"`:
```jsx
<div className="wz-card" style={S.card}>
```
or
```jsx
<div className="wz-card" style={{ ...S.card, animation: shake ? "shake .4s" : undefined }}>
```

Admin card div gets `className="wz-admin-card"`:
```jsx
<div className="wz-admin-card" style={S.card}>
```

**Step 3: Tag header inner divs**

Customer headers `style={S.headerInner}` → `className="wz-header-inner"`.

Admin headers `style={S.adminHeaderInner}` → `className="wz-admin-header-inner"`.

**Step 4: Tag titles**

`style={S.configTitle}` or `style={{ ...S.configTitle, ... }}` → add `className="wz-config-title"`.

`style={S.stepTitle}` → add `className="wz-step-title"`.

**Step 5: Tag footer inner**

`style={S.footerInner}` → add `className="wz-footer-inner"`.

**Step 6: Verify**

Resize browser — card and main should widen at tablet+. Headers should expand.

---

### Task 4: Add class names to bottom bar

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:687` (wizard nav)

**Step 1: Tag the bottom bar**

Change:
```jsx
<nav style={S.bottomBar}>
```
To:
```jsx
<nav className="wz-bottom-bar" style={S.bottomBar}>
```

**Step 2: Verify**

On desktop-width viewport, bottom bar should disappear (hidden via CSS). On mobile/tablet it stays visible.

---

### Task 5: Create SideRail component

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — add new component before the main export

**Step 1: Write the SideRail component**

Insert after the `Footer` component (before `GlobalStyles`):

```jsx
function SideRail({ steps, stepData, currentIndex, onNavigate, onBack, onSubmit, isFirst, isLast }) {
  return (
    <nav className="wz-side-rail" style={{ width: 220, flexShrink: 0, position: "sticky", top: 70, alignSelf: "flex-start", display: "none", flexDirection: "column", gap: 0, padding: "24px 0 24px 0", borderRight: `1px solid ${t.border}`, marginRight: 32, height: "fit-content" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: ".1em", textTransform: "uppercase", padding: "0 16px 12px", borderBottom: `1px solid ${t.border}` }}>Schritte</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, padding: "8px 0" }}>
        {steps.map((id, i) => {
          const step = stepData.find((s) => s.id === id);
          const isCurrent = i === currentIndex;
          const isPast = i < currentIndex;
          const label = step ? step.label : (id === "kontakt" ? "Kontakt" : "Übersicht");
          const icon = step ? step.icon : (id === "kontakt" ? "📇" : "📋");
          return (
            <button key={id} onClick={() => onNavigate(i)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: isCurrent ? "rgba(31,59,49,.06)" : "transparent", border: "none", borderLeft: `3px solid ${isCurrent ? t.brand : "transparent"}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all .2s", width: "100%" }}>
              <span style={{ fontSize: 16, opacity: isPast ? 0.5 : 1 }}>{icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? t.brand : isPast ? t.muted : t.text, letterSpacing: ".02em" }}>{label}</div>
              </div>
              {isPast && <span style={{ fontSize: 11, color: t.brand }}>✓</span>}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "12px 16px 0", borderTop: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        <button onClick={onBack} style={{ ...S.navBtn, ...S.navBtnOutline, width: "100%", height: 36, fontSize: 11 }}>
          {isFirst ? "← Typ ändern" : "← Zurück"}
        </button>
        <button onClick={isLast ? onSubmit : () => onNavigate(currentIndex + 1)} style={{ ...S.navBtn, ...S.navBtnSolid, width: "100%", height: 36, fontSize: 11 }}>
          {isLast ? "Absenden ✓" : "Weiter →"}
        </button>
      </div>
    </nav>
  );
}
```

**Step 2: Verify**

Component exists, not yet wired. No visual change.

---

### Task 6: Wire SideRail into wizard phase

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:657-698` (wizard phase return)

**Step 1: Wrap main content in a flex container with SideRail**

Change the wizard phase layout from:

```jsx
<main style={S.main}>
  <div style={{ ...S.card, animation: shake ? "shake .4s" : undefined }}>
    ...
  </div>
</main>

<nav style={S.bottomBar}>
  ...
</nav>
```

To:

```jsx
<main className="wz-main" style={S.main}>
  <div className="wz-wizard-body" style={{ width: "100%", maxWidth: 720, display: "flex" }}>
    <SideRail
      steps={activeSteps}
      stepData={OPTIONAL_STEPS}
      currentIndex={wizardIndex}
      onNavigate={(i) => { setNavDir(i > wizardIndex ? 1 : -1); setWizardIndex(i); setAnimKey((k) => k + 1); }}
      onBack={wizardIndex === 0 ? () => setPhase("typen") : prev}
      onSubmit={doSubmit}
      isFirst={wizardIndex === 0}
      isLast={currentStepId === "uebersicht"}
    />
    <div className="wz-wizard-content wz-card" style={{ ...S.card, animation: shake ? "shake .4s" : undefined }}>
      <div style={S.wizardTopBar}>
        <span style={{ fontSize: 12, color: t.muted }}>{typChip}</span>
        <FlowPicker flow={flow} onChange={setFlow} />
      </div>
      <div key={animKey} style={{ animation: `${animName} .38s cubic-bezier(.22,1,.36,1)` }}>
        {currentStepId === "holzart" && <StepHolzart form={form} set={set} errors={errors} holzarten={activeHolzarten} />}
        {currentStepId === "masse" && <StepMasse form={form} set={set} errors={errors} limits={limits} constr={constr} dimConfig={dimConfig} />}
        {currentStepId === "ausfuehrung" && <StepAusfuehrung form={form} set={set} limits={limits} constr={constr} />}
        {currentStepId === "extras" && <StepExtras form={form} toggleExtra={toggleExtra} set={set} />}
        {currentStepId === "kontakt" && <StepKontakt form={form} set={set} errors={errors} />}
        {currentStepId === "uebersicht" && <StepUebersicht form={form} set={set} errors={errors} skippedSteps={skippedSteps} pricing={pricing} />}
      </div>
    </div>
  </div>
</main>

<nav className="wz-bottom-bar" style={S.bottomBar}>
  <button onClick={wizardIndex === 0 ? () => setPhase("typen") : prev} style={{ ...S.navBtn, ...S.navBtnOutline }}>
    {wizardIndex === 0 ? "← Zurück" : "← Zurück"}
  </button>
  <div style={S.dots}>{activeSteps.map((_, i) => <div key={i} style={{ ...S.dot, background: i <= wizardIndex ? t.brand : t.border }} />)}</div>
  {currentStepId !== "uebersicht"
    ? <button onClick={next} style={{ ...S.navBtn, ...S.navBtnSolid }}>Weiter →</button>
    : <button onClick={doSubmit} style={{ ...S.navBtn, ...S.navBtnSolid }}>Absenden ✓</button>}
</nav>
```

**Step 2: Update `wz-wizard-body` max-width in CSS**

In GlobalStyles desktop rule, add:
```css
.wz-wizard-body{max-width:960px}
```
In large rule:
```css
.wz-wizard-body{max-width:1080px}
```

**Step 3: Verify**

- Mobile: side rail hidden, bottom bar visible, layout unchanged
- Desktop: side rail visible on left with step names, bottom bar hidden, content fills remaining space
- Click step names in rail → navigates to that step
- Back/next buttons in rail work correctly

---

### Task 7: Make admin layout 2-column on desktop

**Files:**
- Modify: `app/garderobe-wizard (3).jsx:334-383` (admin mode render)

**Step 1: Wrap collapsible sections in a grid container**

Change the admin card content from a flat list of CollapsibleSections to wrapping them in a `className="wz-admin-sections"` div:

```jsx
<div className="wz-admin-card" style={S.card}>
  <Fade>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <h1 className="wz-config-title" style={{ ...S.configTitle, fontSize: "clamp(18px,3vw,26px)" }}>Admin-Konfiguration</h1>
      <p style={{ fontSize: 13, color: t.muted }}>Produktparameter, Schritte und Preise verwalten</p>
    </div>
    <div className="wz-admin-sections">
      <CollapsibleSection ...>...</CollapsibleSection>
      <CollapsibleSection ...>...</CollapsibleSection>
      ...all sections...
    </div>
  </Fade>
</div>
```

The `wz-admin-sections` class already has the desktop CSS rule:
```css
.wz-admin-sections{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
```

On mobile/tablet it will be default (block layout, sections stack naturally).

**Step 2: Verify**

- Mobile: sections stack vertically as before
- Desktop: sections arrange in 2-column grid, shorter sections pair beside taller ones
- Collapsing/expanding still works

---

### Task 8: Tag remaining responsive elements and polish

**Files:**
- Modify: `app/garderobe-wizard (3).jsx` — various locations

**Step 1: Add wz-shell className to Shell component**

In the `Shell` component (~line 1583), change:
```jsx
return (<div style={S.shell} ref={r}>
```
To:
```jsx
return (<div className="wz-shell" style={S.shell} ref={r}>
```

**Step 2: Remove bottom padding on desktop**

The `S.main` has `padding: "24px 16px 100px"` — the 100px is for the fixed bottom bar. On desktop where the bottom bar is hidden, the CSS override already sets `padding: 32px 32px 40px`.

**Step 3: Adjust admin header max-width**

The `S.adminHeaderInner` has `maxWidth: 600`. Add className so it expands on desktop:
```jsx
<div className="wz-admin-header-inner" style={S.adminHeaderInner}>
```

And the customer header:
```jsx
<div className="wz-header-inner" style={S.headerInner}>
```

**Step 4: Verify across all breakpoints**

- **Mobile (<640px)**: Everything looks identical to current. Fixed bottom bar, 520px card, 2-col grids.
- **Tablet (640-1024px)**: Card widens to 640px, berg/wood grids go 3-col, bottom bar still visible.
- **Desktop (1024-1440px)**: Card 720px, side rail appears, bottom bar hides, admin gets 2-col layout, berg grid 4-col, extras 4-col.
- **Large (>1440px)**: Card 840px, admin 1100px, more breathing room, wood grid 4-col, pricing grid 4-col.

---

### Task 9: Final verification

**Step 1: Test mobile (Chrome DevTools → iPhone 14)**
- All existing functionality works
- No horizontal overflow
- Bottom bar and dots visible
- Grids are 2-col

**Step 2: Test tablet (Chrome DevTools → iPad)**
- Card wider, grids 3-col
- Bottom bar still present
- Admin sections stack

**Step 3: Test desktop (resize to ~1200px)**
- Side rail appears with step names
- Bottom bar disappears
- Admin sections go 2-col
- Berg grid 4-col

**Step 4: Test large (resize to ~1500px)**
- Everything breathes more
- Admin card very wide (1100px)
- All grids at max columns

**Step 5: Test side rail navigation**
- Click each step name → wizard navigates
- Current step highlighted with green bar
- Past steps show checkmark
- Back/next buttons in rail work
- On first step, back says "Typ ändern"
- On last step, forward says "Absenden"

**Step 6: Test mode switching**
- Admin → Vorschau → Kunde — all modes render correctly at all sizes
- Phone frame in Vorschau stays 375px regardless of viewport
