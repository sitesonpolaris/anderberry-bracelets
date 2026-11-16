"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { makeMaterials, type StoneKey } from "./materials";
import { beadLength, type Bead, type Strand } from "./strands";

const GAP = 0.012;
const CENTER_TILT = 0.35;

type Placed = { bead: Bead; matrix: THREE.Matrix4; index: number };

function layout(beads: Bead[]) {
  const lengths = beads.map(beadLength);
  const total = lengths.reduce((a, b) => a + b + GAP, 0);
  const R = total / (Math.PI * 2);
  const placed: Placed[] = [];
  let s = 0;
  const theta0 = Math.PI / 2 - lengths[0] / 2 / R; // centerpiece faces the camera
  beads.forEach((bead, index) => {
    const theta = theta0 + (s + lengths[index] / 2) / R;
    s += lengths[index] + GAP;
    const radial = new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta));
    const tangent = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta));
    const up = new THREE.Vector3(0, 1, 0);
    const m = new THREE.Matrix4();
    const centerpiece = bead.kind === "hex" || bead.kind === "square" || bead.kind === "oval";
    if (bead.kind === "rondelle") m.makeBasis(radial, tangent, new THREE.Vector3().crossVectors(radial, tangent));
    else if (centerpiece) {
      // Face points outward like on the wrist, tipped up a little toward the viewer
      const face = radial.clone().multiplyScalar(Math.cos(CENTER_TILT)).addScaledVector(up, Math.sin(CENTER_TILT)).normalize();
      m.makeBasis(tangent, face, new THREE.Vector3().crossVectors(tangent, face));
    } else m.makeBasis(tangent, radial, up);
    const lift = centerpiece ? 0.03 : 0;
    m.setPosition(radial.clone().multiplyScalar(R + lift));
    placed.push({ bead, matrix: m, index });
  });
  return { placed, R };
}

const geo = {
  round: new THREE.SphereGeometry(1, 40, 28),
  rondelle: (() => {
    // Rounded drum: a lathe profile with softened edges
    const pts: THREE.Vector2[] = [];
    const h = 0.35, r = 1, e = 0.12;
    pts.push(new THREE.Vector2(0.18, -h));
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - e + Math.cos(a) * e, -h + e + Math.sin(a) * e));
    }
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - e + Math.cos(a) * e, h - e + Math.sin(a) * e));
    }
    pts.push(new THREE.Vector2(0.18, h));
    const g = new THREE.LatheGeometry(pts, 48);
    // Planar UVs so tiger eye bands run straight across the bead, as in a cut stone
    const pos = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + 1) / 2, (pos.getY(i) + pos.getZ(i) + 1.35) / 2.7);
    uv.needsUpdate = true;
    return g;
  })(),
  hex: new THREE.CylinderGeometry(1, 1, 0.55, 6, 1),
  oval: new THREE.CylinderGeometry(1, 1, 0.42, 56, 1),
  // Cushion-cut signet: wide along the cord, rounded edges, face pointing out (+Y)
  square: new RoundedBoxGeometry(2, 0.7, 1.6, 4, 0.22),
  cube: new RoundedBoxGeometry(1.6, 1.6, 1.6, 2, 0.12),
};

/** Stable pseudo-random spin per bead so mixed stones don't look stamped out. */
function spin(i: number): [number, number, number] {
  const f = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return [f(1) * Math.PI * 2, f(2) * Math.PI * 2, f(3) * Math.PI * 2];
}

function BeadMesh({ p, mats, born, reduced }: { p: Placed; mats: Record<StoneKey, THREE.Material>; born: number; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const { bead } = p;
  const base = useMemo(() => {
    const pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
    p.matrix.decompose(pos, q, sc);
    return { pos, q };
  }, [p.matrix]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (reduced) {
      ref.current.scale.setScalar(1);
      return;
    }
    const t = (clock.elapsedTime - born - p.index * 0.018) / 0.42;
    const k = Math.min(1, Math.max(0, t));
    const eased = 1 - Math.pow(1 - k, 3);
    ref.current.scale.setScalar(Math.max(0.0001, eased));
  });

  const s = bead.size;
  const body = mats[bead.stone];
  const cap = bead.cap ? mats[bead.cap] : body;

  let mesh: React.ReactNode;
  switch (bead.kind) {
    case "round":
      mesh = <mesh geometry={geo.round} material={body} scale={s} rotation={spin(p.index)} castShadow />;
      break;
    case "rondelle":
      mesh = <mesh geometry={geo.rondelle} material={body} scale={[s, s, s]} />;
      break;
    case "hex":
      mesh = <mesh geometry={geo.hex} material={[body, cap, body]} scale={[s, s, s]} rotation={[0, Math.PI / 6, 0]} />;
      break;
    case "oval":
      mesh = <mesh geometry={geo.oval} material={[body, cap, body]} scale={[s * 1.2, s, s * 0.85]} />;
      break;
    case "square":
      mesh = <mesh geometry={geo.square} material={body} scale={[s, s, s]} />;
      break;
    case "cube":
      mesh = <mesh geometry={geo.cube} material={body} scale={[s, s, s]} rotation={[0, 0.2, 0]} />;
      break;
  }

  return (
    <group ref={ref} position={base.pos} quaternion={base.q}>
      {mesh}
    </group>
  );
}

function Strung({ strand, mats, reduced, yaw }: { strand: Strand; mats: Record<StoneKey, THREE.Material>; reduced: boolean; yaw: React.MutableRefObject<{ value: number; vel: number; dragging: boolean }> }) {
  const group = useRef<THREE.Group>(null);
  const { placed, R } = useMemo(() => layout(strand.beads), [strand]);
  const [born, setBorn] = useState(0);
  const clockRef = useRef(0);
  const aspect = useThree((st) => st.size.width / st.size.height);
  const fit = Math.min(1, aspect / 1.3); // narrower stages (phones) get a smaller bracelet

  useFrame(({ clock }, dt) => {
    clockRef.current = clock.elapsedTime;
    const y = yaw.current;
    if (!y.dragging) {
      y.vel *= Math.pow(0.04, dt); // inertia decay
      if (!reduced) y.value += dt * 0.22; // slow turn, like it's in your hand
      y.value += y.vel * dt;
    }
    if (group.current) {
      group.current.rotation.y = y.value;
    }
  });

  useEffect(() => {
    setBorn(clockRef.current);
  }, [strand]);

  return (
    <group ref={group} scale={(1.28 * fit) / R}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.018, 8, 160]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      {placed.map((p) => (
        <BeadMesh key={`${strand.key}-${p.index}`} p={p} mats={mats} born={born} reduced={reduced} />
      ))}
    </group>
  );
}

export default function BraceletScene({
  strand,
  reduced,
  active,
  onReady,
}: {
  strand: Strand;
  reduced: boolean;
  active: boolean;
  onReady?: () => void;
}) {
  const mats = useMemo(() => makeMaterials(), []);
  const yaw = useRef({ value: 0, vel: 0, dragging: false });
  const last = useRef<{ x: number; t: number } | null>(null);

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  return (
    <div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => {
        last.current = { x: e.clientX, t: performance.now() };
        yaw.current.dragging = true;
        yaw.current.vel = 0;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!last.current) return;
        const now = performance.now();
        const dx = e.clientX - last.current.x;
        const dt = Math.max(1, now - last.current.t) / 1000;
        yaw.current.value += dx * 0.012;
        yaw.current.vel = (dx * 0.012) / dt;
        last.current = { x: e.clientX, t: now };
      }}
      onPointerUp={() => {
        last.current = null;
        yaw.current.dragging = false;
      }}
      onPointerCancel={() => {
        last.current = null;
        yaw.current.dragging = false;
      }}
    >
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [0, 2.15, 4.7], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl, camera }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          camera.lookAt(0, -0.05, 0);
          onReady?.();
        }}
        aria-hidden
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <Strung strand={strand} mats={mats} reduced={reduced} yaw={yaw} />
        <ContactShadows position={[0, -0.42, 0]} opacity={0.42} scale={6} blur={2.6} far={1.4} color="#2a2118" frames={reduced ? 1 : Infinity} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={3} position={[0, 4, 1]} scale={[6, 2, 1]} rotation={[Math.PI / 2, 0, 0]} />
          <Lightformer form="rect" intensity={2.2} position={[-4, 1, 2]} scale={[2, 5, 1]} rotation={[0, Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={1.6} position={[4, 0.5, -1]} scale={[2, 4, 1]} rotation={[0, -Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={1.1} color="#ffe2b8" position={[0, 1.5, 5]} scale={[5, 1.2, 1]} />
          <Lightformer form="rect" intensity={0.6} color="#f2ede4" position={[0, -3, 0]} scale={[8, 8, 1]} rotation={[-Math.PI / 2, 0, 0]} />
        </Environment>
      </Canvas>
    </div>
  );
}
