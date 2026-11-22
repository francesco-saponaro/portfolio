// The companion's shapes, drawn on a dot-matrix grid the way a display of
// LEDs would show them: each shape is a list of the cells that are lit, in
// reading order (row by row, left to right), so a morph from one shape to the
// next moves every dot a short, orderly way.

export type Cell = [col: number, row: number];

function fromRows(rows: string[]): Cell[] {
  const cells: Cell[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "#") cells.push([x, y]);
  });
  return cells;
}

/** Moves a shape so its middle sits on (0, 0). */
function centre(cells: Cell[]): Cell[] {
  const xs = cells.map((c) => c[0]);
  const ys = cells.map((c) => c[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return cells.map(([x, y]) => [x - cx, y - cy]);
}

/** The face: a round 11 × 11 disc. Its eyes are cells inside it, lit brighter. */
export const FACE: Cell[] = (() => {
  const cells: Cell[] = [];
  for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) if ((x - 5) ** 2 + (y - 5) ** 2 <= 5.4 ** 2) cells.push([x - 5, y - 5]);
  return cells;
})();

/** The eyes, in face coordinates, looking straight ahead. */
export const EYES: Cell[] = [
  [-2, -1],
  [-2, 0],
  [2, -1],
  [2, 0],
];
/** Happy eyes, a little arch each. */
export const HAPPY_EYES: Cell[] = [
  [-3, 0],
  [-2, -1],
  [-1, 0],
  [1, 0],
  [2, -1],
  [3, 0],
];

/** An arrow pointing right; mirror the columns to point left. */
export const ARROW: Cell[] = centre(
  fromRows([
    "....#....", //
    ".....#...",
    "......#..",
    "#########",
    "......#..",
    ".....#...",
    "....#....",
  ]),
);

/** An envelope, for the contact section. */
export const ENVELOPE: Cell[] = centre(
  fromRows([
    "###########", //
    "##.......##",
    "#.#.....#.#",
    "#..#...#..#",
    "#...#.#...#",
    "#....#....#",
    "#.........#",
    "###########",
  ]),
);

const DIGITS: Record<string, string[]> = {
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
};

/** A number in a 5 × 7 dot font, one blank column between digits. Other characters are skipped. */
export function digits(text: string): Cell[] {
  const chars = text.split("").filter((c) => DIGITS[c]);
  const cells: Cell[] = [];
  chars.forEach((c, i) => {
    for (const [x, y] of fromRows(DIGITS[c]!)) cells.push([x + i * 6, y]);
  });
  cells.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  return cells.length ? centre(cells) : [];
}

/** A small 3 × 3 block, the unit the projects' clusters are made of. */
export const BLOCK: Cell[] = centre(fromRows(["###", "###", "###"]));
