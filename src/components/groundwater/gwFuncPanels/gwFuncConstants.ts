/**
 * B-24 地下水功能评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入14项指标 → 四维度评分+综合评价
 *  2. 预设分区 — 6个河北典型功能区对比
 *  3. 评分标准 — 各指标评分细则
 *  4. 权重方法 — AHP权重+功能等级标准
 * 共享常量与类型（拆分自 GroundwaterFunctionCalculatorTab.tsx）
 */
import type { FunctionEvaluationInput } from '../../../utils/groundwaterFunctionCalculator';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const FIELD_DEFS: Array<{ key: keyof FunctionEvaluationInput; label: string; step?: string; group: string }> = [
  { key: 'wellYield', label: '单井涌水量 (m³/d)', step: '100', group: '供水' },
  { key: 'waterQualityGrade', label: '水质级别 (1~5)', step: '1', group: '供水' },
  { key: 'exploitableModulus', label: '可开采模数 (万m³/km²·a)', step: '1', group: '供水' },
  { key: 'utilizationRate', label: '开采利用率 (%)', step: '5', group: '供水' },
  { key: 'baseflowRatio', label: '基流补给比例 (%)', step: '5', group: '生态' },
  { key: 'wetlandDependency', label: '湿地依赖度 (1~5)', step: '1', group: '生态' },
  { key: 'vegetationDependency', label: '植被依赖度 (%)', step: '5', group: '生态' },
  { key: 'subsidenceRate', label: '地面沉降速率 (mm/a)', step: '1', group: '地质环境' },
  { key: 'seawaterIntrusion', label: '海水入侵距离 (km)', step: '0.5', group: '地质环境' },
  { key: 'salinizationRatio', label: '盐渍化面积比 (%)', step: '5', group: '地质环境' },
  { key: 'aquiferThickness', label: '含水层厚度 (m)', step: '5', group: '调节' },
  { key: 'specificYield', label: '给水度', step: '0.01', group: '调节' },
  { key: 'rechargeIntensity', label: '年补给强度 (mm/a)', step: '10', group: '调节' },
  { key: 'waterLevelAmplitude', label: '水位年变幅 (m)', step: '0.5', group: '调节' },
];
export const GROUP_COLORS: Record<string, string> = {
  '供水': '#06b6d4',
  '生态': '#10b981',
  '地质环境': '#f59e0b',
  '调节': '#8b5cf6',
};
