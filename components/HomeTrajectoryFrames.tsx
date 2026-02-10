"use client";

/**
 * Three-frame trajectory placeholder with light crossfade.
 * Replace inner content with <img> to real trajectory screenshots in public/ when available.
 */
export function HomeTrajectoryFrames() {
  return (
    <div className="home-trajectory-frames relative aspect-[4/3] w-full overflow-hidden rounded-none bg-slate-100 sm:aspect-video md:aspect-[4/3]">
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: "var(--t1, 1)" }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100/80 to-slate-200/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-40 sm:text-7xl" aria-hidden>🧬</span>
        </div>
      </div>
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: "var(--t2, 0)" }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/80 to-teal-200/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-40 sm:text-7xl" aria-hidden>⚛️</span>
        </div>
      </div>
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: "var(--t3, 0)" }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-200/60 to-slate-300/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-40 sm:text-7xl" aria-hidden>🔬</span>
        </div>
      </div>
    </div>
  );
}
