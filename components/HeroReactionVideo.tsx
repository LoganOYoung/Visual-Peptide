"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/** Optional hero video. Put pre-rendered video at public/videos/reaction-hero.mp4 to show it here. */
const VIDEO_SRC = "/videos/reaction-hero.mp4";

export function HeroReactionVideo() {
  const [showFallback, setShowFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const v = videoRef.current;
      if (v && v.readyState < 2) setShowFallback(true);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="mx-auto max-w-6xl px-4 py-14"
      aria-labelledby="reaction-video-heading"
    >
      <h2 id="reaction-video-heading" className="text-2xl font-semibold text-slate-900">
        3D reaction demo
      </h2>
      <p className="mt-1 text-slate-600">
        Multi-frame trajectory: peptide–receptor binding, conformation change. Preset data, no real-time simulation.
      </p>
      <div className="mt-6 overflow-hidden rounded-none border-2 border-slate-200 bg-slate-100">
        {!showFallback ? (
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            className="min-h-[240px] w-full object-contain"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setShowFallback(true)}
          />
        ) : null}
        {showFallback && (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 bg-slate-100 p-8 text-center text-slate-600">
            <p className="text-sm">
              Interactive 3D peptide–receptor demo is on the next page. Click the button below to open it.
            </p>
            <Link
              href="/structure/demo"
              className="text-sm font-medium text-teal-600 hover:underline"
            >
              Open 3D reaction demo →
            </Link>
          </div>
        )}
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <Link
            href="/structure/demo"
            className="inline-block rounded-none bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
          >
            Open 3D reaction demo →
          </Link>
        </div>
      </div>
    </section>
  );
}
