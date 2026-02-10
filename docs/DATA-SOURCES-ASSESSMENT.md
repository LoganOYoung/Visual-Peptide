# Data Sources: Professionality, Completeness, Reliability

Assessment of all data sources used in the site (pure frontend; no backend). Last updated for review.

---

## 1. Summary table

| Source | Type | Use in app | Professionality | Completeness | Reliability |
|--------|------|------------|----------------|--------------|-------------|
| **RCSB PDB** | External API + static files | 3D coordinates, metadata (title, resolution, method), cite link | High (wwPDB member, peer‑reviewed depositions) | High (archive coverage) | High (authoritative) |
| **CAS Registry** | Curated identifiers in `lib/peptides.ts` | Peptide CAS numbers (display, search) | High (official registry) | Per‑peptide (we only store what we curate) | High if verified; no in‑app citation |
| **Janoshik** | External links only | Verify page, report verification, public database link | Medium (third‑party lab; established in peptide testing) | N/A (we link out) | User must verify on lab site |
| **In‑house: peptides** | Static data `lib/peptides.ts` | Names, doses, recon, CAS, PDB ID, MW, etc. | Curated; no cited primary source | Limited to ~7 peptides | Depends on curation; “research only” disclaimer present |
| **In‑house: structureRationale** | Static `lib/structureRationale.ts` | “Why this structure” per PDB | Curated; interpretive | Only 6XBM, 7F9W | **Must match actual PDB entry** (see §3) |
| **In‑house: structureHotspots** | Static `lib/structureHotspots.ts` | Residue/position descriptions in 3D viewer | Curated; interpretive | Only 6XBM, 7F9W | **Must match actual PDB chain/residue numbering** |
| **In‑house: structureAlternatives** | Static `lib/structureAlternatives.ts` | “Also useful” PDB suggestions | Curated | Only 6XBM, 7F9W | **Must point to correct PDBs** (see §3) |
| **3Dmol.js** | CDN script | 3D viewer rendering | High (widely used, open source) | N/A | High |

---

## 2. By category

### 2.1 External authoritative

- **RCSB PDB**  
  - **Professionality**: wwPDB member; depositions validated; standard in structural biology.  
  - **Completeness**: We use `files.rcsb.org/view/{id}.pdb` and `data.rcsb.org/rest/v1/core/entry/{id}`; coverage is the full PDB.  
  - **Reliability**: Authoritative. We correctly attribute (“Data from RCSB PDB”) and link to RCSB.

- **CAS Registry numbers**  
  - **Professionality**: Official chemical registry.  
  - **Completeness**: We only store CAS for peptides we list; no bulk sync.  
  - **Reliability**: High if each CAS was checked (e.g. 910463-68-2 = Semaglutide); we do not cite CAS in UI.

### 2.2 External third‑party

- **Janoshik**  
  - **Professionality**: Known third‑party lab for peptide testing (HPLC, MS, potency).  
  - **Completeness**: We only link to janoshik.com and public.janoshik.com; no data ingested.  
  - **Reliability**: We direct users to verify reports on the lab’s site (task ID); disclaimer present.

### 2.3 In‑house curated

- **Peptides** (`lib/peptides.ts`): Descriptions, typical dose, recon, CAS, PDB ID, MW, half‑life, etc.  
  - **Professionality**: Research‑oriented wording; “research only” and “not medical advice” in About/calculator.  
  - **Completeness**: Small set (~7 peptides); no claim of exhaustiveness.  
  - **Reliability**: Depends on curation quality; **PDB IDs must match the actual structure** (see §3).

- **Structure rationale / hotspots / alternatives**  
  - **Professionality**: Short, educational; peptide/modification‑focused.  
  - **Completeness**: Only entries we describe (currently 6XBM, 7F9W).  
  - **Reliability**: **Critical**: Text must describe the **actual** PDB entry (title, chains, biology). See §3.

---

## 3. Critical finding: PDB ID vs content

Public records indicate:

- **6XBM** (wwPDB): “Structure of human **SMO-Gi** complex with 24(S),25-EC” — i.e. **Smoothened (SMO)**, not Semaglutide/GLP-1.
- **7F9W** (RCSB page): “Two novel human **anti-CD25 antibodies**…” — i.e. **not** GLP-1 receptor complex.
- **7KI0**: Literature and RCSB refer to **7KI0** as a **Semaglutide–GLP-1R–Gs** cryo‑EM structure.

Therefore:

- **Risk**: In the app, **Semaglutide** is linked to **6XBM**, and rationale/hotspots/alternatives for **6XBM** and **7F9W** are written as if they were GLP-1/Semaglutide structures. If 6XBM is SMO-Gi and 7F9W is anti-CD25, then:
  - `peptides.ts`: Semaglutide `pdbId: "6XBM"` is **wrong**; should point to a Semaglutide/GLP-1R structure (e.g. **7KI0**).
  - `structureRationale`, `structureHotspots`, `structureAlternatives` for 6XBM and 7F9W describe **different** biology than the actual entries, so they are **misleading**.

**Recommendation**:  
1. Confirm on RCSB/wwPDB the true title and contents of **6XBM** and **7F9W**.  
2. If 6XBM is SMO-Gi: remove or replace Semaglutide’s `pdbId` (e.g. use **7KI0** for Semaglutide) and remove or rewrite rationale/hotspots/alternatives for 6XBM so they match the real entry.  
3. If 7F9W is anti-CD25: remove or rewrite rationale/hotspots/alternatives for 7F9W; do not present it as GLP-1 receptor complex.  
4. After changes, re-check that every PDB ID used for “Semaglutide” or “GLP-1” actually corresponds to that structure on RCSB.

---

## 4. Recommendations

1. **Fix PDB–content alignment**  
   - Verify 6XBM, 7F9W (and any new IDs) on RCSB/wwPDB.  
   - Align Semaglutide with the correct structure (e.g. 7KI0); update or remove 6XBM/7F9W from rationale, hotspots, alternatives so text matches the real PDB.

2. **Data sources statement**  
   - Add a short “Data sources” subsection (e.g. in About): RCSB PDB for structures; CAS for compound IDs; Janoshik linked for verification only; peptide/dose/recon and structure descriptions are curated for education, not primary literature.

3. **Keep disclaimers**  
   - Retain “research and education only,” “not medical advice,” and “verify purity/identity via third‑party testing” where they already exist.

4. **Optional**  
   - Add one‑line citation or “Source: RCSB PDB” near 3D viewer; consider “Structure descriptions and hotspots are interpretive; see RCSB entry for official annotation.”

---

## 5. Conclusion

- **Professionality**: RCSB and CAS are professional, authoritative sources; Janoshik is a clear third‑party lab; in‑house data is framed as research/education with disclaimers.  
- **Completeness**: Scope is intentionally limited (few peptides, few PDBs); no claim of full coverage.  
- **Reliability**: Strong for RCSB/CAS/Janoshik links; **reliability of in‑house structure content depends on PDB ID being correct and rationale/hotspots/alternatives matching the actual PDB entry**.  
- **Action**: Verify and correct PDB IDs and all structure-related copy (rationale, hotspots, alternatives) against RCSB/wwPDB so that data sources remain professional, complete in intent, and reliable.
