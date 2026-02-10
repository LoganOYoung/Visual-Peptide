"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getHotspotForResidue } from "@/lib/structureHotspots";

const RCSB_3D_VIEW = "https://www.rcsb.org/3d-view";
const RCSB_ENTRY_API = "https://data.rcsb.org/rest/v1/core/entry";
const RCSB_DOWNLOAD_PDB = "https://files.rcsb.org/download";
const CDN_3DMOL_PRIMARY = "https://3Dmol.org/build/3Dmol-min.js";
const CDN_3DMOL_FALLBACK = "https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js";

const VIEWER_BG = "0x1e3a5f";
const GRID_COLOR = "#7dd3fc";
const GRID_STEP = 5;
const GRID_MARGIN = 20;
const DEFAULT_BOUNDS = { minX: -40, maxX: 40, minY: -40, maxY: 40, minZ: -25, maxZ: 25 };

const DISPLAY_MODES = ["cartoon", "stick", "line", "sphere"] as const;
type DisplayMode = (typeof DISPLAY_MODES)[number];

type Bounds = { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number };

type ViewerInstance = {
  addModel: (data: string, format: string) => void;
  setStyle: (sel: object, style: object) => void;
  zoomTo: (sel?: object) => void;
  center?: (sel?: object) => void;
  render: () => void;
  destroy?: () => void;
  getModel?: (id?: number) => { getAtomList?: () => { x?: number; y?: number; z?: number }[] } | null;
  mapAtomProperties?: (props: (atom: AtomLike) => void, sel?: object) => void;
  addLine?: (spec: { start: { x: number; y: number; z: number }; end: { x: number; y: number; z: number }; color?: string }) => unknown;
  removeAllShapes?: () => void;
  pngURI?: () => string;
};

function getBoundsFromViewer(viewer: ViewerInstance): Bounds {
  try {
    const model = viewer.getModel?.(0);
    const list = model?.getAtomList?.();
    if (!list?.length) return DEFAULT_BOUNDS;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const a of list) {
      const x = a.x ?? 0, y = a.y ?? 0, z = a.z ?? 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
    if (minX === Infinity) return DEFAULT_BOUNDS;
    return { minX, maxX, minY, maxY, minZ, maxZ };
  } catch {
    return DEFAULT_BOUNDS;
  }
}

function addGridLines(viewer: ViewerInstance, bounds: Bounds): void {
  if (!viewer.addLine) return;
  const z = bounds.minZ - 5;
  const xMin = bounds.minX - GRID_MARGIN, xMax = bounds.maxX + GRID_MARGIN;
  const yMin = bounds.minY - GRID_MARGIN, yMax = bounds.maxY + GRID_MARGIN;
  for (let y = yMin; y <= yMax; y += GRID_STEP) {
    viewer.addLine({ start: { x: xMin, y, z }, end: { x: xMax, y, z }, color: GRID_COLOR });
  }
  for (let x = xMin; x <= xMax; x += GRID_STEP) {
    viewer.addLine({ start: { x, y: yMin, z }, end: { x, y: yMax, z }, color: GRID_COLOR });
  }
}
interface AtomLike {
  resn?: string;
  chain?: string;
  resi?: number;
  x?: number;
  y?: number;
  z?: number;
}
declare global {
  interface Window {
    $3Dmol?: { createViewer: (el: HTMLElement, config?: { backgroundColor?: string }) => ViewerInstance };
    "3Dmol"?: { createViewer: (el: HTMLElement, config?: { backgroundColor?: string }) => ViewerInstance };
  }
}

function chainsFromPdb(pdbText: string): string[] {
  const seen = new Set<string>();
  for (const line of pdbText.split("\n")) {
    if (!line.startsWith("ATOM ") && !line.startsWith("HETATM ")) continue;
    const ch = line.charAt(21)?.trim();
    if (ch) seen.add(ch);
  }
  return [...seen].sort();
}

/** Chain → ordered list of { resi, resn } from ATOM lines (CA or first atom per residue). */
function sequenceFromPdb(pdbText: string): Record<string, { resi: number; resn: string }[]> {
  const byChain: Record<string, Map<number, string>> = {};
  for (const line of pdbText.split("\n")) {
    if (!line.startsWith("ATOM ") && !line.startsWith("HETATM ")) continue;
    const ch = line.charAt(21)?.trim();
    if (!ch) continue;
    const resi = parseInt(line.substring(22, 26).trim(), 10);
    if (isNaN(resi)) continue;
    const resn = line.substring(17, 20).trim() || "UNK";
    if (!byChain[ch]) byChain[ch] = new Map();
    if (!byChain[ch].has(resi)) byChain[ch].set(resi, resn);
  }
  const out: Record<string, { resi: number; resn: string }[]> = {};
  for (const [ch, map] of Object.entries(byChain)) {
    out[ch] = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([resi, resn]) => ({ resi, resn }));
  }
  return out;
}

function dist(a: { x?: number; y?: number; z?: number }, b: { x?: number; y?: number; z?: number }): number {
  const dx = (a.x ?? 0) - (b.x ?? 0);
  const dy = (a.y ?? 0) - (b.y ?? 0);
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

interface PdbViewerInSiteProps {
  pdbId: string;
  title?: string;
  minHeight?: number;
  className?: string;
}

export function PdbViewerInSite({
  pdbId,
  title,
  minHeight = 400,
  className = "",
}: PdbViewerInSiteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedRef = useRef(false);
  const viewerRef = useRef<ViewerInstance | null>(null);
  const boundsRef = useRef<Bounds | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [residueInfo, setResidueInfo] = useState<{ resn: string; chain: string; resi: number } | null>(null);
  const [hotspotText, setHotspotText] = useState<string | null>(null);
  const [chains, setChains] = useState<string[]>([]);
  const [visibleChains, setVisibleChains] = useState<Set<string>>(new Set());
  const [displayMode, setDisplayMode] = useState<DisplayMode>("cartoon");
  const [sequenceByChain, setSequenceByChain] = useState<Record<string, { resi: number; resn: string }[]>>({});
  const [metadata, setMetadata] = useState<{ title?: string; resolution?: number; method?: string } | null>(null);
  const [measureMode, setMeasureMode] = useState(false);
  const [measureAtoms, setMeasureAtoms] = useState<[AtomLike | null, AtomLike | null]>([null, null]);
  const [distanceÅ, setDistanceÅ] = useState<number | null>(null);
  const [seqPanelOpen, setSeqPanelOpen] = useState(false);
  const [seqPanelPos, setSeqPanelPos] = useState({ x: 0, y: 0 });
  const seqPanelDragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const id = pdbId.trim().toUpperCase();
  const src = `${RCSB_3D_VIEW}/${id}`;
  const downloadPdbUrl = `${RCSB_DOWNLOAD_PDB}/${id}.pdb`;
  const citeUrl = `https://www.rcsb.org/structure/${id}`;

  const measureAtomsRef = useRef<[AtomLike | null, AtomLike | null]>([null, null]);
  const apiRef = useRef({
    setResidueInfo,
    setHotspotText,
    setChains,
    setVisibleChains,
    setSequenceByChain,
    id,
    measureMode: false,
    setMeasureAtoms,
    setDistanceÅ,
    viewerRef,
    measureAtomsRef,
  });
  apiRef.current = {
    setResidueInfo,
    setHotspotText,
    setChains,
    setVisibleChains,
    setSequenceByChain,
    id,
    measureMode,
    setMeasureAtoms,
    setDistanceÅ,
    viewerRef,
    measureAtomsRef,
  };

  useEffect(() => {
    if (!id) return;
    const el = containerRef.current;
    if (!el) return;

    resolvedRef.current = false;
    setResidueInfo(null);
    setHotspotText(null);
    setChains([]);
    setVisibleChains(new Set());
    setSequenceByChain({});
    setMeasureAtoms([null, null]);
    setDistanceÅ(null);
    let viewer: ViewerInstance | null = null;
    let cancelled = false;

    const get3Dmol = (): Window["$3Dmol"] => {
      if (typeof window === "undefined") return undefined;
      return window.$3Dmol ?? (window as any)["3Dmol"];
    };

    const run = ($3Dmol: NonNullable<Window["$3Dmol"]>) => {
      if (cancelled || !el) return;
      try {
        viewer = $3Dmol.createViewer(el, { backgroundColor: VIEWER_BG });
        viewerRef.current = viewer;
      } catch (e) {
        if (!cancelled) {
          resolvedRef.current = true;
          setError("Failed to create viewer");
        }
        return;
      }
      fetch(`https://files.rcsb.org/view/${id}.pdb`, { cache: "force-cache" })
        .then((res) => {
          if (!res.ok) throw new Error(`PDB ${res.status}`);
          return res.text();
        })
        .then((pdbText) => {
          if (cancelled || !viewer) return;
          viewer.addModel(pdbText, "pdb");
          const bounds = getBoundsFromViewer(viewer);
          boundsRef.current = bounds;
          addGridLines(viewer, bounds);
          const chainList = chainsFromPdb(pdbText);
          apiRef.current.setChains(chainList);
          apiRef.current.setVisibleChains(new Set(chainList));
          apiRef.current.setSequenceByChain(sequenceFromPdb(pdbText));

          const onAtom = (atom: AtomLike) => {
            const api = apiRef.current;
            if (api.measureMode) {
              const prev = api.measureAtomsRef.current;
              const next: [AtomLike | null, AtomLike | null] =
                prev[0] == null ? [atom, null] : prev[1] == null ? [prev[0], atom] : [atom, null];
              api.measureAtomsRef.current = next;
              api.setMeasureAtoms(next);
              if (next[0] != null && next[1] != null && viewer) {
                const d = dist(next[0], next[1]);
                api.setDistanceÅ(d);
                viewer.removeAllShapes?.();
                const b = boundsRef.current;
                if (b) addGridLines(viewer, b);
                viewer.addLine?.({
                  start: { x: next[0].x ?? 0, y: next[0].y ?? 0, z: next[0].z ?? 0 },
                  end: { x: next[1].x ?? 0, y: next[1].y ?? 0, z: next[1].z ?? 0 },
                  color: "red",
                });
                viewer.render?.();
              } else if (next[1] == null) {
                api.setDistanceÅ(null);
                viewer?.removeAllShapes?.();
                const b = boundsRef.current;
                if (b && viewer) addGridLines(viewer, b);
                viewer?.render?.();
              }
              return;
            }
            api.setResidueInfo(
              atom.resn != null && atom.chain != null && atom.resi != null
                ? { resn: atom.resn, chain: atom.chain, resi: atom.resi }
                : null
            );
            const hotspot = getHotspotForResidue(api.id, atom.chain ?? "", atom.resi ?? 0);
            api.setHotspotText(hotspot ? `${hotspot.label}: ${hotspot.description}` : null);
          };
          if (typeof viewer.mapAtomProperties === "function") {
            viewer.mapAtomProperties((a: AtomLike) => {
              (a as Record<string, unknown>).clickable = true;
              (a as Record<string, unknown>).hoverable = true;
              (a as Record<string, unknown>).callback = () => onAtom(a);
              (a as Record<string, unknown>).hover_callback = () => onAtom(a);
              (a as Record<string, unknown>).unhover_callback = () => {
                apiRef.current.setResidueInfo(null);
                apiRef.current.setHotspotText(null);
              };
            }, {});
          }
          viewer.zoomTo();
          viewer.render();
          if (!cancelled) {
            resolvedRef.current = true;
            setLoaded(true);
          }
        })
        .catch((e) => {
          if (!cancelled) {
            resolvedRef.current = true;
            setError(e instanceof Error ? e.message : "Load failed");
          }
        });
    };

    const lib = get3Dmol();
    if (typeof window !== "undefined" && lib) {
      run(lib);
      return () => {
        cancelled = true;
        viewerRef.current = null;
        if (viewer && typeof viewer.destroy === "function") viewer.destroy();
      };
    }

    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !resolvedRef.current) setError("Load timed out. Try “Open in RCSB” below.");
    }, 20000);

    const tryLoad = (scriptUrl: string) => {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (cancelled) return;
        const libAfter = get3Dmol();
        if (libAfter) run(libAfter);
        else if (!cancelled) {
          resolvedRef.current = true;
          setError("3D library failed to load. Try “Open in RCSB” below.");
        }
      };
      script.onerror = () => {
        if (cancelled) return;
        if (scriptUrl === CDN_3DMOL_PRIMARY) {
          tryLoad(CDN_3DMOL_FALLBACK);
        } else {
          resolvedRef.current = true;
          setError("Could not load 3D viewer script");
        }
      };
      document.body.appendChild(script);
      return script;
    };
    tryLoad(CDN_3DMOL_PRIMARY);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      document.querySelectorAll(`script[src="${CDN_3DMOL_PRIMARY}"], script[src="${CDN_3DMOL_FALLBACK}"]`).forEach((s) => s.remove());
      viewerRef.current = null;
      if (viewer && typeof viewer.destroy === "function") viewer.destroy();
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`${RCSB_ENTRY_API}/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { struct?: { title?: string }; rcsb_entry_info?: { resolution_combined?: number[] }; exptl?: { method?: string }[] } | null) => {
        if (cancelled || !data) return;
        const res = data.rcsb_entry_info?.resolution_combined?.[0];
        const method = data.exptl?.[0]?.method;
        setMetadata({
          title: data.struct?.title ?? undefined,
          resolution: res != null && !Number.isNaN(res) ? res : undefined,
          method: method ?? undefined,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const v = viewerRef.current;
    if (!loaded || !v || chains.length === 0) return;
    const base = { color: "spectrum" as const };
    const clickSphere = { clicksphere: { radius: 0.25 } };
    v.setStyle({}, { [displayMode]: base, ...clickSphere });
    chains.forEach((c) => {
      v.setStyle(
        { chain: c },
        visibleChains.has(c)
          ? { [displayMode]: base, ...clickSphere }
          : { [displayMode]: { ...base, opacity: 0 }, ...clickSphere }
      );
    });
    if (residueInfo && visibleChains.has(residueInfo.chain)) {
      v.setStyle(
        { chain: residueInfo.chain, resi: residueInfo.resi },
        { [displayMode]: { color: "red" as const }, ...clickSphere }
      );
    }
    v.render();
  }, [loaded, chains, visibleChains, displayMode, residueInfo]);

  const toggleChain = (c: string) => {
    setVisibleChains((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const centerOnResidue = (chain: string, resi: number) => {
    const v = viewerRef.current;
    if (v?.center) {
      v.center({ chain, resi });
      v.render?.();
    } else if (v?.zoomTo) {
      v.zoomTo({ chain, resi });
      v.render?.();
    }
  };

  const toggleMeasureMode = () => {
    setMeasureMode((on) => {
      if (on) {
        measureAtomsRef.current = [null, null];
        setMeasureAtoms([null, null]);
        setDistanceÅ(null);
        const v = viewerRef.current;
        v?.removeAllShapes?.();
        const b = boundsRef.current;
        if (b && v) addGridLines(v, b);
        v?.render?.();
      }
      return !on;
    });
  };

  const handleExportPng = () => {
    const v = viewerRef.current;
    if (!v?.pngURI) return;
    try {
      const dataUrl = v.pngURI();
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            fallbackDownload(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0);
          const pad = Math.max(12, Math.floor(img.width / 80));
          const fontSize = Math.max(12, Math.floor(img.height / 40));
          ctx.font = `${fontSize}px system-ui, sans-serif`;
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.fillText("visualpeptide.com", img.width - pad, img.height - pad);
          const out = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = out;
          a.download = `${id}.png`;
          a.click();
        } catch {
          fallbackDownload(dataUrl);
        }
      };
      img.onerror = () => fallbackDownload(dataUrl);
      img.src = dataUrl;

      function fallbackDownload(url: string) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${id}.png`;
        a.click();
      }
    } catch {
      // ignore
    }
  };

  const copyCite = () => {
    const text = `RCSB PDB: ${id} (${citeUrl})`;
    void navigator.clipboard.writeText(text);
  };

  const onSeqPanelPointerDown = (e: React.PointerEvent) => {
    if (!(e.target as HTMLElement).closest("[data-seq-title]") || (e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    seqPanelDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: seqPanelPos.x,
      startPosY: seqPanelPos.y,
    };
  };
  const onSeqPanelPointerMove = (e: React.PointerEvent) => {
    const d = seqPanelDragRef.current;
    if (!d) return;
    setSeqPanelPos({
      x: d.startPosX + (e.clientX - d.startX),
      y: d.startPosY + (e.clientY - d.startY),
    });
  };
  const onSeqPanelPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    seqPanelDragRef.current = null;
  };

  return (
    <div
      data-viewer="in-site"
      className={`flex overflow-hidden rounded-none border-2 border-slate-200 bg-slate-200 isolate flex-col md:flex-row ${className}`}
      style={{ contain: "layout" }}
    >
      <div className="flex flex-1 min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-slate-200 bg-white px-3 py-2">
          <span className="text-sm font-medium text-slate-700 shrink-0">
            {title ?? `PDB ${id}`}
          </span>
          {loaded && chains.length > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Chain</span>
              <div className="flex flex-wrap gap-2">
                {chains.map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={visibleChains.has(c)}
                      onChange={() => toggleChain(c)}
                      className="rounded border-slate-300"
                    />
                    {c}
                  </label>
                ))}
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex flex-wrap gap-1">
                {DISPLAY_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDisplayMode(mode)}
                    className={`rounded px-2 py-1 text-xs font-medium capitalize ${
                      displayMode === mode
                        ? "bg-teal-600 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={toggleMeasureMode}
                className={`rounded px-2 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${measureMode ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                title="Measure distance between two atoms"
              >
                Measure
              </button>
              {distanceÅ != null && (
                <span className="text-sm font-medium text-slate-700">{distanceÅ.toFixed(2)} Å</span>
              )}
            </>
          )}
        </div>
        <div className="relative w-full flex-1 min-h-0" style={{ minHeight: `${minHeight}px` }}>
        {!loaded && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-[#1e3a5f]/95 text-slate-300 z-10"
            style={{ minHeight: `${minHeight}px` }}
          >
            <span className="animate-pulse">Loading 3D structure…</span>
          </div>
        )}
        {error && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1e3a5f]/95 text-amber-300 text-sm px-4 z-10"
            style={{ minHeight: `${minHeight}px` }}
          >
            <span>{error}</span>
            <Link href={src} target="_blank" rel="noopener noreferrer" className="link-inline text-xs" aria-label="Open structure in RCSB (new tab)">
              Open in RCSB instead →
            </Link>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full bg-[#1e3a5f]"
          style={{ width: "100%", height: `${minHeight}px`, minHeight: `${minHeight}px` }}
        />
        {(residueInfo || hotspotText) && loaded && (
          <div
            className="absolute left-3 bottom-3 z-10 max-w-[320px] rounded-lg border border-slate-300 bg-white/95 px-3 py-2.5 text-sm text-slate-700 shadow-md backdrop-blur-sm"
            aria-live="polite"
          >
            {residueInfo && (
              <>
                {metadata?.title && (
                  <div className="text-xs text-slate-600 leading-snug border-b border-slate-200 pb-1.5 mb-1.5">
                    {metadata.title}
                  </div>
                )}
                <div className="font-mono text-xs text-slate-800 leading-snug">
                  {id} | Model 1 | Chain {residueInfo.chain} | {residueInfo.resn} {residueInfo.resi}
                </div>
              </>
            )}
            {hotspotText && (
              <p className="mt-1.5 text-slate-600 text-xs leading-snug">{hotspotText}</p>
            )}
          </div>
        )}
        {seqPanelOpen && loaded && chains.length > 0 && (
          <div
            className="absolute z-20 flex w-[300px] max-h-[40vh] flex-col rounded-lg border border-slate-300 bg-white shadow-lg"
            style={{
              right: 8,
              bottom: 8,
              transform: `translate(${seqPanelPos.x}px, ${seqPanelPos.y}px)`,
            }}
            onPointerDown={onSeqPanelPointerDown}
            onPointerMove={onSeqPanelPointerMove}
            onPointerUp={onSeqPanelPointerUp}
          >
            <div
              data-seq-title
              className="flex cursor-grab items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 active:cursor-grabbing"
            >
              <span>Seq ↔ 3D</span>
              <button
                type="button"
                onClick={() => setSeqPanelOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              <div className="flex flex-wrap gap-2">
                {chains.map((ch) => {
                  const seq = sequenceByChain[ch];
                  if (!seq?.length) return null;
                  return (
                    <div key={ch} className="flex flex-wrap items-baseline gap-0.5">
                      <span className="mr-1 text-xs font-medium text-slate-500">Chain {ch}</span>
                      {seq.map(({ resi, resn }) => {
                        const isHighlight =
                          residueInfo?.chain === ch && residueInfo?.resi === resi;
                        return (
                          <button
                            key={`${ch}-${resi}`}
                            type="button"
                            onClick={() => centerOnResidue(ch, resi)}
                            className={`min-h-[44px] min-w-[44px] rounded px-1.5 py-1 font-mono text-xs sm:min-h-0 sm:min-w-0 ${
                              isHighlight
                                ? "bg-teal-200 text-teal-900"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                            title={`${resn} ${ch}${resi}`}
                          >
                            {resi}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <aside
        className="flex flex-shrink-0 flex-row flex-wrap gap-2 border-t border-slate-200 bg-white p-3 md:flex-col md:border-l md:border-t-0 md:w-44 md:gap-1.5"
        aria-label="Actions"
      >
        {metadata && (
          <div className="w-full border-b border-slate-100 pb-2 text-xs text-slate-600 md:mb-0">
            {metadata.title && (
              <div className="truncate font-medium text-slate-700" title={metadata.title}>
                {metadata.title}
              </div>
            )}
            <div className="mt-0.5">
              {metadata.resolution != null && <span>{metadata.resolution} Å</span>}
              {metadata.resolution != null && metadata?.method && " · "}
              {metadata?.method && <span>{metadata.method}</span>}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleExportPng}
          className="min-h-[44px] rounded bg-slate-100 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-200 md:min-h-0 md:py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          title="Export current view as PNG (with watermark)"
        >
          Export PNG
        </button>
        <a
          href={downloadPdbUrl}
          download={`${id}.pdb`}
          className="flex min-h-[44px] items-center rounded bg-slate-100 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-200 md:min-h-0 md:py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          Download PDB
        </a>
        <button
          type="button"
          onClick={copyCite}
          className="min-h-[44px] rounded bg-slate-100 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-200 md:min-h-0 md:py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          title="Copy RCSB citation"
        >
          Copy Cite
        </button>
        {loaded && Object.keys(sequenceByChain).length > 0 && (
          <button
            type="button"
            onClick={() => setSeqPanelOpen((o) => !o)}
            className={`min-h-[44px] w-full rounded px-3 py-2 text-left text-xs font-medium md:min-h-0 md:py-1.5 ${seqPanelOpen ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            title="Toggle sequence panel"
          >
            Seq ↔ 3D {seqPanelOpen ? "▼" : "▶"}
          </button>
        )}
        <a
          href="#how-to-use"
          className="flex min-h-[44px] items-center rounded px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-100 md:min-h-0 md:py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          How to use
        </a>
        <Link
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex min-h-[44px] items-center rounded px-3 py-2 text-left text-xs font-medium text-teal-600 hover:bg-teal-50 md:min-h-0 md:py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          aria-label="Open structure in RCSB (new tab)"
        >
          Open in RCSB →
        </Link>
      </aside>
    </div>
  );
}
