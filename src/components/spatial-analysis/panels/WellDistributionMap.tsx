/**
 * 监测井分布图（Canvas）
 *  B-33 监测网优化 — 空间覆盖面板内子组件（自 MonitoringNetworkTab.tsx 拆分）
 */
import { useEffect, useRef } from 'react';
import type { MonitoringArea } from '../../../utils/monitoringNetworkCalculator';
import { calcSpatialCoverage } from '../../../utils/monitoringNetworkCalculator';
import { WELL_TYPE_LABELS } from '../../../utils/monitoringNetworkPresets';
import { WELL_TYPE_COLORS } from '../monitoringNetworkConstants';

export function WellDistributionMap({ area }: { area: MonitoringArea }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / area.cols;
    const cellH = h / area.rows;

    // 背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // 网格线
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= area.rows; i += 5) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(w, i * cellH);
      ctx.stroke();
    }
    for (let j = 0; j <= area.cols; j += 5) {
      ctx.beginPath();
      ctx.moveTo(j * cellW, 0);
      ctx.lineTo(j * cellW, h);
      ctx.stroke();
    }

    // 计算覆盖区域
    const coverage = calcSpatialCoverage(area);
    const maxDist = Math.max(area.rows, area.cols) * 0.3;

    // 绘制覆盖空白
    for (const blank of coverage.blankZones) {
      ctx.fillStyle = 'rgba(239,68,68,0.15)';
      ctx.fillRect(blank.col * cellW, blank.row * cellH, cellW + 1, cellH + 1);
    }

    // 绘制泰森多边形（简化：每口井的控制范围用半透明圆）
    for (const well of area.wells) {
      const cx = well.col * cellW + cellW / 2;
      const cy = well.row * cellH + cellH / 2;
      const radius = Math.sqrt(maxDist * maxDist / Math.PI) * Math.min(cellW, cellH);

      // 控制范围
      ctx.fillStyle = `${WELL_TYPE_COLORS[well.type]}20`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.5, 0, 2 * Math.PI);
      ctx.fill();

      // 井点
      ctx.fillStyle = WELL_TYPE_COLORS[well.type];
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fill();

      // 标签
      if (cellW > 20) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '9px sans-serif';
        ctx.fillText(well.name, cx + 6, cy - 4);
      }
    }
  }, [area]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-lg border border-gw-border" />
      <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px]">
        {Object.entries(WELL_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-gw-muted">{WELL_TYPE_LABELS[type as keyof typeof WELL_TYPE_LABELS]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(239,68,68,0.15)' }} />
          <span className="text-gw-muted">覆盖空白</span>
        </div>
      </div>
    </div>
  );
}
