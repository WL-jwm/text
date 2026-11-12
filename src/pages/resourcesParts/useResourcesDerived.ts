/**
 * 拆分自 Resources.tsx — 公报派生数据 hook / 导出处理函数 / TAB 配置与总览常量
 * 类型标注与原内联 useMemo 完全一致（依赖数组照搬，保持行为不变）
 */

import { useMemo } from 'react';
import {
  cityWaterSupply2024,
  cityGroundwaterDynamic2024,
  resourceTimeSeries,
} from '../../data/resources';
import { getBulletinData } from '../../components/YearSwitcher';
import { exportDataCSV } from '../../utils/exportUtils';
import type { CityBulletinData } from '../../types/county';

/** 公报行类型（随 dataYear 变化） */
export type BulletinRow = ReturnType<typeof getBulletinData>[number];

/** 水资源总览常量（多年均值口径） */
export const WS_SUMMARY = {
  rainfall: { value: 659.3, unit: 'mm', yoyChange: '+12.8%', multiAvg: 520.8, multiChange: '+26.6%' },
  totalResource: { value: 247.92, unit: '亿m3', yoyChange: '+2.7%', multiAvg: 176.47, multiChange: '+40.5%' },
  surfaceWater: { value: 140.76, unit: '亿m3', multiAvg: 90.27, multiChange: '+55.9%' },
  groundwater: { value: 179.94, unit: '亿m3', multiAvg: 114.22, multiChange: '+57.5%' },
  perCapita: { value: 336, unit: 'm3/person' },
  runOffCoeff: { value: 0.2 },
  runOffModule: { value: 13.21, unit: '万m3/km2' },
};

/** 公报对比/供水结构/用水结构/动态/表格等派生数据 */
export function useResourcesDerived(
  dataYear: number,
  selectedCity: string | null,
  bulletinSortCol: number | null,
  bulletinSortDir: 'asc' | 'desc',
  countySortCol: number | null,
  countySortDir: 'asc' | 'desc'
) {
  const currentBulletin = useMemo(() => getBulletinData(dataYear), [dataYear]);

  const bulletinCompareData = useMemo(() =>
    currentBulletin.map(l => ({
      name: l.city.replace('市', '').replace('新区', ''),
      降水量: l.precipitation,
      地表水: l.surfaceWater,
      地下水: l.groundWater,
      水资源总量: l.totalWater,
      总供水: l.totalSupply ?? 0,
      地下水供水: l.groundSupply ?? 0,
      降水总量: l.precipTotal ?? 0,
    })).sort((a, b) => b.水资源总量 - a.水资源总量),
    []
  );

  const supplyStructureData = useMemo(() =>
    currentBulletin.filter(l => l.totalSupply != null).map(l => ({
      name: l.city.replace('市', '').replace('新区', ''),
      本地地表水: l.localSurfaceSupply ?? 0,
      跨流域调水: l.interBasinTransferSupply ?? 0,
      地下水: l.groundSupply ?? 0,
      其他: (l.totalSupply ?? 0) - (l.localSurfaceSupply ?? 0) - (l.interBasinTransferSupply ?? 0) - (l.groundSupply ?? 0),
    })).sort((a, b) => b.本地地表水 + b.跨流域调水 + b.地下水 + b.其他 - (a.本地地表水 + a.跨流域调水 + a.地下水 + a.其他)),
    []
  );

  const useStructureData = useMemo(() =>
    currentBulletin.filter(l => l.agriUse != null).map(l => ({
      name: l.city.replace('市', '').replace('新区', ''),
      农业: l.agriUse ?? 0,
      工业: l.industryUse ?? 0,
      生活: l.domesticUse ?? 0,
      生态: l.ecoUse ?? 0,
    })),
    [currentBulletin]
  );

  const gwDynamicData: { name: string; 浅层埋深: number; 浅层变化: number; 深层埋深: number; 深层变化: number }[] = useMemo(() =>
    cityGroundwaterDynamic2024.filter(l => l.shallowDepth != null || l.deepDepth != null).map(l => ({
      name: (l.city || '').replace('市', '').replace('全省', '全省平均'),
      浅层埋深: l.shallowDepth ?? 0,
      浅层变化: l.shallowChange ?? 0,
      深层埋深: l.deepDepth ?? 0,
      深层变化: l.deepChange ?? 0,
    })),
    []
  );

  const selectedBulletin = useMemo(() =>
    selectedCity ? (currentBulletin as unknown as CityBulletinData[]).find(l => l.city === selectedCity) ?? null : null,
    [selectedCity, currentBulletin]
  );

  const bulletinTableData = useMemo(() => {
    let l = currentBulletin.map(n => ({
      name: n.city,
      降水: n.precipitation,
      地表水: n.surfaceWater,
      地下水: n.groundWater,
      总量: n.totalWater,
      供水: n.totalSupply ?? 0,
      地下水供水比: n.totalSupply && n.groundSupply ? n.groundSupply / n.totalSupply * 100 : 0,
      浅层埋深: n.shallowDepth ?? 0,
      浅层变化: n.shallowChange ?? 0,
      县级数据: n.counties?.length ?? 0,
    }));
    if (bulletinSortCol != null) {
      const keys = ['name', '降水', '地表水', '地下水', '总量', '供水', '地下水供水比', '浅层埋深', '浅层变化', '县级数据'];
      const key = keys[bulletinSortCol];
      if (key) {
        l = [...l].sort((a, b) => {
          const va = a[key as keyof typeof a];
          const vb = b[key as keyof typeof b];
          if (typeof va === 'string') {
            return bulletinSortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
          }
          return bulletinSortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
        });
      }
    }
    return l;
  }, [bulletinSortCol, bulletinSortDir]);

  const countyTableRows = useMemo(() => {
    if (!selectedBulletin?.counties) return [];
    const keys = ['name', 'precip', 'surface', 'ground', 'total', 'totalUse', 'agri', 'gwUse'];
    let n = selectedBulletin.counties.filter((p): p is NonNullable<typeof p> => p != null).map(p => ({
      name: p.name,
      precip: p.precip ?? 0,
      surface: p.surface ?? 0,
      ground: p.ground ?? 0,
      total: p.total ?? 0,
      totalUse: p.totalUse ?? 0,
      agri: p.agri ?? 0,
      gwUse: p.gwUse ?? 0,
      hasData: p.precip != null,
    }));
    if (countySortCol != null) {
      const key = keys[countySortCol] as keyof typeof n[0];
      if (key) {
        n = n.sort((a, b) => countySortDir === 'asc' ? (a[key] as number) - (b[key] as number) : (b[key] as number) - (a[key] as number));
      }
    }
    return n;
  }, [selectedBulletin, countySortCol, countySortDir]);

  return {
    currentBulletin,
    bulletinCompareData,
    supplyStructureData,
    useStructureData,
    gwDynamicData,
    selectedBulletin,
    bulletinTableData,
    countyTableRows,
  };
}

interface ExportDeps {
  notify: (msg: string) => void;
  currentBulletin: BulletinRow[];
  dataYear: number;
}

/** 生成 4 个 CSV 导出处理函数 */
export function buildResourcesExportHandlers({ notify, currentBulletin, dataYear }: ExportDeps) {
  const handleExportSupply = () => {
    exportDataCSV(cityWaterSupply2024 as Record<string, unknown>[], '河北各市供水量2024');
    notify('数据已导出');
  };

  const handleExportDynamic = () => {
    exportDataCSV(cityGroundwaterDynamic2024 as Record<string, unknown>[], '河北各市地下水动态2024');
    notify('数据已导出');
  };

  const handleExportTimeseries = () => {
    exportDataCSV(resourceTimeSeries as Record<string, unknown>[], '河北水资源时序');
    notify('数据已导出');
  };

  const handleExportBulletin = () => {
    const data = currentBulletin.map(n => ({
      城市: n.city,
      '面积km2': n.area,
      '降水mm': n.precipitation,
      '降水总量亿m3': n.precipTotal,
      '地表水亿m3': n.surfaceWater,
      '地下水亿m3': n.groundWater,
      '重复量亿m3': n.repeatCalc,
      '水资源总量亿m3': n.totalWater,
      '产水系数': n.coeff,
      '总供水亿m3': n.totalSupply,
      '本地地表水供水亿m3': n.localSurfaceSupply,
      '跨流域调水亿m3': n.interBasinTransferSupply,
      '地下水供水亿m3': n.groundSupply,
      '其他供水亿m3': n.otherSupply,
      '农业用水亿m3': n.agriUse,
      '工业用水亿m3': n.industryUse,
      '生活用水亿m3': n.domesticUse,
      '生态用水亿m3': n.ecoUse,
      '浅层埋深m': n.shallowDepth,
      '浅层变化m': n.shallowChange,
    }));
    exportDataCSV(data as Record<string, unknown>[], `河北各市${dataYear}年水资源公报`);
    notify('公报数据已导出');
  };

  return { handleExportSupply, handleExportDynamic, handleExportTimeseries, handleExportBulletin };
}
