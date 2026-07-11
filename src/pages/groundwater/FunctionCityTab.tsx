import React from 'react';
import { TechCard } from '../../components/UI';
import { ChartExport } from '../../components/ChartExport';
import { cityOverdraftZones } from '../../data/groundwaterFunction';

interface FunctionCityTabProps {
  cityExportData: Record<string, string>[];
}

export function FunctionCityTab({ cityExportData }: FunctionCityTabProps) {
  return (
    <div className="space-y-4">
      <TechCard title="各市超采区类型与分布" badge="2022年公布">
        <div className="mb-3 flex justify-end">
          <ChartExport data={cityExportData} filename="各市超采区分布" sheetName="超采区" formats={['xlsx','csv','json']} label="导出数据" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-2 px-2">城市</th>
              <th className="text-gw-muted py-2 px-2">浅层超采</th>
              <th className="text-gw-muted py-2 px-2">深层超采</th>
              <th className="text-left text-gw-muted py-2 px-2">备注</th>
            </tr></thead>
            <tbody>
              {cityOverdraftZones.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="py-2 px-2 font-medium text-gw-text">{c.city}</td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      c.shallowType === '—' ? 'text-gw-muted/40' : 'bg-amber-500/15 text-amber-400'
                    }`}>{c.shallowType || '—'}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      c.deepType === '—' ? 'text-gw-muted/40' :
                      c.deepType === '严重超采区' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                    }`}>{c.deepType || '—'}</span>
                  </td>
                  <td className="py-2 px-2 text-gw-muted text-[10px]">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="浅层超采区范围明细">
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-2">城市</th>
              <th className="text-left text-gw-muted py-1.5 px-2">浅层超采范围</th>
            </tr></thead>
            <tbody>
              {cityOverdraftZones.filter(c => c.shallowType !== '—').map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1.5 px-2 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1.5 px-2 text-gw-muted">{c.shallowArea}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="深层超采区范围明细">
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-2">城市</th>
              <th className="text-left text-gw-muted py-1.5 px-2">深层超采范围</th>
              <th className="text-gw-muted py-1.5 px-2">类型</th>
            </tr></thead>
            <tbody>
              {cityOverdraftZones.filter(c => c.deepType !== '—').map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1.5 px-2 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1.5 px-2 text-gw-muted">{c.deepArea}</td>
                  <td className="py-1.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                      c.deepType === '严重超采区' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                    }`}>{c.deepType}</span>
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
