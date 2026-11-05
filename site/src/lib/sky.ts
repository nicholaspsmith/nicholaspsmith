export type SkyStop = {
  id: string;
  label: string;
  top: string;
  bottom: string;
  ink: string;
  land: string;
  night: number;
  minutes: number;
};

export const DARK_INK = '#0e1f28';
export const LIGHT_INK = '#ffffff';

const TARGET_CONTRAST = 4.5;

export const STOPS: SkyStop[] = [
  { id: 'dawn', label: 'Dawn', top: '#8ea3cf', bottom: '#ffd6b0', ink: DARK_INK, land: '#2c4a48', night: 0.1, minutes: 390 },
  { id: 'early', label: 'Early morning', top: '#a9d3ea', bottom: '#ffeccb', ink: DARK_INK, land: '#2f5a4a', night: 0, minutes: 480 },
  { id: 'morning', label: 'Morning', top: '#79c0e6', bottom: '#dff1f2', ink: DARK_INK, land: '#2a6650', night: 0, minutes: 600 },
  { id: 'midday', label: 'Midday', top: '#58ade6', bottom: '#c9e9f6', ink: DARK_INK, land: '#256b52', night: 0, minutes: 750 },
  { id: 'afternoon', label: 'Afternoon', top: '#7db4d8', bottom: '#ffdca6', ink: DARK_INK, land: '#3a5a42', night: 0, minutes: 930 },
  { id: 'sunset', label: 'Sunset', top: '#2a1446', bottom: '#a23a3e', ink: LIGHT_INK, land: '#1b1426', night: 0.1, minutes: 1095 },
  { id: 'dusk', label: 'Dusk', top: '#171a45', bottom: '#5d2d63', ink: LIGHT_INK, land: '#120f26', night: 0.5, minutes: 1170 },
  { id: 'night', label: 'Night', top: '#050a1c', bottom: '#12264a', ink: LIGHT_INK, land: '#040811', night: 1, minutes: 1290 },
  { id: 'late', label: 'Late', top: '#03060f', bottom: '#0b1730', ink: LIGHT_INK, land: '#02040a', night: 1, minutes: 1430 },
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
    minutes: a.minutes + (b.minutes - a.minutes) * t,
    veil: veilFor(ink, inverse, top, bottom),
  };
}

export function progressAt(y: number, centres: number[]): number {
  if (y <= centres[0]) return 0;
  const last = centres.length - 1;
  if (y >= centres[last]) return last;
  let i = 0;
  while (y >= centres[i + 1]) i++;
  const span = centres[i + 1] - centres[i];
  return span > 0 ? i + (y - centres[i]) / span : i;
}

export function formatClock(minutes: number): string {
  const whole = Math.floor(minutes);
  const hours = Math.floor(whole / 60);
  const mins = String(whole % 60).padStart(2, '0');
  return `${((hours + 11) % 12) + 1}:${mins} ${hours % 24 < 12 ? 'AM' : 'PM'}`;
}
