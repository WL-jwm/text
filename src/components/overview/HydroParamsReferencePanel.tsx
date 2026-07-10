// HydroParamsReferencePanel — 水文地质参数速查面板
// Phase 6d: 沉睡数据唤醒 — hydroParams 模块 15个导出

import React, { useState } from 'react';
import { TechCard, SortableTechTable } from '../UI';
import {
  aquiferGroups,
  lithologyMu,
  infiltrationCoeff,
  permeability,
  karstParams,
  fractureParams,
  storageCoeff,
  dispersivity,
  stationInfiltration,
  lithInfiltration,
} from '../../data/hydroParams';

type TabKey = 'aquifer' | 'lithology' | 'infiltration' | 'permeability' | 'karst' | 'fracture' | 'storage' | 'dispersivity' | 'station';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'aquifer', label: '含水层组' },
  { key: 'lithology', label: '岩性-给水度' },
  { key: 'infiltration', label: '入渗系数' },
  { key: 'permeability', label: '渗透系数' },
  { key: 'karst', label: '岩溶参数' },
  { key: 'fracture', label: '裂隙参数' },
  { key: 'storage', label: '释水系数' },
  { key: 'dispersivity', label: '弥散度' },
  { key: 'station', label: '水文站实测' },
];

export function HydroParamsReferencePanel() {
  const [activeTab, setActiveTab] = useState<TabKey>('aquifer');

  return (
    <TechCard title="水文地质参数速查" badge="A表+F表" className="hud-corners">
      <p className="text-xs text-gw-muted mb-3">
        数据来源：《河北省地下水》(1999) + 2024年河北省区域地质志 — 环评参数取值参考
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
        {activeTab === 'aquifer' && (
          <SortableTechTable
            headers={['含水层组', '时代', '性质', '埋深(m)', '岩性', 'K(m/d)', 'T(m²/d)', '给水度', '矿化度(g/L)', '说明']}
            rows={aquiferGroups.map(g => [g.group, g.era, g.property, g.depth, g.lithology, g.K, g.T, g.mu, g.salinity, g.note])}
            highlightColumn={5}
          />
        )}
        {activeTab === 'lithology' && (
          <SortableTechTable
            headers={['类别', '岩性', '给水度', 'K(m/d)', '有效孔隙度', '来源']}
            rows={lithologyMu.map(l => [l.category, l.lithology, l.mu, l.K, l.ne, l.source])}
            highlightColumn={2}
          />
        )}
        {activeTab === 'infiltration' && (
          <div className="space-y-4">
            <SortableTechTable
              headers={['岩性', '平原区', '山间盆地', '山区', '最佳埋深(m)', '备注']}
              rows={infiltrationCoeff.map(c => [c.lithology, c.plain, c.basin, c.mountain, c.optDepth, c.note])}
              highlightColumn={1}
            />
            <SortableTechTable
              headers={['岩性', '流域', '面积(km²)', '径流模数', '降水量(mm)', '入渗系数']}
              rows={lithInfiltration.map(l => [l.lithology, l.basin, l.area, l.modulus, l.P, l.alpha])}
              highlightColumn={5}
            />
          </div>
        )}
        {activeTab === 'permeability' && (
          <SortableTechTable
            headers={['岩性', 'Kh(m/d)', 'Kv(m/d)', 'Kh/Kv', '来源']}
            rows={permeability.map(p => [p.lithology, p.Kh, p.Kv, p.ratio, p.source])}
            highlightColumn={1}
          />
        )}
        {activeTab === 'karst' && (
          <SortableTechTable
            headers={['类型', 'K(m/d)', 'T(m²/d)', '给水度', '分布区', '备注']}
            rows={karstParams.map(k => [k.type, k.K, k.T, k.mu, k.area, k.note])}
            highlightColumn={1}
          />
        )}
        {activeTab === 'fracture' && (
          <SortableTechTable
            headers={['类型', '岩性', 'K(m/d)', '泉流量(L/s)', '径流模数(L/s·km²)']}
            rows={fractureParams.map(f => [f.type, f.lithology, f.K, f.springFlow, f.modulus])}
            highlightColumn={2}
          />
        )}
        {activeTab === 'storage' && (
          <SortableTechTable
            headers={['时代', '岩性', '释水系数', '备注']}
            rows={storageCoeff.map(s => [s.era, s.lithology, s.mu_e, s.note])}
            highlightColumn={2}
          />
        )}
        {activeTab === 'dispersivity' && (
          <SortableTechTable
            headers={['介质', '纵向弥散度(m)', '横向弥散度(m)', '备注']}
            rows={dispersivity.map(d => [d.medium, d.aL, d.aT, d.note])}
            highlightColumn={1}
          />
        )}
        {activeTab === 'station' && (
          <SortableTechTable
            headers={['序号', '水文站', '面积(km²)', '岩性', '入渗系数']}
            rows={stationInfiltration.map(s => [String(s.id), s.station, s.area, s.lithology, s.alpha])}
            highlightColumn={4}
          />
        )}
      </div>
    </TechCard>
  );
}
