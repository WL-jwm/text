// 地图侧边栏组件
// 提取自 MapView.tsx Phase 6b 拆分

import React from 'react';
import {
  Layers, Eye, EyeOff, Search,
  Droplets, Database, AlertTriangle, MapPin,
} from 'lucide-react';
import { TechCard } from '../components/UI';
import { cityBulletin2024 } from '../data/resources';
import { mapLayerConfigs, cityCenters, type MapMarker } from '../data/mapData';
import { overdraftLegend, gradeColors } from '../data/mapDataEnhanced';
import { LAYER_ICONS, CATEGORY_COLORS } from './mapConstants';
import type { CountyDataItem } from '../types/county';

export interface MapSidebarProps {
  searchText: string;
  onSearchTextChange: (v: string) => void;
  filteredMarkers: MapMarker[];
  onFlyToMarker: (m: MapMarker) => void;
  activeLayers: Set<string>;
  visibleLayers: Set<string>;
  onToggleMarkerCategory: (cat: string) => void;
  showZones: boolean;
  onToggleZones: () => void;
  showCountyCoverage: boolean;
  onToggleCountyCoverage: () => void;
  showBoundary: boolean;
  onToggleBoundary: () => void;
  showCityBoundary: boolean;
  onToggleCityBoundary: () => void;
  showOverdraft: boolean;
  onToggleOverdraft: () => void;
  overdraftFilter: Set<string>;
  onToggleOverdraftType: (type: string) => void;
  activeCenter: { name: string; lat: number; lng: number; zoom: number };
  onSetActiveCenter: (c: { name: string; lat: number; lng: number; zoom: number }) => void;
  cityDetailPanel: string | null;
  onFlyToCity: (name: string) => void;
  cityGrades: Array<{ city: string; grade: number; groundResource: number }>;
  selectedMarker: MapMarker | null;
}

export function MapSidebar({
  searchText,
  onSearchTextChange,
  filteredMarkers,
  onFlyToMarker,
  activeLayers,
  visibleLayers,
  onToggleMarkerCategory,
  showZones,
  onToggleZones,
  showCountyCoverage,
  onToggleCountyCoverage,
  showBoundary,
  onToggleBoundary,
  showCityBoundary,
  onToggleCityBoundary,
  showOverdraft,
  onToggleOverdraft,
  overdraftFilter,
  onToggleOverdraftType,
  activeCenter,
  onSetActiveCenter,
  cityDetailPanel,
  onFlyToCity,
  cityGrades,
  selectedMarker,
}: MapSidebarProps) {
  return (
    <div className="space-y-3">
      {/* 搜索 */}
      <TechCard title="标注搜索">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gw-muted" />
          <input
            type="text"
            value={searchText}
            onChange={e => onSearchTextChange(e.target.value)}
            placeholder="搜索泉域、地热田、水源地..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-gw-bg border border-gw-border/40 text-gw-text placeholder-gw-muted focus:outline-none focus:border-gw-blue/50"
          />
        </div>
        {searchText.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto space-y-1 scrollbar-none">
            {filteredMarkers.slice(0, 15).map(m => (
              <button key={m.id} onClick={() => onFlyToMarker(m)}
                className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-gw-surface/50 transition-colors flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[m.category] }} />
                <div className="truncate">
                  <span className="text-gw-text">{m.name}</span>
                  <span className="text-gw-muted ml-1">{m.type}</span>
                </div>
              </button>
            ))}
            {filteredMarkers.length === 0 && (
              <div className="text-[10px] text-gw-muted text-center py-2">未找到匹配结果</div>
            )}
          </div>
        )}
      </TechCard>

      {/* ═══════ v4.3.0: 统一图层控制面板 ═══════ */}
      <TechCard title="图层控制">
        <div className="space-y-1.5">
          {/* 标注子图层 */}
          {activeLayers.has('markers') && (
            <>
              {mapLayerConfigs.map(layer => {
                const IconComp = LAYER_ICONS[layer.icon] || Layers;
                const isVisible = visibleLayers.has(layer.categories[0]);
                return (
                  <button key={layer.key} onClick={() => onToggleMarkerCategory(layer.categories[0])}
                    className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                      (isVisible ? 'border-opacity-30 bg-opacity-10' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                    }
                    style={isVisible ? {
                      borderColor: layer.color + '30',
                      backgroundColor: layer.color + '10',
                      color: '#e5e7eb',
                    } : {}}
                  >
                    <span className="flex items-center gap-2">
                      <IconComp size={13} style={isVisible ? { color: layer.color } : {}} />
                      {layer.label}
                    </span>
                    {isVisible ? <Eye size={13} style={{ color: layer.color }} /> : <EyeOff size={13} />}
                  </button>
                );
              })}
              <div className="border-t border-gw-border/30 pt-1.5 mt-1.5 space-y-1.5">
                <button onClick={() => onToggleZones()}
                  className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                    (showZones ? 'border-blue-500/30 bg-blue-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                  }>
                  <span className="flex items-center gap-2">
                    <Layers size={13} style={showZones ? { color: '#3b82f6' } : {}} />
                    系统区划面
                  </span>
                  {showZones ? <Eye size={13} className="text-blue-400" /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => onToggleCountyCoverage()}
                  className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                    (showCountyCoverage ? 'border-emerald-500/30 bg-emerald-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                  }>
                  <span className="flex items-center gap-2">
                    <Database size={13} style={showCountyCoverage ? { color: '#10b981' } : {}} />
                    县级数据覆盖
                  </span>
                  {showCountyCoverage ? <Eye size={13} className="text-emerald-400" /> : <EyeOff size={13} />}
                </button>
              </div>
            </>
          )}

          {/* 资源量子图层 */}
          {activeLayers.has('resource') && (
            <div className={activeLayers.has('markers') ? 'border-t border-gw-border/30 pt-1.5 mt-1.5' : ''}>
              <button onClick={() => onToggleCityBoundary()}
                className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                  (showCityBoundary ? 'border-cyan-500/30 bg-cyan-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                }>
                <span className="flex items-center gap-2">
                  <Droplets size={13} style={showCityBoundary ? { color: '#06b6d4' } : {}} />
                  市界分级着色
                </span>
                {showCityBoundary ? <Eye size={13} className="text-cyan-400" /> : <EyeOff size={13} />}
              </button>
            </div>
          )}

          {/* 超采区子图层 */}
          {activeLayers.has('overdraft') && (
            <div className={(activeLayers.has('markers') || activeLayers.has('resource')) ? 'border-t border-gw-border/30 pt-1.5 mt-1.5' : ''}>
              <button onClick={() => onToggleOverdraft()}
                className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border mb-1.5 ' +
                  (showOverdraft ? 'border-red-500/30 bg-red-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                }>
                <span className="flex items-center gap-2">
                  <AlertTriangle size={13} style={showOverdraft ? { color: '#ef4444' } : {}} />
                  超采区范围
                </span>
                {showOverdraft ? <Eye size={13} className="text-red-400" /> : <EyeOff size={13} />}
              </button>
              {overdraftLegend.map(item => (
                <button key={item.type} onClick={() => onToggleOverdraftType(item.type)}
                  className={'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all border mb-1 ' +
                    (overdraftFilter.has(item.type) ? 'opacity-100' : 'opacity-40 border-gw-border/30')
                  }
                  style={overdraftFilter.has(item.type) ? { borderColor: item.color + '30', backgroundColor: item.fill } : {}}>
                  <span className="flex items-center gap-2 text-gw-text">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  {overdraftFilter.has(item.type) ? <Eye size={13} style={{ color: item.color }} /> : <EyeOff size={13} />}
                </button>
              ))}
            </div>
          )}

          {/* 省界边界 — 始终可用 */}
          <div className={activeLayers.size > 0 ? 'border-t border-gw-border/30 pt-1.5 mt-1.5' : ''}>
            <button onClick={() => onToggleBoundary()}
              className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                (showBoundary ? 'border-blue-500/30 bg-blue-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
              }>
              <span className="flex items-center gap-2">
                <MapPin size={13} style={showBoundary ? { color: '#3b82f6' } : {}} />
                省界边界
              </span>
              {showBoundary ? <Eye size={13} className="text-blue-400" /> : <EyeOff size={13} />}
            </button>
          </div>
        </div>
      </TechCard>

      {/* 城市定位 */}
      <TechCard title="城市定位">
        <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-none">
          {cityCenters.filter(c => c.name !== '全省').map(c => {
            const isSelected = cityDetailPanel === c.name;
            return (
              <button key={c.name} onClick={() => onFlyToCity(c.name)}
                className={'w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center gap-2 ' +
                  (isSelected ? 'bg-gw-blue/20 text-gw-highlight' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50')
                }>
                <MapPin size={12} />
                {c.name}
                {activeLayers.has('resource') && (() => {
                  const g = cityGrades.find(gr => gr.city === c.name);
                  if (!g) return null;
                  return (
                    <span className="ml-auto text-[10px] font-mono" style={{ color: gradeColors[g.grade] }}>
                      {g.groundResource.toFixed(1)}
                    </span>
                  );
                })()}
              </button>
            );
          })}
        </div>
      </TechCard>

      {/* 快速定位 */}
      <TechCard title="快速定位">
        <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-none">
          {cityCenters.map(c => (
            <button key={c.name} onClick={() => onSetActiveCenter(c)}
              className={'w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center gap-2 ' +
                (activeCenter.name === c.name ? 'bg-gw-blue/20 text-gw-highlight' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50')
              }>
              <MapPin size={12} />
              {c.name}
            </button>
          ))}
        </div>
      </TechCard>

      {/* 选中城市水文概况摘要 */}
      {activeCenter && (() => {
        const bulletin = cityBulletin2024.find(function(b) { return b.city === activeCenter.name + '市' || b.city === activeCenter.name; });
        if (!bulletin) return null;
        const bulletinCounties = bulletin.counties as CountyDataItem[] | undefined;
        const hasCounties = !!bulletinCounties && bulletinCounties.length > 0;
        const dataCounties = hasCounties ? bulletinCounties!.filter(function(c: CountyDataItem) { return c.precip != null; }).length : 0;
        return (
          <TechCard title={bulletin.city + ' 水文概况'} badge="2024年公报">
            <div className="space-y-2 text-[10px]">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-1.5 rounded bg-blue-500/5 border border-blue-500/10">
                  <p className="text-gw-muted">降水量</p>
                  <p className="font-mono text-blue-400 text-xs font-bold">{bulletin.precipTotal ?? '-'}</p>
                </div>
                <div className="p-1.5 rounded bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-gw-muted">水资源总量</p>
                  <p className="font-mono text-emerald-400 text-xs font-bold">{bulletin.totalWater?.toFixed(2) ?? '-'} <span className="text-gw-muted font-normal">亿m³</span></p>
                </div>
                <div className="p-1.5 rounded bg-cyan-500/5 border border-cyan-500/10">
                  <p className="text-gw-muted">总供水量</p>
                  <p className="font-mono text-cyan-400 text-xs font-bold">{bulletin.totalSupply?.toFixed(2) ?? '-'}</p>
                </div>
                <div className="p-1.5 rounded bg-purple-500/5 border border-purple-500/10">
                  <p className="text-gw-muted">地下水占比</p>
                  <p className="font-mono text-purple-400 text-xs font-bold">{bulletin.totalSupply > 0 ? (bulletin.groundSupply / bulletin.totalSupply * 100).toFixed(1) + '%' : '-'}</p>
                </div>
              </div>
              {hasCounties && (
                <div className="pt-1 border-t border-gw-border/20">
                  <div className="flex items-center justify-between">
                    <span className="text-gw-muted">县级数据覆盖</span>
                    <span className="text-gw-text">{dataCounties}/{bulletinCounties!.length}</span>
                  </div>
                  <div className="w-full h-1.5 mt-1 rounded-full bg-gw-bg/80 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: (bulletinCounties!.length > 0 ? Math.round(dataCounties / bulletinCounties!.length * 100) : 0) + '%',
                      backgroundColor: dataCounties === bulletinCounties!.length ? '#10b981' : dataCounties > 0 ? '#f59e0b' : '#6b7280'
                    }} />
                  </div>
                </div>
              )}
            </div>
          </TechCard>
        );
      })()}

      {/* 选中标注详情 */}
      {selectedMarker && (
        <TechCard title="标注详情" badge={selectedMarker.type}>
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-medium text-gw-text">{selectedMarker.name}</h3>
              <p className="text-[10px] text-gw-muted mt-0.5">{selectedMarker.description}</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gw-muted">
              <span className="px-1.5 py-0.5 rounded" style={{
                backgroundColor: (CATEGORY_COLORS[selectedMarker.category] || '#3b82f6') + '20',
                color: CATEGORY_COLORS[selectedMarker.category] || '#3b82f6',
              }}>
                {selectedMarker.category}
              </span>
              <span>{selectedMarker.lat.toFixed(2)}°N, {selectedMarker.lng.toFixed(2)}°E</span>
            </div>
            {selectedMarker.detail && Object.keys(selectedMarker.detail).length > 0 && (
              <div className="space-y-1 pt-1 border-t border-gw-border/30">
                {Object.entries(selectedMarker.detail).map(function(entry) {
                  return (
                    <div key={entry[0]} className="flex justify-between text-[10px]">
                      <span className="text-gw-muted">{entry[0]}</span>
                      <span className="text-gw-text">{entry[1]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TechCard>
      )}
    </div>
  );
}
