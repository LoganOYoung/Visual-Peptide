"use client";

import { useState, useMemo } from "react";

const DEFAULT_DAYS = 30;

export function StabilityHelper() {
  const [reconDate, setReconDate] = useState("");
  const [daysStable, setDaysStable] = useState(String(DEFAULT_DAYS));

  const useBy = useMemo(() => {
    if (!reconDate.trim()) return null;
    const d = new Date(reconDate.trim());
    if (isNaN(d.getTime())) return null;
    const days = parseInt(daysStable, 10) || DEFAULT_DAYS;
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }, [reconDate, daysStable]);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-900">6. Reconstitution stability / use-by</h2>
      <p className="mt-1 text-sm text-slate-600">
        Many peptides are stable 2–8 °C for about 30 days after reconstitution. Stability varies by peptide and formulation; the 30-day default is a common reference only. Follow product or protocol.
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        <label>
          <span className="block text-sm font-medium text-slate-600">Recon date</span>
          <input
            type="text"
            autoComplete="off"
            value={reconDate}
            onChange={(e) => setReconDate(e.target.value)}
            className="input mt-1 max-w-[180px]"
            placeholder="YYYY-MM-DD"
            aria-label="Reconstitution date (YYYY-MM-DD)"
            lang="en"
          />
        </label>
        <label>
          <span className="block text-sm font-medium text-slate-600">Stable (days)</span>
          <input
            type="number"
            min="1"
            max="90"
            value={daysStable}
            onChange={(e) => setDaysStable(e.target.value)}
            className="input mt-1 max-w-[100px]"
          />
        </label>
      </div>
      {useBy && (
        <p className="mt-3 text-sm text-teal-600">
          Suggested use by: <strong className="text-slate-900">{useBy}</strong>
        </p>
      )}
      <p className="mt-2 text-xs text-slate-500">For reference only. Follow manufacturer or protocol for storage and stability.</p>
    </div>
  );
}
