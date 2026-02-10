"use client";

import { useEffect, useRef, useState } from "react";

const CDN_3DMOL_PRIMARY = "https://3Dmol.org/build/3Dmol-min.js";
const CDN_3DMOL_FALLBACK = "https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js";
const RCSB_PDB = "https://files.rcsb.org/view";

type ViewerInstance = {
  addModelsAsFrames?: (data: string, format: string) => unknown;
  addModel: (data: string, format: string) => void;
  setStyle: (a: object, b: object) => void;
  zoomTo: () => void;
  render: () => void;
  animate?: (opts: { loop?: string; reps?: number; interval?: number }) => void;
  pauseAnimate?: () => void;
  getFrame?: () => number;
  setFrame?: (i: number) => void;
  getNumFrames?: () => number;
  clear?: () => void;
  destroy?: () => void;
  pngURI?: () => string;
};

type ThreeDmolLib = { createViewer: (el: HTMLElement, config?: { backgroundColor?: string }) => ViewerInstance };

interface TrajectoryViewerProps {
  /** Ordered list of PDB IDs: each fetched from RCSB as one frame. Use this OR pdbUrl OR framePdbTexts. */
  framePdbIds?: string[];
  /** Single multi-MODEL PDB file: path or full URL. Use this OR framePdbIds OR framePdbTexts. */
  pdbUrl?: string;
  /** Pre-computed PDB strings (e.g. from morphing). When provided, no fetch. Use this OR framePdbIds OR pdbUrl. */
  framePdbTexts?: string[];
  title?: string;
  minHeight?: number;
  /** Interval between frames in ms. */
  intervalMs?: number;
  /** Start playing automatically. */
  autoPlay?: boolean;
  className?: string;
}

function buildMultiModelPdb(framePdbTexts: string[]): string {
  return framePdbTexts
    .map((pdb, i) => {
      const trimmed = pdb.trim();
      const withoutModel = trimmed.replace(/^MODEL\s+\d+\s*\n?/m, "").replace(/\n?ENDMDL\s*$/m, "");
      return `MODEL ${i + 1}\n${withoutModel}\nENDMDL`;
    })
    .join("\n");
}

/** Parse a multi-MODEL PDB string into an array of per-model PDB strings (for manual frame switching). */
function parseMultiModelPdb(pdbText: string): string[] {
  const blocks = pdbText.match(/MODEL\s+\d+\s*[\s\S]*?ENDMDL/gi);
  if (blocks && blocks.length > 0) return blocks;
  return pdbText.trim() ? [pdbText] : [];
}

export function TrajectoryViewer({
  framePdbIds,
  pdbUrl,
  framePdbTexts,
  title = "3D reaction demo",
  minHeight = 480,
  intervalMs = 600,
  autoPlay = true,
  className = "",
}: TrajectoryViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [frame, setFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<ViewerInstance | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameTextsRef = useRef<string[]>([]);
  const animationModeRef = useRef<"native" | "manual" | "none">("none");
  const currentFrameIndexRef = useRef(0);
  const intervalMsRef = useRef(intervalMs);
  const wrapperRef = useRef<HTMLDivElement>(null);
  intervalMsRef.current = intervalMs;

  const usePdbUrl = Boolean(pdbUrl?.trim());
  const useFrameIds = Boolean(framePdbIds?.length);
  const usePrecomputed = Boolean(framePdbTexts?.length);

  useEffect(() => {
    if (!usePdbUrl && !useFrameIds && !usePrecomputed) {
      setError("Provide framePdbIds, pdbUrl, or framePdbTexts");
      return;
    }

    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    const get3Dmol = (): ThreeDmolLib | undefined => {
      if (typeof window === "undefined") return undefined;
      const w = window as unknown as { $3Dmol?: ThreeDmolLib; "3Dmol"?: ThreeDmolLib };
      return w.$3Dmol ?? w["3Dmol"];
    };

    const loadFrames = (): Promise<{ texts: string[]; combined: string }> => {
      if (usePrecomputed && framePdbTexts?.length) {
        const combined = buildMultiModelPdb(framePdbTexts);
        return Promise.resolve({ texts: framePdbTexts, combined });
      }
      if (usePdbUrl && pdbUrl) {
        return fetch(pdbUrl.trim(), { cache: "force-cache" })
          .then((r) => {
            if (!r.ok) throw new Error(`Fetch ${r.status}`);
            return r.text();
          })
          .then((raw) => ({ texts: parseMultiModelPdb(raw), combined: raw }));
      }
      if (framePdbIds?.length) {
        return Promise.all(
          framePdbIds.map((id) =>
            fetch(`${RCSB_PDB}/${id.trim().toUpperCase()}.pdb`, { cache: "force-cache" }).then((r) => {
              if (!r.ok) throw new Error(`PDB ${r.status}`);
              return r.text();
            })
          )
        ).then((texts) => ({ texts, combined: buildMultiModelPdb(texts) }));
      }
      return Promise.resolve({ texts: [], combined: "" });
    };

    const run = ($3Dmol: ThreeDmolLib) => {
      if (cancelled || !el) return;
      loadFrames()
        .then(({ texts: frameTexts, combined }) => {
          if (cancelled || !el || !frameTexts.length) {
            if (!frameTexts.length && !cancelled) setError("No frames in file");
            return;
          }
          let viewer: ViewerInstance;
          try {
            viewer = $3Dmol.createViewer(el, { backgroundColor: "0x1e293b" });
          } catch (e) {
            setError("Failed to create viewer");
            return;
          }
          viewerRef.current = viewer;
          frameTextsRef.current = frameTexts;
          let numF = frameTexts.length;
          let useNativeAnimation = false;

          if (typeof viewer.addModelsAsFrames === "function") {
            try {
              viewer.addModelsAsFrames(combined, "pdb");
              const n = typeof viewer.getNumFrames === "function" ? viewer.getNumFrames() : numF;
              if (n > 1) {
                numF = n;
                useNativeAnimation = true;
                animationModeRef.current = "native";
              } else {
                animationModeRef.current = "none";
              }
            } catch {
              viewer.clear?.();
              viewer.addModel(frameTexts[0], "pdb");
              numF = 1;
              animationModeRef.current = "none";
            }
          } else {
            viewer.addModel(frameTexts[0], "pdb");
            if (frameTexts.length > 1) animationModeRef.current = "manual";
            else animationModeRef.current = "none";
          }

          viewer.setStyle({}, { stick: {}, cartoon: { color: "spectrum" } });
          viewer.zoomTo();
          viewer.render();
          setTotalFrames(numF);
          setFrame(0);
          setLoaded(true);

          const baseMs = intervalMsRef.current;
          const effectiveMs = Math.max(100, Math.round(baseMs / speed));
          if (numF > 1 && useNativeAnimation && typeof viewer.animate === "function") {
            viewer.animate({ loop: "forward", reps: 0, interval: effectiveMs });
            setPlaying(true);
          } else if (numF > 1 && animationModeRef.current === "manual" && frameTexts.length > 1) {
            currentFrameIndexRef.current = 0;
            frameIntervalRef.current = setInterval(() => {
              if (cancelled || !viewerRef.current) return;
              const textsNow = frameTextsRef.current;
              if (textsNow.length === 0) return;
              const next = (currentFrameIndexRef.current + 1) % textsNow.length;
              currentFrameIndexRef.current = next;
              viewerRef.current.clear?.();
              viewerRef.current.addModel(textsNow[next], "pdb");
              viewerRef.current.setStyle({}, { stick: {}, cartoon: { color: "spectrum" } });
              viewerRef.current.render();
              setFrame(next);
            }, effectiveMs);
            setPlaying(true);
          }
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
        });
    };

    if (typeof window !== "undefined" && get3Dmol()) {
      run(get3Dmol()!);
      return () => {
        cancelled = true;
        if (viewerRef.current?.pauseAnimate) viewerRef.current.pauseAnimate();
        if (viewerRef.current?.destroy) viewerRef.current.destroy();
        viewerRef.current = null;
      };
    }

    const script = document.createElement("script");
    script.src = CDN_3DMOL_PRIMARY;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (cancelled) return;
      const lib = get3Dmol();
      if (lib) run(lib);
      else setError("3D library failed to load");
    };
    script.onerror = () => {
      const fallback = document.createElement("script");
      fallback.src = CDN_3DMOL_FALLBACK;
      fallback.async = true;
      fallback.crossOrigin = "anonymous";
      fallback.onload = () => {
        if (cancelled) return;
        const lib = get3Dmol();
        if (lib) run(lib);
        else setError("3D library failed to load");
      };
      fallback.onerror = () => setError("Could not load 3D viewer");
      document.body.appendChild(fallback);
    };
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      document.querySelectorAll(`script[src="${CDN_3DMOL_PRIMARY}"], script[src="${CDN_3DMOL_FALLBACK}"]`).forEach((s) => s.remove());
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (viewerRef.current?.pauseAnimate) viewerRef.current.pauseAnimate();
      if (viewerRef.current?.destroy) viewerRef.current.destroy();
      viewerRef.current = null;
    };
  }, [usePrecomputed ? (framePdbTexts ?? []).length : (usePdbUrl ? pdbUrl : (framePdbIds ?? []).join(",")), intervalMs, autoPlay]);

  // Sync frame index from viewer when playing (optional: poll getFrame)
  useEffect(() => {
    if (!playing || totalFrames <= 1) return;
    const t = setInterval(() => {
      const v = viewerRef.current;
      if (v && typeof v.getFrame === "function") setFrame(v.getFrame());
    }, 200);
    return () => clearInterval(t);
  }, [playing, totalFrames]);

  const handlePlayPause = () => {
    const v = viewerRef.current;
    if (!v || totalFrames <= 1) return;
    if (playing) {
      if (animationModeRef.current === "native") v.pauseAnimate?.();
      else if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      setPlaying(false);
    } else {
      const eff = Math.max(100, Math.round(intervalMsRef.current / speed));
      if (animationModeRef.current === "native") {
        v.animate?.({ loop: "forward", reps: 0, interval: eff });
      } else if (animationModeRef.current === "manual") {
        const textsNow = frameTextsRef.current;
        if (textsNow.length <= 1) return;
        currentFrameIndexRef.current = frame;
        frameIntervalRef.current = setInterval(() => {
          if (!viewerRef.current) return;
          const next = (currentFrameIndexRef.current + 1) % textsNow.length;
          currentFrameIndexRef.current = next;
          viewerRef.current.clear?.();
          viewerRef.current.addModel(textsNow[next], "pdb");
          viewerRef.current.setStyle({}, { stick: {}, cartoon: { color: "spectrum" } });
          viewerRef.current.render();
          setFrame(next);
        }, eff);
      }
      setPlaying(true);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!playing || totalFrames <= 1 || !viewerRef.current) return;
    if (animationModeRef.current === "native") {
      viewerRef.current.pauseAnimate?.();
      viewerRef.current.animate?.({ loop: "forward", reps: 0, interval: Math.max(100, Math.round(intervalMsRef.current / speed)) });
    } else if (animationModeRef.current === "manual" && frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      const textsNow = frameTextsRef.current;
      if (textsNow.length <= 1) return;
      const eff = Math.max(100, Math.round(intervalMsRef.current / speed));
      frameIntervalRef.current = setInterval(() => {
        if (!viewerRef.current) return;
        const next = (currentFrameIndexRef.current + 1) % textsNow.length;
        currentFrameIndexRef.current = next;
        viewerRef.current.clear?.();
        viewerRef.current.addModel(textsNow[next], "pdb");
        viewerRef.current.setStyle({}, { stick: {}, cartoon: { color: "spectrum" } });
        viewerRef.current.render();
        setFrame(next);
      }, eff);
    }
  }, [speed]);

  const handleFullscreen = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleScreenshot = () => {
    const v = viewerRef.current;
    if (!v?.pngURI) return;
    try {
      const dataUrl = v.pngURI();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `trajectory-frame-${frame + 1}.png`;
      a.click();
    } catch {
      // ignore
    }
  };

  const handleFrameSelect = (i: number) => {
    const v = viewerRef.current;
    if (!v) return;
    if (typeof v.setFrame === "function") {
      v.setFrame(i);
      v.render?.();
      setFrame(i);
    } else if (animationModeRef.current === "manual") {
      const textsNow = frameTextsRef.current;
      if (i >= 0 && i < textsNow.length) {
        currentFrameIndexRef.current = i;
        v.clear?.();
        v.addModel(textsNow[i], "pdb");
        v.setStyle({}, { stick: {}, cartoon: { color: "spectrum" } });
        v.render();
        setFrame(i);
      }
    }
  };

  return (
    <div
      data-viewer="trajectory"
      className={`overflow-hidden rounded-none border border-slate-600 bg-slate-800 isolate ${className}`}
      style={{ contain: "layout" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-600 bg-slate-800 px-4 py-2">
        <span className="text-sm font-medium text-slate-100">{title}</span>
        <div className="flex flex-wrap items-center gap-2">
          {totalFrames > 1 && (
            <>
              <button
                type="button"
                onClick={handlePlayPause}
                className="min-h-[44px] rounded-none border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
              >
                {playing ? "Pause" : "Play"}
              </button>
              <span className="text-xs text-slate-400">
                Frame {frame + 1} / {totalFrames}
              </span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="min-h-[44px] rounded-none border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                title="Playback speed"
              >
                <option value={0.5}>0.5×</option>
                <option value={1}>1×</option>
                <option value={1.5}>1.5×</option>
                <option value={2}>2×</option>
              </select>
            </>
          )}
          {loaded && (
            <>
              <button
                type="button"
                onClick={handleFullscreen}
                className="min-h-[44px] rounded-none border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                title="Fullscreen"
              >
                {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              </button>
              <button
                type="button"
                onClick={handleScreenshot}
                className="min-h-[44px] rounded-none border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                title="Download screenshot"
              >
                Screenshot
              </button>
            </>
          )}
        </div>
      </div>
      <div ref={wrapperRef} className="relative w-full bg-slate-900" style={{ minHeight: `${minHeight}px` }}>
        {!loaded && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-900/95 text-slate-300 z-10"
            style={{ minHeight: `${minHeight}px` }}
          >
            <span className="animate-pulse">Loading trajectory…</span>
          </div>
        )}
        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-900/95 text-amber-300 text-sm px-4 z-10"
            style={{ minHeight: `${minHeight}px` }}
          >
            {error}
          </div>
        )}
        <div className="relative w-full" style={{ height: `${minHeight}px`, minHeight: `${minHeight}px` }}>
          <div
            ref={containerRef}
            className="absolute inset-0 w-full bg-slate-900"
            style={{ height: `${minHeight}px`, minHeight: `${minHeight}px` }}
          />
          <div
            className="viewer-grid-scan absolute inset-0 z-[1]"
            style={{ height: `${minHeight}px`, minHeight: `${minHeight}px` }}
            aria-hidden
          />
        </div>
      </div>
      {loaded && totalFrames > 1 && totalFrames <= 20 && (
        <div className="flex flex-wrap gap-1 border-t border-slate-600 bg-slate-800 px-4 py-2">
          {Array.from({ length: totalFrames }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleFrameSelect(i)}
              className={`h-7 min-w-[2rem] rounded-none px-2 text-xs font-medium transition ${
                frame === i
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-600 text-slate-200 hover:bg-slate-500"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
