/**
 * RunoffPanel — 历史水文地质参数展示面板（自 HydrogeologyHistorical.tsx 拆分）
 */
import { TechCard } from '../../components/UI';
import {
  riverLeakageData, mountainRunoffModulus,
} from '../../data/hydrogeologyHistorical';

export function RunoffPanel() {
  return (
        <div className="space-y-4">
          <TechCard title="河流渗漏数据" badge="12条">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">河流</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">渗漏段</th>
                  <th className="text-gw-muted py-1.5 px-2">实测漏失(m³/s)</th>
                  <th className="text-gw-muted py-1.5 px-2">平均漏失(m³/s)</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">备注</th>
                </tr></thead>
                <tbody>
                  {riverLeakageData.map((r, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{r.river}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.section}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{r.measuredLeakage}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{r.avgLeakage}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="山区径流模数" badge="L/(s·km²)">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">岩性组合</th>
                  <th className="text-gw-muted py-1.5 px-2">范围</th>
                  <th className="text-gw-muted py-1.5 px-2">平均值</th>
                </tr></thead>
                <tbody>
                  {mountainRunoffModulus.map((m, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{m.rockType}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{m.range}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{m.average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
  );
}
