import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrajectoryDemoIntegrated } from "@/components/TrajectoryDemoIntegrated";
import { TrajectoryViewer } from "@/components/TrajectoryViewer";
import { trajectoryDemos } from "@/lib/trajectoryDemos";
import { getBaseUrl, getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/structure/demo");

export const metadata: Metadata = {
  title: "3D reaction demo",
  description:
    "Multi-frame 3D reaction demos: peptide–receptor structures and trajectory playback. Preset data, no real-time computation.",
  alternates: { canonical },
  openGraph: { url: canonical },
};

export default function StructureDemoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "3D Structure", href: "/structure" },
          { label: "Reaction demo" },
        ]}
        baseUrl={getBaseUrl()}
      />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">3D reaction demo</h1>
      <p className="mt-2 text-slate-600">
        Multi-frame trajectory playback: each demo loads a sequence of PDB structures and plays them in order. Use Play/Pause and frame buttons to control playback.
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Start above: choose <strong>Preset</strong> and run, or enter your own PDB IDs / file URL / Morph pair; the viewer appears below after load.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        <Link href="/structure" className="link-inline">
          Single structure viewer
        </Link>
        {" · "}
        <Link href="/peptides" className="link-inline">
          Peptide Library
        </Link>
      </p>

      <section className="mt-8">
        <Suspense fallback={<div className="card h-48 animate-pulse rounded-none bg-slate-100" />}>
          <TrajectoryDemoIntegrated />
        </Suspense>
      </section>

      <div className="mt-8 rounded-none border border-slate-200 bg-slate-50/50 px-4 py-4">
        <h3 className="text-sm font-semibold text-slate-800">Using your own data</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li><strong>By PDB IDs</strong> — One ID per frame, in order (e.g. binding pathway or key conformations). Loaded from RCSB.</li>
          <li><strong>By file URL</strong> — A single PDB with multiple <code className="rounded bg-slate-200 px-1">MODEL … ENDMDL</code> blocks (e.g. from MD or NMR). Use a path under <code className="rounded bg-slate-200 px-1">public/</code> or a full URL.</li>
          <li><strong>Morph (A→B)</strong> — Interpolate between two structures (same atom count). Good for teaching or simple transitions.</li>
        </ul>
      </div>

      <section id="preset-demos" className="mt-12 scroll-mt-24">
      <h2 className="text-xl font-semibold text-slate-900">More preset demos</h2>
      <p className="mt-1 text-sm text-slate-600">
        Standalone examples (separate from the Star product loader above). Click <strong>Play</strong> in each card. For your own pathway or MD trajectory, use the loader above (By PDB IDs or By file URL).
      </p>
      <div className="mt-6 space-y-12">
        {trajectoryDemos.map((demo) => (
          <section key={demo.id} className="card">
            <h3 className="text-lg font-semibold text-slate-900">{demo.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{demo.description}</p>
            <div className="mt-4">
              <Suspense
                fallback={
                  <div className="h-[480px] animate-pulse rounded-none bg-slate-200" />
                }
              >
                <TrajectoryViewer
                  framePdbIds={demo.framePdbIds}
                  pdbUrl={demo.pdbUrl}
                  title={demo.title}
                  minHeight={480}
                  intervalMs={800}
                  autoPlay={false}
                />
              </Suspense>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {demo.pdbUrl
                ? `File: ${demo.pdbUrl} (multi-MODEL PDB)`
                : `Frames: ${(demo.framePdbIds ?? []).join(" → ")} (from RCSB PDB)`}
            </p>
          </section>
        ))}
      </div>
      </section>

      <div className="card mt-8 border-teal-200 bg-teal-50/30">
        <h3 className="text-lg font-semibold text-slate-900">About this feature</h3>
        <p className="mt-2 text-sm text-slate-600">
          Trajectories are <strong>pre-loaded or user-provided</strong>; no real-time simulation. Playback only.
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">How to prepare your own trajectory</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-slate-600">
          <li><strong>PDB IDs:</strong> List structures in time or pathway order; each ID = one frame (from RCSB).</li>
          <li><strong>Multi-MODEL PDB:</strong> Export from MD/NMR software as one file with <code className="rounded bg-slate-200/80 px-1">MODEL 1 … ENDMDL MODEL 2 …</code>; put in <code className="rounded bg-slate-200/80 px-1">public/trajectories/</code> or host elsewhere and use By file URL.</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          For single-structure viewing, see{" "}
          <Link href="/structure" className="link-inline">
            3D Structure
          </Link>.
          {" "}
          <Link href="/guide" className="link-inline">Guide</Link> (reconstitution) · <Link href="/peptides" className="link-inline">Peptide Library</Link>.
        </p>
      </div>
    </div>
  );
}
