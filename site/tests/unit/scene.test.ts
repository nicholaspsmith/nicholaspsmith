import { describe, expect, it } from 'vitest';
import { contrast } from '../../src/lib/sky';
import { BOATS, HOUSES, boatX, cables, deckY, houseWindows } from '../../src/lib/scene';

describe('the bridge', () => {
  it('lands every cable exactly on the deck', () => {
    const all = cables();
    expect(all.length).toBeGreaterThan(40);
    for (const c of all) expect(c.y2).toBeCloseTo(deckY(c.x2), 1);
  });

  it('never drops the deck below the waterline', () => {
    for (let x = 400; x <= 1800; x += 10) expect(deckY(x)).toBeLessThanOrEqual(258);
  });

  it('keeps the main span flat', () => {
    expect(deckY(900)).toBe(deckY(1100));
  });
});

describe('Rainbow Row', () => {
  it('has nine houses in a mirrored rhythm', () => {
    const heights = HOUSES.map((h) => h.height);
    expect(heights).toHaveLength(9);
    expect(heights).toEqual([...heights].reverse());
  });

  it('gives every house its own colour', () => {
    expect(new Set(HOUSES.map((h) => h.colour)).size).toBe(HOUSES.length);
  });

  it('keeps the shutters gentle against the walls, so the row sits back', () => {
    for (const house of HOUSES) expect(contrast(house.colour, house.shutter)).toBeLessThan(2);
  });

  it('mirrors each facade about its centre', () => {
    HOUSES.forEach((house) => {
      const centres = houseWindows(house).map((w) => w.x + w.width / 2 - house.x - house.width / 2);
      for (const c of centres) expect(centres.some((other) => Math.abs(other + c) < 0.01)).toBe(true);
    });
  });
});

describe('the sailboats', () => {
  it('start and finish where they are told to', () => {
    for (const boat of BOATS) {
      expect(boatX(boat, 0)).toBe(boat.from);
      expect(boatX(boat, 8)).toBe(boat.to);
    }
  });

  it('sail in opposite directions', () => {
    const [a, b] = BOATS;
    expect(Math.sign(a.to - a.from)).toBe(-Math.sign(b.to - b.from));
  });

  it('stay put outside the day', () => {
    expect(boatX(BOATS[0], -2)).toBe(BOATS[0].from);
    expect(boatX(BOATS[0], 12)).toBe(BOATS[0].to);
  });
});
