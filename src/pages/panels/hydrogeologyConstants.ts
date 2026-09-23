/**
 * 历史水文地质参数汇编 共享常量（自 HydrogeologyHistorical.tsx 拆分）
 */
import { Droplets, Layers, Waves, Mountain, HardHat, Zap, BookOpen, Calculator } from 'lucide-react';
import { historicalSprings } from '../../data/hydrogeologyHistorical';

export type TabKey = 'springs' | 'aquifer' | 'runoff' | 'basin' | 'engineering' | 'geophysics' | 'stratigraphy' | 'calculator';
export const TABS: { key: TabKey; label: string; icon; count?: number }[] = [
  { key: 'springs', label: '泉水数据库', icon: Droplets, count: historicalSprings.length },
  { key: 'aquifer', label: '含水层参数', icon: Layers },
  { key: 'runoff', label: '径流与渗漏', icon: Waves },
  { key: 'basin', label: '盆地参数', icon: Mountain },
  { key: 'engineering', label: '工程地质', icon: HardHat },
  { key: 'geophysics', label: '物探参数', icon: Zap },
  { key: 'stratigraphy', label: '地层柱状', icon: BookOpen },
  { key: 'calculator', label: '参数推算', icon: Calculator },
];
export const REGION_COLORS: Record<string, string> = {
  '邯邢': '#ef4444', '石家庄': '#f59e0b', '唐山': '#3b82f6',
  '承德': '#10b981', '保定': '#8b5cf6', '张家口': '#ec4899',
};
