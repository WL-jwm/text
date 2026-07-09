// RadarComparePanel
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import React, { useMemo } from 'react';
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TechCard } from '../components/UI';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { cityExploitationYearly } from '../data/exploitation';
import { cityGroundwaterDynamic2024 } from '../data/resources-bulletin';
import { cityWaterSupply2024 } from '../data/resources-core';
import { cityQualityTrend } from '../data/waterQuality';
import { CITY_COLORS, ALL_CITIES} from './timeSeriesUtils';

export function RadarComparePanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  // 雷达图数据准备：归一化到0-100
  const radarData = useMemo(() => {
    const dimensions = ['开采量(亿m³)', '水质达标率(%)', '浅层埋深(%)', '供水总量(%)', '减采率(%)'];
    // 获取各维度最大值用于归一化
    const maxExploit = Math.max(...ALL_CITIES.map(c => cityExploitationYearly[c]?.[2024] ?? 0));
    const maxSupply = Math.max(...cityWaterSupply2024.map(c => c.totalSupply));
    const maxReduction = Math.max(...ALL_CITIES.map(c => {
      const d14 = cityExploitationYearly[c]?.[2014] ?? 0;
      const d24 = cityExploitationYearly[c]?.[2024] ?? 0;
      return d14 > 0 ? (d14 - d24) / d14 * 100 : 0;
    }));
    const maxDepth = Math.max(...cityGroundwaterDynamic2024.filter(c => c.shallowDepth !== null).map(c => c.shallowDepth ?? 0));

    return dimensions.map(dim => {
      const point: Record<string, string | number> = { dimension: dim };
      cities.forEach(city => {
        let value = 0;
        switch (dim) {
          case '开采量(亿m³)':
            value = (cityExploitationYearly[city]?.[2024] ?? 0) / maxExploit * 100;
            break;
          case '水质达标率(%)': {
            const q = cityQualityTrend.find(c => c.city === city);
            value = q ? q.y2024 : 0;
            break;
          }
          case '浅层埋深(%)': {
            const w = cityGroundwaterDynamic2024.find(c => c.city === city);
            value = w && w.shallowDepth !== null ? w.shallowDepth / maxDepth * 100 : 0;
            break;
          }
          case '供水总量(%)': {
            const s = cityWaterSupply2024.find(c => c.city === city);
            value = s ? s.totalSupply / maxSupply * 100 : 0;
            break;
          }
          case '减采率(%)': {
            const d14 = cityExploitationYearly[city]?.[2014] ?? 0;
            const d24 = cityExploitationYearly[city]?.[2024] ?? 0;
            value = d14 > 0 ? (d14 - d24) / d14 * 100 / maxReduction * 100 : 0;
            break;
          }
        }
        point[city] = parseFloat(value.toFixed(1));
      });
      return point;
    });
  }, [cities]);

  return (
    <div className="space-y-4">
      <TechCard title="多维度城市综合指标雷达图" badge={`${cities.length}市`} className="hud-corners">
        {cities.length === 0 || cities.length > 6 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">
            {cities.length === 0 ? '请选择城市' : '雷达图最多对比6个城市'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <PolarRadiusAxis angle={72} domain={[0, 100]} tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              {cities.map(city => (
                <Radar
                  key={city}
                  name={city}
                  dataKey={city}
                  stroke={CITY_COLORS[city]}
                  fill={CITY_COLORS[city]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 综合指标对比表 */}
      {cities.length > 0 && (
        <TechCard title="城市综合指标对比" badge="2024年">
          <FilterableTechTable
            headers={['城市', '开采量(亿m³)', '水质达标率(%)', '浅层埋深(m)', '供水总量(亿m³)', '减采率(%)', '地下水占比(%)']}
            rows={cities.map(city => {
              const exploit = cityExploitationYearly[city]?.[2024] ?? 0;
              const quality = cityQualityTrend.find(c => c.city === city)?.y2024 ?? 0;
              const depth = cityGroundwaterDynamic2024.find(c => c.city === city)?.shallowDepth ?? null;
              const supply = cityWaterSupply2024.find(c => c.city === city);
              const d14 = cityExploitationYearly[city]?.[2014] ?? 0;
              const reduction = d14 > 0 ? ((d14 - exploit) / d14 * 100).toFixed(1) : '—';
              return [
                city, exploit.toFixed(1), quality, depth?.toFixed(1) ?? '—',
                supply?.totalSupply.toFixed(2) ?? '—', reduction,
                supply?.gwRatio.toFixed(1) ?? '—',
              ];
            })}
            pageSize={10}
          />
        </TechCard>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 主页面组件
// ═══════════════════════════════════════════════════════════
// ── 报告数据采集函数 ──
