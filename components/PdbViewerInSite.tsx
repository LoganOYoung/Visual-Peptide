"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getHotspotForResidue } from "@/lib/structureHotspots";

const RCSB_3D_VIEW = "https://www.rcsb.org/3d-view";
const CDN_3DMOL_PRIMARY = "https://3Dmol.org/build/3Dmol-min.js";
const CDN_3DMOL_FALLBACK = "https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js";

const DISPLAY_MODES = ["cartoon", "stick", "line", "sphere"] as const;
type DisplayMode = (typeof DISPLAY_MODES)[number];

type ViewerInstance = {
  addModel: (data: string, format: string) => void;
  setStyle: (sel: object, style: object) => void;
  addStyle?: (sel: object, style: object) => void;
  zoomTo: (sel?: object) => void;
  render: () => void;
  destroy?: () => void;
  mapAtomProperties?: (props: (atom: AtomLike) => void, sel?: object) => void;
};
interface AtomLike {
  resn?: string;
  chain?: string;
  resi?: number;
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
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [residueInfo, setResidueInfo] = useState<{ resn: string; chain: string; resi: number } | null>(null);
  const [hotspotText, setHotspotText] = useState<string | null>(null);
  const [chains, setChains] = useState<string[]>([]);
  const [visibleChains, setVisibleChains] = useState<Set<string>>(new Set());
  const [displayMode, setDisplayMode] = useState<DisplayMode>("cartoon");

  const id = pdbId.trim().toUpperCase();
  const src = `${RCSB_3D_VIEW}/${id}`;

  const apiRef = useRef({ setResidueInfo, setHotspotText, setChains, setVisibleChains, id });
  apiRef.current = { setResidueInfo, setHotspotText, setChains, setVisibleChains, id };

  useEffect(() => {
    if (!id) return;
    const container = containerRef.current;
    if (!container) return;

    resolvedRef.current = false;
    setResidueInfo(null);
    setHotspotText(null);
    setChains([]);
    setVisibleChains(new Set());
    let viewer: ViewerInstance | null = null;
    let cancelled = false;
    const el = containerRef.current;

    const get3Dmol = (): Window["$3Dmol"] => {
      if (typeof window === "undefined") return undefined;
      return window.$3Dmol ?? (window as any)["3Dmol"];
    };

    const run = ($3Dmol: NonNullable<Window["$3Dmol"]>) => {
      if (cancelled || !el) return;
      try {
        viewer = $3Dmol.createViewer(el, { backgroundColor: "0xf1f5f9" });
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
          const chainList = chainsFromPdb(pdbText);
          apiRef.current.setChains(chainList);
          apiRef.current.setVisibleChains(new Set(chainList));

          const onAtom = (atom: AtomLike) => {
            const api = apiRef.current;
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
          if (typeof viewer.addStyle === "function") {
            viewer.addStyle({}, { clicksphere: { radius: 0.4 } });
          }

          viewer.setStyle({}, { cartoon: { color: "spectrum" } });
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
    const v = viewerRef.current;
    if (!loaded || !v || chains.length === 0) return;
    const base = { color: "spectrum" as const };
    const clickSphere = { clicksphere: { radius: 0.4 } };
    v.setStyle({}, { [displayMode]: base, ...clickSphere });
    chains.forEach((c) => {
      v.setStyle(
        { chain: c },
        visibleChains.has(c)
          ? { [displayMode]: base, ...clickSphere }
          : { [displayMode]: { ...base, opacity: 0 }, ...clickSphere }
      );
    });
    v.render();
  }, [loaded, chains, visibleChains, displayMode]);

  const toggleChain = (c: string) => {
    setVisibleChains((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

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
          {loaded && chains.length > 0 && (
            <>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">链</span>
              <div className="flex flex-wrap gap-2">
                {chains.map((c) => (
                  <label key={c} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
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
            </>
          )}
        </div>
        <Link
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="link-inline text-xs shrink-0"
          aria-label="Open structure in RCSB (new tab)"
        >
          Open in RCSB →
        </Link>
      </div>
      {(residueInfo || hotspotText) && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
          {residueInfo && (
            <span className="font-medium">
              {residueInfo.resn} Chain {residueInfo.chain} {residueInfo.resi}
            </span>
          )}
          {hotspotText && (
            <p className="mt-1 text-slate-600">{hotspotText}</p>
          )}
        </div>
      )}
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
