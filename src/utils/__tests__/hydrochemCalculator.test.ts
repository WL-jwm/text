/**
 * Q-04 水化学计算器 单元测试
 */
import { describe, it, expect } from 'vitest';
import {
  toMmol,
  calcIonMmol,
  calcIonPercent,
  classifySukalief,
  calcPiperCoordinates,
  calcHardness,
  calcTDS,
  evaluateHydrochem,
  analyzeHydrochem,
  checkIonBalance,
} from '../hydrochemCalculator';
import type { IonInput } from '../hydrochemCalculator';

const SAMPLE_ION: IonInput = {
  HCO3: 300, SO4: 50, Cl: 30,
  Ca: 80, Mg: 20, NaK: 15,
};

// ═══════════════════════════════════════════════════════
// toMmol
// ═══════════════════════════════════════════════════════

describe('toMmol', () => {
  it('Ca 40mg/L → mmol/L', () => {
    expect(toMmol(40, 40.08)).toBeCloseTo(0.998, 1);
  });

  it('0 浓度返回 0', () => {
    expect(toMmol(0, 61.02)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════
// calcIonMmol
// ═══════════════════════════════════════════════════════

describe('calcIonMmol', () => {
  const r = calcIonMmol(SAMPLE_ION);

  it('返回各离子毫摩尔浓度', () => {
    expect(r.HCO3).toBeGreaterThan(0);
    expect(r.Ca).toBeGreaterThan(0);
    expect(r.NaK).toBeGreaterThan(0);
  });

  it('阴离子总毫摩尔 = 各阴离子之和', () => {
    expect(r.totalAnion).toBeCloseTo(r.HCO3 + r.SO4 + r.Cl, 6);
  });

  it('阳离子总毫摩尔 = 各阳离子之和', () => {
    expect(r.totalCation).toBeCloseTo(r.Ca + r.Mg + r.NaK, 6);
  });
});

// ═══════════════════════════════════════════════════════
// calcIonPercent
// ═══════════════════════════════════════════════════════

describe('calcIonPercent', () => {
  const mmol = calcIonMmol(SAMPLE_ION);
  const r = calcIonPercent(mmol);

  it('各值在 [0, 100] 范围', () => {
    for (const key of ['Ca', 'Mg', 'NaK', 'HCO3', 'SO4', 'Cl'] as const) {
      expect(r[key]).toBeGreaterThanOrEqual(0);
      expect(r[key]).toBeLessThanOrEqual(100);
    }
  });
});

// ═══════════════════════════════════════════════════════
// classifySukalief
// ═══════════════════════════════════════════════════════

describe('classifySukalief', () => {
  const mmol = calcIonMmol(SAMPLE_ION);
  const pct = calcIonPercent(mmol);
  const r = classifySukalief(pct);

  it('返回水化学类型', () => {
    expect(r.type).toBeDefined();
    expect(r.type.length).toBeGreaterThan(0);
  });

  it('阴离子类型包含 HCO3', () => {
    expect(r.anionType).toContain('HCO₃');
  });

  it('阳离子类型包含 Ca', () => {
    expect(r.cationType).toContain('Ca');
  });

  it('返回分类描述', () => {
    expect(r.description).toBeDefined();
    expect(r.quality).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════
// calcPiperCoordinates
// ═══════════════════════════════════════════════════════

describe('calcPiperCoordinates', () => {
  const mmol = calcIonMmol(SAMPLE_ION);
  const pct = calcIonPercent(mmol);
  const r = calcPiperCoordinates(pct);

  it('阳离子坐标在 [0, 100] 范围', () => {
    expect(r.cation.Ca).toBeGreaterThanOrEqual(0);
    expect(r.cation.Ca).toBeLessThanOrEqual(100);
    expect(r.cation.Mg).toBeGreaterThanOrEqual(0);
    expect(r.cation.Mg).toBeLessThanOrEqual(100);
  });

  it('阴离子坐标在 [0, 100] 范围', () => {
    expect(r.anion.HCO3).toBeGreaterThanOrEqual(0);
    expect(r.anion.HCO3).toBeLessThanOrEqual(100);
  });

  it('菱形坐标在 [0, 100] 范围', () => {
    expect(r.diamond.x).toBeGreaterThanOrEqual(0);
    expect(r.diamond.x).toBeLessThanOrEqual(100);
    expect(r.diamond.y).toBeGreaterThanOrEqual(0);
    expect(r.diamond.y).toBeLessThanOrEqual(100);
  });
});

// ═══════════════════════════════════════════════════════
// calcHardness
// ═══════════════════════════════════════════════════════

describe('calcHardness', () => {
  it('Ca=80, Mg=20 → 总硬度（以CaCO₃计）', () => {
    const h = calcHardness(80, 20);
    const expected = (80 / 40.08 + 20 / 24.31) * 50.04;
    expect(h).toBeCloseTo(expected, 1);
  });

  it('Ca=0, Mg=0 → 0', () => {
    expect(calcHardness(0, 0)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════
// calcTDS
// ═══════════════════════════════════════════════════════

describe('calcTDS', () => {
  it('TDS = 各离子之和', () => {
    const tds = calcTDS(SAMPLE_ION);
    expect(tds).toBeCloseTo(80 + 20 + 15 + 300 + 50 + 30, 1);
  });
});

// ═══════════════════════════════════════════════════════
// evaluateHydrochem
// ═══════════════════════════════════════════════════════

describe('evaluateHydrochem', () => {
  const tds = calcTDS(SAMPLE_ION);
  const r = evaluateHydrochem(SAMPLE_ION, tds);

  it('返回TDS评价', () => {
    expect(r.tds).toBeDefined();
    expect(r.tds.value).toBe(tds);
    expect(r.tds.level).toBeDefined();
  });

  it('返回硬度评价', () => {
    expect(r.hardness).toBeDefined();
    expect(r.hardness.value).toBeGreaterThan(0);
    expect(r.hardness.level).toBeDefined();
  });

  it('返回氯离子和硫酸根评价', () => {
    expect(r.chloride).toBeDefined();
    expect(r.sulfate).toBeDefined();
  });

  it('返回水化学类型', () => {
    expect(r.waterType).toBeDefined();
    expect(r.waterType.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// analyzeHydrochem
// ═══════════════════════════════════════════════════════

describe('analyzeHydrochem', () => {
  const r = analyzeHydrochem(SAMPLE_ION);

  it('包含输入参数', () => {
    expect(r.input).toBeDefined();
    expect(r.input.HCO3).toBe(300);
  });

  it('包含毫摩尔计算', () => {
    expect(r.mmol).toBeDefined();
    expect(r.mmol.totalAnion).toBeGreaterThan(0);
  });

  it('包含百分比', () => {
    expect(r.percent).toBeDefined();
  });

  it('包含苏卡列夫分类', () => {
    expect(r.sukalief).toBeDefined();
    expect(r.sukalief.type).toBeDefined();
  });

  it('包含Piper坐标', () => {
    expect(r.piper).toBeDefined();
    expect(r.piper.diamond).toBeDefined();
  });

  it('包含综合评价', () => {
    expect(r.evaluation).toBeDefined();
    expect(r.evaluation.tds).toBeDefined();
  });

  it('包含自动计算TDS', () => {
    expect(r.calculatedTDS).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// checkIonBalance
// ═══════════════════════════════════════════════════════

describe('checkIonBalance', () => {
  it('阴阳离子平衡校验返回误差值', () => {
    const mmol = calcIonMmol(SAMPLE_ION);
    const r = checkIonBalance(mmol);
    expect(typeof r.error).toBe('number');
    expect(typeof r.pass).toBe('boolean');
  });

  it('极端不平衡时校验不通过', () => {
    const mmol = calcIonMmol({ ...SAMPLE_ION, HCO3: 3000, Ca: 0, Mg: 0, NaK: 0 });
    const r = checkIonBalance(mmol);
    expect(r.pass).toBe(false);
    expect(r.error).toBeGreaterThan(5);
  });
});