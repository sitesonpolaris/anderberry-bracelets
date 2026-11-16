"use client";

import { useEffect, useRef, useState } from "react";
import RichText from "./RichText";

/**
 * Product description, shortened to a few lines with a Read more toggle.
 * The full text is always in the HTML (search engines, no-JS visitors);
 * it is only clamped once the page has loaded, and only if it is actually long.
 */
export default function ProductDescription({ text, lines = 4 }: { text: string; lines?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !mounted || open) return;
    const check = () => setLong(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted, open, text]);

  if (!text.trim()) return null;
  const clamped = mounted && !open;

  return (
    <section aria-labelledby="about-piece" className="mt-10">
      <h2 id="about-piece" className="font-sans text-[1.05rem] font-semibold tracking-normal">
        About this piece
      </h2>
      <RichText
        ref={ref}
        id="product-description"
        text={text}
        className="mt-2 text-[1.05rem] leading-relaxed"
      />
      {/* clamp via a scoped rule so the line count can vary without generating classes */}
      {clamped && (
        <style>{`#product-description{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${lines};overflow:hidden}`}</style>
      )}
      {mounted && (long || open) && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="product-description"
          onClick={() => setOpen((o) => !o)}
          className="link mt-2 font-medium"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </section>
  );
}
