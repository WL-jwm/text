# 河北省地下水环境信息平台

> v4.10.0 | 河北省地下水环境监测与预测系统

## 项目简介

河北省地下水环境信息平台是一个集地下水数据展示、参数查询、历史对比、报告导出于一体的综合性 Web 应用。数据来源包括 1999 年《河北省地下水》文献和 2024 年最新水资源公报。

## 技术栈

| 层级 | 选型 | 版本 |
|------|------|------|
| 前端框架 | React + TypeScript | 18 / 5.6 |
| 构建工具 | Vite | 6.x |
| 样式 | Tailwind CSS | 3.4 |
| 图表 | Recharts | 2.15 |
| 路由 | React Router | 7.1 |
| 状态管理 | Zustand | 5.0 |
| 离线存储 | IndexedDB (idb) | 8.x |
| 报告导出 | docx + xlsx + file-saver | - |
| PWA | Service Worker + manifest.json | - |
| 测试 | Vitest | 4.x |
| 代码规范 | ESLint 9 + typescript-eslint | - |
| 后端微服务 | Flask + SQLite | Python |

## 目录结构

```
frontend/          React 前端 SPA (30 页面 / 135 组件 / 41 数据模块 / 28 报告生成器)
param-service/     参数共享微服务 (Flask + SQLite, 315 条参数 / 18 类别)
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev        # 开发模式 http://localhost:5173
npm run build      # 生产构建
npm run preview    # 预览生产构建
```

### 参数服务

```bash
cd param-service
python -m venv venv
venv\Scripts\activate          # Windows
pip install flask
python app/main.py             # http://localhost:5200
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_API_BASE` | `http://localhost:5200/api/v1` | 参数服务 API 地址 |

- 开发环境：`.env` 文件（不纳入版本控制）
- 生产环境：`.env.production` 文件（纳入版本控制）

## 功能模块

### 基础数据 (4 页面)
- 总览 (Overview) -- 数据驾驶舱 / KPI 看板
- 系统区划 (SystemZoning) -- 地下水系统 / 含水系统
- 基础地质 (Geology) -- 地质构造 / 地层岩性
- 空间地图 (MapView) -- 天地图多图层展示

### 水文地质 (4 页面)
- 水文地质参数 (HydroZoneParams) -- 含水层组 / 渗透系数 / 给水度
- 水源地 (WaterSource) -- 冲洪积扇 / 岩溶 / 盆地水源地
- 岩溶水 (KarstWater) -- 泉域 / 岩溶分区
- 裂隙水 (FractureWater) -- 风化带 / 构造 / 层间裂隙水

### 资源与环境 (10 页面)
- 水资源量、县级对比、水质评价、环境地质、开采管理、超采区划、历史参数、地下水均衡、环境背景值、水化学

### 专题资源 (4 页面)
- 地热资源、矿泉水、盐碱土、矿床水文地质

### 综合分析 (3 页面)
- 数据洞察、时间序列、空间分析

### 系统 (3 页面)
- 个人工作台、变更日志、咸水分布、404

## 测试

```bash
cd frontend
npm run test        # 307 个测试用例 (17 文件)
npm run ci           # lint + tsc + test 全流程
```

## 质量指标

| 指标 | 状态 |
|------|------|
| ESLint | 0 errors / 0 warnings |
| TypeScript | 0 编译错误 |
| Vitest | 1101 tests passed |
| Vite build | 通过 |

## 开发规范

### 代码审查检查项

提交 PR 前逐项检查：

```
□ 所有 Math.max/min 操作前确认数组非空
□ 循环累加逻辑使用 nextIdx 而非 currentIdx
□ 输入校验阈值设为最小必要值（优先用 === 0 而非 < 2）
□ 对象属性访问链全部使用 ?. 安全链
□ 条件分支的每个路径都有对应的测试覆盖
```

### 测试编写规范

- **边界值三件套**：每个阈值覆盖 `threshold-1`、`threshold`、`threshold+1`
- **空值覆盖**：空数组、空对象、`undefined`、`null` 各有一条测试
- **时间无关性**：时间戳使用动态计算，禁止硬编码
- **Mock 数据完整性**：确认 Mock 数据满足被测函数的所有前置条件

### 修复模板

详细修复模板（含代码 diff、排查清单、4 种 Bug 模式）参见 `docs/修复模板.md`。

**4 种 Bug 模式速查：**

| 模式 | 代码味道 | 修复要点 |
|------|---------|---------|
| 空集合崩溃 | 对数组操作未做空值保护 | 提前返回 + `?.` 安全链 |
| 循环累加停滞 | 累计变量未正确推进 | `nextIdx` + `break` |
| 边界条件过严 | 输入校验阈值过大 | 阈值设为最小必要值 |
| 测试数据失配 | Mock 数据与逻辑不同步 | 动态计算 + 对齐预期 |
