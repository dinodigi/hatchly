import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import OnboardingFlow from "@/components/OnboardingFlow";
import { Icons } from "@/components/icons";
import { loadOnboardingQuestions } from "@/lib/onboarding";
import { clerkEnabled } from "@/lib/clerk";

/* The dedicated idea-onboarding step. `/ideas/new` is a static segment, so it
   takes precedence over `/ideas/[id]` — no route collision. */

export const metadata = { title: "New idea — Hatchly" };
export const dynamic = "force-dynamic";

export default async function NewIdeaPage() {
  if (!clerkEnabled) redirect("/");
  const { userId } = await auth();
  if (!userId) redirect("/");

  const questions = await loadOnboardingQuestions();

  return (
    <div className="scrollarea" style={{ height: "100%" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "34px 24px 70px" }}>
        <Link href="/ideas" style={{ color: "var(--text-secondary)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Icons.back size={15} /> Ideas
        </Link>
        <div style={{ marginTop: 26 }}>
          {questions.length ? (
            <OnboardingFlow questions={questions} />
          ) : (
            <p className="muted" style={{ fontSize: 14 }}>
              Onboarding isn&apos;t configured yet — add questions in the admin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
