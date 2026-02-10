/**
 * 3D reaction / trajectory demos.
 * Each demo uses either framePdbIds (fetch from RCSB) or pdbUrl (single multi-MODEL PDB from public/ or URL).
 */

export interface TrajectoryDemoSpec {
  id: string;
  title: string;
  description: string;
  /** PDB IDs in order (each frame from RCSB). Use this OR pdbUrl. */
  framePdbIds?: string[];
  /** Single multi-MODEL PDB: path under public/ (e.g. /trajectories/demo.pdb) or full URL. Use this OR framePdbIds. */
  pdbUrl?: string;
}

export const trajectoryDemos: TrajectoryDemoSpec[] = [
  {
    id: "glp1-receptor",
    title: "Semaglutide & GLP-1 receptor",
    description:
      "Key structures in GLP-1 signalling: peptide (PDB 6XBM) and GLP-1 receptor (PDB 7F9W). Conceptual two-frame view; replace with real binding trajectory for full reaction demonstration.",
    framePdbIds: ["6XBM", "7F9W"],
  },
  {
    id: "small-peptides",
    title: "Small peptide structures",
    description: "Two small peptide structures (2LL5, 1D4P) as a short trajectory. Illustrates multi-frame playback.",
    framePdbIds: ["2LL5", "1D4P"],
  },
  {
    id: "multi-model-file",
    title: "Multi-MODEL PDB file (from public/)",
    description:
      "Single file with multiple MODEL … ENDMDL blocks (e.g. from MD or NMR). To use your own: put the file in public/trajectories/ and use the loader above with By file URL.",
    pdbUrl: "/trajectories/demo.pdb",
  },
];
