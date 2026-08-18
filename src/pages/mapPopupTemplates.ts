/**
 * 空间地图 - 弹窗 HTML 模板（纯函数）
 * 将 MapView 中所有 bindPopup / bindTooltip 的 HTML 字符串生成逻辑抽取为独立纯函数，
 * 便于单元测试与复用。
 */
import type { MapMarker, MapZone } from '../data/mapData';
import type { CityBounds, OverdraftPolygon, CityResourceGrade } from '../data/mapDataEnhanced';
import { gradeLabels } from '../data/mapDataEnhanced';
import { CATEGORY_COLORS } from './mapConstants';

/** 重要水源地元素结构（与 importantWaterSources 项兼容） */
export interface WaterSourceItem {
  name: string;
  type: string;
  supply: string;
  unit: string;
  status: string;
  aquifer: string;
  protection: string;
}

/** 岩溶大泉元素结构（与 karstSprings 项兼容） */
export interface KarstSpringItem {
  name: string;
  location: string;
  discharge: string;
  unit: string;
  type: string;
  area: string;
  rechargeArea: string;
  lithology: string;
  tds: string;
  features: string;
}

/** 县级数据覆盖弹窗参数（渲染前已计算） */
export interface CityCoveragePopupArgs {
  city: string;
  color: string;
  label: string;
  countyCount: number;
  hasCounties: boolean;
  hasData: boolean;
  dataCount: number;
  precipitation?: number;
}

/** 标注弹窗内容 */
export function buildMarkerPopup(m: MapMarker): string {
  const color = CATEGORY_COLORS[m.category] || '#3b82f6';
  let detailRows = '';
  if (m.detail) {
    detailRows = Object.entries(m.detail)
      .map(function (entry) {
        return '<tr><td style="color:#9ca3af;padding:2px 8px 2px 0;white-space:nowrap;">' +
          entry[0] + '</td><td style="color:#e5e7eb;">' + entry[1] + '</td></tr>';
      })
      .join('');
  }
  return '<div style="background:#1f2937;color:#e5e7eb;font-family:system-ui;padding:8px;border-radius:8px;min-width:180px;">' +
    '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
    '<div style="width:8px;height:8px;border-radius:50%;background:' + color + ';"></div>' +
    '<span style="font-weight:600;font-size:13px;">' + m.name + '</span></div>' +
    '<div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">' + m.type + ' | ' + m.description + '</div>' +
    (detailRows ? '<table style="margin-top:6px;font-size:11px;border-collapse:collapse;">' + detailRows + '</table>' : '') +
    '</div>';
}

/** 区划面 tooltip */
export function buildZoneTooltip(zone: MapZone): string {
  return '<div style="font-size:12px;"><b>' + zone.code + ' ' + zone.name + '</b><br/>' + zone.info + '</div>';
}

/** 超采区 tooltip */
export function buildOverdraftTooltip(p: OverdraftPolygon): string {
  return '<div style="font-size:12px;"><b>' + p.label + '</b><br/>' + p.info + '</div>';
}

/** 资源量分级 tooltip */
export function buildResourceTooltip(cb: CityBounds, grade: CityResourceGrade | undefined): string {
  const groundResource = grade ? grade.groundResource.toFixed(2) + '亿m³' : '-';
  const gradeLabel = grade ? gradeLabels[grade.grade] : '-';
  return '<div style="font-size:12px;"><b>' + cb.city + '</b><br/>地下水资源量: ' +
    groundResource + '<br/>等级: ' + gradeLabel + '</div>';
}

/** 重要水源地 POI 弹窗 */
export function buildWaterSourcePopup(ws: WaterSourceItem): string {
  const statusColor = ws.status.includes('替代') ? '#f59e0b' : '#10b981';
  return '<div style="background:linear-gradient(135deg,#1e293b,#0f172a);color:#e5e7eb;font-family:system-ui;padding:10px;border-radius:8px;min-width:220px;border:1px solid rgba(34,211,238,0.2);">' +
    '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
    '<div style="width:8px;height:8px;border-radius:50%;background:#22d3ee;"></div>' +
    '<span style="font-weight:600;font-size:13px;color:#22d3ee;">' + ws.name + '</span></div>' +
    '<div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">' + ws.type + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
    '<div style="padding:4px 6px;background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.15);border-radius:4px;">' +
    '<div style="font-size:9px;color:#9ca3af;">供水量</div>' +
    '<div style="font-size:12px;font-weight:700;color:#22d3ee;">' + ws.supply + ' ' + ws.unit + '</div></div>' +
    '<div style="padding:4px 6px;background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.15);border-radius:4px;">' +
    '<div style="font-size:9px;color:#9ca3af;">含水层</div>' +
    '<div style="font-size:10px;color:#e5e7eb;word-break:break-all;">' + ws.aquifer + '</div></div></div>' +
    '<div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:4px;margin-top:4px;">' +
    '<div style="font-size:10px;color:#9ca3af;">状态: <span style="color:' + statusColor + ';">' + ws.status + '</span></div>' +
    '<div style="font-size:10px;color:#9ca3af;">保护区: ' + ws.protection + '</div></div></div>';
}

/** 岩溶大泉 POI 弹窗 */
export function buildKarstPopup(ks: KarstSpringItem): string {
  return '<div style="background:linear-gradient(135deg,#1e293b,#0f172a);color:#e5e7eb;font-family:system-ui;padding:10px;border-radius:8px;min-width:240px;border:1px solid rgba(16,185,129,0.2);">' +
    '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
    '<span style="font-size:14px;">&#9733;</span>' +
    '<span style="font-weight:600;font-size:13px;color:#10b981;">' + ks.name + '</span></div>' +
    '<div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">' + ks.location + ' · ' + ks.type + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
    '<div style="padding:4px 6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:4px;">' +
    '<div style="font-size:9px;color:#9ca3af;">流量</div>' +
    '<div style="font-size:12px;font-weight:700;color:#10b981;">' + ks.discharge + ' ' + ks.unit + '</div></div>' +
    '<div style="padding:4px 6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:4px;">' +
    '<div style="font-size:9px;color:#9ca3af;">泉域面积</div>' +
    '<div style="font-size:12px;font-weight:700;color:#10b981;">' + ks.area + ' km²</div></div>' +
    '<div style="padding:4px 6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:4px;">' +
    '<div style="font-size:9px;color:#9ca3af;">补给面积</div>' +
    '<div style="font-size:11px;color:#e5e7eb;">' + ks.rechargeArea + ' km²</div></div>' +
    '<div style="padding:4px 6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:4px;">' +
    '<div style="font-size:9px;color:#9ca3af;">TDS</div>' +
    '<div style="font-size:11px;color:#e5e7eb;">' + ks.tds + ' g/L</div></div></div>' +
    '<div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:4px;margin-top:4px;">' +
    '<div style="font-size:10px;color:#9ca3af;">岩性: ' + ks.lithology + '</div>' +
    '<div style="font-size:10px;color:#9ca3af;">特征: ' + ks.features + '</div></div></div>';
}

/** 县级数据覆盖弹窗 */
export function buildCityCoveragePopup(args: CityCoveragePopupArgs): string {
  return '<div style="background:#1f2937;color:#e5e7eb;font-family:system-ui;padding:10px;border-radius:8px;min-width:200px;">' +
    '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
    '<div style="width:10px;height:10px;border-radius:50%;background:' + args.color + ';"></div>' +
    '<span style="font-weight:600;font-size:13px;">' + args.city + '</span></div>' +
    '<div style="font-size:11px;color:#9ca3af;">' +
    '<div>状态: <span style="color:' + args.color + ';">' + args.label + '</span></div>' +
    (args.hasCounties ? '<div>县区总数: ' + args.countyCount + '</div>' : '') +
    (args.hasData ? '<div>有降水数据: ' + args.dataCount + '县</div>' : '') +
    (args.precipitation != null ? '<div>全市降水: ' + args.precipitation + ' mm</div>' : '') +
    '</div></div>';
}
