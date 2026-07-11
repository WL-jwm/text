import React from 'react';
import {
  springMarkers, geothermalMarkers,
  salineMarkers, waterSourceMarkers, mineMarkers,
} from '../../data/mapData';
import {
  overdraftPolygons, overdraftLegend,
  gradeColors, gradeLabels,
} from '../../data/mapDataEnhanced';
import { importantWaterSources } from '../../data/waterSource';
import { karstSprings } from '../../data/karstWater';

interface CityGrade {
  city: string;
  grade: number;
  groundResource: number;
}

interface MapStatsCardsProps {
  activeLayers: Set<string>;
  visibleLayers: Set<string>;
  overdraftFilter: Set<string>;
  cityGrades: CityGrade[];
  onToggleMarkerCategory: (category: string) => void;
  onToggleOverdraftType: (type: string) => void;
}

export function MapStatsCards({
  activeLayers, visibleLayers, overdraftFilter, cityGrades,
  onToggleMarkerCategory, onToggleOverdraftType,
}: MapStatsCardsProps) {
  const categoryStats = [
    { label: '泉域', count: springMarkers.length, color: '#10b981', key: 'spring' },
    { label: '地热田', count: geothermalMarkers().length, color: '#ef4444', key: 'geothermal' },
    { label: '咸水区', count: salineMarkers.length, color: '#f59e0b', key: 'saline' },
    { label: '水源地', count: waterSourceMarkers.length, color: '#06b6d4', key: 'waterSource' },
    { label: '矿区', count: mineMarkers.length, color: '#8b5cf6', key: 'mine' },
  ];

  return (
    <>
      {/* 标注统计 */}
      {activeLayers.has('markers') && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {categoryStats.map(s => (
            <div
              key={s.key}
              onClick={() => onToggleMarkerCategory(s.key)}
              className={'px-3 py-2 rounded-lg border cursor-pointer transition-all ' +
                (visibleLayers.has(s.key) ? 'border-opacity-30 bg-opacity-10' : 'border-gw-border/30 bg-gw-surface/30 opacity-50')
              }
              style={visibleLayers.has(s.key) ? {
                borderColor: s.color + '50',
                backgroundColor: s.color + '15',
              } : {}}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gw-muted">{s.label}</span>
                <span className="text-sm font-bold" style={{ color: visibleLayers.has(s.key) ? s.color : '#6b7280' }}>{s.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 资源量统计 */}
      {activeLayers.has('resource') && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {([5, 4, 3, 2, 1] as const).map(grade => {
            const cities = cityGrades.filter(g => g.grade === grade);
            return (
              <div key={grade} className="px-3 py-2 rounded-lg border cursor-default transition-all"
                style={{ borderColor: gradeColors[grade] + '50', backgroundColor: gradeColors[grade] + '15' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gw-muted">{gradeLabels[grade].split('(')[0]}</span>
                  <span className="text-sm font-bold" style={{ color: gradeColors[grade] }}>{cities.length}市</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 超采区统计 */}
      {activeLayers.has('overdraft') && (
        <div className="grid grid-cols-3 gap-2">
          {overdraftLegend.map(item => (
            <div key={item.type}
              onClick={() => onToggleOverdraftType(item.type)}
              className={'px-3 py-2 rounded-lg border cursor-pointer transition-all ' +
                (overdraftFilter.has(item.type) ? 'opacity-100' : 'opacity-40')
              }
              style={{ borderColor: item.color + '50', backgroundColor: item.fill }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gw-muted">{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>
                  {overdraftPolygons.filter(p => p.type === item.type).length}个
                </span>
              </div>
            </div>
          ))}
          <div className="px-3 py-2 rounded-lg border border-gw-border/30 bg-gw-surface/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">总面积</span>
              <span className="text-sm font-bold text-gw-text">69,693 km²</span>
            </div>
          </div>
        </div>
      )}

      {/* 水源地统计 */}
      {activeLayers.has('waterSourcePOI') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#22d3ee50', backgroundColor: '#22d3ee15' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">水源地数量</span>
              <span className="text-sm font-bold text-cyan-300">{importantWaterSources.length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#22d3ee50', backgroundColor: '#22d3ee15' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">已替代</span>
              <span className="text-sm font-bold text-amber-400">{importantWaterSources.filter(w => w.status.includes('替代')).length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#22d3ee50', backgroundColor: '#22d3ee15' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">正常开采</span>
              <span className="text-sm font-bold text-emerald-400">{importantWaterSources.filter(w => w.status.includes('正常')).length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#22d3ee50', backgroundColor: '#22d3ee15' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">总供水规模</span>
              <span className="text-sm font-bold text-cyan-300">{importantWaterSources.reduce((s, w) => s + parseFloat(w.supply), 0).toFixed(0)} 万m³/d</span>
            </div>
          </div>
        </div>
      )}

      {/* 岩溶泉统计 */}
      {activeLayers.has('karstSpringPOI') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#10b98150', backgroundColor: '#10b98115' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">岩溶泉数量</span>
              <span className="text-sm font-bold text-emerald-400">{karstSprings.length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#10b98150', backgroundColor: '#10b98115' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">有流量数据</span>
              <span className="text-sm font-bold text-emerald-400">{karstSprings.filter(k => k.discharge !== '-').length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#10b98150', backgroundColor: '#10b98115' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">总泉域面积</span>
              <span className="text-sm font-bold text-emerald-400">{karstSprings.reduce((s, k) => s + parseFloat(k.area || '0'), 0).toLocaleString()} km²</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#10b98150', backgroundColor: '#10b98115' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">全排型</span>
              <span className="text-sm font-bold text-emerald-400">{karstSprings.filter(k => k.type === '全排型').length}个</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
