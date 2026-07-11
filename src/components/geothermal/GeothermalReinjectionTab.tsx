import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Recycle, Droplets, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { reinjectionDataExtended, geothermalReinjection } from '../../data/geothermal';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { ChartRefLines } from '../ChartAnnotation';
import { FilterableTechTable } from '../FilterableTechTable';


export function GeothermalReinjectionTab() {
  const totalWells = reinjectionDataExtended.reduce((s, r) => s + r.wells, 0);
  const totalProduction = reinjectionDataExtended.reduce((s, r) => s + r.production, 0);
  const totalReinjection = reinjectionDataExtended.reduce((s, r) => s + r.reinjection, 0);
  const avgRate = reinjectionDataExtended.reduce((s, r) => s + r.reinjectionRate, 0) / reinjectionDataExtended.length;

  // 回灌率对比数据
  const rateData = useMemo(() =>
    reinjectionDataExtended.map(r => ({
      name: r.field.replace('地热田', ''),
      '回灌率(%)': r.reinjectionRate,
      '政策目标(%)': 90,
    })),
  []);

  // 采灌井比例堆叠数据
  const wellPie = useMemo(() => [
    { name: '生产井', value: totalProduction },
    { name: '回灌井', value: totalReinjection },
  ], []);

  // 采灌量数据(字符串转数值近似)
  const _extractionData = useMemo(() =>
    reinjectionDataExtended.map(r => ({
      name: r.field.replace('地热田', ''),
      '开采(万m³)': parseFloat(r.annualExtraction) || 0,
      '回灌(万m³)': parseFloat(r.annualReinjection) || 0,
      '回灌率(%)': r.reinjectionRate,
    })),
  []);

  return (
    <div className="space-y-4">
      {/* ── 5格统计卡片 ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="总井数" value={totalWells} unit="口" icon={Droplets} subtitle={`${totalProduction}采+${totalReinjection}灌`} accent="blue" />
        <StatCard title="平均回灌率" value={avgRate.toFixed(0)} unit="%" icon={Recycle} subtitle="5地热田均值" accent="emerald" />
        <StatCard title="雄县回灌率" value={geothermalReinjection.xiongxian.reinjectionRate} unit="%" icon={CheckCircle2} subtitle="全国标杆" accent="cyan" />
        <StatCard title="牛驼镇回灌率" value={geothermalReinjection.niutuozhen.reinjectionRate} unit="%" icon={TrendingUp} subtitle="持续提升" accent="amber" />
        <StatCard title="低回灌率田" value={reinjectionDataExtended.filter(r => r.reinjectionRate < 70).length} unit="处" icon={AlertTriangle} subtitle="低于政策目标" accent="red" />
      </div>

      {/* ── 回灌率对比柱状图 ── */}
      <div className="grid grid-cols-2 gap-4">
        <LazyChartCard title="各地热田回灌率对比" badge="%" height={260}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={rateData} filename="回灌率对比" sheetName="回灌率对比" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rateData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip unit="%" title="回灌率" />} />
              <ChartRefLines lines={[
                { y: 90, stroke: '#f59e0b', strokeDasharray: '8 4', label: '政策目标 90%', position: 'top', fontSize: 10 },
              ]} />
              <Bar dataKey="回灌率(%)" name="实际回灌率" radius={[4, 4, 0, 0]}>
                {rateData.map((entry, i: number) => (
                  <Cell key={i} fill={entry['回灌率(%)'] >= 90 ? '#22c55e' : entry['回灌率(%)'] >= 70 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
              <Bar dataKey="政策目标(%)" name="政策目标" fill="none" stroke="#f59e0b" strokeDasharray="6 3" />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* ── 采灌井比例饼图 ── */}
        <LazyChartCard title="生产井/回灌井比例" badge={totalWells + '口'} height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={wellPie} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                <Cell fill="#3b82f6" />
                <Cell fill="#22c55e" />
              </Pie>
              <Tooltip content={<ChartTooltip unit="口" title="井数" />} />
            </PieChart>
          </ResponsiveContainer>
          <DataSourceNote source="雄县1:1采灌比最优，宁晋/新河/蠡县回灌井不足需补充" />
        </LazyChartCard>
      </div>

      {/* ── 各地热田回灌详细数据 ── */}
      <TechCard title="各地热田回灌详细数据">
        <div className="mb-2 flex justify-end">
          <ChartExport data={reinjectionDataExtended} filename="地热回灌详细数据" sheetName="回灌详细" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['地热田', '总井数', '生产井', '回灌井', '回灌率(%)', '年开采', '年回灌', '水位变化', '起始年', '备注']}
          rows={reinjectionDataExtended.map(r => [r.field, r.wells, r.production, r.reinjection, r.reinjectionRate + '%', r.annualExtraction, r.annualReinjection, r.pressureChange, r.startYear, r.note])}
          filterPlaceholder="搜索地热田..."
        />
      </TechCard>

      {/* ── 回灌技术要点 + 里程碑 ── */}
      <div className="grid grid-cols-2 gap-4">
        <TechCard title="地热回灌技术要点" badge="可持续开发">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">回灌目的：</span>维持热储压力、防止地面沉降、实现热能可持续提取（取热不耗水）。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">回灌方式：</span>对井回灌（一采一灌）、同层对置回灌、异层回灌。雄县采用同层对置回灌模式。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">关键技术：</span>防堵塞技术（除砂、除垢、杀菌）、回灌压力控制、热突破监测、示踪试验评价。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">政策要求：</span>《地热资源开发利用管理办法》规定地热尾水回灌率不低于90%，雄安新区要求100%同层回灌。</p>
          </div>
        </TechCard>
        <TechCard title="回灌发展里程碑">
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">雄县95%回灌率</span>
              </div>
              <p className="text-xs text-gw-muted">2010年启动回灌，水位回升5~8m/a，采灌平衡典范</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/15">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={13} className="text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">全省回灌推广</span>
              </div>
              <p className="text-xs text-gw-muted">2015-2020年全省要求采灌平衡，回灌率提升至70%+</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={13} className="text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">待改进地热田</span>
              </div>
              <p className="text-xs text-gw-muted">蠡县-高阳(55%)、新河(60%)、宁晋(65%)回灌率低于90%政策目标，需补充回灌井</p>
            </div>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
