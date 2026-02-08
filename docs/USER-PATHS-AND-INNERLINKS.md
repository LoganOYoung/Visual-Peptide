# 用户路径 × 内链示意

按典型用户路径梳理站内链接，便于检查闭环与缺链。

---

## 1. 主路径：查剂量 → 算体积 → 验证 → 找供应商

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌─────────────┐
│  查剂量     │ ──► │  算体积/浓度     │ ──► │  验证报告   │ ──► │  找供应商   │
│  Peptides   │     │  Calculator      │     │  Verify     │     │  Suppliers  │
└─────────────┘     └──────────────────┘     └─────────────┘     └─────────────┘
       │                      │                      │                    │
       │                      │                      │                    │
       ▼                      ▼                      ▼                    ▼
  /peptides             /tools/calculator        /verify             /suppliers
  /peptides/[slug]       /tools/syringe-planner   (Report Verifier)    (目录+Verify 入口)
  /peptides/compare     /tools/vial-cycle
                        /tools/unit-converter
                        /tools/cost
```

| 步骤 | 入口页 | 本页有链向下一站？ | 下一站 | 状态 |
|------|--------|--------------------|--------|------|
| 查剂量 | 首页、Guide、FAQ | 首页 → Peptides ✅；Guide §7 → Library/Compare ✅ | Library / 肽详情 / Compare | ✅ |
| 查剂量 | /peptides, /peptides/[slug] | Library → Compare、Guide#concentration ✅；详情 → Guide、Verify、Compare、Calculator ✅ | Calculator、Verify | ✅ |
| 算体积 | /tools/calculator, syringe, vial-cycle, cost, unit-converter | 各工具 → Guide 对应章节、Calculator ✅；Calculator → 肽详情(预填时) ✅ | Guide、肽详情 | ✅ |
| 验证 | /verify | Verify → Guide#purity ✅；**Verify → Suppliers** ✅ | Suppliers、Guide | ✅ |
| 找供应商 | /suppliers | **Suppliers → Verify** ✅；Suppliers 底 → Guide、FAQ、Peptides ✅ | Verify、Guide、FAQ、Library | ✅ |

**结论**：主路径闭环完整。Verify → Suppliers、Suppliers → Verify 与 Suppliers 底部 Guide/FAQ/Peptides 已覆盖。

---

## 2. 零基础入门路径：Guide → FAQ → 工具

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│  Guide      │ ──► │  FAQ        │ ──► │  Calculator /    │
│  复溶·剂量  │     │  常见问题   │     │  Syringe / 其他   │
└─────────────┘     └─────────────┘     └──────────────────┘
       │                    │                      │
       ▼                    ▼                      ▼
  /guide               /faq                  /tools/*
  §1–8 + 锚点          分组 + 锚点            各工具页
```

| 步骤 | 入口 | 本页链向下一站？ | 状态 |
|------|------|------------------|------|
| Guide | 首页、Help 下拉、FAQ、About、工具页「See guide」 | Guide §2→Unit Converter，§3→Syringe Planner，§4→Calculator，§5→Verify，§7→Library/Compare/Structure，§8→FAQ ✅ | ✅ |
| FAQ | 首页、Help、Guide §8、About | FAQ 内链各工具/Library/Compare/Verify/About；底 → Guide, Tools, Peptides, Compare, Verify, Suppliers, About ✅ | ✅ |
| 工具 | /tools、各工具页 | Tools 索引 → Guide、FAQ、Peptides ✅；各工具 → Guide 对应节 + Calculator ✅ | ✅ |

**结论**：Guide ⇄ FAQ ⇄ Tools 三角闭环完整。

---

## 3. 对比选肽路径：Library → Compare → 详情 → 计算/验证

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│  Library    │ ──► │  Compare    │ ──► │  肽详情          │
│  分类/搜索  │     │  最多 3 个   │     │  剂量·复溶·3D    │
└─────────────┘     └─────────────┘     └──────────────────┘
       │                    │                      │
       ▼                    ▼                      ▼
  /peptides            /peptides/compare       /peptides/[slug]
  卡片「Compare」       Library 链接            Calculator、Verify、Compare
```

| 步骤 | 入口 | 本页链向下一站？ | 状态 |
|------|------|------------------|------|
| Library | 首页、Guide、About、Tools 底、Compare 页 | → Compare、Guide#concentration ✅；卡片「Compare」→ /compare?compare=slug ✅ | ✅ |
| Compare | 首页、Library、Guide §7、FAQ、About | → Library ✅；底 → Calculator、Guide#concentration ✅；表头 → 各肽详情 ✅ | ✅ |
| 肽详情 | Library、Compare、Structure(有 PDB 时)、Calculator 预填 | → Guide、Verify、Compare、Calculator、3D(有 PDB 时) ✅ | ✅ |

**结论**：Library ⇄ Compare ⇄ 详情 闭环完整，且均可到 Calculator / Verify。

---

## 4. 成本与用量路径：Cost / Vial & Cycle ⇄ Calculator、Suppliers

```
┌──────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Cost per Dose   │     │  Vial & Cycle    │     │  Suppliers  │
│  Vial & Cycle    │ ──► │  Calculator      │     │  (可选)     │
└──────────────────┘     └──────────────────┘     └─────────────┘
         │                         │
         └──────► Guide ◄──────────┘
```

| 页 | 出链 | 状态 |
|----|------|------|
| Cost | Guide#concentration、Calculator、Vial & Cycle ✅ | ✅ |
| Vial & Cycle | Guide#concentration、Calculator ✅ | ✅ |
| Calculator | Guide#concentration、肽详情(预填时) ✅ | ✅ |

**结论**：成本/用量路径内链完整。Suppliers 由 Verify 或页脚进入即可。

---

## 5. 3D 与肽结构路径：Structure ⇄ Demo ⇄ Peptides / Guide

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│  Structure  │ ──► │  Structure demo │ ──► │  Peptides   │
│  单结构 PDB │     │  多帧/轨迹      │     │  Guide      │
└─────────────┘     └─────────────────┘     └─────────────┘
       │                      │
       ▼                      ▼
  /structure             /structure/demo
  Calculator、肽详情      3D Structure、Peptide Library、Guide
```

| 页 | 出链 | 状态 |
|----|------|------|
| Structure | demo、Calculator(有肽时)、肽详情(有肽时)、Library、Calculator 底 ✅ | ✅ |
| Structure demo | Structure、Peptides、Guide ✅ | ✅ |
| 肽详情(有 PDB) | View 3D → /structure?pdb= ✅ | ✅ |

**结论**：3D 与内容页闭环完整。

---

## 6. 全站枢纽（每页都能到的入口）

| 枢纽 | 出现位置 | 说明 |
|------|----------|------|
| 首页 | 全局 Header 品牌 | 所有页可回首页 |
| Tools | Header、首页、Guide §7、FAQ、About、Tools 索引底 | 工具枢纽 |
| Peptides | Header、首页、Guide §7、FAQ、About、Compare、Structure、Suppliers 底 | 内容枢纽 |
| Verify | Header、首页 CTA、Guide §5、FAQ、肽详情、Suppliers、PurityPulse | 验证枢纽 |
| Guide | Header Help、首页、FAQ、About、各工具「See guide」、肽详情、Verify、Structure demo | 帮助枢纽 |
| Suppliers | 全站 Footer、Verify 文案、About/FAQ 底、404 | 采购入口 |

---

## 7. 缺链检查（按路径查缺补漏）

| 页面 | 建议有但缺失的链？ | 处理 |
|------|--------------------|------|
| /suppliers | 底部到 Guide、FAQ、Peptides | ✅ 已加 Guide、FAQ、Peptide Library |
| /verify | → Suppliers | ✅ 已有 |
| /tools (索引) | → Guide、FAQ、Peptides | ✅ 已有 |
| /tools/vial-cycle | → Guide、Calculator | ✅ 已有 |
| /tools/cost | → Guide、Calculator、Vial & Cycle | ✅ 已有 |
| /tools/unit-converter | → Guide#units、Calculator | ✅ 已有 |
| /structure/demo | → Guide、Peptides | ✅ 已有 |
| 肽详情 | → Verify、Guide、Compare、Calculator | ✅ 已有 |
| 404 | Structure、Suppliers | ✅ 已加入 not-found |

**结论**：当前无缺链。主路径、零基础、对比选肽、成本用量、3D 路径均闭环，Suppliers 已纳入全站导航与 Verify 出口。

---

## 8. Mermaid 总览（简化）

```mermaid
flowchart LR
  subgraph 入口
    H[首页]
  end
  subgraph 查剂量·对比
    P[Peptides]
    C[Compare]
    D[肽详情]
  end
  subgraph 算体积·成本
    T[Tools]
    Cal[Calculator]
    Syr[Syringe]
    Vial[Vial & Cycle]
    Cost[Cost]
    Unit[Unit Converter]
  end
  subgraph 验证·采购
    V[Verify]
    S[Suppliers]
  end
  subgraph 帮助
    G[Guide]
    F[FAQ]
  end
  subgraph 3D
    St[Structure]
    Demo[Structure demo]
  end

  H --> P & T & V & G
  P --> C & D & G
  C --> P & D & Cal & G
  D --> Cal & V & C & G
  T --> Cal & Syr & Vial & Cost & Unit & G & F & P
  Cal --> G & D
  Syr --> Cal & G
  Vial --> Cal & G
  Cost --> Cal & Vial & G
  Unit --> Cal & G
  V --> G & S
  S --> V & G & F & P
  G --> Cal & Syr & Vial & Unit & Cost & P & C & St & F
  F --> G & T & P & V & S
  St --> Demo & P & Cal
  Demo --> St & P & G
```

---

**文档维护**：新增页面或改路径时，在此补一笔「入口 / 出链」，并再跑一遍 §7 缺链检查。
