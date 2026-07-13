import { useTabTransition } from '../hooks/useTabTransition';
import React, { useState, useMemo, useCallback } from 'react';
import { FlaskConical, AlertTriangle, BookOpen, Layers } from 'lucide-react';
import {
  groundwaterBackground, cityExceedanceFactors, waterQualityStandard,
} from '../data/backgroundValues';
import { SectionTitle, DataSourceNote } from '../components/UI';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { CrossLinkPanel } from '../components/CrossLink';
import { RADAR_INDICATORS, ZONE_LABELS, parseRange } from './groundwater/backgroundData';
import type { RadarDataPoint, IndicatorComparePoint } from './groundwater/backgroundData';
import { BackgroundQueryTab } from './groundwater/BackgroundQueryTab';
import { BackgroundCompareTab } from './groundwater/BackgroundCompareTab';
import { BackgroundExceedTab } from './groundwater/BackgroundExceedTab';
import { BackgroundStandardTab } from './groundwater/BackgroundStandardTab';

type TabKey = 'query' | 'compare' | 'exceed' | 'standard';
const TABS: { key: TabKey; label: string; icon: typeof FlaskConical }[] = [
  { key: 'query', label: '背景值查询', icon: FlaskConical },
  { key: 'compare', label: '分区对比', icon: Layers },
  { key: 'exceed', label: '超标因子', icon: AlertTriangle },
  { key: 'standard', label: '标准对照', icon: BookOpen },
];

export function GroundwaterBackground() {
  const [exportOpen, setExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useTabTransition<TabKey>('query');
  const [selectedZone, setSelectedZone] = useState('山前平原');
  const [selectedLayer, setSelectedLayer] = useState<'shallow' | 'deep'>('shallow');
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');

  // ── 当前选中的分区数据 ──
  const currentZoneData = useMemo(() => {
    const zones = selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep;
    return zones.find(z => z.zone === selectedZone);
  }, [selectedZone, selectedLayer]);

  // ── 雷达图数据 ──
  const radarData = useMemo((): RadarDataPoint[] => {
    const zones = selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep;
    return RADAR_INDICATORS.map(ind => {
      const point: RadarDataPoint = { indicator: ind };
      zones.forEach(z => {
        const key = ind === '总硬度' ? 'totalHardness' : ind;
        const val = z[key as keyof typeof z];
        point[ZONE_LABELS[z.zone] || z.zone] = parseRange(val || '0');
      });
      return point;
    });
  }, [selectedLayer]);

  // ── 关键指标对比柱图 ──
  const indicatorCompare = useMemo((): IndicatorComparePoint[] => {
    const zones = selectedLayer === 'shallow' ? groundwaterBackground.shallow : groundwaterBackground.deep;
    const indicators = [
      { key: 'TDS', label: 'TDS(mg/L)' },
      { key: 'totalHardness', label: '总硬度(mg/L)' },
      { key: 'Cl', label: 'Cl⁻(mg/L)' },
      { key: 'SO4', label: 'SO₄²⁻(mg/L)' },
      { key: 'Na', label: 'Na⁺(mg/L)' },
      { key: 'F', label: 'F⁻(mg/L)' },
    ];
    return indicators.map(ind => {
      const point: IndicatorComparePoint = { name: ind.label };
      zones.forEach(z => {
        const val = z[ind.key as keyof typeof z];
        point[z.zone] = parseRange(val || '0');
      });
      return point;
    });
  }, [selectedLayer]);

  // ── 城市过滤 ──
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cityExceedanceFactors;
    const kw = citySearch.trim().toLowerCase();
    return cityExceedanceFactors.filter(c =>
      c.city.toLowerCase().includes(kw) ||
      c.shallow.toLowerCase().includes(kw) ||
      c.deep.toLowerCase().includes(kw)
    );
  }, [citySearch]);

  // ── 报告数据 ──
  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'groundwater-background',
    collector: useCallback(async () => ({
      groundwaterBackground,
      cityExceedanceFactors,
      waterQualityStandard,
    }), []),
    autoCollect: true,
  });

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle icon={FlaskConical}>地下水环境背景值查询</SectionTitle>
          <p className="text-xs text-gw-muted mt-1">
            数据来源：河北省地质环境监测院 · 生态环境部《地下水环境背景值统计表征技术指南(试行)》(2023) | 山前/中部/滨海平原分区
          </p>
        </div>
        <button
          onClick={() => setExportOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all"
        >
          导出报告
        </button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'query' && (
        <BackgroundQueryTab
          selectedZone={selectedZone}
          selectedLayer={selectedLayer}
          setSelectedZone={setSelectedZone}
          setSelectedLayer={setSelectedLayer}
          currentZoneData={currentZoneData}
        />
      )}
      {activeTab === 'compare' && (
        <BackgroundCompareTab
          selectedLayer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
          radarData={radarData}
          indicatorCompare={indicatorCompare}
        />
      )}
      {activeTab === 'exceed' && (
        <BackgroundExceedTab
          filteredCities={filteredCities}
          citySearch={citySearch}
          setCitySearch={setCitySearch}
          expandedCity={expandedCity}
          setExpandedCity={setExpandedCity}
        />
      )}
      {activeTab === 'standard' && (
        <BackgroundStandardTab />
      )}

      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="groundwater-background"
        reportLabel="河北省地下水环境背景值报告"
        data={getData()}
        dataLoading={dataLoading}
      />
      <CrossLinkPanel currentPath="/groundwater-background" />
      <DataSourceNote source="河北省地质环境监测院 | 生态环境部《地下水环境背景值统计表征技术指南(试行)》(2023) | 河北平原浅层地下水元素地球化学特征研究(2026) | 河北瑞三元环境科技有限公司整理" />
    </div>
  );
}
