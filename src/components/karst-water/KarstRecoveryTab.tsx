import React from 'react';
import { RefreshCw, Timer, Droplets } from 'lucide-react';
import { karstSprings } from '../../data/karstWater';
import { TechCard, DataSourceNote } from '../UI';

const timelineEvents = [
  { year: '1960s', event: '天然流量鼎盛期', detail: '泉域大面积自流，平均流量 > 5 m³/s' },
  { year: '1980s', event: '开采量急剧增加', detail: '工农业用水需求上升，岩溶水超采加剧' },
  { year: '2000s', event: '多数泉域断流', detail: '娘子关/黑龙洞等大型泉域流量大幅衰减' },
  { year: '2015', event: '南水北调中线通水', detail: '替代水源引入，地下水开采量开始下降' },
  { year: '2020', event: '超采治理见效', detail: '地下水位普遍回升，部分泉域复涌迹象' },
  { year: '2024', event: '三大泉域复涌', detail: '邢台百泉/邯郸黑龙洞/石家庄威州泉恢复出流' },
];

export function KarstRecoveryTab() {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-gw-green/10 border border-gw-green/30">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw size={16} className="text-gw-green" />
          <h3 className="text-sm font-semibold text-gw-green">2024年三大泉域复涌</h3>
        </div>
        <p className="text-xs text-gw-muted">
          经过南水北调替代水源+超采综合治理，邢台百泉、邯郸黑龙洞、石家庄威州泉等历史名泉恢复出流，
          标志着河北省岩溶水生态修复取得重大突破。
        </p>
      </div>

      <TechCard title="泉域演变时间线" icon={Timer}>
        <div className="space-y-4">
          {timelineEvents.map((e, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${i === timelineEvents.length - 1 ? 'bg-gw-green shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gw-border'}`} />
                {i < timelineEvents.length - 1 && <div className="w-px flex-1 bg-gw-border/50" />}
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-gw-cyan">{e.year}</span>
                  <span className="text-xs font-medium text-gw-text">{e.event}</span>
                </div>
                <p className="text-[10px] text-gw-muted">{e.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </TechCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {karstSprings.filter(s => s.discharge !== '-' && parseFloat(s.discharge) >= 3).slice(0, 3).map((s, i) => (
          <TechCard key={i} title={s.name} badge={`${s.discharge} m³/s`} icon={Droplets}>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gw-muted">位置</span>
                <span className="text-gw-text">{s.location}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gw-muted">类型</span>
                <span className="text-gw-text">{s.type}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gw-muted">面积</span>
                <span className="text-gw-text">{s.area} km²</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gw-muted">岩性</span>
                <span className="text-gw-text text-[10px]">{s.lithology}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gw-muted">矿化度</span>
                <span className="text-gw-text">{s.tds} g/L</span>
              </div>
            </div>
          </TechCard>
        ))}
      </div>

      <DataSourceNote source="河北省生态环境厅新闻发布会(2025.7) + 水利部公告" version="2024年泉域恢复" />
    </div>
  );
}
