/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import AuthButtons from "./AuthButtons";
import NavLinks from "./NavLinks";
import NewIdeaButton from "./NewIdeaButton";
import ThemeToggle from "./ThemeToggle";
import WalletChip from "./WalletChip";
import { Show } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/clerk";

/* Shared chrome — v4's TopNav (Design/app/nav.jsx): logo images (light/dark),
   underlined nav links, bucks chip + claim, New idea, account. */
export default function TopNav() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "color-mix(in srgb, var(--background) 86%, transparent)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px", height: 62, display: "flex", alignItems: "center", gap: 26 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <span className="hatchly-logo" style={{ display: "inline-flex", alignItems: "center", height: 26 }}>
            <img className="hatchly-logo-light" src="/brand/hatchly-logo.png" alt="Hatchly" style={{ height: 26, width: "auto" }} />
            <img className="hatchly-logo-dark" src="/brand/hatchly-logo-dark.png" alt="Hatchly" style={{ height: 26, width: "auto" }} />
          </span>
        </Link>
        <NavLinks />
        <div style={{ flex: 1 }} />
        {clerkEnabled ? (
          <>
            <Show when="signed-in">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <WalletChip />
                <NewIdeaButton />
                <AuthButtons />
              </div>
            </Show>
            <Show when="signed-out">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <ThemeToggle />
                <AuthButtons />
              </div>
            </Show>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <ThemeToggle />
            <AuthButtons />
          </div>
        )}
      </div>
    </div>
  );
}
