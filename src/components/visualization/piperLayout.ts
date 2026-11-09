/**
 * 拆分自 InteractivePiperDiagram.tsx — Piper 三线图几何与数据
 * 离子数据类型、SVG 布局参数、水化学分区、坐标变换与水样分类函数。
 */

// ── 类型 ──

export interface IonData {
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

export const W = 480, H = 440;
export const TRI_SIZE = 130;

// 阳离子三角形（左下）
export const CAT = {
  top: { x: 90, y: 30 },        // Ca
  left: { x: 25, y: 30 + TRI_SIZE * 0.866 },   // Mg
  right: { x: 155, y: 30 + TRI_SIZE * 0.866 }, // NaK
};

// 阴离子三角形（右下）
export const ANI = {
  top: { x: 360, y: 30 },         // Cl
  left: { x: 225, y: 30 + TRI_SIZE * 0.866 },   // HCO3
  right: { x: 430, y: 30 + TRI_SIZE * 0.866 },  // SO4
};

// 菱形（上方中间）
export const DIA = {
  top: { x: 247, y: 15 },
  left: { x: 90, y: 130 },
  right: { x: 360, y: 130 },
  bottom: { x: 247, y: 245 },
};

// ── 水化学分区（菱形内） ──

export interface PiperZone {
  name: string;
  color: string;
  opacity: number;
  path: string;
}

export const PIPER_ZONES: PiperZone[] = [
  { name: 'Ca-HCO₃型', color: '#22c55e', opacity: 0.06, path: `${DIA.left.x},${DIA.top.y + 30} ${DIA.left.x + 60},${DIA.top.y + 30} ${DIA.left.x + 30},${DIA.top.y}` },
  { name: 'Na-HCO₃型', color: '#3b82f6', opacity: 0.06, path: `${DIA.left.x + 60},${DIA.top.y + 30} ${DIA.right.x},${DIA.top.y + 30} ${DIA.right.x - 30},${DIA.top.y}` },
  { name: 'Ca-SO₄/Cl型', color: '#f59e0b', opacity: 0.06, path: `${DIA.left.x},${DIA.top.y + 30} ${DIA.left.x + 60},${DIA.top.y + 30} ${DIA.left.x + 30},${DIA.top.y + 60}` },
  { name: 'Na-SO₄/Cl型', color: '#ef4444', opacity: 0.06, path: `${DIA.left.x + 60},${DIA.top.y + 30} ${DIA.right.x},${DIA.top.y + 30} ${DIA.right.x - 30},${DIA.top.y + 60}` },
  { name: '混合型', color: '#8b5cf6', opacity: 0.04, path: `${DIA.left.x + 30},${DIA.top.y} ${DIA.right.x - 30},${DIA.top.y} ${DIA.right.x - 30},${DIA.top.y + 60} ${DIA.left.x + 30},${DIA.top.y + 60}` },
];

// ── 预设水样数据 ──

export const DEFAULT_SAMPLES: IonData[] = [
  { label: '石家庄-浅层', Ca: 68, Mg: 24, NaK: 18, HCO3: 280, SO4: 72, Cl: 38, color: '#22c55e' },
  { label: '沧州-深层', Ca: 12, Mg: 8, NaK: 280, HCO3: 340, SO4: 120, Cl: 180, color: '#3b82f6' },
  { label: '唐山-岩溶', Ca: 95, Mg: 35, NaK: 8, HCO3: 310, SO4: 58, Cl: 22, color: '#f59e0b' },
];

export const SAMPLE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

// ── 坐标转换 ──

export function cationPoint(Ca: number, Mg: number, NaK: number) {
  const total = Ca + Mg + NaK || 1;
  const cCa = Ca / total, cMg = Mg / total, cNaK = NaK / total;
  return {
    x: CAT.top.x * cCa + CAT.left.x * cMg + CAT.right.x * cNaK,
    y: CAT.top.y * cCa + CAT.left.y * cMg + CAT.right.y * cNaK,
  };
}

export function anionPoint(HCO3: number, SO4: number, Cl: number) {
  const total = HCO3 + SO4 + Cl || 1;
  const cH = HCO3 / total, cS = SO4 / total, cC = Cl / total;
  return {
    x: ANI.left.x * cH + ANI.right.x * cS + ANI.top.x * cC,
    y: ANI.left.y * cH + ANI.right.y * cS + ANI.top.y * cC,
  };
}

export function diamondPoint(catP: { x: number; y: number }, aniP: { x: number; y: number }) {
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

export function classifyWater(d: IonData): string {
  const cat = d.Ca > d.Mg && d.Ca > d.NaK ? 'Ca' : d.Mg > d.NaK ? 'Mg' : 'Na';
  const ani = d.HCO3 > d.SO4 && d.HCO3 > d.Cl ? 'HCO₃' : d.SO4 > d.Cl ? 'SO₄' : 'Cl';
  return `${cat}-${ani}`;
}
