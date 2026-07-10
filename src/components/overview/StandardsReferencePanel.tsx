// StandardsReferencePanel — 评价标准参考面板
// Phase 6d: 沉睡数据唤醒 — standards 模块 10个导出

import React, { useState } from 'react';
import { TechCard, SortableTechTable } from '../UI';
import {
  groundwaterQualityStandards,
  surfaceWaterQualityStandards,
  drinkingWaterStandards,
  soilQualityStandards,
  wastewaterStandards,
  overExploitationStandards,
  getCurrentStandard,
  getStandardsStats,
} from '../../data/standards';
import type { StandardRegistry } from '../../data/standards';

const ALL_REGISTRIES: StandardRegistry[] = [
  groundwaterQualityStandards,
  surfaceWaterQualityStandards,
  drinkingWaterStandards,
  soilQualityStandards,
  wastewaterStandards,
  overExploitationStandards,
];

export function StandardsReferencePanel() {
  const [selected, setSelected] = useState<string>('地下水质量');
  const stats = getStandardsStats();

  const registry = ALL_REGISTRIES.find(r => r.category === selected) ?? ALL_REGISTRIES[0];
  const current = getCurrentStandard(registry.category);

  return (
    <TechCard title="评价标准参考" badge={`${stats.total}标准 ${stats.versions}版本`} className="hud-corners">
      <p className="text-xs text-gw-muted mb-3">
        集中管理平台引用的国标/行标/地方标准，支持版本切换
      </p>

      {/* 标准类别选择 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_REGISTRIES.map(r => (
          <button
            key={r.category}
            onClick={() => setSelected(r.category)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
              selected === r.category
                ? 'bg-gw-cyan/15 text-gw-cyan border-gw-cyan/30'
                : 'bg-gw-surface text-gw-muted border-gw-surface hover:border-gw-cyan/20'
            }`}
          >
            {r.code} {r.category}
          </button>
        ))}
      </div>

      {/* 标准详情 */}
      <div className="space-y-3">
        {current && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gw-surface/50 rounded-lg p-2">
              <span className="text-gw-muted">标准编号</span>
              <div className="font-mono text-gw-highlight">{current.name}</div>
            </div>
            <div className="bg-gw-surface/50 rounded-lg p-2">
              <span className="text-gw-muted">全称</span>
              <div className="text-gw-fg">{current.fullName}</div>
            </div>
            <div className="bg-gw-surface/50 rounded-lg p-2">
              <span className="text-gw-muted">发布日期</span>
              <div className="text-gw-fg">{current.publishDate}</div>
            </div>
            <div className="bg-gw-surface/50 rounded-lg p-2">
              <span className="text-gw-muted">实施日期</span>
              <div className="text-gw-fg">{current.effectiveDate}</div>
            </div>
            <div className="bg-gw-surface/50 rounded-lg p-2">
              <span className="text-gw-muted">发布机构</span>
              <div className="text-gw-fg">{current.issuingAuthority}</div>
            </div>
            <div className="bg-gw-surface/50 rounded-lg p-2">
              <span className="text-gw-muted">状态</span>
              <div className={`font-semibold ${current.status === '现行' ? 'text-green-400' : 'text-yellow-400'}`}>
                {current.status}
              </div>
            </div>
          </div>
        )}

        {current?.description && (
          <div className="text-xs text-gw-muted bg-gw-surface/30 rounded-lg p-2">
            {current.description}
          </div>
        )}

        {current?.changelog && (
          <div className="text-xs text-yellow-400/70 bg-yellow-400/5 rounded-lg p-2 border border-yellow-400/10">
            变更说明: {current.changelog}
          </div>
        )}

        {/* 分类表格（地下水/地表水有 classes 数据） */}
        {current?.data?.classes && (
          <SortableTechTable
            headers={['类别', '名称', '颜色', '说明']}
            rows={current.data.classes.map((c: { class: string; name: string; color: string; description?: string }) => [
              c.class,
              c.name,
              c.color,
              c.description ?? '',
            ])}
            highlightColumn={0}
          />
        )}

        {/* 版本历史 */}
        <SortableTechTable
          headers={['版本ID', '标准名', '状态', '发布日期']}
          rows={registry.versions.map(v => [v.id, v.name, v.status, v.publishDate])}
          highlightColumn={2}
        />
      </div>
    </TechCard>
  );
}
