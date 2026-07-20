"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* Fires POST /api/bootstrap once per signed-in session — provisions the
   users row, wallet, and signup grant on first sign-in, no-ops after. */
export default function Bootstrapper() {
  const { isSignedIn } = useAuth();
  const done = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn || done.current) return;
    done.current = true;
    fetch("/api/bootstrap", { method: "POST" })
      .then((r) => r.json())
      .then(() => router.refresh()) // wallet chip renders server-side
      .catch(() => {
        done.current = false; // allow retry next mount
      });
  }, [isSignedIn, router]);

  return null;
}
