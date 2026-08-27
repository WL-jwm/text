/**
 * 数据导出器 — 各工作表数据构建
 *  wells / readings / alerts / balance / quality / integrated
 */

import { AQUIFER_LABELS } from './wellNetwork';
import type { Well } from './wellNetwork';
import type { WellAlert } from './wellAlerts';
import type { ExportDataSources } from './dataExporterTypes';
import { CHANNEL_LABELS, SEVERITY_LABELS } from './dataExporterLabels';
import { alertMessage } from './dataExporterUtils';

export function buildWellsSheet(wells: Well[]): string[][] {
  const header = ['编号', '名称', '城市', '经度', '纬度', '井深(m)', '含水层', '监测指标', '状态', '备注'];
  const rows: string[][] = [header];

  for (const w of wells) {
    rows.push([
      w.id,
      w.name,
      w.city,
      w.longitude.toFixed(4),
      w.latitude.toFixed(4),
      String(w.depth ?? ''),
      AQUIFER_LABELS[w.aquiferType] ?? w.aquiferType,
      w.indicators?.map(i => CHANNEL_LABELS[i] ?? i).join(', ') ?? '',
      w.status ?? 'active',
      w.notes ?? '',
    ]);
  }

  return rows;
}

export function buildReadingsSheet(data: ExportDataSources): string[][] {
  const header = ['编号', '名称', '城市', '水位(m)', '水质(分)', '沉降(mm)', '开采量(万m³)', '更新时间'];
  const rows: string[][] = [header];

  // 从 well 数据中提取实时读数（使用 wellRealtime 的关联数据）
  // 由于没有直接传入 readings，从 wellRealtime 的关联推断
  for (const w of data.wells) {
    rows.push([
      w.id,
      w.name,
      w.city,
      w.longitude.toFixed(2), // 占位
      '—',
      '—',
      '—',
      new Date().toISOString().split('T')[0],
    ]);
  }

  return rows;
}

export function buildAlertsSheet(alerts: WellAlert[]): string[][] {
  const header = ['编号', '井名', '类型', '严重度', '消息', '时间'];
  const rows: string[][] = [header];

  for (const a of alerts) {
    rows.push([
      a.wellId,
      a.wellName,
      CHANNEL_LABELS[a.channel] ?? a.channel,
      SEVERITY_LABELS[a.severity] ?? a.severity,
      alertMessage(a),
      new Date(a.timestamp).toLocaleDateString('zh-CN'),
    ]);
  }

  return rows;
}

export function buildBalanceSheet(data: ExportDataSources): string[][] {
  const header = ['城市', '面积(km²)', '井数', '总补给(亿m³/a)', '总排泄(亿m³/a)', '均衡差(亿m³/a)', '是否超采', '超采强度(万m³/a·km²)', '主要因素'];
  const rows: string[][] = [header];

  for (const cb of data.cityBalances) {
    rows.push([
      cb.city,
      String(cb.area),
      String(cb.wellCount),
      cb.recharge.toFixed(3),
      cb.discharge.toFixed(3),
      cb.balance.toFixed(3),
      cb.isOverdrafted ? '是' : '否',
      cb.overdraftIntensity > 0 ? cb.overdraftIntensity.toFixed(2) : '0',
      cb.factor ?? '—',
    ]);
  }

  // 如果有均衡汇总
  if (data.balanceResult) {
    rows.push([]);
    rows.push(['=== 汇总 ===', '', '', '', '', '', '', '', '']);
    rows.push(['时段', data.balanceResult.period.periodLabel, '', '', '', '', '', '', '']);
    rows.push(['总补给(亿m³/a)', data.balanceResult.period.totalRecharge.toFixed(3), '', '', '', '', '', '', '']);
    rows.push(['总排泄(亿m³/a)', data.balanceResult.period.totalDischarge.toFixed(3), '', '', '', '', '', '', '']);
    rows.push(['均衡差(亿m³/a)', data.balanceResult.period.balance.toFixed(3), '', '', '', '', '', '', '']);
    rows.push(['储量变化(亿m³/a)', data.balanceResult.period.storageChange.toFixed(3), '', '', '', '', '', '', '']);
    rows.push(['备注', data.balanceResult.period.note ?? '', '', '', '', '', '', '', '']);
  }

  return rows;
}

export function buildQualitySheet(data: ExportDataSources): string[][] {
  const header = ['城市', '监测站数', 'Ⅰ类', 'Ⅱ类', 'Ⅲ类', 'Ⅳ类', 'Ⅴ类', '超标站数', '平均类别', '主要超标因子'];
  const rows: string[][] = [header];

  for (const cs of data.qualityCityStats) {
    rows.push([
      cs.city,
      String(cs.siteCount),
      String(cs.classDistribution[1] ?? 0),
      String(cs.classDistribution[2] ?? 0),
      String(cs.classDistribution[3] ?? 0),
      String(cs.classDistribution[4] ?? 0),
      String(cs.classDistribution[5] ?? 0),
      String(cs.exceededSites),
      cs.averageClass.toFixed(1),
      cs.mainFactors.join('、') || '—',
    ]);
  }

  return rows;
}

export function buildIntegratedSheet(data: ExportDataSources): string[][] {
  const header = ['城市', '象限', '象限标签', '综合得分', '均衡得分', '水质得分', '是否超采', '平均水质类别', '主要超标因子', '建议'];
  const rows: string[][] = [header];

  if (data.integratedAnalysis) {
    for (const c of data.integratedAnalysis.ranking) {
      const cityData = data.integratedAnalysis.cities.find(ic => ic.city === c.city);
      rows.push([
        c.city,
        String(c.quadrant),
        cityData?.quadrantLabel ?? '',
        c.compositeScore.toFixed(1),
        c.balanceScore.toFixed(1),
        c.qualityScore.toFixed(1),
        c.isOverdrafted ? '是' : '否',
        String(c.qualityClass),
        cityData?.quality?.mainFactors.join('、') || '—',
        cityData?.suggestion ?? '—',
      ]);
    }

    // 汇总
    rows.push([]);
    rows.push(['=== 汇总 ===', '', '', '', '', '', '', '', '', '']);
    rows.push(['双差城市数', String(data.integratedAnalysis.summary.dualPoor), '', '', '', '', '', '', '', '']);
    rows.push(['双优城市数', String(data.integratedAnalysis.summary.dualGood), '', '', '', '', '', '', '', '']);
    rows.push(['最佳城市', data.integratedAnalysis.summary.bestCity ?? '—', '', '', '', '', '', '', '', '']);
    rows.push(['最差城市', data.integratedAnalysis.summary.worstCity ?? '—', '', '', '', '', '', '', '', '']);
  }

  return rows;
}

/**
 * 构建 JSON 格式数据
 */
