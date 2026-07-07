import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ComposedChart, Line } from 'recharts';
import { Atom, Droplets } from 'lucide-react';
import { isotopeData, isotopeSamples, delta18OPathway, carbon14AgeDepth } from '../../data/hydrochemistry';
import { StatCard, TechCard, TechTable, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';

import type { IsoPoint } from '../../types/county';

interface Props {
  isoShallow: IsoPoint[];
  isoMid: IsoPoint[];
  isoDeep: IsoPoint[];
  isoKarst: IsoPoint[];
}

export function HydrochemIsotopeTab({ isoShallow, isoMid, isoDeep, isoKarst }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="降水线斜率" value="7.2" icon={Atom} accent="blue" />
        <StatCard title="浅层氚" value="3~20" unit="TU" icon={Droplets} accent="cyan" />
        <StatCard title="深层氚" value="<1" unit="TU" icon={Droplets} accent="amber" />
        <StatCard title="深层14C年龄" value="1~3" unit="万年" icon={Atom} accent="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechCard title="环境同位素数据" badge="示踪技术">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <h3 className="text-xs font-semibold text-gw-text">大气降水线</h3>
              <p className="text-[10px] text-gw-muted mt-1">{isotopeData.stableIsotopes.dewLine.description}</p>
              <p className="text-[10px] text-gw-highlight mt-1">河北: δD = {isotopeData.stableIsotopes.dewLine.slope}δ18O + {isotopeData.stableIsotopes.dewLine.intercept} | {isotopeData.stableIsotopes.dewLine.implications}</p>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <h3 className="text-xs font-semibold text-gw-text">氚(3H)</h3>
              <p className="text-[10px] text-gw-muted mt-1">{isotopeData.stableIsotopes.tritium.description}</p>
              <p className="text-[10px] text-gw-muted">浅层: {isotopeData.stableIsotopes.tritium.shallowWater}</p>
              <p className="text-[10px] text-gw-muted">深层: {isotopeData.stableIsotopes.tritium.deepWater} | {isotopeData.stableIsotopes.tritium.rechargeTime}</p>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <h3 className="text-xs font-semibold text-gw-text">碳-14(14C)</h3>
              <p className="text-[10px] text-gw-muted mt-1">{isotopeData.stableIsotopes.carbon14.description}</p>
              <p className="text-[10px] text-gw-muted">浅层: {isotopeData.stableIsotopes.carbon14.shallowUnconfined}</p>
              <p className="text-[10px] text-gw-muted">深层: {isotopeData.stableIsotopes.carbon14.deepConfined} | {isotopeData.stableIsotopes.carbon14.implication}</p>
            </div>
          </div>
        </TechCard>
        <TechCard title="同位素分区特征">
          <TechTable headers={['分区', 'δ18O', 'δD', '3H(TU)', '年龄', '补给来源']}
            rows={isotopeData.isotopicZoning.map((z) => [z.zone, z.delta18O, z.deltaD, z.tritium, z.age, z.recharge])}
          />
        </TechCard>
      </div>

      <LazyChartCard title="δD-δ18O关系图(环境同位素示踪)" className="hud-corners" height={350}>
        <div className="flex items-center gap-4 text-[10px] text-gw-muted mb-2 flex-wrap">
          <span className="text-cyan-400">浅层潜水(现代水)</span>
          <span className="text-amber-400">中层承压(混合水)</span>
          <span className="text-red-400">深层承压(古水)</span>
          <span className="text-purple-400">岩溶水</span>
          <span className="text-emerald-400">虚线=河北降水线(LMWL)</span>
          <span className="text-blue-400">点线=全球降水线(GMWL)</span>
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="x" type="number" name="δ18O" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'δ18O (‰)', position: 'insideBottom', offset: -10, style: { fill: '#8b9dc3', fontSize: 10 } }} domain={[-12, -3]} />
            <YAxis dataKey="y" type="number" name="δD" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'δD (‰)', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 10 } }} domain={[-85, -25]} />
            <Tooltip content={<ChartTooltip title="同位素" />} cursor={{ strokeDasharray: '3 3' }} />
            <ZAxis range={[40, 120]} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine segment={[{ x: -12, y: 7.2 * (-12) + 4.5 }, { x: -3, y: 7.2 * (-3) + 4.5 }]} stroke="#22c55e" strokeDasharray="8 4" strokeWidth={2} label={{ value: 'LMWL河北', position: 'top', fill: '#22c55e', fontSize: 10 }} />
            <ReferenceLine segment={[{ x: -12, y: 8 * (-12) + 10 }, { x: -3, y: 8 * (-3) + 10 }]} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'GMWL全球', position: 'bottom', fill: '#3b82f6', fontSize: 9 }} />
            <Scatter name="浅层潜水" data={isoShallow} fill="#06b6d4" />
            <Scatter name="中层承压" data={isoMid} fill="#f59e0b" />
            <Scatter name="深层承压(古水)" data={isoDeep} fill="#ef4444" />
            <Scatter name="岩溶水" data={isoKarst} fill="#8b5cf6" />
          </ScatterChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="δ18O沿径向路径变化(山前→滨海)" height={300}>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={delta18OPathway} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="distance" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '距山前距离(km)', position: 'insideBottom', offset: -5, style: { fill: '#8b9dc3', fontSize: 10 } }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[-11, -4]} label={{ value: 'δ18O (‰)', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 10 } }} />
              <Tooltip content={<ChartTooltip unit="‰" title="δ18O" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="delta18O_shallow" name="浅层水" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="delta18O_deep" name="深层水" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} strokeDasharray="4 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="14C年龄-深度关系" height={300}>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={carbon14AgeDepth} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="depth" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '深度(m)', position: 'insideBottom', offset: -5, style: { fill: '#8b9dc3', fontSize: 10 } }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '14C年龄(年BP)', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 10 } }} />
              <Tooltip content={<ChartTooltip title="14C年龄" />} />
              <Line type="monotone" dataKey="age" name="14C年龄" stroke="#8b5cf6" strokeWidth={2.5}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <g key={payload.depth}>
                      <circle cx={cx} cy={cy} r={5} fill="#8b5cf6" stroke="#fff" strokeWidth={1.5} />
                      <text x={cx + 8} y={cy - 5} fill="#8b9dc3" fontSize={8}>{payload.type}</text>
                    </g>
                  );
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="典型同位素采样点数据" badge="21个样品">
        <FilterableTechTable headers={['编号', '位置', '深度(m)', '类型', 'δ18O(‰)', 'δD(‰)', '3H(TU)', '年龄', '分区', '补给来源']}
          rows={isotopeSamples.map((s) => [
            s.id, s.location, String(s.depth),
            s.type === 'shallow' ? '浅层' : s.type === 'mid' ? '中层' : s.type === 'deep' ? '深层' : '岩溶',
            s.delta18O.toFixed(1), s.deltaD.toFixed(0), s.tritium.toFixed(1),
            s.age, s.zone, s.recharge,
          ])}
          pageSize={10}
          filterPlaceholder="搜索位置..."
        />
      </TechCard>

      <TechCard title="同位素水文地质意义" badge="示踪解读">
        <div className="space-y-2">
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">补给高程效应：</span>δ18O随高程降低约-0.3‰/100m，可用于确定山区地下水补给区和补给高程。太行山补给区高程约800~1500m。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">古水识别：</span>深层承压水3H&lt;1TU表明不含核试验时期补给，为末次冰期(1~3万年前)入渗的古水，更新周期极长。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">超采指示：</span>深层水14C测年1~3万年，说明超采消耗的是数万年积累的静态储量，一旦消耗难以在人类时间尺度内恢复。</p>
        </div>
      </TechCard>
    </div>
  );
}
