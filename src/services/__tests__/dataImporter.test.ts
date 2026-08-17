/**
 * 数据共享与对接 - 测试
 */
import { describe, it, expect, vi } from 'vitest';
import {
  parseCSV,
  parseCSVLine,
  autoDetectMapping,
  validateAndConvert,
  previewImport,
  importWells,
  COLUMN_ALIASES,
} from '../dataImporter';
import type { ImportPreviewRow } from '../dataImporter';
import type { Well } from '../wellNetwork';
import {
  DataSourceConfigManager,
  DEFAULT_CHANNELS,
} from '../dataSourceConfigManager';

// ============ CSV 解析 ============

describe('parseCSVLine', () => {
  it('应解析简单行', () => {
    expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('应解析带引号的行', () => {
    expect(parseCSVLine('"a,b",c')).toEqual(['a,b', 'c']);
  });

  it('应解析双引号转义', () => {
    expect(parseCSVLine('"a""b",c')).toEqual(['a"b', 'c']);
  });

  it('应处理空行', () => {
    expect(parseCSVLine('')).toEqual(['']);
  });

  it('应处理空格', () => {
    expect(parseCSVLine(' a , b , c ')).toEqual(['a', 'b', 'c']);
  });
});

describe('parseCSV', () => {
  it('应解析标准 CSV', () => {
    const result = parseCSV('名称,城市,经度\n井1,石家庄,114.5\n井2,保定,115.5');
    expect(result.headers).toHaveLength(3);
    expect(result.rows).toHaveLength(2);
  });

  it('应处理空文本', () => {
    const result = parseCSV('');
    expect(result.headers).toHaveLength(0);
    expect(result.rows).toHaveLength(0);
  });

  it('应处理只有表头', () => {
    const result = parseCSV('名称,城市,经度');
    expect(result.headers).toHaveLength(3);
    expect(result.rows).toHaveLength(0);
  });
});

describe('autoDetectMapping', () => {
  it('应识别中文列名', () => {
    const mapping = autoDetectMapping(['名称', '城市', '经度', '纬度', '井深']);
    const fields = mapping.map(m => m.targetField);
    expect(fields).toContain('name');
    expect(fields).toContain('city');
    expect(fields).toContain('lng');
    expect(fields).toContain('lat');
    expect(fields).toContain('depth');
  });

  it('应识别英文列名', () => {
    const mapping = autoDetectMapping(['name', 'city', 'lng', 'lat']);
    const fields = mapping.map(m => m.targetField);
    expect(fields).toContain('name');
    expect(fields).toContain('city');
  });

  it('应处理空表头', () => {
    const mapping = autoDetectMapping([]);
    expect(mapping).toHaveLength(0);
  });
});

describe('validateAndConvert', () => {
  const mapping = autoDetectMapping(['名称', '城市', '经度', '纬度']);

  it('应验证有效数据', () => {
    const result = validateAndConvert(
      { '名称': '井1', '城市': '石家庄', '经度': '114.5', '纬度': '38.0' },
      mapping, 2,
    );
    expect(result.valid).toBe(true);
    expect(result.well).toBeDefined();
    expect(result.well?.name).toBe('井1');
    expect(result.well?.city).toBe('石家庄');
  });

  it('应拒绝缺失必填项', () => {
    const result = validateAndConvert(
      { '名称': '', '城市': '石家庄', '经度': '114.5', '纬度': '38.0' },
      mapping, 2,
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('应拒绝无效经度', () => {
    const result = validateAndConvert(
      { '名称': '井1', '城市': '石家庄', '经度': '200', '纬度': '38.0' },
      mapping, 2,
    );
    expect(result.valid).toBe(false);
  });
});

describe('previewImport', () => {
  it('应预览 CSV 导入', () => {
    const csv = '名称,城市,经度,纬度\n井1,石家庄,114.5,38.0\n井2,保定,115.5,39.0';
    const result = previewImport(csv);
    expect(result.headers).toHaveLength(4);
    expect(result.previewRows).toHaveLength(2);
    expect(result.previewRows[0].valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('应处理空 CSV', () => {
    const result = previewImport('');
    expect(result.error).toBeDefined();
  });
});

describe('importWells', () => {
  it('应导入有效井', () => {
    const addWellMock = vi.fn((well: { name: string }) => ({ id: 'W-NEW', ...well }));
    const previewRows = [
      { rowNum: 2, raw: {}, valid: true, errors: [], well: { name: '井1', city: '石家庄', latitude: 38.0, longitude: 114.5, depth: 100, aquiferType: 'shallowPorous' as const, indicators: ['waterLevel'] as const, status: 'active' as const, builtYear: 2010 } },
    ];
    const result = importWells(previewRows as unknown as ImportPreviewRow[], addWellMock as unknown as (w: Omit<Well, 'id'>) => Well | null);
    expect(result.importedCount).toBe(1);
    expect(addWellMock).toHaveBeenCalledTimes(1);
  });
});

describe('COLUMN_ALIASES', () => {
  it('应包含所有必需字段', () => {
    const required = ['name', 'city', 'lng', 'lat', 'depth', 'aquifer', 'indicators', 'status'];
    for (const f of required) {
      expect(COLUMN_ALIASES[f]).toBeDefined();
      expect(COLUMN_ALIASES[f].length).toBeGreaterThan(0);
    }
  });
});

// ============ 数据源配置管理 ============

describe('DataSourceConfigManager', () => {
  it('应添加配置', () => {
    const mgr = new DataSourceConfigManager();
    const config = mgr.add({ name: '测试', type: 'http', endpoint: 'http://test.com/api' });
    expect(config.id).toBeDefined();
    expect(mgr.count).toBe(1);
  });

  it('应获取所有配置', () => {
    const mgr = new DataSourceConfigManager();
    mgr.add({ name: 'A', type: 'http', endpoint: 'http://a.com' });
    mgr.add({ name: 'B', type: 'ws', endpoint: 'ws://b.com' });
    expect(mgr.getAll()).toHaveLength(2);
  });

  it('应按类型筛选', () => {
    const mgr = new DataSourceConfigManager();
    mgr.add({ name: 'A', type: 'http', endpoint: 'http://a.com' });
    mgr.add({ name: 'B', type: 'ws', endpoint: 'ws://b.com' });
    expect(mgr.getByType('http')).toHaveLength(1);
  });

  it('应更新配置', () => {
    const mgr = new DataSourceConfigManager();
    const config = mgr.add({ name: 'A', type: 'http', endpoint: 'http://a.com' });
    mgr.update(config.id, { name: 'A-Updated' });
    expect(mgr.getById(config.id)?.name).toBe('A-Updated');
  });

  it('应删除配置', () => {
    const mgr = new DataSourceConfigManager();
    const config = mgr.add({ name: 'A', type: 'http', endpoint: 'http://a.com' });
    expect(mgr.remove(config.id)).toBe(true);
    expect(mgr.count).toBe(0);
  });

  it('应切换启用状态', () => {
    const mgr = new DataSourceConfigManager();
    const config = mgr.add({ name: 'A', type: 'http', endpoint: 'http://a.com' });
    expect(mgr.getById(config.id)?.enabled).toBe(true);
    mgr.toggleEnabled(config.id);
    expect(mgr.getById(config.id)?.enabled).toBe(false);
  });

  it('应更新状态', () => {
    const mgr = new DataSourceConfigManager();
    const config = mgr.add({ name: 'A', type: 'http', endpoint: 'http://a.com' });
    mgr.updateStatus(config.id, 'connected');
    expect(mgr.getById(config.id)?.status).toBe('connected');
    expect(mgr.getById(config.id)?.lastConnected).toBeDefined();
  });

  it('订阅应在变更时触发', () => {
    const mgr = new DataSourceConfigManager();
    const listener = vi.fn();
    mgr.subscribe(listener);
    mgr.add({ name: 'A', type: 'http', endpoint: 'http://a.com' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('应导出/导入配置', () => {
    const mgr = new DataSourceConfigManager();
    mgr.add({ name: 'A', type: 'http', endpoint: 'http://a.com' });
    const json = mgr.exportConfig();
    const mgr2 = new DataSourceConfigManager();
    expect(mgr2.importConfig(json)).toBe(1);
    expect(mgr2.count).toBe(1);
  });

  it('DEFAULT_CHANNELS 应包含所有通道', () => {
    const channels = DEFAULT_CHANNELS.map(c => c.channel);
    expect(channels).toContain('waterLevel');
    expect(channels).toContain('waterQuality');
    expect(channels).toContain('subsidence');
    expect(channels).toContain('extraction');
  });
});