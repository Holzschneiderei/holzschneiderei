import { describe, expect, it } from 'vitest';
import validateConfigShape from '../validateConfig';

/* ── Happy path ── */

describe('validateConfigShape — valid configs', () => {
  it('accepts an empty object', () => {
    expect(validateConfigShape({})).toEqual({ ok: true });
  });

  it('accepts a fully valid config', () => {
    const result = validateConfigShape({
      constr: { MIN_W: 30, MAX_W: 100 },
      pricing: { labourRate: 75, woodCosts: { eiche: 85 }, extrasCosts: { spiegel: 120 } },
      dimConfig: { breite: { enabled: true, mode: 'pills', presets: [30, 50, 80] } },
      stepOrder: ['holzart', 'masse'],
      enabledHolzarten: { eiche: true, buche: false },
      enabledSchriftarten: { sans: true },
      enabledBerge: { matterhorn: true },
      enabledSteps: { holzart: true, extras: false },
      bergDisplay: { mode: 'card', showName: true },
      texts: { produktwahl: { heading: 'Hallo', showHeading: true } },
      oberflaechenItems: [],
      extrasItems: [],
      hakenMatItems: [],
      darstellungItems: [],
      products: [],
      fusionEnabled: true,
      categoryVisibility: { holzarten: true },
      showroom: { layout: 'grid' },
    });
    expect(result.ok).toBe(true);
  });
});

/* ── Top-level rejection ── */

describe('validateConfigShape — top-level rejection', () => {
  it('rejects null', () => {
    expect(validateConfigShape(null)).toEqual({ ok: false, reason: expect.stringContaining('kein JSON-Objekt') });
  });

  it('rejects arrays', () => {
    expect(validateConfigShape([])).toEqual({ ok: false, reason: expect.stringContaining('kein JSON-Objekt') });
  });

  it('rejects primitives', () => {
    expect(validateConfigShape('string')).toEqual({ ok: false, reason: expect.stringContaining('kein JSON-Objekt') });
    expect(validateConfigShape(42)).toEqual({ ok: false, reason: expect.stringContaining('kein JSON-Objekt') });
  });
});

/* ── constr ── */

describe('validateConfigShape — constr', () => {
  it('rejects non-object constr', () => {
    const r = validateConfigShape({ constr: 'bad' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('constr');
  });

  it('rejects non-numeric constr values', () => {
    const r = validateConfigShape({ constr: { MIN_W: 'abc' } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('MIN_W');
  });

  it('rejects NaN constr values', () => {
    const r = validateConfigShape({ constr: { MAX_W: NaN } });
    expect(r.ok).toBe(false);
  });
});

/* ── pricing ── */

describe('validateConfigShape — pricing', () => {
  it('rejects non-object pricing', () => {
    const r = validateConfigShape({ pricing: 123 });
    expect(r.ok).toBe(false);
  });

  it('rejects non-numeric pricing fields', () => {
    const r = validateConfigShape({ pricing: { labourRate: 'high' } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('labourRate');
  });

  it('rejects non-object woodCosts', () => {
    const r = validateConfigShape({ pricing: { woodCosts: 'bad' } });
    expect(r.ok).toBe(false);
  });

  it('rejects non-numeric woodCosts values', () => {
    const r = validateConfigShape({ pricing: { woodCosts: { eiche: 'teuer' } } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('eiche');
  });
});

/* ── dimConfig ── */

describe('validateConfigShape — dimConfig', () => {
  it('rejects non-object dimConfig', () => {
    const r = validateConfigShape({ dimConfig: 'flat' });
    expect(r.ok).toBe(false);
  });

  it('rejects non-boolean enabled', () => {
    const r = validateConfigShape({ dimConfig: { breite: { enabled: 'ja' } } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('enabled');
  });

  it('rejects non-string mode', () => {
    const r = validateConfigShape({ dimConfig: { breite: { mode: 42 } } });
    expect(r.ok).toBe(false);
  });

  it('rejects non-array presets', () => {
    const r = validateConfigShape({ dimConfig: { breite: { presets: 'all' } } });
    expect(r.ok).toBe(false);
  });
});

/* ── stepOrder ── */

describe('validateConfigShape — stepOrder', () => {
  it('rejects non-array stepOrder', () => {
    const r = validateConfigShape({ stepOrder: 'holzart,masse' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('stepOrder');
  });
});

/* ── toggle sets ── */

describe('validateConfigShape — toggle sets', () => {
  for (const key of ['enabledHolzarten', 'enabledSchriftarten', 'enabledBerge']) {
    it(`rejects array for ${key}`, () => {
      const r = validateConfigShape({ [key]: ['eiche'] });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toContain(key);
    });

    it(`rejects null for ${key}`, () => {
      const r = validateConfigShape({ [key]: null });
      expect(r.ok).toBe(false);
    });
  }
});

/* ── enabledSteps ── */

describe('validateConfigShape — enabledSteps', () => {
  it('rejects non-boolean values', () => {
    const r = validateConfigShape({ enabledSteps: { holzart: 'on' } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('holzart');
  });

  it('rejects array', () => {
    const r = validateConfigShape({ enabledSteps: ['holzart'] });
    expect(r.ok).toBe(false);
  });
});

/* ── bergDisplay ── */

describe('validateConfigShape — bergDisplay', () => {
  it('rejects non-object bergDisplay', () => {
    const r = validateConfigShape({ bergDisplay: 'full' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('bergDisplay');
  });

  it('rejects null bergDisplay', () => {
    const r = validateConfigShape({ bergDisplay: null });
    expect(r.ok).toBe(false);
  });

  it('rejects array bergDisplay', () => {
    const r = validateConfigShape({ bergDisplay: [] });
    expect(r.ok).toBe(false);
  });
});

/* ── texts ── */

describe('validateConfigShape — texts', () => {
  it('rejects non-object texts', () => {
    const r = validateConfigShape({ texts: 'hello' });
    expect(r.ok).toBe(false);
  });

  it('rejects non-object section values', () => {
    const r = validateConfigShape({ texts: { produktwahl: 'flat' } });
    expect(r.ok).toBe(false);
  });

  it('rejects numeric text values', () => {
    const r = validateConfigShape({ texts: { produktwahl: { heading: 42 } } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('heading');
  });

  it('accepts boolean text values (visibility flags)', () => {
    const r = validateConfigShape({ texts: { produktwahl: { showHeading: false } } });
    expect(r.ok).toBe(true);
  });
});

/* ── v3 array fields ── */

describe('validateConfigShape — v3 array fields', () => {
  for (const key of ['oberflaechenItems', 'extrasItems', 'hakenMatItems', 'darstellungItems', 'products']) {
    it(`rejects non-array ${key}`, () => {
      const r = validateConfigShape({ [key]: {} });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toContain(key);
    });
  }
});

/* ── fusionEnabled ── */

describe('validateConfigShape — fusionEnabled', () => {
  it('rejects non-boolean fusionEnabled', () => {
    const r = validateConfigShape({ fusionEnabled: 'yes' });
    expect(r.ok).toBe(false);
  });
});

/* ── categoryVisibility / showroom ── */

describe('validateConfigShape — categoryVisibility & showroom', () => {
  it('rejects array categoryVisibility', () => {
    const r = validateConfigShape({ categoryVisibility: [] });
    expect(r.ok).toBe(false);
  });

  it('rejects array showroom', () => {
    const r = validateConfigShape({ showroom: [] });
    expect(r.ok).toBe(false);
  });
});
