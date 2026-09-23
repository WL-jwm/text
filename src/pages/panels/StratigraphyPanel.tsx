/**
 * StratigraphyPanel — 历史水文地质参数展示面板（自 HydrogeologyHistorical.tsx 拆分）
 */
import { TechCard } from '../../components/UI';
import {
  historicalStratigraphy, chengdeHydrochemistry,
} from '../../data/hydrogeologyHistorical';

export function StratigraphyPanel() {
  return (
        <div className="space-y-4">
          <TechCard title="河北省地层柱状简表" badge="17个地层单元">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-gw-card z-10"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">界</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">系</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">统/群</th>
                  <th className="text-gw-muted py-1.5 px-1.5">厚度(m)</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">主要岩性</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">含水意义</th>
                </tr></thead>
                <tbody>
                  {historicalStratigraphy.map((s, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-1.5 font-medium text-gw-text">{s.era}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted">{s.system}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted">{s.series || s.group}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{s.thickness}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted">{s.mainLithology}</td>
                      <td className="py-1.5 px-1.5 text-gw-cyan text-[9px]">{s.aquiferNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="承德地区水化学特征" badge="表18">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">成分</th>
                  <th className="text-gw-muted py-1.5 px-1.5">强烈侵蚀区(浅部)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">侵蚀-堆积区(浅部)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">侵蚀-堆积区(深部)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">单位</th>
                </tr></thead>
                <tbody>
                  {chengdeHydrochemistry.map((c, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-1.5 font-medium text-gw-text">{c.component}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.strongErosion}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.erosionDepositShallow}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.erosionDepositDeep}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted text-center">{c.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
  );
}
