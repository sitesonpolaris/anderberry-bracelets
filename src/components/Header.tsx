"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart/CartProvider";
import { Wordmark } from "./Logo";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?c=tap-to-connect", label: "Tap-to-Connect" },
  { href: "/custom", label: "Custom orders" },
  { href: "/story", label: "Our story" },
];

export default function Header() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const path = usePathname();

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  return (
    <header className="sticky top-0 z-40 bg-bone">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-onyx focus:px-4 focus:py-2 focus:text-bone">
        Skip to content
      </a>
      <div className="wrap flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" aria-label="AnderBerry Bracelets home" className="shrink-0 transition-opacity hover:opacity-70">
          <Wordmark className="h-10 w-auto sm:h-11" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-[1rem] font-medium underline-offset-[6px] hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen(true)} className="btn btn-ink !min-h-11 !px-5" aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}>
            Bag
            <span className="tabular grid h-6 min-w-6 place-items-center rounded-full bg-gold px-1.5 text-sm text-onyx">{count}</span>
          </button>
          <button
            type="button"
            className="btn btn-quiet !min-h-11 !px-4 lg:hidden"
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!menu}
        className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto bg-bone lg:hidden"
      >
        <ul className="wrap flex flex-col gap-1 pt-6">
          {[{ href: "/", label: "Home" }, ...links].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="block py-3 font-display text-[2.5rem] leading-tight">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
