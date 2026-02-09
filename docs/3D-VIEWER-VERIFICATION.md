# 3D 查看器功能生效检查报告

## 已修复问题

- **hotspotFor useCallback**：补全依赖数组 `[id]`，修复 TypeScript/React 要求 useCallback 第二参数为依赖数组导致的编译错误。

---

## 按功能逐项检查结果

| # | 功能 | 代码位置 | 状态 | 说明 |
|---|------|----------|------|------|
| 1 | **残基点击/悬停** | clicksphere callback / hover_callback → setSelectedResidue, setHoverResidue；tooltip 与 Selected residue 面板 | ✅ 生效 | 3Dmol 传入的 atom 含 resn/resi/chain，已正确写入 state 并展示 |
| 2 | **热点解释** | getHotspotAnnotation(id, resi, chain, resn)；hoverHotspot/selectedHotspot 用于 tooltip 与面板 | ✅ 生效 | 6XBM/1UBQ 及通用残基有数据；依赖已修正 |
| 3 | **链显示/隐藏** | chainVisibility + toggleChain → setStyle({ chain }, { hidden }) | ✅ 生效 | 勾选/取消即更新样式并 render |
| 4 | **显示模式** | displayStyle → applyViewerStyle(cartoon/stick/line/sphere) | ✅ 生效 | 切换下拉会触发 useEffect 重刷样式 |
| 5 | **着色** | colorScheme → applyViewerStyle(spectrum/chain) | ✅ 生效 | 同上 |
| 6 | **序列与 3D 联动** | getSequenceFromPdb；centerResidue(chainId, resi)；selectedResidue 高亮序列字母 | ✅ 生效 | 序列解析、点击字母居中、点击 3D 更新选中并高亮，逻辑完整 |
| 7 | **距离测量** | measureMode + handleAtomClick → 两点时 distance()、addLine、removeAllShapes、setMeasureDistance | ✅ 生效 | 依赖 3Dmol 传入 atom 带 x,y,z；min 版可能需实测 |
| 8 | **疏水表面** | showHydrophobicitySurface → useEffect 内 addSurface(SAS)/removeSurface | ⚠️ 依赖 3Dmol | 需 3Dmol 已加载且暴露 addSurface/removeSurface；RWB 为电荷着色，非严格疏水标度 |
| 9 | **导出 PNG** | exportPng → pngURI() → 下载 | ✅ 生效 | 3Dmol 标准 API |
| 10 | **Focus all / Focus 链** | focusAll/focusChain → zoomTo() / zoomTo({ chain }) | ✅ 生效 | 标准 API |
| 11 | **元数据 + Cite/Download** | PdbStructureMetadata 请求 RCSB entry API；Download/Cite 链接 | ✅ 生效 | 失败时组件 return null，不报错 |
| 12 | **可复现 URL** | structure 页读 searchParams → initialChain/initialResidues/fixedLabels 传入 viewer | ✅ 生效 | initialChain 控制链可见性；initialResidues 用 addStyle 高亮；fixedLabels 用 addLabel |
| 13 | **Verify 链接** | 顶栏 Link to /verify | ✅ 生效 | 纯链接 |

---

## 需在浏览器中验证的点

1. **3Dmol 点击/悬停**：部分 CDN 构建可能未暴露 hover_callback，若悬停无 tooltip，点击仍应有选中 + 热点解释。
2. **距离测量**：确认点击原子时 3Dmol 回调里 `this` 是否带 `x,y,z`；若无则连线不显示，仅显示数字。
3. **initialResidues 高亮**：addStyle({ chain, resi: number[] }) 是否被 3Dmol 支持（如不支持需改为按残基循环 setStyle 或换选择器）。
4. **疏水表面**：首次勾选会异步计算表面，大结构可能较慢；取消勾选会 removeSurface。

---

## 结论

- **编译与类型**：通过（已修复 useCallback 依赖）。
- **逻辑连接**：上述 13 项在代码中均已有对应实现与串联。
- **建议**：在本地或预发环境打开 `/structure?pdb=6XBM`，逐项操作（点击/悬停、链勾选、显示切换、测量、导出、序列点击、疏水表面、带 chain/residues 的 URL）做一次人工回归即可确认“全部真实生效”。
