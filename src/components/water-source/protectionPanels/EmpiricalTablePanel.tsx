/**
 * B-10 水源地保护区划分 Tab
 *
 * 5大面板：
 *  1. 计算器 — 输入水文地质参数 → 计算保护区半径/面积
 *  2. 同心圆图 — 保护区可视化（一级/二级/准保护区嵌套）
 *  3. 预设水源地 — 8个河北重要水源地保护区一览
 *  4. 经验值参考表 — HJ/T 338-2007附录A查表
 *  5. 介质参数参考 — 有效孔隙度/渗透系数
 * 面板: EmpiricalTablePanel（拆分自 ProtectionZoneTab.tsx）
 */
import { type SourceType, EMPIRICAL_RADII } from '../../../utils/protectionZoneCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard } from '../../UI';
import { BookOpen } from 'lucide-react';
import { useMemo } from 'react';
import { SCALES } from './protectionConstants';

export function EmpiricalTablePanel() {
  const allRows = useMemo(() => {
    const rows: Array<{ type: string; scale: string; primary: number; secondary: number; note: string }> = [];
    (Object.keys(EMPIRICAL_RADII) as SourceType[]).forEach(type => {
      SCALES.forEach(scale => {
        const r = EMPIRICAL_RADII[type][scale];
        rows.push({ type, scale, primary: r.primary, secondary: r.secondary, note: r.note });
      });
    });
    return rows;
  }, []);

  return (
    <TechCard icon={BookOpen} title="HJ/T 338-2007 经验半径参考表" badge="附录A">
      <p className="text-xs text-gw-muted mb-3">根据水源地类型和规模查表确定保护区经验半径。实际应用中应结合解析法和水文地质条件综合确定。</p>
      <FilterableTechTable
        headers={['水源地类型', '规模', '一级R(m)', '二级R(m)', '说明']}
        rows={allRows.map(r => [r.type, r.scale, String(r.primary), String(r.secondary), r.note])}
        filterPlaceholder="搜索类型或规模..."
      />
    </TechCard>
  );
}
