# 全站信息规划（Site Information Spec）

工具已全部实现。本文档列出**全站所应提供的信息**，按页面整理，并标注当前状态（✅ 已有 / ⚠ 部分 / ❌ 待补）。

---

## 一、首页 (Home) — `/`

| 信息项 | 说明 | 状态 |
|--------|------|------|
| 站点定位 / Slogan | 一句话：研究用肽工具（计算器、目录、3D、纯度验证） | ✅ |
| 工具入口卡片 | Calculator、Peptide Directory、3D Structure、Purity & Verify；标题 + 简短描述 + 跳转 | ✅（4 张；可考虑增加 Tools 总入口或 Vial/Cost/Unit 等子工具） |
| 热门肽快捷入口 | 5–8 个常见肽一键到详情 | ✅（当前 5 个：BPC-157, Semaglutide, Tirzepatide, Ipamorelin, TB-500；可增至 PT-141, Epithalon） |
| 供应商 CTA | 一句说明 +「View Suppliers」按钮 | ✅ |

---

## 二、工具索引与各工具页 (Tools) — `/tools` 及子页

| 页面 | 应提供的信息 | 状态 |
|------|----------------|------|
| **工具索引** `/tools` | 各子工具卡片：Recon & Dosing、Vial & Cycle、Unit Converter、Cost per Dose；每项标题 + 描述 + 跳转 | ✅ |
| **复溶与剂量** `/tools/calculator` | 输入输出说明、单位与无菌/储存提醒、按体积/按浓度双模式、注射器 0.3/0.5/1 mL 单位 | ✅ |
| **用量与周期** `/tools/vial-cycle` | 一瓶可用天数、目标天数所需瓶数；输入输出说明 | ✅ |
| **单位换算** `/tools/unit-converter` | mcg ↔ mg 说明与换算 | ✅ |
| **单次剂量成本** `/tools/cost` | 单价 + 瓶含量 + 单次剂量 → 每 dose 成本；注明仅供比较、价格因供应商/地区而异 | ✅ |

---

## 三、肽目录与肽详情 (Peptides) — `/peptides`、`/peptides/[slug]`、`/peptides/compare`

| 页面 | 应提供的信息 | 状态 |
|------|----------------|------|
| **目录** `/peptides` | 列表：肽名称、副标题/别名、一句话描述、典型剂量、频率、链接详情 | ✅ |
| **详情** `/peptides/[slug]` | 名称、副标题/别名、描述、典型剂量（research only）、频率、复溶说明、CAS、PDB（有则链出）、「Open calculator」「View 3D structure」入口 | ✅ |
| **对比** `/peptides/compare` | 选 2–3 个肽并排：剂量、频率、描述/用途、复溶、3D、CAS | ✅ |
| **覆盖肽** | BPC-157, Semaglutide, Tirzepatide, Ipamorelin, TB-500, PT-141, Epithalon；可扩展 GHRP-2/6, CJC-1295 等 | ✅（7 个已覆盖） |

---

## 四、指南 (Guide) — `/guide`

| 信息项 | 说明 | 状态 |
|--------|------|------|
| 所需物料 | 冻干肽、BAC 水/无菌稀释液、注射器、无菌操作 | ✅ |
| 复溶步骤 | 室温、抽稀释液、注入瓶壁、轻旋不摇、储存与使用期限 | ✅ |
| 浓度与剂量概念 | 浓度 = 肽质量(mg) ÷ 稀释液体积(mL)；剂量(mcg) 与体积(mL) 关系 | ✅ |
| 计算器入口 | 引导到 Calculator 做具体数值 | ✅ |
| 纯度与 sourcing | 强调第三方检测、链到 Purity & Verify | ✅ |
| 复溶稳定性/有效期 | 开瓶日 + 稳定天数 → 建议用完日（通用提示，以产品/文献为准） | ✅（StabilityHelper） |

---

## 五、3D 结构 (Structure) — `/structure`

| 信息项 | 说明 | 状态 |
|--------|------|------|
| 功能说明 | PDB ID 输入 → RCSB Mol* 3D 查看 | ✅ |
| 有 PDB 的肽列表 | 本站已维护的带 PDB 的肽，每条链到对应 3D 页 | ✅ |
| 免责与数据来源 | 数据来自 RCSB PDB；仅教育/研究；非所有肽都有 PDB | ✅ |

---

## 六、纯度与验证 (Purity & Verify) — `/verify`

| 信息项 | 说明 | 状态 |
|--------|------|------|
| 为何要验证 | 纯度、身份、效价对研究/使用的重要性 | ✅（文案中体现） |
| Janoshik 介绍 | HPLC 纯度、质谱身份、效价；盲测；报告含 task ID 与验证码 | ✅ |
| 公开结果库 | public.janoshik.com，按肽/供应商查历史报告 | ✅ + 外链 |
| 使用提醒 | 用 task ID 在官网验证报告真伪；遵守当地法规与机构要求 | ✅ |
| 报告验证助手 | 输入 task ID → 验证页链接 + 步骤说明 | ✅（ReportVerifier） |
| 外链 | Janoshik 官网、公开数据库（新开 tab） | ✅ |

---

## 七、供应商 (Suppliers) — `/suppliers`

| 信息项 | 说明 | 状态 |
|--------|------|------|
| 定位说明 | 计划展示经第三方检测或社区验证的供应商；仅供信息参考，不替代自行验证 | ✅ |
| 验证优先 | 选供应商前先查 Verify 页与 Janoshik 公开库 | ✅ |
| 供应商目录 | 名称、地区、可查到的测试报告链接、备注（静态列表或外链） | ✅ 已做（静态表，lib/suppliers.ts） |

---

## 八、其他信息（可选）

| 信息项 | 说明 | 状态 |
|--------|------|------|
| About | 站点是谁、目的、研究/教育用途声明 | ✅ /about |
| Disclaimer | 非医疗建议、研究/教育用途、使用者自行负责 | ✅ /about |
| Privacy | 若收集数据需隐私说明；纯前端可写「无追踪」或留空 | ✅ /about |
| FAQ | 复溶用啥水、能存多久、哪里验纯度等 | ✅ /faq |

---

## 九、小结：信息完整性

- **核心信息**：首页、工具、肽目录/详情/对比、Guide、Structure、Verify、Suppliers 的**主要信息项均已覆盖**。
- **工具**：全部实现（复溶与剂量含注射器单位、用量与周期、单位换算、单次成本、报告验证、复溶稳定性、肽对比）。
- **已实施的可补充项**：
  - 首页热门肽已增至 7 个（含 PT-141, Epithalon）。
  - 供应商目录为静态表结构（lib/suppliers.ts），无条目时显示说明，可后续添加。
  - /about 页含 About、Disclaimer、Privacy 三小节。
  - /faq 独立页；Guide 内第 6 节链到 FAQ；nav 与 Footer 含 FAQ、About。

以上即为全站所应提供的信息规划；当前清单已全部落地。
