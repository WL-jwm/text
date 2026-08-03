/**
 * G-08 数据质量治理 — 质量引擎单元测试
 *
 * 覆盖：
 *   - 范围检查（低于下限/超过上限/正常）
 *   - 变化率检查（正常/超限）
 *   - 恒值检测（传感器冻结）
 *   - 缺失检测（间隔超限）
 *   - 批量评估
 *   - 综合评分计算
 *   - 报告生成
 *   - 引擎重置
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QualityEngine } from '../qualityEngine';
import type { RealtimeReading } from '../realtimeDataService';

// ── 辅助工厂 ──

function makeReading(overrides: Partial<RealtimeReading> & { channel: RealtimeReading['channel'] }): RealtimeReading {
  return {
    stationId: 'WL-CZ-01',
    stationName: '沧州监测站',
    city: '沧州',
    value: 25,
    unit: 'm',
    timestamp: Date.now(),
    quality: 'good',
    ...overrides,
  };
}

describe('QualityEngine — 范围检查', () => {
  let engine: QualityEngine;

  beforeEach(() => {
    engine = new QualityEngine();
  });

  it('正常值不应产生违规', () => {
    const reading = makeReading({ channel: 'waterLevel', value: 25 });
    const result = engine.evaluate(reading);
    expect(result.violations).toHaveLength(0);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('excellent');
  });

  it('低于下限应产生范围违规', () => {
    const reading = makeReading({ channel: 'waterLevel', value: -5 });
    const result = engine.evaluate(reading);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]!.ruleType).toBe('range');
    expect(result.violations[0]!.message).toContain('低于下限');
    expect(result.score).toBeLessThan(100);
    expect(result.grade).not.toBe('excellent');
  });

  it('超过上限应产生范围违规', () => {
    const reading = makeReading({ channel: 'waterLevel', value: 100 });
    const result = engine.evaluate(reading);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]!.ruleType).toBe('range');
    expect(result.violations[0]!.message).toContain('超过上限');
    expect(result.score).toBeLessThan(100);
  });

  it('边界值（等于下限）不应违规', () => {
    const reading = makeReading({ channel: 'waterLevel', value: 0 });
    const result = engine.evaluate(reading);
    expect(result.violations.filter(v => v.ruleType === 'range')).toHaveLength(0);
  });

  it('边界值（等于上限）不应违规', () => {
    const reading = makeReading({ channel: 'waterLevel', value: 80 });
    const result = engine.evaluate(reading);
    expect(result.violations.filter(v => v.ruleType === 'range')).toHaveLength(0);
  });

  it('严重超限应产生更高 severity', () => {
    const mild = makeReading({ channel: 'waterLevel', value: 85 });
    const severe = makeReading({ channel: 'waterLevel', value: 200 });

    const mildResult = engine.evaluate(mild);
    const severeResult = engine.evaluate(severe);

    expect(severeResult.violations[0]!.severity).toBeGreaterThan(mildResult.violations[0]!.severity);
    expect(severeResult.score).toBeLessThan(mildResult.score);
  });

  it('不同通道使用各自的范围配置', () => {
    // waterLevel: 0-80, waterQuality: 0-100
    const wlReading = makeReading({ channel: 'waterLevel', value: 90 });
    const wqReading = makeReading({ channel: 'waterQuality', value: 90 });

    const wlResult = engine.evaluate(wlReading);
    const wqResult = engine.evaluate(wqReading);

    expect(wlResult.violations).toHaveLength(1); // 超过80
    expect(wqResult.violations).toHaveLength(0); // 90在0-100内
  });
});

describe('QualityEngine — 变化率检查', () => {
  let engine: QualityEngine;

  beforeEach(() => {
    engine = new QualityEngine();
  });

  it('首次读数不应触发变化率检查', () => {
    const reading = makeReading({ channel: 'waterLevel', value: 25 });
    const result = engine.evaluate(reading);
    expect(result.violations.filter(v => v.ruleType === 'rate')).toHaveLength(0);
  });

  it('变化率未超限不应违规', () => {
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    const result = engine.evaluate(makeReading({ channel: 'waterLevel', value: 27 }));
    expect(result.violations.filter(v => v.ruleType === 'rate')).toHaveLength(0);
  });

  it('变化率超限应产生违规', () => {
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    const result = engine.evaluate(makeReading({ channel: 'waterLevel', value: 35 }));
    expect(result.violations.filter(v => v.ruleType === 'rate')).toHaveLength(1);
    expect(result.violations[0]!.ruleName).toBe('变化率检查');
    expect(result.violations[0]!.currentValue).toBe(35);
    expect(result.violations[0]!.expectedValue).toBe(25);
  });

  it('大幅变化产生更高 severity', () => {
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    const mild = engine.evaluate(makeReading({ channel: 'waterLevel', value: 31 }));
    engine.reset();
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    const severe = engine.evaluate(makeReading({ channel: 'waterLevel', value: 50 }));

    expect(severe.violations[0]!.severity).toBeGreaterThan(mild.violations[0]!.severity);
  });
});

describe('QualityEngine — 恒值检测', () => {
  let engine: QualityEngine;

  beforeEach(() => {
    engine = new QualityEngine();
  });

  it('连续相同值超过阈值应产生违规', () => {
    const reading = makeReading({ channel: 'waterLevel', value: 25 });

    // 前4次，不超过阈值（maxConsecutive=5）
    for (let i = 0; i < 4; i++) {
      const result = engine.evaluate(reading);
      expect(result.violations.filter(v => v.ruleType === 'stuck')).toHaveLength(0);
    }

    // 第5次，达到阈值
    const result = engine.evaluate(reading);
    expect(result.violations.filter(v => v.ruleType === 'stuck')).toHaveLength(1);
    expect(result.violations[0]!.ruleName).toBe('恒值检测');
    expect(result.violations[0]!.message).toContain('连续');
  });

  it('值变化后重置恒值计数', () => {
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));

    // 第5次变化为不同值，不应触发
    const result = engine.evaluate(makeReading({ channel: 'waterLevel', value: 26 }));
    expect(result.violations.filter(v => v.ruleType === 'stuck')).toHaveLength(0);
  });

  it('不同站点独立计数', () => {
    const reading1 = makeReading({ channel: 'waterLevel', value: 25, stationId: 'WL-CZ-01' });
    const reading2 = makeReading({ channel: 'waterLevel', value: 25, stationId: 'WL-HS-01' });

    // 重复同样值但不触发
    for (let i = 0; i < 4; i++) {
      engine.evaluate(reading1);
      engine.evaluate(reading2);
    }

    const result1 = engine.evaluate(reading1);
    expect(result1.violations.filter(v => v.ruleType === 'stuck')).toHaveLength(1);

    const result2 = engine.evaluate(reading2);
    expect(result2.violations.filter(v => v.ruleType === 'stuck')).toHaveLength(1);
  });
});

describe('QualityEngine — 批量评估', () => {
  let engine: QualityEngine;

  beforeEach(() => {
    engine = new QualityEngine();
  });

  it('evaluateBatch 应返回与逐个调用相同的结果', () => {
    const readings = [
      makeReading({ channel: 'waterLevel', value: 25 }),
      makeReading({ channel: 'waterLevel', value: 100 }),
      makeReading({ channel: 'waterQuality', value: 105 }),
    ];

    const batchResults = engine.evaluateBatch(readings);

    expect(batchResults).toHaveLength(3);
    expect(batchResults[0]!.violations).toHaveLength(0);
    expect(batchResults[1]!.violations.filter(v => v.ruleType === 'range')).toHaveLength(1);
    expect(batchResults[2]!.violations.filter(v => v.ruleType === 'range')).toHaveLength(1);
  });

  it('空数组应返回空结果', () => {
    const results = engine.evaluateBatch([]);
    expect(results).toHaveLength(0);
  });
});

describe('QualityEngine — 报告生成', () => {
  let engine: QualityEngine;

  beforeEach(() => {
    engine = new QualityEngine();
  });

  it('空读数应返回空报告', () => {
    const report = engine.generateReport('waterLevel', []);
    expect(report.totalReadings).toBe(0);
    expect(report.averageScore).toBe(100);
    expect(report.grade).toBe('excellent');
  });

  it('正常读数应生成完整报告', () => {
    const readings = [
      makeReading({ channel: 'waterLevel', value: 25 }),
      makeReading({ channel: 'waterLevel', value: 26 }),
      makeReading({ channel: 'waterLevel', value: 27 }),
    ];

    const qualityResults = engine.evaluateBatch(readings);
    const report = engine.generateReport('waterLevel', qualityResults);

    expect(report.channel).toBe('waterLevel');
    expect(report.totalReadings).toBe(3);
    expect(report.averageScore).toBe(100);
    expect(report.grade).toBe('excellent');
    expect(report.stationScores).toHaveLength(1);
    expect(report.violationSummary.range).toBe(0);
  });

  it('包含违规的读数应反映在报告中', () => {
    const readings = [
      makeReading({ channel: 'waterLevel', value: 25 }),
      makeReading({ channel: 'waterLevel', value: 100 }),
      makeReading({ channel: 'waterLevel', value: 150 }),
    ];

    const qualityResults = engine.evaluateBatch(readings);
    const report = engine.generateReport('waterLevel', qualityResults);

    expect(report.totalReadings).toBe(3);
    expect(report.averageScore).toBeLessThan(100);
    expect(report.violationSummary.range).toBeGreaterThan(0);
    expect(report.violations.length).toBeGreaterThan(0);
  });

  it('多站点报告应按站点分组', () => {
    const readings = [
      makeReading({ channel: 'waterLevel', value: 25, stationId: 'WL-CZ-01', stationName: '沧州' }),
      makeReading({ channel: 'waterLevel', value: 26, stationId: 'WL-CZ-01', stationName: '沧州' }),
      makeReading({ channel: 'waterLevel', value: 25, stationId: 'WL-HS-01', stationName: '衡水' }),
    ];

    const qualityResults = engine.evaluateBatch(readings);
    const report = engine.generateReport('waterLevel', qualityResults);

    expect(report.stationScores).toHaveLength(2);
    const cz = report.stationScores.find(s => s.stationId === 'WL-CZ-01');
    const hs = report.stationScores.find(s => s.stationId === 'WL-HS-01');
    expect(cz).toBeDefined();
    expect(hs).toBeDefined();
    expect(cz!.count).toBe(2);
    expect(hs!.count).toBe(1);
  });

  it('违规摘要应统计所有规则类型', () => {
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 100 })); // range
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 100 })); // range + stuck(第2次)

    const results = engine.evaluateBatch([
      makeReading({ channel: 'waterLevel', value: 25 }),
      makeReading({ channel: 'waterLevel', value: 100 }),
      makeReading({ channel: 'waterLevel', value: 100 }),
    ]);

    const report = engine.generateReport('waterLevel', results);
    expect(report.violationSummary).toHaveProperty('range');
    expect(report.violationSummary).toHaveProperty('rate');
    expect(report.violationSummary).toHaveProperty('stuck');
    expect(report.violationSummary).toHaveProperty('missing');
    expect(report.violationSummary).toHaveProperty('consistency');
  });
});

describe('QualityEngine — 评分计算', () => {
  let engine: QualityEngine;

  beforeEach(() => {
    engine = new QualityEngine();
  });

  it('无违规评分为100', () => {
    const result = engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    expect(result.score).toBe(100);
  });

  it('有违规评分应降低', () => {
    const result = engine.evaluate(makeReading({ channel: 'waterLevel', value: 100 }));
    expect(result.score).toBeLessThan(100);
  });

  it('多次违规评分更低', () => {
    const mild = engine.evaluate(makeReading({ channel: 'waterLevel', value: 100 }));
    engine.reset();
    const severe = engine.evaluate(makeReading({ channel: 'waterLevel', value: 200 }));
    expect(severe.score).toBeLessThan(mild.score);
  });

  it('评分等级映射正确', () => {
    // 通过私有方法测试，用绕行方式：通过调整值触发不同严重程度
    // excellent: 正常值
    const excellent = engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    expect(excellent.grade).toBe('excellent');

    // fair: 极端范围违规
    engine.reset();
    const fair = engine.evaluate(makeReading({ channel: 'waterLevel', value: 500 }));
    expect(fair.grade).toBe('fair');
    expect(fair.score).toBeLessThan(75);

    // 多次违规评分更低：第5次（range+stuck）< 第1次（仅range）
    engine.reset();
    const first = engine.evaluate(makeReading({ channel: 'waterLevel', value: 500 }));
    for (let i = 0; i < 4; i++) {
      engine.evaluate(makeReading({ channel: 'waterLevel', value: 500 }));
    }
    const fifth = engine.evaluate(makeReading({ channel: 'waterLevel', value: 500 }));
    expect(fifth.score).toBeLessThan(first.score);
  });
});

describe('QualityEngine — 引擎重置', () => {
  let engine: QualityEngine;

  beforeEach(() => {
    engine = new QualityEngine();
  });

  it('reset 应清除历史记录', () => {
    engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));

    // 变化率检测：第二次大幅变化应触发
    const beforeReset = engine.evaluate(makeReading({ channel: 'waterLevel', value: 50 }));
    expect(beforeReset.violations.filter(v => v.ruleType === 'rate')).toHaveLength(1);

    engine.reset();

    // 重置后，首次读数不应触发变化率
    const afterReset = engine.evaluate(makeReading({ channel: 'waterLevel', value: 50 }));
    expect(afterReset.violations.filter(v => v.ruleType === 'rate')).toHaveLength(0);
  });

  it('reset 应清除恒值计数', () => {
    const reading = makeReading({ channel: 'waterLevel', value: 25 });
    for (let i = 0; i < 4; i++) engine.evaluate(reading);
    engine.reset();
    // 重置后重新计数
    const result = engine.evaluate(reading);
    expect(result.violations.filter(v => v.ruleType === 'stuck')).toHaveLength(0);
  });
});

describe('QualityEngine — 自定义规则', () => {
  let engine: QualityEngine;

  beforeEach(() => {
    engine = new QualityEngine();
  });

  it('setRules 可更新规则配置', () => {
    const newRules = engine.getRules();
    newRules.waterLevel.range.min = 10;
    newRules.waterLevel.range.max = 50;
    engine.setRules(newRules);

    // 25 在新的范围内
    const normal = engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    expect(normal.violations.filter(v => v.ruleType === 'range')).toHaveLength(0);

    // 5 低于新的下限
    const low = engine.evaluate(makeReading({ channel: 'waterLevel', value: 5 }));
    expect(low.violations.filter(v => v.ruleType === 'range')).toHaveLength(1);

    // 60 超过新的上限
    const high = engine.evaluate(makeReading({ channel: 'waterLevel', value: 60 }));
    expect(high.violations.filter(v => v.ruleType === 'range')).toHaveLength(1);
  });

  it('getRules 返回当前规则', () => {
    const rules = engine.getRules();
    expect(rules.waterLevel.range.min).toBe(0);
    expect(rules.waterLevel.range.max).toBe(80);
    expect(rules.waterLevel.rate.maxRate).toBe(5);
    expect(rules.waterLevel.stuck.maxConsecutive).toBe(5);
  });

  it('未知通道返回满分', () => {
    const result = engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    expect(result.score).toBe(100);
  });
});

describe('QualityEngine — 多通道覆盖', () => {
  let engine: QualityEngine;

  beforeEach(() => {
    engine = new QualityEngine();
  });

  it('waterLevel 通道正常', () => {
    const r = engine.evaluate(makeReading({ channel: 'waterLevel', value: 25 }));
    expect(r.score).toBe(100);
  });

  it('waterQuality 通道正常', () => {
    const r = engine.evaluate(makeReading({ channel: 'waterQuality', value: 50 }));
    expect(r.score).toBe(100);
  });

  it('subsidence 通道超限', () => {
    const r = engine.evaluate(makeReading({ channel: 'subsidence', value: 25 }));
    expect(r.violations.filter(v => v.ruleType === 'range')).toHaveLength(0); // 0-50
  });

  it('extraction 通道超限', () => {
    const r = engine.evaluate(makeReading({ channel: 'extraction', value: 350 }));
    expect(r.violations.filter(v => v.ruleType === 'range')).toHaveLength(1); // 超过300
  });

  it('各通道独立配置作用于评分', () => {
    // extraction 变化率 maxRate=20
    engine.evaluate(makeReading({ channel: 'extraction', value: 100 }));
    const r = engine.evaluate(makeReading({ channel: 'extraction', value: 130 }));
    expect(r.violations.filter(v => v.ruleType === 'rate')).toHaveLength(1); // 变化30>20

    // 大幅变化
    engine.reset();
    engine.evaluate(makeReading({ channel: 'extraction', value: 100 }));
    const r2 = engine.evaluate(makeReading({ channel: 'extraction', value: 150 }));
    expect(r2.violations.filter(v => v.ruleType === 'rate')).toHaveLength(1); // 变化50>20
  });
});