"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { costPerDose } from "@/lib/calc";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function CostPage() {
  const [pricePerVial, setPricePerVial] = useState<string>("50");
  const [vialMg, setVialMg] = useState<string>("5");
  const [doseMcg, setDoseMcg] = useState<string>("250");

  const price = parseFloat(pricePerVial) || 0;
  const vMg = parseFloat(vialMg) || 0;
  const dMcg = parseFloat(doseMcg) || 0;

  const result = useMemo(() => costPerDose(price, vMg, dMcg), [price, vMg, dMcg]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Cost per Dose" }]} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Cost per Dose</h1>
      <p className="mt-2 text-slate-600">
        Enter vial price and size, and your dose, to get cost per injection.
      </p>

      <section className="card mt-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="block text-sm font-medium text-slate-600">Price per vial ($)</span>
            <input type="number" min="0" step="1" value={pricePerVial} onChange={(e) => setPricePerVial(e.target.value)} className="input mt-1" />
          </label>
          <label>
            <span className="block text-sm font-medium text-slate-600">Vial size (mg)</span>
            <input type="number" min="0" step="0.1" value={vialMg} onChange={(e) => setVialMg(e.target.value)} className="input mt-1" />
          </label>
          <label>
            <span className="block text-sm font-medium text-slate-600">Dose per injection (mcg)</span>
            <input type="number" min="0" step="10" value={doseMcg} onChange={(e) => setDoseMcg(e.target.value)} className="input mt-1" />
          </label>
        </div>
        <div className="mt-6 rounded-none bg-teal-50 p-4 font-mono text-sm text-teal-700">
          <strong className="text-slate-900">${result.costPerDose.toFixed(2)}</strong> per dose
          {" "}({result.dosesPerVial} doses per vial)
        </div>
      </section>

      <p className="mt-6 text-xs text-slate-500">For comparison only. Prices vary by supplier and region.</p>
    </div>
  );
}
