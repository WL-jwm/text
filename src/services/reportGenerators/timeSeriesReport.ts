/**
 * 时间序列分析报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('time-series', (data) => {
  const sections: ReportConfig['sections'] = [];
  const exploitation = data.exploitationYearly as Record<string, Record<number, number>> | undefined;
  const qualityTrend = data.qualityTrend as Array<Record<string, unknown>> | undefined;
  const qualityLevel = data.qualityLevelTrend as Array<Record<string, number>> | undefined;
  const supply = data.supply2024 as Array<Record<string, unknown>> | undefined;
  const waterLevel = data.waterLevel2024 as Array<Record<string, number | string | null>> | undefined;
  const selectedCities = data.selectedCities as string[] | undefined;

  if (!exploitation) return { title: '时间序列分析报告', sections: [] };

  const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  // 1. 开采量趋势章节
  const cities = selectedCities && selectedCities.length > 0
    ? selectedCities
    : Object.keys(exploitation);

  sections.push({
    title: '地下水开采量变化趋势',
    level: 1,
    content: [
      ...buildParagraphs([
        `本报告分析了河北省${cities.length}个城市2014-2024年地下水开采量变化趋势、水质改善情况、水位动态及供水结构。`,
        `分析覆盖 ${cities.join('、')} 等城市，时间跨度11年。`,
      ]),
      ...buildTable(
        [{ header: '城市' }, ...years.map(y => ({ header: String(y) })), { header: '减量' }, { header: '减幅(%)' }],
        cities.map(city => {
          const d = exploitation[city] ?? {};
          const d14 = d[2014] ?? 0;
          const d24 = d[2024] ?? 0;
          return [
            city,
            ...years.map(y => (d[y] ?? 0).toFixed(1)),
            (d14 - d24).toFixed(1),
            d14 > 0 ? ((d14 - d24) / d14 * 100).toFixed(1) : '—',
          ];
        }),
        { caption: `表1 各市地下水开采量时序数据（亿m³，${years[0]}-${years[years.length - 1]}年）` }
      ),
    ],
  });

  // 2. 水质改善章节
  if (qualityTrend && qualityTrend.length > 0) {
    const qYears = [2020, 2021, 2022, 2023, 2024];
    sections.push({
      title: '地下水质量达标率变化趋势',
      level: 1,
      content: [
        ...buildParagraphs([
          `2020-2024年各市地下水质量III类以上达标率呈持续上升趋势，反映了超采治理和污染防治的成效。`,
        ]),
        ...buildTable(
          [{ header: '城市' }, ...qYears.map(y => ({ header: String(y) })), { header: '5年提升(pp)' }],
          qualityTrend.filter(q => cities.includes(q.city as string)).map(q => [
            q.city as string,
            ...qYears.map(y => String((q[`y${y}`] as number) ?? '—')),
            String((q.improvement as number)?.toFixed(1) ?? '—'),
          ]),
          { caption: '表2 各市地下水质量达标率（%，2020-2024年）' }
        ),
      ],
    });
  }

  // 3. 全省水质等级变化
  if (qualityLevel && qualityLevel.length > 0) {
    sections.push({
      title: '全省地下水质量等级结构变化',
      level: 1,
      content: [
        ...buildParagraphs([
          `全省地下水质量等级结构持续优化：I-II类水比例从${qualityLevel[0].I2}%提升至${qualityLevel[4].I2}%，V类水比例从${qualityLevel[0].V}%下降至${qualityLevel[4].V}%，III类及以上达标率从${qualityLevel[0].IIIplus}%提升至${qualityLevel[4].IIIplus}%。`,
        ]),
        ...buildTable(
          [{ header: '年份' }, { header: 'I-II类(%)' }, { header: 'III类(%)' }, { header: 'IV类(%)' }, { header: 'V类(%)' }, { header: 'III类+(%)' }, { header: '监测井(眼)' }],
          qualityLevel.map((d: Record<string, number>) => [
            String(d.year),
            String(d.I2),
            String(d.III),
            String(d.IV),
            String(d.V),
            String(d.IIIplus),
            String(d.wells),
          ]),
          { caption: '表3 全省地下水质量等级变化（2020-2024年）' }
        ),
      ],
    });
  }

  // 4. 水位埋深章节
  if (waterLevel && waterLevel.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = waterLevel.filter(w => cities.includes(w.city as string) && w.shallowDepth !== null) as Array<Record<string, any>>;
    if (filtered.length > 0) {
      sections.push({
        title: '各市地下水水位埋深',
        level: 1,
        content: [
          ...buildParagraphs([
            `2024年各市浅层地下水埋深统计：平均${(filtered.reduce((s, c) => s + c.shallowDepth, 0) / filtered.length).toFixed(1)}m，最深${Math.max(...filtered.map(c => c.shallowDepth)).toFixed(1)}m，最浅${Math.min(...filtered.map(c => c.shallowDepth)).toFixed(1)}m。`,
          ]),
          ...buildTable(
            [{ header: '城市' }, { header: '浅层埋深(m)' }, { header: '年变化(m)' }, { header: '深层埋深(m)' }, { header: '深层变化(m)' }],
            filtered.map(c => [
              c.city,
              c.shallowDepth.toFixed(1),
              (c.shallowChange ?? 0).toFixed(2),
              c.deepDepth !== null && c.deepDepth !== undefined ? c.deepDepth.toFixed(1) : '—',
              c.deepChange !== null && c.deepChange !== undefined ? (c.deepChange as number).toFixed(2) : '—',
            ]),
            { caption: '表4 各市地下水水位埋深（2024年）' }
          ),
        ],
      });
    }
  }

  // 5. 供水结构章节
  if (supply && supply.length > 0) {
    const filtered = supply.filter(s => cities.includes(s.city as string));
    if (filtered.length > 0) {
      const totalGw = filtered.reduce((s, c) => s + (c.gwSupply as number), 0);
      const totalAll = filtered.reduce((s, c) => s + (c.totalSupply as number), 0);
      sections.push({
        title: '各市供水结构分析',
        level: 1,
        content: [
          ...buildParagraphs([
            `${filtered.length}市合计：总供水${totalAll.toFixed(1)}亿m³，其中地下水${totalGw.toFixed(1)}亿m³，占比${(totalGw / totalAll * 100).toFixed(1)}%。`,
          ]),
          ...buildTable(
            [{ header: '城市' }, { header: '总供水(亿m³)' }, { header: '地下水(亿m³)' }, { header: '地下水占比(%)' }],
            filtered.map(c => [
              c.city as string,
              (c.totalSupply as number).toFixed(2),
              (c.gwSupply as number).toFixed(2),
              (c.gwRatio as number).toFixed(1),
            ]),
            { caption: '表5 各市供水结构（2024年）' }
          ),
        ],
      });
    }
  }

  // 6. 水位埋深历史趋势
  const waterLevelYearly = data.waterLevelYearly as Record<string, Record<number, number>> | undefined;
  if (waterLevelYearly) {
    sections.push({
      title: '各市浅层地下水埋深历史变化(2014-2024)',
      level: 1,
      content: [
        ...buildParagraphs([
          `2014-2024年各市浅层地下水年平均埋深持续下降（水位回升），山前平原回升幅度最大，2018年起全省普遍止跌回升。`,
        ]),
        ...buildTable(
          [{ header: '城市' }, ...years.map(y => ({ header: String(y) })), { header: '累计回升(m)' }],
          cities.map(city => {
            const d = waterLevelYearly[city] ?? {};
            const d14 = d[2014] ?? 0;
            const d24 = d[2024] ?? 0;
            return [
              city,
              ...years.map(y => (d[y] ?? 0).toFixed(1)),
              (d14 - d24).toFixed(1),
            ];
          }),
          { caption: `表6 各市浅层地下水埋深历史变化（m，${years[0]}-${years[years.length - 1]}年）` }
        ),
      ],
    });
  }

  // 7. 沉降速率趋势
  const subsidenceYearly = data.subsidenceYearly as Record<string, Record<number, number>> | undefined;
  if (subsidenceYearly) {
    sections.push({
      title: '各市地面沉降速率变化(2014-2024)',
      level: 1,
      content: [
        ...buildParagraphs([
          `2014-2024年各市沉降速率持续下降，沧州、衡水等重度沉降区改善最为显著，沉降速率降幅均超过75%。`,
        ]),
        ...buildTable(
          [{ header: '城市' }, ...years.map(y => ({ header: String(y) })), { header: '降幅(mm/a)' }, { header: '降幅(%)' }],
          cities.map(city => {
            const d = subsidenceYearly[city] ?? {};
            const d14 = d[2014] ?? 0;
            const d24 = d[2024] ?? 0;
            return [
              city,
              ...years.map(y => (d[y] ?? 0).toFixed(1)),
              (d14 - d24).toFixed(1),
              d14 > 0 ? ((d14 - d24) / d14 * 100).toFixed(1) : '—',
            ];
          }),
          { caption: `表7 各市地面沉降速率（mm/a，${years[0]}-${years[years.length - 1]}年）` }
        ),
      ],
    });
  }

  // 8. 水质全周期趋势
  const qualityYearly = data.qualityYearly as Record<string, Record<number, number>> | undefined;
  if (qualityYearly) {
    sections.push({
      title: '各市地下水质量达标率全周期变化(2014-2024)',
      level: 1,
      content: [
        ...buildParagraphs([
          `2014-2024年各市地下水III类及以上达标率持续提升，山区城市(张家口/承德)天然水质优良，平原城市改善幅度最大。`,
        ]),
        ...buildTable(
          [{ header: '城市' }, ...years.map(y => ({ header: String(y) })), { header: '提升(pp)' }],
          cities.map(city => {
            const d = qualityYearly[city] ?? {};
            const d14 = d[2014] ?? 0;
            const d24 = d[2024] ?? 0;
            return [
              city,
              ...years.map(y => (d[y] ?? 0).toFixed(1)),
              (d24 - d14).toFixed(1),
            ];
          }),
          { caption: `表8 各市地下水质量达标率（%，III类及以上，${years[0]}-${years[years.length - 1]}年）` }
        ),
      ],
    });
  }

  // 9. 治理成效综合评估
  const qualityYearly2 = data.qualityYearly as Record<string, Record<number, number>> | undefined;
  const subsidenceYearly2 = data.subsidenceYearly as Record<string, Record<number, number>> | undefined;
  const waterLevelYearly2 = data.waterLevelYearly as Record<string, Record<number, number>> | undefined;
  if (exploitation && waterLevelYearly2 && qualityYearly2 && subsidenceYearly2) {
    const governanceRows = cities.map(city => {
      const e14 = exploitation[city]?.[2014] ?? 0, e24 = exploitation[city]?.[2024] ?? 0;
      const expPct = e14 > 0 ? (e14 - e24) / e14 * 100 : 0;
      const wl14 = waterLevelYearly2[city]?.[2014] ?? 0, wl24 = waterLevelYearly2[city]?.[2024] ?? 0;
      const wlPct = wl14 > 0 ? (wl14 - wl24) / wl14 * 100 : 0;
      const q14 = qualityYearly2[city]?.[2014] ?? 0, q24 = qualityYearly2[city]?.[2024] ?? 0;
      const qPct = q14 > 0 ? (q24 - q14) / q14 * 100 : 0;
      const s14 = subsidenceYearly2[city]?.[2014] ?? 0, s24 = subsidenceYearly2[city]?.[2024] ?? 0;
      const sPct = s14 > 0 ? (s14 - s24) / s14 * 100 : 0;
      const score = Math.round(expPct * 0.25 + wlPct * 0.30 + qPct * 0.25 + sPct * 0.20);
      return { city, expPct: expPct.toFixed(1), wlPct: wlPct.toFixed(1), qPct: qPct.toFixed(1), sPct: sPct.toFixed(1), score };
    }).sort((a, b) => b.score - a.score);
    sections.push({
      title: '超采治理综合成效评估',
      level: 1,
      content: [
        ...buildParagraphs([
          `基于开采减采率(25%权重)、水位回升率(30%)、水质改善率(25%)、沉降减缓率(20%)四维加权评分，${cities.length}市综合治理评分排名如下。`,
        ]),
        ...buildTable(
          [{ header: '城市' }, { header: '开采降幅(%)' }, { header: '水位回升(%)' }, { header: '水质改善(%)' }, { header: '沉降减缓(%)' }, { header: '综合评分' }],
          governanceRows.map(r => [r.city, r.expPct, r.wlPct, r.qPct, r.sPct, String(r.score)]),
          { caption: '表9 各市超采治理综合成效评分（2014-2024年，满分100）' }
        ),
      ],
    });
  }

  // 10. 区域对比
  if (exploitation && waterLevelYearly2 && qualityYearly2 && subsidenceYearly2) {
    const groups = [
      { label: '山区', cities: ['张家口', '承德', '秦皇岛'] },
      { label: '山前平原', cities: ['石家庄', '保定', '唐山'] },
      { label: '中部平原', cities: ['邯郸', '邢台', '衡水'] },
      { label: '滨海平原', cities: ['沧州', '廊坊'] },
    ];
    const regionRows = groups.map(g => {
      const gc = g.cities.filter(c => cities.includes(c));
      const avg = (fn: (c: string) => number) => gc.length > 0 ? gc.reduce((s, c) => s + fn(c), 0) / gc.length : 0;
      const sum = (fn: (c: string) => number) => gc.reduce((s, c) => s + fn(c), 0);
      return {
        label: g.label, cityCount: gc.length,
        exp24: sum(c => exploitation[c]?.[2024] ?? 0).toFixed(1),
        exp14: sum(c => exploitation[c]?.[2014] ?? 0).toFixed(1),
        wl24: avg(c => waterLevelYearly2[c]?.[2024] ?? 0).toFixed(1),
        wl14: avg(c => waterLevelYearly2[c]?.[2014] ?? 0).toFixed(1),
        q24: avg(c => qualityYearly2[c]?.[2024] ?? 0).toFixed(1),
        q14: avg(c => qualityYearly2[c]?.[2014] ?? 0).toFixed(1),
        sub24: avg(c => subsidenceYearly2[c]?.[2024] ?? 0).toFixed(1),
        sub14: avg(c => subsidenceYearly2[c]?.[2014] ?? 0).toFixed(1),
      };
    });
    sections.push({
      title: '四大水文地质区对比分析',
      level: 1,
      content: [
        ...buildParagraphs([
          `河北省按水文地质条件划分为山区、山前平原、中部平原、滨海平原四个区域，各区域在治理前后的变化特征差异显著。`,
        ]),
        ...buildTable(
          [{ header: '区域' }, { header: '城市数' }, { header: '开采14/24(亿m3)' }, { header: '水位14/24(m)' }, { header: '水质14/24(%)' }, { header: '沉降14/24(mm/a)' }],
          regionRows.map(r => [r.label, String(r.cityCount), `${r.exp14}/${r.exp24}`, `${r.wl14}/${r.wl24}`, `${r.q14}/${r.q24}`, `${r.sub14}/${r.sub24}`]),
          { caption: '表10 四大水文地质区核心指标对比（2014 vs 2024）' }
        ),
      ],
    });
  }

  // 结论
  sections.push({
    title: '综合结论',
    level: 1,
    content: buildParagraphs([
      `河北省地下水超采治理成效显著，${cities.length}市2014-2024年开采量总体呈持续下降趋势，地下水位普遍回升，水质持续改善，地面沉降大幅减缓。四大水文地质区中，山前平原开采降幅最大、水位回升最显著；滨海平原沉降减缓最明显。建议继续巩固治理成果，推进水资源精细化管理，加强地下水监测网络建设，确保地下水资源的可持续利用。`,
    ]),
  });

  return { title: '河北省地下水时间序列分析报告', sections, showDate: true };
});
