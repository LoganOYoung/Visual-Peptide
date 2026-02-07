"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  reconstitute,
  diluentForTargetConcentration,
  doseToVolume,
  doseToVolumeWithSyringe,
  volumeToDose,
} from "@/lib/calc";
import { getPeptideBySlug } from "@/lib/peptides";

const SYRINGE_OPTIONS: { value: "0.3" | "0.5" | "1"; label: string }[] = [
  { value: "0.3", label: "0.3 mL (30 units)" },
  { value: "0.5", label: "0.5 mL (50 units)" },
  { value: "1", label: "1 mL (100 units)" },
];

function parseFirstDoseMcg(s: string): string {
  const m = s.match(/\d+/);
  return m ? m[0] : "250";
}

export function CalculatorContent() {
  const searchParams = useSearchParams();
  const peptideSlug = searchParams.get("peptide");
  const peptide = peptideSlug ? getPeptideBySlug(peptideSlug) : null;
  const initialDose = peptide?.typicalDoseMcg ? parseFirstDoseMcg(peptide.typicalDoseMcg) : "250";

  const [peptideMg, setPeptideMg] = useState<string>("5");
  const [diluentMl, setDiluentMl] = useState<string>("2.5");
  const [targetMgPerMl, setTargetMgPerMl] = useState<string>("2");
  const [mode, setMode] = useState<"by-volume" | "by-concentration">("by-volume");

  const [doseMcg, setDoseMcg] = useState<string>(initialDose);
  const [injectVolumeMl, setInjectVolumeMl] = useState<string>("0.125");
  const [syringeMl, setSyringeMl] = useState<"0.3" | "0.5" | "1">("1");

  const peptideMgNum = parseFloat(peptideMg) || 0;
  const diluentMlNum = parseFloat(diluentMl) || 0;
  const targetMgPerMlNum = parseFloat(targetMgPerMl) || 0;
  const doseMcgNum = parseFloat(doseMcg) || 0;
  const injectVolumeMlNum = parseFloat(injectVolumeMl) || 0;

  const reconResult = useMemo(() => {
    if (mode === "by-volume")
      return reconstitute({ peptideMg: peptideMgNum, diluentMl: diluentMlNum });
    const { diluentMl: dm } = diluentForTargetConcentration({
      peptideMg: peptideMgNum,
      targetMgPerMl: targetMgPerMlNum,
    });
    return { concentrationMgPerMl: targetMgPerMlNum, diluentMlSuggested: dm };
  }, [mode, peptideMgNum, diluentMlNum, targetMgPerMlNum]);

  const concentrationMgPerMl =
    mode === "by-volume"
      ? reconResult.concentrationMgPerMl
      : (reconResult as { concentrationMgPerMl: number; diluentMlSuggested?: number }).concentrationMgPerMl;
  const diluentMlSuggested =
    mode === "by-concentration"
      ? (reconResult as { diluentMlSuggested?: number }).diluentMlSuggested
      : null;

  const doseVolumeResult = useMemo(
    () =>
      doseToVolume({
        doseMcg: doseMcgNum,
        concentrationMgPerMl,
      }),
    [doseMcgNum, concentrationMgPerMl]
  );

  const syringeMaxUnits = { "0.3": 30, "0.5": 50, "1": 100 }[syringeMl];
  const doseVolumeWithSyringeResult = useMemo(() => {
    const r = doseToVolumeWithSyringe(doseMcgNum, concentrationMgPerMl, syringeMl);
    return { ...r, fitsInSyringe: r.units <= syringeMaxUnits };
  }, [doseMcgNum, concentrationMgPerMl, syringeMl, syringeMaxUnits]);

  const volumeDoseResult = useMemo(
    () =>
      volumeToDose({
        volumeMl: injectVolumeMlNum,
        concentrationMgPerMl,
      }),
    [injectVolumeMlNum, concentrationMgPerMl]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: "Recon & Dosing" }]} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Reconstitution & Dosing Calculator</h1>
      <p className="mt-2 text-slate-600">
        Enter peptide amount and diluent (e.g. bacteriostatic water) to get concentration, then calculate dose per injection.
      </p>
      {peptide && (
        <p className="mt-1 text-sm text-teal-600">
          Pre-filled for {peptide.name}. <Link href={`/peptides/${peptide.slug}`} className="link-inline">View details</Link>
        </p>
      )}

      {/* Reconstitution */}
      <section className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">1. Reconstitution</h2>
        <p className="mt-1 text-sm text-slate-600">
          How much peptide you have and how much diluent to add (or target concentration).
        </p>

        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex-1 min-w-[140px]">
            <span className="block text-sm font-medium text-slate-600">Peptide (mg)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={peptideMg}
              onChange={(e) => setPeptideMg(e.target.value)}
              className="input mt-1"
            />
          </label>
          <div className="flex gap-2 items-end">
            <button
              type="button"
              onClick={() => setMode("by-volume")}
              className={`rounded-none px-3 py-2 text-sm font-medium ${
                mode === "by-volume"
                  ? "bg-teal-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              By volume
            </button>
            <button
              type="button"
              onClick={() => setMode("by-concentration")}
              className={`rounded-none px-3 py-2 text-sm font-medium ${
                mode === "by-concentration"
                  ? "bg-teal-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              By target conc.
            </button>
          </div>
        </div>

        {mode === "by-volume" ? (
          <label className="mt-4 block max-w-[200px]">
            <span className="block text-sm font-medium text-slate-600">Diluent (mL)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={diluentMl}
              onChange={(e) => setDiluentMl(e.target.value)}
              className="input mt-1"
            />
          </label>
        ) : (
          <label className="mt-4 block max-w-[200px]">
            <span className="block text-sm font-medium text-slate-600">Target concentration (mg/mL)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={targetMgPerMl}
              onChange={(e) => setTargetMgPerMl(e.target.value)}
              className="input mt-1"
            />
          </label>
        )}

        <div className="mt-6 rounded-none bg-slate-100/80 p-4 font-mono text-sm">
          <div className="text-teal-600">
            Concentration = <strong className="text-slate-900">{concentrationMgPerMl.toFixed(2)}</strong> mg/mL
          </div>
          {mode === "by-concentration" && diluentMlSuggested != null && (
            <div className="mt-2 text-slate-600">
              Add <strong className="text-slate-900">{diluentMlSuggested.toFixed(2)}</strong> mL diluent to get {targetMgPerMl} mg/mL.
            </div>
          )}
        </div>
      </section>

      {/* Dosing */}
      <section className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">2. Dose per injection</h2>
        <p className="mt-1 text-sm text-slate-600">
          Using the concentration above: either enter desired dose (mcg) to get volume, or enter volume to get dose.
        </p>

        <div className="mt-2">
          <span className="block text-sm font-medium text-slate-600">Syringe size</span>
          <div className="mt-1 flex gap-2">
            {SYRINGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSyringeMl(opt.value)}
                className={`rounded-none px-3 py-2 text-sm font-medium ${
                  syringeMl === opt.value ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <span className="block text-sm font-medium text-slate-600">Desired dose (mcg) → volume to draw</span>
            <input
              type="number"
              min="0"
              step="10"
              value={doseMcg}
              onChange={(e) => setDoseMcg(e.target.value)}
              className="input mt-1"
            />
            <div className="mt-2 rounded-none bg-slate-100/80 p-3 font-mono text-sm text-teal-600">
              {concentrationMgPerMl > 0 ? (
                <>
                  <strong className="text-slate-900">{doseVolumeWithSyringeResult.volumeMl.toFixed(3)}</strong> mL
                  {" "}(<strong className="text-slate-900">{doseVolumeWithSyringeResult.units}</strong> units)
                  {doseVolumeWithSyringeResult.fitsInSyringe ? (
                    <span className="block mt-1 text-slate-600">Fits in {syringeMl} mL syringe ✓</span>
                  ) : (
                    <span className="block mt-1 text-amber-400">Exceeds {syringeMl} mL syringe; use 0.5 or 1 mL</span>
                  )}
                </>
              ) : (
                "—"
              )}
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-600">Volume (mL) → dose</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={injectVolumeMl}
              onChange={(e) => setInjectVolumeMl(e.target.value)}
              className="input mt-1"
            />
            <div className="mt-2 rounded-none bg-slate-100/80 p-3 font-mono text-sm text-teal-600">
              {concentrationMgPerMl > 0 ? (
                <>
                  <strong className="text-slate-900">{volumeDoseResult.doseMcg.toFixed(0)}</strong> mcg
                </>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs text-slate-500">
        For research use only. Use sterile technique and appropriate diluent (e.g. bacteriostatic water). Always verify peptide purity via third-party testing when sourcing.
      </p>
    </div>
  );
}
