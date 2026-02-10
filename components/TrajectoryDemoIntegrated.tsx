"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TrajectoryViewer } from "./TrajectoryViewer";
import { starReactionDemos, getStarReactionByPeptide } from "@/lib/starReactionDemos";
import { morphPdb } from "@/lib/morphPdb";

const RCSB_PDB = "https://files.rcsb.org/view";

type SourceTab = "preset" | "pdbIds" | "pdbUrl" | "morph";

type LoadedState =
  | { framePdbIds: string[] }
  | { pdbUrl: string }
  | { framePdbTexts: string[] };

function buildShareUrl(params: { pdbIds?: string; pdbUrl?: string }): string {
  if (typeof window === "undefined") return "";
  const u = new URL(window.location.href);
  u.searchParams.delete("pdbIds");
  u.searchParams.delete("pdbUrl");
  if (params.pdbIds) u.searchParams.set("pdbIds", params.pdbIds);
  if (params.pdbUrl) u.searchParams.set("pdbUrl", params.pdbUrl);
  return u.toString();
}

const TABS: { id: SourceTab; label: string }[] = [
  { id: "preset", label: "Preset (Star product)" },
  { id: "pdbIds", label: "By PDB IDs" },
  { id: "pdbUrl", label: "By file URL" },
  { id: "morph", label: "Morph (A→B)" },
];

export function TrajectoryDemoIntegrated() {
  const searchParams = useSearchParams();
  const [sourceTab, setSourceTab] = useState<SourceTab>("preset");

  // Preset (Star product) state
  const [selectedSlug, setSelectedSlug] = useState<string>(starReactionDemos[0]?.peptideSlug ?? "");
  const [running, setRunning] = useState<typeof starReactionDemos[0] | null>(null);
  const labPanelRef = useRef<HTMLDivElement>(null);

  // Custom load state
  const [pdbIdsInput, setPdbIdsInput] = useState("");
  const [pdbUrlInput, setPdbUrlInput] = useState("");
  const [morphA, setMorphA] = useState("");
  const [morphB, setMorphB] = useState("");
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [loading, setLoading] = useState(false);
  const [morphError, setMorphError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "fail">("idle");

  const selectedDemo = selectedSlug ? getStarReactionByPeptide(selectedSlug) : undefined;
  const receptorLabel = selectedDemo?.receptorLabel ?? "—";

  const updateUrl = useCallback((state: LoadedState | null) => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    u.searchParams.delete("pdbIds");
    u.searchParams.delete("pdbUrl");
    if (state && "framePdbIds" in state) u.searchParams.set("pdbIds", state.framePdbIds.join(","));
    if (state && "pdbUrl" in state) u.searchParams.set("pdbUrl", state.pdbUrl);
    window.history.replaceState({}, "", u.toString());
  }, []);

  useEffect(() => {
    const pdbIds = searchParams.get("pdbIds")?.trim();
    const pdbUrl = searchParams.get("pdbUrl")?.trim();
    if (pdbIds) {
      const ids = pdbIds.split(/[\s,]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
      if (ids.length > 0) {
        setSourceTab("pdbIds");
        setPdbIdsInput(ids.join(", "));
        setLoaded({ framePdbIds: ids });
      }
    } else if (pdbUrl) {
      setSourceTab("pdbUrl");
      setPdbUrlInput(pdbUrl);
      setLoaded({ pdbUrl });
    }
  }, [searchParams]);

  const handleRunPreset = () => {
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

  const handleCustomLoad = () => {
    setMorphError(null);
    if (sourceTab === "pdbIds") {
      const ids = pdbIdsInput
        .split(/[\s,]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      if (ids.length > 0) {
        setLoading(true);
        const state: LoadedState = { framePdbIds: ids };
        setLoaded(state);
        updateUrl(state);
        setLoading(false);
      }
    } else if (sourceTab === "pdbUrl") {
      const url = pdbUrlInput.trim();
      if (url) {
        setLoading(true);
        const state: LoadedState = { pdbUrl: url };
        setLoaded(state);
        updateUrl(state);
        setLoading(false);
      }
    } else if (sourceTab === "morph") {
      const a = morphA.trim().toUpperCase();
      const b = morphB.trim().toUpperCase();
      if (!a || !b) {
        setMorphError("Enter both PDB IDs");
        return;
      }
      setMorphError(null);
      setLoading(true);
      Promise.all([
        fetch(`${RCSB_PDB}/${a}.pdb`).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${a} failed`)))),
        fetch(`${RCSB_PDB}/${b}.pdb`).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${b} failed`)))),
      ])
        .then(([textA, textB]) => {
          const frames = morphPdb(textA, textB, 18);
          setLoaded({ framePdbTexts: frames });
          updateUrl(null);
        })
        .catch((e) => setMorphError(e instanceof Error ? e.message : "Morph failed"))
        .finally(() => setLoading(false));
    }
  };

  const canCustomLoad =
    sourceTab === "pdbIds"
      ? pdbIdsInput.trim().replace(/[\s,]+/g, " ").trim().length > 0
      : sourceTab === "pdbUrl"
        ? pdbUrlInput.trim().length > 0
        : morphA.trim().length > 0 && morphB.trim().length > 0;

  const shareUrl =
    loaded && "framePdbIds" in loaded
      ? buildShareUrl({ pdbIds: loaded.framePdbIds.join(",") })
      : loaded && "pdbUrl" in loaded
        ? buildShareUrl({ pdbUrl: loaded.pdbUrl })
        : "";

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(
      () => setCopyStatus("ok"),
      () => setCopyStatus("fail")
    );
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  return (
    <div className="card border-teal-200 border-l-4 border-l-teal-500 bg-gradient-to-b from-teal-50/30 to-white">
      <h2 className="text-xl font-semibold text-slate-900">Load a trajectory</h2>
      <p className="mt-1 text-sm text-slate-600">
        <strong>Preset</strong> — built-in peptide–receptor demos. <strong>By PDB IDs / File URL</strong> — use your own binding pathway or multi-MODEL PDB (e.g. from MD). <strong>Morph</strong> — interpolate between two structures.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSourceTab(tab.id)}
            className={`rounded-none px-3 py-2 text-sm font-medium transition ${
              sourceTab === tab.id
                ? "border border-teal-500 bg-teal-50 text-teal-700"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preset (Star product) */}
      {sourceTab === "preset" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Peptide</label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunPreset()}
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
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Receptor</label>
              <div className="mt-1 rounded-none border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700">
                {receptorLabel}
              </div>
              <p className="mt-1 text-xs text-slate-500">Auto-filled from selected peptide</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleRunPreset} className="btn-primary rounded-none px-5 py-2.5">
              Run simulation
            </button>
            <span className="text-xs text-slate-500">
              Press Enter in the dropdown to run. The lab viewer opens below.
            </span>
          </div>
        </>
      )}

      {/* By PDB IDs */}
      {sourceTab === "pdbIds" && (
        <>
          <div className="mt-2">
            <input
              type="text"
              value={pdbIdsInput}
              onChange={(e) => setPdbIdsInput(e.target.value)}
              placeholder="e.g. 6XBM, 7F9W or 2LL5 1D4P"
              className="w-full max-w-md rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              onKeyDown={(e) => e.key === "Enter" && handleCustomLoad()}
            />
            <p className="mt-1 text-xs text-slate-500">Comma or space separated. Each ID is one frame, loaded from RCSB.</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCustomLoad}
              disabled={!canCustomLoad || loading}
              className="btn-primary rounded-none px-4 py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load trajectory"}
            </button>
            {loaded && !loading && (
              <button
                type="button"
                onClick={() => { setLoaded(null); updateUrl(null); }}
                className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
            {shareUrl && !loading && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                {copyStatus === "ok" ? "Copied!" : copyStatus === "fail" ? "Copy failed" : "Copy share link"}
              </button>
            )}
          </div>
        </>
      )}

      {/* By file URL */}
      {sourceTab === "pdbUrl" && (
        <>
          <div className="mt-2">
            <input
              type="text"
              value={pdbUrlInput}
              onChange={(e) => setPdbUrlInput(e.target.value)}
              placeholder="e.g. /trajectories/demo.pdb or https://..."
              className="w-full max-w-md rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              onKeyDown={(e) => e.key === "Enter" && handleCustomLoad()}
            />
            <p className="mt-1 text-xs text-slate-500">Path or full URL to a multi-MODEL PDB.</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCustomLoad}
              disabled={!canCustomLoad || loading}
              className="btn-primary rounded-none px-4 py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load trajectory"}
            </button>
            {loaded && !loading && (
              <button
                type="button"
                onClick={() => { setLoaded(null); updateUrl(null); }}
                className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
            {shareUrl && !loading && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                {copyStatus === "ok" ? "Copied!" : copyStatus === "fail" ? "Copy failed" : "Copy share link"}
              </button>
            )}
          </div>
        </>
      )}

      {/* Morph (A→B) */}
      {sourceTab === "morph" && (
        <>
          <div className="mt-2 flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500">Structure A (start)</label>
              <input
                type="text"
                value={morphA}
                onChange={(e) => setMorphA(e.target.value)}
                placeholder="e.g. 2LL5"
                className="mt-1 w-28 rounded-none border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Structure B (end)</label>
              <input
                type="text"
                value={morphB}
                onChange={(e) => setMorphB(e.target.value)}
                placeholder="e.g. 1D4P"
                className="mt-1 w-28 rounded-none border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
          {morphError && (
            <p className="mt-2 text-sm text-amber-600" role="alert">
              {morphError}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">Linear interpolation between two PDBs. Same atom count and order required.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCustomLoad}
              disabled={!canCustomLoad || loading}
              className="btn-primary rounded-none px-4 py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load trajectory"}
            </button>
            {loaded && !loading && (
              <button
                type="button"
                onClick={() => { setLoaded(null); updateUrl(null); }}
                className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
        </>
      )}

      {/* Preset: Laboratory Simulation Mode panel */}
      {sourceTab === "preset" && running && (
        <div
          ref={labPanelRef}
          className="mt-8 overflow-hidden rounded-none border-2 border-slate-700 bg-slate-900 text-white"
          role="dialog"
          aria-label="Laboratory Simulation Mode"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 bg-slate-800 px-4 py-3">
            <span className="text-sm font-medium text-teal-300">Laboratory Simulation Mode</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {running.peptideName} + {running.receptorLabel}
              </span>
              <button
                type="button"
                onClick={handleLabFullscreen}
                className="min-h-[44px] rounded-none border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600"
              >
                Fullscreen
              </button>
            <button
              type="button"
              onClick={handleCloseLab}
              className="min-h-[44px] rounded-none border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600"
              title="Close this panel"
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
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Binding / structure</h3>
              <p className="mt-2 text-sm text-slate-200">
                {running.bindingAffinity ?? "Peptide–receptor complex. Preset trajectory from PDB."}
              </p>
              {running.caption && <p className="mt-2 text-xs text-slate-400">{running.caption}</p>}
              <p className="mt-4 text-xs text-slate-500">
                Frames: {running.framePdbIds.join(" → ")}. Data from RCSB PDB. For research and education only.
              </p>
            </aside>
          </div>
        </div>
      )}

      {/* Custom: inline viewer */}
      {sourceTab !== "preset" && loaded && (
        <div className="mt-6">
          <TrajectoryViewer
            key={"framePdbIds" in loaded ? loaded.framePdbIds.join(",") : "pdbUrl" in loaded ? loaded.pdbUrl : "morph"}
            framePdbIds={"framePdbIds" in loaded ? loaded.framePdbIds : undefined}
            pdbUrl={"pdbUrl" in loaded ? loaded.pdbUrl : undefined}
            framePdbTexts={"framePdbTexts" in loaded ? loaded.framePdbTexts : undefined}
            title={
              "framePdbIds" in loaded
                ? `Custom: ${loaded.framePdbIds.join(" → ")}`
                : "framePdbTexts" in loaded
                  ? "Morph (A→B)"
                  : "Custom trajectory"
            }
            minHeight={480}
            intervalMs={800}
            autoPlay={true}
          />
        </div>
      )}
    </div>
  );
}
