"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { strands } from "./strands";

const BraceletScene = dynamic(() => import("./BraceletScene"), { ssr: false });

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function BraceletHero() {
  const [index, setIndex] = useState(0);
  const [gl, setGl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const strand = strands[index];

  useEffect(() => {
    setGl(canWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (stage.current) io.observe(stage.current);
    return () => {
      mq.removeEventListener("change", onChange);
      io.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={stage}
        className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-bone-2 sm:aspect-[5/4] lg:aspect-[6/5]"
        role="img"
        aria-label={`3D model of the ${strand.name} bracelet. Drag sideways to turn it.`}
      >
        {/* Real product photo shows until the 3D model is ready, and stays if WebGL is unavailable */}
        <Image
          src="/products/ttc-tiger-onyx-hex.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className={`object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
        />
        {gl && <BraceletScene strand={strand} reduced={reduced} active={active} onReady={() => setReady(true)} />}
        {gl && ready && (
          <p className="pointer-events-none absolute bottom-4 left-5 text-sm text-hematite">Drag to turn it</p>
        )}
      </div>

      <div>
        <p id="strand-label" className="mb-3 text-sm text-hematite">
          Restring it: pick a stone
        </p>
        <div role="radiogroup" aria-labelledby="strand-label" className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {strands.map((s, i) => (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={i === index}
              onClick={() => setIndex(i)}
              className={`group flex shrink-0 items-center gap-3 rounded-full py-2 pl-2 pr-4 text-left transition-colors duration-200 ${
                i === index ? "bg-onyx text-bone" : "bg-bone-2 text-onyx hover:bg-[#ddd5c6]"
              }`}
            >
              <span aria-hidden className="relative block h-9 w-9 overflow-hidden rounded-full transition-transform duration-200 group-active:scale-90">
                <span className="absolute inset-0" style={{ background: s.swatch[0] }} />
                <span className="absolute inset-y-0 right-0 w-1/2" style={{ background: s.swatch[1] }} />
              </span>
              <span className="text-[0.95rem] font-medium leading-tight">{s.name}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-hematite">{strand.stones}</span>
          <Link href={strand.href} className="link font-medium">
            See this piece
          </Link>
        </p>
      </div>
    </div>
  );
}
