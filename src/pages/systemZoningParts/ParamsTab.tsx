/**
 * 拆分自 SystemZoning.tsx — 含水层参数 Tab 面板
 */

import { zoneAquiferParams } from '../../data/systemZoning';
import { TechCard } from '../../components/UI';

export function ParamsTab() {
  return (
        <div className="space-y-4">
          <TechCard title="系统区含水层参数概要">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">编号</th>
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">名称</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">含水层类型</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">厚度(m)</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">岩性</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">K(m/d)</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">T(m²/d)</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">给水度</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">水位埋深</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">水质</th>
                </tr></thead>
                <tbody>
                  {zoneAquiferParams.map((p, i) => (
                    <tr key={i} className="border-b border-gw-border/30 data-row">
                      <td className="py-2 px-2 text-xs font-mono text-gw-highlight">{p.code}</td>
                      <td className="py-2 px-2 text-xs text-gw-text">{p.name}</td>
                      <td className="py-2 px-2 text-xs">{p.aquiferType}</td>
                      <td className="py-2 px-2 font-mono text-xs text-gw-cyan">{p.thickness}</td>
                      <td className="py-2 px-2 text-xs">{p.lithology}</td>
                      <td className="py-2 px-2 font-mono text-xs">{p.K}</td>
                      <td className="py-2 px-2 font-mono text-xs">{p.T}</td>
                      <td className="py-2 px-2 font-mono text-xs">{p.mu}</td>
                      <td className="py-2 px-2 font-mono text-xs">{p.waterLevel}</td>
                      <td className="py-2 px-2 text-xs text-gw-muted">{p.quality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
  );
}
