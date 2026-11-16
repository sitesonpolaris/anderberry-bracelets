import type { StoneKey } from "./materials";

export type BeadKind = "round" | "rondelle" | "hex" | "oval" | "square" | "cube";
/** size = bead radius in scene units (0.04 per mm of diameter ÷ 2, roughly) */
export type Bead = { kind: BeadKind; stone: StoneKey; size: number; cap?: StoneKey };
export type SwatchStone = "tiger" | "tigerHoney" | "tigerDark" | "tigerRed" | "tigerBlue" | "hawk" | "blueGold" | "leopard" | "snowflake" | "lava" | "jasper" | "obsidian";

export type Strand = {
  /** Matches the style key on the ConnecQ Tap-to-Connect product */
  key: string;
  name: string;
  detail: string;
  /** Two halves of the swatch button, cut from the same textures as the 3D stones */
  swatch: [SwatchStone, SwatchStone];
  beads: Bead[];
};

export const TTC_SLUG = "tap-to-connect-bracelet";

const repeat = (n: number, pattern: Bead[]) => Array.from({ length: n }, () => pattern).flat();

/** Deterministic mix so a strand looks the same on every visit. */
function mix(n: number, seed: number, choices: [StoneKey, number][], size: number): Bead[] {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const total = choices.reduce((a, [, w]) => a + w, 0);
  return Array.from({ length: n }, () => {
    let x = r() * total;
    const stone = choices.find(([, w]) => (x -= w) < 0)?.[0] ?? choices[0][0];
    return { kind: "round" as const, stone, size };
  });
}

// Each strand copies the owner's photo of that stone on the Etsy listing.
export const strands: Strand[] = [
  {
    key: "tigers-eye-onyx",
    name: "Tiger's Eye & Onyx",
    detail: "Tiger eye rondelles, matte onyx, hex centerpiece",
    swatch: ["tiger", "obsidian"],
    beads: [
      { kind: "hex", stone: "tiger", cap: "coilAmber", size: 0.3 },
      ...repeat(21, [
        { kind: "rondelle", stone: "tiger", size: 0.19 },
        { kind: "round", stone: "onyxMatte", size: 0.16 },
      ]),
      { kind: "rondelle", stone: "tiger", size: 0.19 },
    ],
  },
  {
    key: "mixed-tiger-eye",
    name: "Mixed Color Tiger's Eye",
    detail: "Red, blue and gold tiger eye, jasper oval",
    swatch: ["tigerRed", "tigerHoney"],
    beads: [
      { kind: "oval", stone: "jasper", cap: "coilJasper", size: 0.34 },
      ...mix(14, 5, [["tigerRed", 3], ["hawk", 3], ["tiger", 1], ["onyxPolished", 4]], 0.2).flatMap((b) => [
        { kind: "rondelle" as const, stone: "tigerHoney" as StoneKey, size: 0.17 },
        b,
      ]),
      { kind: "rondelle", stone: "tigerHoney", size: 0.17 },
    ],
  },
  {
    key: "blue-gold-tiger-eye",
    name: "Blue/Gold Tiger's Eye",
    detail: "Blue and gold tiger eye, clear resin centerpiece",
    swatch: ["blueGold", "tigerBlue"],
    beads: [
      { kind: "oval", stone: "resin", cap: "resinDisc", size: 0.3 },
      { kind: "rondelle", stone: "spacerMatte", size: 0.2 },
      ...Array.from({ length: 16 }, () => ({ kind: "round" as const, stone: "blueGold" as StoneKey, size: 0.24 })),
      { kind: "rondelle", stone: "spacerMatte", size: 0.2 },
    ],
  },
  {
    key: "brown-tiger-eye",
    name: "Brown Tiger's Eye",
    detail: "Tiger eye and hawk's eye, hex centerpiece",
    swatch: ["tigerHoney", "hawk"],
    beads: [
      { kind: "hex", stone: "tiger", size: 0.26 },
      { kind: "cube", stone: "tigerDark", size: 0.1 },
      ...mix(26, 9, [["tigerHoney", 5], ["tiger", 4], ["tigerDark", 3], ["hawk", 3], ["onyxPolished", 1]], 0.16),
      { kind: "cube", stone: "tigerDark", size: 0.1 },
    ],
  },
  {
    key: "black-obsidian",
    name: "Black Obsidian",
    detail: "Polished obsidian, cushion centerpiece",
    swatch: ["obsidian", "obsidian"],
    beads: [
      { kind: "square", stone: "obsidian", size: 0.27 },
      { kind: "rondelle", stone: "spacerMatte", size: 0.2 },
      ...Array.from({ length: 17 }, () => ({ kind: "round" as const, stone: "obsidian" as StoneKey, size: 0.24 })),
      { kind: "rondelle", stone: "spacerMatte", size: 0.2 },
    ],
  },
  {
    key: "black-lava-rock",
    name: "Black Lava Rock",
    detail: "Porous lava rock, cushion centerpiece",
    swatch: ["lava", "lava"],
    beads: [
      { kind: "square", stone: "obsidian", size: 0.26 },
      { kind: "rondelle", stone: "spacerMatte", size: 0.19 },
      ...Array.from({ length: 20 }, () => ({ kind: "round" as const, stone: "lava" as StoneKey, size: 0.21 })),
      { kind: "rondelle", stone: "spacerMatte", size: 0.19 },
    ],
  },
  {
    key: "leopard-jasper",
    name: "Leopard Jasper",
    detail: "Leopard jasper, hex centerpiece",
    swatch: ["leopard", "leopard"],
    beads: [
      { kind: "hex", stone: "leopard", size: 0.28 },
      ...Array.from({ length: 24 }, () => ({ kind: "round" as const, stone: "leopard" as StoneKey, size: 0.18 })),
    ],
  },
  {
    key: "snowflake-jasper",
    name: "Snowflake Jasper",
    detail: "Snowflake jasper, black cushion centerpiece",
    swatch: ["snowflake", "obsidian"],
    beads: [
      { kind: "square", stone: "obsidian", size: 0.26 },
      ...Array.from({ length: 22 }, () => ({ kind: "round" as const, stone: "snowflake" as StoneKey, size: 0.2 })),
    ],
  },
];

/** Width of a bead measured along the cord. */
export function beadLength(b: Bead) {
  switch (b.kind) {
    case "round":
      return b.size * 2;
    case "rondelle":
      return b.size * 0.7;
    case "cube":
      return b.size * 1.6;
    case "hex":
      return b.size * 1.9;
    case "square":
      return b.size * 2.1;
    case "oval":
      return b.size * 2.4;
  }
}
