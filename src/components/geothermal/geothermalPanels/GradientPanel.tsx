/**
 * B-17 地热资源量评价计算器 Tab
 *
 * 4大面板：
 *  1. 热储储量 — 热储法 Q=ρ·c·V·ΔT 计算 + 预设地热田对比
 *  2. 井产能评价 — 热功率/年产热量/产能等级
 *  3. 地温梯度 — 梯度/热流值/不同深度温度预测
 *  4. 可开采量 — 开采系数法/回灌率/服务年限
 * 面板组件：GradientPanel（拆分自 GeothermalCalculatorTab.tsx）
 */

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { TechCard, StatCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { calcGradient, type GradientInput } from '../../../utils/geothermalCalculator';
import { TOOLTIP_STYLE, GRADIENT_COLORS } from './geothermalConstants';

// ── 面板3: 地温梯度 ──
export function GradientPanel() {
  const [name, setName] = useState('自定义区域');
  const [constantTempZone, setConstantTempZone] = useState(15);
  const [constantTempDepth, setConstantTempDepth] = useState(20);
  const [depth1, setDepth1] = useState(500);
  const [temp1, setTemp1] = useState(30);
  const [depth2, setDepth2] = useState(2000);
  const [temp2, setTemp2] = useState(78);
  const [thermalConductivity, setThermalConductivity] = useState(2.5);

  const input: GradientInput = {
    name, constantTempZone, constantTempDepth, depth1, temp1, depth2, temp2, thermalConductivity,
  };
  const result = useMemo(() => calcGradient(input), [input]);

  const depthProfile = useMemo(() => {
    const temps: Array<{ depth: number; 温度: number }> = [];
    for (let d = 0; d <= 3500; d += 100) {
      const t = constantTempZone + result.gradient * Math.max(0, d - constantTempDepth) / 100;
      temps.push({ depth: d, 温度: Math.round(t * 10) / 10 });
    }
    return temps;
  }, [result, constantTempZone, constantTempDepth]);

  return (
    <div className="space-y-4">
      <TechCard title="地温梯度计算参数" icon={TrendingUp}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">区域名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">恒温带温度 (°C)</label>
            <input type="number" value={constantTempZone} onChange={e => setConstantTempZone(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">恒温带深度</label>
            <input type="number" value={constantTempDepth} onChange={e => setConstantTempDepth(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">测温点1深度</label>
            <input type="number" value={depth1} onChange={e => setDepth1(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">测温点1温度 (°C)</label>
            <input type="number" value={temp1} onChange={e => setTemp1(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">测温点2深度</label>
            <input type="number" value={depth2} onChange={e => setDepth2(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">测温点2温度 (°C)</label>
            <input type="number" value={temp2} onChange={e => setTemp2(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">岩石热导率 W/(m·K)</label>
            <input type="number" step="0.1" value={thermalConductivity} onChange={e => setThermalConductivity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="地温梯度" value={result.gradient} unit="°C/100m" accent={GRADIENT_COLORS[result.gradientGrade]} />
        <StatCard title="大地热流值" value={result.heatFlow} unit="mW/m²" accent="text-orange-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">地温等级</span>
          <span className="text-xl font-bold" style={{ color: GRADIENT_COLORS[result.gradientGrade] }}>
            {result.gradientGrade}
          </span>
        </div>
        <StatCard title="1000m温度" value={result.tempAt1000m} unit="°C" accent="text-blue-400" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard title="1000m温度" value={result.tempAt1000m} unit="°C" accent="text-blue-400" />
        <StatCard title="2000m温度" value={result.tempAt2000m} unit="°C" accent="text-amber-400" />
        <StatCard title="3000m温度" value={result.tempAt3000m} unit="°C" accent="text-red-400" />
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}G = (T2 - T1) / (Z2 - Z1) × 100  (°C/100m)，q = G/100 × λ  (mW/m²)。
          {' '}地温梯度分级：&lt;3.0 正常，3.0~3.5 偏高，3.5~4.5 高地温，&ge;4.5 异常。
          {' '}河北平原平均地温梯度3.0~4.0°C/100m，牛驼镇-雄县一带可达4.0+°C/100m，属高地温异常区。
        </p>
      </div>

      <LazyChartCard title="地温剖面图（温度-深度曲线）">
        <ChartExport data={depthProfile} filename={`${name}_地温剖面`} />
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={depthProfile} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '°C', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -5 }} />
            <YAxis type="number" dataKey="depth" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '深度(m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} reversed />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="温度" fill="#ef4444" fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>
    </div>
  );
}
