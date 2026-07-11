import React from 'react';
import { X } from 'lucide-react';
import { gradeColors, type CityResourceGrade } from '../../data/mapDataEnhanced';
import { getCityAggregatedInfo } from '../../data/mapDataEnhanced';

interface MapCityDetailPanelProps {
  cityName: string | null;
  cityGrades: CityResourceGrade[];
  onClose: () => void;
}

export function MapCityDetailPanel({ cityName, cityGrades, onClose }: MapCityDetailPanelProps) {
  if (!cityName) return null;
  const info = getCityAggregatedInfo(cityName);
  const grade = cityGrades.find(g => g.city === cityName);
  if (!info || !grade) return null;
  const shallowColor = info.shallowType === '一般超采区' ? '#f59e0b' : '#6b7280';
  const deepColor = info.deepType === '严重超采区' ? '#ef4444' : info.deepType === '一般超采区' ? '#3b82f6' : '#6b7280';

  return (
    <div className="absolute bottom-3 left-3 z-[1000] w-[300px] rounded-lg bg-gw-surface/95 border border-gw-border/40 backdrop-blur-sm shadow-lg">
      {/* 头部 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gw-border/30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold" style={{ background: gradeColors[grade.grade] }}>{grade.grade}</div>
          <span className="text-sm font-bold text-gw-text">{cityName}市</span>
          <span className="text-[10px] text-gw-muted">地下水概览</span>
        </div>
        <button onClick={onClose} className="text-gw-muted hover:text-gw-text">
          <X size={12} />
        </button>
      </div>
      {/* 核心指标 */}
      <div className="px-3 py-2 grid grid-cols-2 gap-1.5">
        <div className="p-1.5 rounded bg-cyan-500/5 border border-cyan-500/10">
          <p className="text-[9px] text-gw-muted">地下水资源量</p>
          <p className="text-xs font-mono font-bold text-cyan-400">{info.groundResource.toFixed(2)} <span className="text-gw-muted font-normal text-[9px]">亿m³</span></p>
        </div>
        <div className="p-1.5 rounded bg-blue-500/5 border border-blue-500/10">
          <p className="text-[9px] text-gw-muted">地下水供水</p>
          <p className="text-xs font-mono font-bold text-blue-400">{info.gwSupply.toFixed(2)} <span className="text-gw-muted font-normal text-[9px]">亿m³</span></p>
        </div>
        <div className="p-1.5 rounded bg-purple-500/5 border border-purple-500/10">
          <p className="text-[9px] text-gw-muted">供水占比</p>
          <p className="text-xs font-mono font-bold text-purple-400">{info.gwRatio.toFixed(1)}%</p>
        </div>
        <div className="p-1.5 rounded bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-[9px] text-gw-muted">地表水资源量</p>
          <p className="text-xs font-mono font-bold text-emerald-400">{info.surfaceResource.toFixed(2)} <span className="text-gw-muted font-normal text-[9px]">亿m³</span></p>
        </div>
        <div className="p-1.5 rounded bg-amber-500/5 border border-amber-500/10">
          <p className="text-[9px] text-gw-muted">降水量</p>
          <p className="text-xs font-mono font-bold text-amber-400">{info.precipitation > 0 ? info.precipitation.toFixed(0) + ' mm' : '-'}</p>
        </div>
        <div className="p-1.5 rounded bg-slate-500/5 border border-slate-500/10">
          <p className="text-[9px] text-gw-muted">总供水量</p>
          <p className="text-xs font-mono font-bold text-slate-300">{info.totalSupply.toFixed(2)} <span className="text-gw-muted font-normal text-[9px]">亿m³</span></p>
        </div>
      </div>
      {/* 超采区 */}
      <div className="px-3 pb-2">
        <p className="text-[9px] text-gw-muted mb-1">超采区类型</p>
        <div className="flex gap-1.5">
          <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: shallowColor + '20', color: shallowColor }}>浅层: {info.shallowType}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: deepColor + '20', color: deepColor }}>深层: {info.deepType}</span>
        </div>
        {info.hasCone && (
          <p className="text-[9px] text-gw-muted mt-1">漏斗: {info.coneInfo}</p>
        )}
      </div>
    </div>
  );
}
