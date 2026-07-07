/**
 * 数据洞察报告生成器
 * 涵盖：数据资产概览、各市地下水依赖度排名、县级用水分析、用水结构对比
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('data-insight', (data) => {
  const sections: ReportConfig['sections'] = [];
  const stats = (data.stats || {}) as Record<string, unknown>;
  const gwDepRank = (data.gwDepRank || []) as Array<Record<string, unknown>>;
  const cityGwAvg = (data.cityGwAvg || []) as Array<Record<string, unknown>>;
  const topByUse = (data.topByUse || []) as Array<Record<string, unknown>>;
  const agriRank = (data.agriRank || []) as Array<Record<string, unknown>>;
  const precipUseCorr = (data.precipUseCorr || []) as Array<Record<string, unknown>>;

  // ── 第1章：数据资产概览 ──
  sections.push({
    title: '数据资产概览',
    level: 1,
    content: buildParagraphs([
      `本报告基于河北省地下水基础资料数据库的多维交叉分析，涵盖 ${String(stats.total ?? '-')} 个县级行政区、${String(stats.cities ?? '-')} 个地级市的用水数据。`,
      `全省县级用水总量 ${String(stats.totalUse ?? '-')} 亿m³，其中地下水 ${String(stats.totalGwUse ?? '-')} 亿m³，平均地下水依赖度 ${String(stats.avgGwRatio ?? '-')}%。`,
      '报告从地下水依赖度、用水结构、农业效率、降水-用水相关性等多维度进行交叉分析，揭示区域水资源利用特征和差异。',
    ]),
  });

  // ── 第2章：各市地下水依赖度 ──
  if (cityGwAvg.length > 0) {
    const sorted = [...cityGwAvg].sort((a, b) => Number(b['平均地下水占比']) - Number(a['平均地下水占比']));

    sections.push({
      title: '各市平均地下水依赖度排名',
      level: 1,
      content: [
        ...buildParagraphs([
          '按各市下辖县级行政区的地下水用量占总用水量比例的算术平均值进行排名。平均值越高，表明该市整体对地下水的依赖程度越大。',
        ]),
        ...buildTable(
          [{ header: '排名' }, { header: '地级市' }, { header: '平均地下水占比(%)' }],
          sorted.map((c, i) => [
            String(i + 1),
            String(c.name),
            String(c['平均地下水占比']),
          ]),
          { caption: '表1 各市平均地下水依赖度排名' }
        ),
      ],
    });
  }

  // ── 第3章：地下水依赖度最高的县（Top 20） ──
  if (gwDepRank.length > 0) {
    const top20 = gwDepRank.slice(0, 20);

    sections.push({
      title: '地下水依赖度最高的县级行政区（Top 20）',
      level: 1,
      content: [
        ...buildParagraphs([
          `在 ${gwDepRank.length} 个有用水数据的县级行政区中，以下 20 个县地下水占比最高，是地下水超采治理的重点关注区域。`,
        ]),
        ...buildTable(
          [
            { header: '排名' },
            { header: '县(区)' },
            { header: '所属市' },
            { header: '总用水(亿m³)' },
            { header: '地下水(亿m³)' },
            { header: '地下水占比(%)' },
            { header: '农业占比(%)' },
          ],
          top20.map((c, i) => [
            String(i + 1),
            String(c.name),
            String(c.city),
            String((c.totalUse as number)?.toFixed(4)),
            String((c.gwUse as number)?.toFixed(4)),
            String(c.gwRatio),
            String(c.agriRatio),
          ]),
          { caption: '表2 地下水依赖度最高的20个县级行政区' }
        ),
      ],
    });
  }

  // ── 第4章：用水量最大的县（Top 15） ──
  if (topByUse.length > 0) {
    sections.push({
      title: '用水量最大的县级行政区（Top 15）',
      level: 1,
      content: [
        ...buildParagraphs([
          '按总用水量排序的前15个县级行政区，多为农业大县或工业集中区。',
        ]),
        ...buildTable(
          [
            { header: '排名' },
            { header: '县(区)' },
            { header: '所属市' },
            { header: '总用水(亿m³)' },
            { header: '地下水占比(%)' },
            { header: '农业占比(%)' },
          ],
          topByUse.map((c, i) => [
            String(i + 1),
            String(c.name),
            String(c.city),
            String((c.totalUse as number)?.toFixed(4)),
            String(c.gwRatio),
            String(c.agriRatio),
          ]),
          { caption: '表3 用水量最大的15个县级行政区' }
        ),
      ],
    });
  }

  // ── 第5章：农业用水占比最高的县（Top 15） ──
  if (agriRank.length > 0) {
    const topAgri = agriRank.slice(0, 15);

    sections.push({
      title: '农业用水占比最高的县级行政区（Top 15）',
      level: 1,
      content: [
        ...buildParagraphs([
          '农业用水占比高的区域是农业节水和地下水压采的重点区域。以下县级行政区农业用水占比超过70%，需重点推进高效节水灌溉。',
        ]),
        ...buildTable(
          [
            { header: '排名' },
            { header: '县(区)' },
            { header: '所属市' },
            { header: '农业占比(%)' },
            { header: '地下水占比(%)' },
            { header: '降水(mm)' },
          ],
          topAgri.map((c, i) => [
            String(i + 1),
            String(c.name),
            String(c.city),
            String(c.agriRatio),
            String(c.gwRatio),
            String(c.precip ?? '-'),
          ]),
          { caption: '表4 农业用水占比最高的15个县级行政区' }
        ),
      ],
    });
  }

  // ── 第6章：降水-地下水依赖度相关性 ──
  if (precipUseCorr.length > 0) {
    const highPrecipLowGw = [...precipUseCorr]
      .sort((a, b) => Number(a.降水) - Number(b.降水))
      .slice(0, 10);
    const lowPrecipHighGw = [...precipUseCorr]
      .sort((a, b) => Number(a.降水) - Number(b.降水))
      .slice(-10).reverse();

    sections.push({
      title: '降水与地下水依赖度关系分析',
      level: 1,
      content: [
        ...buildParagraphs([
          '降水量低的区域往往对地下水依赖度更高。以下列出降水量最低和最高的各10个县级行政区及其地下水依赖度。',
        ]),
        ...buildTable(
          [{ header: '县(区)' }, { header: '降水(mm)' }, { header: '地下水占比(%)' }],
          [
            ...highPrecipLowGw.map(c => [String(c.name), String(c.降水), String(c['地下水占比'])]),
            // 分隔行
            ['── 降水量最高的10县 ──', '──', '──'],
            ...lowPrecipHighGw.map(c => [String(c.name), String(c.降水), String(c['地下水占比'])]),
          ],
          { caption: '表5 降水-地下水依赖度对比（低降水 vs 高降水）' }
        ),
      ],
    });
  }

  // ── 第7章：结论 ──
  sections.push({
    title: '结论与建议',
    level: 1,
    content: buildParagraphs([
      '1. 地下水依赖度区域差异显著：山前平原城市（如沧州、衡水、邢台部分县市）地下水依赖度普遍超过70%，是超采治理的重点区域。',
      '2. 农业用水是地下水开采主因：农业占比超过70%的县级行政区广泛存在，推进高效节水灌溉是压减地下水开采的关键路径。',
      '3. 降水与地下水依赖度呈负相关：降水量低的区域地下水依赖度高，需因地制宜采取地表水替代、雨水集蓄等综合措施。',
      '4. 用水量大县重点关注：用水量排名靠前的县多为农业大县，需在保障粮食安全的前提下推进用水结构调整。',
      '5. 数据驱动精细管理：基于县级用水数据的精细化分析，可为区域水资源配置和超采治理提供精准的决策支持。',
    ]),
  });

  return {
    title: '河北省地下水数据洞察报告',
    subtitle: '多维度交叉分析 · 县级用水数据',
    sections,
    showDate: true,
  };
});
