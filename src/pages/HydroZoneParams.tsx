import { useTabTransition } from '../hooks/useTabTransition';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Database, Map, BookOpen, Droplets, Search, Wifi, WifiOff, RefreshCw, Calculator } from 'lucide-react';
import {
  aquiferGroups as localAquiferGroups, lithologyMu as localLithologyMu,
  infiltrationCoeff as localInfiltrationCoeff, permeability as localPermeability,
  storageCoeff as localStorageCoeff, dispersivity as localDispersivity,
  karstParams, fractureParams, stationInfiltration,
} from '../data/hydroParams';
import { systemZones, subZones } from '../data/zoneParams';
import { StatCard, DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
// 注册水文地质参数报告生成器（side-effect import）
import { useToast } from '../components/Toast';
import { HydroZoneDisplayTab } from '../components/hydro-zone-params/HydroZoneDisplayTab';
import { HydroZoneMapTab } from '../components/hydro-zone-params/HydroZoneMapTab';
import { HydroZoneReferenceTab } from '../components/hydro-zone-params/HydroZoneReferenceTab';
import { HydroZoneSpringsTab } from '../components/hydro-zone-params/HydroZoneSpringsTab';
import { HydroZoneQueryTab } from '../components/hydro-zone-params/HydroZoneQueryTab';
import { NumericalModelCalculatorTab } from '../components/hydro-zone-params/NumericalModelCalculatorTab';
import {
  getPermeabilityData, getLithologyMuData,
  getAquiferGroupsData, getInfiltrationData, getDispersivityData,
  checkServiceHealth,  onStatusChange,
} from '../services/paramService';

const TABS = [
  { key: 'display', label: '参数总览', icon: Database },
  { key: 'map', label: '分区参数', icon: Map },
  { key: 'reference', label: '经典参考', icon: BookOpen },
  { key: 'springs', label: '历史泉水', icon: Droplets },
  { key: 'query', label: '参数查询', icon: Search },
  { key: 'calculator', label: '数值模拟', icon: Calculator },
];

export function HydroZoneParams() {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useTabTransition<string>('display');
  const [exportOpen, setExportOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [lithFilter, setLithFilter] = useState('全部');
  const [permFilter, setPermFilter] = useState('全部');
  const [serviceStatus, setServiceStatus] = useState<'loading' | 'remote' | 'local'>('loading');

  // ── 远程数据状态 ──
  const [remotePermeability, setRemotePermeability] = useState<typeof localPermeability | null>(null);
  const [remoteLithologyMu, setRemoteLithologyMu] = useState<typeof localLithologyMu | null>(null);
  const [remoteAquiferGroups, setRemoteAquiferGroups] = useState<typeof localAquiferGroups | null>(null);
  const [remoteInfiltration, setRemoteInfiltration] = useState<typeof localInfiltrationCoeff | null>(null);
  const [remoteDispersivity, setRemoteDispersivity] = useState<typeof localDispersivity | null>(null);

  // ── 数据源选择：远程优先，本地降级 ──
  const permeability = remotePermeability ?? localPermeability;
  const lithologyMu = remoteLithologyMu ?? localLithologyMu;
  const aquiferGroups = remoteAquiferGroups ?? localAquiferGroups;
  const infiltrationCoeff = remoteInfiltration ?? localInfiltrationCoeff;
  const dispersivity = remoteDispersivity ?? localDispersivity;

  // ── 启动时检查微服务并加载数据 ──
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const healthy = await checkServiceHealth();
      if (cancelled) return;

      if (healthy) {
        setServiceStatus('remote');
        // 并行加载所有数据
        const [perm, mu, aq, inf, disp] = await Promise.all([
          getPermeabilityData(),
          getLithologyMuData(),
          getAquiferGroupsData(),
          getInfiltrationData(),
          getDispersivityData(),
        ]);
        if (cancelled) return;

        if (perm.source === 'remote') setRemotePermeability(perm.data as typeof localPermeability);
        if (mu.source === 'remote') setRemoteLithologyMu(mu.data as typeof localLithologyMu);
        if (aq.source === 'remote') setRemoteAquiferGroups(aq.data as typeof localAquiferGroups);
        if (inf.source === 'remote') setRemoteInfiltration(inf.data as typeof localInfiltrationCoeff);
        if (disp.source === 'remote') setRemoteDispersivity(disp.data as typeof localDispersivity);
      } else {
        setServiceStatus('local');
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── 监听服务状态变化 ──
  useEffect(() => {
    const unsub = onStatusChange(s => {
      if (s === 'remote') setServiceStatus('remote');
      else if (s === 'local') setServiceStatus('local');
    });
    return unsub;
  }, []);

  // ── 手动刷新 ──
  const handleRefresh = async () => {
    setServiceStatus('loading');
    setRemotePermeability(null);
    setRemoteLithologyMu(null);
    setRemoteAquiferGroups(null);
    setRemoteInfiltration(null);
    setRemoteDispersivity(null);

    const healthy = await checkServiceHealth();
    if (healthy) {
      const [perm, mu, aq, inf, disp] = await Promise.all([
        getPermeabilityData(), getLithologyMuData(),
        getAquiferGroupsData(), getInfiltrationData(), getDispersivityData(),
      ]);
      if (perm.source === 'remote') setRemotePermeability(perm.data as typeof localPermeability);
      if (mu.source === 'remote') setRemoteLithologyMu(mu.data as typeof localLithologyMu);
      if (aq.source === 'remote') setRemoteAquiferGroups(aq.data as typeof localAquiferGroups);
      if (inf.source === 'remote') setRemoteInfiltration(inf.data as typeof localInfiltrationCoeff);
      if (disp.source === 'remote') setRemoteDispersivity(disp.data as typeof localDispersivity);
      setServiceStatus('remote');
      success('已切换到远程数据源');
    } else {
      setServiceStatus('local');
      info('微服务不可用，使用本地数据');
    }
  };

  const allLith = useMemo(() => [...new Set(lithologyMu.map(d => d.lithology))], [lithologyMu]);
  const allPerm = useMemo(() => [...new Set(permeability.map(d => d.lithology))], [permeability]);

  const filteredPerm = useMemo(() => {
    let data = permeability;
    if (permFilter !== '全部') data = data.filter(d => d.lithology === permFilter);
    if (searchText) data = data.filter(d => d.lithology.toLowerCase().includes(searchText.toLowerCase()));
    return data;
  }, [permFilter, searchText, permeability]);

  const filteredLith = useMemo(() => {
    let data = lithologyMu;
    if (lithFilter !== '全部') data = data.filter(d => d.lithology === lithFilter);
    if (searchText) data = data.filter(d => d.lithology.toLowerCase().includes(searchText.toLowerCase()));
    return data;
  }, [lithFilter, searchText, lithologyMu]);

  // ── 图表数据 ──
  const permBarData = useMemo(() =>
    permeability.slice(0, 15).map(d => ({
      name: d.lithology.length > 6 ? d.lithology.substring(0, 6) : d.lithology,
      Kh: parseFloat(String(d.Kh).replace('~', '').split(/[-~]/)[0]) || 0,
      Kv: parseFloat(String(d.Kv).replace('~', '').split(/[-~]/)[0]) || 0,
    })),
    [permeability]
  );

  const muBarData = useMemo(() =>
    lithologyMu.slice(0, 12).map(d => ({
      name: d.lithology.length > 6 ? d.lithology.substring(0, 6) : d.lithology,
      mu: parseFloat(String(d.mu).replace('~', '').split(/[-~]/)[0]) || 0,
      K: parseFloat(String(d.K).replace('~', '').split(/[-~]/)[0]) || 0,
    })),
    [lithologyMu]
  );

  const infiltrationBarData = useMemo(() =>
    infiltrationCoeff.map(d => ({
      name: d.lithology.length > 5 ? d.lithology.substring(0, 5) : d.lithology,
      平原区: parseFloat(String(d.plain).replace('%', '').replace('~', '').split(/[-~]/)[0]) || 0,
      山区: parseFloat(String(d.mountain).replace('%', '').replace('~', '').split(/[-~]/)[0]) || 0,
    })),
    [infiltrationCoeff]
  );

  const systemAreaData = useMemo(() =>
    systemZones.filter(z => z.area && z.area > 0).slice(0, 10).map(z => ({
      name: z.name.length > 8 ? z.name.substring(0, 8) : z.name,
      面积: z.area,
    })).sort((a, b) => (b.面积 || 0) - (a.面积 || 0)),
    []
  );

  const dispersivityScatter = useMemo(() =>
    dispersivity.filter(d => {
      const al = parseFloat(String(d.aL).replace(/[^0-9.]/g, ''));
      return al > 0;
    }).map(d => ({
      name: d.medium,
      aL: parseFloat(String(d.aL).replace(/[^0-9.]/g, '')) || 0,
      aT: parseFloat(String(d.aT).replace(/[^0-9.]/g, '')) || 0,
    })),
    [dispersivity]
  );

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.toLowerCase();
    const results: { source: string; key: string; detail: string }[] = [];
    permeability.forEach(d => { if (d.lithology.toLowerCase().includes(q)) results.push({ source: '渗透系数', key: d.lithology, detail: `Kh=${d.Kh} Kv=${d.Kv}` }); });
    infiltrationCoeff.forEach(d => { if (d.lithology.toLowerCase().includes(q)) results.push({ source: '入渗系数', key: d.lithology, detail: `平原${d.plain} 山区${d.mountain}` }); });
    lithologyMu.forEach(d => { if (d.lithology.toLowerCase().includes(q)) results.push({ source: '给水度', key: d.lithology, detail: `mu=${d.mu} K=${d.K}` }); });
    return results.slice(0, 30);
  }, [searchText, permeability, infiltrationCoeff, lithologyMu]);

  // 报告数据预采集（增量缓存）
  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'hydro-params',
    collector: useCallback(async () => ({
      aquiferGroups: localAquiferGroups,
      permeability,
      lithologyMu,
      infiltration: infiltrationCoeff,
      storageCoeff: localStorageCoeff,
      systemZones,
      subZones,
      dispersivity,
      karstParams,
      fractureParams,
      stationInfiltration,
      conclusion: '本报告汇总了河北省水文地质参数的典型经验值，涵盖第四系含水层组（4组）、渗透系数（9种岩性）、给水度（7种岩性）、降水入渗系数（5种岩性）、释水系数（5个含水层组）、弥散度（5种介质）、岩溶/裂隙含水介质参数及山区水文站实测入渗系数等关键参数。数据来源于1999年《河北省地下水》及区域水文地质普查资料，适用于河北省地下水环境影响评价参数初选。',
    }), [localAquiferGroups, permeability, lithologyMu, infiltrationCoeff, systemZones, dispersivity]),
    autoCollect: true,
  });

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gw-text">水文地质参数</h1>
          <p className="text-xs text-gw-muted mt-1">含水层参数、渗透系数、给水度与入渗系数查询</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 数据源状态指示器 */}
          <button onClick={handleRefresh}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-colors
              data-[status=remote]:bg-emerald-500/15 data-[status=remote]:text-emerald-400 data-[status=remote]:border-emerald-500/20
              data-[status=local]:bg-amber-500/15 data-[status=local]:text-amber-400 data-[status=local]:border-amber-500/20
              data-[status=loading]:bg-blue-500/15 data-[status=loading]:text-blue-400 data-[status=loading]:border-blue-500/20"
            data-status={serviceStatus}
            title={serviceStatus === 'remote' ? '远程数据源' : serviceStatus === 'local' ? '本地数据源' : '加载中...'}>
            {serviceStatus === 'loading' ? <RefreshCw size={12} className="animate-spin" /> :
             serviceStatus === 'remote' ? <Wifi size={12} /> : <WifiOff size={12} />}
            {serviceStatus === 'remote' ? '远程' : serviceStatus === 'local' ? '本地' : '连接中'}
          </button>
          <button onClick={() => setExportOpen(true)}
            className="text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
            导出报告
          </button>
          <span className="px-2 py-1 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20 w-fit">核心模块</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard title="含水层组" value={String(aquiferGroups.length)} unit="组" accent="blue" />
        <StatCard title="渗透系数" value={String(permeability.length)} unit="条" accent="cyan" />
        <StatCard title="给水度" value={String(lithologyMu.length)} unit="条" accent="emerald" />
        <StatCard title="入渗系数" value={String(infiltrationCoeff.length)} unit="条" accent="amber" />
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'display' && (
        <HydroZoneDisplayTab
          lithFilter={lithFilter} setLithFilter={setLithFilter}
          permFilter={permFilter} setPermFilter={setPermFilter}
          allLith={allLith} allPerm={allPerm}
          filteredPerm={filteredPerm} filteredLith={filteredLith}
          permBarData={permBarData} muBarData={muBarData}
          infiltrationBarData={infiltrationBarData}
          dispersivityScatter={dispersivityScatter}
        />
      )}

      {activeTab === 'map' && (
        <HydroZoneMapTab systemAreaData={systemAreaData} />
      )}

      {activeTab === 'reference' && (
        <HydroZoneReferenceTab />
      )}

      {activeTab === 'springs' && (
        <HydroZoneSpringsTab />
      )}

      {activeTab === 'query' && (
        <HydroZoneQueryTab
          searchText={searchText}
          setSearchText={setSearchText}
          searchResults={searchResults}
        />
      )}

      {activeTab === 'calculator' && <NumericalModelCalculatorTab />}

      <DataSourceNote
        source={serviceStatus === 'remote' ? '参数共享微服务 | 314条记录 | 18个类别' : '1999基础文献 | 附件参数表 + 地下水系统分区'}
        version={serviceStatus === 'remote' ? 'v2.1 (远程)' : 'v2.0 (本地)'}
      />
      <CrossLinkPanel currentPath="/hydro-zone-params" />

      {/* 导出报告对话框 */}
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="hydro-params"
        reportLabel="河北省水文地质参数汇编"
        data={getData()}
        dataLoading={dataLoading}
      />
    </div>
  );
}
