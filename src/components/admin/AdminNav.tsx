"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/requests", label: "Requests" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
      {items.map((i) => {
        const on = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={on ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2.5 font-medium transition-colors ${on ? "bg-bone text-onyx" : "text-bone hover:bg-onyx-2"}`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
