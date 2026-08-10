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

> 以下规范均来源于本项目实际修复的 Bug，每条附【问题示例】说明其成因，供开发时对照参考。

### 代码审查检查项

提交 PR 前逐项检查：

```
□ 所有 Math.max/min 操作前确认数组非空
□ 循环累加逻辑使用 nextIdx 而非 currentIdx
□ 输入校验阈值设为最小必要值（优先用 === 0 而非 < 2）
□ 对象属性访问链全部使用 ?. 安全链
□ 条件分支的每个路径都有对应的测试覆盖
```

#### 逐项注释说明

**① Math.max/min 前确认数组非空**

空数组的 `Math.max(...[])` 返回 `-Infinity`，`Math.min(...[])` 返回 `Infinity`，参与后续计算会得到灾难性结果（如污染水质类别、水位均值等）。

```typescript
// 问题示例：comprehensiveAssessment 空指标值崩溃
// 空指标值时 indicators 数组为空
const worstClass = Math.max(...indicators.map(i => i.class));
// → Math.max(...[]) = -Infinity
// → WATER_CLASS_LABELS[-Infinity].description → 访问 undefined 属性崩溃
```

**修复方式**：空集合时提前返回默认值，或对结果加 `?.` 安全链。

---

**② 循环累加使用 nextIdx 而非 currentIdx**

遍历分级/分层阈值时，超过当前级应推进到**下一级**，而非停留在当前级。

```typescript
// 问题示例：水质分类类别不累加
// TDS: I≤300, II≤500, III≤1000，实测值 800 应判定为 III 类
for (const cls of classes) {
  if (value > range.high) {
    className = cls;  // 停在当前类，800 被误判为 II 类
  }
}
// 正确：className = classes[nextIdx];  // 推进到下一类 → III 类
```

**修复方式**：`className = classes[indexOf(cls) + 1]`，并注意末级（V 类）边界处理。

---

**③ 输入校验阈值设为最小必要值**

拒绝输入的阈值应能放行最小合法输入，优先用 `=== 0` 判断空集，而非宽松的 `< 2` 等。

```typescript
// 问题示例：parseCSV 单行输入返回空
if (lines.length < 2) {          // 仅表头(1行)也被拒绝
  return { headers: [], rows: [] };  // 丢失了表头信息
}
// 正确：if (lines.length === 0)  // 仅拒绝真正的空输入
```

**修复方式**：用 `=== 0` 替代 `< N`，确保合法的部分数据（如表头）不被丢弃。

---

**④ 对象属性访问链全部使用 ?. 安全链**

当键名来自运行期值（如分类号、索引）时，访问结果可能是 `undefined`，需用 `?.` 防御。

```typescript
// 问题示例：WATER_CLASS_LABELS[worstClass].description
// worstClass 可能为 -Infinity 或越界值
WATER_CLASS_LABELS[worstClass].description;        // 崩溃
WATER_CLASS_LABELS[worstClass]?.description ?? '未知';  // 安全
```

**修复方式**：链式访问统一加 `?.`，并配合 `??` 提供兜底默认值。

---

**⑤ 条件分支每个路径都有测试覆盖**

`if/else`、`switch`、分级阈值等每个分支都应至少有一条测试，尤其注意：

- 每个等级/类别的进入与退出
- 恰好等于阈值的情况
- V 类/末级的 `>X` 边界格式

```typescript
// 问题示例：水质分类边界测试
// 需覆盖: ≤限值(当前类)、=限值(当前类)、>限值(下一类)、>V类限值(仍V类)
```

---

### 测试编写规范

- **边界值三件套**：每个阈值覆盖 `threshold-1`、`threshold`、`threshold+1`
  ```typescript
  // 阈值 100 的三件套
  value = 99;   // 应在当前类
  value = 100;  // 应恰好落在阈值边界
  value = 101;  // 应进入下一类
  ```

- **空值覆盖**：空数组、空对象、`undefined`、`null` 各有一条测试
  ```typescript
  // 空指标值测试：确保不崩溃且返回合理默认值
  comprehensiveAssessment('WQ-01', '站', '石家庄', {});
  ```

- **时间无关性**：时间戳使用动态计算，禁止硬编码
  ```typescript
  // 错误：硬编码时间戳，24h 后测试失效
  { createdAt: '2026-08-07T10:00:00' };
  // 正确：动态计算
  const today = new Date().toISOString().split('T')[0];
  { createdAt: `${today}T10:00:00` };
  ```

- **Mock 数据完整性**：确认 Mock 数据满足被测函数的所有前置条件
  ```typescript
  // 问题示例：象限判定需要 averageClass >= 3.5
  // 但 Mock 数据 averageClass = 3.0，未触发目标分支
  determineQuadrant(mockBalance, { averageClass: 3.0 });  // 返回 3 而非 1
  // 正确：averageClass = 4.0，才能触发象限 1
  ```

### 命名规范

统一命名规则，保证代码可读性与可检索性。以下规则结合本项目技术栈（React + TypeScript + Zustand + Three.js）制定。

#### 文件命名

| 类型 | 规则 | 示例 | 说明 |
|------|------|------|------|
| 组件 | `PascalCase.tsx` | `WellNetworkPanel.tsx` | 组件文件用大写驼峰，与导出的组件名一致 |
| Hook | `useCamelCase.ts` | `useWaterBalance.ts` | `use` 前缀，小写驼峰 |
| 服务/工具 | `camelCase.ts` | `waterQuality.ts` | 小写驼峰，体现模块职责 |
| 测试 | `文件名.test.ts(x)` | `waterQuality.test.ts` | 与源文件同名 + `.test` 后缀，放 `__tests__/` 目录 |
| 类型 | `xxx.types.ts` | `waterQuality.types.ts` | 仅含类型的文件用 `.types.ts` 后缀（如需拆分） |

#### 组件命名（PascalCase）

```typescript
// 正确：PascalCase 函数组件
function WellNetworkPanel() { ... }
const SpatialMap = () => { ... };  // 箭头函数常量也可，但首字母必须大写

// 错误
function wellNetworkPanel() { ... }   // 首字母小写
const wellMap = () => { ... };        // 首字母小写
```

**说明**：React 约定组件名必须大写开头，否则 JSX 会将其当作原生 DOM 标签（如 `<wellMap>`）导致渲染错误，且难以排查。

#### Hook 命名（use + camelCase）

```typescript
// 正确
function useWaterBalance() { ... }
function useCityWaterQuality() { ... }

// 错误
function getWaterData() { ... }    // 不以 use 开头，无法触发 eslint-plugin-react-hooks 检查
const WaterState = () => { ... }   // Hook 返回状态对象，不应大写
```

**说明**：`use` 前缀是 React Hook 的强制约定，eslint 依赖此前缀校验 Hook 调用规则（不可在条件/循环中调用），命名不规范会绕过检查。

#### 状态变量命名（camelCase）

```typescript
// 正确：名词，表达状态含义
const wellList = useMemo(() => ..., []);
const [selectedWellId, setSelectedWellId] = useState<string | null>(null);
const isLoading = useSelector(s => s.loading);

// 错误
const list = useState(...)[0];   // 无意义命名
const [is, setIs] = useState(...);  // 过于泛化
```

**说明**：状态变量用名词描述内容，布尔状态用 `is/has/can` 前缀（如 `isLoading`、`hasData`），便于语义化阅读。

#### 常量命名（UPPER_SNAKE_CASE）

```typescript
// 正确：模块级常量全大写 + 下划线
const WATER_CLASS_LABELS = {...};
const MAX_WELL_COUNT = 1000;
const DEFAULT_CITY = '石家庄';

// 错误
const waterClassLabels = {...};   // 模块级常量误用 camelCase
const maxWellCount = 1000;
```

**说明**：模块级不可变常量用全大写，与函数内局部变量（camelCase）区分，便于识别作用域。

#### 类型/接口命名（PascalCase）

```typescript
// 正确
interface WellNetworkProps { ... }
interface BalanceInput { ... }
type WaterQualityClass = 1 | 2 | 3 | 4 | 5;
type BalanceStatus = 'surplus' | 'balanced' | 'deficit';

// 错误
interface wellNetworkProps { ... }   // 首字母小写
interface WellProps2 { ... }         // 无意义后缀
```

**说明**：接口/类型用 PascalCase，与值命名区分；联合类型用名词短语（如 `BalanceStatus`）。

#### 函数命名（动词 + 名词，camelCase）

```typescript
// 计算类：calc + 对象
calcBalance(input);
calcIonPercent(mmol);

// 获取类：get/query + 对象
getBalanceSummary(results);

// 分类/判定类：classify/judge + 对象
classifyFactor(value, factor);
classifySample(stationId, values, factors);

// 导出/生成类：export/generate + 对象
generateWellReport(well, options);

// 错误
balance();              // 无动词
calc(input, factor);    // 动词后无明确对象
```

**说明**：函数命名遵循「动词 + 名词」结构，前缀表达动作类型（calc/get/classify/export），名词表达操作对象，保证功能一目了然。

#### Store 命名（useXxxStore）

```typescript
// 正确：Zustand store 用 use + 领域名 + Store
const useAppStore = ...;
const useWellNetworkStore = ...;

// 错误
const appStore = ...;   // 直接引用 store 对象，绕过 hook
```

**说明**：Zustand store 统一以 `useXxxStore` 命名并作为 hook 使用，避免组件直接引用 store 原始对象导致订阅失效。

#### 命名一致性检查

```
□ 组件/类型：PascalCase
□ Hook/变量/函数：camelCase
□ 模块级常量：UPPER_SNAKE_CASE
□ Hook 均以 use 开头
□ 测试文件与源文件同名
```

### 修复模板

详细修复模板（含代码 diff、排查清单、4 种 Bug 模式）参见 `docs/修复模板.md`。

**4 种 Bug 模式速查：**

| 模式 | 代码味道 | 修复要点 | 本次案例 |
|------|---------|---------|---------|
| 空集合崩溃 | 对数组操作未做空值保护 | 提前返回 + `?.` 安全链 | `waterQuality.ts` |
| 循环累加停滞 | 累计变量未正确推进 | `nextIdx` + `break` | `waterQualityCalculator.ts` |
| 边界条件过严 | 输入校验阈值过大 | 阈值设为最小必要值 | `dataImporter.ts` |
| 测试数据失配 | Mock 数据与逻辑不同步 | 动态计算 + 对齐预期 | 4 个测试文件 |
