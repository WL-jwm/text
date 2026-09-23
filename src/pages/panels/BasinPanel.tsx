/**
 * BasinPanel — 历史水文地质参数展示面板（自 HydrogeologyHistorical.tsx 拆分）
 */
import { TechCard } from '../../components/UI';
import {
  hanxingKarstParams, huailaiBasinParams, basinAquiferParams,
} from '../../data/hydrogeologyHistorical';

export function BasinPanel() {
  return (
        <div className="space-y-4">
          <TechCard title="邯邢地区岩溶水参数" badge="抽水/注水试验">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">位置</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">含水层</th>
                  <th className="text-gw-muted py-1.5 px-2">出水率(m³/(h·m))</th>
                  <th className="text-gw-muted py-1.5 px-2">方法</th>
                </tr></thead>
                <tbody>
                  {hanxingKarstParams.map((h, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{h.location}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{h.aquifer}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{h.yieldRate}</td>
                      <td className="py-1.5 px-2 text-center text-[10px]">{h.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="怀来盆地冲洪积扇分段参数">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-1.5">位置</th>
                    <th className="text-left text-gw-muted py-1.5 px-1.5">岩性</th>
                    <th className="text-gw-muted py-1.5 px-1.5">厚度(m)</th>
                    <th className="text-gw-muted py-1.5 px-1.5">出水率</th>
                    <th className="text-gw-muted py-1.5 px-1.5">水位(m)</th>
                    <th className="text-gw-muted py-1.5 px-1.5">矿化度</th>
                  </tr></thead>
                  <tbody>
                    {huailaiBasinParams.map((h, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-1.5 font-medium text-gw-text">{h.position}</td>
                        <td className="py-1.5 px-1.5 text-gw-muted text-[9px]">{h.lithology}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{h.thickness}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{h.yieldRate}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{h.waterLevel}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{h.salinity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
            <TechCard title="各盆地含水层参数">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-1.5">位置</th>
                    <th className="text-left text-gw-muted py-1.5 px-1.5">岩性</th>
                    <th className="text-gw-muted py-1.5 px-1.5">厚度(m)</th>
                    <th className="text-gw-muted py-1.5 px-1.5">出水率</th>
                    <th className="text-gw-muted py-1.5 px-1.5">水位(m)</th>
                  </tr></thead>
                  <tbody>
                    {basinAquiferParams.map((b, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-1.5 font-medium text-gw-text">{b.location}</td>
                        <td className="py-1.5 px-1.5 text-gw-muted text-[9px]">{b.lithology}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{b.thickness}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{b.yieldRate}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{b.waterLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>
        </div>
  );
}
