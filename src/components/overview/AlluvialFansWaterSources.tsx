// AlluvialFansWaterSources — 冲洪积扇水源地概览面板
// Phase 6d: 沉睡数据唤醒 — 唤醒 alluvialFanStructures + mountainFrontRichZones + storageStructureSummary

import React, { useState } from 'react';
import { TechCard, SortableTechTable } from '../UI';
import {
  alluvialFanStructures,
  mountainFrontRichZones,
  storageStructureSummary,
} from '../../data/waterSource';

type TabKey = 'fans' | 'richZones' | 'overview';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '蓄水构造概览' },
  { key: 'fans', label: '冲洪积扇型' },
  { key: 'richZones', label: '山前富水带' },
];

export function AlluvialFansWaterSources() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  return (
    <TechCard title="冲洪积扇与水源地" badge={`${alluvialFanStructures.length}扇+${mountainFrontRichZones.length}带`} className="hud-corners">
      <p className="text-xs text-gw-muted mb-3">
        数据来源：《河北省水文地质工程地质》(1999) 第七章 — 蓄水构造与水源地
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
              activeTab === tab.key
                ? 'bg-gw-cyan/15 text-gw-cyan border-gw-cyan/30'
                : 'bg-gw-surface text-gw-muted border-gw-surface hover:border-gw-cyan/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {activeTab === 'overview' && (
          <SortableTechTable
            headers={['类型', '数量', '面积(km²)', '典型代表']}
            highlightColumn={1}
            rows={storageStructureSummary.map(s => [
              s.type,
              String(s.count),
              s.totalArea,
              s.representative,
            ])}
          />
        )}
        {activeTab === 'fans' && (
          <SortableTechTable
            headers={['名称', '面积(km²)', '边界条件', '岩性', '深度(m)', '含水层', '水源地']}
            highlightColumn={1}
            rows={alluvialFanStructures.map(f => [
              f.name,
              f.area,
              f.boundary,
              f.lithology,
              f.depth,
              f.aquiferRock,
              f.waterSource,
            ])}
          />
        )}
        {activeTab === 'richZones' && (
          <SortableTechTable
            headers={['富水带', '宽度(km)', 'K(m/d)', '给水度', '岩性', '厚度(m)', '单井出水量(m³/h·m)', '坡降(‰)']}
            highlightColumn={2}
            rows={mountainFrontRichZones.map(z => [
              z.zone,
              z.width,
              z.K,
              z.mu,
              z.lithology,
              z.thickness,
              z.yield,
              z.gradient,
            ])}
          />
        )}
      </div>
    </TechCard>
  );
}
