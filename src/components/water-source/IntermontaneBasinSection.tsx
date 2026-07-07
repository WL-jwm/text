import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { intermontaneBasinStructures } from '../../data/waterSource';
import { TechCard, TechTable, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';

export function IntermontaneBasinSection() {
  const areaData = React.useMemo(() =>
    intermontaneBasinStructures.map(b => ({
      name: b.name.length > 5 ? b.name.slice(0, 5) : b.name,
      汇水面积: parseFloat(String(b.catchmentArea)) || 0,
      蓄水面积: parseFloat(String(b.storageArea)) || 0,
    })),
    []
  );

  return (
    <div className="space-y-4">
      <LazyChartCard title="山间盆地汇水与蓄水面积对比" badge="km²" className="scan-line" height={320}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={areaData} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'km²', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 10 } }} />
            <Tooltip content={<ChartTooltip title="面积" unit="km²" />} />
            <Bar dataKey="汇水面积" name="汇水面积" fill="#06b6d4" radius={[3, 3, 0, 0]} />
            <Bar dataKey="蓄水面积" name="蓄水面积" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="山间盆地蓄水构造" badge="山间盆地">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gw-muted mb-2">河北省主要山间盆地分布于张家口、唐山等地，为第四系冲洪积含水系统</p>
            <TechTable
              headers={['名称', '汇水面积(km2)', '蓄水面积(km2)', '深度(m)', '岩性']}
              rows={intermontaneBasinStructures.map(b => [
                b.name, b.catchmentArea, b.storageArea, b.depth,
                (b.lithology || '').length > 20 ? (b.lithology || '').slice(0, 20) + '...' : (b.lithology || '')
              ])}
              pageSize={10}
            />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/15">
              <p className="text-[10px] text-gw-muted">主要分布</p>
              <p className="text-xs text-gw-text">张家口盆地 / 蔚县-阳原盆地 / 遵化盆地 / 迁安盆地</p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/15">
              <p className="text-[10px] text-gw-muted">含水层特征</p>
              <p className="text-xs text-gw-text">第四系潜水-微承压，砾石卵石为主，埋深20~100m</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/15">
              <p className="text-[10px] text-gw-muted">典型水源地</p>
              <p className="text-xs text-gw-text">腰站堡 / 样台 / 沙岭子水源地(张家口)</p>
            </div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
