/**
 * B-11 水化学分析计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入6大离子浓度 → 自动分类+评价
 *  2. Piper三线图 — SVG绘制阳离子/阴离子三角形+菱形
 *  3. 预设水样 — 8个河北典型水样对比
 *  4. 离子换算参考 — 毫摩尔换算表+评价标准
 * 面板: PiperDiagramSVG（拆分自 HydrochemCalculatorTab.tsx）
 */
import type { HydrochemAnalysisResult } from '../../../utils/hydrochemCalculator';

export function PiperDiagramSVG({ result }: { result: HydrochemAnalysisResult | null }) {
  if (!result) {
    return <div className="flex items-center justify-center h-[400px] text-gw-muted text-sm">请先输入离子数据</div>;
  }

  const { piper } = result;
  const W = 380, H = 360;
  // 三角形边长

  // 阳离子三角形（左下）
  const cTop = { x: 80, y: 20 };       // Ca (上)
  const cLeft = { x: 10, y: 140 };     // Mg (左下)
  const cRight = { x: 150, y: 140 };   // NaK (右下)
  // 阴离子三角形（右下）
  const aTop = { x: 300, y: 20 };      // Cl (上)
  const aLeft = { x: 160, y: 140 };    // HCO3 (左下)
  const aRight = { x: 370, y: 140 };   // SO4 (右下)
  // 菱形（上方中间）
  const dTop = { x: 220, y: 10 };      // NaK-SO4+Cl
  const dLeft = { x: 80, y: 130 };     // Ca+Mg-HCO3
  const dRight = { x: 300, y: 130 };   // NaK-HCO3... wait
  const dBottom = { x: 220, y: 250 };  // Ca+Mg-SO4+Cl

  // 阳离子点位置：Ca在上，Mg左下，NaK右下
  // 点 = Ca%沿上→左下 + Ca%沿上→右下 的交点
  function cationPoint(Ca: number, Mg: number, NaK: number) {
    // 等边三角形重心坐标→笛卡尔
    // Ca% = (上顶点权重), Mg% = (左下权重), NaK% = (右下权重)
    const x = cTop.x * (Ca / 100) + cLeft.x * (Mg / 100) + cRight.x * (NaK / 100);
    const y = cTop.y * (Ca / 100) + cLeft.y * (Mg / 100) + cRight.y * (NaK / 100);
    return { x, y };
  }

  function anionPoint(HCO3: number, SO4: number, Cl: number) {
    // HCO3左下, SO4右下, Cl上
    const x = aLeft.x * (HCO3 / 100) + aRight.x * (SO4 / 100) + aTop.x * (Cl / 100);
    const y = aLeft.y * (HCO3 / 100) + aRight.y * (SO4 / 100) + aTop.y * (Cl / 100);
    return { x, y };
  }

  function diamondPoint(dx: number, dy: number) {
    // 菱形坐标(0-100) → SVG坐标
    // x轴: 左→右 = Ca+Mg→NaK (阳离子) + HCO3→SO4+Cl (阴离子)
    // y轴: 下→上 = HCO3→SO4+Cl ... 不完全是
    // 简化映射：菱形x 0-100 → dLeft.x→dRight.x, 菱形y 0-100 → dBottom.y→dTop.y
    const x = dLeft.x + (dRight.x - dLeft.x) * (dx / 100);
    const y = dBottom.y - (dBottom.y - dTop.y) * (dy / 100);
    return { x, y };
  }

  const catPt = cationPoint(piper.cation.Ca, piper.cation.Mg, piper.cation.NaK);
  const aniPt = anionPoint(piper.anion.HCO3, piper.anion.SO4, piper.anion.Cl);
  const diaPt = diamondPoint(piper.diamond.x, piper.diamond.y);

  return (
    <svg width={W} height={H} className="max-w-full">
      {/* 阳离子三角形 */}
      <polygon points={`${cTop.x},${cTop.y} ${cLeft.x},${cLeft.y} ${cRight.x},${cRight.y}`}
        fill="rgba(59,130,246,0.05)" stroke="#3b82f6" strokeWidth={1} />
      <text x={cTop.x} y={cTop.y - 5} fontSize={10} fill="#3b82f6" textAnchor="middle">Ca²⁺</text>
      <text x={cLeft.x - 5} y={cLeft.y + 14} fontSize={10} fill="#3b82f6" textAnchor="middle">Mg²⁺</text>
      <text x={cRight.x + 10} y={cRight.y + 14} fontSize={10} fill="#3b82f6" textAnchor="middle">Na⁺+K⁺</text>

      {/* 阴离子三角形 */}
      <polygon points={`${aTop.x},${aTop.y} ${aLeft.x},${aLeft.y} ${aRight.x},${aRight.y}`}
        fill="rgba(239,68,68,0.05)" stroke="#ef4444" strokeWidth={1} />
      <text x={aTop.x} y={aTop.y - 5} fontSize={10} fill="#ef4444" textAnchor="middle">Cl⁻</text>
      <text x={aLeft.x - 12} y={aLeft.y + 14} fontSize={10} fill="#ef4444" textAnchor="middle">HCO₃⁻</text>
      <text x={aRight.x + 10} y={aRight.y + 14} fontSize={10} fill="#ef4444" textAnchor="middle">SO₄²⁻</text>

      {/* 菱形 */}
      <polygon points={`${dTop.x},${dTop.y} ${dRight.x},${dRight.y} ${dBottom.x},${dBottom.y} ${dLeft.x},${dLeft.y}`}
        fill="rgba(139,92,246,0.05)" stroke="#8b5cf6" strokeWidth={1} />

      {/* 连接线（阳离子→菱形→阴离子） */}
      <line x1={catPt.x} y1={catPt.y} x2={diaPt.x} y2={diaPt.y} stroke="#6b7280" strokeWidth={0.5} strokeDasharray="2 2" />
      <line x1={aniPt.x} y1={aniPt.y} x2={diaPt.x} y2={diaPt.y} stroke="#6b7280" strokeWidth={0.5} strokeDasharray="2 2" />

      {/* 数据点 */}
      <circle cx={catPt.x} cy={catPt.y} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={1} />
      <circle cx={aniPt.x} cy={aniPt.y} r={4} fill="#ef4444" stroke="#fff" strokeWidth={1} />
      <circle cx={diaPt.x} cy={diaPt.y} r={5} fill="#8b5cf6" stroke="#fff" strokeWidth={1.5} />

      {/* 标注菱形点 */}
      <text x={diaPt.x + 8} y={diaPt.y - 4} fontSize={9} fill="#8b5cf6" fontWeight="bold">
        {result.sukalief.type}
      </text>
    </svg>
  );
}
