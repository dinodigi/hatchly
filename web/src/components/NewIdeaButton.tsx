import Link from "next/link";

/* "+ New idea" — routes into the dedicated onboarding step (/ideas/new), which
   collects the intake and creates the titled idea + pre-made chats. A plain
   link, so there's no in-flight state to get stuck on. */
export default function NewIdeaButton({ label = "New idea" }: { label?: string }) {
  return (
    <Link href="/ideas/new" className="btn btn-primary">
      + {label}
    </Link>
  );
}
