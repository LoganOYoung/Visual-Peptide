"use client";

import { useRef, useState } from "react";
import { TrajectoryViewer } from "./TrajectoryViewer";
import { starReactionDemos, getStarReactionByPeptide } from "@/lib/starReactionDemos";

export function StarReactionDemo() {
  const [selectedSlug, setSelectedSlug] = useState<string>(starReactionDemos[0]?.peptideSlug ?? "");
  const [running, setRunning] = useState<typeof starReactionDemos[0] | null>(null);
  const labPanelRef = useRef<HTMLDivElement>(null);

  const selectedDemo = selectedSlug ? getStarReactionByPeptide(selectedSlug) : undefined;
  const receptorLabel = selectedDemo?.receptorLabel ?? "—";

  const handleRun = () => {
    const demo = getStarReactionByPeptide(selectedSlug);
    if (demo) setRunning(demo);
  };

  const handleCloseLab = () => setRunning(null);

  const handleLabFullscreen = () => {
    const el = labPanelRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="card border-teal-200 bg-gradient-to-b from-teal-50/40 to-white">
      <h2 className="text-xl font-semibold text-slate-900">Star product reaction demo</h2>
      <p className="mt-1 text-sm text-slate-600">
        Select a peptide. Receptor is auto-filled. Run to view the preset binding simulation (no real-time computation).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Peptide
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            className="mt-1 w-full rounded-none border border-slate-300 bg-white px-3 py-2.5 text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {starReactionDemos.map((d) => (
              <option key={d.peptideSlug} value={d.peptideSlug}>
                {d.peptideName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Receptor
          </label>
          <div className="mt-1 rounded-none border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700">
            {receptorLabel}
          </div>
          <p className="mt-1 text-xs text-slate-500">Auto-filled from selected peptide</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRun}
          className="btn-primary rounded-none px-5 py-2.5"
        >
          Run simulation
        </button>
        <span className="text-xs text-slate-500">
          Press Enter in the dropdown to run
        </span>
      </div>

      {running && (
        <div
          ref={labPanelRef}
          className="mt-8 overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900 text-white"
          role="dialog"
          aria-label="Laboratory Simulation Mode"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 bg-slate-800 px-4 py-3">
            <span className="text-sm font-medium text-teal-300">
              Laboratory Simulation Mode
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {running.peptideName} + {running.receptorLabel}
              </span>
              <button
                type="button"
                onClick={handleLabFullscreen}
                className="rounded-none border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-600"
              >
                Fullscreen
              </button>
              <button
                type="button"
                onClick={handleCloseLab}
                className="rounded-none border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-600"
              >
                Exit
              </button>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row">
            <div className="min-h-[420px] flex-1 bg-slate-900">
              <TrajectoryViewer
                framePdbIds={running.framePdbIds}
                title=""
                minHeight={420}
                intervalMs={900}
                autoPlay={true}
                className="border-0 bg-slate-900"
              />
            </div>
            <aside className="w-full border-t border-slate-700 bg-slate-800/80 p-4 lg:w-72 lg:border-l lg:border-t-0">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Binding / structure
              </h3>
              <p className="mt-2 text-sm text-slate-200">
                {running.bindingAffinity ?? "Peptide–receptor complex. Preset trajectory from PDB."}
              </p>
              {running.caption && (
                <p className="mt-2 text-xs text-slate-400">
                  {running.caption}
                </p>
              )}
              <p className="mt-4 text-xs text-slate-500">
                Frames: {running.framePdbIds.join(" → ")}. Data from RCSB PDB. For research and education only.
              </p>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
