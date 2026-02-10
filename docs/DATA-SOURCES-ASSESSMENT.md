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
| **In‑house: structureRationale** | Static `lib/structureRationale.ts` | “Why this structure” per PDB | Curated; interpretive | 7KI0, 6XBM, 7F9W | **Must match actual PDB entry** (see §3) |
| **In‑house: structureHotspots** | Static `lib/structureHotspots.ts` | Residue/position descriptions in 3D viewer | Curated; interpretive | Only 7KI0 (chain B) | **Must match actual PDB chain/residue numbering** |
| **In‑house: structureAlternatives** | Static `lib/structureAlternatives.ts` | “Also useful” PDB suggestions | Curated | 7KI0→6X18 | **Must point to correct PDBs** (see §3) |
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
  - **Completeness**: Only entries we describe (7KI0, 6XBM, 7F9W for rationale; 7KI0 for hotspots; 7KI0→6X18 for alternatives).  
  - **Reliability**: **Critical**: Text must describe the **actual** PDB entry (title, chains, biology). See §3.

---

## 3. Critical finding: PDB ID vs content

Public records indicate:

- **6XBM** (wwPDB): “Structure of human **SMO-Gi** complex with 24(S),25-EC” — i.e. **Smoothened (SMO)**, not Semaglutide/GLP-1.
- **7F9W** (RCSB page): “Two novel human **anti-CD25 antibodies**…” — i.e. **not** GLP-1 receptor complex.
- **7KI0**: Literature and RCSB refer to **7KI0** as a **Semaglutide–GLP-1R–Gs** cryo‑EM structure.

**Fix applied (current state):**

- **Semaglutide** in `peptides.ts` now uses **7KI0** (Semaglutide–GLP-1R–Gs).
- **structureRationale**: 7KI0 (Semaglutide/GLP-1R); 6XBM and 7F9W kept with **correct** descriptions (SMO-Gi, Anti-CD25).
- **structureHotspots**: Only **7KI0**, chain **B** (Semaglutide in 7KI0); residue keys B:8, B:12, B:16, B:26, B:31.
- **structureAlternatives**: Only **7KI0→6X18** (native GLP-1–receptor); 6XBM/7F9W removed from alternatives.

**Recommendation**: When adding new PDBs or peptides, confirm title and biology on RCSB/wwPDB before writing rationale/hotspots/alternatives.

---

## 4. Professional data acquisition checklist

| Data / action | Source / URL | Status |
|---------------|--------------|--------|
| **PDB coordinates (3D viewer)** | `https://files.rcsb.org/view/{id}.pdb` | OK — RCSB “view” URL per [File Download Services](https://www.rcsb.org/docs/programmatic-access/file-download-services); Legacy PDB View example: `files.rcsb.org/view/4hhb.pdb`. |
| **PDB metadata (title, resolution, method)** | `https://data.rcsb.org/rest/v1/core/entry/{id}` | OK — Official RCSB REST API; we use `struct.title`, `rcsb_entry_info.resolution_combined`, `exptl[0].method`. |
| **PDB download link (user)** | `https://files.rcsb.org/download/{id}.pdb` | OK — RCSB “download” URL per same doc. |
| **RCSB 3D view link** | `https://www.rcsb.org/3d-view/{id}` | OK — Official structure viewer. |
| **Cite link** | `https://www.rcsb.org/structure/{id}` | OK — Official structure summary. |
| **Janoshik verification** | `https://janoshik.com/tests/rawdata/{taskId}` (ReportVerifier) | Confirm — Lab’s main verify page is `janoshik.com/verification/` (task number + unique key). If `/tests/rawdata/{taskId}` does not open a report, consider linking to `janoshik.com/verification/` with copy “Enter your task ID and key on the lab’s page.” |
| **Janoshik homepage / public DB** | `https://janoshik.com`, `https://public.janoshik.com` | OK — Linked from Verify page. |
| **Peptide / PDB / rationale / hotspots / alternatives** | Static `lib/` data | OK — Semaglutide→7KI0; rationale/hotspots/alternatives aligned with RCSB entries; 6X18 is GLP-1–receptor (alternative for 7KI0). |
| **CAS numbers** | Stored in `lib/peptides.ts`; no live fetch | OK — Identifiers only; e.g. 910463-68-2 = Semaglutide (publicly verifiable). |

**Conclusion:** All professional data acquisition paths are correct except Janoshik direct-report URL, which should be confirmed with a real task ID; fallback is to link to `janoshik.com/verification/`.

---

## 5. Recommendations

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

## 6. Conclusion

- **Professionality**: RCSB and CAS are professional, authoritative sources; Janoshik is a clear third‑party lab; in‑house data is framed as research/education with disclaimers.  
- **Completeness**: Scope is intentionally limited (few peptides, few PDBs); no claim of full coverage.  
- **Reliability**: Strong for RCSB/CAS/Janoshik links; **reliability of in‑house structure content depends on PDB ID being correct and rationale/hotspots/alternatives matching the actual PDB entry**.  
- **Action**: Verify and correct PDB IDs and all structure-related copy (rationale, hotspots, alternatives) against RCSB/wwPDB so that data sources remain professional, complete in intent, and reliable.
