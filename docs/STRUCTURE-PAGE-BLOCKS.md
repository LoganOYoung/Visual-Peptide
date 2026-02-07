# 3D Structure 页面 — 板块与功能

## 当前板块（自上而下）

| 板块 | 功能 | 对应模块 |
|------|------|----------|
| **1. 页头** | 标题、一句话说明、操作提示（拖拽/缩放）、Library·Calculator 入口 | H1 + 两段文案 + 链接 |
| **2. Load structure by PDB ID** | 输入 PDB ID，点「Load 3D viewer」跳转 ?pdb=xxx 并加载 3D | PdbOpener（input + button） |
| **3. 当前结构 + 下一步**（有 PDB 且命中站内肽时） | 显示「This structure is 肽名」+ Open calculator、Peptide detail | 条件条 + 两链接 |
| **4. 3D 查看器**（有 PDB 时） | 站内渲染 3D，拖拽旋转、缩放；顶栏「Open in RCSB」 | PdbViewerInSite |
| **5. 空状态**（无 PDB 时） | 提示「输入上方 PDB 或从下方选择」 | 虚线框 + 一句文案 |
| **6. Quick load** | 一键加载：站内肽（带 PDB）+ 常用测试 PDB，去重 | 卡片 + 标签列表 |
| **7. 页脚说明** | 数据来源、教育用途、小肽可能无 PDB 等 | 一小段文字 |

---

## 板块与功能的对应关系（用户意图）

- **「我要按 ID 查」** → 板块 2（输入）+ 板块 4（看）
- **「我要从名字/库进来」** → 页头 Library 链接 + 板块 6（Quick load 里含肽名）
- **「看完我要算剂量」** → 板块 3（Open calculator）
- **「我要核对/深度看」** → 板块 4 顶栏「Open in RCSB」
- **「随便试几个结构」** → 板块 6（Quick load）

---

## 可优化方向（板块与功能）

1. **板块 2 与 6 的关系**：目前 2 是「输入」，6 是「快捷选」。可考虑在板块 2 下加一句「或从下方 Quick load 选一个」，让「输入 vs 选择」更清晰。
2. **板块 3 仅站内肽**：未命中站内肽时没有「当前结构」条，只有 3D。若需要，可加一个中性条，如「PDB 6XBM」+「Open in RCSB」，不显示 calculator/detail。
3. **板块 4 功能外露**：已在副标题写「Drag to rotate, scroll to zoom」；若 3D 区域加一个极简的「Rotate · Zoom」小标签，功能更显性。
4. **缺「下载/引用」**：若以后要支持「引用此结构」，可增加板块「Cite / Download」链接到 RCSB 或 PDB 文件，当前可暂不做。
