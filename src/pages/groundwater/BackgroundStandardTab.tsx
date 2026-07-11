import React from 'react';
import { TechCard } from '../../components/UI';
import { waterQualityStandard } from '../../data/backgroundValues';

export function BackgroundStandardTab() {
  return (
    <div className="space-y-4">
      <TechCard title="地下水质量标准限值对照" badge={waterQualityStandard.standard}>
        <p className="text-[10px] text-gw-muted mb-3">地下水质量分类标准（GB/T 14848-2017），用于背景值超标判定</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-1.5">指标</th>
              <th className="text-gw-muted py-1.5 px-1.5">Ⅰ/Ⅱ类</th>
              <th className="text-gw-muted py-1.5 px-1.5">Ⅲ类</th>
              <th className="text-gw-muted py-1.5 px-1.5">Ⅳ类</th>
              <th className="text-gw-muted py-1.5 px-1.5">Ⅴ类</th>
              <th className="text-gw-muted py-1.5 px-1.5">单位</th>
            </tr></thead>
            <tbody>
              {waterQualityStandard.indicators.map((ind, i) => (
                <tr key={i} className="border-b border-gw-border/20 data-row">
                  <td className="py-1.5 px-1.5 font-medium text-gw-text">{ind.name}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{ind.I_II}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{ind.III}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{ind.IV}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{ind.V}</td>
                  <td className="py-1.5 px-1.5 text-gw-muted text-center">{ind.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="质量分类说明">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {waterQualityStandard.classes.map((cls, i) => (
            <div key={i} className={`p-2.5 rounded-lg border ${
              i === 0 ? 'border-blue-500/30 bg-blue-500/5' :
              i === 1 ? 'border-emerald-500/30 bg-emerald-500/5' :
              i === 2 ? 'border-amber-500/30 bg-amber-500/5' :
              i === 3 ? 'border-orange-500/30 bg-orange-500/5' :
              'border-red-500/30 bg-red-500/5'
            }`}>
              <span className={`text-xs font-bold ${
                i === 0 ? 'text-blue-400' :
                i === 1 ? 'text-emerald-400' :
                i === 2 ? 'text-amber-400' :
                i === 3 ? 'text-orange-400' :
                'text-red-400'
              }`}>{cls.class}</span>
              <p className="text-[9px] text-gw-muted mt-1">{cls.description}</p>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
