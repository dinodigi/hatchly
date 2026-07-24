import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Bootstrapper from "@/components/Bootstrapper";
import FeedbackWidget from "@/components/FeedbackWidget";
import NavGate from "@/components/NavGate";
import TopNav from "@/components/TopNav";
import { clerkEnabled } from "@/lib/clerk";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

/**
 * Absolute base for og:image and friends. Without this Next falls back to
 * localhost, so every shared link would advertise a preview image no crawler
 * can fetch — the failure is invisible in dev and total in production.
 * Set NEXT_PUBLIC_SITE_URL for the real deployment.
 */
function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "Hatchly — where ideas get backed before they get built",
  description:
    "Browse what founders are shaping right now. Back the ones you believe in with Hatchly Bucks — no account needed to look.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shell = (
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body>
        {clerkEnabled && <Bootstrapper />}
        <NavGate>
          <TopNav />
        </NavGate>
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
  return clerkEnabled ? <ClerkProvider>{shell}</ClerkProvider> : shell;
}
