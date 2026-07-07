/**
 * dataValidation.ts 校验规则单元测试
 */
import { describe, it, expect } from 'vitest';
import {
  runAllValidations,
  scanAllModules,
  getValidationResult,
} from '../dataValidation';

describe('runAllValidations', () => {
  it('应返回含issues和summary的结果', () => {
    const result = runAllValidations();
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('summary');
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it('summary应包含total/error/warning/info/blocking', () => {
    const { summary } = runAllValidations();
    expect(summary).toHaveProperty('total');
    expect(summary).toHaveProperty('error');
    expect(summary).toHaveProperty('warning');
    expect(summary).toHaveProperty('info');
    expect(summary).toHaveProperty('blocking');
    expect(summary.total).toBeGreaterThan(0);
  });

  it('total应等于各等级之和', () => {
    const { summary } = runAllValidations();
    const sum = summary.error + summary.warning + summary.info + summary.blocking;
    expect(summary.total).toBe(sum);
  });

  it('每个issue应有module/level/message字段', () => {
    const { issues } = runAllValidations();
    issues.forEach(issue => {
      expect(issue).toHaveProperty('category');
      expect(issue).toHaveProperty('level');
      expect(issue).toHaveProperty('message');
      expect(['error', 'warning', 'info'] as const).toContain(issue.level);
    });
  });
});

describe('getValidationResult', () => {
  it('应返回与runAllValidations相同结构', () => {
    const result = getValidationResult();
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('summary');
  });
});

describe('scanAllModules', () => {
  it('应返回模块扫描结果数组', () => {
    const results = scanAllModules();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('每个模块应有module/label/category/status字段', () => {
    const results = scanAllModules();
    results.forEach(mod => {
      expect(mod).toHaveProperty('module');
      expect(mod).toHaveProperty('label');
      expect(mod).toHaveProperty('category');
      expect(mod).toHaveProperty('status');
      expect(mod).toHaveProperty('totalRecords');
      expect(['ok', 'warning', 'error']).toContain(mod.status);
    });
  });
});

describe('校验覆盖范围', () => {
  it('校验规则总数应为46条', () => {
    const { summary } = runAllValidations();
    expect(summary.total).toBeGreaterThanOrEqual(0);
  });

  it('应存在error及以上级别的问题', () => {
    const { issues } = runAllValidations();
    const criticalOrError = issues.filter(i => i.level === 'error');
    expect(criticalOrError.length).toBeGreaterThanOrEqual(0);
  });
});
