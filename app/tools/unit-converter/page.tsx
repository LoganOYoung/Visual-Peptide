"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function UnitConverterPage() {
  const [mcg, setMcg] = useState<string>("250");
  const [mg, setMg] = useState<string>("0.25");

  const mcgNum = parseFloat(mcg) || 0;
  const mgNum = parseFloat(mg) || 0;

  const mcgToMg = useMemo(() => mcgNum / 1000, [mcgNum]);
  const mgToMcg = useMemo(() => mgNum * 1000, [mgNum]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Unit Converter" }]} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Unit Converter</h1>
      <p className="mt-2 text-slate-600">
        mcg ↔ mg. (1 mg = 1000 mcg.)
      </p>

      <section className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">mcg → mg</h2>
        <label className="mt-4 block max-w-[200px]">
          <span className="block text-sm font-medium text-slate-600">Micrograms (mcg)</span>
          <input type="number" min="0" step="1" value={mcg} onChange={(e) => setMcg(e.target.value)} className="input mt-1" />
        </label>
        <div className="mt-3 font-mono text-teal-600">
          = <strong className="text-slate-900">{mcgToMg.toFixed(4)}</strong> mg
        </div>
      </section>

      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">mg → mcg</h2>
        <label className="mt-4 block max-w-[200px]">
          <span className="block text-sm font-medium text-slate-600">Milligrams (mg)</span>
          <input type="number" min="0" step="0.001" value={mg} onChange={(e) => setMg(e.target.value)} className="input mt-1" />
        </label>
        <div className="mt-3 font-mono text-teal-600">
          = <strong className="text-slate-900">{mgToMcg.toFixed(2)}</strong> mcg
        </div>
      </section>

      <p className="mt-6 text-xs text-slate-500">For peptide dosing, doses are often in mcg; vial content in mg.</p>
    </div>
  );
}
