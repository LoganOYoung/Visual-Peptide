"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { vialDurationDays, vialsNeededForDays } from "@/lib/calc";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function VialCyclePage() {
  const [vialMg, setVialMg] = useState<string>("5");
  const [doseMcg, setDoseMcg] = useState<string>("250");
  const [injectionsPerDay, setInjectionsPerDay] = useState<string>("1");
  const [targetDays, setTargetDays] = useState<string>("28");

  const vMg = parseFloat(vialMg) || 0;
  const dMcg = parseFloat(doseMcg) || 0;
  const perDay = parseFloat(injectionsPerDay) || 0;
  const target = parseFloat(targetDays) || 0;

  const duration = useMemo(
    () => vialDurationDays(vMg, dMcg, perDay),
    [vMg, dMcg, perDay]
  );
  const vialsNeeded = useMemo(
    () => (target > 0 ? vialsNeededForDays(vMg, dMcg, perDay, target) : 0),
    [vMg, dMcg, perDay, target]
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Vial & Cycle" }]} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Vial & Cycle Calculator</h1>
      <p className="mt-2 text-slate-600">
        How many days one vial lasts, and how many vials you need for a target period.
      </p>

      <section className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">1. One vial lasts how long?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="block text-sm font-medium text-slate-600">Vial size (mg)</span>
            <input type="number" min="0" step="0.1" value={vialMg} onChange={(e) => setVialMg(e.target.value)} className="input mt-1" />
          </label>
          <label>
            <span className="block text-sm font-medium text-slate-600">Dose per injection (mcg)</span>
            <input type="number" min="0" step="10" value={doseMcg} onChange={(e) => setDoseMcg(e.target.value)} className="input mt-1" />
          </label>
          <label>
            <span className="block text-sm font-medium text-slate-600">Injections per day</span>
            <input type="number" min="0" step="0.5" value={injectionsPerDay} onChange={(e) => setInjectionsPerDay(e.target.value)} className="input mt-1" />
          </label>
        </div>
        <div className="mt-4 rounded-none bg-teal-50 p-4 font-mono text-sm text-teal-700">
          One vial ≈ <strong className="text-slate-900">{duration.doses}</strong> doses
          {" "}→ <strong className="text-slate-900">{duration.days.toFixed(1)}</strong> days
        </div>
      </section>

      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">2. Vials needed for target period</h2>
        <label className="mt-4 block max-w-[200px]">
          <span className="block text-sm font-medium text-slate-600">Target days</span>
          <input type="number" min="0" value={targetDays} onChange={(e) => setTargetDays(e.target.value)} className="input mt-1" />
        </label>
        <div className="mt-4 rounded-none bg-teal-50 p-4 font-mono text-sm text-teal-700">
          Need <strong className="text-slate-900">{vialsNeeded}</strong> vial{vialsNeeded !== 1 ? "s" : ""} for {target} days
        </div>
      </section>

      <p className="mt-6 text-xs text-slate-500">For research use only. Doses and frequency are protocol-dependent.</p>
    </div>
  );
}
