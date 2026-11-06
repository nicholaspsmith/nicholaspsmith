export type SkyStop = {
  id: string;
  top: string;
  bottom: string;
  ink: string;
  land: string;
  night: number;
  /** How far the evening has darkened the buildings and the bridge. */
  tint: number;
  minutes: number;
};

export const DARK_INK = '#0e1f28';
export const LIGHT_INK = '#ffffff';

const TARGET_CONTRAST = 4.5;

export const STOPS: SkyStop[] = [
  { id: 'dawn', top: '#8ea3cf', bottom: '#ffd6b0', ink: DARK_INK, land: '#2c4a48', night: 0.1, tint: 0.05, minutes: 390 },
  { id: 'early', top: '#a9d3ea', bottom: '#ffeccb', ink: DARK_INK, land: '#2f5a4a', night: 0, tint: 0, minutes: 480 },
  { id: 'morning', top: '#79c0e6', bottom: '#dff1f2', ink: DARK_INK, land: '#2a6650', night: 0, tint: 0, minutes: 600 },
  { id: 'midday', top: '#58ade6', bottom: '#c9e9f6', ink: DARK_INK, land: '#256b52', night: 0, tint: 0, minutes: 750 },
  { id: 'afternoon', top: '#7db4d8', bottom: '#ffdca6', ink: DARK_INK, land: '#3a5a42', night: 0, tint: 0.05, minutes: 930 },
  { id: 'sunset', top: '#2a1446', bottom: '#a23a3e', ink: LIGHT_INK, land: '#1b1426', night: 0.1, tint: 0.45, minutes: 1095 },
  { id: 'dusk', top: '#171a45', bottom: '#5d2d63', ink: LIGHT_INK, land: '#120f26', night: 0.5, tint: 0.65, minutes: 1170 },
  { id: 'night', top: '#050a1c', bottom: '#12264a', ink: LIGHT_INK, land: '#040811', night: 1, tint: 0.8, minutes: 1290 },
  { id: 'late', top: '#03060f', bottom: '#0b1730', ink: LIGHT_INK, land: '#02040a', night: 1, tint: 0.84, minutes: 1430 },
];

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export function mix(a: string, b: string, t: number): string {
  const y = channels(b);
  const out = channels(a).map((v, i) => Math.round(v + (y[i] - v) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const worst = (ink: string, top: string, bottom: string) =>
  Math.min(contrast(ink, top), contrast(ink, bottom));

/** The smallest veil, in hundredths, that lets `ink` pass over both ends of the sky. */
function veilFor(ink: string, inverse: string, top: string, bottom: string): number {
  for (let n = 0; n <= 100; n++) {
    const a = n / 100;
    if (worst(ink, mix(top, inverse, a), mix(bottom, inverse, a)) >= TARGET_CONTRAST) return a;
  }
  return 1;
}

export function skyAt(p: number) {
  const clamped = Math.max(0, Math.min(STOPS.length - 1, p));
  const index = Math.min(STOPS.length - 2, Math.floor(clamped));
  const t = clamped - index;
  const [a, b] = [STOPS[index], STOPS[index + 1]];
  const top = mix(a.top, b.top, t);
  const bottom = mix(a.bottom, b.bottom, t);
  const dark = worst(DARK_INK, top, bottom) >= worst(LIGHT_INK, top, bottom);
  const ink = dark ? DARK_INK : LIGHT_INK;
  const inverse = dark ? LIGHT_INK : DARK_INK;
  return {
    index,
    t,
    top,
    bottom,
    ink,
    inverse,
    land: mix(a.land, b.land, t),
    night: a.night + (b.night - a.night) * t,
    tint: a.tint + (b.tint - a.tint) * t,
    minutes: a.minutes + (b.minutes - a.minutes) * t,
    veil: veilFor(ink, inverse, top, bottom),
  };
}

/**
 * Where the day has got to. The sky holds still while the focus is inside a
 * section and crossfades across each edge between sections.
 */
export function progressAt(y: number, edges: number[], zone: number): number {
  for (let k = 0; k < edges.length; k++) {
    const edge = edges[k];
    const before = k > 0 ? edge - edges[k - 1] : Infinity;
    const after = k < edges.length - 1 ? edges[k + 1] - edge : Infinity;
    const reach = Math.min(zone, before / 2, after / 2);
    if (y < edge - reach) return k;
    if (y <= edge + reach) return reach > 0 ? k + (y - (edge - reach)) / (2 * reach) : k + 1;
  }
  return edges.length;
}

export function formatClock(minutes: number): string {
  const whole = Math.floor(minutes);
  const hours = Math.floor(whole / 60);
  const mins = String(whole % 60).padStart(2, '0');
  return `${((hours + 11) % 12) + 1}:${mins} ${hours % 24 < 12 ? 'AM' : 'PM'}`;
}

const SUN_UP = -0.75; // Before the page's first stop, so dawn opens with the sun low in the sky.
const SUN_DOWN = 5.6;
const MOON_UP = 5.9;
const MOON_HIGHEST = 8;
const MOON_PEAK = 0.9;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Where the sun or moon is. Altitude 0 is below the horizon and 1 is the top of the sky. */
export function orbAt(p: number): { moon: boolean; x: number; altitude: number } {
  const moon = p >= (SUN_DOWN + MOON_UP) / 2;
  if (moon) {
    const t = clamp01((p - MOON_UP) / (MOON_HIGHEST - MOON_UP));
    return { moon, x: 58 + t * 22, altitude: MOON_PEAK * Math.sin((t * Math.PI) / 2) };
  }
  const s = clamp01((p - SUN_UP) / (SUN_DOWN - SUN_UP));
  return { moon, x: 58 + s * 36, altitude: s === 1 ? 0 : Math.sin(s * Math.PI) };
}
