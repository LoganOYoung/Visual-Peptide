import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { QuickSearch } from "@/components/QuickSearch";
import { PurityPulse } from "@/components/PurityPulse";
import { HeroTrajectoryView } from "@/components/HeroTrajectoryView";
import { getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/");

export const metadata: Metadata = {
  title: "Visual Peptide — Precision Without the Math",
  description:
    "Research-grade peptide calculators, visual syringe planner, 3D structure viewer, and purity verification. Verify before you source.",
  alternates: { canonical },
  openGraph: { url: canonical },
  twitter: { card: "summary_large_image" },
};

const TOOL_CARDS = [
  { href: "/tools/calculator", title: "Recon & Dosing", desc: "Concentration, diluent volume, dose per injection, syringe units (0.3 / 0.5 / 1 mL).", icon: "🧮" },
  { href: "/peptides", title: "Peptide Library", desc: "Browse by category: Metabolic, Repair, Cognitive. Search by name, CAS, or sequence.", icon: "📋" },
  { href: "/structure", title: "3D Structure", desc: "View structures in-site. Measure, export, and cite.", icon: "🧬" },
  { href: "/verify", title: "Purity & Verify", desc: "Third-party testing (Janoshik). Verify batch reports by task ID.", icon: "✓" },
  { href: "/tools/syringe-planner", title: "Syringe Planner", desc: "See exactly where to draw. Visual syringe with fill level for your dose.", icon: "💉" },
] as const;

const POPULAR_PEPTIDES = [
  { slug: "bpc-157", name: "BPC-157" },
  { slug: "semaglutide", name: "Semaglutide" },
  { slug: "tirzepatide", name: "Tirzepatide" },
  { slug: "ipamorelin", name: "Ipamorelin" },
  { slug: "tb-500", name: "TB-500" },
  { slug: "pt-141", name: "PT-141" },
  { slug: "epithalon", name: "Epithalon" },
] as const;

export default function HomePage() {
  return (
    <div className="pb-4">
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-teal-50/80 via-white to-transparent"
        aria-label="Introduction"
      >
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 md:py-24">
          <p className="text-xs font-medium uppercase tracking-widest text-teal-600 sm:text-sm">
            Research-grade peptide platform
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
            Precision without the math
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            From peptide choice and structure view to dosing and reconstitution—all in one place, without switching between databases and calculators.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Research and education only. Not medical advice.
          </p>
          <div className="mt-8">
            <QuickSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/tools/calculator" className="btn-primary">
              Recon & Dosing Calculator
            </Link>
            <Link href="/tools/syringe-planner" className="btn-secondary">
              Visual Syringe
            </Link>
            <Link href="/peptides" className="btn-secondary">
              Peptide Library
            </Link>
            <Link href="/peptides/compare" className="btn-secondary">
              Compare
            </Link>
            <Link href="/guide" className="link-inline text-sm">
              New to peptides? Start with the Guide →
            </Link>
          </div>
        </div>
      </section>

      {/* 3D reaction demo: embedded molecule viewer */}
      <Suspense
        fallback={
          <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14" aria-label="3D reaction demo">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">3D reaction demo</h2>
            <p className="mt-1 text-slate-600">
              Multi-frame trajectory: peptide–receptor binding, conformation change. Preset data, no real-time simulation.
            </p>
            <div className="mt-6 flex min-h-[280px] items-center justify-center rounded-none border-2 border-slate-200 bg-slate-100 text-slate-500">
              Loading 3D viewer…
            </div>
          </section>
        }
      >
        <HeroTrajectoryView />
      </Suspense>

      {/* Tools */}
      <section
        className="mx-auto max-w-6xl px-4 py-10 sm:py-14"
        aria-labelledby="tools-heading"
      >
        <h2 id="tools-heading" className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Tools & reference
        </h2>
        <p className="mt-1 text-slate-600">
          Concentration and dose, peptide library, 3D structure, and purity verification.{" "}
          <Link href="/tools" className="link-inline font-medium">All tools →</Link>
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-6">
          {TOOL_CARDS.map((item, i) => {
            const isMain = i < 2;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`card group flex min-h-[140px] flex-col transition hover:shadow-lg ${
                  isMain
                    ? "border-teal-300 bg-teal-50/50 hover:border-teal-400 hover:shadow-teal-500/10 sm:col-span-3"
                    : "hover:border-teal-500/50 hover:shadow-teal-500/5 sm:col-span-2"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {item.icon}
                </span>
                <h3 className={`mt-3 font-semibold text-slate-900 group-hover:text-teal-600 ${isMain ? "text-lg" : ""}`}>
                  {item.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-slate-600">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular peptides + Purity Pulse */}
      <section
        className="mx-auto max-w-6xl px-4 py-10 sm:py-14"
        aria-labelledby="peptides-heading"
      >
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 id="peptides-heading" className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Popular peptides
            </h2>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Quick links to common research peptides. See{" "}
              <Link href="/peptides" className="link-inline">library</Link>
              {" "}or{" "}
              <Link href="/peptides/compare" className="link-inline">compare</Link>
              {" "}up to 3.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
              {POPULAR_PEPTIDES.map((p) => (
                <Link
                  key={p.slug}
                  href={`/peptides/${p.slug}`}
                  className="inline-flex min-h-[44px] items-center rounded-none border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <PurityPulse />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10" aria-label="Verify">
        <p className="text-slate-600">
          Verify before you source: check third-party test reports (e.g. Janoshik) by task ID.{" "}
          <Link href="/verify" className="link-inline font-medium">
            Open Verify →
          </Link>
        </p>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pt-4 pb-8 text-center text-xs text-slate-500">
        <p>For research and education only. Not medical advice. Verify purity with third-party testing when sourcing.</p>
        <nav className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1" aria-label="Footer">
          <Link href="/tools" className="link-inline inline-flex min-h-[44px] items-center sm:min-h-0">Tools</Link>
          <Link href="/peptides" className="link-inline inline-flex min-h-[44px] items-center sm:min-h-0">Peptides</Link>
          <Link href="/structure" className="link-inline inline-flex min-h-[44px] items-center sm:min-h-0">3D Structure</Link>
          <Link href="/verify" className="link-inline inline-flex min-h-[44px] items-center sm:min-h-0">Verify</Link>
          <Link href="/guide" className="link-inline inline-flex min-h-[44px] items-center sm:min-h-0">Guide</Link>
          <Link href="/faq" className="link-inline inline-flex min-h-[44px] items-center sm:min-h-0">FAQ</Link>
          <Link href="/about" className="link-inline inline-flex min-h-[44px] items-center sm:min-h-0">About</Link>
        </nav>
      </footer>
    </div>
  );
}
