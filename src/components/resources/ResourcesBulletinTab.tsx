import React from 'react';
import { cityBulletin2024 } from '../../data/resources';
import { BulletinCompareTab } from './BulletinCompareTab';
import { BulletinSupplyTab } from './BulletinSupplyTab';
import { BulletinDynamicTab } from './BulletinDynamicTab';
import { BulletinDetailTab } from './BulletinDetailTab';
import type { CityBulletinData, CountyTableRow, BulletinCompareItem, BulletinTableRow } from '../../types/county';
import { DataSourceNote } from '../UI';
import { ExportButton } from '../UI';

const BULLETIN_SUBTABS = [
  { key: 'compare', label: '跨市对比' },
  { key: 'supply', label: '供水结构' },
  { key: 'dynamic', label: '地下水动态' },
  { key: 'detail', label: '城市详情' },
] as const;
type BulletinSubKey = typeof BULLETIN_SUBTABS[number]['key'];

interface ResourcesBulletinTabProps {
  bulletinCompareData: BulletinCompareItem[];
  supplyStructureData: Record<string, unknown>[];
  useStructureData: Record<string, unknown>[];
  gwDynamicData: { name: string; 浅层埋深: number; 浅层变化: number; 深层埋深: number; 深层变化: number }[];
  selectedBulletin: CityBulletinData | null;
  bulletinTableData: BulletinTableRow[];
  countyTableRows: CountyTableRow[];
  bulletinSub: BulletinSubKey;
  setBulletinSub: (v: BulletinSubKey) => void;
  selectedCity: string | null;
  setSelectedCity: (v: string | null) => void;
  bulletinSortCol: number | null;
  bulletinSortDir: 'asc' | 'desc';
  countySortCol: number | null;
  countySortDir: 'asc' | 'desc';
  handleBulletinSort: (col: number) => void;
  handleCountySort: (col: number) => void;
  handleExportBulletin: () => void;
  bulletinData: any[];
}

export function ResourcesBulletinTab({
  bulletinCompareData, supplyStructureData, useStructureData,
  gwDynamicData, selectedBulletin, bulletinTableData, countyTableRows,
  bulletinSub, setBulletinSub,
  selectedCity, setSelectedCity,
  bulletinSortCol, bulletinSortDir,
  countySortCol, countySortDir,
  handleBulletinSort, handleCountySort, handleExportBulletin,
  bulletinData,
}: ResourcesBulletinTabProps) {
  const _citiesWithCounties = cityBulletin2024.filter(b => b.counties && b.counties.length > 0);
  const _citiesWithSupply = cityBulletin2024.filter(b => b.totalSupply != null);

  return (
    <div className="space-y-6">
      {/* 子Tab */}
      <div className="flex flex-wrap gap-2">
        {BULLETIN_SUBTABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setBulletinSub(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              bulletinSub === tab.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/40'
                : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-gw-border/30 hover:border-gw-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <ExportButton onClick={handleExportBulletin} />
      </div>

      {/* ── 跨市对比 ── */}
      {bulletinSub === 'compare' && (
        <BulletinCompareTab bulletinCompareData={bulletinCompareData} bulletinTableData={bulletinTableData} bulletinSortCol={bulletinSortCol} bulletinSortDir={bulletinSortDir} handleBulletinSort={handleBulletinSort} bulletinData={bulletinData} />
      )}

      {/* ── 供水结构 ── */}
      {bulletinSub === 'supply' && (
        <BulletinSupplyTab supplyStructureData={supplyStructureData} useStructureData={useStructureData} bulletinData={bulletinData} />
      )}

      {/* ── 地下水动态 ── */}
      {bulletinSub === 'dynamic' && (
        <BulletinDynamicTab gwDynamicData={gwDynamicData} />
      )}

      {/* ── 城市详情 ── */}
      {bulletinSub === 'detail' && (
        <BulletinDetailTab
          selectedBulletin={selectedBulletin}
          countyTableRows={countyTableRows}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          countySortCol={countySortCol}
          countySortDir={countySortDir}
          handleCountySort={handleCountySort}
          bulletinData={bulletinData}
        />
      )}

      <DataSourceNote source="2024年河北省水资源公报 / 各市水资源公报" />
    </div>
  );
}
