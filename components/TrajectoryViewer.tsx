"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  setBackgroundColor?: (hex: number) => void;
  getView?: () => number[];
  setView?: (view: number[]) => void;
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
  /** Initial frame index (e.g. from URL state). Applied after load. */
  initialFrame?: number;
  /** Initial camera view (e.g. from URL state). Array from getView(). Applied after load. */
  initialView?: number[];
  /** Called when frame, playing, or speed changes (for URL state sync). */
  onStateChange?: (frame: number, playing: boolean, speed: number) => void;
  /** Called when camera view changes (for URL state sync). Debounced. */
  onViewChange?: (view: number[]) => void;
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
  initialFrame,
  initialView,
  onStateChange,
  onViewChange,
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
          const startFrame = Math.max(0, Math.min(numF - 1, typeof initialFrame === "number" && Number.isFinite(initialFrame) ? initialFrame : 0));
          setFrame(startFrame);
          if (startFrame > 0) {
            if (typeof viewer.setFrame === "function") {
              viewer.setFrame(startFrame);
              viewer.render?.();
            } else if (animationModeRef.current === "manual") {
              currentFrameIndexRef.current = startFrame;
              viewer.clear?.();
              viewer.addModel(frameTexts[startFrame], "pdb");
              viewer.setStyle({}, { stick: {}, cartoon: { color: "spectrum" } });
              viewer.render();
            }
          }
          if (initialView && Array.isArray(initialView) && initialView.length >= 8 && typeof viewer.setView === "function") {
            try {
              viewer.setView(initialView);
              viewer.render?.();
            } catch {
              // ignore invalid view
            }
          }
          setLoaded(true);

          const baseMs = intervalMsRef.current;
          const effectiveMs = Math.max(100, Math.round(baseMs / speed));
          if (numF > 1 && useNativeAnimation && typeof viewer.animate === "function") {
            viewer.animate({ loop: "forward", reps: 0, interval: effectiveMs });
            setPlaying(true);
          } else if (numF > 1 && animationModeRef.current === "manual" && frameTexts.length > 1) {
            currentFrameIndexRef.current = startFrame;
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

  // Notify parent for URL state sync
  useEffect(() => {
    if (onStateChange && loaded) onStateChange(frame, playing, speed);
  }, [frame, playing, speed, loaded, onStateChange]);

  // Poll view and notify parent (debounced) for URL state sync
  useEffect(() => {
    if (!onViewChange || !loaded) return;
    const v = viewerRef.current;
    if (!v?.getView) return;
    let lastViewStr = "";
    const t = setInterval(() => {
      const view = v.getView?.();
      if (!view || view.length < 8) return;
      const str = JSON.stringify(view);
      if (str !== lastViewStr) {
        lastViewStr = str;
        onViewChange(view);
      }
    }, 1500);
    return () => clearInterval(t);
  }, [loaded, onViewChange]);

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

  const handleExportPngTransparent = () => {
    const v = viewerRef.current;
    if (!v?.pngURI) return;
    try {
      if (typeof v.setBackgroundColor === "function") {
        v.setBackgroundColor(0x00000000);
        v.render?.();
      }
      const dataUrl = v.pngURI();
      if (typeof v.setBackgroundColor === "function") {
        v.setBackgroundColor(0x1e293b);
        v.render?.();
      }
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `trajectory-frame-${frame + 1}-transparent.png`;
      a.click();
    } catch {
      if (typeof viewerRef.current?.setBackgroundColor === "function") {
        viewerRef.current.setBackgroundColor(0x1e293b);
        viewerRef.current.render?.();
      }
    }
  };

  const handleDownloadCurrentFramePdb = () => {
    const texts = frameTextsRef.current;
    if (frame < 0 || frame >= texts.length) return;
    const pdb = texts[frame];
    const blob = new Blob([pdb], { type: "chemical/x-pdb" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `frame-${frame + 1}.pdb`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleFrameSelect = useCallback((i: number) => {
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
  }, []);

  const handleTimelineInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const i = Number(e.target.value);
    if (!Number.isFinite(i)) return;
    setPlaying(false);
    if (viewerRef.current?.pauseAnimate) viewerRef.current.pauseAnimate();
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    handleFrameSelect(Math.max(0, Math.min(totalFrames - 1, i)));
  };

  const [exportingGif, setExportingGif] = useState(false);
  const handleExportGif = useCallback(async () => {
    const v = viewerRef.current;
    if (!v?.pngURI || totalFrames <= 0) return;
    const numFrames = Math.min(totalFrames, 20);
    const frameToRestore = frame;
    setExportingGif(true);
    try {
      const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
      const gif = GIFEncoder();
      let width = 0;
      let height = 0;
      const delayCentisec = 8; // ~12 fps

      for (let i = 0; i < numFrames; i++) {
        handleFrameSelect(i);
        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => setTimeout(r, 50));
        const dataUrl = v.pngURI?.();
        if (!dataUrl) continue;
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const im = new Image();
          im.onload = () => res(im);
          im.onerror = rej;
          im.src = dataUrl;
        });
        const c = document.createElement("canvas");
        c.width = width = img.naturalWidth;
        c.height = height = img.naturalHeight;
        const ctx = c.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);
        const palette = quantize(imageData.data, 256);
        const index = applyPalette(imageData.data, palette);
        gif.writeFrame(index, width, height, { palette, delay: delayCentisec });
      }

      gif.finish();
      const bytes = gif.bytes();
      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const blob = new Blob([buffer], { type: "image/gif" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "trajectory.gif";
      a.click();
      URL.revokeObjectURL(a.href);
      handleFrameSelect(frameToRestore);
    } finally {
      setExportingGif(false);
    }
  }, [totalFrames, frame, handleFrameSelect]);

  // Apply initialFrame when prop changes (e.g. URL back/forward)
  useEffect(() => {
    if (!loaded || totalFrames <= 0 || typeof initialFrame !== "number" || !Number.isFinite(initialFrame)) return;
    const i = Math.max(0, Math.min(totalFrames - 1, initialFrame));
    if (i === frame) return;
    handleFrameSelect(i);
  }, [initialFrame, loaded, totalFrames, frame, handleFrameSelect]);

  // Apply initialView when prop changes (e.g. URL back/forward). Skip if already close to avoid sync loop.
  useEffect(() => {
    if (!loaded || !initialView || !Array.isArray(initialView) || initialView.length < 8) return;
    const v = viewerRef.current;
    if (typeof v?.setView !== "function" || typeof v?.getView !== "function") return;
    try {
      const current = v.getView();
      if (current && current.length >= 8) {
        const maxDiff = Math.max(...initialView.map((x, i) => Math.abs((current[i] ?? 0) - x)));
        if (maxDiff < 0.02) return; // already in sync
      }
      v.setView(initialView);
      v.render?.();
    } catch {
      // ignore
    }
  }, [initialView, loaded]);

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
              <button
                type="button"
                onClick={handleExportPngTransparent}
                className="min-h-[44px] rounded-none border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                title="Download PNG with transparent background"
              >
                PNG (transparent)
              </button>
              {totalFrames > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadCurrentFramePdb}
                  className="min-h-[44px] rounded-none border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                  title="Download current frame as PDB"
                >
                  Current frame PDB
                </button>
              )}
              {totalFrames > 1 && (
                <button
                  type="button"
                  onClick={handleExportGif}
                  disabled={exportingGif}
                  className="min-h-[44px] rounded-none border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600 disabled:opacity-50"
                  title="Export first 20 frames as GIF"
                >
                  {exportingGif ? "Exporting…" : "Export GIF"}
                </button>
              )}
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
          <div
            className="viewer-flow-lines absolute inset-0 z-[1]"
            style={{ height: `${minHeight}px`, minHeight: `${minHeight}px` }}
            aria-hidden
          />
        </div>
      </div>
      {loaded && totalFrames > 1 && (
        <div className="flex flex-nowrap items-center gap-3 border-t border-slate-600 bg-slate-800 px-4 py-2">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalFrames - 1)}
            value={frame}
            onChange={handleTimelineInput}
            className="h-2 flex-1 min-w-0 accent-teal-500"
            aria-label="Seek to frame"
          />
          <span className="text-xs text-slate-400 shrink-0 tabular-nums">
            {frame + 1} / {totalFrames}
          </span>
        </div>
      )}
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
