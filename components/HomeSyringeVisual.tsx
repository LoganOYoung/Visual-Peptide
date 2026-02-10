"use client";

/**
 * Animated syringe visual: barrel + fill (scaleY animation).
 * Respects prefers-reduced-motion (static fill when reduced).
 */
export function HomeSyringeVisual() {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-none bg-slate-100 sm:aspect-video md:aspect-[4/3]">
      <svg
        viewBox="0 0 120 200"
        className="h-full max-h-[280px] w-auto"
        aria-hidden
      >
        <defs>
          <linearGradient id="home-syringe-liquid" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        {/* Barrel outline */}
        <rect x="30" y="40" width="60" height="140" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        {/* Plunger */}
        <rect x="32" y="20" width="56" height="24" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
        <rect x="38" y="44" width="44" height="8" fill="#94a3b8" />
        {/* Liquid fill: full rect scaled from bottom via .home-syringe-liquid */}
        <rect
          x="34"
          y="60"
          width="52"
          height="100"
          fill="url(#home-syringe-liquid)"
          className="home-syringe-liquid"
        />
        {/* Needle */}
        <rect x="54" y="176" width="12" height="24" fill="#64748b" />
        <path d="M57 200 L63 200 L63 196 L60 192 L57 196 Z" fill="#475569" />
      </svg>
    </div>
  );
}
