"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getChainsFromPdb,
  getSequenceFromPdb,
  parseResidueRange,
  parseLabelSpec,
} from "@/lib/pdbParse";
import { getHotspotAnnotation } from "@/lib/hotspotAnnotations";

const RCSB_3D_VIEW = "https://www.rcsb.org/3d-view";

/** CDN fallback when npm import("3dmol") fails (e.g. in some production/Edge environments). */
const CDN_3DMOL_URLS = [
  "https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.3/3Dmol-min.js",
  "https://3Dmol.org/build/3Dmol-min.js",
];

declare global {
  interface Window {
    $3Dmol?: ThreeDmolLib;
    "3Dmol"?: ThreeDmolLib;
  }
}

/** 3Dmol library (from npm package 3dmol or window after CDN load); minimal type for createViewer + optional surface/gradient. */
type ThreeDmolLib = {
  createViewer: (el: HTMLElement, config?: { backgroundColor?: string }) => ViewerInstance;
  SurfaceType?: { SAS?: unknown };
  Gradient?: { RWB: new (a: number, b: number) => unknown };
};

/** 3Dmol atom-like (resn, resi, chain, x, y, z). */
export type ResidueInfo = {
  resn?: string;
  resi?: number;
  chain?: string;
  elem?: string;
  x?: number;
  y?: number;
  z?: number;
};

type ViewerInstance = {
  addModel: (data: string, format: string) => void;
  setStyle: (sel: object, style: object) => void;
  addStyle?: (sel: object, style: object) => void;
  zoomTo: (sel?: object) => void;
  center?: (sel?: object, duration?: number) => void;
  render: () => void;
  destroy?: () => void;
  removeAllShapes?: () => void;
  addLine?: (spec: { start: { x: number; y: number; z: number }; end: { x: number; y: number; z: number }; color?: string; linewidth?: number; dashed?: boolean }) => unknown;
  addLabel?: (text: string, options: object, sel?: object, noshow?: boolean) => unknown;
  pngURI?: () => string;
  addSurface?: (type: string, style: object, sel: object, allSel?: object, focus?: object, callback?: () => void) => Promise<number> | number;
  removeSurface?: (surfId: number) => void;
};

type DisplayStyle = "cartoon" | "stick" | "line" | "sphere";
type ColorScheme = "spectrum" | "chain";

interface PdbViewerInSiteProps {
  pdbId: string;
  title?: string;
  minHeight?: number;
  className?: string;
  /** Initial chain to focus/highlight (from URL e.g. chain=A). */
  initialChain?: string | null;
  /** Initial residue range to highlight (e.g. "15-20" or "15,20"). */
  initialResidues?: string | null;
  /** Fixed labels "resi:chain,..." e.g. "15:A,20:A". */
  fixedLabels?: string | null;
  onChainsLoaded?: (chains: string[]) => void;
}

function distance(
  a: { x?: number; y?: number; z?: number },
  b: { x?: number; y?: number; z?: number }
): number {
  const dx = (a.x ?? 0) - (b.x ?? 0);
  const dy = (a.y ?? 0) - (b.y ?? 0);
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function PdbViewerInSite({
  pdbId,
  title,
  minHeight = 400,
  className = "",
  initialChain = null,
  initialResidues = null,
  fixedLabels = null,
  onChainsLoaded,
}: PdbViewerInSiteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedRef = useRef(false);
  const pdbTextRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResidue, setSelectedResidue] = useState<ResidueInfo | null>(null);
  const [hoverResidue, setHoverResidue] = useState<ResidueInfo | null>(null);
  const [chains, setChains] = useState<string[]>([]);
  const [chainVisibility, setChainVisibility] = useState<Record<string, boolean>>({});
  const [sequences, setSequences] = useState<{ chainId: string; sequence: string; residues: { resn: string; resi: number }[] }[]>([]);
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>("cartoon");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("spectrum");
  const [measureMode, setMeasureMode] = useState(false);
  const [measureAtoms, setMeasureAtoms] = useState<ResidueInfo[]>([]);
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showHydrophobicitySurface, setShowHydrophobicitySurface] = useState(false);
  const surfaceIdRef = useRef<number | null>(null);
  const viewerRef = useRef<ViewerInstance | null>(null);
  const libRef = useRef<ThreeDmolLib | null>(null);
  const onChainsLoadedRef = useRef(onChainsLoaded);
  onChainsLoadedRef.current = onChainsLoaded;
  const clickCallbackRef = useRef<(atom: ResidueInfo) => void>(() => {});

  const id = (pdbId ?? "").toString().trim().toUpperCase() || "6XBM";
  const src = `${RCSB_3D_VIEW}/${id}`;

  const setResidueFromAtom = useCallback((atom: ResidueInfo) => {
    if (!atom || (atom.resn == null && atom.resi == null)) return;
    setSelectedResidue({
      resn: atom.resn ?? "",
      resi: atom.resi ?? 0,
      chain: atom.chain ?? "",
    });
  }, []);

  const handleAtomClick = useCallback(
    (atom: ResidueInfo) => {
      if (measureMode) {
        setMeasureAtoms((prev) => {
          const next = prev.length >= 2 ? [atom] : [...prev, atom];
          if (next.length === 2) {
            const d = distance(next[0], next[1]);
            setMeasureDistance(d);
            const v = viewerRef.current as any;
            if (v?.removeAllShapes) v.removeAllShapes();
            if (v?.addLine && next[0].x != null && next[1].x != null) {
              v.addLine({
                start: { x: next[0].x, y: next[0].y, z: next[0].z },
                end: { x: next[1].x, y: next[1].y, z: next[1].z },
                color: "red",
                linewidth: 2,
              });
            }
            v?.render?.();
          } else {
            setMeasureDistance(null);
          }
          return next;
        });
      } else {
        setResidueFromAtom(atom);
      }
    },
    [measureMode, setResidueFromAtom]
  );
  clickCallbackRef.current = handleAtomClick;

  const applyViewerStyle = useCallback(
    (viewer: ViewerInstance, chainVis: Record<string, boolean>) => {
      try {
        const baseStyle: Record<string, unknown> = {
          cartoon: displayStyle === "cartoon" ? { color: colorScheme === "chain" ? "chain" : "spectrum" } : { hidden: true },
          stick: displayStyle === "stick" ? { radius: 0.3, color: colorScheme === "chain" ? "chain" : "spectrum" } : { hidden: true },
          line: displayStyle === "line" ? { color: colorScheme === "chain" ? "chain" : "spectrum" } : { hidden: true },
          sphere: displayStyle === "sphere" ? { scale: 0.5, color: colorScheme === "chain" ? "chain" : "spectrum" } : { hidden: true },
          clicksphere: {
            scale: 1.2,
            callback: function (this: ResidueInfo) {
              clickCallbackRef.current(this);
            },
            hover_callback: function (this: ResidueInfo) {
              setHoverResidue(
                this?.resn != null || this?.resi != null
                  ? { resn: this.resn ?? "", resi: this.resi ?? 0, chain: this.chain ?? "" }
                  : null
              );
            },
            unhover_callback: () => setHoverResidue(null),
          } as any,
        };
        viewer.setStyle({}, baseStyle);
        chains.forEach((ch) => {
          const vis = chainVis[ch];
          viewer.setStyle(
            { chain: ch },
            {
              cartoon: { hidden: !vis },
              line: { hidden: !vis },
              stick: { hidden: !vis },
              sphere: { hidden: !vis },
            }
          );
        });
        viewer.render();
      } catch {
        // 3Dmol may throw on style; avoid bubbling to error boundary
      }
    },
    [displayStyle, colorScheme, chains]
  );

  useEffect(() => {
    if (!id) return;
    const container = containerRef.current;
    if (!container) return;

    resolvedRef.current = false;
    let viewer: ViewerInstance | null = null;
    let cancelled = false;
    const el = containerRef.current;

    const run = (lib: ThreeDmolLib) => {
      if (cancelled || !el) return;
      try {
        viewer = lib.createViewer(el, { backgroundColor: "0xf1f5f9" });
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
          try {
            pdbTextRef.current = pdbText;
            viewer.addModel(pdbText, "pdb");

            const chainList = getChainsFromPdb(pdbText);
            const seqs = getSequenceFromPdb(pdbText);
            if (!cancelled) {
              setChains(chainList);
              setSequences(seqs);
              const vis: Record<string, boolean> = {};
              if (initialChain) {
                chainList.forEach((ch) => (vis[ch] = ch === initialChain));
              } else {
                chainList.forEach((ch) => (vis[ch] = true));
              }
              setChainVisibility(vis);
              onChainsLoadedRef.current?.(chainList);
            }

            const baseStyle: Record<string, unknown> = {
              cartoon: { color: "spectrum" },
              stick: { hidden: true },
              line: { hidden: true },
              sphere: { hidden: true },
              clicksphere: {
                scale: 1.2,
                callback: function (this: ResidueInfo) {
                  clickCallbackRef.current(this);
                },
                hover_callback: function (this: ResidueInfo) {
                  setHoverResidue(
                    this?.resn != null || this?.resi != null
                      ? { resn: this.resn ?? "", resi: this.resi ?? 0, chain: this.chain ?? "" }
                      : null
                  );
                },
                unhover_callback: () => setHoverResidue(null),
              } as any,
            };
            viewer.setStyle({}, baseStyle);
            chainList.forEach((ch) => {
              const visible = initialChain ? ch === initialChain : true;
              viewer!.setStyle(
                { chain: ch },
                { cartoon: { hidden: !visible }, line: { hidden: !visible }, stick: { hidden: !visible }, sphere: { hidden: !visible } }
              );
            });

            if (initialResidues && initialChain) {
              const resList = parseResidueRange(initialResidues);
              if (resList.length && typeof (viewer as any).addStyle === "function") {
                (viewer as any).addStyle(
                  { chain: initialChain, resi: resList },
                  { stick: { radius: 0.4, color: "yellow" } }
                );
              }
            }

            const labels = fixedLabels ? parseLabelSpec(fixedLabels) : [];
            labels.forEach(({ resi, chain: ch }) => {
              if (typeof (viewer as any).addLabel === "function") {
                (viewer as any).addLabel(`${resi}`, { fontColor: "black", backgroundColor: "white", backgroundOpacity: 0.8 }, { chain: ch, resi }, true);
              }
            });
            if (labels.length) viewer.render();

            viewer.zoomTo(initialChain ? { chain: initialChain } : undefined);
            viewer.render();
            viewerRef.current = viewer;
            if (!cancelled) {
              resolvedRef.current = true;
              setLoaded(true);
            }
          } catch (e) {
            if (!cancelled) {
              resolvedRef.current = true;
              setError(e instanceof Error ? e.message : "Load failed");
            }
          }
        })
        .catch((e) => {
          if (!cancelled) {
            resolvedRef.current = true;
            setError(e instanceof Error ? e.message : "Load failed");
          }
        });
    };

    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !resolvedRef.current) setError('Load timed out. Try "Open in RCSB" below.');
    }, 25000);

    const get3DmolFromWindow = (): ThreeDmolLib | undefined => {
      if (typeof window === "undefined") return undefined;
      return window.$3Dmol ?? window["3Dmol"];
    };

    const tryLoadFromCDN = (urlIndex: number) => {
      if (cancelled || urlIndex >= CDN_3DMOL_URLS.length) {
        if (!cancelled) {
          resolvedRef.current = true;
          setError("Could not load 3D viewer. Try \"Open in RCSB\" below.");
        }
        return;
      }
      const scriptUrl = CDN_3DMOL_URLS[urlIndex];
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (cancelled) return;
            const lib = get3DmolFromWindow();
            if (lib?.createViewer) {
              libRef.current = lib;
              run(lib);
            } else tryLoadFromCDN(urlIndex + 1);
          }, 0);
        });
      };
      script.onerror = () => {
        if (cancelled) return;
        tryLoadFromCDN(urlIndex + 1);
      };
      document.body.appendChild(script);
    };

    (async () => {
      try {
        const mod = await import("3dmol");
        const lib = (mod.default ?? mod) as unknown as ThreeDmolLib;
        if (cancelled) return;
        if (!lib?.createViewer) {
          tryLoadFromCDN(0);
          return;
        }
        libRef.current = lib;
        run(lib);
      } catch {
        if (!cancelled) tryLoadFromCDN(0);
      }
    })();

    return () => {
      cancelled = true;
      viewerRef.current = null;
      libRef.current = null;
      window.clearTimeout(timeoutId);
      CDN_3DMOL_URLS.forEach((u) => {
        document.querySelectorAll(`script[src="${u}"]`).forEach((s) => s.remove());
      });
      if (viewer && typeof viewer.destroy === "function") viewer.destroy();
    };
  }, [id, setResidueFromAtom, initialChain, initialResidues, fixedLabels]);

  useEffect(() => {
    if (!loaded || !viewerRef.current || chains.length === 0) return;
    applyViewerStyle(viewerRef.current, chainVisibility);
  }, [displayStyle, colorScheme, loaded, chainVisibility, chains.length, applyViewerStyle]);

  useEffect(() => {
    try {
      const v = viewerRef.current as any;
      const $3Dmol = libRef.current;
      if (!loaded || !v || !$3Dmol) return;
      if (showHydrophobicitySurface) {
        const surfType = $3Dmol.SurfaceType?.SAS ?? "SAS";
        const style: Record<string, unknown> = { opacity: 0.75 };
        if ($3Dmol.Gradient?.RWB) style.map = { prop: "partialCharge", scheme: new $3Dmol.Gradient.RWB(-0.5, 0.5) };
        const addSurf = v.addSurface?.bind(v);
        if (typeof addSurf === "function") {
          const p = addSurf(surfType, style, {}, {}, undefined, () => {});
          if (typeof p?.then === "function") {
            p.then((sid: number) => { surfaceIdRef.current = sid; v.render(); }).catch(() => {});
          } else if (typeof p === "number") {
            surfaceIdRef.current = p;
            v.render();
          }
        }
      } else {
        const sid = surfaceIdRef.current;
        if (sid != null && typeof v.removeSurface === "function") {
          v.removeSurface(sid);
          surfaceIdRef.current = null;
          v.render();
        }
      }
    } catch {
      // Surface/3Dmol may throw; avoid bubbling to error boundary
    }
  }, [loaded, showHydrophobicitySurface]);

  const toggleChain = useCallback((chainId: string) => {
    setChainVisibility((prev) => {
      const next = { ...prev, [chainId]: !prev[chainId] };
      const v = viewerRef.current;
      if (v?.setStyle) {
        v.setStyle(
          { chain: chainId },
          { cartoon: { hidden: next[chainId] === false }, line: { hidden: next[chainId] === false }, stick: { hidden: next[chainId] === false }, sphere: { hidden: next[chainId] === false } }
        );
        v.render();
      }
      return next;
    });
  }, []);

  const resetMeasure = useCallback(() => {
    setMeasureAtoms([]);
    setMeasureDistance(null);
    const v = viewerRef.current as any;
    if (v?.removeAllShapes) {
      v.removeAllShapes();
      v.render();
    }
  }, []);

  const exportPng = useCallback(() => {
    const v = viewerRef.current as any;
    if (!v?.pngURI) return;
    setExporting(true);
    try {
      let prevBg: unknown, prevAlpha: unknown;
      if (typeof v.getConfig === "function" && typeof v.setConfig === "function") {
        const cfg = v.getConfig();
        prevBg = cfg?.backgroundColor;
        prevAlpha = cfg?.backgroundAlpha;
        v.setConfig({ backgroundColor: "transparent", backgroundAlpha: 0 });
      }
      v.render?.();
      const dataUri = v.pngURI();
      if (dataUri) {
        const a = document.createElement("a");
        a.href = dataUri;
        a.download = `pdb-${id}.png`;
        a.click();
      }
      if (typeof v.setConfig === "function" && (prevBg != null || prevAlpha != null)) {
        v.setConfig({ backgroundColor: prevBg ?? "0xf1f5f9", backgroundAlpha: prevAlpha ?? 1 });
      }
      v.render?.();
    } finally {
      setExporting(false);
    }
  }, [id]);

  const focusAll = useCallback(() => {
    viewerRef.current?.zoomTo?.();
    viewerRef.current?.render?.();
  }, []);

  const focusChain = useCallback((chainId: string) => {
    viewerRef.current?.zoomTo?.({ chain: chainId });
    viewerRef.current?.render?.();
  }, []);

  const centerResidue = useCallback((chainId: string, resi: number) => {
    const v = viewerRef.current as any;
    if (v?.center) v.center({ chain: chainId, resi }, 500);
    else if (v?.zoomTo) v.zoomTo({ chain: chainId, resi });
    v?.render?.();
    setSelectedResidue({ resn: "", resi, chain: chainId });
  }, []);

  const formatResidue = (r: ResidueInfo) => {
    const parts = [r.resn || "?", r.resi ?? "?", r.chain ? `Chain ${r.chain}` : ""].filter(Boolean);
    return parts.join(" ");
  };

  const hotspotFor = useCallback(
    (r: ResidueInfo | null) =>
      r?.resi != null && r?.chain != null && r?.resn != null
        ? getHotspotAnnotation(id, r.resi, r.chain, r.resn)
        : null,
    [id]
  );
  const hoverHotspot = hoverResidue ? hotspotFor(hoverResidue) : null;
  const selectedHotspot = selectedResidue ? hotspotFor(selectedResidue) : null;

  return (
    <div
      data-viewer="in-site"
      className={`overflow-hidden rounded-none border-2 border-slate-200 bg-slate-100 isolate ${className}`}
      style={{ contain: "layout" }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 sm:px-4 flex-wrap gap-2 min-h-[44px] sm:min-h-0">
        <span className="text-sm font-medium text-slate-700 truncate">
          {title ?? `PDB ${id} — 3D Structure`}
        </span>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Link
            href="/verify"
            className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center sm:inline text-xs text-slate-600 hover:text-slate-900 py-2 sm:py-0"
            aria-label="Verify batch / Purity & Verify"
          >
            Verify
          </Link>
          <Link
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="link-inline min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center sm:inline text-xs py-2 sm:py-0"
            aria-label="Open in RCSB (new tab)"
          >
            Open in RCSB →
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-0">
        <div
          className="relative flex-1"
          style={{ minHeight: `${minHeight}px`, touchAction: "none" }}
          aria-label="3D structure; one finger to rotate, two to zoom"
        >
          {!loaded && !error && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-slate-100/95 text-slate-600 z-10"
              style={{ minHeight: `${minHeight}px` }}
            >
              <span className="animate-pulse">Loading 3D structure…</span>
            </div>
          )}
          {error && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100/95 text-amber-700 text-sm px-4 z-10"
              style={{ minHeight: `${minHeight}px` }}
            >
              <span>{error}</span>
              <Link href={src} target="_blank" rel="noopener noreferrer" className="link-inline text-xs">
                Open in RCSB instead →
              </Link>
            </div>
          )}
          {hoverResidue && loaded && (
            <div
              className="absolute bottom-3 left-3 z-20 max-w-[280px] rounded-none border border-slate-300 bg-white/95 px-2 py-1.5 text-xs text-slate-700 shadow"
              role="tooltip"
            >
              <div className="font-medium">{formatResidue(hoverResidue)}</div>
              {hoverHotspot && (
                <div className="mt-0.5 text-slate-600">{hoverHotspot.explanation}</div>
              )}
            </div>
          )}
          {measureMode && loaded && (
            <div className="absolute top-2 left-2 z-20 max-w-[200px] rounded-none border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800">
              Click two atoms to measure distance. {measureAtoms.length === 1 && "One selected."}
            </div>
          )}
          {measureDistance != null && (
            <div className="absolute top-2 right-2 z-20 rounded-none border border-slate-300 bg-white px-2 py-1 text-sm font-medium text-slate-800">
              Distance: {measureDistance.toFixed(2)} Å
            </div>
          )}
          <div className="sm:hidden absolute bottom-2 right-2 z-10 text-[10px] text-slate-400 pointer-events-none">
            One finger rotate · Two finger zoom
          </div>
          <div
            ref={containerRef}
            className="w-full bg-slate-100"
            style={{ width: "100%", height: `${minHeight}px`, minHeight: `${minHeight}px` }}
          />
        </div>

        <div className="w-full sm:w-64 border-t sm:border-t-0 sm:border-l border-slate-200 bg-white flex-shrink-0 flex flex-col max-h-[70vh] overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom,0)]">
            {/* Display & color */}
            <div className="border-b border-slate-200 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Display</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <select
                  value={displayStyle}
                  onChange={(e) => setDisplayStyle(e.target.value as DisplayStyle)}
                  className="min-h-[44px] sm:min-h-[32px] rounded border border-slate-300 text-sm pl-2 pr-6 py-1.5 sm:py-1"
                >
                  <option value="cartoon">Cartoon (Ribbon)</option>
                  <option value="stick">Stick</option>
                  <option value="line">Line</option>
                  <option value="sphere">Sphere</option>
                </select>
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
                  className="min-h-[44px] sm:min-h-[32px] rounded border border-slate-300 text-sm pl-2 pr-6 py-1.5 sm:py-1"
                >
                  <option value="spectrum">Spectrum</option>
                  <option value="chain">By chain</option>
                </select>
              </div>
            </div>

            {/* Measure */}
            <div className="border-b border-slate-200 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Measure</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setMeasureMode((m) => !m); resetMeasure(); }}
                  className={`min-h-[44px] sm:min-h-[32px] text-sm px-3 py-2 sm:py-1 rounded ${measureMode ? "bg-amber-200" : "bg-slate-100 hover:bg-slate-200"}`}
                >
                  {measureMode ? "Cancel" : "Distance"}
                </button>
                {(measureMode || measureAtoms.length > 0) && (
                  <button type="button" onClick={resetMeasure} className="min-h-[44px] sm:min-h-[32px] text-sm px-3 py-2 sm:py-1 rounded bg-slate-100 hover:bg-slate-200">
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Surface */}
            <div className="border-b border-slate-200 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Surface</p>
              <label className="mt-1 min-h-[44px] sm:min-h-0 inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 py-2 sm:py-0">
                <input
                  type="checkbox"
                  checked={showHydrophobicitySurface}
                  onChange={(e) => setShowHydrophobicitySurface(e.target.checked)}
                  className="rounded border-slate-300 w-4 h-4"
                />
                <span>Hydrophobicity (red/blue)</span>
              </label>
            </div>

            {/* Export & Preset views */}
            <div className="border-b border-slate-200 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">View</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportPng}
                  disabled={!loaded || exporting}
                  className="min-h-[44px] sm:min-h-[32px] text-sm px-3 py-2 sm:py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
                >
                  {exporting ? "…" : "Export PNG"}
                </button>
                <button type="button" onClick={focusAll} className="min-h-[44px] sm:min-h-[32px] text-sm px-3 py-2 sm:py-1 rounded bg-slate-100 hover:bg-slate-200">
                  Focus all
                </button>
                {chains.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => focusChain(ch)}
                    className="min-h-[44px] sm:min-h-[32px] text-sm px-3 py-2 sm:py-1 rounded bg-slate-100 hover:bg-slate-200"
                  >
                    Focus {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Chains */}
            {chains.length > 0 && (
              <div className="border-b border-slate-200 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Chains</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {chains.map((ch) => (
                    <label key={ch} className="min-h-[44px] sm:min-h-0 inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 py-2 sm:py-0">
                      <input
                        type="checkbox"
                        checked={chainVisibility[ch] !== false}
                        onChange={() => toggleChain(ch)}
                        className="rounded border-slate-300 w-4 h-4 shrink-0"
                      />
                      <span>Chain {ch}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sequence bar */}
            {sequences.length > 0 && (
              <div className="border-b border-slate-200 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Sequence</p>
                <div className="mt-1 space-y-1">
                  {sequences.map(({ chainId, sequence, residues }) => (
                    <div key={chainId}>
                      <span className="text-xs text-slate-500">Chain {chainId}:</span>
                      <div className="flex flex-wrap gap-0.5 font-mono text-xs leading-tight mt-0.5">
                        {sequence.split("").map((letter, i) => {
                          const res = residues[i];
                          const isSelected =
                            selectedResidue?.chain === chainId && selectedResidue?.resi === res?.resi;
                          return (
                            <button
                              key={`${chainId}-${i}-${res?.resi}`}
                              type="button"
                              onClick={() => res && centerResidue(chainId, res.resi)}
                              className={`min-w-[2rem] min-h-[44px] sm:min-w-[1.25rem] sm:min-h-[28px] py-1 sm:py-0.5 inline-flex items-center justify-center ${isSelected ? "bg-teal-200 ring-1 ring-teal-400" : "hover:bg-slate-200"}`}
                              title={`${res?.resn ?? ""} ${res?.resi ?? i + 1}`}
                            >
                              {letter}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected residue */}
            <div className="px-3 py-2 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Selected residue</p>
              {selectedResidue ? (
                <div className="mt-1">
                  <p className="text-sm text-slate-800 font-medium">{formatResidue(selectedResidue)}</p>
                  {selectedHotspot && (
                    <p className="mt-0.5 text-xs text-slate-600">{selectedHotspot.explanation}</p>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-500">Click an atom in the structure</p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
