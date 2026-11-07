import { describe, expect, it } from 'vitest';
import { STOPS, contrast, formatClock, mix, orbAt, progressAt, skyAt } from '../../src/lib/sky';

const LAST = STOPS.length - 1;

describe('STOPS', () => {
  it('runs through the nine times of day in order', () => {
    expect(STOPS.map((s) => s.id)).toEqual([
      'dawn', 'early', 'morning', 'midday', 'afternoon', 'sunset', 'dusk', 'night', 'late',
    ]);
  });

  it('moves forward through the clock', () => {
    for (let i = 1; i < STOPS.length; i++) expect(STOPS[i].minutes).toBeGreaterThan(STOPS[i - 1].minutes);
  });
});

describe('formatClock', () => {
  it.each([
    [660, '11:00 AM'],
    [0, '12:00 AM'],
    [750, '12:30 PM'],
    [1439, '11:59 PM'],
    [390.7, '6:30 AM'],
  ])('formats %d as %s', (minutes, expected) => {
    expect(formatClock(minutes)).toBe(expected);
  });
});

describe('mix', () => {
  it('returns the ends and the midpoint', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});

describe('contrast', () => {
  it('gives 21 for black on white in either order', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });
});

describe('progressAt', () => {
  const edges = [1000, 2000, 3000];
  const zone = 100;

  it('holds a stop while the focus is inside its section', () => {
    expect(progressAt(0, edges, zone)).toBe(0);
    expect(progressAt(1500, edges, zone)).toBe(1);
    expect(progressAt(2500, edges, zone)).toBe(2);
    expect(progressAt(9999, edges, zone)).toBe(3);
  });

  it('crossfades across the edge between two sections', () => {
    expect(progressAt(1000, edges, zone)).toBe(0.5);
    expect(progressAt(950, edges, zone)).toBe(0.25);
    expect(progressAt(2050, edges, zone)).toBe(1.75);
  });

  it('shrinks the crossfade to fit short sections', () => {
    const p = progressAt(1500, [1000, 1100], 300);
    expect(p).toBe(2);
    expect(progressAt(1050, [1000, 1100], 300)).toBe(1);
  });

  it('copes with two edges in the same place', () => {
    expect(Number.isFinite(progressAt(1000, [1000, 1000], 100))).toBe(true);
  });
});

describe('skyAt', () => {
  it('needs no veil at any whole stop', () => {
    STOPS.forEach((_, i) => expect(skyAt(i).veil).toBe(0));
  });

  it('keeps text at 4.5:1 or better across the whole day', () => {
    for (let n = 0; n <= 400; n++) {
      const p = (n / 400) * LAST;
      const s = skyAt(p);
      for (const end of [s.top, s.bottom]) {
        const behind = mix(end, s.inverse, s.veil);
        expect(contrast(s.ink, behind), `p=${p} over ${end}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('clamps out-of-range progress', () => {
    expect(skyAt(-3).index).toBe(0);
    expect(skyAt(99).minutes).toBe(STOPS[LAST].minutes);
  });
});

describe('orbAt', () => {
  it('has the sun already up, low in the sky, at dawn', () => {
    const dawn = orbAt(0);
    expect(dawn.moon).toBe(false);
    expect(dawn.altitude).toBeGreaterThan(0.15);
    expect(dawn.altitude).toBeLessThan(0.4);
  });

  it('puts the sun at its highest around midday', () => {
    expect(orbAt(2.6).altitude).toBeGreaterThan(0.95);
  });

  it('sinks the sun all the way below the horizon', () => {
    expect(orbAt(5).altitude).toBeGreaterThan(0);
    expect(orbAt(5.6).altitude).toBe(0);
  });

  it('starts the moon below the horizon, then rises it through the night', () => {
    expect(orbAt(5.9).altitude).toBe(0);
    expect(orbAt(6.5).moon).toBe(true);
    expect(orbAt(6.5).altitude).toBeGreaterThan(0);
    expect(orbAt(8).altitude).toBeGreaterThan(0.8);
  });

  it('never jumps between positions in the sky', () => {
    for (let n = 1; n <= 800; n++) {
      const [a, b] = [orbAt((n - 1) / 100), orbAt(n / 100)];
      expect(Math.abs(a.altitude - b.altitude), `at ${n / 100}`).toBeLessThan(0.02);
      if (a.moon !== b.moon) expect(a.altitude + b.altitude).toBe(0);
    }
  });
});
