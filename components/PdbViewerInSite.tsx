"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const RCSB_3D_VIEW = "https://www.rcsb.org/3d-view";
// Viewer-only build (no RCSB UI). Try official first, fallback to jsDelivr.
const CDN_3DMOL_PRIMARY = "https://3Dmol.org/build/3Dmol-min.js";
const CDN_3DMOL_FALLBACK = "https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js";

type ViewerInstance = {
  addModel: (data: string, format: string) => void;
  setStyle: (a: object, b: object) => void;
  zoomTo: () => void;
  render: () => void;
  destroy?: () => void;
};
declare global {
  interface Window {
    $3Dmol?: { createViewer: (el: HTMLElement, config?: { backgroundColor?: string }) => ViewerInstance };
    "3Dmol"?: { createViewer: (el: HTMLElement, config?: { backgroundColor?: string }) => ViewerInstance };
  }
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
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = pdbId.trim().toUpperCase();
  const src = `${RCSB_3D_VIEW}/${id}`;

  useEffect(() => {
    if (!id) return;
    const container = containerRef.current;
    if (!container) return;

    resolvedRef.current = false;
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
    const script = tryLoad(CDN_3DMOL_PRIMARY);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      document.querySelectorAll(`script[src="${CDN_3DMOL_PRIMARY}"], script[src="${CDN_3DMOL_FALLBACK}"]`).forEach((s) => s.remove());
      if (viewer && typeof viewer.destroy === "function") viewer.destroy();
    };
  }, [id]);

  return (
    <div
      data-viewer="in-site"
      className={`overflow-hidden rounded-none border-2 border-slate-200 bg-slate-100 isolate ${className}`}
      style={{ contain: "layout" }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <span className="text-sm font-medium text-slate-700">
          {title ?? `PDB ${id} — 3D Structure`}
        </span>
        <Link
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="link-inline text-xs"
        >
          Open in RCSB →
        </Link>
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
            <Link href={src} target="_blank" rel="noopener noreferrer" className="link-inline text-xs">
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
