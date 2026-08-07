/**
 * H-07 标准化数据导出 测试
 */
import { describe, it, expect } from 'vitest';
import {
  arrayToCSV,
  buildSheetData,
  SHEET_META,
  exportCSV,
  exportJSON,
} from '../dataExporter';
import type { ExportDataSources, ExportSheet } from '../dataExporter';

describe('arrayToCSV', () => {
  it('应正确转换简单二维数组', () => {
    const csv = arrayToCSV([['a', 'b'], ['1', '2']]);
    expect(csv).toBe('a,b\n1,2');
  });

  it('应转义含逗号的字段', () => {
    const csv = arrayToCSV([['a,b', 'c']]);
    expect(csv).toBe('"a,b",c');
  });

  it('应转义含引号的字段', () => {
    const csv = arrayToCSV([['a"b']]);
    expect(csv).toBe('"a""b"');
  });
});

describe('buildSheetData', () => {
  const mockData: ExportDataSources = {
    wells: [
      { id: 'W1', name: '井1', city: '石家庄', lng: 114.5, lat: 38.0, depth: 100, aquifer: '浅层', indicators: ['waterLevel', 'waterQuality'], status: 'active', group: 'A', note: '' },
      { id: 'W2', name: '井2', city: '保定', lng: 115.5, lat: 39.0, depth: 200, aquifer: '深层', indicators: ['waterLevel'], status: 'active', group: 'A', note: '备用' },
    ],
    alerts: [
      { id: 'A1', wellId: 'W1', type: 'threshold', severity: 'warning', message: '水位偏高', createdAt: '2026-08-01', read: false },
    ],
    balanceResult: {
      period: { periodId: '2011-2020', periodLabel: '2011-2020年', totalRecharge: 118.456, totalDischarge: 124.750, balance: -6.294, storageChange: -5.887, note: '南水北调', rechargeItems: [], dischargeItems: [] },
      cities: ['石家庄', '保定'],
      wellCount: 2,
      isOverdrafted: true,
      overdraftIntensity: 0.58,
      totalArea: 10000,
      sortedRecharge: [],
      sortedDischarge: [],
    },
    cityBalances: [
      { city: '石家庄', area: 6673, wellCount: 1, recharge: 10, discharge: 12, balance: -2, isOverdrafted: true, overdraftIntensity: 0.3, factor: '开采强度高' },
      { city: '保定', area: 10994, wellCount: 1, recharge: 8, discharge: 9, balance: -1, isOverdrafted: true, overdraftIntensity: 0.09, factor: '补给条件差' },
    ],
    qualityAssessments: [],
    qualitySummary: {
      totalSites: 2,
      classDistribution: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 0 },
      exceededSites: 1,
      exceedRate: 50,
      topFactors: [{ indicator: 'TDS', label: '溶解性总固体', count: 1, rate: 50 }],
      sulinDistribution: { 'HCO₃-Ca·Mg型': 1 },
    },
    qualityCityStats: [
      { city: '石家庄', siteCount: 1, classDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 }, exceededSites: 1, averageClass: 4.0, mainFactors: ['TDS'] },
      { city: '保定', siteCount: 1, classDistribution: { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0 }, exceededSites: 0, averageClass: 2.0, mainFactors: [] },
    ],
    integratedAnalysis: {
      cities: [],
      summary: { totalCities: 2, dualPoor: 1, dualGood: 0, overdraftGoodQuality: 0, surplusPoorQuality: 0, bestCity: '保定', worstCity: '石家庄', overdraftQualityPattern: '超采区', keyRecommendations: ['优先治理石家庄'] },
      ranking: [
        { rank: 1, city: '保定', compositeScore: 65, balanceScore: 55, qualityScore: 75, isOverdrafted: true, qualityClass: 2, quadrant: 3 },
        { rank: 2, city: '石家庄', compositeScore: 35, balanceScore: 30, qualityScore: 40, isOverdrafted: true, qualityClass: 4, quadrant: 1 },
      ],
      alertCities: [],
      recommendations: ['优先治理石家庄'],
      hasData: true,
    },
  };

  it('井网标签页应有表头', () => {
    const rows = buildSheetData('wells', mockData);
    expect(rows[0]).toContain('编号');
    expect(rows[0]).toContain('名称');
    expect(rows[0]).toContain('城市');
    expect(rows.length).toBe(3); // 表头+2井
  });

  it('告警标签页应有数据', () => {
    const rows = buildSheetData('alerts', mockData);
    expect(rows.length).toBe(2); // 表头+1告警
    expect(rows[1][0]).toBe('A1');
  });

  it('均衡标签页应有城市数据', () => {
    const rows = buildSheetData('balance', mockData);
    expect(rows.length).toBeGreaterThan(2);
    expect(rows[1][0]).toBe('石家庄');
    expect(rows[2][0]).toBe('保定');
  });

  it('水质标签页应有城市数据', () => {
    const rows = buildSheetData('quality', mockData);
    expect(rows.length).toBe(3); // 表头+2市
    expect(rows[1][0]).toBe('石家庄');
    expect(rows[1][7]).toBe('1'); // exceededSites
  });

  it('联动标签页应有排名', () => {
    const rows = buildSheetData('integrated', mockData);
    expect(rows.length).toBeGreaterThan(2);
    expect(rows[1][0]).toBe('保定');
  });

  it('未知标签页应返回空数组', () => {
    const rows = buildSheetData('unknown' as ExportSheet, mockData);
    expect(rows).toHaveLength(0);
  });
});

describe('buildSheetData - 空数据', () => {
  const emptyData: ExportDataSources = {
    wells: [],
    alerts: [],
    balanceResult: null,
    cityBalances: [],
    qualityAssessments: [],
    qualitySummary: null,
    qualityCityStats: [],
    integratedAnalysis: null,
  };

  it('空井网应只有表头', () => {
    const rows = buildSheetData('wells', emptyData);
    expect(rows.length).toBe(1);
  });

  it('空告警应只有表头', () => {
    const rows = buildSheetData('alerts', emptyData);
    expect(rows.length).toBe(1);
  });
});

describe('exportCSV', () => {
  it('应生成包含所有标签页的CSV', () => {
    const data: ExportDataSources = {
      wells: [{ id: 'W1', name: '井1', city: '石家庄', lng: 114.5, lat: 38.0, depth: 100, aquifer: '浅层', indicators: ['waterLevel'], status: 'active', group: 'A', note: '' }],
      alerts: [],
      balanceResult: null,
      cityBalances: [],
      qualityAssessments: [],
      qualitySummary: null,
      qualityCityStats: [],
      integratedAnalysis: null,
    };
    const blob = exportCSV(data, ['wells']);
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(blob.size).toBeGreaterThan(0);
  });
});

describe('exportJSON', () => {
  it('应生成JSON Blob', () => {
    const data: ExportDataSources = {
      wells: [{ id: 'W1', name: '井1', city: '石家庄', lng: 114.5, lat: 38.0, depth: 100, aquifer: '浅层', indicators: ['waterLevel'], status: 'active', group: 'A', note: '' }],
      alerts: [],
      balanceResult: null,
      cityBalances: [],
      qualityAssessments: [],
      qualitySummary: null,
      qualityCityStats: [],
      integratedAnalysis: null,
    };
    const blob = exportJSON(data, ['wells']);
    expect(blob.type).toBe('application/json;charset=utf-8');
    expect(blob.size).toBeGreaterThan(0);
  });
});

describe('SHEET_META', () => {
  it('应包含所有标签页定义', () => {
    const sheets: ExportSheet[] = ['wells', 'readings', 'alerts', 'balance', 'quality', 'integrated'];
    for (const s of sheets) {
      expect(SHEET_META[s]).toBeDefined();
      expect(SHEET_META[s].label).toBeTruthy();
    }
  });
});