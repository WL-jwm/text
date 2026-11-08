/**
 * 拆分自 SystemZoning.tsx — 子区明细 Tab 面板
 */

import { useMemo } from 'react';
import { Layers, MapPin, GitBranch } from 'lucide-react';
import { systemZones, subZones } from '../../data/systemZoning';
import { TechCard, StatCard } from '../../components/UI';

export function SubZonesTab() {

  const totalSubZones = subZones.filter(z => z.type === '子区').length;
  const totalSubCells = subZones.filter(z => z.type === '小区').length;
  const subZoneByParent = useMemo(() => {
    const map: Record<string, number> = {};
    subZones.forEach(z => {
      const key = z.parentCode;
      map[key] = (map[key] || 0) + 1;
    });
    return systemZones.filter(z => (map[z.code] || 0) > 0).map(z => ({
      name: z.code,
      fullName: z.name,
      count: map[z.code],
    }));
  }, []);
  return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard title="子区总数" value={String(totalSubZones)} unit="个" icon={GitBranch} accent="blue" />
            <StatCard title="小区总数" value={String(totalSubCells)} unit="个" icon={Layers} accent="cyan" />
            <StatCard title="覆盖系统区" value={String(subZoneByParent.length)} unit="个" icon={MapPin} accent="emerald" />
          </div>

          <TechCard title={`子区/小区明细 (${subZones.length}个)`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">编号</th>
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">名称</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">级别</th>
                </tr></thead>
                <tbody>
                  {subZones.map((z, i) => (
                    <tr key={i} className="border-b border-gw-border/30 data-row">
                      <td className="py-2 px-2 text-xs font-mono text-gw-highlight">{z.parentCode}.{z.seq}</td>
                      <td className="py-2 px-2 text-xs text-gw-text">{z.name}</td>
                      <td className="py-2 px-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${z.type === '子区' ? 'bg-blue-500/15 text-blue-400' : 'bg-cyan-500/15 text-cyan-400'}`}>{z.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
  );
}
