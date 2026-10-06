/**
 * B-20 地下水同位素年龄估算 Tab
 *
 * 5大面板：
 *  1. ³H年龄 — 活塞流/指数模型衰变年龄
 *  2. ¹⁴C年龄 — δ¹³C校正/稀释校正
 *  3. ⁴He年龄 — He累积法定年
 *  4. 补给温度 — δ²H-δ¹⁸O关系估算补给温度/高程
 *  5. 预设监测点 — 8组河北平原同位素数据对比
 * 面板: RechargeTempPanel（拆分自 IsotopeAgeTab.tsx）
 */
import { type RechargeTempInput, calcAllPresetSites, calcRechargeTemp } from '../../../utils/isotopeAgeCalculator';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, StatCard } from '../../UI';
import { Thermometer } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Cell, XAxis, CartesianGrid, YAxis, Tooltip, Scatter, ResponsiveContainer, ZAxis, ReferenceLine, ScatterChart } from 'recharts';
import { TOOLTIP_STYLE } from './isotopeAgeConstants';

export function RechargeTempPanel() {
  const [name, setName] = useState('自定义监测点');
  const [delta18O, setDelta18O] = useState(-9.1);
  const [deltaD, setDeltaD] = useState(-68);
  const [lmwlSlope, setLmwlSlope] = useState(7.8);
  const [lmwlIntercept, setLmwlIntercept] = useState(9);
  const [d18OTempSlope, setD18OTempSlope] = useState(0.3);
  const [elevationGradient, setElevationGradient] = useState(-0.25);
  const [referenceElevation, setReferenceElevation] = useState(50);
  const [referenceDelta18O, setReferenceDelta18O] = useState(-8.0);

  const input: RechargeTempInput = {
    name, delta18O, deltaD, lmwlSlope, lmwlIntercept,
    d18OTempSlope: d18OTempSlope, elevationGradient, referenceElevation, referenceDelta18O,
  };
  const result = useMemo(() => calcRechargeTemp(input), [input]);

  // δ²H-δ¹⁸O散点图
  const scatterData = useMemo(() => {
    const sites = calcAllPresetSites();
    return sites.map(s => ({
      x: s.site.delta18O,
      y: s.site.deltaD,
      name: s.site.name,
      fill: s.site.aquiferType === '潜水' ? '#3b82f6' : s.site.aquiferType === '岩溶水' ? '#10b981' : '#f59e0b',
    }));
  }, []);

  // LMWL线
  const lmwlLine = useMemo(() => {
    const points: Array<{ x: number; y: number }> = [];
    for (let x = -12; x <= -6; x += 0.5) {
      points.push({ x, y: lmwlSlope * x + lmwlIntercept });
    }
    return points;
  }, [lmwlSlope, lmwlIntercept]);

  // LMWL ReferenceLine segment
  const lmwlSegment = useMemo(() => {
    if (lmwlLine.length < 2) return [{ x: -12, y: 0 }, { x: -6, y: 0 }];
    return [lmwlLine[0], lmwlLine[lmwlLine.length - 1]];
  }, [lmwlLine]);

  return (
    <div className="space-y-4">
      <TechCard title="δ²H-δ¹⁸O同位素补给温度估算" icon={Thermometer}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">监测点名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">δ¹⁸O (‰)</label>
            <input type="number" step="0.1" value={delta18O} onChange={e => setDelta18O(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">δ²H (‰)</label>
            <input type="number" step="0.1" value={deltaD} onChange={e => setDeltaD(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">LMWL斜率</label>
            <input type="number" step="0.1" value={lmwlSlope} onChange={e => setLmwlSlope(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">LMWL截距</label>
            <input type="number" value={lmwlIntercept} onChange={e => setLmwlIntercept(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">δ¹⁸O-温度斜率 (‰/°C)</label>
            <input type="number" step="0.1" value={d18OTempSlope} onChange={e => setD18OTempSlope(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">高程梯度 (‰/100m)</label>
            <input type="number" step="0.01" value={elevationGradient} onChange={e => setElevationGradient(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">参考高程</label>
            <input type="number" value={referenceElevation} onChange={e => setReferenceElevation(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">参考δ¹⁸O (‰)</label>
            <input type="number" step="0.1" value={referenceDelta18O} onChange={e => setReferenceDelta18O(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="补给温度" value={result.rechargeTemp} unit="°C" accent="text-orange-400" />
        <StatCard title="补给高程" value={result.rechargeElevation} unit="m" accent="text-blue-400" />
        <StatCard title="氘盈余 d-excess" value={result.dExcess} unit="‰" accent="text-violet-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center">
          <span className="text-xs text-gw-muted mb-1">蒸发影响</span>
          <span className="text-xs text-gw-text">{result.evaporationEffect}</span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">分析：</strong>
          {' '}{result.note}
          {' '}{result.waterRockInteraction}
        </p>
      </div>

      {/* δ²H-δ¹⁸O散点图 */}
      <LazyChartCard title="δ²H-δ¹⁸O同位素散点图（预设监测点）">
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" dataKey="x" name="δ¹⁸O" domain={[-12, -6]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'δ¹⁸O (‰)', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -10 }} />
            <YAxis type="number" dataKey="y" name="δ²H" domain={[-90, -40]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'δ²H (‰)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <ZAxis range={[80, 80]} />
            <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
            <ReferenceLine segment={lmwlSegment} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'LMWL', fill: '#10b981', fontSize: 10 }} />
            <Scatter data={scatterData} name="监测点">
              {scatterData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </LazyChartCard>
    </div>
  );
}
