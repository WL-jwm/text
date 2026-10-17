/**
 * B-22 饮用天然矿泉水水质评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入水质参数 → 界限指标/限量指标/类型判定/综合等级
 *  2. 预设水源地 — 14个产地对比评价
 *  3. 标准对比 — GB 8537 vs GB/T 14848
 *  4. 类型统计 — 矿泉水类型分布分析
 * 面板: StandardPanel（拆分自 MineralWaterCalculatorTab.tsx）
 */
import { LIMIT_INDICATOR_STANDARDS, CONTAMINANT_STANDARDS, GROUNDWATER_STANDARDS } from '../../../utils/mineralWaterCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';

export function StandardPanel() {
  return (
    <div className="space-y-4">
      <FilterableTechTable
        headers={['界限指标', '界限值', '单位', '比较方式']}
        rows={LIMIT_INDICATOR_STANDARDS.map(s => [s.name, `≥ ${s.threshold}`, s.unit, s.compareOp])}
      />

      <FilterableTechTable
        headers={['限量指标', '限值', '单位']}
        rows={CONTAMINANT_STANDARDS.map(s => [s.name, `≤ ${s.limit}`, s.unit])}
      />

      <FilterableTechTable
        headers={['指标', 'GB/T 14848 III类', 'GB/T 14848 II类', '单位']}
        rows={GROUNDWATER_STANDARDS.map(s => [s.name, s.class3, s.class2, s.unit])}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gw-card-alt rounded-lg p-4">
          <p className="text-xs text-gw-muted leading-relaxed">
            <strong className="text-gw-text">GB 8537-2018 界限指标要求：</strong>
            {' '}饮用天然矿泉水须至少有一项界限指标达标。
            {' '}河北省矿泉水以偏硅酸型为主（SiO₂≥25mg/L），部分水源地同时达标锶（Sr≥0.2mg/L），
            {' '}属偏硅酸锶复合型，品质优良。
          </p>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-4">
          <p className="text-xs text-gw-muted leading-relaxed">
            <strong className="text-gw-text">与GB/T 14848对比：</strong>
            {' '}矿泉水标准（GB 8537）的限量指标通常严于或等同于地下水III类标准。
            {' '}例如硝酸盐：矿泉水≤45mg/L vs 地下水III类≤30mg/L；
            {' '}氟化物：矿泉水≤1.5mg/L vs 地下水III类≤1.0mg/L。
            {' '}矿泉水标准允许范围略宽，因矿泉水的天然地质背景特性。
          </p>
        </div>
      </div>
    </div>
  );
}
