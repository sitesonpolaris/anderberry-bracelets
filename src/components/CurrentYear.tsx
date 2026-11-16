"use client";
import { useEffect, useState } from "react";

// Computed on the client so cached pages never show a stale year.
export function CurrentYear() {
  const [y, setY] = useState(2026);
  useEffect(() => setY(new Date().getFullYear()), []);
  return <>{y}</>;
}
