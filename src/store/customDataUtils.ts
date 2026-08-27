/**
 * 自定义数据接入 Store (D-04) — 工具函数
 *
 * 拆分自 customDataStore.ts：模板查找 / 列名自动映射 / 数据标准化 / 验证
 */

import { DATA_TEMPLATES } from './customDataTemplates';
import type {
  ColumnMapping,
  DataTemplate,
  DataTemplateType,
  ValidationResult,
} from './customDataTypes';

export function getTemplate(type: DataTemplateType): DataTemplate | undefined {
  return DATA_TEMPLATES.find(t => t.type === type);
}

// ============================================================
// 列名自动映射
// ============================================================

/** 根据原始列名自动推断标准字段 */
export function autoMapColumns(
  originalColumns: string[],
  template: DataTemplate,
): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  const usedFields = new Set<string>();

  for (const col of originalColumns) {
    const colLower = col.toLowerCase().trim();
    let bestField: string | null = null;

    for (const field of template.fields) {
      if (usedFields.has(field.name)) continue;
      const matched = field.matchKeywords.some(kw =>
        colLower.includes(kw.toLowerCase()) || col.includes(kw)
      );
      if (matched) {
        bestField = field.name;
        break;
      }
    }

    mappings.push({
      sourceColumn: col,
      targetField: bestField ?? '',
      type: template.fields.find(f => f.name === bestField)?.type ?? 'string',
    });

    if (bestField) usedFields.add(bestField);
  }

  return mappings;
}

// ============================================================
// 数据标准化与验证
// ============================================================

/** 应用列映射，生成标准化数据 */
export function applyMapping(
  rawData: Record<string, unknown>[],
  mappings: ColumnMapping[],
  template: DataTemplate,
): Record<string, unknown>[] {
  return rawData.map(row => {
    const standardized: Record<string, unknown> = {};

    // 应用映射
    for (const mapping of mappings) {
      if (!mapping.targetField) continue;
      const rawValue = row[mapping.sourceColumn];
      if (rawValue === undefined || rawValue === '') continue;

      if (mapping.type === 'number') {
        const num = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue).replace(/[^\d.-]/g, ''));
        standardized[mapping.targetField] = isNaN(num) ? null : num;
      } else {
        standardized[mapping.targetField] = String(rawValue);
      }
    }

    // 填充默认值
    for (const field of template.fields) {
      if (!(field.name in standardized) && field.defaultValue !== undefined) {
        standardized[field.name] = field.defaultValue;
      }
    }

    return standardized;
  });
}

/** 验证标准化后的数据 */
export function validateData(
  rows: Record<string, unknown>[],
  template: DataTemplate,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  let validRowCount = 0;

  // 检查必填字段
  const requiredFields = template.fields.filter(f => f.required);
  if (requiredFields.length > 0 && rows.length > 0) {
    const firstRow = rows[0];
    for (const field of requiredFields) {
      if (!(field.name in firstRow) || firstRow[field.name] === null || firstRow[field.name] === undefined) {
        missingFields.push(field.label);
      }
    }
  }

  // 逐行验证
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let rowValid = true;

    for (const field of template.fields) {
      if (!field.required) continue;
      const val = row[field.name];
      if (val === null || val === undefined || val === '') {
        rowValid = false;
        break;
      }
      // 数值范围检查
      if (field.type === 'number' && field.range && typeof val === 'number') {
        if (val < field.range.min || val > field.range.max) {
          warnings.push(`第${i + 2}行: ${field.label}=${val} 超出范围[${field.range.min}, ${field.range.max}]`);
        }
      }
    }

    if (rowValid) validRowCount++;
  }

  if (missingFields.length > 0) {
    errors.push(`必填字段缺失: ${missingFields.join(', ')}`);
  }
  if (rows.length > 0 && validRowCount === 0) {
    errors.push('无有效数据行');
  }

  return {
    passed: errors.length === 0 && validRowCount > 0,
    errors,
    warnings,
    missingFields,
    rowCount: rows.length,
    validRowCount,
  };
}
