"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const RCSB_3D_VIEW = "https://www.rcsb.org/3d-view";
const CDN_3DMOL_PRIMARY = "https://3Dmol.org/build/3Dmol-min.js";
const CDN_3DMOL_FALLBACK = "https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js";

type ViewerInstance = {
  addModel: (data: string, format: string) => void;
  setStyle: (sel: object, style: object) => void;
  zoomTo: (sel?: object, duration?: number) => void;
  render: () => void;
  getUniqueValues?: (attr: string, sel: object) => string[];
  addSurface?: (type: number, style: object, atomsel?: object, allsel?: object) => Promise<unknown>;
  removeAllSurfaces?: () => void;
  getModel?: () => { getUniqueValues?: (attr: string) => string[] };
  destroy?: () => void;
};
declare global {
  interface Window {
    $3Dmol?: {
      createViewer: (el: HTMLElement, config?: { backgroundColor?: string }) => ViewerInstance;
      SurfaceType?: { VDW: number; SAS: number; MS: number; SES: number };
      Gradient?: { RWB: (min: number, max: number, mid?: number) => { range: [number, number]; color: (v: number) => { r: number; g: number; b: number } } };
    };
    "3Dmol"?: { createViewer: (el: HTMLElement, config?: { backgroundColor?: string }) => ViewerInstance };
  }
}

export type ColorMode = "spectrum" | "chain";
export type ViewerState = { chain?: string; residues?: string; labels?: string };

interface PdbViewerInSiteProps {
  pdbId: string;
  title?: string;
  minHeight?: number;
  className?: string;
  /** Initial chain to focus (from URL). */
  initialChain?: string;
  /** Callback when user changes focus chain (for reproducible URL). */
  onStateChange?: (state: ViewerState) => void;
}

function get3Dmol(): Window["$3Dmol"] {
  if (typeof window === "undefined") return undefined;
  return window.$3Dmol ?? (window as unknown as { "3Dmol": Window["$3Dmol"] })["3Dmol"];
}

export function PdbViewerInSite({
  pdbId,
  title,
  minHeight = 400,
  className = "",
  initialChain,
  onStateChange,
}: PdbViewerInSiteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerInstance | null>(null);
  const resolvedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chains, setChains] = useState<string[]>([]);
  const [colorMode, setColorMode] = useState<ColorMode>("spectrum");
  const [surfaceOn, setSurfaceOn] = useState(false);
  const id = pdbId.trim().toUpperCase();
  const src = `${RCSB_3D_VIEW}/${id}`;

  const applyStyleAndSurface = useCallback(() => {
    const v = viewerRef.current;
    const lib = get3Dmol();
    if (!v || !lib) return;
    if (colorMode === "spectrum") {
      v.setStyle({}, { cartoon: { color: "spectrum" } });
    } else {
      v.setStyle({}, { cartoon: { colorscheme: "chain" } });
    }
    if (v.removeAllSurfaces) v.removeAllSurfaces();
    if (surfaceOn && v.addSurface && lib.SurfaceType != null) {
      const st = lib.SurfaceType.SAS ?? lib.SurfaceType.VDW;
      const scheme = lib.Gradient?.RWB ? { colorscheme: { gradient: "rwb" as const, prop: "b" as const, min: 0, max: 100 } } : { opacity: 0.8 };
      v.addSurface(st, scheme, {}, {}).then(() => v.render());
    }
    v.render();
  }, [colorMode, surfaceOn]);

  useEffect(() => {
    if (!loaded || !viewerRef.current) return;
    applyStyleAndSurface();
  }, [loaded, applyStyleAndSurface]);

  useEffect(() => {
    if (!loaded || !initialChain || !viewerRef.current) return;
    viewerRef.current.zoomTo({ chain: initialChain }, 400);
    viewerRef.current.render();
  }, [loaded, initialChain]);

  const focusView = useCallback((chain?: string) => {
    const v = viewerRef.current;
    if (!v) return;
    if (chain) {
      v.zoomTo({ chain }, 400);
      onStateChange?.({ chain });
    } else {
      v.zoomTo({}, 400);
      onStateChange?.({});
    }
    v.render();
  }, [onStateChange]);

  useEffect(() => {
    if (!id) return;
    const container = containerRef.current;
    if (!container) return;

    resolvedRef.current = false;
    viewerRef.current = null;
    let viewer: ViewerInstance | null = null;
    let cancelled = false;
    const el = containerRef.current;

    const run = ($3Dmol: NonNullable<Window["$3Dmol"]>) => {
      if (cancelled || !el) return;
      try {
        viewer = $3Dmol.createViewer(el, { backgroundColor: "0xf1f5f9" });
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
          const chainList = typeof viewer.getUniqueValues === "function" ? viewer.getUniqueValues("chain", {}) : null;
          const chainIds = Array.isArray(chainList) ? chainList : [];
          if (!cancelled) {
            viewerRef.current = viewer;
            setChains(chainIds.length ? chainIds : []);
            setLoaded(true);
          }
          viewer.setStyle({}, { cartoon: { color: "spectrum" } });
          viewer.zoomTo();
          viewer.render();
          if (initialChain && chainIds.includes(initialChain)) {
            viewer.zoomTo({ chain: initialChain }, 0);
            viewer.render();
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
        if (viewer?.destroy) viewer.destroy();
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
      if (viewer?.destroy) viewer.destroy();
    };
  }, [id]);

  return (
    <div
      data-viewer="in-site"
      className={`overflow-hidden rounded-none border-2 border-slate-200 bg-slate-100 isolate ${className}`}
      style={{ contain: "layout" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <span className="text-sm font-medium text-slate-700">
          {title ?? `PDB ${id} — 3D Structure`}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {loaded && (
            <>
              <span className="text-xs text-slate-500">Color:</span>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ColorMode)}
                className="rounded-none border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                aria-label="Coloring mode"
              >
                <option value="spectrum">Spectrum</option>
                <option value="chain">By chain</option>
              </select>
              <span className="text-xs text-slate-500">View:</span>
              <select
                key={id}
                defaultValue=""
                onChange={(e) => focusView(e.target.value || undefined)}
                className="rounded-none border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                aria-label="Preset view"
              >
                <option value="">Focus all</option>
                {chains.map((ch) => (
                  <option key={ch} value={ch}>Focus {ch}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={surfaceOn}
                  onChange={(e) => setSurfaceOn(e.target.checked)}
                  className="rounded border-slate-300"
                  aria-label="Hydrophobic surface"
                />
                Surface
              </label>
            </>
          )}
          <Link href="/verify" className="link-inline text-xs" aria-label="Batch verify">Verify</Link>
          <Link
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="link-inline text-xs"
            aria-label="Open structure in RCSB (new tab)"
          >
            Open in RCSB →
          </Link>
        </div>
      </div>
      <div className="relative w-full" style={{ minHeight: `${minHeight}px` }}>
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
            <Link href={src} target="_blank" rel="noopener noreferrer" className="link-inline text-xs" aria-label="Open structure in RCSB (new tab)">
              Open in RCSB instead →
            </Link>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full bg-slate-100"
          style={{ width: "100%", height: `${minHeight}px`, minHeight: `${minHeight}px` }}
        />
      </div>
    </div>
  );
}
