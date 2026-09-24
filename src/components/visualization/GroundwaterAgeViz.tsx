/**
 * GroundwaterAgeViz — E-01 地下水年龄可视化模块
 *
 * 融合同位素测年数据，提供多维度地下水年龄分析：
 *   1. 14C年龄-深度剖面（对数坐标，含含水层组标注）
 *   2. δD-δ18O同位素散点图（大气降水线 + 蒸发线 + 分区着色）
 *   3. 沿径流路径的氚含量衰减曲线（浅层 vs 深层）
 *   4. 水样类型筛选（潜水/中层/深层/岩溶）+ hover详情
 *   5. 年龄分级统计面板
 * 主组件（面板已拆分至 ageVizPanels/ 子目录）
 */

import { Hourglass } from 'lucide-react';
import { AgeDepthProfile } from './ageVizPanels/AgeDepthProfile';
import { IsotopeScatterPlot } from './ageVizPanels/IsotopeScatterPlot';
import { TritiumDecayChart } from './ageVizPanels/TritiumDecayChart';
import { AgeClassificationPanel } from './ageVizPanels/AgeClassificationPanel';

export function GroundwaterAgeViz() {
  return (
    <div className="space-y-4">
      {/* 模块标题 */}
      <div className="flex items-center gap-2 text-xs text-gw-muted">
        <Hourglass size={14} className="text-cyan-400" />
        <span>地下水年龄与同位素测年可视化 — 基于³H/¹⁴C/δD-δ18O多示踪剂数据</span>
      </div>

      {/* 上排：年龄-深度剖面 + 同位素散点图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AgeDepthProfile />
        <IsotopeScatterPlot />
      </div>

      {/* 下排：氚衰减曲线 + 年龄分级统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TritiumDecayChart />
        <AgeClassificationPanel />
      </div>
    </div>
  );
}
