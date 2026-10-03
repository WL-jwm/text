/**
 * B-23 土壤盐渍化评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入土壤参数 → 盐分分级/类型判定/淋洗需水量/改良预测/临界深度
 *  2. 预设分区 — 8个河北平原盐渍化分区对比评价
 *  3. 盐分分级标准 — 5级分级标准参考
 *  4. 质地参数 — 不同质地毛细参数与改良建议
 * 面板组件：TextureParamsPanel（拆分自 SoilSalinizationCalculatorTab.tsx）
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator, MapPin, BookOpen, Layers } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { FilterableTechTable } from '../../FilterableTechTable';
import { TEXTURE_PARAMS } from '../../../utils/soilSalinizationCalculator';

// ── 面板4: 质地参数 ──
export function TextureParamsPanel() {
  const capillaryData = TEXTURE_PARAMS.map(t => ({
    name: t.texture,
    capillary: t.capillaryRise,
    critical: t.capillaryRise + t.criticalExtra,
    permeability: t.permeability,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="质地类型" value={TEXTURE_PARAMS.length} unit="种" icon={Layers} accent="blue" />
        <StatCard title="毛细上升范围" value="1.0~3.5" unit="m" icon={Calculator} accent="amber" />
        <StatCard title="渗透系数范围" value="0.08~1.5" unit="m/d" icon={MapPin} accent="emerald" />
        <StatCard title="改良参考" value="6" unit="类" icon={BookOpen} accent="cyan" />
      </div>

      <LazyChartCard title="各质地毛细上升与临界深度" height={280}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={capillaryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'm', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip unit="m" title="毛细参数" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="capillary" name="毛细水上升高度(m)" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Bar dataKey="critical" name="临界深度(m)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="土壤质地毛细参数详表" badge="改良参考">
        <FilterableTechTable
          headers={['质地', '毛细水上升(m)', '临界附加(m)', '临界深度(m)', '渗透系数(m/d)', '改良建议']}
          rows={TEXTURE_PARAMS.map(t => {
            const critical = t.capillaryRise + t.criticalExtra;
            let advice: string;
            if (t.permeability > 1.0) advice = '排水良好，改良容易';
            else if (t.permeability > 0.3) advice = '排水中等，需适当排水';
            else if (t.permeability > 0.1) advice = '排水较差，需暗管排水';
            else advice = '排水困难，需综合改良';
            return [t.texture, String(t.capillaryRise), String(t.criticalExtra), critical.toFixed(1), String(t.permeability), advice];
          })}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="改良措施选择建议" badge="因地制宜">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-emerald-400">轻度盐渍化（全盐量1~2 g/kg）</div>
            <div className="text-[10px] text-gw-muted mt-1">农业措施为主：选用耐盐品种、增施有机肥、秸秆覆盖减少蒸发。配合适量淡水灌溉淋洗。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-amber-400">中度盐渍化（全盐量2~4 g/kg）</div>
            <div className="text-[10px] text-gw-muted mt-1">水利+农业措施结合：建设排水系统、淡水灌溉淋洗、种植绿肥作物（田菁、草木樨）、磷石膏改良。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-orange-400">重度盐渍化（全盐量4~6 g/kg）</div>
            <div className="text-[10px] text-gw-muted mt-1">工程改良为主：暗管排盐、淡水洗盐、客土改良、施用脱硫石膏。先种植盐生植物（碱蓬、盐角草）生物改良。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-red-400">极重度盐渍化（全盐量≥6 g/kg）</div>
            <div className="text-[10px] text-gw-muted mt-1">综合改良：工程排水+淡水洗盐+化学改良+生物改良多管齐下。改良周期长（10年以上），宜先做水产养殖或盐生植物利用。</div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="《土壤学》| FAO Paper 29 | 河北省盐碱地综合治理" version="B-23" />
    </div>
  );
}
