/** The view from the Battery, drawn in a 1440 by 420 box. */
export const VIEW = { width: 1440, height: 420 };
export const WATERLINE = 262;

const STREET = 346;
const ROW_SCALE = 0.85;
const BRIDGE_SCALE = 0.8;
const BRIDGE_CENTRE = 1005;

export const ROW_TOP = STREET - 176 * ROW_SCALE;

const TRIM = '#ece6da';
const IRON = '#7c868b';
const GLASS = '#9aa8ae';
const HOUSE_WIDTH = 80;

const STREET_PATH = 'M0 346h622c50 0 80 8 112 20 40 14 80 26 130 32H0z';
const WALL_PATH = 'M760 420c40-22 110-38 240-44 170-8 360-8 560-6v50z';

export type House = { x: number; width: number; height: number; colour: string; shutter: string; index: number };
type Box = { x: number; y: number; width: number; height: number };

const COLOURS = ['#e4c8c8', '#c8d6dd', '#e6dcb9', '#c9d6c6', '#d8cbd8', '#e6cfb9', '#c3d5d0', '#e5c7bb', '#ccd3e2'];
const HEIGHTS = [128, 138, 132, 142, 134, 142, 132, 138, 128];
const SHUTTERS = ['#9aa89f', '#9ca6ae', '#a89c94'];

export const HOUSES: House[] = HEIGHTS.map((height, index) => ({
  x: index * HOUSE_WIDTH,
  width: HOUSE_WIDTH,
  height,
  colour: COLOURS[index],
  shutter: SHUTTERS[index % 3],
  index,
}));

const storeyHeight = (house: House) => (house.height - 58) / 2;

/** Three bays on each upper floor and two on the ground, mirrored about the door. */
export function houseWindows(house: House): Box[] {
  const top = STREET - house.height;
  const cx = house.x + house.width / 2;
  const storey = storeyHeight(house);
  const upper = [top + 16, top + 16 + storey].flatMap((y, floor) =>
    [cx - 25, cx, cx + 25].map((c) => ({
      x: c - 5,
      y,
      width: 10,
      height: floor === 0 ? storey - 10 : storey - 12,
    })),
  );
  const ground = [cx - 25, cx + 25].map((c) => ({ x: c - 5, y: STREET - 37, width: 10, height: 25 }));
  return [...upper, ...ground];
}

const round = (n: number) => Number(n.toFixed(1));

function sash(w: Box, shutter: string): string {
  const { x, y, width, height } = w;
  const cx = x + width / 2;
  return [
    `<rect x="${x - 5.5}" y="${y}" width="4.5" height="${height}" fill="${shutter}"/>`,
    `<rect x="${x + width + 1}" y="${y}" width="4.5" height="${height}" fill="${shutter}"/>`,
    `<rect x="${x - 1}" y="${y - 1}" width="${width + 2}" height="${height + 2}" fill="${TRIM}"/>`,
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${GLASS}"/>`,
    `<path d="M${cx} ${y}V${y + height}M${x} ${round(y + height / 3)}H${x + width}M${x} ${round(y + (height * 2) / 3)}H${x + width}" stroke="${TRIM}" stroke-width=".7"/>`,
    `<rect x="${x - 2.5}" y="${y + height + 1}" width="${width + 5}" height="1.8" fill="${TRIM}"/>`,
  ].join('');
}

function roof(house: House): string {
  const { x, width: w } = house;
  const top = STREET - house.height;
  return `M${x} ${top}L${x + 7} ${top - 18}H${x + w - 7}L${x + w} ${top}Z`;
}

const chimneys = (house: House) => [house.x + 8, house.x + house.width - 16];

function houseMarkup(house: House): string {
  const { x, width: w, height: h, index, shutter } = house;
  const top = STREET - h;
  const cx = x + w / 2;
  const parts: string[] = [];

  for (const c of chimneys(house)) {
    parts.push(`<rect x="${c}" y="${top - 31}" width="8" height="22" fill="#b09a8e"/>`);
    parts.push(`<rect x="${c - 1}" y="${top - 33}" width="10" height="3" fill="#9c8679"/>`);
  }
  parts.push(`<path d="${roof(house)}" fill="#979ca1"/>`);
  if (index % 2 === 0) {
    parts.push(`<rect x="${cx - 6}" y="${top - 14}" width="12" height="12" fill="${TRIM}"/>`);
    parts.push(`<rect x="${cx - 4}" y="${top - 12}" width="8" height="9" fill="${GLASS}"/>`);
    parts.push(`<path d="M${cx - 8} ${top - 14}L${cx} ${top - 21}L${cx + 8} ${top - 14}Z" fill="${TRIM}"/>`);
  }

  parts.push(`<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${house.colour}"/>`);
  parts.push(`<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#stucco)"/>`);
  parts.push(`<rect x="${x - 1}" y="${top - 1}" width="${w + 2}" height="6" fill="${TRIM}"/>`);
  parts.push(`<rect x="${x}" y="${top + 5}" width="${w}" height="1.4" fill="#0000002e"/>`);
  for (let d = 3; d < w; d += 5) {
    parts.push(`<rect x="${x + d}" y="${top + 6.4}" width="2" height="2.4" fill="${TRIM}"/>`);
  }
  parts.push(`<rect x="${x}" y="${STREET - 7}" width="${w}" height="7" fill="#00000022"/>`);

  for (const w2 of houseWindows(house)) parts.push(sash(w2, shutter));

  if (index % 2 === 1) {
    const storey = storeyHeight(house);
    const by = top + 16 + storey + (storey - 12) + 3;
    parts.push(`<rect x="${cx - 34}" y="${by}" width="68" height="2" fill="${IRON}"/>`);
    let rail = `M${cx - 34} ${by - 8}H${cx + 34}`;
    for (let b = -34; b <= 34; b += 4) rail += `M${cx + b} ${by - 8}V${by}`;
    parts.push(`<path d="${rail}" stroke="${IRON}" stroke-width=".8" fill="none"/>`);
  }

  const gy = STREET - 40;
  parts.push(`<path d="M${cx - 8} ${STREET - 4}V${gy + 8}a8 8 0 0 1 16 0V${STREET - 4}Z" fill="${TRIM}"/>`);
  parts.push(`<path d="M${cx - 6} ${STREET - 4}V${gy + 8}a6 6 0 0 1 12 0V${STREET - 4}Z" fill="${shutter}"/>`);
  parts.push(`<path d="M${cx - 6} ${gy + 8}a6 6 0 0 1 12 0Z" fill="#dfe4e4"/>`);
  parts.push(`<rect x="${cx - 10}" y="${STREET - 4}" width="20" height="2" fill="#cbc3b4"/>`);
  parts.push(`<rect x="${cx - 12}" y="${STREET - 2}" width="24" height="2" fill="#b8b0a2"/>`);
  return parts.join('');
}

const rowTransform = `translate(0 ${STREET}) scale(${ROW_SCALE}) translate(0 ${-STREET})`;

export function foregroundMarkup(): string {
  return [
    '<defs>',
    '<pattern id="cobble" width="26" height="16" patternUnits="userSpaceOnUse">',
    '<ellipse cx="7" cy="5" rx="6" ry="3.6" fill="#ffffff14"/><ellipse cx="20" cy="12" rx="6" ry="3.6" fill="#ffffff14"/>',
    '</pattern>',
    '<linearGradient id="stucco" x1="0" y1="0" x2="1" y2="0">',
    '<stop offset="0" stop-color="#000" stop-opacity=".07"/><stop offset=".12" stop-color="#fff" stop-opacity=".08"/>',
    '<stop offset=".88" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".07"/>',
    '</linearGradient>',
    '</defs>',
    `<g transform="${rowTransform}">${HOUSES.map(houseMarkup).join('')}</g>`,
    `<path d="${STREET_PATH}" fill="#8f8a83"/><path d="${STREET_PATH}" fill="url(#cobble)"/>`,
    `<path d="${WALL_PATH}" fill="#aaa499"/>`,
  ].join('');
}

/** Roughly four windows in five are lit after dark. */
export function lightsMarkup(): string {
  const windows = HOUSES.flatMap(houseWindows);
  const lit = windows.filter((_, n) => (n * 7) % 5 !== 0);
  const rects = lit.map((w) => `<rect x="${w.x}" y="${w.y}" width="${w.width}" height="${w.height}"/>`);
  return `<g transform="${rowTransform}" fill="#ffd36e">${rects.join('')}</g>`;
}

/** The outline of everything near the viewer, used to darken it at night. */
export function silhouetteUri(): string {
  const shapes = HOUSES.map((house) => {
    const top = STREET - house.height;
    const stacks = chimneys(house)
      .map((c) => `<rect x="${c - 1}" y="${top - 33}" width="10" height="24"/>`)
      .join('');
    const dormer =
      house.index % 2 === 0 ? `<path d="M${house.x + 32} ${top - 2}V${top - 14}L${house.x + 40} ${top - 21}L${house.x + 48} ${top - 14}V${top - 2}Z"/>` : '';
    return `<rect x="${house.x - 1}" y="${top - 1}" width="${house.width + 2}" height="${house.height + 1}"/><path d="${roof(house)}"/>${stacks}${dormer}`;
  }).join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" preserveAspectRatio="xMidYMax slice">` +
    `<g transform="${rowTransform}">${shapes}</g><path d="${STREET_PATH}"/><path d="${WALL_PATH}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* The Ravenel Bridge: two diamond towers and one continuous deck. */
const DECK = 214;
const SPAN_LEFT = 800;
const SPAN_RIGHT = 1210;
const FALL = 62;
const RUN = 280;
const TOWERS = [860, 1150];
const TOWER_TOP = 96;
const DECK_LEVEL_LOW = 258;

export function deckY(x: number): number {
  const beyond = x < SPAN_LEFT ? SPAN_LEFT - x : x > SPAN_RIGHT ? x - SPAN_RIGHT : 0;
  return Math.min(DECK_LEVEL_LOW, DECK + (beyond / RUN) ** 2 * FALL);
}

export function cables() {
  return TOWERS.flatMap((tower) =>
    Array.from({ length: 12 }, (_, n) => n + 1).flatMap((i) =>
      [-1, 1].map((side) => {
        const x2 = tower + side * i * 11.5;
        return { x1: tower + side * i * 0.22, y1: 104 + i * 6, x2, y2: deckY(x2) };
      }),
    ),
  );
}

export function bridgeMarkup(): string {
  const piers = [640, 690, 740, 1270, 1320, 1370, 1420]
    .map((x) => `<path d="M${x} ${round(deckY(x))}V${WATERLINE}" stroke-width="3"/>`)
    .join('');
  let deck = '';
  for (let x = 500; x <= 1700; x += 10) deck += `${x === 500 ? 'M' : 'L'}${x} ${round(deckY(x))}`;
  const towers = TOWERS.map(
    (t) =>
      `<path d="M${t - 8} ${WATERLINE}L${t - 30} ${DECK}L${t} ${TOWER_TOP}L${t + 30} ${DECK}L${t + 8} ${WATERLINE}" stroke-width="5"/>`,
  ).join('');
  const wires = cables()
    .map((c) => `M${round(c.x1)} ${c.y1}L${c.x2} ${round(c.y2)}`)
    .join('');
  const transform = `translate(${BRIDGE_CENTRE} ${WATERLINE}) scale(${BRIDGE_SCALE}) translate(${-BRIDGE_CENTRE} ${-WATERLINE})`;
  return (
    `<g transform="${transform}" fill="none" stroke="currentColor" stroke-linecap="round">` +
    `${piers}<path d="${deck}" stroke-width="5"/>${towers}<path d="${wires}" stroke-width="1"/></g>`
  );
}

export const SHORE_PATH = 'M560 262c70-7 150-10 260-9s220 3 330 1 200-5 290-2v10H560z';

/* Two sailboats whose positions follow the time of day and nothing else. */
const LAST_STOP = 8;

export type Boat = { from: number; to: number; y: number; scale: number };

export const BOATS: Boat[] = [
  { from: 540, to: 1500, y: 292, scale: 1 },
  { from: 1420, to: 620, y: 274, scale: 0.62 },
];

export function boatX(boat: Boat, p: number): number {
  const t = Math.max(0, Math.min(1, p / LAST_STOP));
  return boat.from + (boat.to - boat.from) * t;
}

export const boatTransform = (boat: Boat, p: number) =>
  `translate(${round(boatX(boat, p))} ${boat.y}) scale(${boat.scale})`;

export function boatMarkup(): string {
  return BOATS.map(
    (boat) =>
      `<g data-boat transform="${boatTransform(boat, 0)}">` +
      '<path d="M-15 7h30l-3 5h-24z" fill="var(--hull)" opacity=".18"/>' +
      '<path d="M-17 0H17C15 5 11 7 7 7H-8C-12 7-15 5-17 0Z" fill="var(--hull)"/>' +
      '<path d="M0 0V-42" stroke="var(--hull)" stroke-width="1.2"/>' +
      '<path d="M1.5 -40C10 -28 15 -14 16 -3H1.5Z" fill="var(--sail)"/>' +
      '<path d="M-1.5 -34C-6 -24-11 -13-14 -3H-1.5Z" fill="var(--sail)"/>' +
      '<circle cx="0" cy="-44" r="1.6" fill="#ffd36e" opacity="var(--lamp)"/>' +
      '</g>',
  ).join('');
}

/* Sunlight or moonlight on the water, centred so it can slide under the orb. */
export function glitterMarkup(): string {
  return Array.from({ length: 16 }, (_, n) => {
    const width = 40 + n * 12 + (n % 3) * 24;
    const x = round(-width / 2 + Math.sin(n * 2.3) * 16);
    const opacity = round(0.5 - n * 0.018);
    return `<rect x="${x}" y="${268 + n * 9}" width="${width}" height="2.5" rx="1.2" opacity="${opacity}"/>`;
  }).join('');
}
