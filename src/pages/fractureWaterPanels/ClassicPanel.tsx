/**
 * 面板（拆分自 FractureWater.tsx）
 */
import { TechCard, DataSourceNote, StatCard } from '../../components/UI';
import { rockEngineeringGroups, weatheringThickness, rockCompressiveStrength, runoffModulus } from '../../data/hydrogeologyReference';
import { Droplets, Gauge, Layers, Mountain } from 'lucide-react';

export function ClassicPanel() {
  return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="岩石工程分组" value={String(rockEngineeringGroups.length)} unit="类" icon={Layers} accent="blue" />
            <StatCard title="风化带数据" value={String(weatheringThickness.length)} unit="条" icon={Mountain} accent="cyan" />
            <StatCard title="抗压强度" value={String(rockCompressiveStrength.length)} unit="组" icon={Gauge} accent="green" />
            <StatCard title="径流模数" value={String(runoffModulus.length)} unit="类" icon={Droplets} accent="amber" />
          </div>

          <TechCard title="岩石工程地质分组" icon={Layers}>
            <p className="text-[10px] text-gw-muted mb-3">
              河北省岩石按力学强度和工程地质特征分类，数据来源：《河北省水文地质工程地质》
            </p>
            <div className="space-y-2">
              {rockEngineeringGroups.map((g, i) => (
                <div key={i} className={`p-3 rounded-lg border ${g.category.includes('坚硬') ? 'bg-emerald-500/5 border-emerald-500/15' : g.category.includes('半坚硬') ? 'bg-amber-500/5 border-amber-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gw-text">{g.category}</span>
                    {g.strength && <span className="text-[10px] font-mono text-gw-highlight">{g.strength}</span>}
                  </div>
                  {g.desc && <p className="text-[10px] text-gw-muted mb-1">{g.desc}</p>}
                  {g.rocks && <p className="text-[10px] text-gw-text">代表性岩石：{g.rocks}</p>}
                </div>
              ))}
            </div>
          </TechCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="风化带厚度" icon={Mountain}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gw-border">
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">岩性</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">全风化(m)</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">半风化(m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weatheringThickness.map((w, i) => (
                      <tr key={i} className="border-b border-gw-border/50">
                        <td className="px-2 py-1 text-gw-text text-[10px]">{w.lithology}</td>
                        <td className="px-2 py-1 font-mono text-gw-highlight">{w.full}</td>
                        <td className="px-2 py-1 font-mono text-gw-text">{w.half}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>

            <TechCard title="径流模数（按岩性分类）" icon={Droplets}>
              <p className="text-[10px] text-gw-muted mb-3">不同岩性组合的地下水径流模数统计</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gw-border">
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">岩性组合</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">范围(L/s·km²)</th>
                      <th className="px-2 py-1.5 text-left text-gw-muted font-medium">均值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runoffModulus.map((r, i) => (
                      <tr key={i} className="border-b border-gw-border/50">
                        <td className="px-2 py-1 text-gw-text text-[10px]">{r.rockType}</td>
                        <td className="px-2 py-1 font-mono text-gw-highlight">{r.range}</td>
                        <td className="px-2 py-1 font-mono text-gw-text">{r.avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>

          <DataSourceNote source="《河北省水文地质工程地质》| 岩石力学+风化带+径流模数" version="经典参考" />
        </div>
  );
}
