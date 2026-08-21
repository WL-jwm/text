import type { BalanceInput } from '../../utils/balanceCalculator';

export const BALANCE_STATUS_BG: Record<string, string> = {
  surplus: 'bg-emerald-500/15 text-emerald-400',
  balanced: 'bg-blue-500/15 text-blue-400',
  deficit: 'bg-amber-500/15 text-amber-400',
  severe: 'bg-red-500/15 text-red-400',
};

export const OVERDRAFT_STATUS_BG: Record<string, string> = {
  safe: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  over: 'bg-orange-500/15 text-orange-400',
  critical: 'bg-red-500/15 text-red-400',
};

export const OVERDRAFT_COLORS: Record<string, string> = {
  safe: '#10b981',
  warning: '#f59e0b',
  over: '#f97316',
  critical: '#ef4444',
};

export const CHART_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#ef4444', '#14b8a6', '#f97316'];

export const RECHARGE_ITEM_NAMES = ['降水入渗', '侧向径流', '河道渗漏', '渠系渗漏', '灌溉入渗', '越流补给', '其他补给'];

export const emptyInput: BalanceInput = {
  city: '', area: 0,
  precipitationInfiltration: 0, lateralRecharge: 0, riverLeakage: 0,
  canalLeakage: 0, irrigationRecharge: 0, crossFlowRecharge: 0, otherRecharge: 0,
  extraction: 0, evaporation: 0, crossFlowDischarge: 0,
  lateralDischarge: 0, springDischarge: 0,
};

export interface FieldDef {
  key: keyof BalanceInput;
  label: string;
  group: 'info' | 'recharge' | 'discharge';
  width?: string;
}

export const FIELDS: FieldDef[] = [
  { key: 'city', label: '城市', group: 'info', width: 'w-20' },
  { key: 'area', label: '面积(km\u00b2)', group: 'info', width: 'w-20' },
  { key: 'precipitationInfiltration', label: '降水入渗', group: 'recharge' },
  { key: 'lateralRecharge', label: '侧向径流', group: 'recharge' },
  { key: 'riverLeakage', label: '河道渗漏', group: 'recharge' },
  { key: 'canalLeakage', label: '渠系渗漏', group: 'recharge' },
  { key: 'irrigationRecharge', label: '灌溉入渗', group: 'recharge' },
  { key: 'crossFlowRecharge', label: '越流补给', group: 'recharge' },
  { key: 'otherRecharge', label: '其他补给', group: 'recharge' },
  { key: 'extraction', label: '人工开采', group: 'discharge' },
  { key: 'evaporation', label: '潜水蒸发', group: 'discharge' },
  { key: 'crossFlowDischarge', label: '越流排泄', group: 'discharge' },
  { key: 'lateralDischarge', label: '侧向排泄', group: 'discharge' },
  { key: 'springDischarge', label: '泉排泄', group: 'discharge' },
  { key: 'allowableExtraction', label: '允许开采', group: 'discharge' },
];

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
