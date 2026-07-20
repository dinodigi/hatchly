"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

/* v4 nav links — active page gets the amber underline. */
export default function NavLinks() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  const links: [string, string][] = [
    ["Stream", "/"],
    ["Quick Ideas", "/quick"],
    ["Leaderboard", "/leaderboard"],
    ...(isSignedIn ? ([["My ideas", "/ideas"]] as [string, string][]) : []),
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {links.map(([label, href]) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              padding: "6px 2px",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
