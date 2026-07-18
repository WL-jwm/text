# B-06 补充：水质评价报告生成器 — 开发文档

> 模块：WaterQuality Calculator Report Generator
>
> 前置依赖：B-06 计算引擎（已完成）+ B-06 UI Tab 组件（已完成）
>
> 预估工作量：0.5 天

---

## 1 需求与约束

### 1.1 功能定位

在已完成的水质评价计算器（在线计算 + 屏幕展示）基础上，新增**一键导出评价结果为 Excel 文件**的能力，形成完整的"输入 → 计算 → 展示 → 导出"闭环。

环评技术人员完成水质评价计算后，将结果导出为 Excel 文件，用于直接嵌入环评报告附件、作为水质评价章节的支撑材料提交、存档备查。

### 1.2 技术约束

| 约束项 | 方案 | 说明 |
|--------|------|------|
| 导出库 | SheetJS (`xlsx` ^0.18.5) | 已有项目依赖，无需新增安装 |
| 参考实现 | `DataQualityExcelExport.ts` | 成熟的多 Sheet 导出模板，结构可直接复用 |
| 样式能力 | 不支持单元格着色 | SheetJS 社区版限制，与现有导出保持一致 |
| 交付物格式 | 多 Sheet 标签页 | 每个 Sheet 聚焦单一主题，与用户既有交付物偏好一致 |
| 文件命名 | `水质评价报告_YYYY-MM-DD.xlsx` | 与 `数据质量报告_YYYY-MM-DD.xlsx` 风格统一 |

### 1.3 文件变更范围

| 操作 | 文件路径 | 职责 | 预估行数 |
|------|---------|------|---------|
| **新增** | `src/utils/waterQualityReportExport.ts` | 导出函数主体（5 个 Sheet 构建 + 下载触发） | ~200 行 |
| **修改** | `src/components/water-quality/WaterQualityCalculatorTab.tsx` | 新增导出按钮（import + 按钮 JSX + 禁用逻辑） | ~10 行 |

---

## 2 Sheet 详细设计

### 2.1 总览

| 序号 | Sheet 名称 | 内容 | 行数（估） | 说明 |
|------|-----------|------|-----------|------|
| 1 | 评价概览 | 各水样综合评定结果汇总 | 1 + N | N 为水样数 |
| 2 | 标准指数明细 | 逐水样逐因子的 Pi 计算明细 | 1 + N×M | M 为因子数（≤16） |
| 3 | 超标汇总 | 仅超标因子行，便于快速定位 | 1 + K | K 为超标因子总数，可能为 0 |
| 4 | 苏卡列夫分类 | 水化学类型 + %ep + 分区号 | 1 + N | 未执行时标注说明 |
| 5 | 评价标准 | GB/T 14848-2017 限值参考表 | 固定 17 行 | 静态参考，与计算结果无关 |

### 2.2 Sheet 1：评价概览

| 列 | 表头 | 类型 | 字段映射 |
|----|------|------|---------|
| A | 水样名称 | string | `SampleResult.sampleName` |
| B | 综合评定类别 | string | `overallClass`，如 "III类" |
| C | 类别数字 | number | `overallClassNum`（1~5） |
| D | 参评因子数 | number | `factors.length` |
| E | 超标因子数 | number | `exceededCount` |
| F | 超标因子名称 | string | `exceededFactors.join('、')`，无超标时 "全部达标" |
| G | 最大 Pi 值 | string | 各因子 Pi 数值取 max，解析失败时 "-" |
| H | 评价结论 | string | `classNum ≤ 3` → "达标"；`classNum > 3` → "超标" |

### 2.3 Sheet 2：标准指数明细

| 列 | 表头 | 类型 | 字段映射 |
|----|------|------|---------|
| A | 水样名称 | string | |
| B | 评价因子 | string | `FactorResult.name` |
| C | 单位 | string | `unit` |
| D | 监测值(原始) | string | 保留原始输入，未检出显示 "未检出 X.XX" |
| E | 监测值(数值) | number/null | `numericValue` |
| F | S(III类) | number/null | `standardIII`，pH 为 7.0 |
| G | Pi | string | 标准指数，如 "0.86"、"未检出 <1%" |
| H | 是否超标 | string | "是" / "否" |
| I | 评定类别 | string | 如 "III类" |
| J | 类别数字 | number | 1~5 |
| K | 未检出 | string | "是" / "否" |
| L | 检出限 | number/null | `detectionLimit` |

> 数据按水样分组排列，相邻水样之间空一行。表头仅在 Sheet 顶部出现一次。

### 2.4 Sheet 3：超标汇总

| 列 | 表头 | 类型 | 字段映射 |
|----|------|------|---------|
| A | 水样名称 | string | |
| B | 评价因子 | string | |
| C | 单位 | string | |
| D | 监测值 | string | |
| E | S(III类) | number | |
| F | Pi | string | |
| G | 评定类别 | string | |
| H | 超标倍数 | string | Pi > 1 时计算 `(Pi - 1)`，如 "0.86倍" |

> 筛选条件：`isExceeded === true`。全部达标时仅保留表头 + 备注行"全部达标，无超标因子"。

### 2.5 Sheet 4：苏卡列夫分类

| 列 | 表头 | 类型 | 字段映射 |
|----|------|------|---------|
| A | 水样名称 | string | 默认 "水样1" |
| B | 水化学类型 | string | 如 "HCO₃-Ca·Mg" |
| C | 分区号 | number | 1~49，0 表示未分类 |
| D~I | 各离子 %ep | number | HCO₃⁻ / SO₄²⁻ / Cl⁻ / Ca²⁺ / Mg²⁺ / Na⁺ |
| J | 阴离子优势 | string | >25%ep 的离子，"·" 连接 |
| K | 阳离子优势 | string | >25%ep 的离子，"·" 连接 |

> 苏卡列夫分类与标准指数法的水样管理独立。未执行时写入占位说明行。

### 2.6 Sheet 5：评价标准

| 列 | 表头 | 类型 | 说明 |
|----|------|------|------|
| A | 评价因子 | string | 因子名称 |
| B | 单位 | string | |
| C~G | I~V 类 | string | 限值原文 |

> 数据来源：`groundwaterQualityStandard.evaluationFactors`。

---

## 3 接口与数据流

### 3.1 导出函数签名

```typescript
// src/utils/waterQualityReportExport.ts

import type { SampleResult, SukalovResult } from './waterQualityCalculator';

/**
 * 导出水质评价结果为 Excel 文件
 * @param samples   标准指数法评价结果数组（可为空数组）
 * @param sukalov   苏卡列夫分类结果（可为 null）
 * @param filename  文件名前缀，默认 "水质评价报告"
 */
export function exportWaterQualityReport(
  samples: SampleResult[],
  sukalov: SukalovResult | null,
  filename?: string,
): void;
```

### 3.2 数据流

```
用户输入监测值 / 离子浓度
       │
       ▼
classifySample()  /  sukalovClassification()     ← 计算引擎（已完成）
       │
       ▼
results: SampleResult[]  /  sukalovResult        ← UI 组件 state（已完成）
       │
       ▼
exportWaterQualityReport(results, sukalovResult) ← 本次新增
       │
       ├─ Sheet 1: 评价概览（SampleResult[] → 汇总行）
       ├─ Sheet 2: 标准指数明细（SampleResult[].factors[] → 展平行）
       ├─ Sheet 3: 超标汇总（filter isExceeded → 子集）
       ├─ Sheet 4: 苏卡列夫分类（SukalovResult → %ep 表）
       └─ Sheet 5: 评价标准（groundwaterQualityStandard → 静态映射）
       │
       ▼
XLSX.write() → Blob → 触发浏览器下载
```

---

## 4 开发步骤

### Step 1：创建导出函数

创建 `src/utils/waterQualityReportExport.ts`，参考 `DataQualityExcelExport.ts` 的结构：

1. 引入 `xlsx`（SheetJS）和计算引擎类型
2. 实现 `downloadBlob` 辅助函数
3. 按 Sheet 2 → 1 → 3 → 4 → 5 的顺序构建各 Sheet 数据（先建明细再建汇总，便于复用遍历逻辑）
4. 设置各 Sheet 列宽（`ws['!cols']`）
5. 拼接文件名（`水质评价报告_YYYY-MM-DD.xlsx`）并触发下载

关键实现要点：
- **Sheet 2 按水样分组**：遍历 `samples[].factors[]`，相邻水样之间插入空行对象 `{}` 作为分隔
- **Sheet 3 过滤超标**：`samples.flatMap(s => s.factors.filter(f => f.isExceeded))`，空数组时写入 `[{ '备注': '全部达标，无超标因子' }]`
- **Sheet 4 占位处理**：`sukalov === null` 时写入 `[{ '备注': '未执行苏卡列夫分类' }]`
- **Sheet 5 静态映射**：`groundwaterQualityStandard.evaluationFactors.map(f => ({ '评价因子': f.name, ... }))`
- **最大 Pi 值解析**：`FactorResult.Pi` 可能是 "0.86"、"未检出 <1%"、"无法计算" 等文本，用 `parseFloat` 尝试解析，失败时填 "-"

### Step 2：UI 集成

修改 `WaterQualityCalculatorTab.tsx`：

1. 新增 import：
   ```typescript
   import { FileSpreadsheet } from 'lucide-react';
   import { exportWaterQualityReport } from '../../utils/waterQualityReportExport';
   ```
2. 在操作栏"计算评价"按钮旁新增"导出报告"按钮
3. 按钮位置：两个面板（标准指数法 / 苏卡列夫）的操作栏各放一个，或仅在顶部操作栏放置一个共享按钮
4. 禁用条件：`results.length === 0 && !sukalovResult` 时 `disabled`

```tsx
<button
  onClick={() => exportWaterQualityReport(results, sukalovResult)}
  disabled={results.length === 0 && !sukalovResult}
  className="flex items-center gap-1 text-xs bg-sky-600/15 text-sky-400
    border border-sky-500/20 hover:bg-sky-600/25 disabled:opacity-30
    disabled:cursor-not-allowed px-2.5 py-1 rounded transition-colors">
  <FileSpreadsheet size={14} /> 导出报告
</button>
```

### Step 3：全量验证

```
tsc --noEmit     → 0 errors（排除测试文件）
eslint           → 0 errors
vite build       → 构建成功
vitest run       → 499 tests passed
```

### Step 4：提交

```
git add src/utils/waterQualityReportExport.ts \
        src/components/water-quality/WaterQualityCalculatorTab.tsx

git commit -m "B-06补充: 水质评价报告Excel导出(5 Sheet)

- 新增 waterQualityReportExport.ts
  - 评价概览: 各水样综合评定+最大Pi+超标因子
  - 标准指数明细: 逐因子Pi计算表(按水样分组)
  - 超标汇总: 仅超标因子行(超标倍数计算)
  - 苏卡列夫分类: %ep+水化学类型+分区号
  - 评价标准: GB/T 14848-2017限值参考表
- CalculatorTab新增导出报告按钮(无结果时禁用)
- 基于SheetJS(xlsx)，与DataQualityExcelExport风格统一"
```

---

## 5 边界情况处理

| 场景 | 处理方式 |
|------|---------|
| 无计算结果（results 为空） | 导出按钮禁用，用户无法触发 |
| 仅有标准指数法结果 | Sheet 4 创建但标注"未执行苏卡列夫分类" |
| 仅有苏卡列夫结果（无水样数据） | Sheet 1~3 创建但为空（仅表头），Sheet 4 正常填充 |
| 全部达标（无超标因子） | Sheet 3 仅表头 + 备注行"全部达标，无超标因子" |
| Pi 为"无法计算"或"<1%"等文本 | 评价概览的"最大 Pi 值"列解析失败时填 "-" |
| 水样名称含特殊字符 | SheetJS 原生支持 UTF-8，无需特殊处理 |
| 大量水样（>50 个） | SheetJS 内存写入不依赖 DOM，无性能瓶颈 |

---

## 6 后续可扩展方向（本次不实现）

### 6.1 Word 报告生成

**目标**：基于评价计算结果，一键生成符合环评报告格式的 Word 文档（"地下水水质现状评价"章节）。

**适用场景**：环评报告中水质评价章节有固定的行文结构（评价标准说明 → 单因子评价法介绍 → 评价结果表 → 超标分析 → 综合评价结论），手动编写重复度高。

**技术路径**：
- 后端方案：Python + python-docx，读取模板 `.docx` → 替换占位符 → 填充评价结果表格 → 输出最终文档
- 前端方案：前端组装 Markdown/HTML → 调用后端渲染接口生成 `.docx`
- 推荐后端方案，python-docx 模板控制力更强，可精确控制表格样式、段落格式、页眉页脚

**交付物内容**：
- 章节标题 + 评价标准说明段落（自动引用 GB/T 14848-2017）
- 单因子评价结果表（标准指数明细表的 Word 版本）
- 超标因子分析段落（自动生成："XX因子超标X倍，可能原因是..."）
- 综合评价结论段落（"根据单因子标准指数法评价，XX井地下水水质为X类，满足/不满足III类标准要求"）

**Sheet 关联**：Word 报告中的数据表格内容与 Excel Sheet 2（标准指数明细）完全一致，可复用 `SampleResult[]` 数据源。

**预估工作量**：1~1.5 天

**依赖**：独立功能点，不依赖其他扩展方向。可与当前 Excel 导出并行开发。

---

### 6.2 水样名称关联

**现状**：标准指数法面板和苏卡列夫分类面板各自独立管理水样。标准指数法支持多水样，苏卡列夫分类当前仅有单组离子输入。导致 Excel Sheet 4（苏卡列夫分类）中的"水样名称"列默认填"水样1"，无法与标准指数法的水样对应。

**目标**：两个面板共享统一的水样列表，用户填写的水样名称自动同步到苏卡列夫面板。

**实现思路**：
- 将 `WaterSample[]` 状态提升到 `WaterQualityCalculatorTab` 组件顶层
- 苏卡列夫面板改为下拉选择当前水样，每个水样可独立存储一组离子浓度
- `WaterSample` 接口扩展：
  ```typescript
  interface WaterSample {
    id: string;
    name: string;
    values: Record<string, string>;           // 标准指数法监测值
    sukalovInput?: SukalovInput;               // 苏卡列夫离子浓度
  }
  ```
- 导出时 Sheet 4 自动按水样名称填充，与 Sheet 1~3 对齐

**影响范围**：仅 `WaterQualityCalculatorTab.tsx` 内部重构，不涉及计算引擎变更。

**预估工作量**：0.5 天

---

### 6.3 历史对比 Sheet

**目标**：同一监测井在不同时段（丰水期/枯水期、不同年份）的水质评价结果并排对比，识别水质变化趋势。

**适用场景**：环评报告中常需要对比"现状"与"历史"水质数据，分析水质变化趋势（恶化/改善/稳定）。目前计算器仅支持单次评价，无法直接对比。

**Sheet 设计（新增 Sheet 6：历史对比）**：

| 列 | 表头 | 说明 |
|----|------|------|
| A | 评价因子 | |
| B | 时段1 监测值 | 如 "2024年丰水期" |
| C | 时段1 类别 | 如 "III类" |
| D | 时段2 监测值 | 如 "2024年枯水期" |
| E | 时段2 类别 | |
| F | 变化趋势 | "改善" / "稳定" / "恶化"（自动判定） |
| G | 趋势说明 | 如 "总硬度从III类升至IV类" |

**实现前提**：
- 需要数据持久化支持（IndexedDB 或 localStorage），保存历史评价结果
- UI 层新增"保存当前结果"和"加载历史记录"按钮
- 趋势判定规则：`classNum` 变化方向，下降=改善，上升=恶化，不变=稳定

**预估工作量**：1~1.5 天（含持久化 + UI + 对比 Sheet）

**依赖**：数据持久化机制（平台已有 IndexedDB 基础设施，可复用）。

---

### 6.4 Excel 样式增强

**现状**：SheetJS 社区版（`xlsx` ^0.18.5）不支持写入单元格样式（字体颜色、背景色、边框等），导出的 Excel 为纯数据无格式。

**目标**：超标因子行以红色背景高亮、达标因子行以绿色背景标注、类别标签列按 I~V 类分色显示，提升报告可读性。

**技术路径对比**：

| 方案 | 库 | 样式支持 | 包体积影响 | 社区活跃度 |
|------|---|---------|-----------|------------|
| A. 保持 SheetJS | `xlsx` ^0.18.5 | 不支持样式 | 无增加（已有） | 维护模式 |
| B. 升级 SheetJS Pro | `xlsx` pro 版 | 支持完整样式 | 无增加 | 付费 |
| C. 切换 ExcelJS | `exceljs` ^4.x | 支持完整样式 | +300KB | 活跃 |
| D. 混合方案 | SheetJS 读取 + ExcelJS 写入 | 仅写入时用 ExcelJS | +300KB | — |

**推荐方案 C**：
- ExcelJS 社区版支持完整的样式写入（`fill`、`font`、`border`、`alignment`）
- API 风格与 SheetJS 不同（workbook → worksheet → cell 链式调用），需重写导出函数
- 包体积增加约 300KB（gzip 后约 80KB），对 3.5MB 总体积影响可控
- 迁移步骤：保留 `xlsx` 用于其他模块的读取场景，`exceljs` 仅用于水质评价导出的写入场景

**样式规范**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 表头行 | 深蓝底(#2F5496) + 白色粗体字 | 与项目 UI 主题色一致 |
| 超标因子行 | 浅红底(#FDE8E8) + 红色字(#C00000) | Sheet 2 和 Sheet 3 中 `isExceeded === true` 的行 |
| 达标因子行 | 浅绿底(#E2EFDA) + 深绿字(#548235) | `classNum ≤ 3` 的行 |
| 未检出行 | 灰色斜体 | `isND === true` 的行 |
| 类别标签列 | 按类别分色（I绿/II浅绿/III黄/IV橙/V红） | Sheet 2 第 I 列和 Sheet 1 第 B 列 |
| 数值列 | 右对齐 | Pi、监测值、限值等数值列 |
| 文本列 | 左对齐 | 水样名、因子名等 |

**预估工作量**：1 天（含库切换 + 样式实现 + 回归测试）

**依赖**：需新增 `exceljs` 依赖，且需与现有 `xlsx` 共存（不影响 DataQualityExcelExport 等模块）。

---

### 6.5 优先级建议

| 优先级 | 方向 | 理由 |
|--------|------|------|
| **P0** | 6.1 Word 报告生成 | 直接面向环评报告交付场景，投入产出比最高，可独立开发 |
| **P1** | 6.2 水样名称关联 | 工作量小，修复数据对应关系缺陷，为 6.3 历史对比打基础 |
| **P2** | 6.4 Excel 样式增强 | 提升报告可读性，但需引入新库，评估包体积影响后再启动 |
| **P3** | 6.3 历史对比 Sheet | 功能价值高但依赖持久化，复杂度最大，建议排到最后 |

> 推荐执行顺序：6.2 → 6.1 → 6.4 → 6.3。先修复水样关联（0.5天堵住数据缺陷），再做 Word 报告（1天交付核心价值），然后 Excel 样式美化（1天提升品质），最后历史对比（1.5天扩展能力）。总计约 4 天。
