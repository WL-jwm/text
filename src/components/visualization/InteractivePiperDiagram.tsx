/**
 * InteractivePiperDiagram — V-03 交互式Piper三线图
 *
 * 升级现有静态SVG Piper图，增加：
 *   - Hover详情tooltip
 *   - 多水样叠加（最多5组）
 *   - 水化学分区着色（菱形背景）
 *   - 点击切换选中水样
 *   - 颜色编码区分不同水样
 */

import { useState, useMemo } from 'react';
import { FlaskConical, Plus, Trash2, Info } from 'lucide-react';
import { TechCard } from '../UI';

// ── 类型 ──

interface IonData {
  label: string;
  Ca: number;
  Mg: number;
  NaK: number;
  HCO3: number;
  SO4: number;
  Cl: number;
  color: string;
}

// ── SVG布局参数 ──

const W = 480, H = 440;
const TRI_SIZE = 130;

// 阳离子三角形（左下）
const CAT = {
  top: { x: 90, y: 30 },        // Ca
  left: { x: 25, y: 30 + TRI_SIZE * 0.866 },   // Mg
  right: { x: 155, y: 30 + TRI_SIZE * 0.866 }, // NaK
};

// 阴离子三角形（右下）
const ANI = {
  top: { x: 360, y: 30 },         // Cl
  left: { x: 225, y: 30 + TRI_SIZE * 0.866 },   // HCO3
  right: { x: 430, y: 30 + TRI_SIZE * 0.866 },  // SO4
};

// 菱形（上方中间）
const DIA = {
  top: { x: 247, y: 15 },
  left: { x: 90, y: 130 },
  right: { x: 360, y: 130 },
  bottom: { x: 247, y: 245 },
};

// ── 水化学分区（菱形内） ──

interface PiperZone {
  name: string;
  color: string;
  opacity: number;
  path: string;
}

const PIPER_ZONES: PiperZone[] = [
  { name: 'Ca-HCO₃型', color: '#22c55e', opacity: 0.06, path: `${DIA.left.x},${DIA.top.y + 30} ${DIA.left.x + 60},${DIA.top.y + 30} ${DIA.left.x + 30},${DIA.top.y}` },
  { name: 'Na-HCO₃型', color: '#3b82f6', opacity: 0.06, path: `${DIA.left.x + 60},${DIA.top.y + 30} ${DIA.right.x},${DIA.top.y + 30} ${DIA.right.x - 30},${DIA.top.y}` },
  { name: 'Ca-SO₄/Cl型', color: '#f59e0b', opacity: 0.06, path: `${DIA.left.x},${DIA.top.y + 30} ${DIA.left.x + 60},${DIA.top.y + 30} ${DIA.left.x + 30},${DIA.top.y + 60}` },
  { name: 'Na-SO₄/Cl型', color: '#ef4444', opacity: 0.06, path: `${DIA.left.x + 60},${DIA.top.y + 30} ${DIA.right.x},${DIA.top.y + 30} ${DIA.right.x - 30},${DIA.top.y + 60}` },
  { name: '混合型', color: '#8b5cf6', opacity: 0.04, path: `${DIA.left.x + 30},${DIA.top.y} ${DIA.right.x - 30},${DIA.top.y} ${DIA.right.x - 30},${DIA.top.y + 60} ${DIA.left.x + 30},${DIA.top.y + 60}` },
];

// ── 预设水样数据 ──

const DEFAULT_SAMPLES: IonData[] = [
  { label: '石家庄-浅层', Ca: 68, Mg: 24, NaK: 18, HCO3: 280, SO4: 72, Cl: 38, color: '#22c55e' },
  { label: '沧州-深层', Ca: 12, Mg: 8, NaK: 280, HCO3: 340, SO4: 120, Cl: 180, color: '#3b82f6' },
  { label: '唐山-岩溶', Ca: 95, Mg: 35, NaK: 8, HCO3: 310, SO4: 58, Cl: 22, color: '#f59e0b' },
];

const SAMPLE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

// ── 坐标转换 ──

function cationPoint(Ca: number, Mg: number, NaK: number) {
  const total = Ca + Mg + NaK || 1;
  const cCa = Ca / total, cMg = Mg / total, cNaK = NaK / total;
  return {
    x: CAT.top.x * cCa + CAT.left.x * cMg + CAT.right.x * cNaK,
    y: CAT.top.y * cCa + CAT.left.y * cMg + CAT.right.y * cNaK,
  };
}

function anionPoint(HCO3: number, SO4: number, Cl: number) {
  const total = HCO3 + SO4 + Cl || 1;
  const cH = HCO3 / total, cS = SO4 / total, cC = Cl / total;
  return {
    x: ANI.left.x * cH + ANI.right.x * cS + ANI.top.x * cC,
    y: ANI.left.y * cH + ANI.right.y * cS + ANI.top.y * cC,
  };
}

function diamondPoint(catP: { x: number; y: number }, aniP: { x: number; y: number }) {
  // 菱形点 = 阳离子点和阴离子点向菱形的投影
  // 水平位置: 阳离子Ca+Mg比例 (左) vs NaK比例 (右) + 阴离子HCO3比例 (左) vs SO4+Cl比例 (右)
  const catCenterX = (CAT.left.x + CAT.right.x) / 2;
  const aniCenterX = (ANI.left.x + ANI.right.x) / 2;
  // 从阳离子三角形中心到点的偏移
  const catOffset = (catP.x - catCenterX) / ((CAT.right.x - CAT.left.x) / 2);
  const aniOffset = (aniP.x - aniCenterX) / ((ANI.right.x - ANI.left.x) / 2);
  const x = DIA.left.x + ((DIA.right.x - DIA.left.x) / 2) * (1 + (catOffset + aniOffset) / 2);
  const y = DIA.top.y + ((DIA.bottom.y - DIA.top.y) / 2) + ((catOffset - aniOffset) / 2) * ((DIA.bottom.y - DIA.top.y) / 2);
  return { x, y };
}

// ── 判定水化学类型 ──

function classifyWater(d: IonData): string {
  const cat = d.Ca > d.Mg && d.Ca > d.NaK ? 'Ca' : d.Mg > d.NaK ? 'Mg' : 'Na';
  const ani = d.HCO3 > d.SO4 && d.HCO3 > d.Cl ? 'HCO₃' : d.SO4 > d.Cl ? 'SO₄' : 'Cl';
  return `${cat}-${ani}`;
}

export function InteractivePiperDiagram() {
  const [samples, setSamples] = useState<IonData[]>(DEFAULT_SAMPLES);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showZones, setShowZones] = useState(true);

  // 计算所有水样的Piper坐标
  const computed = useMemo(() => samples.map((s, i) => {
    const cat = cationPoint(s.Ca, s.Mg, s.NaK);
    const ani = anionPoint(s.HCO3, s.SO4, s.Cl);
    const dia = diamondPoint(cat, ani);
    return { sample: s, cat, ani, dia, index: i, type: classifyWater(s) };
  }), [samples]);

  const addSample = () => {
    if (samples.length >= 5) return;
    const color = SAMPLE_COLORS[samples.length] ?? '#94a3b8';
    setSamples([...samples, {
      label: `水样${samples.length + 1}`,
      Ca: 40, Mg: 20, NaK: 40, HCO3: 200, SO4: 80, Cl: 60,
      color,
    }]);
  };

  const removeSample = (idx: number) => {
    setSamples(samples.filter((_, i) => i !== idx));
    if (hovered === idx) setHovered(null);
    if (selected === idx) setSelected(null);
  };

  const updateSample = (idx: number, field: keyof IonData, value: number | string) => {
    setSamples(samples.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <FlaskConical size={16} className="text-cyan-400" />
          交互式Piper三线图
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2 py-1 rounded text-[10px] border transition-all ${
              showZones ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'border-gw-border/30 text-gw-muted'
            }`}
          >
            <Info size={10} className="inline mr-1" />
            分区
          </button>
          <button
            onClick={addSample}
            disabled={samples.length >= 5}
            className="px-2 py-1 rounded text-[10px] border border-gw-blue/40 bg-gw-blue/10 text-gw-blue hover:bg-gw-blue/20 disabled:opacity-30 transition-all"
          >
            <Plus size={10} className="inline mr-1" />
            添加水样
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Piper图 */}
        <div className="lg:col-span-3 flex justify-center">
          <svg width={W} height={H} className="max-w-full">
            {/* 水化学分区背景 */}
            {showZones && PIPER_ZONES.map((zone, i) => (
              <g key={i}>
                <polygon points={zone.path} fill={zone.color} fillOpacity={zone.opacity} />
              </g>
            ))}

            {/* 阳离子三角形 */}
            <polygon
              points={`${CAT.top.x},${CAT.top.y} ${CAT.left.x},${CAT.left.y} ${CAT.right.x},${CAT.right.y}`}
              fill="rgba(59,130,246,0.03)" stroke="#3b82f6" strokeWidth="1"
            />
            {/* 阳离子三角形内部网格 */}
            {[25, 50, 75].map(pct => {
              const t = pct / 100;
              return (
                <g key={pct} stroke="#1e3a5f" strokeWidth="0.3" opacity="0.4">
                  <line
                    x1={CAT.top.x + (CAT.left.x - CAT.top.x) * t}
                    y1={CAT.top.y + (CAT.left.y - CAT.top.y) * t}
                    x2={CAT.right.x + (CAT.left.x - CAT.right.x) * (1 - t)}
                    y2={CAT.right.y + (CAT.left.y - CAT.right.y) * (1 - t)}
                  />
                  <line
                    x1={CAT.top.x + (CAT.right.x - CAT.top.x) * t}
                    y1={CAT.top.y + (CAT.right.y - CAT.top.y) * t}
                    x2={CAT.left.x + (CAT.right.x - CAT.left.x) * (1 - t)}
                    y2={CAT.left.y + (CAT.right.y - CAT.left.y) * (1 - t)}
                  />
                </g>
              );
            })}
            <text x={CAT.top.x} y={CAT.top.y - 6} fontSize="10" fill="#3b82f6" textAnchor="middle" fontWeight="bold">Ca²⁺</text>
            <text x={CAT.left.x - 12} y={CAT.left.y + 14} fontSize="10" fill="#3b82f6" textAnchor="middle">Mg²⁺</text>
            <text x={CAT.right.x + 14} y={CAT.right.y + 14} fontSize="10" fill="#3b82f6" textAnchor="middle">Na⁺+K⁺</text>

            {/* 阴离子三角形 */}
            <polygon
              points={`${ANI.top.x},${ANI.top.y} ${ANI.left.x},${ANI.left.y} ${ANI.right.x},${ANI.right.y}`}
              fill="rgba(239,68,68,0.03)" stroke="#ef4444" strokeWidth="1"
            />
            {[25, 50, 75].map(pct => {
              const t = pct / 100;
              return (
                <g key={pct} stroke="#5f1e1e" strokeWidth="0.3" opacity="0.4">
                  <line
                    x1={ANI.top.x + (ANI.left.x - ANI.top.x) * t}
                    y1={ANI.top.y + (ANI.left.y - ANI.top.y) * t}
                    x2={ANI.right.x + (ANI.left.x - ANI.right.x) * (1 - t)}
                    y2={ANI.right.y + (ANI.left.y - ANI.right.y) * (1 - t)}
                  />
                  <line
                    x1={ANI.top.x + (ANI.right.x - ANI.top.x) * t}
                    y1={ANI.top.y + (ANI.right.y - ANI.top.y) * t}
                    x2={ANI.left.x + (ANI.right.x - ANI.left.x) * (1 - t)}
                    y2={ANI.left.y + (ANI.right.y - ANI.left.y) * (1 - t)}
                  />
                </g>
              );
            })}
            <text x={ANI.top.x} y={ANI.top.y - 6} fontSize="10" fill="#ef4444" textAnchor="middle" fontWeight="bold">Cl⁻</text>
            <text x={ANI.left.x - 14} y={ANI.left.y + 14} fontSize="10" fill="#ef4444" textAnchor="middle">HCO₃⁻</text>
            <text x={ANI.right.x + 14} y={ANI.right.y + 14} fontSize="10" fill="#ef4444" textAnchor="middle">SO₄²⁻</text>

            {/* 菱形 */}
            <polygon
              points={`${DIA.top.x},${DIA.top.y} ${DIA.right.x},${DIA.right.y} ${DIA.bottom.x},${DIA.bottom.y} ${DIA.left.x},${DIA.left.y}`}
              fill="rgba(139,92,246,0.02)" stroke="#8b5cf6" strokeWidth="1"
            />
            {/* 菱形分区标签 */}
            {showZones && (
              <>
                <text x={DIA.left.x + 35} y={DIA.top.y + 25} fontSize="7" fill="#22c55e" textAnchor="middle" opacity="0.6">Ca-HCO₃</text>
                <text x={DIA.right.x - 35} y={DIA.top.y + 25} fontSize="7" fill="#3b82f6" textAnchor="middle" opacity="0.6">Na-HCO₃</text>
                <text x={DIA.left.x + 35} y={DIA.top.y + 65} fontSize="7" fill="#f59e0b" textAnchor="middle" opacity="0.6">Ca-SO₄</text>
                <text x={DIA.right.x - 35} y={DIA.top.y + 65} fontSize="7" fill="#ef4444" textAnchor="middle" opacity="0.6">Na-Cl</text>
              </>
            )}

            {/* 数据点 */}
            {computed.map(({ sample, cat, ani, dia, index, type }) => {
              const isHover = hovered === index;
              const isSelected = selected === index;
              const r = isHover || isSelected ? 7 : 5;
              return (
                <g key={index}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(selected === index ? null : index)}
                  className="cursor-pointer"
                >
                  {/* 连接线 */}
                  <line x1={cat.x} y1={cat.y} x2={dia.x} y2={dia.y} stroke={sample.color} strokeWidth="0.5" strokeDasharray="2 2" opacity={isHover ? 0.8 : 0.3} />
                  <line x1={ani.x} y1={ani.y} x2={dia.x} y2={dia.y} stroke={sample.color} strokeWidth="0.5" strokeDasharray="2 2" opacity={isHover ? 0.8 : 0.3} />

                  {/* 阳离子点 */}
                  <circle cx={cat.x} cy={cat.y} r={r - 1} fill={sample.color} stroke="#fff" strokeWidth="1" opacity={isHover ? 1 : 0.7} />
                  {/* 阴离子点 */}
                  <circle cx={ani.x} cy={ani.y} r={r - 1} fill={sample.color} stroke="#fff" strokeWidth="1" opacity={isHover ? 1 : 0.7} />
                  {/* 菱形点 */}
                  <circle cx={dia.x} cy={dia.y} r={r} fill={sample.color} stroke="#fff" strokeWidth="1.5" opacity={1} />
                  {isSelected && (
                    <circle cx={dia.x} cy={dia.y} r={r + 4} fill="none" stroke={sample.color} strokeWidth="1" strokeDasharray="3 2" />
                  )}

                  {/* Hover tooltip */}
                  {isHover && (
                    <g>
                      <rect x={dia.x + 12} y={dia.y - 40} width="140" height="75" fill="#1e293b" stroke={sample.color} strokeWidth="0.5" rx="4" opacity="0.95" />
                      <text x={dia.x + 20} y={dia.y - 26} fontSize="9" fill={sample.color} fontWeight="bold">{sample.label}</text>
                      <text x={dia.x + 20} y={dia.y - 14} fontSize="8" fill="#94a3b8">类型: {type}</text>
                      <text x={dia.x + 20} y={dia.y - 2} fontSize="7" fill="#64748b">Ca:{sample.Ca} Mg:{sample.Mg} Na+K:{sample.NaK}</text>
                      <text x={dia.x + 20} y={dia.y + 10} fontSize="7" fill="#64748b">HCO₃:{sample.HCO3} SO₄:{sample.SO4} Cl:{sample.Cl}</text>
                      <text x={dia.x + 20} y={dia.y + 22} fontSize="7" fill="#475569">单位: mg/L</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* 百分比刻度 */}
            <text x={(CAT.left.x + CAT.right.x) / 2} y={CAT.left.y + 30} fontSize="8" fill="#475569" textAnchor="middle">阳离子 (%)</text>
            <text x={(ANI.left.x + ANI.right.x) / 2} y={ANI.left.y + 30} fontSize="8" fill="#475569" textAnchor="middle">阴离子 (%)</text>
          </svg>
        </div>

        {/* 水样管理面板 */}
        <div className="lg:col-span-2 space-y-2 max-h-[440px] overflow-y-auto">
          {computed.map(({ sample, type, index }) => (
            <div
              key={index}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                selected === index || hovered === index
                  ? 'border-gw-blue/40 bg-gw-blue/5'
                  : 'border-gw-border/20'
              }`}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(selected === index ? null : index)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: sample.color }} />
                  <span className="text-[10px] text-gw-text font-medium">{sample.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-gw-muted px-1.5 py-0.5 rounded bg-gw-surface/60">{type}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSample(index); }}
                    className="text-gw-muted/50 hover:text-red-400"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
              {selected === index && (
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {([
                    ['Ca', sample.Ca], ['Mg', sample.Mg], ['Na+K', sample.NaK],
                    ['HCO₃', sample.HCO3], ['SO₄', sample.SO4], ['Cl', sample.Cl],
                  ] as [string, number][]).map(([ion, val]) => (
                    <div key={ion}>
                      <label className="text-[8px] text-gw-muted">{ion}</label>
                      <input
                        type="number"
                        value={val}
                        onChange={e => {
                          const field = ion === 'Na+K' ? 'NaK' : ion === 'HCO₃' ? 'HCO3' : ion === 'SO₄' ? 'SO4' : ion;
                          updateSample(index, field as keyof IonData, Number(e.target.value) || 0);
                        }}
                        className="w-full px-1 py-0.5 rounded bg-gw-surface border border-gw-border/30 text-gw-text text-[9px]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* 分区图例 */}
          {showZones && (
            <div className="p-2 rounded-lg border border-gw-border/20">
              <div className="text-[9px] text-gw-muted mb-1">水化学分区</div>
              <div className="grid grid-cols-2 gap-1">
                {PIPER_ZONES.map((zone, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded" style={{ background: zone.color, opacity: 0.6 }} />
                    <span className="text-[8px] text-gw-muted">{zone.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </TechCard>
  );
}
