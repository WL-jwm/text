/**
 * 共享常量与类型（拆分自 FractureWater.tsx）
 */
import { Layers, MapPin, FlaskConical, Droplets, Gauge, BookOpen, Calculator } from 'lucide-react';

export const TABS = [
  { key: 'types', label: '类型分类', icon: Layers },
  { key: 'zones', label: '富水性分区', icon: MapPin },
  { key: 'chemistry', label: '水化学特征', icon: FlaskConical },
  { key: 'cases', label: '开发案例', icon: Droplets },
  { key: 'lithology', label: '岩性富水性', icon: Gauge },
  { key: 'classic', label: '经典参考', icon: BookOpen },
  { key: 'calculator', label: '涌水量估算', icon: Calculator },
] as const;


export type FractureTabKey = typeof TABS[number]['key'];
