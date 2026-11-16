"use client";
import * as THREE from "three";

// Procedural stone textures drawn on canvas — no downloads, colors taken from the
// owner's photos of each ConnecQ Tap-to-Connect stone.

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function tex(c: HTMLCanvasElement, color = true) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

const W = 512, H = 256;

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** Tiger eye: soft, wavy chatoyant bands (smoothly blended) with fine fibres. */
function drawTiger(g: CanvasRenderingContext2D, palette: string[], seed: number, freq = 0.03) {
  const r = rand(seed);
  const cols = palette.map(hex);
  const img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const warp = Math.sin(y * 0.021 + seed) * 46 + Math.sin(y * 0.057 + seed * 2) * 14;
    for (let x = 0; x < W; x++) {
      const xx = x + warp;
      const v = Math.sin(xx * freq + Math.sin(xx * 0.009 + seed) * 2.4) * 0.5 + 0.5; // 0..1
      const f = v * (cols.length - 1);
      const i = Math.floor(f), t = f - i;
      const a = cols[i], b = cols[Math.min(cols.length - 1, i + 1)];
      const o = (y * W + x) * 4;
      img.data[o] = a[0] + (b[0] - a[0]) * t;
      img.data[o + 1] = a[1] + (b[1] - a[1]) * t;
      img.data[o + 2] = a[2] + (b[2] - a[2]) * t;
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  g.globalAlpha = 0.14;
  for (let k = 0; k < 900; k++) {
    g.strokeStyle = r() > 0.5 ? "#f6d58a" : "#1c0f05";
    g.lineWidth = r() * 1.4;
    const x = r() * W;
    g.beginPath();
    g.moveTo(x, 0);
    g.bezierCurveTo(x + r() * 20 - 10, 85, x + r() * 20 - 10, 170, x + r() * 10 - 5, H);
    g.stroke();
  }
  g.globalAlpha = 1;
}

function tigerCanvas(palette: string[], seed: number) {
  const [c, g] = canvas(W, H);
  drawTiger(g, palette, seed);
  return c;
}

/** Blue/gold tiger eye: honey-gold stone with large navy-blue patches, as in the photo. */
function blueGoldCanvas(seed: number) {
  const [c, g] = canvas(W, H);
  const r = rand(seed);
  drawTiger(g, ["#0a1018", "#122030", "#1f3a4c", "#36586a", "#152430"], seed, 0.025);
  // honey-gold patches, softened at the edge
  const [p, pg] = canvas(W, H);
  drawTiger(pg, ["#6a4818", "#9c7330", "#c99a48", "#dcb262", "#8a6226"], seed + 5, 0.035);
  for (let k = 0; k < 11; k++) {
    const x = r() * W, y = r() * H, rx = 30 + r() * 70, ry = 20 + r() * 50;
    const mask = g.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    mask.addColorStop(0, "rgba(0,0,0,0.95)");
    mask.addColorStop(0.65, "rgba(0,0,0,0.75)");
    mask.addColorStop(1, "rgba(0,0,0,0)");
    g.save();
    g.beginPath();
    g.ellipse(x, y, rx, ry, r() * Math.PI, 0, Math.PI * 2);
    g.clip();
    g.globalAlpha = 0.85;
    g.drawImage(p, 0, 0);
    g.restore();
  }
  return c;
}

/** Mottled stone (matte agate, picture jasper). */
function mottledCanvas(base: string, spots: string[], seed: number, veins = false) {
  const [c, g] = canvas(W, H);
  const r = rand(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);
  for (let k = 0; k < 220; k++) {
    g.globalAlpha = 0.06 + r() * 0.12;
    g.fillStyle = spots[Math.floor(r() * spots.length)];
    g.beginPath();
    g.ellipse(r() * W, r() * H, 10 + r() * 60, 6 + r() * 30, r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  if (veins) {
    g.globalAlpha = 0.55;
    g.strokeStyle = "#3a2513";
    for (let k = 0; k < 26; k++) {
      g.lineWidth = 0.6 + r() * 1.6;
      g.beginPath();
      let x = r() * W, y = r() * H;
      g.moveTo(x, y);
      for (let s = 0; s < 6; s++) {
        x += r() * 60 - 30;
        y += r() * 40 - 20;
        g.lineTo(x, y);
      }
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  return c;
}

/** Leopard jasper: rosy mauve-grey ground with large irregular rust, ochre and brown blotches in dark rims. */
function leopardCanvas(seed: number) {
  const c = mottledCanvas("#8a6668", ["#b08880", "#4d3236", "#9a93a6", "#8e5240", "#6a5660", "#c9a07e"], seed);
  const g = c.getContext("2d")!;
  const r = rand(seed + 3);
  const blob = (cx: number, cy: number, rad: number) => {
    g.beginPath();
    for (let a = 0; a <= 14; a++) {
      const ang = (a / 14) * Math.PI * 2, rr = rad * (0.7 + r() * 0.5);
      const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * 0.75;
      if (a === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
  };
  for (let k = 0; k < 34; k++) {
    const x = r() * W, y = r() * H, rad = 10 + r() * 38;
    const fill = ["#a24e2c", "#c9902e", "#8a5a3a", "#b77a52", "#6a3a2e", "#d2a640"][Math.floor(r() * 6)];
    blob(x, y, rad);
    g.lineWidth = 2 + r() * 4;
    g.strokeStyle = "#241517";
    g.globalAlpha = 0.85;
    g.stroke();
    g.globalAlpha = 0.9;
    g.fillStyle = fill;
    g.fill();
    if (r() > 0.55) {
      blob(x + r() * 4, y + r() * 4, rad * 0.4);
      g.fillStyle = "#2a1a1c";
      g.fill();
    }
  }
  g.globalAlpha = 1;
  return c;
}

/** Snowflake jasper: pink-tan stone with irregular black blotches. */
function snowflakeCanvas(seed: number) {
  const [c, g] = canvas(W, H);
  const r = rand(seed);
  g.fillStyle = "#b28a7e";
  g.fillRect(0, 0, W, H);
  for (let k = 0; k < 120; k++) {
    g.globalAlpha = 0.15;
    g.fillStyle = r() > 0.5 ? "#e0c2b4" : "#9e7466";
    g.beginPath();
    g.ellipse(r() * W, r() * H, 8 + r() * 30, 6 + r() * 20, r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  for (let k = 0; k < 260; k++) {
    // jagged blotch
    const cx = r() * W, cy = r() * H, rad = 3 + r() * 22;
    g.beginPath();
    for (let a = 0; a <= 12; a++) {
      const ang = (a / 12) * Math.PI * 2;
      const rr = rad * (0.5 + r() * 0.8);
      const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * 0.8;
      if (a === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.fillStyle = r() > 0.15 ? "#131213" : "#4b5a72";
    g.fill();
  }
  return c;
}

/** Lava rock: near-black porous stone. Returns colour and bump canvases. */
function lavaCanvases(seed: number) {
  const [c, g] = canvas(W, H);
  const [b, bg] = canvas(W, H);
  const r = rand(seed);
  g.fillStyle = "#1c1c1e";
  g.fillRect(0, 0, W, H);
  bg.fillStyle = "#9a9a9a";
  bg.fillRect(0, 0, W, H);
  for (let k = 0; k < 2600; k++) {
    const x = r() * W, y = r() * H, rad = 0.6 + r() * r() * 5;
    g.fillStyle = r() > 0.5 ? "#0a0a0b" : "#2c2c2f";
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
    bg.fillStyle = `rgb(${20 + r() * 40},${20 + r() * 40},${20 + r() * 40})`;
    bg.beginPath();
    bg.arc(x, y, rad, 0, Math.PI * 2);
    bg.fill();
  }
  return [c, b] as const;
}

/** The copper NFC antenna coil seen through the resin face of the centerpiece. */
function coilCanvas(face: string | HTMLCanvasElement, scale = 1) {
  const [c, g] = canvas(512, 512);
  if (typeof face === "string") {
    g.fillStyle = face;
    g.fillRect(0, 0, 512, 512);
  } else g.drawImage(face, 0, 0, 512, 512);
  g.save();
  g.translate(256, 256);
  g.scale(scale, scale);
  g.strokeStyle = "#d9862c";
  g.lineCap = "round";
  g.lineWidth = 9;
  g.beginPath();
  for (let a = 0; a < Math.PI * 2 * 7; a += 0.03) {
    const rad = 70 + a * 6.2;
    const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
    if (a === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  g.fillStyle = "#c4741f";
  g.beginPath();
  g.arc(0, 0, 66, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#120c07";
  g.beginPath();
  g.arc(0, 0, 34, 0, Math.PI * 2);
  g.fill();
  g.restore();
  return c;
}

/** Mixed-color centerpiece: picture jasper with the amber NFC disc set into its face. */
function jasperDiscCanvas() {
  const [c, g] = canvas(512, 512);
  g.drawImage(mottledCanvas("#b08c60", ["#6b4c2c", "#d8bf94", "#4a3420"], 29, true), 0, 0, 512, 512);
  g.translate(256, 256);
  g.fillStyle = "#a85a12";
  g.beginPath();
  g.arc(0, 0, 150, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#e88a1c";
  g.beginPath();
  g.arc(0, 0, 138, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#c06a12";
  g.lineWidth = 7;
  for (const rad of [62, 92, 118]) {
    g.beginPath();
    g.arc(0, 0, rad, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#140c05";
  g.beginPath();
  g.arc(0, 0, 34, 0, Math.PI * 2);
  g.fill();
  return c;
}

/** Blue/gold centerpiece: clear resin over a yellow NFC disc with a dark centre. */
function resinDiscCanvas() {
  const [c, g] = canvas(512, 512);
  g.translate(256, 256);
  g.fillStyle = "#c8700f";
  g.beginPath();
  g.arc(0, 0, 175, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#f2a91f";
  g.beginPath();
  g.arc(0, 0, 160, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#d98a14";
  g.lineWidth = 6;
  for (const rad of [70, 105, 135]) {
    g.beginPath();
    g.arc(0, 0, rad, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#140c05";
  g.beginPath();
  g.arc(0, 0, 42, 0, Math.PI * 2);
  g.fill();
  return c;
}

// ---------------------------------------------------------------------------

const PALETTES = {
  tiger: ["#24130a", "#4e2c0e", "#8a5a1c", "#c18a30", "#5e3a12"],
  tigerHoney: ["#3b240c", "#6e4616", "#a8742a", "#d6a24a", "#7e5420"],
  tigerDark: ["#160d07", "#2f1d0d", "#4f3316", "#704b22", "#24160a"],
  tigerRed: ["#1e0806", "#3e1210", "#5e1b19", "#7e2a1e", "#2e0c0a"],
  tigerBlue: ["#101418", "#26313a", "#4a5864", "#6b7884", "#1b2229"],
  hawk: ["#15181b", "#2c3136", "#4a5056", "#686e74", "#202428"],
};

/** Canvases for each stone, used both by the 3D materials and the swatch buttons. */
const CANVAS: Record<string, () => HTMLCanvasElement> = {
  tiger: () => tigerCanvas(PALETTES.tiger, 7),
  tigerHoney: () => tigerCanvas(PALETTES.tigerHoney, 13),
  tigerDark: () => tigerCanvas(PALETTES.tigerDark, 17),
  tigerRed: () => tigerCanvas(PALETTES.tigerRed, 11),
  tigerBlue: () => tigerCanvas(PALETTES.tigerBlue, 19),
  hawk: () => tigerCanvas(PALETTES.hawk, 23),
  blueGold: () => blueGoldCanvas(31),
  leopard: () => leopardCanvas(37),
  snowflake: () => snowflakeCanvas(41),
  lava: () => lavaCanvases(43)[0],
  jasper: () => mottledCanvas("#a8875e", ["#6b4c2c", "#d8bf94", "#4a3420"], 29, true),
};

export type StoneKey =
  | "tiger"
  | "tigerHoney"
  | "tigerDark"
  | "tigerRed"
  | "tigerBlue"
  | "hawk"
  | "blueGold"
  | "leopard"
  | "snowflake"
  | "lava"
  | "jasper"
  | "onyxPolished"
  | "onyxMatte"
  | "obsidian"
  | "spacerMatte"
  | "hematite"
  | "agateMatte"
  | "resin"
  | "coilAmber"
  | "coilJasper"
  | "coilOnyx"
  | "resinDisc";

export function makeMaterials(): Record<StoneKey, THREE.Material> {
  const gloss = (map: THREE.Texture, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
    new THREE.MeshPhysicalMaterial({
      map,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      anisotropy: 0.9,
      anisotropyRotation: Math.PI / 2,
      ...extra,
    });
  const polished = (map: THREE.Texture) => gloss(map, { anisotropy: 0, roughness: 0.18 });
  const [lavaColor, lavaBump] = lavaCanvases(43);

  return {
    tiger: gloss(tex(CANVAS.tiger())),
    tigerHoney: gloss(tex(CANVAS.tigerHoney())),
    tigerDark: gloss(tex(CANVAS.tigerDark())),
    tigerRed: gloss(tex(CANVAS.tigerRed())),
    tigerBlue: gloss(tex(CANVAS.tigerBlue())),
    hawk: gloss(tex(CANVAS.hawk())),
    blueGold: gloss(tex(CANVAS.blueGold())),
    leopard: polished(tex(CANVAS.leopard())),
    snowflake: polished(tex(CANVAS.snowflake())),
    lava: new THREE.MeshStandardMaterial({ map: tex(lavaColor), bumpMap: tex(lavaBump, false), bumpScale: 2.5, roughness: 1, metalness: 0 }),
    jasper: polished(tex(CANVAS.jasper())),
    onyxPolished: new THREE.MeshPhysicalMaterial({ color: "#0b0b0c", roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 }),
    obsidian: new THREE.MeshPhysicalMaterial({ color: "#070708", roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 }),
    onyxMatte: new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.62, metalness: 0 }),
    spacerMatte: new THREE.MeshStandardMaterial({ color: "#202124", roughness: 0.55, metalness: 0.35 }),
    hematite: new THREE.MeshStandardMaterial({ color: "#3d3e44", roughness: 0.16, metalness: 1 }),
    agateMatte: new THREE.MeshStandardMaterial({ map: tex(mottledCanvas("#4b4c4e", ["#9a9a98", "#1c1c1d", "#6c6d6e"], 23)), roughness: 0.7 }),
    resin: new THREE.MeshPhysicalMaterial({ color: "#fff6e4", roughness: 0.03, transmission: 1, thickness: 0.5, ior: 1.45, clearcoat: 1, transparent: true, opacity: 0.55 }),
    coilAmber: gloss(tex(coilCanvas("#6b4210")), { anisotropy: 0, roughness: 0.15 }),
    coilJasper: gloss(tex(jasperDiscCanvas()), { anisotropy: 0, roughness: 0.15 }),
    coilOnyx: new THREE.MeshPhysicalMaterial({ map: tex(coilCanvas("#0d0b09")), roughness: 0.1, clearcoat: 1 }),
    resinDisc: new THREE.MeshPhysicalMaterial({ map: tex(resinDiscCanvas()), transparent: true, alphaTest: 0.05, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02, side: THREE.DoubleSide }),
  };
}

const swatchCache = new Map<string, string>();

/** A small image of a stone, cut from the same texture the 3D model uses. */
export function stoneSwatch(key: keyof typeof CANVAS | "obsidian"): string {
  const hit = swatchCache.get(key);
  if (hit) return hit;
  const [c, g] = canvas(96, 96);
  if (key === "obsidian") {
    g.fillStyle = "#08080a";
    g.fillRect(0, 0, 96, 96);
  } else {
    g.drawImage(CANVAS[key](), 140, 60, 140, 140, 0, 0, 96, 96);
  }
  // a single soft highlight so it reads as a polished bead (lava stays matte)
  if (key !== "lava") {
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.beginPath();
    g.ellipse(34, 30, 14, 9, -0.6, 0, Math.PI * 2);
    g.fill();
  }
  const url = c.toDataURL("image/png");
  swatchCache.set(key, url);
  return url;
}
