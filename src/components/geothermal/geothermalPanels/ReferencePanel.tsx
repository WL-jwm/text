/**
 * B-17 地热资源量评价计算器 Tab
 *
 * 4大面板：
 *  1. 热储储量 — 热储法 Q=ρ·c·V·ΔT 计算 + 预设地热田对比
 *  2. 井产能评价 — 热功率/年产热量/产能等级
 *  3. 地温梯度 — 梯度/热流值/不同深度温度预测
 *  4. 可开采量 — 开采系数法/回灌率/服务年限
 * 面板组件：ReferencePanel（拆分自 GeothermalCalculatorTab.tsx）
 */

import { FilterableTechTable } from '../../FilterableTechTable';
import { ROCK_PROPERTIES, RECOVERY_FACTOR_TABLE, calcGeothermalSummary } from '../../../utils/geothermalCalculator';

// ── 面板5: 岩石物性参考 ──
export function ReferencePanel() {
  return (
    <div className="space-y-4">
      <FilterableTechTable
        headers={['岩石类型', '密度(kg/m³)', '比热容(kJ/kg·°C)', '热导率(W/m·K)', '典型产状']}
        rows={Object.entries(ROCK_PROPERTIES).map(([, v]) => [v.type, v.density, v.specificHeat, v.thermalConductivity, v.typicalSetting])}
      />
      <FilterableTechTable
        headers={['热储类型', '开采系数范围', '推荐值', '适用条件']}
        rows={RECOVERY_FACTOR_TABLE.map(r => [r.reservoirType, r.range, r.recommended, r.condition])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">热储法原理：</strong>
          {' '}热储法是地热资源量评价的基本方法，通过计算热储层中水和岩石骨架储存的热总量来评价地热资源。
          {' '}公式 Q = [ρw·cw·φ + ρr·cr·(1-φ)] × V × ΔT 中，水的贡献通过孔隙度φ加权，岩石贡献通过(1-φ)加权。
          {' '}对于低孔隙度裂隙型热储（如灰岩φ=0.05），岩石骨架贡献占主导（≥90%）；
          {' '}对于高孔隙度孔隙型热储（如砂岩φ=0.10），水的贡献可达15%以上。
        </p>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">河北平原地热资源特征：</strong>
          {' '}河北平原地热资源主要赋存于蓟县系雾迷山组（岩溶裂隙型）和新生界馆陶组/明化镇组（孔隙型砂岩）。
          {' '}雄县-牛驼镇-容城一带为高地温异常区，热储温度75~85°C，地温梯度3.5~4.0°C/100m。
          {' '}全省8个主要地热田总热储量约{calcGeothermalSummary().totalHeat}×10¹²kJ，
          {' '}折合标煤约{calcGeothermalSummary().totalCoal}万t，是华北平原地热资源最丰富的省份之一。
        </p>
      </div>
    </div>
  );
}
