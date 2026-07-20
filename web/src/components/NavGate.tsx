"use client";

import { usePathname } from "next/navigation";

/* v4 hides the global TopNav inside the idea hub — the hub renders its own
   chrome row (visibility · bucks · new idea · account). */
export default function NavGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (/^\/ideas\/[^/]+/.test(pathname)) return null;
  return <>{children}</>;
}
