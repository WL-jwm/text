/**
 * B-23 土壤盐渍化评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入土壤参数 → 盐分分级/类型判定/淋洗需水量/改良预测/临界深度
 *  2. 预设分区 — 8个河北平原盐渍化分区对比评价
 *  3. 盐分分级标准 — 5级分级标准参考
 *  4. 质地参数 — 不同质地毛细参数与改良建议
 * 面板组件：GradeStandardsPanel（拆分自 SoilSalinizationCalculatorTab.tsx）
 */

import { TechCard, DataSourceNote } from '../../UI';
import { FilterableTechTable } from '../../FilterableTechTable';
import { SALT_GRADE_STANDARDS, PH_GRADE_STANDARDS } from '../../../utils/soilSalinizationCalculator';

// ── 面板3: 盐分分级标准 ──
export function GradeStandardsPanel() {
  return (
    <div className="space-y-4">
      <TechCard title="土壤盐分分级标准" badge="全盐量+EC_e">
        <FilterableTechTable
          headers={['等级', '全盐量(g/kg)', 'EC_e(dS/m)', '说明', '颜色标识']}
          rows={SALT_GRADE_STANDARDS.map(s => [
            s.grade,
            s.saltMax === Infinity ? '>6.0' : `≤${s.saltMax}`,
            s.ecMax === Infinity ? '>16' : `≤${s.ecMax}`,
            s.description,
            s.color,
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="土壤碱化分级标准" badge="pH指标">
        <FilterableTechTable
          headers={['等级', 'pH范围', '说明', '颜色标识']}
          rows={PH_GRADE_STANDARDS.map(s => [
            s.grade,
            s.phMax === Infinity ? `≥${s.phMin}` : `${s.phMin}~${s.phMax}`,
            s.description,
            s.color,
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="盐分类型判定规则" badge="阴离子当量比">
        <div className="space-y-2">
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">Cl⁻/SO₄²⁻ 当量比判定</div>
            <div className="text-[10px] text-gw-muted mt-1">
              <span className="font-mono text-gw-highlight">≥4</span>: 氯化物型 | 
              <span className="font-mono text-gw-highlight"> 1~4</span>: 硫酸盐-氯化物型 | 
              <span className="font-mono text-gw-highlight"> 0.25~1</span>: 氯化物-硫酸盐型 | 
              <span className="font-mono text-gw-highlight"> &lt;0.25</span>: 硫酸盐型
            </div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">HCO₃⁻/(Cl⁻+SO₄²⁻) 比值判定</div>
            <div className="text-[10px] text-gw-muted mt-1">
              <span className="font-mono text-gw-highlight">&gt;1</span>: 苏打型（碱化严重） | 
              <span className="font-mono text-gw-highlight"> ≤1</span>: 非苏打型
            </div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">钠吸附比 SAR 与碱化度 ESP</div>
            <div className="text-[10px] text-gw-muted mt-1">
              SAR = Na⁺ / √((Ca²⁺ + Mg²⁺)/2)，ESP ≈ 100×(-0.0126 + 0.01475×SAR)。ESP&gt;15%为碱化土，需施用石膏等改良剂。
            </div>
          </div>
        </div>
      </TechCard>

      <TechCard title="淋洗需水量计算方法" badge="FAO方法">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">FAO 稳态淋洗公式</div>
            <div className="text-sm font-mono text-gw-highlight mt-1">LR = EC_dw / (EC_e × 5)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              LR: 淋洗需水量比例 | EC_dw: 灌溉水电导率(dS/m) | EC_e: 饱和泥浆电导率(dS/m)
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">总灌水量计算</div>
            <div className="text-sm font-mono text-gw-highlight mt-1">总灌水量 = 净需水量 / (1 - LR)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              净需水量按作物ET估算（默认600mm/季）。淋洗水量 = 总灌水量 × LR。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-text">排盐量估算</div>
            <div className="text-sm font-mono text-gw-highlight mt-1">排盐量 = 淋洗水量 × 排水EC × 0.064 (t/ha)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              排水EC ≈ 5 × EC_e（稳态假设）。转换系数0.064由 dS/m → g/L 和 m³/ha → t/ha 推导。
            </div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="FAO Irrigation and Drainage Paper 29 | 土壤学| 河北省盐碱地调查" version="B-23" />
    </div>
  );
}
