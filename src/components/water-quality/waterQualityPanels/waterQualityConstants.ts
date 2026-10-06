/**
 * 共享类型与常量（拆分自 WaterQualityCalculatorTab.tsx）
 */
import { type SukalovResult } from '../../../utils/waterQualityCalculator';

export interface WaterSample {
  id: string;
  name: string;
  /** { 因子名: 监测值字符串 } */
  values: Record<string, string>;
  /** 苏卡列夫分类的离子浓度输入 */
  sukalovInput: SukalovForm;
  /** 苏卡列夫分类结果 */
  sukalovResult: SukalovResult | null;
}

export interface SukalovForm {
  HCO3: string;
  SO4: string;
  Cl: string;
  Ca: string;
  Mg: string;
  Na: string;
}

export const EMPTY_SUKALOV_FORM: SukalovForm = {
  HCO3: '', SO4: '', Cl: '', Ca: '', Mg: '', Na: '',
};

export const CLASS_BG: Record<string, string> = {
  'I': 'bg-emerald-500/15 text-emerald-400',
  'II': 'bg-lime-500/15 text-lime-400',
  'III': 'bg-yellow-500/15 text-yellow-400',
  'IV': 'bg-orange-500/15 text-orange-400',
  'V': 'bg-red-500/15 text-red-400',
};
