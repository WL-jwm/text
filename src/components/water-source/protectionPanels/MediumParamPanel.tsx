/**
 * B-10 水源地保护区划分 Tab
 *
 * 5大面板：
 *  1. 计算器 — 输入水文地质参数 → 计算保护区半径/面积
 *  2. 同心圆图 — 保护区可视化（一级/二级/准保护区嵌套）
 *  3. 预设水源地 — 8个河北重要水源地保护区一览
 *  4. 经验值参考表 — HJ/T 338-2007附录A查表
 *  5. 介质参数参考 — 有效孔隙度/渗透系数
 * 面板: MediumParamPanel（拆分自 ProtectionZoneTab.tsx）
 */
import { TRAVEL_TIMES, MEDIUM_POROSITY } from '../../../utils/protectionZoneCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard } from '../../UI';
import { Layers } from 'lucide-react';

export function MediumParamPanel() {
  return (
    <TechCard icon={Layers} title="含水层介质参数参考表">
      <p className="text-xs text-gw-muted mb-3">常用含水层介质的有效孔隙度和渗透系数参考值，选择介质后可自动填充计算器参数。</p>
      <FilterableTechTable
        headers={['含水层介质', '有效孔隙度 n_e', '渗透系数 K (m/d)', '说明']}
        rows={Object.entries(MEDIUM_POROSITY).map(([name, info]) => [
          name,
          String(info.ne),
          String(info.K),
          info.description,
        ])}
        filterPlaceholder="搜索介质名称..."
      />
      <div className="mt-3 p-3 rounded-lg bg-gw-surface text-xs text-gw-muted">
        <p className="font-medium text-gw-text mb-1">解析法公式（孔隙水潜水）</p>
        <p className="font-mono text-blue-400">R = (K × I × T) / n_e</p>
        <p className="mt-1">其中：K=渗透系数(m/d)，I=水力坡度，T=迁移时间(d)，n_e=有效孔隙度</p>
        <p className="mt-1">时间标准：一级保护区 T₁ = {TRAVEL_TIMES.primaryDays}天，二级保护区 T₂ = {TRAVEL_TIMES.secondaryDays}天</p>
      </div>
    </TechCard>
  );
}
