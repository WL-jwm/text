/**
 * 拆分自 hydrogeologyHistorical.ts
 */

// ───────────────────────────────────────────────────────
// 七、深层水参数
// ───────────────────────────────────────────────────────

export interface DeepWaterParam {
  region: string;
  elasticReleaseCoeff: string;  // 弹性释放系数 S
  leakageRechargeCoeff: string; // 越流补给系数 e
  leakageMax: string;           // 越流系数最大
  leakageMin: string;           // 越流系数最小
}

export const deepWaterParams: DeepWaterParam[] = [
  { region: '沧州', elasticReleaseCoeff: '0.364×10⁻²', leakageRechargeCoeff: '0.177×10⁻⁴', leakageMax: '2660', leakageMin: '152' },
  { region: '衡水', elasticReleaseCoeff: '0.428×10⁻²', leakageRechargeCoeff: '0.189×10⁻⁴', leakageMax: '1716', leakageMin: '171' },
  { region: '邢台', elasticReleaseCoeff: '0.277×10⁻²', leakageRechargeCoeff: '0.134×10⁻⁴', leakageMax: '2660', leakageMin: '158' },
];

// ───────────────────────────────────────────────────────
// 八、给水度与砂层厚度 (分地区)
// ───────────────────────────────────────────────────────

export interface RegionSpecificYield {
  region: string;
  aquiferGroup: string;
  area: string;       // km²
  sandThickness: string;  // m
  specificYield: string;  // 给水度
  staticReserve: string;  // 砂层静储量 亿m³
}

export const regionSpecificYield: RegionSpecificYield[] = [
  { region: '廊坊', aquiferGroup: '浅层I+II', area: '3298', sandThickness: '9.4', specificYield: '0.15', staticReserve: '46.506' },
  { region: '邢台', aquiferGroup: '浅层I', area: '2642', sandThickness: '8.8~9.26', specificYield: '0.165', staticReserve: '38.761' },
  { region: '保定', aquiferGroup: '浅层I+II', area: '1864', sandThickness: '40.18', specificYield: '0.134~0.206', staticReserve: '100.360' },
  { region: '石家庄', aquiferGroup: '浅层I+II', area: '10478', sandThickness: '38.34', specificYield: '0.05', staticReserve: '827.557' },
  { region: '石家庄', aquiferGroup: '浅层I+II', area: '6976', sandThickness: '46.87', specificYield: '0.2456', staticReserve: '803.026' },
];

