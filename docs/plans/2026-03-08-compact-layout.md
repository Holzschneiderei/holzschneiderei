# Compact Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce vertical space usage across the entire configurator so content fits without scrolling on most viewports. Add polished image transition animations.

**Architecture:** Tighten spacing (padding, margins, gaps), reduce image aspect ratios, and add subtle fade+movement transitions to image carousel. CSS/className tweaks across 5 files.

**Tech Stack:** React, Tailwind CSS, CSS container queries

---

## Space Budget

Current vertical waste (approximate at 520px content width):
- Image carousel 3:2 ratio: ~347px → 16:9 would be ~293px (**-54px**)
- PhaseTypen header `mb-10`: 40px → `mb-6`: 24px (**-16px**)
- StepHeader `mb-7`: 28px → `mb-4`: 16px (**-12px**)
- PhaseTypen "Weiter" button `mt-8`: 32px → `mt-5`: 20px (**-12px**)
- Wizard step header bar `mb-3` → `mb-2` (**-4px**)
- CSS `cq-main-md` padding 36px/100px → 24px/72px (**-40px**)
- CSS `cq-main-lg` padding 40px/48px → 28px/36px (**-24px**)
- Inline main padding `py-6 pb-24` → `py-4 pb-20` (**-24px**)

**Total savings: ~186px** — significant on a 667px mobile viewport.

---

### Task 1: Image carousel — 16:9 ratio + fade/move transitions

**Files:**
- Modify: `src/components/ui/ImageCarousel.jsx`

**Step 1: Rewrite ImageCarousel with new ratio and animations**

Replace the carousel with 16:9 aspect ratio and add subtle fade + scale transition on image change. Active image fades in and scales from 1.04 to 1.0 (gentle zoom-out), outgoing image fades out and scales to 0.97 (gentle shrink). This creates a smooth "breathing" feel.

```jsx
import { useState, useEffect, useCallback } from "react";

export default function ImageCarousel({ images, interval = 4000, className = "" }) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState({});
  const count = images.length;

  const advance = useCallback(() => {
    setCurrent((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(advance, interval);
    return () => clearInterval(id);
  }, [advance, interval, count]);

  if (!count) return null;

  return (
    <div className={`relative overflow-hidden rounded ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {images.map((src, i) => {
          const isActive = i === current && loaded[i];
          return (
            <img
              key={src}
              src={src}
              alt=""
              onLoad={() => setLoaded((prev) => ({ ...prev, [i]: true }))}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? "scale(1)" : "scale(1.04)",
                transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
              }}
              loading={i === 0 ? "eager" : "lazy"}
            />
          );
        })}
        {!loaded[current] && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(31,59,49,0.04)]">
            <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin" />
          </div>
        )}
      </div>
      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Bild ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full border-none cursor-pointer transition-all duration-300 ${
                i === current
                  ? "bg-brand scale-125"
                  : "bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify visually**

Run: `npm run dev`
- Open PhaseTypen, select a product with preview images
- Confirm 16:9 ratio (wider, less tall)
- Watch auto-advance: images should fade in with a subtle zoom-out effect
- Click dots: same smooth transition
- Check on mobile and desktop widths

**Step 3: Commit**

```
git add src/components/ui/ImageCarousel.jsx
git commit -m "style: 16:9 carousel with fade+scale transitions"
```

---

### Task 2: StepHeader — reduce bottom margin

**Files:**
- Modify: `src/components/ui/StepHeader.jsx:3`

**Step 1: Tighten margin**

Change `mb-7` to `mb-4`:

```jsx
<div className="mb-4">
```

**Step 2: Verify visually**

Check several wizard steps (Holzart, Masse, Extras, Kontakt, Uebersicht). Headers should still feel separated from content but tighter.

**Step 3: Commit**

```
git add src/components/ui/StepHeader.jsx
git commit -m "style: reduce step header bottom margin"
```

---

### Task 3: PhaseTypen — compact header and button spacing

**Files:**
- Modify: `src/components/phases/PhaseTypen.jsx:53,218`

**Step 1: Reduce header margin**

Line 53, change `mb-10` to `mb-6`:

```jsx
<div className="text-center mb-6">
```

**Step 2: Reduce "Weiter" button top margin**

Line 218, change `mt-8` to `mt-5`:

```jsx
<div className="flex justify-center mt-5">
```

**Step 3: Verify visually**

Check PhaseTypen page on mobile and desktop. Header should still breathe but feel tighter.

**Step 4: Commit**

```
git add src/components/phases/PhaseTypen.jsx
git commit -m "style: compact PhaseTypen header and button spacing"
```

---

### Task 4: Wizard header bar — reduce margin

**Files:**
- Modify: `src/components/phases/PhaseWizard.jsx:75`

**Step 1: Tighten step header bar**

Line 75, change `mb-3` to `mb-2`:

```jsx
<div className="flex justify-between items-center px-0 py-2.5 mb-2 border-b border-border gap-3">
```

**Step 2: Commit**

```
git add src/components/phases/PhaseWizard.jsx
git commit -m "style: reduce wizard header bar bottom margin"
```

---

### Task 5: Main padding — reduce in inline classes

**Files:**
- Modify: `src/Konfigurator.jsx:562,576`
- Modify: `src/components/phases/PhaseWizard.jsx:65`

**Step 1: PhaseTypen main padding**

`Konfigurator.jsx` line 562, change `py-6 pb-24` to `py-4 pb-20`:

```jsx
<main className="flex-1 flex justify-center px-4 py-4 pb-20 cq-main-md cq-main-lg cq-main-xl">
```

**Step 2: PhaseDone main padding**

`Konfigurator.jsx` line 576, same change:

```jsx
<main className="flex-1 flex justify-center px-4 py-4 pb-20 cq-main-md cq-main-lg cq-main-xl">
```

**Step 3: PhaseWizard main padding**

`PhaseWizard.jsx` line 65, change `py-6 pb-28` to `py-4 pb-24`:

```jsx
<main id="wizard-main" className="flex-1 flex justify-center px-4 py-4 pb-24 cq-main-md cq-main-lg cq-main-xl">
```

**Step 4: Commit**

```
git add src/Konfigurator.jsx src/components/phases/PhaseWizard.jsx
git commit -m "style: reduce main content area padding"
```

---

### Task 6: CSS container query padding — reduce responsive padding

**Files:**
- Modify: `src/konfigurator.css:634,650,664`

**Step 1: Tighten cq-main-md**

Line 634, change `padding: 36px 28px 100px` to `padding: 24px 28px 72px`:

```css
.cq-main-md { padding: 24px 28px 72px; }
```

**Step 2: Tighten cq-main-lg**

Line 650, change `padding: 40px 36px 48px` to `padding: 28px 36px 36px`:

```css
.cq-main-lg { padding: 28px 36px 36px; }
```

**Step 3: Tighten cq-main-xl**

Line 664, change `padding: 48px 48px 56px` to `padding: 36px 48px 44px`:

```css
.cq-main-xl { padding: 36px 48px 44px; }
```

**Step 4: Verify all viewports**

Resize browser through breakpoints (< 640px, 640-1024px, 1024-1440px, 1440px+). Content should feel tighter but not cramped. Bottom nav on mobile should not overlap content.

**Step 5: Commit**

```
git add src/konfigurator.css
git commit -m "style: reduce container query responsive padding"
```

---

### Task 7: Final verification

**Step 1: Full walkthrough**

Run `npm run dev` and walk through the entire flow:
1. PhaseTypen — select a product, check image + cards fit
2. Each wizard step — verify nothing overlaps or feels cramped
3. StepUebersicht — check summary + pricing card
4. Resize from 375px to 1440px+ — confirm all breakpoints

**Step 2: Squash commit (optional)**

If all changes should be a single commit for the PR, squash. Otherwise ship as-is.
