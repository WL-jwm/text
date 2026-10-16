/**
 * B-11 水化学分析计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入6大离子浓度 → 自动分类+评价
 *  2. Piper三线图 — SVG绘制阳离子/阴离子三角形+菱形
 *  3. 预设水样 — 8个河北典型水样对比
 *  4. 离子换算参考 — 毫摩尔换算表+评价标准
 * 面板: ReferencePanel（拆分自 HydrochemCalculatorTab.tsx）
 */
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard } from '../../UI';
import { FlaskConical, BookOpen } from 'lucide-react';

export function ReferencePanel() {
  const molTable = [
    { ion: 'Ca²⁺', mass: '40.08', charge: '2', eq: '20.04', note: '主要阳离子，硬度来源' },
    { ion: 'Mg²⁺', mass: '24.31', charge: '2', eq: '12.16', note: '主要阳离子，硬度来源' },
    { ion: 'Na⁺', mass: '22.99', charge: '1', eq: '22.99', note: '主导阳离子（平原区）' },
    { ion: 'K⁺', mass: '39.10', charge: '1', eq: '39.10', note: '通常与Na合并计算' },
    { ion: 'HCO₃⁻', mass: '61.02', charge: '1', eq: '61.02', note: '主要阴离子（补给区）' },
    { ion: 'SO₄²⁻', mass: '96.06', charge: '2', eq: '48.03', note: '中等矿化度阴离子' },
    { ion: 'Cl⁻', mass: '35.45', charge: '1', eq: '35.45', note: '咸水主导阴离子' },
  ];

  const standardTable = [
    { item: 'TDS', unit: 'mg/L', I: '<300', II: '<500', III: '<1000', IV: '<2000', V: '>2000' },
    { item: '总硬度(以CaCO₃计)', unit: 'mg/L', I: '<150', II: '<300', III: '<450', IV: '<650', V: '>650' },
    { item: '硫酸根 SO₄²⁻', unit: 'mg/L', I: '<50', II: '<150', III: '<250', IV: '<350', V: '>350' },
    { item: '氯离子 Cl⁻', unit: 'mg/L', I: '<50', II: '<150', III: '<250', IV: '<350', V: '>350' },
    { item: 'pH', unit: '-', I: '6.5~8.5', II: '6.5~8.5', III: '6.5~8.5', IV: '5.5~6.5或8.5~9.0', V: '<5.5或>9.0' },
  ];

  return (
    <div className="space-y-4">
      <TechCard icon={BookOpen} title="离子摩尔质量换算表">
        <p className="text-xs text-gw-muted mb-3">毫摩尔浓度 = 质量浓度(mg/L) ÷ 摩尔质量(g/mol)。当量浓度 = 毫摩尔浓度 × 离子价数。</p>
        <FilterableTechTable
          headers={['离子', '摩尔质量(g/mol)', '离子价数', '当量(g/eq)', '说明']}
          rows={molTable.map(r => [r.ion, r.mass, r.charge, r.eq, r.note])}
          filterPlaceholder="搜索离子..."
        />
      </TechCard>

      <TechCard icon={BookOpen} title="GB/T 14848-2017 地下水质量标准（水化学指标）">
        <FilterableTechTable
          headers={['指标', '单位', 'I类', 'II类', 'III类', 'IV类', 'V类']}
          rows={standardTable.map(r => [r.item, r.unit, r.I, r.II, r.III, r.IV, r.V])}
          filterPlaceholder="搜索指标..."
        />
      </TechCard>

      <TechCard icon={FlaskConical} title="苏卡列夫分类规则">
        <div className="p-3 rounded-lg bg-gw-surface text-xs text-gw-muted space-y-2">
          <p><span className="text-gw-text font-medium">分类原则：</span>按离子毫摩尔百分数 ≥25% 的离子组合命名，阴离子在前、阳离子在后。</p>
          <p><span className="text-gw-text font-medium">命名格式：</span>主要阴离子·次要阴离子 - 主要阳离子·次要阳离子 型</p>
          <p><span className="text-gw-text font-medium">示例：</span>HCO₃·SO₄ - Ca·Na 型 表示 HCO₃和SO₄均超25%、Ca和Na均超25%</p>
          <p><span className="text-gw-text font-medium">水文地质意义：</span>从山前HCO₃-Ca型→滨海Cl-Na型，反映水岩作用程度和蒸发浓缩趋势</p>
        </div>
      </TechCard>
    </div>
  );
}
