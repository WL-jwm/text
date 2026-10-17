/**
 * 选中标注信息条（拆分自 MapView.tsx）
 */
import { X } from 'lucide-react';
import { CATEGORY_COLORS } from '../mapConstants';

interface SelectedMarkerBarProps {
  marker: { category: string; name: string; type: string; description: string } | null;
  onClose: () => void;
}

export function SelectedMarkerBar({ marker, onClose }: SelectedMarkerBarProps) {
  if (!marker) return null;
  return (
            <div className="absolute bottom-3 left-3 right-3 z-[1000] px-3 py-2 rounded-lg bg-gw-surface/90 border border-gw-border/40 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[marker.category] }} />
                  <div>
                    <span className="text-xs font-medium text-gw-text">{marker.name}</span>
                    <span className="text-[10px] text-gw-muted ml-2">{marker.type} | {marker.description}</span>
                  </div>
                </div>
                <button onClick={onClose} className="text-gw-muted hover:text-gw-text">
                  <X size={12} />
                </button>
              </div>
            </div>
  );
}
