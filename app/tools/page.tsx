import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { toolsSubLinks } from "@/lib/nav";
import { getBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tools",
  description: "Recon & dosing calculator, vial & cycle, unit converter, cost per dose.",
  alternates: { canonical: `${getBaseUrl()}/tools` },
};

const TOOL_CARDS: { href: string; label: string; desc: string; icon: string }[] = [
  { href: "/tools/calculator", label: "Recon & Dosing", desc: "Concentration, diluent volume, dose per injection, syringe units (0.3/0.5/1 mL).", icon: "🧮" },
  { href: "/tools/syringe-planner", label: "Syringe Planner", desc: "Visual syringe: see exactly where to draw. Enter recon and dose — fill level shown.", icon: "💉" },
  { href: "/tools/vial-cycle", label: "Vial & Cycle", desc: "How many days one vial lasts; how many vials for a target period.", icon: "📅" },
  { href: "/tools/unit-converter", label: "Unit Converter", desc: "mcg ↔ mg, and common peptide unit conversions.", icon: "↔" },
  { href: "/tools/cost", label: "Cost per Dose", desc: "Price per vial, mg per vial, dose (mcg) → cost per injection.", icon: "💰" },
];

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools" }]} />
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
    </div>
  );
}
