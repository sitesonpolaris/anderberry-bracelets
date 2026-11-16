"use client";
import * as THREE from "three";

// Procedural stone textures drawn on canvas — no downloads, matched to the real beads.

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

function tex(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Tiger eye: wavy chatoyant bands of honey, umber and gold with fine fibres. */
function tigerEye(palette: string[], seed: number) {
  const [c, g] = canvas(512, 256);
  const r = rand(seed);
  for (let x = 0; x < 512; x++) {
    const band = Math.sin(x * 0.045 + Math.sin(x * 0.011) * 3) * 0.5 + 0.5;
    const i = Math.min(palette.length - 1, Math.floor(band * palette.length));
    g.fillStyle = palette[i];
    g.fillRect(x, 0, 1, 256);
  }
  g.globalAlpha = 0.18;
  for (let k = 0; k < 900; k++) {
    g.strokeStyle = r() > 0.5 ? "#f6d58a" : "#1c0f05";
    g.lineWidth = r() * 1.4;
    const x = r() * 512;
    g.beginPath();
    g.moveTo(x, 0);
    g.bezierCurveTo(x + r() * 20 - 10, 85, x + r() * 20 - 10, 170, x + r() * 10 - 5, 256);
    g.stroke();
  }
  return tex(c);
}

/** Mottled stone (matte agate, picture jasper). */
function mottled(base: string, spots: string[], seed: number, veins = false) {
  const [c, g] = canvas(512, 256);
  const r = rand(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 256);
  for (let k = 0; k < 220; k++) {
    g.globalAlpha = 0.06 + r() * 0.12;
    g.fillStyle = spots[Math.floor(r() * spots.length)];
    g.beginPath();
    g.ellipse(r() * 512, r() * 256, 10 + r() * 60, 6 + r() * 30, r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  if (veins) {
    g.globalAlpha = 0.55;
    g.strokeStyle = "#3a2513";
    for (let k = 0; k < 26; k++) {
      g.lineWidth = 0.6 + r() * 1.6;
      g.beginPath();
      let x = r() * 512, y = r() * 256;
      g.moveTo(x, y);
      for (let s = 0; s < 6; s++) {
        x += r() * 60 - 30;
        y += r() * 40 - 20;
        g.lineTo(x, y);
      }
      g.stroke();
    }
  }
  return tex(c);
}

/** The copper NFC antenna coil seen through the resin face of the centerpiece. */
function nfcCoil(face: string) {
  const [c, g] = canvas(512, 512);
  g.fillStyle = face;
  g.fillRect(0, 0, 512, 512);
  g.save();
  g.translate(256, 256);
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
  return tex(c);
}

export type StoneKey =
  | "tiger"
  | "tigerRed"
  | "tigerBlue"
  | "onyxPolished"
  | "onyxMatte"
  | "hematite"
  | "agateMatte"
  | "jasper"
  | "coilAmber"
  | "coilJasper"
  | "coilOnyx";

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

  return {
    tiger: gloss(tigerEye(["#24130a", "#4e2c0e", "#8a5a1c", "#c18a30", "#5e3a12"], 7)),
    tigerRed: gloss(tigerEye(["#2a0d08", "#5e1b19", "#8c3020", "#a8492a", "#4a1810"], 11)),
    tigerBlue: gloss(tigerEye(["#101418", "#26313a", "#4a5864", "#6b7884", "#1b2229"], 19)),
    onyxPolished: new THREE.MeshPhysicalMaterial({ color: "#0b0b0c", roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 }),
    onyxMatte: new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.62, metalness: 0 }),
    hematite: new THREE.MeshStandardMaterial({ color: "#3d3e44", roughness: 0.16, metalness: 1 }),
    agateMatte: new THREE.MeshStandardMaterial({ map: mottled("#4b4c4e", ["#9a9a98", "#1c1c1d", "#6c6d6e"], 23), roughness: 0.7 }),
    jasper: gloss(mottled("#a8875e", ["#6b4c2c", "#d8bf94", "#4a3420"], 29, true), { anisotropy: 0 }),
    coilAmber: gloss(nfcCoil("#6b4210"), { anisotropy: 0, clearcoat: 1, roughness: 0.15 }),
    coilJasper: gloss(nfcCoil("#9c7c55"), { anisotropy: 0 }),
    coilOnyx: new THREE.MeshPhysicalMaterial({ map: nfcCoil("#0d0b09"), roughness: 0.1, clearcoat: 1 }),
  };
}
