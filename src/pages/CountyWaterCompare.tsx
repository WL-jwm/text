import React, { useMemo, useState } from 'react';
import { MapPin, Layers, ArrowLeftRight } from 'lucide-react';
import { SectionTitle, TagFilter } from '../components/UI';
import { cityBulletin2024 } from '../data/resources';
import { usePageCommons } from '../hooks/usePageCommons'
import { ExportProgressDialog } from '../components/ExportProgressDialog';
// 注册报告生成器
import { exportDataCSV } from '../utils/exportUtils';
import { CountySingleView } from '../components/county/CountySingleView';
import { CountyCrossView } from '../components/county/CountyCrossView';
import type { CityBulletinBrief, CountyDataItem, ScatterDataPoint} from '../types/county';

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

const CITY_COLORS: Record<string, string> = {
  '石家庄市': '#06b6d4', '邢台市': '#3b82f6', '沧州市': '#8b5cf6', '承德市': '#10b981', '保定市': '#f59e0b',
};

interface _CitySummaryItem {
  city: string;
  countyCount: number;
  totalUse: number;
  totalGw: number;
  gwRatio: number;
  totalAgri: number;
  totalIndustry: number;
  totalDomestic: number;
  totalEco: number;
  agriRatio: number;
}

interface CrossCityItem {
  city: string;
  county: string;
  totalUse: number;
  gwUse: number;
  agri: number;
  industry: number;
  domestic: number;
  eco: number;
  gwRatio: number;
  agriRatio: number;
  precip: number | null;
}

interface _CityDistributionItem {
  city: string;
  minAgri: number;
  maxAgri: number;
  avgAgri: number;
  minGw: number;
  maxGw: number;
  avgGw: number;
  avgPrecip: number;
  minPrecip: number;
  maxPrecip: number;
  countyCount: number;
}

interface _ScatterByCityItem {
  city: string;
  color: string;
  data: Array<{ x: number; y: number; z: number; county: string; cityName: string }>;
}

export function CountyWaterCompare() {

  const { exportOpen, setExportOpen, getData, dataLoading, success } = usePageCommons({
    pageName: 'county-water-compare',
    collector: async () => ({ citySummary, crossCityAll, cityDistribution }),
  });

    const [sortField, setSortField] = useState<string>('count');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedCity, setSelectedCity] = useState('');
  const [viewMode, setViewMode] = useState<'county' | 'cross' | 'table'>('table');

  const citiesWithCounties = useMemo(() =>
    cityBulletin2024.filter(b => b.counties && b.counties.length > 0) as CityBulletinBrief[], []
  );

  const currentCity = useMemo(() =>
    cityBulletin2024.find(b => b.city === selectedCity) as CityBulletinBrief | undefined, [selectedCity]
  );

  const countyData = useMemo(() => {
    if (!currentCity?.counties) return [];
    return currentCity.counties
      .map((c: CountyDataItem, i: number) => ({
        ...c, index: i,
        gwRatio: (c.totalUse ?? 0) > 0 ? (((c.gwUse ?? 0) / (c.totalUse ?? 0)) * 100) : 0,
        agriRatio: (c.totalUse ?? 0) > 0 ? (((c.agri ?? 0) / (c.totalUse ?? 0)) * 100) : 0,
        industryRatio: (c.totalUse ?? 0) > 0 ? (((c.industry ?? 0) / (c.totalUse ?? 0)) * 100) : 0,
        domesticRatio: (c.totalUse ?? 0) > 0 ? (((c.domestic ?? 0) / (c.totalUse ?? 0)) * 100) : 0,
        ecoRatio: (c.totalUse ?? 0) > 0 ? (((c.eco ?? 0) / (c.totalUse ?? 0)) * 100) : 0,
      }))
      .sort((a, b) => {
        const va = (a as Record<string, number | string | null | undefined>)[sortField] ?? 0;
        const vb = (b as Record<string, number | string | null | undefined>)[sortField] ?? 0;
        return sortDir === 'desc' ? Number(vb) - Number(va) : Number(va) - Number(vb);
      });
  }, [currentCity, sortField, sortDir]);

  const hasRealData = countyData.some((c: CountyDataItem) => c.precip != null || (c.totalUse ?? 0) > 0);
  const isSkelCity = !!(currentCity && currentCity.counties && currentCity.counties.length > 0 && !hasRealData);

  const citySummary = useMemo(() => citiesWithCounties.map(b => {
    const counties: CountyDataItem[] = (b.counties || []) as CountyDataItem[];
    const totalUse = counties.reduce((s: number, c: CountyDataItem) => s + (c.totalUse ?? 0), 0);
    const totalGw = counties.reduce((s: number, c: CountyDataItem) => s + (c.gwUse ?? 0), 0);
    const totalAgri = counties.reduce((s: number, c: CountyDataItem) => s + (c.agri ?? 0), 0);
    const totalIndustry = counties.reduce((s: number, c: CountyDataItem) => s + (c.industry ?? 0), 0);
    const totalDomestic = counties.reduce((s: number, c: CountyDataItem) => s + (c.domestic ?? 0), 0);
    const totalEco = counties.reduce((s: number, c: CountyDataItem) => s + (c.eco ?? 0), 0);
    return { city: b.city, countyCount: counties.length, totalUse: +totalUse.toFixed(4), totalGw: +totalGw.toFixed(4), gwRatio: totalUse > 0 ? +(totalGw / totalUse * 100).toFixed(1) : 0, totalAgri: +totalAgri.toFixed(4), totalIndustry: +totalIndustry.toFixed(4), totalDomestic: +totalDomestic.toFixed(4), totalEco: +totalEco.toFixed(4), agriRatio: totalUse > 0 ? +(totalAgri / totalUse * 100).toFixed(1) : 0 };
  }), [citiesWithCounties]);

  const crossCityAll = useMemo(() => {
    const all: CrossCityItem[] = [];
    citiesWithCounties.forEach(b => {
      (b.counties as CountyDataItem[] | undefined || []).forEach((c: CountyDataItem) => {
        if ((c.totalUse ?? 0) > 0 || (c.precip ?? 0) > 0) {
          all.push({ city: b.city, county: c.name, totalUse: c.totalUse ?? 0, gwUse: c.gwUse ?? 0, agri: c.agri ?? 0, industry: c.industry ?? 0, domestic: c.domestic ?? 0, eco: c.eco ?? 0, gwRatio: (c.totalUse ?? 0) > 0 ? +((c.gwUse ?? 0) / (c.totalUse ?? 0) * 100).toFixed(1) : 0, agriRatio: (c.totalUse ?? 0) > 0 ? +((c.agri ?? 0) / (c.totalUse ?? 0) * 100).toFixed(1) : 0, precip: c.precip ?? null });
        }
      });
    });
    return all.sort((a, b) => b.totalUse - a.totalUse);
  }, [citiesWithCounties]);

  const cityDistribution = useMemo(() => citiesWithCounties.map(b => {
    const counties: CountyDataItem[] = (b.counties || []) as CountyDataItem[];
    const ratios = counties.filter((c: CountyDataItem) => (c.totalUse ?? 0) > 0).map((c: CountyDataItem) => +((c.agri ?? 0) / (c.totalUse ?? 0) * 100).toFixed(1));
    const gwRatios = counties.filter((c: CountyDataItem) => (c.totalUse ?? 0) > 0).map((c: CountyDataItem) => +((c.gwUse ?? 0) / (c.totalUse ?? 0) * 100).toFixed(1));
    const precips = counties.filter((c: CountyDataItem) => c.precip != null).map((c: CountyDataItem) => c.precip as number);
    return { city: b.city.replace('市', ''), minAgri: Math.min(...ratios, 0), maxAgri: Math.max(...ratios, 0), avgAgri: ratios.length > 0 ? +(sum(ratios) / ratios.length).toFixed(1) : 0, minGw: Math.min(...gwRatios, 0), maxGw: Math.max(...gwRatios, 0), avgGw: gwRatios.length > 0 ? +(sum(gwRatios) / gwRatios.length).toFixed(1) : 0, avgPrecip: precips.length ? +(sum(precips) / precips.length).toFixed(1) : 0, minPrecip: precips.length ? Math.min(...precips) : 0, maxPrecip: precips.length ? Math.max(...precips) : 0, countyCount: ratios.length };
  }), [citiesWithCounties]);

  const scatterByCity = useMemo(() => citiesWithCounties.map(b => ({
    city: b.city.replace('市', ''), color: CITY_COLORS[b.city] || '#06b6d4',
    data: ((b.counties || []) as CountyDataItem[]).filter((c: CountyDataItem) => (c.totalUse ?? 0) > 0).map((c: CountyDataItem) => ({ x: c.totalUse ?? 0, y: (c.totalUse ?? 0) > 0 ? +((c.gwUse ?? 0) / (c.totalUse ?? 0) * 100).toFixed(1) : 0, z: 20, county: c.name, cityName: b.city.replace('市', '') })),
  })).filter(d => d.data.length > 0), [citiesWithCounties]);

  const supplyPieData = useMemo(() => {
    if (!currentCity?.counties) return [];
    const totals = { agri: 0, industry: 0, domestic: 0, eco: 0 };
    (currentCity.counties as CountyDataItem[]).forEach((c: CountyDataItem) => { totals.agri += (c.agri ?? 0); totals.industry += (c.industry ?? 0); totals.domestic += (c.domestic ?? 0); totals.eco += (c.eco ?? 0); });
    return [{ name: '农业', value: +totals.agri.toFixed(4) }, { name: '工业', value: +totals.industry.toFixed(4) }, { name: '生活', value: +totals.domestic.toFixed(4) }, { name: '生态', value: +totals.eco.toFixed(4) }].filter(d => d.value > 0);
  }, [currentCity]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  // 报告数据预采集

  const handleExportCounty = () => {
    if (!countyData.length) return;
    const rows = countyData.map((c: CountyDataItem) => ({ 区县: c.name, 降水量_mm: c.precip ?? '', 地表水_万m3: c.surface ?? '', 地下水_万m3: c.ground ?? '', 水资源总量_万m3: c.total ?? '', 农业用水_亿m3: (c.agri ?? 0).toFixed(4), 工业用水_亿m3: (c.industry ?? 0).toFixed(4), 生活用水_亿m3: (c.domestic ?? 0).toFixed(4), 生态用水_亿m3: (c.eco ?? 0).toFixed(4), 总用水_亿m3: (c.totalUse ?? 0).toFixed(4), 地下水用水_亿m3: (c.gwUse ?? 0).toFixed(4), 地下水占比: c.gwRatio?.toFixed(1) + '%' }));
    exportDataCSV(rows, `${selectedCity}_县级水资源数据`);
    success('数据已导出');
  };

  const handleExportCross = () => {
    const rows = crossCityAll.map((c: CrossCityItem) => ({ 所属市: c.city, 区县: c.county, 总用水_亿m3: c.totalUse.toFixed(4), 地下水_亿m3: c.gwUse.toFixed(4), 农业_亿m3: c.agri.toFixed(4), 工业_亿m3: c.industry.toFixed(4), 生活_亿m3: c.domestic.toFixed(4), 生态_亿m3: c.eco.toFixed(4), 地下水占比: c.gwRatio + '%' }));
    exportDataCSV(rows, '河北省县级用水85县');
    success('数据已导出');
  };

  const radarData = useMemo(() => {
    if (!countyData.length) return [];
    const maxAgri = Math.max(...countyData.map((c: CountyDataItem) => c.agriRatio ?? 0), 1);
    const maxInd = Math.max(...countyData.map((c: CountyDataItem) => c.industryRatio ?? 0), 1);
    const maxDom = Math.max(...countyData.map((c: CountyDataItem) => c.domesticRatio ?? 0), 1);
    const maxEco = Math.max(...countyData.map((c: CountyDataItem) => c.ecoRatio ?? 0), 1);
    const maxGw = Math.max(...countyData.map((c: CountyDataItem) => c.gwRatio ?? 0), 1);
    const dims = ['农业占比', '工业占比', '生活占比', '生态占比', '地下水占比'];
    const maxes = [maxAgri, maxInd, maxDom, maxEco, maxGw];
    return dims.map((dim, i) => ({
      dimension: dim, fullMark: 100,
      ...Object.fromEntries(countyData.slice(0, Math.min(countyData.length, 8)).map((c: CountyDataItem) => {
        const vals = [c.agriRatio, c.industryRatio, c.domesticRatio, c.ecoRatio, c.gwRatio];
        return [c.name, Math.round(((vals[i] ?? 0) / maxes[i]) * 100)];
      })),
    }));
  }, [countyData]);

  const scatterData = useMemo(() =>
    countyData.map((c: CountyDataItem): ScatterDataPoint => ({ name: c.name, x: c.totalUse ?? 0, y: c.gwRatio ?? 0, size: c.precip ? c.precip / 10 : 20 })), [countyData]
  );

  if (!citiesWithCounties.length) return null;

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle icon={MapPin}>县级水资源数据对比</SectionTitle>
        <button onClick={() => setExportOpen(true)} className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          导出报告
        </button>
      </div>
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="county-water-compare"
        reportLabel="河北省县级水资源数据对比报告"
        data={getData()}
        dataLoading={dataLoading}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <TagFilter
          tags={citiesWithCounties.map(b => {
            const hasData = b.counties && (b.counties as CountyDataItem[]).some((c: CountyDataItem) => c.precip != null);
            return hasData ? b.city : b.city + ' (待补充)';
          })}
          activeTag={selectedCity}
          onTagChange={setSelectedCity}
        />
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setViewMode('county')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${viewMode === 'county' ? 'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text border border-gw-border/30'}`}>
            <Layers size={13} className="inline mr-1" />单市分析
          </button>
          <button onClick={() => setViewMode('cross')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${viewMode === 'cross' ? 'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text border border-gw-border/30'}`}>
            <ArrowLeftRight size={13} className="inline mr-1" />跨市对比
          </button>
        </div>
      </div>

      {viewMode === 'county' && currentCity && (
        <CountySingleView
          currentCity={currentCity}
          selectedCity={selectedCity}
          countyData={countyData}
          isSkelCity={isSkelCity}
          scatterData={scatterData}
          radarData={radarData}
          supplyPieData={supplyPieData}
          sortField={sortField}
          sortDir={sortDir}
          toggleSort={toggleSort}
          handleExportCounty={handleExportCounty}
        />
      )}

      {viewMode === 'cross' && (
        <CountyCrossView
          citiesWithCounties={citiesWithCounties}
          citySummary={citySummary}
          crossCityAll={crossCityAll}
          cityDistribution={cityDistribution}
          scatterByCity={scatterByCity}
          handleExportCross={handleExportCross}
        />
      )}
    </div>
  );
}
