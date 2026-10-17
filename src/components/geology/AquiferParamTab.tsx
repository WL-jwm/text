/**
 * 主组件（面板已拆分至 aquiferParamPanels/ 子目录）
 */
import { TechCard } from '../UI';
import { Calculator } from 'lucide-react';
import { DarcyPanel } from './aquiferParamPanels/DarcyPanel';
import { ReferencePanel } from './aquiferParamPanels/ReferencePanel';
import { StoragePanel } from './aquiferParamPanels/StoragePanel';
import { UnitConvertPanel } from './aquiferParamPanels/UnitConvertPanel';
import { WellPanel } from './aquiferParamPanels/WellPanel';

export function AquiferParamTab() {
  return (
    <div className="space-y-4">
      {/* 公式说明 */}
      <TechCard icon={Calculator} badge={'\u8ba1\u7b97\u5f15\u64ce'}>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gw-muted">
          <span>{'Q = K\u00b7I\u00b7A (\u8fbe\u897f\u516c\u5f0f)'}</span>
          <span>{'T = K\u00b7M (\u5bfc\u6c34\u7cfb\u6570)'}</span>
          <span>{'q = Q/(s\u00b7M) (\u5355\u4f4d\u6d8c\u6c34\u91cf)'}</span>
          <span>{'R \u2248 2s\u00b7\u221a(KM) (\u5f71\u54cd\u534a\u5f84)'}</span>
          <span>{'V = \u03bc\u00b7F\u00b7\u0394h (\u50a8\u5b58\u91cf)'}</span>
        </div>
      </TechCard>

      {/* 达西公式 */}
      <DarcyPanel />

      {/* 井参数 + 储存量 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WellPanel />
        <StoragePanel />
      </div>

      {/* 单位换算 */}
      <UnitConvertPanel />

      {/* 经验值查询 */}
      <ReferencePanel />
    </div>
  );
}
