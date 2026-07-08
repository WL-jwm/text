import React, { useState, useMemo, useCallback } from 'react';
import { FlaskConical, AlertTriangle, Droplets, Shield, BookOpen, TrendingUp, MapPin } from 'lucide-react';
import { waterQuality2024, pollutionDegree1990s, shallowGroundwaterQuality2024, waterQualityTrend, groundwaterQualityStandard } from '../data/waterQuality';
import { exportDataCSV } from '../utils/exportUtils';
import { StatCard, DataSourceNote } from '../components/UI';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
// 注册水质评价报告生成器（side-effect import）
import { CrossLinkPanel } from '../components/CrossLink';
import { useToast } from '../components/Toast';
import { WaterQualityDrinkingTab } from '../components/water-quality/WaterQualityDrinkingTab';
import { WaterQualityStandardTab } from '../components/water-quality/WaterQualityStandardTab';
import { WaterQualityAssessmentTab } from '../components/water-quality/WaterQualityAssessmentTab';
import { WaterQualityPollutionTab } from '../components/water-quality/WaterQualityPollutionTab';
import { WaterQualityIndustrialTab } from '../components/water-quality/WaterQualityIndustrialTab';
import { WaterQualityTrendTab } from '../components/water-quality/WaterQualityTrendTab';
import { WaterQualityCityRateTab } from '../components/water-quality/WaterQualityCityRateTab';
import { WaterQualityClassicTab } from '../components/water-quality/WaterQualityClassicTab';

const TABS = [
  { key: 'drinking', label: '饮水安全', icon: Shield },
  { key: 'standard', label: '质量标准', icon: BookOpen },
  { key: 'assessment', label: '水质评价', icon: FlaskConical },
  { key: 'pollution', label: '污染程度', icon: AlertTriangle },
  { key: 'industrial', label: '工业用水', icon: Droplets },
  { key: 'trend', label: '趋势分析', icon: TrendingUp },
  { key: 'cityrate', label: '市级达标率', icon: MapPin },
  { key: 'classic', label: '经典参数', icon: BookOpen },
] as const;

type TabKey = typeof TABS[number]['key'];

export function WaterQuality() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('drinking');
  const [exportOpen, setExportOpen] = useState(false);
  const wq = waterQuality2024;

  // 报告数据预采集（增量缓存）
  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'water-quality',
    collector: useCallback(async () => ({
      totalSites: '27',
      totalFactors: '39',
      dominantClass: 'III',
      complianceRate: `${wq.drinkingWater.overallCompliance}%`,
      conclusion: '河北省地下水质量总体良好，饮用水源达标率100%。浅层地下水以III类水为主，主要超标因子为氟化物、总硬度、硝酸盐等，建议加强农业面源污染控制和地下水保护。',
      standards: [
        { class: 'I类', name: '优良', description: '化学组分天然低背景值，适用于各种用途' },
        { class: 'II类', name: '良好', description: '化学组分天然背景值较低，适用于各种用途' },
        { class: 'III类', name: '较好', description: '化学组分天然背景值中等，适用于集中式生活饮用水水源' },
        { class: 'IV类', name: '较差', description: '化学组分天然背景值较高，适用于农业和部分工业用水' },
        { class: 'V类', name: '极差', description: '化学组分天然背景值很高，不宜饮用' },
      ],
      evaluationResults: shallowGroundwaterQuality2024.map(d => ({
        region: d.region,
        'I+II': (d.I + d.II).toFixed(1),
        'III': d.III.toFixed(1),
        'IV': d.IV.toFixed(1),
        'V': d.V.toFixed(1),
      })),
      pollutionStats: [
        { name: '氟化物', rate: '28.6%', maxRate: '2.3' },
        { name: '总硬度', rate: '22.4%', maxRate: '1.8' },
        { name: '硝酸盐', rate: '18.5%', maxRate: '3.1' },
        { name: '溶解性总固体', rate: '15.2%', maxRate: '1.5' },
        { name: '硫酸盐', rate: '12.7%', maxRate: '1.2' },
        { name: '氯化物', rate: '10.3%', maxRate: '1.4' },
      ],
    }), [wq]),
    autoCollect: true,
  });

  // ── 图表数据 ──
  const pollutionPie = useMemo(() => {
    const totals = pollutionDegree1990s.reduce((acc, c) => ({
      unpolluted: acc.unpolluted + c.unpolluted,
      light: acc.light + c.light,
      moderate: acc.moderate + c.moderate,
      heavy: acc.heavy + c.heavy,
      severe: acc.severe + c.severe,
    }), { unpolluted: 0, light: 0, moderate: 0, heavy: 0, severe: 0 });
    return [
      { name: '未污染', value: Math.round(totals.unpolluted), color: '#10b981' },
      { name: '轻度', value: Math.round(totals.light), color: '#3b82f6' },
      { name: '中度', value: Math.round(totals.moderate), color: '#f59e0b' },
      { name: '重度', value: Math.round(totals.heavy), color: '#ef4444' },
      { name: '严重', value: Math.round(totals.severe), color: '#7f1d1d' },
    ];
  }, []);

  const shallowBarData = useMemo(() =>
    shallowGroundwaterQuality2024.map(d => ({
      region: d.region.replace(/市$/, ''),
      'I+II': d.I + d.II,
      'III': d.III,
      'IV': d.IV,
      'V': d.V,
    })),
    []
  );

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">水质评价</h1>
          <p className="text-xs text-gw-muted mt-1">地下水质量监测与评价 | GB/T 14848-2017</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">2024年</span>
          <button onClick={() => { exportDataCSV(shallowGroundwaterQuality2024, 'shallow-water-quality-2024'); success('数据已导出'); }} className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
            导出数据
          </button>
          <button onClick={() => setExportOpen(true)}
            className="text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="饮水源达标率" value={`${wq.drinkingWater.overallCompliance}%`} accent="emerald" subtitle="27个水源地全部达标" />
        <StatCard title="国考V类水比例" value={`${wq.nationalExam.classVRatio}%`} accent="blue" subtitle={`优于国家${wq.nationalExam.nationalRequirement}%`} />
        <StatCard title="地表水III类+" value={`${wq.surfaceWaterQuality.classIIIRatio}%`} accent="cyan" subtitle={`${wq.surfaceWaterQuality.classIIIPlus}/${wq.surfaceWaterQuality.totalStations}站`} />
        <StatCard title="2024III类+占比" value={`${waterQualityTrend[waterQualityTrend.length - 1].IIIPlusPercent}%`} accent="amber" subtitle="浅层地下水" />
        <StatCard title="主要超标因子" value="6" unit="种" accent="red" subtitle="氟化物/总硬度/硝酸盐等" />
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'drinking' && <WaterQualityDrinkingTab wq={wq} />}
      {activeTab === 'standard' && <WaterQualityStandardTab groundwaterQualityStandard={groundwaterQualityStandard} />}
      {activeTab === 'assessment' && <WaterQualityAssessmentTab shallowBarData={shallowBarData} />}
      {activeTab === 'pollution' && <WaterQualityPollutionTab pollutionPie={pollutionPie} />}
      {activeTab === 'industrial' && <WaterQualityIndustrialTab />}
      {activeTab === 'trend' && <WaterQualityTrendTab wq={wq} />}
      {activeTab === 'cityrate' && <WaterQualityCityRateTab />}
      {activeTab === 'classic' && <WaterQualityClassicTab />}

      <DataSourceNote source="2024河北省水资源公报 | GB/T 14848-2017 | 1999年《河北省地下水》" version="v2.1" />
      <CrossLinkPanel currentPath="/water-quality" />

      {/* 导出报告对话框 */}
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="water-quality"
        reportLabel="地下水水质评价报告"
        data={getData()}
        dataLoading={dataLoading}
      />
    </div>
  );
}
