"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { doseToVolumeWithSyringe } from "@/lib/calc";
import { getBaseUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VisualSyringe } from "@/components/VisualSyringe";

const SYRINGE_OPTIONS: { value: "0.3" | "0.5" | "1"; label: string }[] = [
  { value: "0.3", label: "0.3 mL (30 units)" },
  { value: "0.5", label: "0.5 mL (50 units)" },
  { value: "1", label: "1 mL (100 units)" },
];

export default function SyringePlannerPage() {
  const [peptideMg, setPeptideMg] = useState("5");
  const [diluentMl, setDiluentMl] = useState("2.5");
  const [doseMcg, setDoseMcg] = useState("250");
  const [syringeMl, setSyringeMl] = useState<"0.3" | "0.5" | "1">("1");

  const vMg = parseFloat(peptideMg) || 0;
  const dMl = parseFloat(diluentMl) || 0;
  const dMcg = parseFloat(doseMcg) || 0;
  const conc = vMg > 0 && dMl > 0 ? vMg / dMl : 0;
  const result = useMemo(
    () => (conc > 0 && dMcg > 0 ? doseToVolumeWithSyringe(dMcg, conc, syringeMl) : null),
    [dMcg, conc, syringeMl]
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Syringe Planner" }]} baseUrl={getBaseUrl()} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Visual Syringe Planner</h1>
      <p className="mt-2 text-slate-600">
        See exactly where to draw. Enter your reconstitution and dose — the syringe shows the fill level.
      </p>

      <section className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">1. Reconstitution</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <label>
            <span className="block text-sm font-medium text-slate-600">Peptide (mg)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={peptideMg}
              onChange={(e) => setPeptideMg(e.target.value)}
              className="input mt-1 w-24"
            />
          </label>
          <label>
            <span className="block text-sm font-medium text-slate-600">Diluent (mL)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={diluentMl}
              onChange={(e) => setDiluentMl(e.target.value)}
              className="input mt-1 w-24"
            />
          </label>
        </div>
        {conc > 0 && (
          <p className="mt-2 text-sm text-slate-600">
            Concentration = <strong className="text-teal-600">{conc.toFixed(2)}</strong> mg/mL
          </p>
        )}
      </section>

      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">2. Dose & syringe</h2>
        <div className="mt-4 flex flex-wrap gap-6">
          <label>
            <span className="block text-sm font-medium text-slate-600">Dose (mcg)</span>
            <input
              type="number"
              min="0"
              step="10"
              value={doseMcg}
              onChange={(e) => setDoseMcg(e.target.value)}
              className="input mt-1 w-28"
            />
          </label>
          <div>
            <span className="block text-sm font-medium text-slate-600">Syringe size</span>
            <div className="mt-1 flex gap-2">
              {SYRINGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSyringeMl(opt.value)}
                  className={`min-h-[44px] rounded-none px-3 py-2 text-sm font-medium transition ${
                    syringeMl === opt.value
                      ? "bg-teal-500 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {result && conc > 0 && (
        <section className="card mt-6 border-teal-200">
          <h2 className="text-lg font-semibold text-slate-900">3. Draw to this level</h2>
          <p className="mt-1 text-sm text-slate-600">
            The teal fill shows exactly where to stop. The dashed line marks your target.
          </p>
          <div className="mt-6 flex justify-center">
            <VisualSyringe
              syringeMl={syringeMl}
              units={result.units}
              concentrationMgPerMl={conc}
              doseMcg={dMcg}
            />
          </div>
        </section>
      )}

      <p className="mt-6 text-sm text-slate-500">
        <Link href="/tools/calculator" className="link-inline">Full reconstitution calculator</Link>
        {" · "}
        See guide: <Link href="/guide#reconstitution-steps" className="link-inline">Reconstitution steps</Link>
      </p>
    </div>
  );
}
