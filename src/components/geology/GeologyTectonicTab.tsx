import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Grid3X3, ArrowDownToLine, Mountain } from 'lucide-react';
import { tectonicUnits, tectonicUnitsDetailed, majorFaults } from '../../data/geology';
import { TechCard, StatCard, ChartTooltip, CHART_COLORS } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import type { TectonicUnitItem } from '../../types/geology';

export function GeologyTectonicTab() {
  const tectonicPie = useMemo(() => tectonicUnits.map((t, i) => ({
    name: t.unit.length > 8 ? t.unit.slice(0, 8) : t.unit,
    value: parseFloat(t.area.replace('~', '').replace('km²', '').replace(',', '')) || 10000,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="构造单元" value="4" unit="个大区" icon={Grid3X3} accent="blue" />
        <StatCard title="平原沉降区" value="8.3" unit="万km²" icon={ArrowDownToLine} accent="cyan" />
        <StatCard title="太行山隆起" value="2.6" unit="万km²" icon={Mountain} accent="green" />
        <StatCard title="燕山隆起" value="3.4" unit="万km²" icon={Mountain} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="构造单元面积分布" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={tectonicPie} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {tectonicPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip unit="km²" title="面积数据" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <TechCard title="构造单元特征卡片">
          <div className="space-y-3">
            {tectonicUnits.map((t, i) => (
              <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <p className="text-xs font-semibold text-gw-text">{t.unit}</p>
                <p className="text-[10px] text-gw-muted mt-0.5">{t.area} | {t.structure}</p>
                <p className="text-[10px] text-gw-muted/70">{t.features}</p>
                <p className="text-[10px] text-gw-highlight mt-1">含水特征：{t.aquiferCharacteristics}</p>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      <TechCard title="构造控水特征分析" badge="地质构造">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">断裂控水规律：</span>NE向太行山前断裂带控制山前倾斜平原冲洪积扇发育，是岩溶水向平原区排泄的主要通道。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">断块控水：</span>冀中台陷与沧县隆起之间的断块差异升降，形成地堑式蓄水构造，第四系沉积厚度差异大（200~600m）。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">褶皱控水：</span>太行山背斜轴部碳酸盐岩出露区，岩溶发育强烈，形成大型泉域（如黑龙洞泉域、百泉泉域）。</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">岩浆岩控水：</span>燕山期侵入岩体阻水作用明显，在接触带形成地下水位壅高和温泉出露（如赤城温泉、遵化温泉）。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">新构造运动：</span>第四纪以来持续沉降，控制平原区沉积相序和含水层空间展布。全新世海侵影响滨海区深层水水质。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">基底构造：</span>前寒武纪结晶基底起伏控制了新生界沉积厚度，间接影响深部热水资源的分布。</p>
          </div>
        </div>
      </TechCard>

      <TechCard title="构造单元详表（Ⅰ~Ⅲ级）" badge="详表">
        <div className="mb-3 flex justify-end">
          <ChartExport data={tectonicUnitsDetailed} filename="tectonic-units" sheetName="构造单元" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">级</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">名称</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">代码</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">说明</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">边界/特征</th>
              </tr>
            </thead>
            <tbody>
              {(tectonicUnitsDetailed as TectonicUnitItem[]).flatMap((t: TectonicUnitItem) => [
                { level: t.level, name: t.name, code: t.code, description: t.description, boundary: t.boundary || '', indent: 0 },
                ...(t.subUnits || []).flatMap((s: TectonicUnitItem) => [
                  { level: s.level, name: s.name, code: s.code, description: s.description, boundary: s.boundary || '', indent: 1 },
                  ...(s.subUnits || []).map((ss: TectonicUnitItem) => ({ level: ss.level, name: ss.name, code: ss.code, description: ss.description, boundary: ss.boundary || '', indent: 2 })),
                ]),
              ]).map((item, i) => (
                <tr key={i} className={`border-b border-gw-border/30 data-row ${item.indent === 0 ? 'bg-gw-surface/30' : ''}`}>
                  <td className="py-1.5 px-2 text-xs font-mono text-gw-muted">{item.level}</td>
                  <td className="py-1.5 px-2 text-xs font-medium text-gw-text" style={{ paddingLeft: `${8 + item.indent * 16}px` }}>{item.name}</td>
                  <td className="py-1.5 px-2 text-xs font-mono text-gw-cyan">{item.code}</td>
                  <td className="py-1.5 px-2 text-xs text-gw-muted">{item.description}</td>
                  <td className="py-1.5 px-2 text-xs text-gw-muted/70">{item.boundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="主要断裂构造" badge="断裂">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">断裂名称</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">走向</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">长度</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">类型</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">特征</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">水文地质意义</th>
            </tr></thead>
            <tbody>
              {majorFaults.map((f, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="py-1.5 px-2 text-xs font-medium text-gw-text">{f.name}</td>
                  <td className="py-1.5 px-2 text-xs text-gw-muted">{f.direction}</td>
                  <td className="py-1.5 px-2 text-xs font-mono text-gw-highlight">{f.length}</td>
                  <td className="py-1.5 px-2 text-xs"><span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400">{f.type}</span></td>
                  <td className="py-1.5 px-2 text-xs text-gw-muted">{f.feature}</td>
                  <td className="py-1.5 px-2 text-xs text-gw-highlight">{f.hydrogeology}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
