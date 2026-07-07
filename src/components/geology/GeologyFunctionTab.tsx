import React from 'react';
import { AlertTriangle, MapPin, TrendingUp } from 'lucide-react';
import { groundwaterFunctionZones, cityOverdraftZones, restrictedZones, waterLevelRecovery } from '../../data/groundwaterFunction';
import { TechCard, StatCard } from '../UI';
import { ChartExport } from '../ChartExport';

export function GeologyFunctionTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="超采区总面积" value="6.97" unit="万km²" icon={AlertTriangle} accent="red" />
        <StatCard title="浅层超采" value="3.67" unit="万km²" icon={MapPin} accent="amber" />
        <StatCard title="深层超采" value="4.22" unit="万km²" icon={MapPin} accent="orange" />
        <StatCard title="深层水位回升" value="9.67" unit="m(2019-2023)" icon={TrendingUp} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="地下水功能区划" badge="四区管理">
          <div className="mb-3 flex justify-end">
            <ChartExport data={groundwaterFunctionZones} filename="groundwater-function-zones" sheetName="功能区划" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <div className="space-y-2">
            {groundwaterFunctionZones.map((z, i) => (
              <div key={i} className="p-2.5 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gw-text">{z.zone}（{z.code}）</span>
                  <span className="text-[9px] text-gw-muted">{z.protectionTarget}</span>
                </div>
                <p className="text-[10px] text-gw-muted mt-0.5">{z.description}</p>
                <p className="text-[9px] text-gw-highlight mt-0.5">典型区域：{z.typicalArea}</p>
              </div>
            ))}
          </div>
        </TechCard>
        <TechCard title="水位回升动态（2019-2023）" badge="超采治理">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead><tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1 px-1">年份</th>
                <th className="text-gw-muted py-1 px-1">浅层埋深(m)</th>
                <th className="text-gw-muted py-1 px-1">深层埋深(m)</th>
                <th className="text-gw-muted py-1 px-1">浅层回升(m)</th>
                <th className="text-gw-muted py-1 px-1">深层回升(m)</th>
                <th className="text-left text-gw-muted py-1 px-1">备注</th>
              </tr></thead>
              <tbody>
                {waterLevelRecovery.annualData.map((d, i) => (
                  <tr key={i} className="border-b border-gw-border/20">
                    <td className="py-1 px-1 font-mono text-gw-text">{d.year}</td>
                    <td className="py-1 px-1 font-mono">{d.shallowDepth}</td>
                    <td className="py-1 px-1 font-mono">{d.deepDepth}</td>
                    <td className={`py-1 px-1 font-mono ${d.shallowRise > 0 ? 'text-emerald-400' : ''}`}>{d.shallowRise > 0 ? `+${d.shallowRise}` : '-'}</td>
                    <td className={`py-1 px-1 font-mono ${d.deepRise > 0 ? 'text-emerald-400' : ''}`}>{d.deepRise > 0 ? `+${d.deepRise}` : '-'}</td>
                    <td className="py-1 px-1 text-gw-muted">{d.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[9px] text-gw-muted mt-1">数据来源：{waterLevelRecovery.dataSource}</p>
        </TechCard>
      </div>

      <TechCard title="各市超采区类型与分布" badge="2022年公布">
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1 px-1.5">城市</th>
              <th className="text-gw-muted py-1 px-1.5">浅层超采</th>
              <th className="text-gw-muted py-1 px-1.5">深层超采</th>
              <th className="text-left text-gw-muted py-1 px-1.5">备注</th>
            </tr></thead>
            <tbody>
              {cityOverdraftZones.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1 px-1.5 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1 px-1.5">
                    <span className={`px-1 py-0.5 rounded text-[9px] ${c.shallowType === '—' ? 'text-gw-muted/40' : 'bg-amber-500/15 text-amber-400'}`}>{c.shallowType || '—'}</span>
                  </td>
                  <td className="py-1 px-1.5">
                    <span className={`px-1 py-0.5 rounded text-[9px] ${c.deepType === '—' ? 'text-gw-muted/40' : c.deepType === '严重超采区' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{c.deepType || '—'}</span>
                  </td>
                  <td className="py-1 px-1.5 text-gw-muted">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechCard title="禁止开采区" badge="4区">
          <div className="space-y-1.5">
            {restrictedZones.forbidden.map((z, i) => (
              <div key={i} className="p-2 bg-red-500/5 rounded border border-red-500/20">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold text-gw-text">{z.city}</span>
                  <span className="text-[9px] text-red-400">{z.status}</span>
                </div>
                <p className="text-[9px] text-gw-muted">{z.scope}</p>
                <p className="text-[9px] text-gw-muted/70">{z.reason}</p>
              </div>
            ))}
          </div>
        </TechCard>
        <TechCard title="限制开采区" badge="4区">
          <div className="space-y-1.5">
            {restrictedZones.limited.map((z, i) => (
              <div key={i} className="p-2 bg-amber-500/5 rounded border border-amber-500/20">
                <div className="flex justify-between">
                  <span className="text-[10px] font-semibold text-gw-text">{z.city}</span>
                  <span className="text-[9px] text-amber-400">{z.status}</span>
                </div>
                <p className="text-[9px] text-gw-muted">{z.scope}</p>
                <p className="text-[9px] text-gw-muted/70">{z.reason}</p>
              </div>
            ))}
          </div>
        </TechCard>
      </div>
    </div>
  );
}
