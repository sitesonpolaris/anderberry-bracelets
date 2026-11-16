"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";
import { stoneSwatch } from "./materials";
import { strands, TTC_SLUG } from "./strands";

const BraceletScene = dynamic(() => import("./BraceletScene"), { ssr: false });

/** Price and photo for each stone, read from the ConnecQ Tap-to-Connect product. */
export type StoneInfo = { key: string; price_cents: number | null; image?: string };

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function BraceletHero({ stones = [] }: { stones?: StoneInfo[] }) {
  const [index, setIndex] = useState(0);
  const [gl, setGl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [swatches, setSwatches] = useState<Record<string, string>>({});
  const stage = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const strand = strands[index];
  const info = stones.find((s) => s.key === strand.key);
  const href = `/shop/${TTC_SLUG}?style=${strand.key}`;

  useEffect(() => {
    setGl(canWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (stage.current) io.observe(stage.current);
    // Swatches are cut from the same textures the 3D stones use
    const sw: Record<string, string> = {};
    strands.forEach((s) => s.swatch.forEach((k) => (sw[k] ??= stoneSwatch(k))));
    setSwatches(sw);
    return () => {
      mq.removeEventListener("change", onChange);
      io.disconnect();
    };
  }, []);

  function pick(i: number, focus = false) {
    setIndex(i);
    if (focus) buttons.current[i]?.focus();
  }

  // Arrow keys move through the stones, as in any radio group
  function onKey(e: React.KeyboardEvent, i: number) {
    const n = strands.length;
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: n - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    pick((next + n) % n, true);
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={stage}
        className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-bone-2 sm:aspect-[5/4] lg:aspect-[6/5]"
        role="img"
        aria-label={`3D model of the ConnecQ Tap-to-Connect bracelet in ${strand.name}. Drag sideways to turn it.`}
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
        {gl && ready && <p className="pointer-events-none absolute bottom-4 left-5 text-sm text-hematite">Drag to turn it</p>}
      </div>

      <div>
        <p id="strand-label" className="mb-3 text-[0.95rem] font-semibold">
          ConnecQ Tap-to-Connect: pick a stone
        </p>
        <div role="radiogroup" aria-labelledby="strand-label" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {strands.map((s, i) => {
            const on = i === index;
            const price = stones.find((x) => x.key === s.key)?.price_cents;
            return (
              <button
                key={s.key}
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`group flex min-h-14 items-center gap-2.5 rounded-2xl py-2 pl-2 pr-3 text-left transition-colors duration-200 ${
                  on ? "bg-onyx text-bone" : "bg-bone-2 text-onyx hover:bg-bone-3"
                }`}
              >
                <span
                  aria-hidden
                  className={`relative block h-9 w-9 shrink-0 overflow-hidden rounded-full bg-onyx transition-transform duration-200 group-active:scale-90 ${on ? "outline-2 outline-offset-2 outline-gold" : ""}`}
                >
                  {swatches[s.swatch[0]] && (
                    <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${swatches[s.swatch[0]]})` }} />
                  )}
                  {s.swatch[1] !== s.swatch[0] && swatches[s.swatch[1]] && (
                    <span className="absolute inset-y-0 right-0 w-1/2 bg-cover bg-right" style={{ backgroundImage: `url(${swatches[s.swatch[1]]})` }} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9rem] font-medium leading-tight">{s.name}</span>
                  {price != null && <span className={`tabular block text-[0.8rem] ${on ? "text-ash" : "text-hematite"}`}>{money(price)}</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3" aria-live="polite">
          {info?.image && (
            <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bone-2" title={`Photo of the ${strand.name} bracelet`}>
              <Image src={info.image} alt={`Photo of the ${strand.name} bracelet`} fill sizes="56px" className="object-cover" />
            </span>
          )}
          <p className="min-w-0 flex-1">
            <span className="block font-semibold">
              {strand.name}
              {info?.price_cents != null && <span className="tabular font-normal text-hematite"> · {money(info.price_cents)}</span>}
            </span>
            <span className="block text-[0.95rem] text-hematite">{strand.detail}</span>
          </p>
          <Link href={href} className="btn btn-ink !min-h-11 !px-5">
            Shop this stone
          </Link>
        </div>
      </div>
    </div>
  );
}
