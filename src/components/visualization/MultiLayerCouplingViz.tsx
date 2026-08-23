/**
 * 多层含水层耦合可视化（容器）
 * 5 个耦合场景子组件：
 *  - AquiferSystemDiagram           含水层系统耦合剖面
 *  - ShallowDeepExtractionTimeline  深层-浅层开采量时序
 *  - LeakageFlowDiagram             越流补给示意流图
 *  - CityLayeredExtraction          城市分层开采对比
 *  - DeepWaterLevelRecovery         深层承压水水位恢复响应
 */

import { Layers3 } from 'lucide-react';
import { AquiferSystemDiagram } from './AquiferSystemDiagram';
import { ShallowDeepExtractionTimeline } from './ShallowDeepExtractionTimeline';
import { LeakageFlowDiagram } from './LeakageFlowDiagram';
import { CityLayeredExtraction } from './CityLayeredExtraction';
import { DeepWaterLevelRecovery } from './DeepWaterLevelRecovery';

export function MultiLayerCouplingViz() {
  return (
    <div className="space-y-4">
      {/* 模块标题 */}
      <div className="flex items-center gap-2 text-xs text-gw-muted">
        <Layers3 size={14} className="text-cyan-400" />
        <span>多层含水层耦合可视化 — 4组含水层结构/越流补给/分层开采/水位恢复响应</span>
      </div>

      {/* 上排：系统剖面 + 开采时序 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AquiferSystemDiagram />
        <ShallowDeepExtractionTimeline />
      </div>

      {/* 中排：越流流图 + 城市分层对比 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <LeakageFlowDiagram />
        <CityLayeredExtraction />
      </div>

      {/* 下排：水位恢复 */}
      <DeepWaterLevelRecovery />
    </div>
  );
}
