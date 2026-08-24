/**
 * B-31 地下水风险评估 — 预设风险区
 */

import type { PresetArea } from './riskTypes';

export const PRESET_AREAS: PresetArea[] = [
  {
    name: '沧州滨海平原',
    description: '滨海平原区，海水入侵+深层超采+地面沉降多重风险叠加',
    pollution: { depthToWater: 8, netRecharge: 120, aquiferMedia: '砂砾石', soilMedia: '砂土', topography: 1, vadoseZone: '砂', conductivity: 50, landUse: '耕地' },
    overexploitation: { extraction: 8500, recharge: 3200, waterLevelDecline: 1.8, aquiferType: '深层孔隙水', allowableExtraction: 4500 },
    subsidence: { compressibleLayerThickness: 80, waterLevelDecline: 45, layerType: '黏土', structure: '多层互层', historicalSubsidence: 1200, currentRate: 25 },
    seawater: { distanceToCoast: 3, currentChloride: 320, previousChloride: 180, inlandWaterLevel: 2, seaLevel: 0, conductivity: 50, hasInterface: true },
  },
  {
    name: '衡水中部平原',
    description: '中部冲积平原，深层水超采引发地面沉降典型区',
    pollution: { depthToWater: 12, netRecharge: 80, aquiferMedia: '砂岩', soilMedia: '粉质黏土', topography: 2, vadoseZone: '粉质黏土', conductivity: 15, landUse: '耕地' },
    overexploitation: { extraction: 12000, recharge: 4500, waterLevelDecline: 2.5, aquiferType: '深层孔隙水', allowableExtraction: 6000 },
    subsidence: { compressibleLayerThickness: 60, waterLevelDecline: 35, layerType: '粉质黏土', structure: '多层互层', historicalSubsidence: 600, currentRate: 15 },
    seawater: { distanceToCoast: 120, currentChloride: 95, previousChloride: 80, inlandWaterLevel: 8, seaLevel: 0, conductivity: 15, hasInterface: false },
  },
  {
    name: '石家庄山前平原',
    description: '山前冲洪积扇，浅层地下水水质良好但存在农业面源污染',
    pollution: { depthToWater: 15, netRecharge: 150, aquiferMedia: '砂砾石', soilMedia: '砂土', topography: 3, vadoseZone: '砂砾', conductivity: 80, landUse: '耕地' },
    overexploitation: { extraction: 6000, recharge: 8000, waterLevelDecline: 0.3, aquiferType: '浅层孔隙水', allowableExtraction: 7000 },
    subsidence: { compressibleLayerThickness: 15, waterLevelDecline: 5, layerType: '粉土', structure: '单层', historicalSubsidence: 50, currentRate: 2 },
    seawater: { distanceToCoast: 300, currentChloride: 65, previousChloride: 60, inlandWaterLevel: 45, seaLevel: 0, conductivity: 80, hasInterface: false },
  },
  {
    name: '唐山沿海经济区',
    description: '沿海工业区，海水入侵与工业污染双重风险',
    pollution: { depthToWater: 5, netRecharge: 100, aquiferMedia: '砂砾石', soilMedia: '砂土', topography: 1, vadoseZone: '砂', conductivity: 60, landUse: '工业区' },
    overexploitation: { extraction: 5000, recharge: 2500, waterLevelDecline: 1.2, aquiferType: '浅层孔隙水', allowableExtraction: 4000 },
    subsidence: { compressibleLayerThickness: 45, waterLevelDecline: 20, layerType: '粉质黏土', structure: '多层互层', historicalSubsidence: 350, currentRate: 8 },
    seawater: { distanceToCoast: 1.5, currentChloride: 580, previousChloride: 350, inlandWaterLevel: 0.5, seaLevel: 0, conductivity: 60, hasInterface: true },
  },
  {
    name: '邢台黑龙港流域',
    description: '缺水地区，水质型缺水与资源型缺水并存',
    pollution: { depthToWater: 10, netRecharge: 70, aquiferMedia: '砂岩', soilMedia: '粉质黏土', topography: 2, vadoseZone: '粉土', conductivity: 20, landUse: '耕地' },
    overexploitation: { extraction: 7500, recharge: 2800, waterLevelDecline: 1.5, aquiferType: '深层孔隙水', allowableExtraction: 3800 },
    subsidence: { compressibleLayerThickness: 50, waterLevelDecline: 28, layerType: '粉质黏土', structure: '多层互层', historicalSubsidence: 450, currentRate: 12 },
    seawater: { distanceToCoast: 200, currentChloride: 180, previousChloride: 150, inlandWaterLevel: 12, seaLevel: 0, conductivity: 20, hasInterface: false },
  },
  {
    name: '张家口坝上高原',
    description: '高原内陆盆地，生态脆弱区，地下水开采强度较低',
    pollution: { depthToWater: 20, netRecharge: 60, aquiferMedia: '变质岩', soilMedia: '粉质黏土', topography: 5, vadoseZone: '粉质黏土', conductivity: 8, landUse: '草地' },
    overexploitation: { extraction: 1500, recharge: 3500, waterLevelDecline: 0.1, aquiferType: '裂隙水', allowableExtraction: 2500 },
    subsidence: { compressibleLayerThickness: 8, waterLevelDecline: 2, layerType: '粉土', structure: '单层', historicalSubsidence: 10, currentRate: 1 },
    seawater: { distanceToCoast: 500, currentChloride: 45, previousChloride: 42, inlandWaterLevel: 1200, seaLevel: 0, conductivity: 8, hasInterface: false },
  },
];

