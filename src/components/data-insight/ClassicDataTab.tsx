import React from 'react';
import { CrossLinkPanel } from '../CrossLink';
import { springDatabase, aquiferParameters, reservoirEngineeringData, stratigraphyLayers, rockEngineeringGroups, hotSpringData, irrigationData, riverLeakageData, resistivityMineralization } from '../../data/resources';
import { getReservoirSummary, getHydrogeoSummary, springStatsByRegion } from '../../data/hydrogeologyReference';
import { getDataSource } from '../../data/hydrogeologyReference';

interface ClassicDataTabProps {
  highlight?: string;
}

export function ClassicDataTab({}: ClassicDataTabProps) {
  return (
    <>
      <p className="text-xs text-gw-muted mb-4">
        数据来源：《{getDataSource().book}》（{getDataSource().pages}页），{getDataSource().era}基准调查数据。
        {getDataSource().note}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/15">
          <p className="text-[10px] text-gw-muted">泉水数据库</p>
          <p className="text-lg font-mono font-bold text-blue-400">{springDatabase.length}</p>
          <p className="text-[10px] text-gw-muted">处（{springStatsByRegion.length}地区）</p>
        </div>
        <div className="text-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/15">
          <p className="text-[10px] text-gw-muted">水文地质分区</p>
          <p className="text-lg font-mono font-bold text-cyan-400">{getHydrogeoSummary().totalSubZones}</p>
          <p className="text-[10px] text-gw-muted">{getHydrogeoSummary().totalZones}大区</p>
        </div>
        <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/15">
          <p className="text-[10px] text-gw-muted">含水层参数</p>
          <p className="text-lg font-mono font-bold text-emerald-400">{aquiferParameters.length}</p>
          <p className="text-[10px] text-gw-muted">条典型剖面</p>
        </div>
        <div className="text-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/15">
          <p className="text-[10px] text-gw-muted">水库工程</p>
          <p className="text-lg font-mono font-bold text-amber-400">{reservoirEngineeringData.length}</p>
          <p className="text-[10px] text-gw-muted">总库容{getReservoirSummary().totalCapacity.toFixed(1)}亿m³</p>
        </div>
        <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/15">
          <p className="text-[10px] text-gw-muted">地层系统</p>
          <p className="text-lg font-mono font-bold text-red-400">{stratigraphyLayers.length}</p>
          <p className="text-[10px] text-gw-muted">层岩石分组{rockEngineeringGroups.length}类</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
          <p className="text-[10px] text-gw-muted mb-1">泉水地区分布</p>
          <div className="space-y-1">
            {springStatsByRegion.sort((a: { count: number }, b: { count: number }) => b.count - a.count).map(({region, count}) => (
              <div key={region} className="flex items-center justify-between text-xs">
                <span className="text-gw-text">{region}</span>
                <span className="font-mono text-gw-cyan">{String(count)}处</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
          <p className="text-[10px] text-gw-muted mb-1">经典数据资产</p>
          <div className="space-y-1">
            {[
              { label: '热泉点', value: hotSpringData.summary.totalPoints + '处', detail: `≥37°C ${hotSpringData.summary.above37C}处` },
              { label: '灌区工程', value: irrigationData.largeScale.length + '处', detail: '设计流量≥10m³/s' },
              { label: '河流渗漏', value: riverLeakageData.length + '段', detail: '岩溶渗漏段调查' },
              { label: '物探参数', value: resistivityMineralization.length + '级', detail: '电阻率-矿化度对应' },
              { label: '岩石抗压强度', value: reservoirEngineeringData.length + '水库', detail: '坝基工程地质' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-gw-text">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gw-highlight">{item.value}</span>
                  <span className="text-[9px] text-gw-muted">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CrossLinkPanel currentPath="/data-insight" />
    </>
  );
}
