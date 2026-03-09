import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CONSTR, DEFAULT_PRICING,
  hooksFor, minWForHooks, computeLimits, computePrice, makeDefaultDimConfig,
} from '../pricing';
import type { FormState, Product } from '../../types/config';
import { DEFAULT_FORM } from '../constants';

/* ── hooksFor ── */

describe('hooksFor', () => {
  const c = DEFAULT_CONSTR; // EDGE_MARGIN=5, HOOK_SPACING=10

  it('returns correct hooks for standard widths', () => {
    expect(hooksFor(30, c)).toBe(3);  // usable=20, 20/10+1=3
    expect(hooksFor(50, c)).toBe(5);  // usable=40, 40/10+1=5
    expect(hooksFor(80, c)).toBe(8);  // usable=70, 70/10+1=8
    expect(hooksFor(100, c)).toBe(10); // usable=90, 90/10+1=10
  });

  it('returns 1 when width equals 2*EDGE_MARGIN', () => {
    expect(hooksFor(10, c)).toBe(1); // usable=0, 0/10+1=1
  });

  it('returns 0 when width is too small', () => {
    expect(hooksFor(5, c)).toBe(0);  // usable=-5, negative → 0
    expect(hooksFor(0, c)).toBe(0);
  });
});

/* ── minWForHooks ── */

describe('minWForHooks', () => {
  const c = DEFAULT_CONSTR;

  it('returns MIN_W for 0 or 1 hooks', () => {
    expect(minWForHooks(0, c)).toBe(c.MIN_W);
    expect(minWForHooks(1, c)).toBe(c.MIN_W);
  });

  it('calculates correctly for multiple hooks', () => {
    // (n-1)*HOOK_SPACING + 2*EDGE_MARGIN
    expect(minWForHooks(2, c)).toBe(1 * 10 + 2 * 5); // 20
    expect(minWForHooks(5, c)).toBe(4 * 10 + 2 * 5); // 50
    expect(minWForHooks(8, c)).toBe(7 * 10 + 2 * 5); // 80
  });

  it('is inverse of hooksFor (round-trip)', () => {
    for (let n = 1; n <= 10; n++) {
      const w = minWForHooks(n, c);
      expect(hooksFor(w, c)).toBe(n);
    }
  });
});

/* ── computeLimits ── */

describe('computeLimits', () => {
  const c = DEFAULT_CONSTR;

  it('returns default limits for non-schriftzug products', () => {
    const form: FormState = { ...DEFAULT_FORM, typ: 'garderobe', breite: '80' };
    const lim = computeLimits(form, c);
    expect(lim.minW).toBe(c.MIN_W);
    expect(lim.maxW).toBe(c.MAX_W);
    expect(lim.letters).toBe(0);
    expect(lim.textTooLong).toBe(false);
  });

  it('raises minW for long schriftzug text', () => {
    const form: FormState = { ...DEFAULT_FORM, typ: 'schriftzug', schriftzug: 'ABCDEFGHIJ', breite: '80' };
    const lim = computeLimits(form, c);
    // 10 letters * LETTER_W(5) + 2*LETTER_MARGIN(4) = 58
    expect(lim.minWText).toBe(58);
    expect(lim.minW).toBe(58);
    expect(lim.letters).toBe(10);
  });

  it('ignores spaces in schriftzug text', () => {
    const form: FormState = { ...DEFAULT_FORM, typ: 'schriftzug', schriftzug: 'A B C', breite: '80' };
    const lim = computeLimits(form, c);
    expect(lim.letters).toBe(3); // spaces stripped
  });

  it('detects textTooLong when minW exceeds maxW', () => {
    // MAX_W=100, so need >100: (100-8)/5 = 18.4 → 19 letters → 19*5+8=103
    const longText = 'A'.repeat(19);
    const form: FormState = { ...DEFAULT_FORM, typ: 'schriftzug', schriftzug: longText, breite: '80' };
    const lim = computeLimits(form, c);
    expect(lim.textTooLong).toBe(true);
  });

  it('clamps width to valid range', () => {
    const form: FormState = { ...DEFAULT_FORM, typ: '', breite: '999' };
    const lim = computeLimits(form, c);
    expect(lim.clampedW).toBe(c.MAX_W);
  });

  it('builds hookOptions array', () => {
    const form: FormState = { ...DEFAULT_FORM, typ: '', breite: '50' };
    const lim = computeLimits(form, c);
    expect(lim.hookOptions).toEqual([1, 2, 3, 4, 5]);
    expect(lim.maxHooks).toBe(5);
  });
});

/* ── computePrice ── */

describe('computePrice', () => {
  const p = DEFAULT_PRICING;

  it('calculates formula-based price', () => {
    const form: FormState = { ...DEFAULT_FORM, holzart: 'eiche', breite: '80', hoehe: '180', tiefe: '35' };
    const result = computePrice(form, p);
    expect(result.isFixed).toBe(false);
    expect(result.surfaceM2).toBeGreaterThan(0);
    expect(result.customerPrice).toBeGreaterThan(0);
    expect(result.customerPrice).toBe(result.productionCost * p.margin);
  });

  it('includes extras costs', () => {
    const base: FormState = { ...DEFAULT_FORM, holzart: 'eiche', extras: [] };
    const withExtras: FormState = { ...base, extras: ['spiegel', 'schuhablage'] };
    const priceBase = computePrice(base, p);
    const priceExtras = computePrice(withExtras, p);
    expect(priceExtras.extrasCost).toBe(120 + 180);
    expect(priceExtras.customerPrice).toBeGreaterThan(priceBase.customerPrice);
  });

  it('returns fixed price when product has matching fixedPrices', () => {
    const product = {
      fixedPrices: { '80-eiche': 569 },
    } as unknown as Product;
    const form: FormState = { ...DEFAULT_FORM, holzart: 'eiche', breite: '80' };
    const result = computePrice(form, p, product);
    expect(result.isFixed).toBe(true);
    expect(result.customerPrice).toBe(569);
  });

  it('falls back to formula when no fixed price matches', () => {
    const product = {
      fixedPrices: { '80-eiche': 569 },
    } as unknown as Product;
    const form: FormState = { ...DEFAULT_FORM, holzart: 'buche', breite: '80' };
    const result = computePrice(form, p, product);
    expect(result.isFixed).toBe(false);
  });

  it('uses formula when product has no fixedPrices', () => {
    const result = computePrice({ ...DEFAULT_FORM }, p);
    expect(result.isFixed).toBe(false);
  });

  it('handles unknown wood type gracefully', () => {
    const form: FormState = { ...DEFAULT_FORM, holzart: 'unknown' as any };
    const result = computePrice(form, p);
    expect(result.materialCost).toBeGreaterThan(0); // falls back to 85
  });
});

/* ── makeDefaultDimConfig ── */

describe('makeDefaultDimConfig', () => {
  it('filters presets to constraint range', () => {
    const cfg = makeDefaultDimConfig(DEFAULT_CONSTR);
    expect(cfg.breite!.presets.every(v => v >= DEFAULT_CONSTR.MIN_W && v <= DEFAULT_CONSTR.MAX_W)).toBe(true);
    expect(cfg.hoehe!.presets.every(v => v >= DEFAULT_CONSTR.MIN_H && v <= DEFAULT_CONSTR.MAX_H)).toBe(true);
    expect(cfg.tiefe!.presets.every(v => v >= DEFAULT_CONSTR.MIN_D && v <= DEFAULT_CONSTR.MAX_D)).toBe(true);
  });

  it('uses correct modes', () => {
    const cfg = makeDefaultDimConfig(DEFAULT_CONSTR);
    expect(cfg.breite!.mode).toBe('pills');
    expect(cfg.hoehe!.mode).toBe('pills');
    expect(cfg.tiefe!.mode).toBe('combo');
  });

  it('all fields are enabled by default', () => {
    const cfg = makeDefaultDimConfig(DEFAULT_CONSTR);
    expect(cfg.breite!.enabled).toBe(true);
    expect(cfg.hoehe!.enabled).toBe(true);
    expect(cfg.tiefe!.enabled).toBe(true);
  });
});
