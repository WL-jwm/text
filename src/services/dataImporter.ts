/**
 * 数据共享与对接 - 数据导入服务
 * 支持 CSV/Excel 导入监测井台账，列映射与验证
 */
import type { Well, AquiferType, WellStatus } from './wellNetwork';
import type { DataChannel } from './realtimeDataService';

// ============ 数据模型 ============

/** 导入列映射配置 */
export interface ColumnMapping {
  /** 目标字段 */
  targetField: string;
  /** 源列名 */
  sourceColumn: string;
  /** 是否必填 */
  required: boolean;
  /** 默认值（可选） */
  defaultValue?: string;
}

/** 导入预览行 */
export interface ImportPreviewRow {
  /** 行号 */
  rowNum: number;
  /** 原始数据 */
  raw: Record<string, string>;
  /** 是否有效 */
  valid: boolean;
  /** 验证错误 */
  errors: string[];
  /** 转换后的 Well 数据 */
  well?: Omit<Well, 'id'>;
}

/** 导入结果 */
export interface ImportResult {
  success: boolean;
  /** 成功导入数 */
  importedCount: number;
  /** 失败数 */
  failedCount: number;
  /** 错误详情 */
  errors: { rowNum: number; message: string }[];
  /** 导入的井 ID */
  importedIds: string[];
}

/** 导入进度 */
export interface ImportProgress {
  status: 'idle' | 'parsing' | 'validating' | 'importing' | 'done' | 'error';
  total: number;
  current: number;
  message: string;
}

// ============ 默认列映射 ============

/** 默认列映射配置（支持中英文列名） */
export const DEFAULT_WELL_COLUMN_MAPPING: ColumnMapping[] = [
  { targetField: 'name', sourceColumn: '名称', required: true },
  { targetField: 'city', sourceColumn: '城市', required: true },
  { targetField: 'lng', sourceColumn: '经度', required: true },
  { targetField: 'lat', sourceColumn: '纬度', required: true },
  { targetField: 'depth', sourceColumn: '井深', required: false, defaultValue: '0' },
  { targetField: 'aquifer', sourceColumn: '含水层', required: false, defaultValue: 'shallowPorous' },
  { targetField: 'indicators', sourceColumn: '监测指标', required: false, defaultValue: 'waterLevel' },
  { targetField: 'status', sourceColumn: '状态', required: false, defaultValue: 'active' },
  { targetField: 'note', sourceColumn: '备注', required: false },
];

/** 中英文列名映射表（用于自动识别） */
export const COLUMN_ALIASES: Record<string, string[]> = {
  name: ['名称', 'name', '井名', '井名称', '监测点名称', 'StationName'],
  city: ['城市', 'city', '地区', '所在市', '行政区', 'City'],
  lng: ['经度', 'lng', 'longitude', 'Longitude', 'X', 'x'],
  lat: ['纬度', 'lat', 'latitude', 'Latitude', 'Y', 'y'],
  depth: ['井深', 'depth', '深度', 'm', 'Depth', '井深(m)'],
  aquifer: ['含水层', 'aquifer', '含水层类型', 'AquiferType', 'Aquifer'],
  indicators: ['监测指标', 'indicators', '指标', '监测项目', 'Channel', 'channels'],
  status: ['状态', 'status', '运行状态', 'Status', '井状态'],
  note: ['备注', 'note', '备注信息', '说明', 'Note'],
};

// ============ 解析引擎 ============

/**
 * 自动识别列映射
 * 根据 CSV 表头匹配别名表
 * 纯函数，可测试
 */
export function autoDetectMapping(headers: string[]): ColumnMapping[] {
  const mapping: ColumnMapping[] = [];

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    const matched = headers.find(h => {
      const trimmed = h.trim().toLowerCase();
      return aliases.some(a => a.toLowerCase() === trimmed);
    });
    if (matched) {
      const defaultMapping = DEFAULT_WELL_COLUMN_MAPPING.find(m => m.targetField === field);
      mapping.push({
        targetField: field,
        sourceColumn: matched,
        required: defaultMapping?.required ?? false,
        defaultValue: defaultMapping?.defaultValue,
      });
    }
  }

  return mapping;
}

/**
 * 解析 CSV 文本
 * 纯函数，可测试
 */
export function parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCSVLine(lines[0]);
  const rows: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length > 0) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

/**
 * 解析单行 CSV（支持引号转义）
 * 纯函数，可测试
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());

  return result;
}

/**
 * 验证并转换行数据为 Well
 * 纯函数，可测试
 */
export function validateAndConvert(
  row: Record<string, string>,
  mapping: ColumnMapping[],
  rowNum: number,
): ImportPreviewRow {
  const errors: string[] = [];
  const raw: Record<string, string> = {};

  for (const m of mapping) {
    const val = row[m.sourceColumn]?.trim() ?? '';
    raw[m.targetField] = val;

    if (m.required && !val) {
      errors.push(`[${m.targetField}] ${m.sourceColumn} 为必填项`);
    }
  }

  // 验证经度
  const lngStr = raw.lng ?? '';
  const lng = parseFloat(lngStr);
  if (lngStr && (isNaN(lng) || lng < 73 || lng > 135)) {
    errors.push(`[经度] "${lngStr}" 无效（范围 73-135）`);
  }

  // 验证纬度
  const latStr = raw.lat ?? '';
  const lat = parseFloat(latStr);
  if (latStr && (isNaN(lat) || lat < 3 || lat > 54)) {
    errors.push(`[纬度] "${latStr}" 无效（范围 3-54）`);
  }

  // 验证井深
  const depthStr = raw.depth ?? '';
  const depth = parseFloat(depthStr);
  if (depthStr && (isNaN(depth) || depth < 0 || depth > 5000)) {
    errors.push(`[井深] "${depthStr}" 无效（范围 0-5000m）`);
  }

  // 验证含水层类型
  const aquiferStr = raw.aquifer ?? '';
  const aquiferLabelMap: Record<string, AquiferType> = {
    '浅层孔隙水': 'shallowPorous', 'shallowPorous': 'shallowPorous',
    '深层孔隙水': 'deepPorous', 'deepPorous': 'deepPorous',
    '岩溶水': 'karst', 'karst': 'karst',
    '裂隙水': 'fracture', 'fracture': 'fracture',
  };
  const aquifer = aquiferLabelMap[aquiferStr] ?? 'shallowPorous';

  // 验证状态
  const statusStr = raw.status ?? '';
  const statusLabelMap: Record<string, WellStatus> = {
    '运行': 'active', 'active': 'active',
    '维护': 'maintenance', 'maintenance': 'maintenance',
    '停用': 'inactive', 'inactive': 'inactive',
  };
  const status = statusLabelMap[statusStr] ?? 'active';

  // 解析监测指标
  const indicatorsStr = raw.indicators ?? '';
  const indicators: DataChannel[] = indicatorsStr
    .split(/[;；,，、\s]+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => ['waterlevel', 'waterquality', 'subsidence', 'extraction'].includes(s))
    .map(s => {
      if (s === 'waterlevel') return 'waterLevel';
      if (s === 'waterquality') return 'waterQuality';
      return s as DataChannel;
    });

  const valid = errors.length === 0;

  const well: Omit<Well, 'id'> | undefined = valid
    ? {
        name: raw.name ?? '',
        city: raw.city ?? '',
        latitude: parseFloat(raw.lat ?? '0'),
        longitude: parseFloat(raw.lng ?? '0'),
        depth: depthStr ? parseFloat(depthStr) : 0,
        aquiferType: aquifer,
        indicators: indicators.length > 0 ? indicators : ['waterLevel'],
        status,
        // CSV 列一般不含建井年份，缺省给 2010
        builtYear: raw.builtYear ? parseInt(raw.builtYear) : 2010,
        notes: raw.note ?? '',
      }
    : undefined;

  return { rowNum, raw, valid, errors, well };
}

/**
 * 批量导入井数据
 * 调用 wellNetwork.addWell 逐个导入
 */
export function importWells(
  previewRows: ImportPreviewRow[],
  addWellFn: (well: Omit<Well, 'id'>) => Well | null,
  onProgress?: (progress: ImportProgress) => void,
): ImportResult {
  const validRows = previewRows.filter(r => r.valid && r.well);
  const importedIds: string[] = [];
  const errors: { rowNum: number; message: string }[] = [];

  onProgress?.({ status: 'importing', total: validRows.length, current: 0, message: `开始导入 ${validRows.length} 口井...` });

  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i];
    try {
      if (row.well) {
        const added = addWellFn(row.well);
        if (added) {
          importedIds.push(added.id);
        } else {
          errors.push({ rowNum: row.rowNum, message: '导入失败: 井创建返回空' });
        }
      }
    } catch (err) {
      errors.push({ rowNum: row.rowNum, message: `导入失败: ${err instanceof Error ? err.message : '未知错误'}` });
    }
    onProgress?.({ status: 'importing', total: validRows.length, current: i + 1, message: `导入中 ${i + 1}/${validRows.length}...` });
  }

  onProgress?.({ status: 'done', total: validRows.length, current: validRows.length, message: `导入完成: ${importedIds.length} 成功, ${errors.length} 失败` });

  return {
    success: importedIds.length > 0,
    importedCount: importedIds.length,
    failedCount: errors.length + (previewRows.length - validRows.length),
    errors,
    importedIds,
  };
}

/**
 * 预览 CSV 导入数据
 * 纯函数，可测试
 */
export function previewImport(
  csvText: string,
): { headers: string[]; mapping: ColumnMapping[]; previewRows: ImportPreviewRow[]; error?: string } {
  const { headers, rows } = parseCSV(csvText);

  if (headers.length === 0) {
    return { headers: [], mapping: [], previewRows: [], error: 'CSV 文件为空或格式不正确' };
  }

  const mapping = autoDetectMapping(headers);
  const previewRows = rows.map((row, i) => {
    const rowData: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      rowData[headers[j]] = row[j] ?? '';
    }
    return validateAndConvert(rowData, mapping, i + 2);
  });

  return { headers, mapping, previewRows };
}