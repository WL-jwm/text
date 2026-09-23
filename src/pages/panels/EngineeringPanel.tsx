/**
 * EngineeringPanel — 历史水文地质参数展示面板（自 HydrogeologyHistorical.tsx 拆分）
 */
import { TechCard } from '../../components/UI';
import {
  reservoirGeology, rockMechanics, largeIrrigationDistricts,
} from '../../data/hydrogeologyHistorical';

export function EngineeringPanel() {
  return (
        <div className="space-y-4">
          <TechCard title="水库工程地质" badge="6座大型水库">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">水库名称</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">位置</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">坝型</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">坝基岩性</th>
                </tr></thead>
                <tbody>
                  {reservoirGeology.map((r, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{r.name}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.location}</td>
                      <td className="py-1.5 px-2 text-center">{r.damType}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.foundationRock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="岩石力学参数" badge="抗压强度 kg/cm²">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">位置</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">岩石名称</th>
                  <th className="text-gw-muted py-1.5 px-2">干燥抗压</th>
                  <th className="text-gw-muted py-1.5 px-2">饱和抗压</th>
                </tr></thead>
                <tbody>
                  {rockMechanics.map((r, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{r.location}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.rockName}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{r.compressiveDry}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{r.compressiveSaturated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="大型灌区工程数据">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">灌区</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">水源</th>
                  <th className="text-gw-muted py-1.5 px-1.5">设计流量</th>
                  <th className="text-gw-muted py-1.5 px-1.5">实际流量</th>
                  <th className="text-gw-muted py-1.5 px-1.5">设计面积(万亩)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">实际面积</th>
                  <th className="text-gw-muted py-1.5 px-1.5">渠系系数</th>
                </tr></thead>
                <tbody>
                  {largeIrrigationDistricts.map((d, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-1.5 font-medium text-gw-text">{d.name}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted text-[9px]">{d.waterSource}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.designFlow}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.actualFlow}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.designArea}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.actualArea}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.efficiency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
  );
}
