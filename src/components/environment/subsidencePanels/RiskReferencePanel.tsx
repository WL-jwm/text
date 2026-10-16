/**
 * B-12 地面沉降与降落漏斗分析 Tab
 *
 * 4大面板：
 *  1. 漏斗计算器 — 水文地质参数输入→漏斗半径/降深/体积
 *  2. 沉降估算 — 土层参数→分层沉降量+总沉降
 *  3. 趋势分析 — 历史沉降趋势+预测
 *  4. 沉降风险 — 河北典型沉降区+风险分区
 * 面板: RiskReferencePanel（拆分自 SubsidenceTab.tsx）
 */
import { LAYER_TYPES, RISK_ZONES } from '../../../utils/subsidenceCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard } from '../../UI';
import { BookOpen, Calculator } from 'lucide-react';

export function RiskReferencePanel() {
  return (
    <div className="space-y-4">
      <TechCard icon={BookOpen} title="地面沉降风险分区标准">
        <FilterableTechTable
          headers={['风险等级', '累计沉降范围', '特征描述', '防治措施']}
          rows={RISK_ZONES.map(r => [r.name, r.range, r.description, r.measure])}
          filterPlaceholder="搜索等级或措施..."
        />
      </TechCard>

      <TechCard icon={BookOpen} title="土层压缩参数参考">
        <FilterableTechTable
          headers={['土层类型', '储水率Ss(1/m)', '孔隙比e0', '压缩指数Cc']}
          rows={LAYER_TYPES.map(l => [l.name, String(l.Ss), String(l.e0), String(l.Cc)])}
          filterPlaceholder="搜索土层..."
        />
      </TechCard>

      <TechCard icon={Calculator} title="公式说明">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-gw-surface">
            <p className="font-medium text-gw-text mb-1">Dupuit稳定流</p>
            <p className="text-blue-400 font-mono">s = Q/(2πT)·ln(R/r)</p>
            <p className="text-gw-muted mt-1">适用于长期开采稳定状态</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface">
            <p className="font-medium text-gw-text mb-1">Theis非稳定流</p>
            <p className="text-blue-400 font-mono">s = Q/(4πT)·W(u)</p>
            <p className="text-gw-muted mt-1">u = r²S/(4Tt)，W(u)为井函数</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface">
            <p className="font-medium text-gw-text mb-1">地面沉降（储水率法）</p>
            <p className="text-blue-400 font-mono">ΔH = Ss·b·Δh</p>
            <p className="text-gw-muted mt-1">Ss为储水率，b为厚度，Δh为水头变化</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface">
            <p className="font-medium text-gw-text mb-1">地面沉降（压缩指数法）</p>
            <p className="text-blue-400 font-mono">ΔH = Cc·H₀/(1+e₀)·lg(σ/σ₀)</p>
            <p className="text-gw-muted mt-1">Cc为压缩指数，e₀为孔隙比</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
