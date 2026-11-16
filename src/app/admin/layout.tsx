import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | AnderBerry admin" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#f7f4ee] text-[0.97rem]">{children}</div>;
}
