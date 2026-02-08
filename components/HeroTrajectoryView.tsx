"use client";

import Link from "next/link";
import { TrajectoryViewer } from "./TrajectoryViewer";

/** First preset from trajectoryDemos: Semaglutide (6XBM) & GLP-1 receptor (7F9W). */
const HERO_FRAME_IDS = ["6XBM", "7F9W"];

export function HeroTrajectoryView() {
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-10 sm:py-14"
      aria-labelledby="reaction-video-heading"
    >
      <h2 id="reaction-video-heading" className="text-xl font-semibold text-slate-900 sm:text-2xl">
        3D reaction demo
      </h2>
      <p className="mt-1 text-slate-600">
        Multi-frame trajectory: peptide–receptor binding, conformation change. Preset data, no real-time simulation.
      </p>
      <div className="mt-6 overflow-hidden rounded-none border-2 border-slate-200 bg-slate-100">
        <TrajectoryViewer
          framePdbIds={HERO_FRAME_IDS}
          title="Semaglutide & GLP-1 receptor"
          minHeight={280}
          intervalMs={1200}
          autoPlay={true}
        />
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <Link
            href="/structure/demo"
            className="inline-block rounded-none bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
          >
            Open full 3D reaction demo →
          </Link>
        </div>
      </div>
    </section>
  );
}
