/**
 * ReferencePanel — 修复方案评估面板（自 RemediationTab.tsx 拆分）
 */
import { TechCard, CollapsiblePanel } from '../../UI';
import { REMEDIATION_PRESETS, TECH_COMPARISON_TABLE } from '../../../utils/remediationEvaluator';
import { FilterableTechTable } from '../../FilterableTechTable';

// 参考说明面板
export function ReferencePanel() {
  const headers = ['指标', 'PRB反应墙', '抽出处理', '自然衰减', '生物修复', '气相抽提'];
  const rows = TECH_COMPARISON_TABLE.map(t => [t.metric, t.prb, t.pat, t.mna, t.bio, t.as]);
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">五种修复技术对比</h3>
        <FilterableTechTable headers={headers} rows={rows} />
      </TechCard>
      
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">预设污染场景</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REMEDIATION_PRESETS.map(p => (
            <div key={p.id} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <div className="text-sm font-medium text-cyan-400">{p.name}</div>
              <div className="text-xs text-slate-400 mt-1">{p.description}</div>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="bg-slate-700/50 px-2 py-0.5 rounded text-slate-300">污染物: {p.contaminant}</span>
                <span className="bg-slate-700/50 px-2 py-0.5 rounded text-slate-300">{p.aquiferType}含水层</span>
              </div>
            </div>
          ))}
        </div>
      </TechCard>
      
      <CollapsiblePanel title="技术方法与参考标准" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p><strong className="text-slate-300">PRB设计</strong>: 基于一级反应动力学方程 C/C₀ = exp(-k·t)，厚度计算确保出流浓度低于目标值。参考: EPA/600/R-02/003 PRB设计指南。</p>
          <p><strong className="text-slate-300">P&amp;T系统</strong>: 基于Theis井流理论和Sichardt影响半径公式，浓度衰减采用孔隙体积交换模型。参考: EPA/540/S-92/001 抽出处理技术指南。</p>
          <p><strong className="text-slate-300">MNA评估</strong>: 基于一阶衰减模型 C(x) = C₀·exp(-λ·x/v)，衰减机制贡献参照US EPA MNA协议(EPA/600/R-01/020)。</p>
          <p><strong className="text-slate-300">生物修复</strong>: 适宜性评分基于温度、pH、电子受体、TOC、微生物丰度、渗透性多因素加权。降解速率采用Monod方程简化形式。参考: EPA/600/R-08/140 生物修复评估指南。</p>
          <p><strong className="text-slate-300">气相抽提</strong>: 影响半径基于渗透系数经验公式，挥发去除基于亨利定律。参考: EPA/540/S-91/003 SVE设计手册。</p>
          <p><strong className="text-slate-300">MCDA</strong>: 采用加权线性求和(WSM)法，敏感性分析为权重±20%单变量扰动法。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}
