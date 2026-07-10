import React from 'react';
import { cityExploitationYearly } from '../../data/exploitation';
import { cityWaterLevelYearly, citySubsidenceYearly, cityQualityYearly } from '../../data/historicalTimeSeries';
import { StatCard } from '../../components/UI';

// ── Phase 3.2: 治理成效摘要卡片 ──
export function GovernanceSummaryCards() {
  const gwCities = ['石家庄', '保定', '邯郸', '邢台', '沧州', '衡水', '廊坊', '唐山', '秦皇岛', '张家口', '承德'];
  const totalExp14 = gwCities.reduce((s, c) => s + (cityExploitationYearly[c]?.[2014] ?? 0), 0);
  const totalExp24 = gwCities.reduce((s, c) => s + (cityExploitationYearly[c]?.[2024] ?? 0), 0);
  const expReduction = totalExp14 > 0 ? ((totalExp14 - totalExp24) / totalExp14 * 100).toFixed(1) : '0';
  const avgWl14 = gwCities.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[2014] ?? 0), 0) / gwCities.length;
  const avgWl24 = gwCities.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[2024] ?? 0), 0) / gwCities.length;
  const wlRecovery = (avgWl14 - avgWl24).toFixed(1);
  const avgQ14 = gwCities.reduce((s, c) => s + (cityQualityYearly[c]?.[2014] ?? 0), 0) / gwCities.length;
  const avgQ24 = gwCities.reduce((s, c) => s + (cityQualityYearly[c]?.[2024] ?? 0), 0) / gwCities.length;
  const qImprove = (avgQ24 - avgQ14).toFixed(1);
  const avgSub14 = gwCities.reduce((s, c) => s + (citySubsidenceYearly[c]?.[2014] ?? 0), 0) / gwCities.length;
  const avgSub24 = gwCities.reduce((s, c) => s + (citySubsidenceYearly[c]?.[2024] ?? 0), 0) / gwCities.length;
  const subSlowdown = avgSub14 > 0 ? ((avgSub14 - avgSub24) / avgSub14 * 100).toFixed(1) : '0';

  const bestRecoveryCity = gwCities.reduce((a, c) => {
    const r = (cityWaterLevelYearly[c]?.[2014] ?? 0) - (cityWaterLevelYearly[c]?.[2024] ?? 0);
    return r > a.val ? { city: c, val: r } : a;
  }, { city: '', val: 0 });

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard title="十年开采降幅" value={expReduction} unit="%" accent="blue" subtitle={`${totalExp14}→${totalExp24}亿m3`} />
      <StatCard title="十年水位回升" value={wlRecovery} unit="m" accent="cyan" subtitle={`埋深${avgWl14.toFixed(1)}→${avgWl24.toFixed(1)}m`} />
      <StatCard title="十年水质改善" value={qImprove} unit="pp" accent="emerald" subtitle={`达标率${avgQ14.toFixed(1)}%→${avgQ24.toFixed(1)}%`} />
      <StatCard title="十年沉降减缓" value={subSlowdown} unit="%" accent="amber" subtitle={`速率${avgSub14.toFixed(1)}→${avgSub24.toFixed(1)}mm/a`} />
      <StatCard title="水位回升最大" value={bestRecoveryCity.city} unit={`${bestRecoveryCity.val.toFixed(1)}m`} accent="green" subtitle="2014→2024" />
    </div>
  );
}
