/**
 * B-35 地下水数值模拟 — 结果后处理（自 numericalFlowSimulator 拆分）
 */

export function headToHeatmapData(
  head: number[][],
  rows: number,
  cols: number,
): { x: number; y: number; value: number }[] {
  const data: { x: number; y: number; value: number }[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      data.push({ x: j, y: i, value: head[i][j] });
    }
  }
  return data;
}

/** 降深矩阵转等值线数据 */

export function drawdownToContourData(
  drawdown: number[][],
  rows: number,
  cols: number,
): { x: number; y: number; z: number }[] {
  const data: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      data.push({ x: j, y: i, z: drawdown[i][j] });
    }
  }
  return data;
}

/** 生成流场矢量箭头数据 */

export function velocityToArrows(
  velocity: { vx: number; vy: number }[][],
  rows: number,
  cols: number,
  skip = 2,
): { x: number; y: number; dx: number; dy: number; magnitude: number }[] {
  const arrows: { x: number; y: number; dx: number; dy: number; magnitude: number }[] = [];
  for (let i = 0; i < rows; i += skip) {
    for (let j = 0; j < cols; j += skip) {
      const { vx, vy } = velocity[i][j];
      const mag = Math.sqrt(vx * vx + vy * vy);
      if (mag > 0.001) {
        arrows.push({ x: j, y: i, dx: vx, dy: vy, magnitude: mag });
      }
    }
  }
  return arrows;
}

/** 计算水位降深统计信息 */

export function calcDrawdownStats(drawdown: number[][], rows: number, cols: number) {
  let max = 0, min = Infinity, sum = 0;
  let above1m = 0, above5m = 0, above10m = 0;
  const total = rows * cols;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const d = Math.abs(drawdown[i][j]);
      if (d > max) max = d;
      if (d < min) min = d;
      sum += d;
      if (d > 1) above1m++;
      if (d > 5) above5m++;
      if (d > 10) above10m++;
    }
  }

  return {
    maxDrawdown: max,
    minDrawdown: min === Infinity ? 0 : min,
    avgDrawdown: sum / total,
    above1mPercent: (above1m / total) * 100,
    above5mPercent: (above5m / total) * 100,
    above10mPercent: (above10m / total) * 100,
  };
}

/** 达西流速统计 */

export function calcVelocityStats(velocity: { vx: number; vy: number }[][], rows: number, cols: number) {
  let maxVel = 0, sumVel = 0;
  const total = rows * cols;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const mag = Math.sqrt(velocity[i][j].vx ** 2 + velocity[i][j].vy ** 2);
      if (mag > maxVel) maxVel = mag;
      sumVel += mag;
    }
  }

  return {
    maxVelocity: maxVel,
    avgVelocity: sumVel / total,
  };
}
