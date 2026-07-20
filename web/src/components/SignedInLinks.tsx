import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/clerk";

/* Nav destinations that only exist for signed-in users. */
export default function SignedInLinks() {
  if (!clerkEnabled) return null;
  return (
    <Show when="signed-in">
      <Link href="/ideas" className="btn btn-ghost btn-sm">My ideas</Link>
      <Link href="/settings" className="btn btn-ghost btn-sm">Settings</Link>
    </Show>
  );
}
