/**
 * PDB text parsing utilities: chains, sequences, residue ranges.
 */

const THREE_LETTER_TO_ONE: Record<string, string> = {
  ALA: "A", ARG: "R", ASN: "N", ASP: "D", CYS: "C", GLN: "Q", GLU: "E", GLY: "G",
  HIS: "H", ILE: "I", LEU: "L", LYS: "K", MET: "M", PHE: "F", PRO: "P", SER: "S",
  THR: "T", TRP: "W", TYR: "Y", VAL: "V", UNK: "X",
};

/** Parse unique chain IDs from PDB ATOM/HETATM lines. */
export function getChainsFromPdb(pdbText: string): string[] {
  const chains = new Set<string>();
  const lineRe = /^(?:ATOM|HETATM).{21}(.)/gm;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(pdbText)) !== null) {
    const ch = m[1].trim();
    if (ch) chains.add(ch);
  }
  return Array.from(chains).sort();
}

/** Residue from PDB line: resn (3-letter), resi, chain. ATOM columns: 18-20 resn, 23-26 resi (with possible insertion), 22 chain. */
function parseResidueFromLine(line: string): { resn: string; resi: number; chain: string } | null {
  if (!line.startsWith("ATOM") && !line.startsWith("HETATM")) return null;
  const resn = line.substring(17, 20).trim();
  const chain = (line.substring(21, 22) || " ").trim();
  const resiStr = line.substring(22, 26).trim();
  const resi = parseInt(resiStr, 10);
  if (isNaN(resi)) return null;
  return { resn, resi, chain: chain || "A" };
}

/** Per-chain sequence as single-letter codes (one residue per position, CA or first atom). */
export function getSequenceFromPdb(pdbText: string): { chainId: string; sequence: string; residues: { resn: string; resi: number }[] }[] {
  const byChain = new Map<string, { resn: string; resi: number }[]>();
  const lines = pdbText.split("\n");
  for (const line of lines) {
    const res = parseResidueFromLine(line);
    if (!res) continue;
    const key = res.chain;
    if (!byChain.has(key)) byChain.set(key, []);
    const arr = byChain.get(key)!;
    const last = arr[arr.length - 1];
    if (!last || last.resi !== res.resi) {
      arr.push({ resn: res.resn, resi: res.resi });
    }
  }
  return Array.from(byChain.entries())
    .map(([chainId, residues]) => ({
      chainId,
      sequence: residues.map((r) => THREE_LETTER_TO_ONE[r.resn] || "X").join(""),
      residues,
    }))
    .sort((a, b) => a.chainId.localeCompare(b.chainId));
}

/** Parse "15-20" or "15,16,17" or "15:20" into [15,16,...,20]. */
export function parseResidueRange(s: string): number[] {
  const t = s.trim();
  if (!t) return [];
  if (t.includes("-")) {
    const [a, b] = t.split("-").map((x) => parseInt(x.trim(), 10));
    if (isNaN(a) || isNaN(b)) return [];
    const out: number[] = [];
    for (let i = a; i <= b; i++) out.push(i);
    return out;
  }
  if (t.includes(":") && !t.includes(",")) {
    const [a, b] = t.split(":").map((x) => parseInt(x.trim(), 10));
    if (isNaN(a) || isNaN(b)) return [];
    const out: number[] = [];
    for (let i = a; i <= b; i++) out.push(i);
    return out;
  }
  return t.split(",").map((x) => parseInt(x.trim(), 10)).filter((n) => !isNaN(n));
}

/** Parse "15:A,20:A" into [{ resi: 15, chain: 'A' }, ...]. */
export function parseLabelSpec(s: string): { resi: number; chain: string }[] {
  return s
    .split(",")
    .map((part) => {
      const [resiStr, chain] = part.split(":").map((x) => x.trim());
      const resi = parseInt(resiStr || "", 10);
      if (isNaN(resi)) return null;
      return { resi, chain: chain || "A" };
    })
    .filter((x): x is { resi: number; chain: string } => x != null);
}
