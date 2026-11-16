import type { StoneKey } from "./materials";

export type BeadKind = "round" | "rondelle" | "hex" | "oval" | "square";
export type Bead = { kind: BeadKind; stone: StoneKey; size: number; cap?: StoneKey };

export type Strand = {
  key: string;
  name: string;
  stones: string;
  swatch: [string, string]; // two flat colours for the swatch button
  href: string;
  beads: Bead[];
};

const repeat = (n: number, pattern: Bead[]) => Array.from({ length: n }, () => pattern).flat();

// Each strand mirrors a real AnderBerry piece from the owner's photographs.
export const strands: Strand[] = [
  {
    key: "tiger-onyx",
    name: "Tiger eye & onyx",
    stones: "Tap-to-Connect · hex centerpiece",
    swatch: ["#b8862f", "#151515"],
    href: "/shop/tap-to-connect-bracelet?style=tigers-eye-onyx",
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
    key: "tritone-jasper",
    name: "Mixed color tiger eye",
    stones: "Tap-to-Connect · jasper oval",
    swatch: ["#8c3020", "#b8862f"],
    href: "/shop/tap-to-connect-bracelet?style=mixed-tiger-eye",
    beads: [
      { kind: "oval", stone: "jasper", cap: "coilJasper", size: 0.34 },
      ...repeat(9, [
        { kind: "rondelle", stone: "tiger", size: 0.17 },
        { kind: "round", stone: "tigerRed", size: 0.19 },
        { kind: "rondelle", stone: "tiger", size: 0.17 },
        { kind: "round", stone: "tigerBlue", size: 0.19 },
      ]),
      { kind: "rondelle", stone: "tiger", size: 0.17 },
    ],
  },
  {
    key: "onyx",
    name: "Black obsidian",
    stones: "Tap-to-Connect · signet centerpiece",
    swatch: ["#0b0b0c", "#3d3e44"],
    href: "/shop/tap-to-connect-bracelet?style=black-obsidian",
    beads: [
      { kind: "square", stone: "onyxPolished", cap: "coilOnyx", size: 0.3 },
      { kind: "rondelle", stone: "hematite", size: 0.15 },
      ...repeat(16, [{ kind: "round", stone: "onyxPolished", size: 0.2 }]),
      { kind: "rondelle", stone: "hematite", size: 0.15 },
    ],
  },
  {
    key: "agate-hematite",
    name: "Matte agate & hematite",
    stones: "Logo charm style",
    swatch: ["#6c6d6e", "#3d3e44"],
    href: "/shop/logo-charm-bracelet",
    beads: [
      { kind: "oval", stone: "onyxPolished", cap: "coilOnyx", size: 0.3 },
      { kind: "round", stone: "hematite", size: 0.09 },
      ...repeat(4, [
        { kind: "round", stone: "agateMatte", size: 0.21 },
        { kind: "round", stone: "agateMatte", size: 0.21 },
        { kind: "rondelle", stone: "hematite", size: 0.15 },
      ]),
      { kind: "round", stone: "agateMatte", size: 0.21 },
      { kind: "round", stone: "hematite", size: 0.09 },
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
    case "hex":
    case "square":
      return b.size * 1.9;
    case "oval":
      return b.size * 2.4;
  }
}
