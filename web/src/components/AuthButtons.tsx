import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Icons } from "./icons";
import StaffLink from "./StaffLink";
import { clerkEnabled } from "@/lib/clerk";

/* Right side of the TopNav. With Clerk keys: real auth (modal sign-in, avatar
   menu). Without: the same buttons, disabled, so the chrome never changes shape. */
export default function AuthButtons() {
  if (!clerkEnabled) {
    return (
      <>
        <button className="btn btn-ghost btn-sm" disabled title="Auth not configured yet">
          Sign in
        </button>
        <button className="btn btn-primary btn-sm" disabled title="Auth not configured yet">
          Get started
        </button>
      </>
    );
  }
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="btn btn-ghost btn-sm">Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="btn btn-primary btn-sm">Get started</button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <StaffLink />
        <Link href="/settings" className="iconbtn" title="API & settings" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icons.settings size={17} />
        </Link>
        <UserButton />
      </Show>
    </>
  );
}
