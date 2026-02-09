"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RCSB_3D_VIEW = "https://www.rcsb.org/3d-view";

const CDN_3DMOL_URLS = [
  "https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.3/3Dmol-min.js",
  "https://3Dmol.org/build/3Dmol-min.js",
];

type MinimalViewer = {
  addModel: (data: string, format: string) => void;
  setStyle: (sel: object, style: object) => void;
  zoomTo: (sel?: object) => void;
  render: () => void;
  destroy?: () => void;
};

type Minimal3DmolLib = { createViewer: (el: HTMLElement, config?: { backgroundColor?: string }) => MinimalViewer };

function get3DmolFromWindow(): Minimal3DmolLib | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as { $3Dmol?: Minimal3DmolLib; "3Dmol"?: Minimal3DmolLib };
  return w.$3Dmol ?? w["3Dmol"];
}

interface PdbViewerMinimalProps {
  pdbId: string;
  minHeight?: number;
  className?: string;
}

/**
 * Minimal 3D viewer: load 3Dmol (npm then CDN), fetch PDB, show cartoon only.
 * No chain toggles, residue click, surface, or export — fewer code paths so it loads reliably.
 */
export function PdbViewerMinimal({
  pdbId,
  minHeight = 400,
  className = "",
}: PdbViewerMinimalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedSuccessRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const id = (pdbId ?? "").toString().trim().toUpperCase() || "6XBM";

  const setErrorSafe = useCallback((msg: string) => {
    if (loadedSuccessRef.current) return;
    setError(msg);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let viewer: MinimalViewer | null = null;
    let cancelled = false;
    const resolvedRef = { current: false };

    const run = (lib: Minimal3DmolLib) => {
      if (cancelled || !el) return;
      try {
        viewer = lib.createViewer(el, { backgroundColor: "0xf1f5f9" });
      } catch {
        if (!cancelled) {
          resolvedRef.current = true;
          setErrorSafe("Failed to create viewer");
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
            viewer.addModel(pdbText, "pdb");
            viewer.setStyle({}, { cartoon: { color: "spectrum" } });
            viewer.zoomTo();
            viewer.render();
            if (!cancelled) {
              resolvedRef.current = true;
              loadedSuccessRef.current = true;
              setLoaded(true);
            }
          } catch (e) {
            if (!cancelled) {
              resolvedRef.current = true;
              setErrorSafe(e instanceof Error ? e.message : "Load failed");
            }
          }
        })
        .catch((e) => {
          if (!cancelled) {
            resolvedRef.current = true;
            setErrorSafe(e instanceof Error ? e.message : "Load failed");
          }
        });
    };

    const timeoutId = window.setTimeout(() => {
      if (!cancelled && !resolvedRef.current) {
        setErrorSafe('Load timed out. Try "Open in RCSB" below.');
      }
    }, 20000);

    const tryCDN = (urlIndex: number) => {
      if (cancelled || urlIndex >= CDN_3DMOL_URLS.length) {
        if (!cancelled) {
          resolvedRef.current = true;
          setErrorSafe('Could not load 3D viewer. Try "Open in RCSB" below.');
        }
        return;
      }
      const url = CDN_3DMOL_URLS[urlIndex];
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (cancelled) return;
            const lib = get3DmolFromWindow();
            if (lib?.createViewer) run(lib);
            else tryCDN(urlIndex + 1);
          }, 0);
        });
      };
      script.onerror = () => {
        if (!cancelled) tryCDN(urlIndex + 1);
      };
      document.body.appendChild(script);
    };

    (async () => {
      try {
        const mod = await import("3dmol");
        const lib = (mod.default ?? mod) as typeof window.$3Dmol;
        if (cancelled) return;
        if (!lib?.createViewer) {
          tryCDN(0);
          return;
        }
        run(lib);
      } catch {
        if (!cancelled) tryCDN(0);
      }
    })();

    return () => {
      cancelled = true;
      loadedSuccessRef.current = false;
      window.clearTimeout(timeoutId);
      try {
        CDN_3DMOL_URLS.forEach((u) => {
          document.querySelectorAll(`script[src="${u}"]`).forEach((s) => s.remove());
        });
      } catch {
        // ignore
      }
      try {
        if (viewer?.destroy) viewer.destroy();
      } catch {
        // destroy() can throw (e.g. WebGL context lost); avoid triggering error boundary
      }
    };
  }, [id, setErrorSafe]);

  if (error) {
    return (
      <div
        className={`flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-none border-2 border-slate-200 bg-slate-100 px-4 py-8 text-center ${className}`}
        style={{ minHeight }}
      >
        <p className="text-slate-700">{error}</p>
        <a
          href={`${RCSB_3D_VIEW}/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:underline"
        >
          Open in RCSB →
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative w-full" style={{ minHeight }}>
        <div
          ref={containerRef}
          className="rounded-none border border-slate-200 bg-slate-100"
          style={{ minHeight, width: "100%" }}
        />
        {!loaded && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-none bg-slate-100 text-slate-500"
            style={{ minHeight }}
          >
            Loading 3D viewer…
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-500">
        <a href={`${RCSB_3D_VIEW}/${id}`} target="_blank" rel="noopener noreferrer" className="link-inline">
          Open in RCSB 3D view →
        </a>
      </p>
    </div>
  );
}
