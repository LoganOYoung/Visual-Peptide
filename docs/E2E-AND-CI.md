# E2E 与 CI 说明

## 概述

- **Playwright** 用于端到端测试，覆盖全站关键页面与互动功能。
- **GitHub Actions** 在每次 push/PR 到 `main` 以及每周一自动运行：构建、Lint、E2E。

## 覆盖范围

| 类别 | 内容 |
|------|------|
| **Smoke** | 首页、Tools、Peptides、3D、Verify、Suppliers、Guide、FAQ、About 可访问且主要内容可见 |
| **工具** | Calculator（复溶 5mg+2.5mL→2mg/mL、剂量结果）、Syringe Planner、Unit Converter、Cost、Vial & Cycle |
| **3D** | Structure 页加载与结构选择/加载入口；Structure demo 页不崩溃 |
| **Peptides** | Library 列表、肽详情、Compare 选择两肽后出现对比表 |
| **Verify** | 页面文案、Report Verifier 输入 Task ID 后出现 Janoshik 验证链接、PurityPulse 示例批次 |
| **链接** | 关键路由 200、Footer 内链可访问 |

## 本地运行

```bash
npm ci
npm run build
npm run test:e2e
```

若本机已在 3000 端口跑 `npm run start` 或 `npm run dev`，Playwright 会复用该服务器；否则会自动执行 `npm run start`。

调试界面：

```bash
npm run test:e2e:ui
```

## CI 行为

- **触发**：`push` / `pull_request` 到 `main`，以及每周一 00:00 UTC 定时。
- **步骤**：Checkout → Node 20 → `npm ci` → `npm run lint` → `npm run build` → 安装 Chromium → `npm run test:e2e`（自动启动 `npm run start`）。

## 维护建议

- 新增重要页面或工具时，在 `e2e/` 下补充对应用例。
- 互动逻辑或文案变更后跑一次 `npm run test:e2e`，必要时更新断言。
