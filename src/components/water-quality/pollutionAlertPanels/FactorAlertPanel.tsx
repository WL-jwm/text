/**
 * B-09 地下水污染预警模块 UI
 *
 * 5大面板：
 *  1. 预警概览 - 5级统计卡片 + 预警摘要
 *  2. 单因子预警 - 输入监测值/标准值 → 预警等级 + Pi柱状图
 *  3. 水样预警 - 多因子组合 → 综合预警 + 因子热力图
 *  4. 区域风险 - 6大分区风险评分 + 风险雷达
 *  5. 趋势预测 - 2014-2030水质改善趋势 + 预测区间
 * 面板组件：FactorAlertPanel（拆分自 PollutionAlertTab.tsx）
 */

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TechCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { FilterableTechTable } from '../../FilterableTechTable';
import { ALERT_LEVELS, DEFAULT_THRESHOLDS, FACTOR_STANDARD_III, calcFactorAlert, type AlertThresholds } from '../../../utils/pollutionAlertEngine';

export function FactorAlertPanel() {
  const [factorName, setFactorName] = useState('氟化物');
  const [valueStr, setValueStr] = useState('1.5');
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);

  const result = useMemo(() => {
    const factorInfo = FACTOR_STANDARD_III[factorName];
    const val = parseFloat(valueStr);
    if (!factorInfo || isNaN(val)) return null;
    return calcFactorAlert(factorName, val, factorInfo.standard, factorInfo.unit, factorInfo.type, thresholds);
  }, [factorName, valueStr, thresholds]);

  const thresholdTable = useMemo(() => [
    { level: '安全', range: `Pi < ${thresholds.caution}`, color: '#10b981' },
    { level: '关注', range: `${thresholds.caution} ≤ Pi < ${thresholds.warning}`, color: '#3b82f6' },
    { level: '预警', range: `${thresholds.warning} ≤ Pi < ${thresholds.alert}`, color: '#f59e0b' },
    { level: '警告', range: `${thresholds.alert} ≤ Pi < ${thresholds.severe}`, color: '#f97316' },
    { level: '严重', range: `Pi ≥ ${thresholds.severe}`, color: '#ef4444' },
  ], [thresholds]);

  const piBarData = useMemo(() => {
    if (!result || result.Pi === null) return [];
    return [
      { name: '监测值', Pi: result.Pi, color: ALERT_LEVELS[result.level].color },
      { name: 'III类标准', Pi: 1.0, color: '#64748b' },
    ];
  }, [result]);

  return (
    <TechCard title="单因子预警计算" badge="输入监测值">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入区 */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gw-muted">监测因子</label>
            <select value={factorName} onChange={e => setFactorName(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm">
              {Object.entries(FACTOR_STANDARD_III).map(([name, info]) => (
                <option key={name} value={name}>{name}（{info.unit}，限值{info.standard}）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted">监测值</label>
            <input type="number" step="any" value={valueStr} onChange={e => setValueStr(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" placeholder="输入监测值" />
          </div>
          {result && (
            <div className={`p-3 rounded-lg border ${ALERT_LEVELS[result.level].bgColor}`} style={{ borderColor: ALERT_LEVELS[result.level].color + '40' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: ALERT_LEVELS[result.level].color }} />
                <span className="font-semibold text-gw-text">预警等级：{result.level}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gw-muted">Pi = {result.Pi?.toFixed(3) ?? '-'}</div>
                <div className="text-gw-muted">超标倍数 = {result.exceedanceRatio !== null ? result.exceedanceRatio.toFixed(2) : '-'}</div>
                <div className="text-gw-muted">标准值 = {result.standardIII ?? '-'} {result.unit}</div>
                <div className="text-gw-muted">{ALERT_LEVELS[result.level].description}</div>
              </div>
            </div>
          )}
          {/* 阈值设置 */}
          <details className="text-xs">
            <summary className="text-gw-muted cursor-pointer hover:text-gw-text">阈值设置</summary>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(['caution', 'warning', 'alert', 'severe'] as const).map(key => (
                <div key={key}>
                  <label className="text-gw-muted">{key === 'caution' ? '关注' : key === 'warning' ? '预警' : key === 'alert' ? '警告' : '严重'}</label>
                  <input type="number" step="any" value={thresholds[key]}
                    onChange={e => setThresholds(t => ({ ...t, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full mt-0.5 px-2 py-1 rounded bg-gw-surface border border-gw-border text-gw-text text-xs" />
                </div>
              ))}
            </div>
          </details>
        </div>
        {/* 图表区 */}
        <div className="space-y-3">
          {FACTOR_STANDARD_III[factorName] && (
            <div className="p-2 rounded-lg bg-gw-surface text-xs text-gw-muted">
              <p className="text-gw-text font-medium">{FACTOR_STANDARD_III[factorName].description}</p>
              <p className="mt-1">因子类型：{FACTOR_STANDARD_III[factorName].type}</p>
            </div>
          )}
          {piBarData.length > 0 && (
            <LazyChartCard title="Pi 对比" height={180}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={piBarData}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="Pi" radius={[4, 4, 0, 0]}>
                    {piBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          )}
          {/* 阈值表 */}
          <FilterableTechTable
            headers={['预警等级', 'Pi范围', '色标']}
            rows={thresholdTable.map(t => [t.level, t.range, t.color])}
            filterPlaceholder="搜索等级..."
          />
        </div>
      </div>
    </TechCard>
  );
}
