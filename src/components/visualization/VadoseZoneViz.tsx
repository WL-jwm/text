/**
 * 包气带（非饱和带）入渗可视化（容器）
 * 5 个子组件：
 *  - VadoseProfileDiagram         包气带剖面结构示意
 *  - InfiltrationCoeffChart       各含水层入渗系数分区对比
 *  - InfiltrationDepthCurve       入渗系数随埋深变化曲线
 *  - MountainInfiltrationRanking  山区岩性入渗系数排序
 *  - RechargeComposition          地下水补给组成分析
 */

import { CloudRain } from 'lucide-react';
import { VadoseProfileDiagram } from './VadoseProfileDiagram';
import { InfiltrationCoeffChart } from './InfiltrationCoeffChart';
import { InfiltrationDepthCurve } from './InfiltrationDepthCurve';
import { MountainInfiltrationRanking } from './MountainInfiltrationRanking';
import { RechargeComposition } from './RechargeComposition';

export function VadoseZoneViz() {
  return (
    <div className="space-y-4">
      {/* 模块标题 */}
      <div className="flex items-center gap-2 text-xs text-gw-muted">
        <CloudRain size={14} className="text-cyan-400" />
        <span>包气带水分运移可视化 — 入渗系数/岩性参数/补给构成多维度分析</span>
      </div>

      {/* 上排：包气带剖面 + 入渗系数对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VadoseProfileDiagram />
        <InfiltrationCoeffChart />
      </div>

      {/* 中排：入渗-埋深曲线 + 山区排行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfiltrationDepthCurve />
        <MountainInfiltrationRanking />
      </div>

      {/* 下排：补给构成饼图 */}
      <RechargeComposition />
    </div>
  );
}
