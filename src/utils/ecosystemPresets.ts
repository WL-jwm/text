/**
 * 生态系统服务价值评估 — 区域预设
 */

import type { RegionPreset } from './ecosystemTypes';

export const REGION_PRESETS: RegionPreset[] = [
  {
    id: 'hebei_plain',
    name: '河北平原区',
    description: '华北平原河北部分，地下水开发利用程度高',
    population: 5000,
    supply: {
      annualResource: 89.5, actualExtraction: 105.2,
      domesticRatio: 25, irrigationRatio: 55, industrialRatio: 15, ecologicalRatio: 5,
      domesticPrice: 3.5, irrigationPrice: 0.3, industrialPrice: 5.0,
    },
    regulation: {
      baseflowContribution: 15, riverRunoff: 50,
      purifiedPollutants: 5000, treatmentCost: 2.5,
      carbonStorage: 1200, carbonPrice: 80,
      storageCapacity: 35, floodAvoidanceValue: 0.5,
      evapotranspiration: 30,
    },
    cultural: {
      springCount: 8, annualVisitors: 300, avgSpending: 200,
      geologicalSites: 15, researchProjects: 20, avgResearchFunding: 50,
    },
    supporting: {
      wetlandArea: 500, endangeredSpecies: 5, vegetationCoverage: 30,
      protectedArea: 800, biodiversityValue: 15,
    },
  },
  {
    id: 'taihang_piedmont',
    name: '太行山前平原',
    description: '石家庄-保定-邢台山前冲洪积扇地带',
    population: 2000,
    supply: {
      annualResource: 35.2, actualExtraction: 42.8,
      domesticRatio: 30, irrigationRatio: 50, industrialRatio: 15, ecologicalRatio: 5,
      domesticPrice: 3.8, irrigationPrice: 0.35, industrialPrice: 5.5,
    },
    regulation: {
      baseflowContribution: 20, riverRunoff: 15,
      purifiedPollutants: 2000, treatmentCost: 2.0,
      carbonStorage: 450, carbonPrice: 80,
      storageCapacity: 15, floodAvoidanceValue: 0.8,
      evapotranspiration: 12,
    },
    cultural: {
      springCount: 12, annualVisitors: 150, avgSpending: 250,
      geologicalSites: 20, researchProjects: 15, avgResearchFunding: 60,
    },
    supporting: {
      wetlandArea: 200, endangeredSpecies: 8, vegetationCoverage: 40,
      protectedArea: 350, biodiversityValue: 20,
    },
  },
  {
    id: 'yanMountain',
    name: '燕山山区',
    description: '承德-张家口山区，地下水生态价值高',
    population: 800,
    supply: {
      annualResource: 22.5, actualExtraction: 12.8,
      domesticRatio: 35, irrigationRatio: 40, industrialRatio: 10, ecologicalRatio: 15,
      domesticPrice: 4.0, irrigationPrice: 0.4, industrialPrice: 6.0,
    },
    regulation: {
      baseflowContribution: 45, riverRunoff: 25,
      purifiedPollutants: 800, treatmentCost: 1.5,
      carbonStorage: 800, carbonPrice: 80,
      storageCapacity: 8, floodAvoidanceValue: 1.2,
      evapotranspiration: 8,
    },
    cultural: {
      springCount: 25, annualVisitors: 500, avgSpending: 350,
      geologicalSites: 35, researchProjects: 25, avgResearchFunding: 80,
    },
    supporting: {
      wetlandArea: 300, endangeredSpecies: 15, vegetationCoverage: 65,
      protectedArea: 1200, biodiversityValue: 30,
    },
  },
  {
    id: 'coastal_plain',
    name: '滨海平原',
    description: '沧州-唐山滨海区域，海水入侵风险区',
    population: 1000,
    supply: {
      annualResource: 15.8, actualExtraction: 18.5,
      domesticRatio: 28, irrigationRatio: 52, industrialRatio: 18, ecologicalRatio: 2,
      domesticPrice: 4.2, irrigationPrice: 0.38, industrialPrice: 5.8,
    },
    regulation: {
      baseflowContribution: 8, riverRunoff: 10,
      purifiedPollutants: 1200, treatmentCost: 3.0,
      carbonStorage: 200, carbonPrice: 80,
      storageCapacity: 5, floodAvoidanceValue: 1.5,
      evapotranspiration: 6,
    },
    cultural: {
      springCount: 3, annualVisitors: 80, avgSpending: 180,
      geologicalSites: 8, researchProjects: 10, avgResearchFunding: 45,
    },
    supporting: {
      wetlandArea: 350, endangeredSpecies: 10, vegetationCoverage: 25,
      protectedArea: 500, biodiversityValue: 25,
    },
  },
  {
    id: 'baiyangdian',
    name: '白洋淀流域',
    description: '雄安新区核心水系，地下水-地表水交互区',
    population: 500,
    supply: {
      annualResource: 8.5, actualExtraction: 6.2,
      domesticRatio: 40, irrigationRatio: 35, industrialRatio: 10, ecologicalRatio: 15,
      domesticPrice: 4.5, irrigationPrice: 0.42, industrialPrice: 6.5,
    },
    regulation: {
      baseflowContribution: 30, riverRunoff: 8,
      purifiedPollutants: 600, treatmentCost: 2.8,
      carbonStorage: 150, carbonPrice: 80,
      storageCapacity: 3, floodAvoidanceValue: 2.0,
      evapotranspiration: 4,
    },
    cultural: {
      springCount: 5, annualVisitors: 800, avgSpending: 400,
      geologicalSites: 12, researchProjects: 30, avgResearchFunding: 100,
    },
    supporting: {
      wetlandArea: 366, endangeredSpecies: 20, vegetationCoverage: 55,
      protectedArea: 400, biodiversityValue: 40,
    },
  },
  {
    id: 'zhangjiakou',
    name: '坝上高原',
    description: '张家口坝上地区，生态屏障与首都水源地',
    population: 400,
    supply: {
      annualResource: 6.8, actualExtraction: 4.5,
      domesticRatio: 30, irrigationRatio: 45, industrialRatio: 5, ecologicalRatio: 20,
      domesticPrice: 4.0, irrigationPrice: 0.35, industrialPrice: 5.5,
    },
    regulation: {
      baseflowContribution: 55, riverRunoff: 6,
      purifiedPollutants: 300, treatmentCost: 1.8,
      carbonStorage: 350, carbonPrice: 80,
      storageCapacity: 2, floodAvoidanceValue: 1.0,
      evapotranspiration: 2,
    },
    cultural: {
      springCount: 15, annualVisitors: 600, avgSpending: 300,
      geologicalSites: 25, researchProjects: 20, avgResearchFunding: 70,
    },
    supporting: {
      wetlandArea: 250, endangeredSpecies: 18, vegetationCoverage: 70,
      protectedArea: 800, biodiversityValue: 35,
    },
  },
];

// ============================================================
// 核心计算函数
// ============================================================

