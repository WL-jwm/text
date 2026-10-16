/**
 * 数据校验规则与模板（拆分自 DataValidationPanel.tsx）
 */
export interface ValidationRule {
  field: string;
  type: 'required' | 'numeric' | 'range' | 'enum' | 'unique' | 'pattern';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
  label: string;
}

export interface ValidationResult {
  rule: ValidationRule;
  status: 'pass' | 'warn' | 'fail';
  details: string;
  affectedRows: number;
}

export function validateDataset(
  data: Record<string, unknown>[],
  rules: ValidationRule[]
): ValidationResult[] {
  if (data.length === 0) return [];

  return rules.map(rule => {
    const { field, type, params = {}, label: _label } = rule;

    switch (type) {
      case 'required': {
        const missing = data.filter(r => !r[field] || String(r[field]).trim() === '');
        const rate = missing.length / data.length;
        return {
          rule, status: rate === 0 ? 'pass' : rate > 0.5 ? 'fail' : 'warn',
          details: `缺失${missing.length}行(${(rate * 100).toFixed(1)}%)`,
          affectedRows: missing.length,
        };
      }
      case 'numeric': {
        const nonNumeric = data.filter(r => r[field] !== undefined && r[field] !== '' && isNaN(Number(r[field])));
        return {
          rule, status: nonNumeric.length === 0 ? 'pass' : nonNumeric.length > data.length * 0.3 ? 'fail' : 'warn',
          details: `非数值${nonNumeric.length}行`,
          affectedRows: nonNumeric.length,
        };
      }
      case 'range': {
        const { min, max } = params;
        const outOfRange = data.filter(r => {
          const v = Number(r[field]);
          return !isNaN(v) && ((min !== undefined && v < min) || (max !== undefined && v > max));
        });
        return {
          rule, status: outOfRange.length === 0 ? 'pass' : outOfRange.length > data.length * 0.2 ? 'fail' : 'warn',
          details: `超出范围[${min ?? '-∞'}, ${max ?? '+∞'}] ${outOfRange.length}行`,
          affectedRows: outOfRange.length,
        };
      }
      case 'enum': {
        const allowed = new Set(params.values as string[]);
        const invalid = data.filter(r => r[field] && !allowed.has(String(r[field])));
        return {
          rule, status: invalid.length === 0 ? 'pass' : invalid.length > data.length * 0.2 ? 'fail' : 'warn',
          details: `非法值${invalid.length}行, 允许: [${Array.from(allowed).join(', ')}]`,
          affectedRows: invalid.length,
        };
      }
      case 'unique': {
        const vals = data.map(r => String(r[field] ?? ''));
        const unique = new Set(vals);
        const dupes = vals.length - unique.size;
        return {
          rule, status: dupes === 0 ? 'pass' : dupes > data.length * 0.1 ? 'fail' : 'warn',
          details: `重复${dupes}行, 唯一值${unique.size}个`,
          affectedRows: dupes,
        };
      }
      case 'pattern': {
        const regex = new RegExp(params.pattern as string);
        const noMatch = data.filter(r => r[field] && !regex.test(String(r[field])));
        return {
          rule, status: noMatch.length === 0 ? 'pass' : noMatch.length > data.length * 0.3 ? 'fail' : 'warn',
          details: `不匹配${noMatch.length}行`,
          affectedRows: noMatch.length,
        };
      }
      default:
        return { rule, status: 'pass', details: '未实现', affectedRows: 0 };
    }
  });
}

export const BUILTIN_TEMPLATES: Record<string, { label: string; rules: ValidationRule[] }> = {
  '监测数据': {
    label: '地下水监测数据',
    rules: [
      { field: '监测井编号', type: 'required', label: '监测井编号' },
      { field: '监测井编号', type: 'pattern', params: { pattern: '^[A-Z]?\\d{4,}$' }, label: '编号格式' },
      { field: '水位', type: 'numeric', label: '水位数值' },
      { field: '水位', type: 'range', params: { min: -200, max: 200 }, label: '水位范围' },
      { field: '监测日期', type: 'required', label: '监测日期' },
    ],
  },
  '水质数据': {
    label: '水质检测数据',
    rules: [
      { field: '站点', type: 'required', label: '站点名称' },
      { field: 'pH', type: 'range', params: { min: 0, max: 14 }, label: 'pH范围' },
      { field: '总硬度', type: 'numeric', label: '总硬度' },
      { field: '溶解性总固体', type: 'numeric', label: 'TDS' },
      { field: '水质类别', type: 'enum', params: { values: ['I', 'II', 'III', 'IV', 'V', '劣V'] }, label: '水质类别' },
    ],
  },
  '开采量': {
    label: '地下水开采量',
    rules: [
      { field: '地区', type: 'required', label: '地区名称' },
      { field: '年份', type: 'numeric', label: '年份' },
      { field: '年份', type: 'range', params: { min: 1990, max: 2030 }, label: '年份范围' },
      { field: '开采量', type: 'numeric', label: '开采量' },
      { field: '开采量', type: 'range', params: { min: 0 }, label: '开采量非负' },
    ],
  },
};
