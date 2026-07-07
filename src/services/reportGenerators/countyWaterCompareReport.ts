/**
 * 县级水资源数据对比报告生成器
 * 包含：各市县级数据汇总、跨市对比分析、用水结构分析、地下水依赖度排名
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('county-water-compare', (data) => {
  const sections: ReportConfig['sections'] = [];
  const citySummary = (data.citySummary || []) as Array<Record<string, unknown>>;
  const crossCityAll = (data.crossCityAll || []) as Array<Record<string, unknown>>;
  const cityDistribution = (data.cityDistribution || []) as Array<Record<string, unknown>>;

  // ── 第1章：报告概述 ──
  const totalCities = citySummary.length;
  const totalCounties = citySummary.reduce((s, c) => s + (Number(c.countyCount) || 0), 0);
  const totalUseAll = citySummary.reduce((s, c) => s + (Number(c.totalUse) || 0), 0);
  const totalGwAll = citySummary.reduce((s, c) => s + (Number(c.totalGw) || 0), 0);
  const avgGwRatio = totalUseAll > 0 ? ((totalGwAll / totalUseAll) * 100).toFixed(1) : '-';

  sections.push({
    title: '报告概述',
    level: 1,
    content: buildParagraphs([
      `本报告基于《河北省水资源公报（2024年）》县级用水数据，对全省 ${totalCities} 个地级市共 ${totalCounties} 个县级行政区的用水情况进行对比分析。`,
      `全省县级用水总量 ${totalUseAll.toFixed(4)} 亿m³，其中地下水 ${totalGwAll.toFixed(4)} 亿m³，地下水依赖度 ${avgGwRatio}%。`,
      '报告涵盖各市县级用水量、用水结构、地下水占比、农业用水比例等关键指标，为区域水资源管理和地下水超采治理提供基础数据支撑。',
    ]),
  });

  // ── 第2章：各市县级用水汇总 ──
  sections.push({
    title: '各市县级用水汇总',
    level: 1,
    content: [
      ...buildParagraphs([
        `以下统计了 ${totalCities} 个地级市的县级用水数据汇总，包括县级行政区数量、用水总量、地下水用量及占比等指标。`,
      ]),
      ...buildTable(
        [
          { header: '地级市' },
          { header: '县区数' },
          { header: '用水总量(亿m³)' },
          { header: '地下水(亿m³)' },
          { header: '地下水占比(%)' },
          { header: '农业用水(亿m³)' },
          { header: '工业用水(亿m³)' },
          { header: '生活用水(亿m³)' },
          { header: '生态用水(亿m³)' },
        ],
        citySummary.map(c => [
          String(c.city),
          String(c.countyCount),
          String(c.totalUse),
          String(c.totalGw),
          String(c.gwRatio),
          String(c.totalAgri),
          String(c.totalIndustry),
          String(c.totalDomestic),
          String(c.totalEco),
        ]),
        { caption: '表1 各市县级用水数据汇总（2024年）' }
      ),
    ],
  });

  // ── 第3章：地下水依赖度排名（按市均地下水占比降序） ──
  const gwRank = [...citySummary]
    .filter(c => Number(c.totalUse) > 0)
    .sort((a, b) => Number(b.gwRatio) - Number(a.gwRatio));

  sections.push({
    title: '地下水依赖度排名',
    level: 1,
    content: [
      ...buildParagraphs([
        `按各市县级地下水用水占总用水量比例进行排名，反映区域对地下水的依赖程度。地下水依赖度最高的区域往往是地下水超采治理的重点区域。`,
      ]),
      ...buildTable(
        [
          { header: '排名' },
          { header: '地级市' },
          { header: '县级用水量(亿m³)' },
          { header: '地下水用量(亿m³)' },
          { header: '地下水占比(%)' },
          { header: '农业占比(%)' },
        ],
        gwRank.map((c, i) => [
          String(i + 1),
          String(c.city),
          String(c.totalUse),
          String(c.totalGw),
          String(c.gwRatio),
          String(c.agriRatio),
        ]),
        { caption: '表2 各市地下水依赖度排名' }
      ),
    ],
  });

  // ── 第4章：跨市县级数据明细 ──
  if (crossCityAll.length > 0) {
    // 按地下水占比降序取前20
    const topGw = [...crossCityAll]
      .filter((c: Record<string, unknown>) => Number(c.gwRatio) > 0)
      .sort((a, b) => Number(b.gwRatio) - Number(a.gwRatio))
      .slice(0, 20);

    sections.push({
      title: '地下水依赖度最高的县级行政区（Top 20）',
      level: 1,
      content: [
        ...buildParagraphs([
          `在全省 ${crossCityAll.length} 个有数据的县级行政区中，以下 20 个县地下水依赖度最高，是需要重点关注的超采治理区域。`,
        ]),
        ...buildTable(
          [
            { header: '排名' },
            { header: '地级市' },
            { header: '县(区)' },
            { header: '总用水(亿m³)' },
            { header: '地下水(亿m³)' },
            { header: '地下水占比(%)' },
            { header: '农业占比(%)' },
          ],
          topGw.map((c, i) => [
            String(i + 1),
            String(c.city),
            String(c.county),
            String(c.totalUse),
            String(c.gwUse),
            String(c.gwRatio),
            String(c.agriRatio),
          ]),
          { caption: '表3 地下水依赖度最高的20个县级行政区' }
        ),
      ],
    });
  }

  // ── 第5章：各市用水结构分布 ──
  if (cityDistribution.length > 0) {
    sections.push({
      title: '各市农业用水与地下水占比分布特征',
      level: 1,
      content: [
        ...buildParagraphs([
          '以下统计了各市下辖县级行政区的农业用水比例和地下水占比的最小值、最大值和平均值，反映各市内部的用水结构差异。',
          '农业用水比例高且地下水占比高的区域，既是农业节水潜力区，也是地下水超采治理重点区。',
        ]),
        ...buildTable(
          [
            { header: '地级市' },
            { header: '县区数' },
            { header: '农业占比min(%)' },
            { header: '农业占比max(%)' },
            { header: '农业占比avg(%)' },
            { header: '地下水占比min(%)' },
            { header: '地下水占比max(%)' },
            { header: '地下水占比avg(%)' },
            { header: '平均降水(mm)' },
          ],
          cityDistribution.map(d => [
            String(d.city),
            String(d.countyCount),
            String(d.minAgri),
            String(d.maxAgri),
            String(d.avgAgri),
            String(d.minGw),
            String(d.maxGw),
            String(d.avgGw),
            String(d.avgPrecip),
          ]),
          { caption: '表4 各市用水结构分布统计' }
        ),
      ],
    });
  }

  // ── 第6章：结论与建议 ──
  const highestGwCity = gwRank[0];
  const lowestGwCity = gwRank[gwRank.length - 1];
  const highestAgriCity = [...citySummary]
    .filter(c => Number(c.totalUse) > 0)
    .sort((a, b) => Number(b.agriRatio) - Number(a.agriRatio))[0];

  sections.push({
    title: '结论与建议',
    level: 1,
    content: buildParagraphs([
      `1. 地下水依赖度差异显著：${String(highestGwCity?.city)}地下水依赖度最高（${String(highestGwCity?.gwRatio)}%），${String(lowestGwCity?.city)}最低（${String(lowestGwCity?.gwRatio)}%），区域差异明显。`,
      `2. 农业用水是地下水开采主因：农业占比最高的${String(highestAgriCity?.city)}农业用水比例达${String(highestAgriCity?.agriRatio)}%，农业节水是压减地下水开采的关键。`,
      '3. 地下水超采治理重点：地下水依赖度高于70%的县级行政区应作为超采治理的重点对象，优先推进农业节水灌溉、水源置换和种植结构调整。',
      '4. 县域间差异大：同一地级市内不同县级行政区的用水结构和地下水占比差异显著，需因地制宜制定治理方案。',
      '5. 数据完善建议：部分县级行政区数据尚不完整，建议持续完善监测网络，补充降水、供用水等基础数据。',
    ]),
  });

  return {
    title: '河北省县级水资源数据对比报告',
    subtitle: '基于水资源公报（2024年）县级数据',
    sections,
    showDate: true,
  };
});
