/**
 * 拆分自 hydrogeologyHistorical.ts
 */

// ───────────────────────────────────────────────────────
// 十八、灌区工程数据
// ───────────────────────────────────────────────────────

export interface IrrigationDistrict {
  name: string;
  waterSource: string;
  designFlow: string;        // m³/s
  actualFlow: string;
  designArea: string;        // 万亩
  actualArea: string;
  efficiency: string;        // 渠系水有效利用系数
}

export const largeIrrigationDistricts: IrrigationDistrict[] = [
  { name: '石津灌区', waterSource: '黄壁庄水库', designFlow: '100', actualFlow: '228', designArea: '200', actualArea: '134', efficiency: '0.354' },
  { name: '民有渠灌区', waterSource: '岳城水库', designFlow: '100', actualFlow: '240', designArea: '180', actualArea: '-', efficiency: '0.3' },
  { name: '滏阳河灌区', waterSource: '东武仕水库', designFlow: '45', actualFlow: '30', designArea: '64.5', actualArea: '48', efficiency: '0.5' },
  { name: '唐河灌区', waterSource: '西大洋水库', designFlow: '68', actualFlow: '42', designArea: '100', actualArea: '47', efficiency: '0.52' },
  { name: '王快灌区', waterSource: '王快水库', designFlow: '80', actualFlow: '80', designArea: '208', actualArea: '150', efficiency: '0.4' },
  { name: '易水灌区', waterSource: '安各庄水库', designFlow: '23', actualFlow: '36.2', designArea: '34.7', actualArea: '-', efficiency: '0.47' },
  { name: '房涞溷灌区', waterSource: '拒马河', designFlow: '22.45', actualFlow: '18.8', designArea: '40.7', actualArea: '30', efficiency: '0.403' },
];

export interface MediumIrrigationByRegion {
  region: string;
  count: number;
  designFlow: string;
  actualFlow: string;
  designArea: string;
}

export const mediumIrrigationByRegion: MediumIrrigationByRegion[] = [
  { region: '邯郸', count: 7, designFlow: '55.5', actualFlow: '38.5', designArea: '42.19' },
  { region: '邢台', count: 14, designFlow: '64.7', actualFlow: '52.6', designArea: '81.80' },
  { region: '石家庄', count: 19, designFlow: '107.9', actualFlow: '91.8', designArea: '111.56' },
  { region: '保定', count: 17, designFlow: '84.7', actualFlow: '55.6', designArea: '53.21' },
  { region: '廊坊', count: 6, designFlow: '102.5', actualFlow: '85.0', designArea: '32.95' },
  { region: '沧州', count: 5, designFlow: '110.0', actualFlow: '56.0', designArea: '39.50' },
  { region: '衡水', count: 11, designFlow: '129.4', actualFlow: '111.4', designArea: '58.48' },
  { region: '张家口', count: 45, designFlow: '1312.3', actualFlow: '956.7', designArea: '122.54' },
];

