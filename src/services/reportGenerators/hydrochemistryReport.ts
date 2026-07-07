/**
 * 水化学与咸水分布报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('hydrochemistry', (data) => {
  const sections: ReportConfig['sections'] = [];
  const salineWater = data.salineWater as Record<string, unknown>;
  const salineDist = data.salineDistribution as Array<Record<string, unknown>>;

  sections.push({
    title: '咸水分布概况',
    level: 1,
    content: [
      ...buildParagraphs([`河北省咸水分布总面积约 ${salineWater?.totalArea} km²，储存量约 ${salineWater?.totalStorage} 亿m³。主要分布在沧州、衡水、唐山、廊坊、邢台东部平原地区。`]),
    ],
  });

  if (salineDist && salineDist.length > 0) {
    sections.push({
      title: '各市咸水分布',
      level: 1,
      content: [
        ...buildTable(
          [{ header: '城市' }, { header: '总面积(km²)' }, { header: '淡水面积(km²)' }, { header: '咸水面积(km²)' }, { header: '淡水比例' }, { header: '浅层咸水' }, { header: '深层咸水' }],
          salineDist.map(d => [String(d.region), String(d.totalArea), String(d.freshArea), String(d.salineArea), String(d.freshRatio), String(d.shallowSaline), String(d.deepSaline)]),
          { caption: '表1 各市咸水面积统计' }
        ),
      ],
    });
  }

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '河北省咸水主要分布在沧州、衡水、唐山、廊坊、邢台5市，总面积约4万km²。南水北调通水替代深层水开采后，咸水入侵趋势基本遏制。沧州、唐山等地已建成深层地下水回补试验场，咸水资源化利用逐步推进。',
    ]),
  });

  return { title: '河北省咸水分布与水化学特征', subtitle: '基于1999年基础文献与2024年水资源公报', sections, showDate: true };
});
