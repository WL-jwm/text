/**
 * B-13 咸水入侵风险评价 Tab
 *
 * 4大面板：
 *  1. 风险计算器 — Cl⁻输入+界面参数→综合评分
 *  2. 监测井预警 — 预设8个监测井风险排名
 *  3. 预测趋势 — Cl⁻浓度线性外推预测
 *  4. 防治参考 — 风险等级对应措施
 * 面板: ReferencePanel（拆分自 IntrusionRiskTab.tsx）
 */
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard } from '../../UI';
import { AlertTriangle, BookOpen } from 'lucide-react';

export function ReferencePanel() {
  const riskTable = [
    { level: '低风险', color: '#10b981', clRange: '<100', interfaceTrend: '稳定或回升', monitoring: '年度一次', measure: '常规监测' },
    { level: '中风险', color: '#f59e0b', clRange: '100~250', interfaceTrend: '缓慢下移', monitoring: '半年度一次', measure: '控制开采+加密监测' },
    { level: '高风险', color: '#f97316', clRange: '250~500', interfaceTrend: '持续下移', monitoring: '季度一次', measure: '限采+回灌+替代水源' },
    { level: '严重', color: '#ef4444', clRange: '>500', interfaceTrend: '快速下移', monitoring: '月度一次', measure: '禁采+地下帷幕+紧急替代水源' },
  ];

  const ghTable = [
    { head: '5', ratio: '40', note: '典型淡水透镜体' },
    { head: '10', ratio: '40', note: '常见淡水透镜体' },
    { head: '15', ratio: '40', note: '一般潜水补给区' },
    { head: '20', ratio: '40', note: '强补给淡水体' },
    { head: '30', ratio: '40', note: 'G-H公式理论值' },
  ];

  return (
    <div className="space-y-4">
      <TechCard icon={BookOpen} title="海水入侵风险分级与防治措施">
        <FilterableTechTable
          headers={['风险等级', 'Cl⁻范围(mg/L)', '界面趋势', '监测频率', '防治措施']}
          rows={riskTable.map(r => [r.level, r.clRange, r.interfaceTrend, r.monitoring, r.measure])}
          filterPlaceholder="搜索等级或措施..."
        />
      </TechCard>

      <TechCard icon={BookOpen} title="Ghyben-Herzberg理论界面深度">
        <p className="text-xs text-gw-muted mb-3">公式: z = (ρf/(ρs-ρf)) × hf ≈ 40 × hf，其中ρs=1025kg/m³, ρf=1000kg/m³</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">淡水位标高hf (m)</th>
                <th className="text-right p-2 text-gw-muted">理论界面深度z (m)</th>
                <th className="text-left p-2 text-gw-muted">说明</th>
              </tr>
            </thead>
            <tbody>
              {ghTable.map(r => (
                <tr key={r.head} className="border-b border-gw-border/50">
                  <td className="p-2 font-mono text-gw-text">{r.head}</td>
                  <td className="p-2 text-right font-mono text-blue-400">{r.ratio}</td>
                  <td className="p-2 text-gw-muted">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gw-muted mt-2">注：实际界面深度受含水层非均质性、越流补给、开采影响等因素制约，G-H公式仅提供理论参考值。</p>
      </TechCard>

      <TechCard icon={AlertTriangle} title="海水入侵类型识别">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: '成片入侵', icon: '▬', color: '#ef4444', desc: '滨海地区大规模成片咸水区扩展，Cl⁻>500mg/L，距离海岸<10km', measure: '建设地下帷幕+禁采' },
            { type: '舌状入侵', icon: '▸', color: '#f97316', desc: '咸水沿古河道/强透水层舌状内侵，Cl⁻250~500mg/L，距离海岸10~20km', measure: '控制开采+回灌' },
            { type: '越流入侵', icon: '↕', color: '#f59e0b', desc: '深层咸水通过越流进入浅层，Cl⁻100~250mg/L，与开采漏斗相关', measure: '调整开采层位' },
          ].map(item => (
            <div key={item.type} className="p-3 rounded-lg bg-gw-surface">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" style={{ color: item.color }}>{item.icon}</span>
                <span className="font-semibold text-sm" style={{ color: item.color }}>{item.type}</span>
              </div>
              <p className="text-xs text-gw-muted">{item.desc}</p>
              <p className="text-[10px] text-gw-blue mt-1">建议: {item.measure}</p>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
