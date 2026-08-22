/**
 * 监测网优化 — 预设监测区与标签常量（自 monitoringNetworkCalculator 拆分）
 */
import type { MonitoringWell, MonitoringArea } from './monitoringNetworkTypes';

export const PRESET_MONITORING_AREAS: MonitoringArea[] = [
  {
    id: 'baoding-plain',
    name: '保定平原区',
    area: 12000,
    aquiferType: 'shallow',
    cellSize: 2000,
    rows: 30,
    cols: 40,
    wells: generateWells('baoding', 'shallow', 30, 40, 120, [
      { name: '保定市区', row: 15, col: 20, type: 'national' },
      { name: '涿州', row: 5, col: 15, type: 'national' },
      { name: '高碑店', row: 6, col: 22, type: 'provincial' },
      { name: '定兴', row: 8, col: 18, type: 'provincial' },
      { name: '徐水', row: 10, col: 22, type: 'municipal' },
      { name: '满城', row: 14, col: 12, type: 'municipal' },
      { name: '清苑', row: 18, col: 20, type: 'provincial' },
      { name: '望都', row: 16, col: 14, type: 'municipal' },
      { name: '曲阳', row: 12, col: 30, type: 'enterprise' },
      { name: '阜平', row: 8, col: 35, type: 'enterprise' },
      { name: '唐县', row: 10, col: 28, type: 'municipal' },
      { name: '容城', row: 7, col: 25, type: 'national' },
      { name: '雄县', row: 9, col: 28, type: 'national' },
      { name: '安新', row: 11, col: 26, type: 'provincial' },
    ]),
  },
  {
    id: 'hengtai-deep',
    name: '衡水深层水',
    area: 8800,
    aquiferType: 'deep',
    cellSize: 2500,
    rows: 25,
    cols: 30,
    wells: generateWells('hengtai', 'deep', 25, 30, 80, [
      { name: '衡水市区', row: 12, col: 15, type: 'national' },
      { name: '冀州', row: 16, col: 18, type: 'provincial' },
      { name: '枣强', row: 15, col: 22, type: 'provincial' },
      { name: '武邑', row: 10, col: 20, type: 'municipal' },
      { name: '深州', row: 8, col: 14, type: 'national' },
      { name: '武强', row: 9, col: 22, type: 'enterprise' },
      { name: '饶阳', row: 6, col: 18, type: 'municipal' },
      { name: '安平', row: 5, col: 14, type: 'enterprise' },
      { name: '故城', row: 18, col: 25, type: 'provincial' },
      { name: '景县', row: 20, col: 20, type: 'municipal' },
    ]),
  },
  {
    id: 'cangzhou-coastal',
    name: '沧州滨海区',
    area: 6500,
    aquiferType: 'shallow',
    cellSize: 1800,
    rows: 28,
    cols: 25,
    wells: generateWells('cangzhou', 'shallow', 28, 25, 65, [
      { name: '沧州市区', row: 10, col: 12, type: 'national' },
      { name: '黄骅', row: 20, col: 18, type: 'national' },
      { name: '海兴', row: 22, col: 15, type: 'provincial' },
      { name: '盐山', row: 18, col: 20, type: 'municipal' },
      { name: '孟村', row: 16, col: 22, type: 'enterprise' },
      { name: '青县', row: 5, col: 10, type: 'provincial' },
      { name: '沧县', row: 12, col: 15, type: 'municipal' },
    ]),
  },
  {
    id: 'baoding-karst',
    name: '保定西部岩溶区',
    area: 3200,
    aquiferType: 'karst',
    cellSize: 1500,
    rows: 20,
    cols: 18,
    wells: generateWells('karst', 'karst', 20, 18, 40, [
      { name: '涞源县城', row: 5, col: 8, type: 'national' },
      { name: '王安镇泉', row: 8, col: 12, type: 'national' },
      { name: '白石山', row: 10, col: 6, type: 'provincial' },
      { name: '走马驿', row: 14, col: 14, type: 'municipal' },
      { name: '银坊', row: 16, col: 10, type: 'enterprise' },
    ]),
  },
  {
    id: 'zhangjiakou-basin',
    name: '张家口坝上盆地',
    area: 9800,
    aquiferType: 'shallow',
    cellSize: 2200,
    rows: 22,
    cols: 28,
    wells: generateWells('zhangjiakou', 'shallow', 22, 28, 90, [
      { name: '张北县城', row: 10, col: 14, type: 'national' },
      { name: '康保', row: 5, col: 20, type: 'provincial' },
      { name: '沽源', row: 8, col: 8, type: 'municipal' },
      { name: '尚义', row: 15, col: 22, type: 'enterprise' },
      { name: '察北管理区', row: 6, col: 14, type: 'municipal' },
    ]),
  },
  {
    id: 'handan-east',
    name: '邯郸东部平原',
    area: 7500,
    aquiferType: 'deep',
    cellSize: 2000,
    rows: 24,
    cols: 26,
    wells: generateWells('handan', 'deep', 24, 26, 70, [
      { name: '邯郸市区', row: 8, col: 10, type: 'national' },
      { name: '永年', row: 6, col: 14, type: 'provincial' },
      { name: '肥乡', row: 12, col: 16, type: 'municipal' },
      { name: '成安', row: 14, col: 12, type: 'enterprise' },
      { name: '大名', row: 18, col: 20, type: 'provincial' },
      { name: '魏县', row: 16, col: 24, type: 'municipal' },
      { name: '馆陶', row: 14, col: 25, type: 'enterprise' },
      { name: '邱县', row: 10, col: 22, type: 'municipal' },
    ]),
  },
];

/** 生成监测井数据 */
function generateWells(
  areaPrefix: string,
  aquiferType: 'shallow' | 'deep' | 'karst',
  rows: number,
  cols: number,
  targetCount: number,
  customWells: { name: string; row: number; col: number; type: 'national' | 'provincial' | 'municipal' | 'enterprise' }[],
): MonitoringWell[] {
  const wells: MonitoringWell[] = [];
  const cellSize = 2000; // 用于坐标

  // 添加自定义井
  customWells.forEach((cw, idx) => {
    wells.push({
      id: `${areaPrefix}-W${String(idx + 1).padStart(3, '0')}`,
      name: cw.name,
      row: cw.row,
      col: cw.col,
      x: cw.col * cellSize,
      y: cw.row * cellSize,
      aquiferType,
      frequency: cw.type === 'national' ? 12 : cw.type === 'provincial' ? 6 : 4,
      startDate: cw.type === 'national' ? 2014 : cw.type === 'provincial' ? 2016 : 2018,
      type: cw.type,
    });
  });

  return wells;
}

/** 监测井类型标签 */
export const WELL_TYPE_LABELS: Record<MonitoringWell['type'], string> = {
  national: '国考点',
  provincial: '省考点',
  municipal: '市考点',
  enterprise: '企业井',
};

/** 含水层类型标签 */
export const AQUIFER_LABELS: Record<MonitoringArea['aquiferType'], string> = {
  shallow: '浅层地下水',
  deep: '深层承压水',
  karst: '岩溶水',
};

/** 监测密度标准参考 */
export const DENSITY_STANDARDS = [
  { type: 'shallow', label: '平原区潜水', minSpacing: 50, maxSpacing: 100, recommended: 75 },
  { type: 'deep', label: '平原区承压水', minSpacing: 100, maxSpacing: 200, recommended: 150 },
  { type: 'karst', label: '岩溶区', minSpacing: 30, maxSpacing: 80, recommended: 50 },
] as const;

