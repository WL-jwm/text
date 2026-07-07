// ── 水文地质参考数据类型定义 ──

/** 渗透系数K值数据项 */
export interface PermeabilityKValueItem {
  lithology: string;
  front: string;
  middle: string;
  east: string;
}

/** 含水层出水率数据项 */
export interface AquiferYieldRateItem {
  lithology: string;
  min: number;
  max: number;
}

/** 出水率与厚度关系数据项 */
export interface ThicknessYieldItem {
  lithology: string;
  t1: string;
  t2: string;
  t3: string;
}

/** 分区参数数据项（南皮县） */
export interface RegionalParamItem {
  zone: string;
  sy: number;
  alpha: number;
}
