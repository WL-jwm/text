/**
 * 面板: MethodPanel（拆分自 RiskAssessmentTab.tsx）
 */
import { PipelinePanel } from '../../PipelinePanel';
import { TechCard, DataSourceNote } from '../../UI';
import { BookOpen } from 'lucide-react';

export function MethodPanel() {
  return (
      <TechCard title="方法参考" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">改进DRASTIC模型</p>
            <p className="text-[10px] text-gw-muted">标准DRASTIC七因子(D/R/A/S/T/I/C)加权叠加，叠加土地利用修正系数(0.7~2.5)。权重: D=0.22, R=0.17, A=0.13, S=0.09, T=0.06, I=0.17, C=0.16。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">超采风险评价</p>
            <p className="text-[10px] text-gw-muted">三指标加权: 开采强度(40%) + 补亏比(30%) + 水位下降速率(30%)。深层含水层额外加权1.2倍。开采强度&gt;1即为超采。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">沉降风险评价</p>
            <p className="text-[10px] text-gw-muted">四指标加权: 压缩层条件(30%) + 水位降幅(25%) + 历史沉降(25%) + 当前速率(20%)。考虑压缩性系数(黏土0.9~砂0.3)和结构系数。</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/20">
            <p className="text-xs font-semibold text-gw-text mb-1">海水入侵评价</p>
            <p className="text-[10px] text-gw-muted">三指标加权: 距海岸距离(30%) + Cl⁻浓度及趋势(35%) + 水力梯度(35%)。Cl⁻&gt;250mg/L为入侵阈值，趋势变化率&gt;1.5加重一级。</p>
          </div>
        </div>
        <PipelinePanel moduleId="riskAssessment" onReceive={(dataType, payload) => {
        if (dataType === 'drasticResult') {
          alert(`已接收DRASTIC脆弱性结果:\n指数=${payload.drasticIndex}, 等级=${payload.level}\n\n请据此调整风险评估的污染风险维度参数。`);
        } else if (dataType === 'waterQualityFactors') {
          const factors = (payload as { factors?: unknown[] }).factors;
          if (factors) alert(`已接收水质评价数据(${factors.length}项因子)\n\n请据此调整风险评估的水质维度。`);
        }
      }} />
      <DataSourceNote source="基于DRASTIC模型标准+河北省水文地质分区特征整理" version="B-31 v1.0" />
      </TechCard>
  );
}
