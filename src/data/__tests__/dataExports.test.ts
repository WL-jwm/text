// @vitest-environment node
import { describe, it, expect } from 'vitest';

// ═══════════════════════════════════════════════════════
// groundwaterFunction.ts exports
// ═══════════════════════════════════════════════════════
describe('data/groundwaterFunction', () => {
  it('exports overdraftOverview with expected keys', async () => {
    const { overdraftOverview } = await import('../groundwaterFunction');
    expect(overdraftOverview).toBeDefined();
    expect(typeof overdraftOverview).toBe('object');
    const keys = Object.keys(overdraftOverview);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('exports cityOverdraftZones as non-empty array', async () => {
    const { cityOverdraftZones } = await import('../groundwaterFunction');
    expect(Array.isArray(cityOverdraftZones)).toBe(true);
    expect(cityOverdraftZones.length).toBeGreaterThan(0);
    expect(cityOverdraftZones[0]).toHaveProperty('city');
  });

  it('exports restrictedZones with forbidden and limited arrays', async () => {
    const { restrictedZones } = await import('../groundwaterFunction');
    expect(restrictedZones).toBeDefined();
    expect(Array.isArray(restrictedZones.forbidden)).toBe(true);
    expect(Array.isArray(restrictedZones.limited)).toBe(true);
  });

  it('exports waterLevelRecovery with expected structure', async () => {
    const { waterLevelRecovery } = await import('../groundwaterFunction');
    expect(waterLevelRecovery).toBeDefined();
    expect(typeof waterLevelRecovery).toBe('object');
    const keys = Object.keys(waterLevelRecovery);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('exports groundwaterFunctionZones as non-empty array', async () => {
    const { groundwaterFunctionZones } = await import('../groundwaterFunction');
    expect(Array.isArray(groundwaterFunctionZones)).toBe(true);
    expect(groundwaterFunctionZones.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// groundwaterResources.ts exports
// ═══════════════════════════════════════════════════════
describe('data/groundwaterResources', () => {
  it('exports plainWaterBalance with expected structure', async () => {
    const { plainWaterBalance } = await import('../groundwaterResources');
    expect(plainWaterBalance).toBeDefined();
    expect(typeof plainWaterBalance).toBe('object');
    const keys = Object.keys(plainWaterBalance);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('exports cityWaterBalance as non-empty array with city field', async () => {
    const { cityWaterBalance } = await import('../groundwaterResources');
    expect(Array.isArray(cityWaterBalance)).toBe(true);
    expect(cityWaterBalance.length).toBeGreaterThan(0);
    expect(cityWaterBalance[0]).toHaveProperty('city');
  });

  it('exports shallowWaterQualityByClass with class distribution', async () => {
    const { shallowWaterQualityByClass } = await import('../groundwaterResources');
    expect(Array.isArray(shallowWaterQualityByClass)).toBe(true);
    expect(shallowWaterQualityByClass.length).toBeGreaterThan(0);
  });

  it('exports hydrogeologicalParams with expected sections', async () => {
    const { hydrogeologicalParams } = await import('../groundwaterResources');
    expect(hydrogeologicalParams).toBeDefined();
    expect(typeof hydrogeologicalParams).toBe('object');
  });

  it('exports cityExploitationPotential as non-empty array', async () => {
    const { cityExploitationPotential } = await import('../groundwaterResources');
    expect(Array.isArray(cityExploitationPotential)).toBe(true);
    expect(cityExploitationPotential.length).toBeGreaterThan(0);
  });

  it('exports cityGroundwaterPollution with pollution data', async () => {
    const { cityGroundwaterPollution } = await import('../groundwaterResources');
    expect(Array.isArray(cityGroundwaterPollution)).toBe(true);
    expect(cityGroundwaterPollution.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// backgroundValues.ts exports
// ═══════════════════════════════════════════════════════
describe('data/backgroundValues', () => {
  it('exports groundwaterBackground with shallow and deep', async () => {
    const { groundwaterBackground } = await import('../backgroundValues');
    expect(groundwaterBackground).toBeDefined();
    expect(Array.isArray(groundwaterBackground.shallow)).toBe(true);
    expect(Array.isArray(groundwaterBackground.deep)).toBe(true);
  });

  it('exports cityExceedanceFactors as non-empty array', async () => {
    const { cityExceedanceFactors } = await import('../backgroundValues');
    expect(Array.isArray(cityExceedanceFactors)).toBe(true);
    expect(cityExceedanceFactors.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// exploitation.ts exports
// ═══════════════════════════════════════════════════════
describe('data/exploitation', () => {
  it('exports exploitation data exports', async () => {
    const mod = await import('../exploitation');
    const keys = Object.keys(mod);
    expect(keys.length).toBeGreaterThan(0);
    expect(mod).toHaveProperty('waterPermit2024');
  });
});

// ═══════════════════════════════════════════════════════
// environment.ts exports
// ═══════════════════════════════════════════════════════
describe('data/environment', () => {
  it('exports shallowCones2024 as non-empty array', async () => {
    const { shallowCones2024 } = await import('../environment');
    expect(Array.isArray(shallowCones2024)).toBe(true);
    expect(shallowCones2024.length).toBeGreaterThan(0);
    expect(shallowCones2024[0]).toHaveProperty('name');
    expect(shallowCones2024[0]).toHaveProperty('center');
  });
});

// ═══════════════════════════════════════════════════════
// searchIndex files export non-empty arrays
// ═══════════════════════════════════════════════════════
describe('data/searchIndexCore', () => {
  it('exports searchIndexCore as non-empty array', async () => {
    const { searchIndexCore } = await import('../searchIndexCore');
    expect(Array.isArray(searchIndexCore)).toBe(true);
    expect(searchIndexCore.length).toBeGreaterThan(0);
  });
});

describe('data/searchIndexWater', () => {
  it('exports searchIndexWater as non-empty array', async () => {
    const { searchIndexWater } = await import('../searchIndexWater');
    expect(Array.isArray(searchIndexWater)).toBe(true);
    expect(searchIndexWater.length).toBeGreaterThan(0);
  });
});

describe('data/searchIndexGeo', () => {
  it('exports searchIndexGeo as non-empty array', async () => {
    const { searchIndexGeo } = await import('../searchIndexGeo');
    expect(Array.isArray(searchIndexGeo)).toBe(true);
    expect(searchIndexGeo.length).toBeGreaterThan(0);
  });
});

describe('data/searchIndexEnv', () => {
  it('exports searchIndexEnv as non-empty array', async () => {
    const { searchIndexEnv } = await import('../searchIndexEnv');
    expect(Array.isArray(searchIndexEnv)).toBe(true);
    expect(searchIndexEnv.length).toBeGreaterThan(0);
  });
});

describe('data/searchIndexMap', () => {
  it('exports searchIndexMap as non-empty array', async () => {
    const { searchIndexMap } = await import('../searchIndexMap');
    expect(Array.isArray(searchIndexMap)).toBe(true);
    expect(searchIndexMap.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// resources-bulletin.ts exports
// ═══════════════════════════════════════════════════════
describe('data/resources-bulletin', () => {
  it('exports cityBulletin2024 as non-empty array with city field', async () => {
    const { cityBulletin2024 } = await import('../resources-bulletin');
    expect(Array.isArray(cityBulletin2024)).toBe(true);
    expect(cityBulletin2024.length).toBeGreaterThan(0);
    expect(cityBulletin2024[0]).toHaveProperty('city');
  });
});

// ═══════════════════════════════════════════════════════
// hydrogeologyHistorical.ts exports
// ═══════════════════════════════════════════════════════
describe('data/hydrogeologyHistorical', () => {
  it('exports expected data arrays', async () => {
    const mod = await import('../hydrogeologyHistorical');
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// geology.ts exports
// ═══════════════════════════════════════════════════════
describe('data/geology', () => {
  it('exports quaternaryStratigraphy as non-empty object', async () => {
    const { quaternaryStratigraphy } = await import('../geology');
    expect(quaternaryStratigraphy).toBeDefined();
    expect(typeof quaternaryStratigraphy).toBe('object');
  });
});

// ═══════════════════════════════════════════════════════
// mapDataEnhanced.ts exports
// ═══════════════════════════════════════════════════════
describe('data/mapDataEnhanced', () => {
  it('exports expected enhanced map data', async () => {
    const mod = await import('../mapDataEnhanced');
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// systemZoning.ts exports
// ═══════════════════════════════════════════════════════
describe('data/systemZoning', () => {
  it('exports systemZones as non-empty array', async () => {
    const { systemZones } = await import('../systemZoning');
    expect(Array.isArray(systemZones)).toBe(true);
    expect(systemZones.length).toBeGreaterThan(0);
  });
});
