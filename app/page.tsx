import Link from "next/link";
import type { Metadata } from "next";
import { QuickSearch } from "@/components/QuickSearch";
import { PurityPulse } from "@/components/PurityPulse";
import { getBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Visual Peptide — Precision Without the Math",
  description:
    "Research-grade peptide calculators, visual syringe planner, 3D structure viewer, and purity verification. Verify before you source.",
  alternates: { canonical: getBaseUrl() },
};

const TOOL_CARDS = [
  {
    href: "/tools/calculator",
    title: "Recon & Dosing",
    desc: "Concentration, diluent volume, dose per injection, syringe units (0.3 / 0.5 / 1 mL).",
    icon: "🧮",
  },
  {
    href: "/tools/syringe-planner",
    title: "Syringe Planner",
    desc: "See exactly where to draw. Visual syringe with fill level for your dose.",
    icon: "💉",
  },
  {
    href: "/peptides",
    title: "Peptide Library",
    desc: "Browse by category: Metabolic, Repair, Cognitive. Search by name, CAS, or sequence.",
    icon: "📋",
  },
  {
    href: "/structure",
    title: "3D Structure",
    desc: "PDB-based molecular viewer. View peptide structures in 3D.",
    icon: "🧬",
  },
  {
    href: "/verify",
    title: "Purity & Verify",
    desc: "Third-party testing (Janoshik). Verify batch reports by task ID.",
    icon: "✓",
  },
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
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-teal-600">
            Research-grade peptide platform
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Precision without the math
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            From 3D structure to syringe draw — calculators, dosing, vial planning, and purity verification in one place.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Research and education only. Not medical advice.
          </p>
          <div className="mt-8">
            <QuickSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/tools/syringe-planner" className="btn-primary">
              Visual Syringe Planner
            </Link>
            <Link href="/tools/calculator" className="btn-secondary">
              Calculator
            </Link>
            <Link href="/peptides" className="btn-secondary">
              Peptide Library
            </Link>
            <Link href="/guide" className="link-inline text-sm">
              Reconstitution guide →
            </Link>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section
        className="mx-auto max-w-6xl px-4 py-14"
        aria-labelledby="tools-heading"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="tools-heading" className="text-2xl font-semibold text-slate-900">
            Tools
          </h2>
          <Link href="/tools" className="link-inline text-sm font-medium">
            All tools (Vial & Cycle, Unit Converter, Cost) →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TOOL_CARDS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card group flex min-h-[140px] flex-col transition hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5"
            >
              <span className="text-2xl" aria-hidden>
                {item.icon}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-teal-600">
                {item.title}
              </h3>
              <p className="mt-1 flex-1 text-sm text-slate-600">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular peptides + Purity Pulse */}
      <section
        className="mx-auto max-w-6xl px-4 py-14"
        aria-labelledby="peptides-heading"
      >
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 id="peptides-heading" className="text-2xl font-semibold text-slate-900">
              Popular peptides
            </h2>
            <p className="mt-1 text-slate-600">
              Quick links to common research peptides. See{" "}
              <Link href="/peptides" className="link-inline">library</Link>
              {" "}or{" "}
              <Link href="/peptides/compare" className="link-inline">compare</Link>
              {" "}up to 3.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {POPULAR_PEPTIDES.map((p) => (
                <Link
                  key={p.slug}
                  href={`/peptides/${p.slug}`}
                  className="rounded-none border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
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

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14" aria-label="Verify">
        <div className="card border-teal-200 bg-teal-50/50 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Verify before you source
          </h2>
          <p className="mt-2 text-slate-600">
            Use our{" "}
            <Link href="/verify" className="link-inline">
              Purity & Verify
            </Link>{" "}
            tools to check third-party test reports (e.g. Janoshik) when evaluating purity.
          </p>
          <Link
            href="/verify"
            className="mt-5 inline-block rounded-none bg-teal-600 px-5 py-2.5 font-medium text-white transition hover:bg-teal-700"
          >
            Open Verify
          </Link>
        </div>
      </section>

      <p className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500">
        For research and education only. Not medical advice. Verify purity with third-party testing when sourcing.
      </p>
    </div>
  );
}
