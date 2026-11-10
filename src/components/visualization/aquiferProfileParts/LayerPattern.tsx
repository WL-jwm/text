/**
 * 拆分自 AquiferProfile3D.tsx — 含水层填充 pattern 生成组件
 */

import type { AquiferLayer } from './aquiferProfileData';

/** 生成含水层填充pattern */
export function LayerPattern({ layer, id }: { layer: AquiferLayer; id: string }) {
  if (layer.pattern === 'dots') {
    return (
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill={layer.color} fillOpacity={0.12} />
        <circle cx="4" cy="4" r="1" fill={layer.color} fillOpacity={0.5} />
      </pattern>
    );
  }
  if (layer.pattern === 'lines') {
    return (
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill={layer.color} fillOpacity={0.12} />
        <line x1="0" y1="0" x2="0" y2="8" stroke={layer.color} strokeWidth="1" strokeOpacity={0.4} />
      </pattern>
    );
  }
  if (layer.pattern === 'cross') {
    return (
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill={layer.color} fillOpacity={0.1} />
        <line x1="0" y1="0" x2="10" y2="10" stroke={layer.color} strokeWidth="0.5" strokeOpacity={0.3} />
        <line x1="10" y1="0" x2="0" y2="10" stroke={layer.color} strokeWidth="0.5" strokeOpacity={0.3} />
      </pattern>
    );
  }
  return (
    <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill={layer.color} fillOpacity={0.1} />
      <line x1="0" y1="5" x2="10" y2="5" stroke={layer.color} strokeWidth="0.5" strokeOpacity={0.3} />
      <line x1="5" y1="0" x2="5" y2="10" stroke={layer.color} strokeWidth="0.5" strokeOpacity={0.3} />
    </pattern>
  );
}
