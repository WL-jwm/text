/**
 * 盐碱土报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('saline-soil', (data) => {
  const sections: ReportConfig['sections'] = [];
  const distribution = data.distribution as Array<Record<string, unknown>>;

  sections.push({
    title: '各市盐碱地面积统计',
    level: 1,
    content: [
      ...buildParagraphs(['河北省盐碱地主要分布在沧州、衡水、唐山等平原地区，近年来持续治理，面积呈下降趋势。']),
      ...buildTable(
        [{ header: '城市' }, { header: '总面积(万亩)' }, { header: '盐化(万亩)' }, { header: '碱化(万亩)' }, { header: '变化趋势' }, { header: '改良率(%)' }],
        distribution.map(d => [String(d.region), String(d.totalSalineAlkali), String(d.saline), String(d.alkaline), String(d.change), String(d.reclamationRate)]),
        { caption: '表1 各市盐碱地面积统计' }
      ),
    ],
  });

  const total = distribution.reduce((s, d) => s + Number(d.totalSalineAlkali), 0);

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      `河北省盐碱地总面积约 ${total.toFixed(1)} 万亩，沧州（245.3万亩）和衡水（132.5万亩）最为集中。各市改良率37.8%~75.6%，石家庄改良率最高（75.6%）。建议继续推进盐碱地综合治理和耐盐作物种植推广。`,
    ]),
  });

  return { title: '河北省盐碱土分布与改良', subtitle: '基于第三次全国土壤普查', sections, showDate: true };
});
