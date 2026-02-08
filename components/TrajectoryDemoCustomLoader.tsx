"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TrajectoryViewer } from "./TrajectoryViewer";
import { morphPdb } from "@/lib/morphPdb";

const RCSB_PDB = "https://files.rcsb.org/view";

type LoadMode = "pdbIds" | "pdbUrl" | "morph";

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

export function TrajectoryDemoCustomLoader() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<LoadMode>("pdbIds");
  const [pdbIdsInput, setPdbIdsInput] = useState("");
  const [pdbUrlInput, setPdbUrlInput] = useState("");
  const [morphA, setMorphA] = useState("");
  const [morphB, setMorphB] = useState("");
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [morphError, setMorphError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "fail">("idle");

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
        setMode("pdbIds");
        setPdbIdsInput(ids.join(", "));
        setLoaded({ framePdbIds: ids });
      }
    } else if (pdbUrl) {
      setMode("pdbUrl");
      setPdbUrlInput(pdbUrl);
      setLoaded({ pdbUrl });
    }
  }, [searchParams]);

  const handleLoad = () => {
    setMorphError(null);
    if (mode === "pdbIds") {
      const ids = pdbIdsInput
        .split(/[\s,]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      if (ids.length > 0) {
        const state: LoadedState = { framePdbIds: ids };
        setLoaded(state);
        updateUrl(state);
      }
    } else if (mode === "pdbUrl") {
      const url = pdbUrlInput.trim();
      if (url) {
        const state: LoadedState = { pdbUrl: url };
        setLoaded(state);
        updateUrl(state);
      }
    } else if (mode === "morph") {
      const a = morphA.trim().toUpperCase();
      const b = morphB.trim().toUpperCase();
      if (!a || !b) {
        setMorphError("Enter both PDB IDs");
        return;
      }
      setMorphError(null);
      Promise.all([
        fetch(`${RCSB_PDB}/${a}.pdb`).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${a} failed`)))),
        fetch(`${RCSB_PDB}/${b}.pdb`).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${b} failed`)))),
      ])
        .then(([textA, textB]) => {
          const frames = morphPdb(textA, textB, 18);
          setLoaded({ framePdbTexts: frames });
          updateUrl(null);
        })
        .catch((e) => setMorphError(e instanceof Error ? e.message : "Morph failed"));
    }
  };

  const canLoad =
    mode === "pdbIds"
      ? pdbIdsInput.trim().replace(/[\s,]+/g, " ").trim().length > 0
      : mode === "pdbUrl"
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
    <div className="card border-teal-200 bg-white">
      <h2 className="text-lg font-semibold text-slate-900">Load your own trajectory</h2>
      <p className="mt-1 text-sm text-slate-600">
        PDB IDs, multi-MODEL file URL, or morph between two structures (A→B).
      </p>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="mode"
            checked={mode === "pdbIds"}
            onChange={() => setMode("pdbIds")}
            className="rounded-full border-slate-300 text-teal-600"
          />
          <span className="text-sm font-medium text-slate-700">By PDB IDs</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="mode"
            checked={mode === "pdbUrl"}
            onChange={() => setMode("pdbUrl")}
            className="rounded-full border-slate-300 text-teal-600"
          />
          <span className="text-sm font-medium text-slate-700">By file URL</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="mode"
            checked={mode === "morph"}
            onChange={() => setMode("morph")}
            className="rounded-full border-slate-300 text-teal-600"
          />
          <span className="text-sm font-medium text-slate-700">Morph (A→B)</span>
        </label>
      </div>

      {mode === "pdbIds" && (
        <div className="mt-3">
          <input
            type="text"
            value={pdbIdsInput}
            onChange={(e) => setPdbIdsInput(e.target.value)}
            placeholder="e.g. 6XBM, 7F9W or 2LL5 1D4P"
            className="w-full max-w-md rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            onKeyDown={(e) => e.key === "Enter" && handleLoad()}
          />
          <p className="mt-1 text-xs text-slate-500">Comma or space separated. Each ID is one frame, loaded from RCSB.</p>
        </div>
      )}

      {mode === "pdbUrl" && (
        <div className="mt-3">
          <input
            type="text"
            value={pdbUrlInput}
            onChange={(e) => setPdbUrlInput(e.target.value)}
            placeholder="e.g. /trajectories/demo.pdb or https://..."
            className="w-full max-w-md rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            onKeyDown={(e) => e.key === "Enter" && handleLoad()}
          />
          <p className="mt-1 text-xs text-slate-500">Path or full URL to a multi-MODEL PDB.</p>
        </div>
      )}

      {mode === "morph" && (
        <div className="mt-3 flex flex-wrap items-end gap-4">
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
          {morphError && <p className="text-sm text-amber-600">{morphError}</p>}
          <p className="w-full text-xs text-slate-500">Linear interpolation between two PDBs. Same atom count and order required.</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleLoad}
          disabled={!canLoad}
          className="btn-primary rounded-none px-4 py-2 text-sm disabled:opacity-50"
        >
          Load trajectory
        </button>
        {loaded && (
          <button
            type="button"
            onClick={() => { setLoaded(null); updateUrl(null); }}
            className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
        {shareUrl && (
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            {copyStatus === "ok" ? "Copied!" : copyStatus === "fail" ? "Copy failed" : "Copy share link"}
          </button>
        )}
      </div>

      {loaded && (
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
