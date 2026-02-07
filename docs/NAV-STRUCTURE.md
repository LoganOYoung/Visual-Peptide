# 导航结构规划 (Navigation Structure)

## 一、原则

- **按用户目标分组**：先算 → 查肽 → 验纯度 → 找供应商。
- **主次分明**：核心工具与目录放一级，辅助放二级或 Footer。
- **控制数量**：顶栏 5–7 项为宜，避免过长；可合并为「工具」「资源」等分组。

---

## 二、建议结构（当前采用）

### 顶栏 (Header) — 一级导航

| 顺序 | 名称 | 路径 | 说明 |
|------|------|------|------|
| 1 | Home | `/` | 首页（Logo 点击） |
| 2 | **Calculator** | `/tools/calculator` | 复溶与剂量计算器（核心工具） |
| 3 | **Peptides** | `/peptides` | 肽目录与详情（核心内容） |
| 4 | 3D Structure | `/structure` | PDB 3D 结构跳转 |
| 5 | Purity & Verify | `/verify` | 纯度与 Janoshik 验证 |
| 6 | Guide | `/guide` | 复溶与剂量文字指南 |
| 7 | Suppliers | `/suppliers` | 供应商（占位） |

**逻辑**：工具(Calculator) → 内容(Peptides) → 延伸工具(3D) → 信任(Verify) → 学习(Guide) → 采购(Suppliers)。

### 可选：分组展示（未来可做下拉）

若顶栏项过多，可合并为 3–4 组：

| 分组 | 包含 | 说明 |
|------|------|------|
| **Tools** | Calculator, 3D Structure | 计算与可视化 |
| **Peptides** | 目录 `/peptides`，热门肽可做快捷链 | 查肽与剂量 |
| **Resources** | Guide, Purity & Verify | 指南与验证 |
| **Suppliers** | `/suppliers` | 供应商入口 |

顶栏则变为：**Home | Tools ▼ | Peptides ▼ | Resources ▼ | Suppliers**，点击展开或下拉。

---

## 三、Footer 导航

- 与顶栏**同组链接**即可，便于底部再次触达。
- 可补充：About、Contact、Disclaimer、Privacy（若后续有页）。

---

## 四、面包屑 (Breadcrumb)

- **可选**：仅在深层页使用，如 `/peptides/[slug]` 显示 `Peptides > BPC-157`。
- 当前未做，需要时再加。

---

## 五、当前实现

- **lib/nav.ts**：扁平数组，顺序即顶栏顺序；可扩展为带 `group` 字段以支持分组。
- **Header**：只渲染 `href !== "/"` 的项，Home 由 Logo 承担。
- **Footer**：复用同一 `navLinks` 列表。

扩展分组时只需：在 `nav.ts` 为链接增加 `group: "Tools" | "Resources"` 等，Header 按 group 聚合渲染为下拉或分段即可。
