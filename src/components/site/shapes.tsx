// The shapes the solid icons take, one per section. Drawn on a 100×100
// grid: FG is the solid part, HOLE is cut out. solid.tsx cuts a mask from
// this markup and fills it with the silver gradient.

const FG = "__fg__";
const HOLE = "__hole__";

const RAW: Record<string, string> = {
  bubble: `<g transform="scale(3.125)"><path fill="${FG}" d="M16 3C8.8 3 3 8.2 3 14.6c0 3.5 1.7 6.6 4.4 8.7-.3 2.1-1.4 4-3.2 5.3 3.4.2 6.3-.9 8.3-2.9 1.1.2 2.3.4 3.5.4 7.2 0 13-5.2 13-11.5S23.2 3 16 3Z"/><circle cx="10.2" cy="14.6" r="2.3" fill="${HOLE}"/><circle cx="16" cy="14.6" r="2.3" fill="${HOLE}"/><circle cx="21.8" cy="14.6" r="2.3" fill="${HOLE}"/></g>`,
  plate: `<circle cx="52" cy="52" r="27" fill="none" stroke="${FG}" stroke-width="9"/><circle cx="52" cy="52" r="13" fill="${FG}"/><path d="M13 14v72M7 14v20a6 6 0 0 0 12 0V14" fill="none" stroke="${FG}" stroke-width="5.5" stroke-linecap="round"/><path d="M90 86V14c-7 4-10 16-10 30v10h10" fill="${FG}" stroke="${FG}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`,
  pizza: `<path d="M50 94 14 24c22-14 50-14 72 0Z" fill="${FG}"/><path d="M11 20c25-17 53-17 78 0" fill="none" stroke="${FG}" stroke-width="11" stroke-linecap="round"/><circle cx="40" cy="38" r="7" fill="${HOLE}"/><circle cx="61" cy="44" r="6" fill="${HOLE}"/><circle cx="49" cy="64" r="5.5" fill="${HOLE}"/>`,
  scissors: `<path d="M36 64 74 10M64 64 26 10" stroke="${FG}" stroke-width="10" stroke-linecap="round"/><circle cx="29" cy="76" r="13" fill="none" stroke="${FG}" stroke-width="8"/><circle cx="71" cy="76" r="13" fill="none" stroke="${FG}" stroke-width="8"/><circle cx="50" cy="44" r="3.5" fill="${HOLE}"/>`,
  polish: `<rect x="38" y="6" width="24" height="30" rx="5" fill="${FG}"/><rect x="34" y="32" width="32" height="8" rx="3" fill="${FG}"/><rect x="22" y="42" width="56" height="52" rx="16" fill="${FG}"/><path d="M33 56v24" stroke="${HOLE}" stroke-width="5" stroke-linecap="round"/>`,
  dumbbell: `<path d="M24 50h52" stroke="${FG}" stroke-width="9" stroke-linecap="round"/><rect x="6" y="28" width="14" height="44" rx="5" fill="${FG}"/><rect x="20" y="20" width="12" height="60" rx="5" fill="${FG}"/><rect x="68" y="20" width="12" height="60" rx="5" fill="${FG}"/><rect x="80" y="28" width="14" height="44" rx="5" fill="${FG}"/>`,
  wrench: `<path d="M44 44 84 84" stroke="${FG}" stroke-width="16" stroke-linecap="round"/><circle cx="32" cy="32" r="24" fill="${FG}"/><path d="M32 32 8 18 18 8Z" fill="${HOLE}"/><circle cx="32" cy="32" r="8" fill="${HOLE}"/><circle cx="80" cy="80" r="3.5" fill="${HOLE}"/>`,
  shield: `<path d="M50 6 86 18v28c0 24-15 40-36 48C29 86 14 70 14 46V18Z" fill="${FG}"/><path d="m33 50 12 12 23-25" fill="none" stroke="${HOLE}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  clipboard: `<rect x="16" y="14" width="68" height="80" rx="12" fill="${FG}"/><rect x="34" y="6" width="32" height="16" rx="6" fill="${FG}"/><path d="M30 42h40M30 58h40M30 74h24" stroke="${HOLE}" stroke-width="6" stroke-linecap="round"/>`,
  gear: `<path fill="${FG}" d="M43 6h14l3 12 9 4 11-7 10 10-7 11 4 9 12 3v14l-12 3-4 9 7 11-10 10-11-7-9 4-3 12H43l-3-12-9-4-11 7-10-10 7-11-4-9-12-3V43l12-3 4-9-7-11 10-10 11 7 9-4Z"/><circle cx="50" cy="50" r="15" fill="${HOLE}"/>`,
  phone: `<rect x="24" y="4" width="52" height="92" rx="13" fill="${FG}"/><rect x="31" y="15" width="38" height="64" rx="4" fill="${HOLE}"/><path d="M35 30h22M43 42h22M35 54h18" stroke="${FG}" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="87" r="3.5" fill="${HOLE}"/>`,
  sun: `<circle cx="50" cy="50" r="20" fill="${FG}"/><path d="M50 6v12M50 82v12M6 50h12M82 50h12M19 19l8 8M73 73l8 8M81 19l-8 8M27 73l-8 8" stroke="${FG}" stroke-width="8" stroke-linecap="round"/>`,
  house: `<path d="M50 9 91 44H80v44H20V44H9Z" fill="${FG}" stroke="${FG}" stroke-width="6" stroke-linejoin="round"/><rect x="66" y="14" width="11" height="22" rx="2" fill="${FG}"/><rect x="42" y="62" width="16" height="26" rx="3" fill="${HOLE}"/><path d="M30 54 40 46 50 50 64 38" fill="none" stroke="${HOLE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  pin: `<path d="M50 96C33 74 18 58 18 38a32 32 0 0 1 64 0c0 20-15 36-32 58Z" fill="${FG}"/><circle cx="50" cy="38" r="12" fill="${HOLE}"/>`,
  plane: `<path d="M6 46 94 8 70 92 50 62Z" fill="${FG}"/><path d="M50 62 94 8" stroke="${HOLE}" stroke-width="5" stroke-linecap="round"/><path d="M50 62 46 88 58 74Z" fill="${FG}"/>`,
};

export type ShapeName = keyof typeof RAW;
export const SHAPE_NAMES = Object.keys(RAW) as ShapeName[];

export function shapeMarkup(name: string, fg: string, hole: string): string {
  return (RAW[name] ?? RAW.bubble).replaceAll(FG, fg).replaceAll(HOLE, hole);
}
