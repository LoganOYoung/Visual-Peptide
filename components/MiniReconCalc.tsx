"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { doseToVolumeWithSyringe } from "@/lib/calc";

interface MiniReconCalcProps {
  defaultVialMg?: number;
  defaultDiluentMl?: number;
  defaultDoseMcg?: number;
  peptideSlug?: string;
  peptideName?: string;
}

export function MiniReconCalc({
  defaultVialMg = 5,
  defaultDiluentMl = 2.5,
  defaultDoseMcg = 250,
  peptideSlug,
  peptideName,
}: MiniReconCalcProps) {
  const [vialMg, setVialMg] = useState(String(defaultVialMg));
  const [diluentMl, setDiluentMl] = useState(String(defaultDiluentMl));
  const [doseMcg, setDoseMcg] = useState(String(defaultDoseMcg));
  const [syringeMl, setSyringeMl] = useState<"0.3" | "0.5" | "1">("1");

  const vMg = parseFloat(vialMg) || 0;
  const dMl = parseFloat(diluentMl) || 0;
  const dMcg = parseFloat(doseMcg) || 0;
  const conc = vMg > 0 && dMl > 0 ? vMg / dMl : 0;
  const result = useMemo(
    () => (conc > 0 && dMcg > 0 ? doseToVolumeWithSyringe(dMcg, conc, syringeMl) : null),
    [dMcg, conc, syringeMl]
  );

  return (
    <div className="rounded-none border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Quick recon simulator</h3>
      <p className="mt-1 text-xs text-slate-600">
        {peptideName
          ? `If you have a ${defaultVialMg} mg vial of ${peptideName}, add diluent and see dose per draw.`
          : "Vial mg + diluent mL → concentration. Then: dose mcg → volume to draw."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <label>
          <span className="block text-xs text-slate-500">Vial (mg)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={vialMg}
            onChange={(e) => setVialMg(e.target.value)}
            className="input mt-0.5 w-20 py-1.5 text-sm"
          />
        </label>
        <label>
          <span className="block text-xs text-slate-500">Diluent (mL)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={diluentMl}
            onChange={(e) => setDiluentMl(e.target.value)}
            className="input mt-0.5 w-20 py-1.5 text-sm"
          />
        </label>
        <label>
          <span className="block text-xs text-slate-500">Dose (mcg)</span>
          <input
            type="number"
            min="0"
            step="10"
            value={doseMcg}
            onChange={(e) => setDoseMcg(e.target.value)}
            className="input mt-0.5 w-24 py-1.5 text-sm"
          />
        </label>
        <label>
          <span className="block text-xs text-slate-500">Syringe</span>
          <select
            value={syringeMl}
            onChange={(e) => setSyringeMl(e.target.value as "0.3" | "0.5" | "1")}
            className="input mt-0.5 w-24 py-1.5 text-sm"
          >
            <option value="0.3">0.3 mL</option>
            <option value="0.5">0.5 mL</option>
            <option value="1">1 mL</option>
          </select>
        </label>
      </div>
      {result && conc > 0 && (
        <p className="mt-3 text-sm text-teal-600">
          → Draw <strong className="text-slate-900">{result.volumeMl.toFixed(2)}</strong> mL ({result.units} units) for{" "}
          <strong className="text-slate-900">{doseMcg}</strong> mcg
        </p>
      )}
      <Link
        href={peptideSlug ? `/tools/calculator?peptide=${peptideSlug}` : "/tools/calculator"}
        className="link-inline mt-2 inline-block text-xs"
      >
        Full calculator →
      </Link>
    </div>
  );
}
