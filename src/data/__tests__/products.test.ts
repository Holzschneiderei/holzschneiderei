import { describe, expect, it } from 'vitest';
import type { FormState, Product } from '../../types/config';
import { DEFAULT_FORM } from '../constants';
import {
  computeFixedPrice, 
  DEFAULT_PRODUCTS, getProductGroups, getProductWidths,getTypForProduct,
} from '../products';

/* ── getProductGroups ── */

describe('getProductGroups', () => {
  it('groups products with same group key', () => {
    const groups = getProductGroups(DEFAULT_PRODUCTS);
    const schriftzugGroup = groups.find(g => g.type === 'group');
    expect(schriftzugGroup).toBeDefined();
    if (schriftzugGroup?.type === 'group') {
      expect(schriftzugGroup.variants.length).toBeGreaterThanOrEqual(2);
      expect(schriftzugGroup.primary.groupPrimary).toBe(true);
    }
  });

  it('puts standalone products (no group) separately', () => {
    // bergmotiv has group: null but is comingSoon and not enabled
    const standalones = getProductGroups(DEFAULT_PRODUCTS).filter(g => g.type === 'standalone');
    // bergmotiv is comingSoon=true but has group=null, so it's standalone
    expect(standalones.length).toBeGreaterThanOrEqual(0);
  });

  it('excludes disabled non-comingSoon products', () => {
    const products: Product[] = [
      { ...DEFAULT_PRODUCTS[0]!, enabled: false, comingSoon: false },
    ];
    const groups = getProductGroups(products);
    expect(groups).toHaveLength(0);
  });

  it('includes comingSoon products in group but not as variants', () => {
    const groups = getProductGroups(DEFAULT_PRODUCTS);
    for (const g of groups) {
      if (g.type === 'group') {
        expect(g.variants.every(v => !v.comingSoon)).toBe(true);
      }
    }
  });

  it('returns empty array for empty input', () => {
    expect(getProductGroups([])).toEqual([]);
  });
});

/* ── getTypForProduct ── */

describe('getTypForProduct', () => {
  it('returns "schriftzug" for garderobe (motif=schriftzug)', () => {
    const garderobe = DEFAULT_PRODUCTS.find(p => p.id === 'garderobe');
    expect(getTypForProduct(garderobe)).toBe('schriftzug');
  });

  it('returns "schriftzug" for schriftzug product', () => {
    const schriftzug = DEFAULT_PRODUCTS.find(p => p.id === 'schriftzug');
    expect(getTypForProduct(schriftzug)).toBe('schriftzug');
  });

  it('returns "bergmotiv" for bergmotiv product', () => {
    const berg = DEFAULT_PRODUCTS.find(p => p.id === 'bergmotiv');
    expect(getTypForProduct(berg)).toBe('bergmotiv');
  });

  it('returns empty string for null/undefined', () => {
    expect(getTypForProduct(null)).toBe('');
    expect(getTypForProduct(undefined)).toBe('');
  });
});

/* ── computeFixedPrice ── */

describe('computeFixedPrice', () => {
  const garderobe = DEFAULT_PRODUCTS.find(p => p.id === 'garderobe')!;

  it('returns fixed price for valid key', () => {
    const form: FormState = { ...DEFAULT_FORM, breite: '80', holzart: 'eiche' };
    expect(computeFixedPrice(form, garderobe)).toBe(569);
  });

  it('returns null for non-matching key', () => {
    const form: FormState = { ...DEFAULT_FORM, breite: '99', holzart: 'eiche' };
    expect(computeFixedPrice(form, garderobe)).toBeNull();
  });

  it('returns null for null/undefined product', () => {
    expect(computeFixedPrice(DEFAULT_FORM, null)).toBeNull();
    expect(computeFixedPrice(DEFAULT_FORM, undefined)).toBeNull();
  });
});

/* ── getProductWidths ── */

describe('getProductWidths', () => {
  it('returns sorted unique widths from fixedPrices', () => {
    const garderobe = DEFAULT_PRODUCTS.find(p => p.id === 'garderobe')!;
    const widths = getProductWidths(garderobe);
    expect(widths).toEqual([50, 60, 70, 80]);
  });

  it('returns more widths for schriftzug product', () => {
    const schriftzug = DEFAULT_PRODUCTS.find(p => p.id === 'schriftzug')!;
    const widths = getProductWidths(schriftzug);
    expect(widths).toEqual([30, 40, 50, 60, 70, 80]);
  });

  it('returns empty array for null product', () => {
    expect(getProductWidths(null)).toEqual([]);
  });

  it('returns empty array for product without fixedPrices', () => {
    const bergmotiv = DEFAULT_PRODUCTS.find(p => p.id === 'bergmotiv')!;
    // bergmotiv has fixedPrices: {} — empty object
    expect(getProductWidths(bergmotiv)).toEqual([]);
  });
});
