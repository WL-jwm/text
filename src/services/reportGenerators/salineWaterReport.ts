/**
 * 咸水分布报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('saline-water', (data) => {
  const sections: ReportConfig['sections'] = [];
  const dist = data.salineDistribution as Array<Record<string, unknown>>;
  const overview = data.salineWaterOverview as Record<string, unknown>;

  if (overview) {
    sections.push({
      title: '咸水分布概况',
      level: 1,
      content: buildParagraphs([
        `河北省咸水分布总面积约 ${overview.totalArea} km²，储存量约 ${overview.totalStorage} 亿m³。`,
        String(overview.note || ''),
      ]),
    });
  }

  if (dist && dist.length > 0) {
    sections.push({
      title: '各市咸水面积统计',
      level: 1,
      content: [
        ...buildTable(
          [{ header: '城市' }, { header: '总面积(km²)' }, { header: '淡水面积(km²)' }, { header: '咸水面积(km²)' }, { header: '淡水比例' }, { header: '浅层咸水' }, { header: '深层咸水' }],
          dist.map(d => [String(d.region), String(d.totalArea), String(d.freshArea), String(d.salineArea), String(d.freshRatio), String(d.shallowSaline), String(d.deepSaline)]),
          { caption: '表1 各市咸水面积统计' }
        ),
      ],
    });
  }

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '河北省咸水集中在沧州（6570 km²）、衡水（3784 km²）、唐山（3265 km²）、廊坊（1893 km²）、邢台（2135 km²）5市。南水北调通水后，深层水开采大幅减少，咸水入侵趋势基本遏制。咸水资源化利用（工业冷却、农业灌溉）是下一步重点方向。',
    ]),
  });

  return { title: '河北省咸水分布报告', subtitle: '基于1999年基础文献第十二章', sections, showDate: true };
});
