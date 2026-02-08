import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { toolsSubLinks } from "@/lib/nav";
import { getBaseUrl, getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/tools");
const base = getBaseUrl();

const TOOL_CARDS: { href: string; label: string; desc: string; icon: string }[] = [
  { href: "/tools/calculator", label: "Recon & Dosing", desc: "Concentration, diluent volume, dose per injection, syringe units (0.3/0.5/1 mL).", icon: "🧮" },
  { href: "/tools/syringe-planner", label: "Syringe Planner", desc: "Visual syringe: see exactly where to draw. Enter recon and dose — fill level shown.", icon: "💉" },
  { href: "/tools/vial-cycle", label: "Vial & Cycle", desc: "How many days one vial lasts; how many vials for a target period.", icon: "📅" },
  { href: "/tools/unit-converter", label: "Unit Converter", desc: "mcg ↔ mg, and common peptide unit conversions.", icon: "↔" },
  { href: "/tools/cost", label: "Cost per Dose", desc: "Price per vial, mg per vial, dose (mcg) → cost per injection.", icon: "💰" },
];

const TOOLS_ITEMLIST_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Peptide research tools",
  description: "Reconstitution, dosing, syringe planner, unit converter, cost per dose.",
  numberOfItems: TOOL_CARDS.length,
  itemListElement: TOOL_CARDS.map((card, i) => ({
    "@type": "ListItem" as const,
    position: i + 1,
    name: card.label,
    url: `${base}${card.href}`,
    description: card.desc,
  })),
};

export const metadata: Metadata = {
  title: "Tools",
  description: "Recon & dosing calculator, syringe planner, vial & cycle, unit converter, cost per dose. Research peptide calculators.",
  alternates: { canonical },
  openGraph: { url: canonical },
};

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(TOOLS_ITEMLIST_JSONLD) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools" }]} baseUrl={getBaseUrl()} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Tools</h1>
      <p className="mt-2 text-slate-600">
        Calculators and utilities for reconstitution, dosing, cycle planning, units, and cost.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {TOOL_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="card block min-h-[120px] transition hover:border-teal-400"
          >
            <span className="text-2xl">{card.icon}</span>
            <h2 className="mt-3 font-semibold text-slate-900">{card.label}</h2>
            <p className="mt-1 text-sm text-slate-400">{card.desc}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-500">
        <Link href="/guide" className="link-inline">Guide</Link>
        {" · "}
        <Link href="/faq" className="link-inline">FAQ</Link>
        {" · "}
        <Link href="/peptides" className="link-inline">Peptide Library</Link>
      </p>
    </div>
  );
}
