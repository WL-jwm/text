import React from 'react';
import { TechCard } from '../../components/UI';
import { shallowWaterQualityByClass, wastewaterDischarge1999 } from '../../data/groundwaterResources';

export function BalanceQualityTab() {
  return (
    <div className="space-y-4">
      <TechCard title="浅层地下水质量分类" badge="GB/T 14848-2017">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-gw-border">
              <th className="text-gw-muted py-1.5 px-2">类别</th>
              <th className="text-left text-gw-muted py-1.5 px-2">分布范围</th>
              <th className="text-gw-muted py-1.5 px-2">占比(%)</th>
              <th className="text-left text-gw-muted py-1.5 px-2">特征描述</th>
            </tr></thead>
            <tbody>
              {shallowWaterQualityByClass.map((q, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      q.class === 'Ⅰ类' ? 'bg-blue-500/15 text-blue-400' :
                      q.class === 'Ⅱ类' ? 'bg-emerald-500/15 text-emerald-400' :
                      q.class === 'Ⅲ类' ? 'bg-amber-500/15 text-amber-400' :
                      q.class === 'Ⅳ类' ? 'bg-orange-500/15 text-orange-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>{q.class}</span>
                  </td>
                  <td className="py-1.5 px-2 text-gw-muted text-[10px]">{q.area}</td>
                  <td className="py-1.5 px-2 font-mono text-center">{q.percent}</td>
                  <td className="py-1.5 px-2 text-gw-muted text-[10px]">{q.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="废污水排放量（1999年）" badge={`总计 ${wastewaterDischarge1999.total} 亿t/a`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-gw-muted mb-1">排放构成</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                <span className="text-xs text-gw-text">工业废水</span>
                <span className="text-sm font-bold text-blue-400">{wastewaterDischarge1999.industrial} 亿t/a</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                <span className="text-xs text-gw-text">生活污水</span>
                <span className="text-sm font-bold text-amber-400">{wastewaterDischarge1999.domestic} 亿t/a</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gw-muted mb-1">流域分布</p>
            <div className="space-y-2">
              {wastewaterDischarge1999.byBasin.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                  <span className="text-xs text-gw-text">{b.basin}</span>
                  <span className="text-sm font-bold text-gw-highlight">{b.amount} 亿t/a ({b.percent}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
