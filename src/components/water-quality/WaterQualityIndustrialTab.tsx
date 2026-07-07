import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { industrialWaterQuality } from '../../data/waterQuality';
import { TechCard, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';

export function WaterQualityIndustrialTab() {
  // 雷达图数据：将垢系数/腐蚀系数/起泡系数归一化为0-100评分
  const radarData = React.useMemo(() => {
    const cities = ['石家庄', '唐山', '秦皇岛', '邯郸', '保定', '沧州', '廊坊', '衡水'];
    const dims = ['垢系数', '腐蚀系数', '起泡系数'];
    // 评分规则：数值越低越好，取倒数归一化
    const maxScale = Math.max(...industrialWaterQuality.map(c => c.scale || 0));
    const maxCorr = Math.max(...industrialWaterQuality.map(c => c.corrosion || 0));
    const maxFoam = Math.max(...industrialWaterQuality.map(c => c.foam || 0));
    return dims.map(dim => {
      const entry: Record<string, unknown> = { dimension: dim };
      cities.forEach(city => {
        const item = industrialWaterQuality.find(c => c.city === city);
        if (!item) { entry[city] = 50; return; }
        let val = 50;
        if (dim === '垢系数') val = Math.round((1 - item.scale / maxScale) * 100);
        else if (dim === '腐蚀系数') val = Math.round((1 - item.corrosion / maxCorr) * 100);
        else if (dim === '起泡系数') val = Math.round((1 - item.foam / maxFoam) * 100);
        entry[city] = Math.max(10, val);
      });
      return entry;
    });
  }, []);

  // 气泡图数据：垢系数 vs 腐蚀系数，气泡大小=起泡系数
  const bubbleData = React.useMemo(() =>
    industrialWaterQuality.map(c => ({
      name: c.city,
      scale: c.scale || 0,
      corrosion: c.corrosion || 0,
      foam: c.foam || 0,
      rating: c.rating,
    })),
    []
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="工业用水水质评价雷达图" badge="8城市 · 3维度" className="hud-corners" height={320}>
          <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted flex-wrap">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" />石家庄</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />唐山</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" />秦皇岛</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />邯郸</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />保定</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />沧州</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" />廊坊</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-lime-400" />衡水</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(6,182,212,0.12)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              <Radar name="石家庄" dataKey="石家庄" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.08} strokeWidth={2} />
              <Radar name="唐山" dataKey="唐山" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.08} strokeWidth={2} />
              <Radar name="秦皇岛" dataKey="秦皇岛" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.08} strokeWidth={2} />
              <Radar name="邯郸" dataKey="邯郸" stroke="#ef4444" fill="#ef4444" fillOpacity={0.08} strokeWidth={2} />
              <Radar name="保定" dataKey="保定" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeWidth={2} />
              <Radar name="沧州" dataKey="沧州" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.08} strokeWidth={2} />
              <Radar name="廊坊" dataKey="廊坊" stroke="#ec4899" fill="#ec4899" fillOpacity={0.08} strokeWidth={2} />
              <Radar name="衡水" dataKey="衡水" stroke="#84cc16" fill="#84cc16" fillOpacity={0.08} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip title="工业用水评分" />} />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-[9px] text-gw-muted mt-1">评分越高越好：垢系数/腐蚀系数/起泡系数越低则评分越高</p>
        </LazyChartCard>

        <LazyChartCard title="垢系数 vs 腐蚀系数" badge="气泡大小=起泡系数" className="scan-line" height={320}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={bubbleData} filename="工业用水-垢系数腐蚀系数" sheetName="工业用水" formats={['xlsx','csv','json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bubbleData} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip title="工业用水指标" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="scale" name="垢系数" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              <Bar dataKey="corrosion" name="腐蚀系数" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="foam" name="起泡系数" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="各市工业用水水质评价明细">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-2 px-3 text-xs">城市</th>
              <th className="text-gw-muted py-2 px-3 text-xs">垢系数</th>
              <th className="text-gw-muted py-2 px-3 text-xs">腐蚀系数</th>
              <th className="text-gw-muted py-2 px-3 text-xs">起泡系数</th>
              <th className="text-gw-muted py-2 px-3 text-xs">评价</th>
              <th className="text-gw-muted py-2 px-3 text-xs">特征</th>
            </tr></thead>
            <tbody>
              {industrialWaterQuality.map((c: any, i: number) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="py-2 px-3 text-xs text-gw-text">{c.city}</td>
                  <td className="py-2 px-3 font-mono text-xs text-gw-cyan">{c.scale}</td>
                  <td className="py-2 px-3 font-mono text-xs">{c.corrosion}</td>
                  <td className="py-2 px-3 font-mono text-xs">{c.foam}</td>
                  <td className={`py-2 px-3 text-xs font-medium ${c.rating === '较差' ? 'text-red-400' : 'text-amber-400'}`}>{c.rating}</td>
                  <td className="py-2 px-3 text-xs text-gw-muted">{c.feature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
