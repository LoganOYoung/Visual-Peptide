import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrajectoryViewer } from "@/components/TrajectoryViewer";
import { trajectoryDemos } from "@/lib/trajectoryDemos";

export const metadata: Metadata = {
  title: "3D reaction demo",
  description:
    "Multi-frame 3D reaction demos: peptide–receptor structures and trajectory playback. Preset data, no real-time computation.",
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
      />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">3D reaction demo</h1>
      <p className="mt-2 text-slate-600">
        Multi-frame trajectory playback: each demo loads a sequence of PDB structures and plays them in order. Use Play/Pause and frame buttons to control playback.
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

      <div className="mt-8 space-y-12">
        {trajectoryDemos.map((demo) => (
          <section key={demo.id} className="card">
            <h2 className="text-xl font-semibold text-slate-900">{demo.title}</h2>
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
                  autoPlay={true}
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

      <div className="card mt-8 border-teal-200 bg-teal-50/30">
        <h3 className="text-lg font-semibold text-slate-900">About this feature</h3>
        <p className="mt-2 text-sm text-slate-600">
          Trajectories are <strong>preset data</strong>: no real-time simulation. To show a real binding or conformation change, provide a multi-frame PDB (e.g. from MD) or a list of PDB IDs in order. For more, see{" "}
          <Link href="/structure" className="link-inline">
            3D Structure
          </Link>{" "}
          and the project docs.
        </p>
      </div>
    </div>
  );
}
