/**
 * Main orchestrator: generates a complete Fusion 360 Python script
 * from configurator form data.
 */

import type { FormState, Product, Constraints, Pricing, PriceBreakdown } from '../types/config';
import { header } from './fusion-templates/header';
import { board } from './fusion-templates/board';
import { hooks } from './fusion-templates/hooks';
import { shelf } from './fusion-templates/shelf';
import { engraving } from './fusion-templates/engraving';
import { assembly } from './fusion-templates/assembly';
import { convertSvgPath } from './svg-path-converter';
import { berge } from '../data/constants';
import { hooksFor, computePrice } from '../data/pricing';

/** FormState extended with a runtime-only _configId field */
type FormWithConfigId = FormState & { _configId?: string };

interface GenerateOpts {
  form: FormWithConfigId;
  activeProduct: Product;
  constr: Constraints;
  pricing: Pricing;
  price: PriceBreakdown;
}

export async function generateFusionScript({ form, activeProduct, constr, pricing, price }: GenerateOpts): Promise<string> {
  const breite = parseInt(form.breite) || 80;
  const hoehe = parseInt(form.hoehe) || 180;
  const tiefe = parseInt(form.tiefe) || 35;
  const hookCount = parseInt(form.haken) || hooksFor(breite, constr);
  const customerName = `${form.vorname} ${form.nachname}`.trim();

  const parts: string[] = [];

  // 1. Header
  parts.push(header({
    customerName,
    configId: form._configId || 'draft',
    productLabel: activeProduct?.label || 'Garderobe',
    holzart: form.holzart,
    breite, hoehe, tiefe,
  }));

  // 2. Board body
  parts.push(board({ breite, hoehe, tiefe }));

  // 3. Hook holes and pegs
  parts.push(hooks({
    breite, hoehe, tiefe,
    hookCount,
    edgeMargin: constr.EDGE_MARGIN,
    hookSpacing: constr.HOOK_SPACING,
    hookMaterial: form.hakenmaterial || 'holz',
  }));

  // 4. Shelf (if enabled)
  if (form.hutablage === 'ja') {
    parts.push(shelf({ breite, hoehe, tiefe }));
  }

  // 5. Engraving
  if (form.typ === 'bergmotiv' && form.berg) {
    const berg = berge.find(b => b.value === form.berg);
    if (berg) {
      const { sketchCommands } = convertSvgPath({
        svgPath: berg.path as string,
        boardWidthCm: breite,
        boardHeightCm: hoehe,
        bergName: berg.label,
      });
      parts.push(engraving({
        sketchCommands,
        label: berg.label,
        breite, hoehe,
      }));
    }
  } else if (form.typ === 'schriftzug' && form.schriftzug && form.schriftart) {
    // Font engraving — lazy-load opentype.js
    try {
      const { extractFontOutlines } = await import('./font-outline-extractor');
      const textWidth = breite - 2 * constr.LETTER_MARGIN;
      const { sketchCommands } = await extractFontOutlines({
        text: form.schriftzug,
        fontKey: form.schriftart,
        targetWidthCm: textWidth,
        boardHeightCm: hoehe,
      });
      parts.push(engraving({
        sketchCommands,
        label: form.schriftzug,
        breite, hoehe,
      }));
    } catch (err) {
      console.warn('Font outline extraction failed:', err);
      // Continue without engraving — script is still usable
    }
  }

  // 6. Assembly finalization
  parts.push(assembly({
    holzart: form.holzart,
    customerName,
    configId: form._configId || 'draft',
  }));

  return parts.join('');
}

/**
 * Generate the Fusion 360 script and send it to the workshop via API.
 * Fire-and-forget: errors are logged but do not block checkout.
 */
export async function generateAndSendScript(
  form: FormState,
  configId: string,
  products: Product[],
  constr: Constraints,
  pricing: Pricing,
): Promise<void> {
  const activeProduct = products.find(p => p.id === form.product && p.enabled);

  // Only generate for garderobe product (MVP scope)
  if (!activeProduct || activeProduct.id !== 'garderobe') return;

  const price = computePrice(form, pricing, activeProduct);

  const formWithId: FormWithConfigId = { ...form, _configId: configId };
  const scriptContent = await generateFusionScript({
    form: formWithId,
    activeProduct,
    constr,
    pricing,
    price,
  });

  const customerName = `${form.vorname} ${form.nachname}`.trim();
  const summary = `${activeProduct.label} ${form.breite}x${form.hoehe}x${form.tiefe}cm ${form.holzart}`;

  await fetch('/api/send-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scriptContent,
      orderSummary: summary,
      customerName,
      customerEmail: form.email,
      configId,
    }),
  });
}
