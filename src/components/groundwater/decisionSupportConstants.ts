/**
 * 拆分自 DecisionSupportTab.tsx — 共享常量与纯函数
 */

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const WARNING_COLORS: Record<string, string> = {
  '蓝色': '#2563eb', '黄色': '#eab308', '橙色': '#ea580c', '红色': '#dc2626',
};
export const SOURCE_COLORS = ['#06b6d4', '#0ea5e9', '#6366f1', '#14b8a6', '#f43f5e'];
export const WARNING_GRADIENTS: Record<string, [string, string]> = {
  '蓝色': ['#1e3a5f', '#1a2f4a'],
  '黄色': ['#422006', '#3a1d05'],
  '橙色': ['#431407', '#3a1206'],
  '红色': ['#450a0a', '#3c0808'],
};
export function romanLevel(n: number): string { return 'Ⅰ'.repeat(n) + '类'; }
export function satisfactionColor(rate: number): string {
  if (rate >= 90) return '#10b981';
  if (rate >= 70) return '#3b82f6';
  if (rate >= 50) return '#f59e0b';
  return '#ef4444';
}
