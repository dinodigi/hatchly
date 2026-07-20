"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "./icons";

/* The compose entry — v4's ComposeBar: click anywhere, land in a fresh idea. */
export default function ComposeBar({ initials }: { initials: string }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const post = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/ideas", { method: "POST" });
      const json = await res.json();
      if (res.status === 422 && json.code === "E_NO_KEY") {
        router.push("/settings?reason=key");
        return;
      }
      if (res.ok) router.push(`/ideas/${json.id}`);
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  };

  const inner = (
    <div
      onClick={isSignedIn ? post : undefined}
      className="card card-hover"
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", cursor: "pointer", marginBottom: 22 }}
    >
      <span className="avatar avatar-user" style={{ width: 34, height: 34, fontSize: 13 }}>{initials}</span>
      <span className="muted" style={{ flex: 1, fontSize: 15 }}>
        {busy ? "Starting your idea…" : "Share an idea — a sentence is enough."}
      </span>
      <span className="btn btn-primary btn-sm">
        <Icons.sparkle size={15} /> Start
      </span>
    </div>
  );

  if (!isSignedIn) return <SignInButton mode="modal">{inner}</SignInButton>;
  return inner;
}
