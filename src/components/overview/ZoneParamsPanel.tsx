// ZoneParamsPanel — 地下水系统分区参数面板
// Phase 6d: 沉睡数据唤醒 — zoneParams 模块 2个导出

import React, { useState } from 'react';
import { TechCard, SortableTechTable } from '../UI';
import { systemZones, subZones, plainZones } from '../../data/zoneParams';

type TabKey = 'system' | 'sub' | 'plain';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'system', label: '10系统区' },
  { key: 'sub', label: '子区/小区参数' },
  { key: 'plain', label: '平原四分区' },
];

export function ZoneParamsPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>('system');

  return (
    <TechCard title="地下水系统分区参数" badge={`${systemZones.length}+${subZones.length}区`} className="hud-corners">
      <p className="text-xs text-gw-muted mb-3">
        数据来源：《河北省地下水》(1999) 第五章 — 地下水系统区划及分区特征 (B表)
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
        {activeTab === 'system' && (
          <SortableTechTable
            headers={['编码', '系统区', '面积(km²)', '占比(%)', '径流模数(L/s·km²)']}
            rows={systemZones.map(z => [z.code, z.name, String(z.area ?? '-'), String(z.areaPercent ?? '-'), z.runoffModulus ?? '-'])}
            highlightColumn={2}
          />
        )}
        {activeTab === 'sub' && (
          <SortableTechTable
            headers={['编码', '名称', '级别', '父区', '入渗系数', 'T(m²/d)', '涌水量(m³/h·m)', '含水层厚(m)', '水位(m)', '径流模数']}
            rows={subZones.map(z => [z.code, z.name, z.level, z.parent, z.alpha ?? '-', z.T ?? '-', z.q ?? '-', z.aquiferThickness ?? '-', z.waterLevel ?? '-', z.runoffModulus ?? '-'])}
            highlightColumn={4}
          />
        )}
        {activeTab === 'plain' && (
          <SortableTechTable
            headers={['分区', '位置', '含水层组', 'T(m²/d)', '涌水量', '给水度', '入渗系数', '矿化度(g/L)', '埋深(m)', '特征']}
            rows={plainZones.map(z => [z.name, z.location, z.aquifer, z.T, z.q, z.mu, z.alpha, z.salinity, z.depth, z.feature])}
            highlightColumn={3}
          />
        )}
      </div>
    </TechCard>
  );
}
