/**
 * B-37 气候变化对地下水影响评估器 Tab
 *
 * 5大面板：
 *  1. 气候降尺度 — 历史气候数据+GCM降尺度+降水/气温趋势
 *  2. 补给量预测 — 降水-补给关系+多情景补给变化
 *  3. 干旱指数 — SPI/SPEI计算+干旱分级+传导滞后
 *  4. 适应策略 — 策略库+情景匹配+优先级排序
 *  5. 参考说明 — 降尺度方法+补给公式+干旱指数+GCM情景
 * 共享常量（拆分自 ClimateImpactTab.tsx）
 */
export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};
