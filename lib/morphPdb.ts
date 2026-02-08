/**
 * Linear interpolation between two PDB structures (same atoms, same order).
 * Produces N intermediate frames for smooth morph animation.
 */

const ATOM_LINE = /^ATOM\s+/;
const HETATM_LINE = /^HETATM\s+/;

function parseAtomLines(pdb: string): string[] {
  const lines: string[] = [];
  const raw = pdb.replace(/\r\n/g, "\n");
  for (const line of raw.split("\n")) {
    if (ATOM_LINE.test(line) || HETATM_LINE.test(line)) lines.push(line);
  }
  return lines;
}

/** PDB ATOM line has fixed columns: x 31-38, y 39-46, z 47-54 (1-based, 8.3 format). */
function getCoord(line: string): { x: number; y: number; z: number } {
  const x = parseFloat(line.substring(30, 38)) || 0;
  const y = parseFloat(line.substring(38, 46)) || 0;
  const z = parseFloat(line.substring(46, 54)) || 0;
  return { x, y, z };
}

function setCoord(line: string, x: number, y: number, z: number): string {
  const fmt = (v: number) => v.toFixed(3).padStart(8);
  return (
    line.substring(0, 30) +
    fmt(x) +
    fmt(y) +
    fmt(z) +
    line.substring(54)
  );
}

/**
 * Generate N intermediate PDB frames between structure A and B.
 * A and B must have the same number of ATOM/HETATM lines in the same order.
 * Returns array of PDB strings (each frame is full PDB with header lines from A).
 */
export function morphPdb(
  pdbA: string,
  pdbB: string,
  numFrames: number = 15
): string[] {
  const linesA = parseAtomLines(pdbA);
  const linesB = parseAtomLines(pdbB);
  if (linesA.length === 0 || linesA.length !== linesB.length) {
    return [pdbA, pdbB];
  }

  const nonAtomPrefix = pdbA.split(/\n/).filter((l) => !ATOM_LINE.test(l) && !HETATM_LINE.test(l)).join("\n");
  const result: string[] = [];

  for (let f = 0; f <= numFrames; f++) {
    const t = f / numFrames;
    const frameLines: string[] = [];
    for (let i = 0; i < linesA.length; i++) {
      const cA = getCoord(linesA[i]);
      const cB = getCoord(linesB[i]);
      const x = cA.x + t * (cB.x - cA.x);
      const y = cA.y + t * (cB.y - cA.y);
      const z = cA.z + t * (cB.z - cA.z);
      frameLines.push(setCoord(linesA[i], x, y, z));
    }
    result.push(nonAtomPrefix ? nonAtomPrefix + "\n" + frameLines.join("\n") + "\nEND\n" : frameLines.join("\n") + "\nEND\n");
  }
  return result;
}
