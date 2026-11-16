"use client";
import { useEffect } from "react";

/**
 * Staggered entrances: every [data-reveal] rises in once as it enters the viewport.
 * Watches the DOM for new elements, so content swapped in by client navigation
 * (e.g. /shop?c=… category changes, which keep the same pathname) is revealed too.
 * Content stays visible without JS, and with reduced motion.
 */
export default function SiteMotion() {
  useEffect(() => {
    document.documentElement.classList.add("js");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const track = (el: Element) => {
      if (el.classList.contains("is-in")) return;
      if (reduced || el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      else io.observe(el);
    };
    const scan = (root: ParentNode) => {
      if (root instanceof Element && root.matches("[data-reveal]")) track(root);
      root.querySelectorAll("[data-reveal]").forEach(track);
    };

    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && scan(n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
  return null;
}
