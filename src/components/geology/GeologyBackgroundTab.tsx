import React from 'react';
import { MapPin, FlaskConical, Layers, BookOpen } from 'lucide-react';
import { groundwaterBackground, cityExceedanceFactors, waterQualityStandard } from '../../data/backgroundValues';
import { TechCard, StatCard } from '../UI';
import { ChartExport } from '../ChartExport';

export function GeologyBackgroundTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="水文地质分区" value="3" unit="个(山前/中部/滨海)" icon={MapPin} accent="blue" />
        <StatCard title="评价指标" value="16" unit="项" icon={FlaskConical} accent="cyan" />
        <StatCard title="标准分类" value="5" unit="类(Ⅰ~Ⅴ)" icon={Layers} accent="green" />
        <StatCard title="数据来源" value="监测院" unit="" icon={BookOpen} accent="amber" />
      </div>

      <TechCard title="浅层地下水化学背景值（按水文地质分区）" badge="mg/L">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[9px]">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1 px-1">指标</th>
              <th className="text-gw-muted py-1 px-1">山前平原</th>
              <th className="text-gw-muted py-1 px-1">中部平原</th>
              <th className="text-gw-muted py-1 px-1">滨海平原</th>
            </tr></thead>
            <tbody>
              {(() => {
                const rows = [
                  { k: 'pH', l: 'pH' }, { k: 'TDS', l: 'TDS' }, { k: 'totalHardness', l: '总硬度' },
                  { k: 'Cl', l: 'Cl⁻' }, { k: 'SO4', l: 'SO₄²⁻' }, { k: 'HCO3', l: 'HCO₃⁻' },
                  { k: 'Na', l: 'Na⁺' }, { k: 'Ca', l: 'Ca²⁺' }, { k: 'Mg', l: 'Mg²⁺' },
                  { k: 'NO3', l: 'NO₃⁻' }, { k: 'F', l: 'F⁻' }, { k: 'Fe', l: 'Fe' }, { k: 'Mn', l: 'Mn' },
                ];
                const s0 = groundwaterBackground.shallow[0] as Record<string, string | undefined>;
                const s1 = groundwaterBackground.shallow[1] as Record<string, string | undefined>;
                const s2 = groundwaterBackground.shallow[2] as Record<string, string | undefined>;
                return rows.map(r => (
                  <tr key={r.k} className="border-b border-gw-border/20">
                    <td className="py-1 px-1 font-medium text-gw-text">{r.l}</td>
                    <td className="py-1 px-1 font-mono">{s0[r.k] || '-'}</td>
                    <td className="py-1 px-1 font-mono">{s1[r.k] || '-'}</td>
                    <td className="py-1 px-1 font-mono">{s2[r.k] || '-'}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-1">
          {groundwaterBackground.shallow.map((z, i) => (
            <span key={i} className="text-[8px] text-gw-muted">{z.zone}：{z.waterType}</span>
          ))}
        </div>
      </TechCard>

      <TechCard title="各市地下水主要超标因子" badge="2024">
        <div className="mb-3 flex justify-end">
          <ChartExport data={cityExceedanceFactors} filename="city-exceedance-factors" sheetName="超标因子" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1 px-1.5">城市</th>
              <th className="text-left text-gw-muted py-1 px-1.5">浅层超标因子</th>
              <th className="text-left text-gw-muted py-1 px-1.5">深层超标因子</th>
              <th className="text-left text-gw-muted py-1 px-1.5">说明</th>
            </tr></thead>
            <tbody>
              {cityExceedanceFactors.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1 px-1.5 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1 px-1.5 text-gw-muted">{c.shallow}</td>
                  <td className="py-1 px-1.5 text-gw-muted">{c.deep}</td>
                  <td className="py-1 px-1.5 text-gw-muted/70">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="地下水质量标准限值（GB/T 14848-2017）" badge="mg/L">
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[9px]">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1 px-1">指标</th>
              <th className="text-gw-muted py-1 px-1">Ⅰ-Ⅱ类</th>
              <th className="text-gw-muted py-1 px-1">Ⅲ类</th>
              <th className="text-gw-muted py-1 px-1">Ⅳ类</th>
              <th className="text-gw-muted py-1 px-1">Ⅴ类</th>
              <th className="text-gw-muted py-1 px-1">单位</th>
            </tr></thead>
            <tbody>
              {waterQualityStandard.indicators.map((ind, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1 px-1 font-medium text-gw-text">{ind.name}</td>
                  <td className="py-1 px-1 font-mono text-emerald-400">{ind.I_II}</td>
                  <td className="py-1 px-1 font-mono text-blue-400">{ind.III}</td>
                  <td className="py-1 px-1 font-mono text-amber-400">{ind.IV}</td>
                  <td className="py-1 px-1 font-mono text-red-400">{ind.V}</td>
                  <td className="py-1 px-1 text-gw-muted">{ind.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
