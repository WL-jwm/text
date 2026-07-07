import React from 'react';
import { Clock, Layers, MapPin, BookOpen } from 'lucide-react';
import { geologicalHistory, plainEvolution } from '../../data/geology';
import { TechCard, StatCard } from '../UI';

export function GeologyHistoryTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="地质历史" value=">35亿年" unit="" icon={Clock} accent="amber" />
        <StatCard title="演化阶段" value="3" unit="大阶段" icon={Layers} accent="blue" />
        <StatCard title="关键事件" value="12" unit="个" icon={MapPin} accent="green" />
        <StatCard title="数据来源" value="区域地质志" unit="1982" icon={BookOpen} accent="cyan" />
      </div>

      <p className="text-[10px] text-gw-muted leading-relaxed">{geologicalHistory.summary}</p>

      {geologicalHistory.stages.map((stage, si) => (
        <TechCard key={si} title={`${stage.stage}（${stage.period}）`} badge={stage.tectonic}>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-1.5 bg-gw-surface/50 rounded text-[10px]">
                <span className="text-gw-muted">岩浆活动：</span>
                <span className="text-gw-text">{stage.magmatism}</span>
              </div>
              <div className="p-1.5 bg-gw-surface/50 rounded text-[10px]">
                <span className="text-gw-muted">变质作用：</span>
                <span className="text-gw-text">{stage.metamorphism}</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gw-border/30" />
              <div className="space-y-2 pl-6">
                {stage.events.map((evt, ei) => (
                  <div key={ei} className="relative">
                    <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-gw-highlight/30 border-2 border-gw-highlight" />
                    <div className="p-2 bg-gw-surface/50 rounded border border-gw-border/20">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-mono text-gw-cyan bg-gw-cyan/10 px-1 py-0.5 rounded">{evt.time}</span>
                      </div>
                      <p className="text-[10px] text-gw-text">{evt.event}</p>
                      <p className="text-[8px] text-gw-muted mt-0.5">依据：{evt.evidence}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TechCard>
      ))}

      <TechCard title="河北平原形成演化" badge="四阶段">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1 px-1.5">阶段</th>
              <th className="text-left text-gw-muted py-1 px-1.5">时间</th>
              <th className="text-left text-gw-muted py-1 px-1.5">构造特征</th>
              <th className="text-left text-gw-muted py-1 px-1.5">沉积建造</th>
            </tr></thead>
            <tbody>
              {plainEvolution.stages.map((s, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1 px-1.5 font-medium text-gw-text">{s.stage}</td>
                  <td className="py-1 px-1.5 font-mono text-gw-cyan">{s.time}</td>
                  <td className="py-1 px-1.5 text-gw-muted">{s.feature}</td>
                  <td className="py-1 px-1.5 text-gw-muted">{s.deposition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
