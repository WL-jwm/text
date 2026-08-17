import { WELL_REALTIME_STATUS_CONFIG } from '../../services/wellRealtime';
import type { WellRealtimeStatus } from '../../services/wellRealtime';

export function RealtimeStatusBadge({ status }: { status: WellRealtimeStatus }) {
  const config = WELL_REALTIME_STATUS_CONFIG[status];
  return (
    <span
      className="text-[8px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      {config.label}
    </span>
  );
}

// ── 井表格 ──

