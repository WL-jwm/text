/**
 * 拆分自 DecisionSupportTab.tsx
 */

import { BookOpen } from 'lucide-react';
import { TechCard, DataSourceNote } from '../../UI';

export function ReferencePanel() {
  return (
    <>
    {/* ═══ Panel 6: 方法参考 ═══ */}
    <TechCard title="方法参考" icon={BookOpen}>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/12">
          <p className="text-xs font-semibold text-blue-400 mb-1">水资源配置优化</p>
          <p className="text-[10px] text-gw-muted">多水源多用户线性规划分配，按用户优先级排序，每个用户内部按水源成本从低到高分配。保证最低供水保障量，水质等级需匹配用户要求。</p>
        </div>
        <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/12">
          <p className="text-xs font-semibold text-orange-400 mb-1">压采方案评估</p>
          <p className="text-[10px] text-gw-muted">分阶段计算压采量、替代水量、经济成本和缺口。生态效益(60%权重) + 经济可行性(40%权重)综合评分。替代水成本越低，经济可行性越高。</p>
        </div>
        <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/12">
          <p className="text-xs font-semibold text-green-400 mb-1">生态水位保障</p>
          <p className="text-[10px] text-gw-muted">三指标加权: 达标率(35%) + 水位差距(35%) + 补采比(30%)。深层含水层额外0.85倍折减。根据补采比估算水位恢复年限。</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/12">
          <p className="text-xs font-semibold text-amber-400 mb-1">风险预警决策</p>
          <p className="text-[10px] text-gw-muted">四级预警(蓝/黄/橙/红)，基于水位埋深、Cl⁻浓度、变化速率和开采状态综合判定。不同级别对应差异化的响应措施矩阵和责任分工。</p>
        </div>
      </div>
      <DataSourceNote source="基于河北省地下水管理实践及南水北调受水区配置方案整理" version="B-32 v1.1" />
    </TechCard>
    
    </>
  );
}
