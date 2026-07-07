/**
 * 岩溶水报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('karst-water', (data) => {
  const sections: ReportConfig['sections'] = [];
  const springs = data.karstSprings as Array<Record<string, unknown>>;

  sections.push({
    title: '主要岩溶泉域',
    level: 1,
    content: [
      ...buildParagraphs([`河北省共有 ${springs?.length || 0} 个主要岩溶泉域，分布在太行山和燕山碳酸盐岩区。`]),
      ...buildTable(
        [{ header: '泉域名' }, { header: '位置' }, { header: '流量(m³/s)' }, { header: '类型' }, { header: '面积(km²)' }, { header: '岩性' }],
        (springs || []).map(s => [String(s.name), String(s.location), String(s.discharge), String(s.type), String(s.area), String(s.lithology)]),
        { caption: '表1 河北省主要岩溶泉域' }
      ),
    ],
  });

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '河北省岩溶水主要赋存于奥陶系和寒武系碳酸盐岩中，以泉域形式集中排泄。黑龙洞泉群（10.4m³/s）、威州泉（9.48m³/s）、邢台百泉（6.5m³/s）为三大著名泉域。岩溶水是河北省山区最重要的供水水源，也是南水北调受水区的重要补充水源。',
    ]),
  });

  return { title: '河北省岩溶水资源概况', subtitle: '基于1999年基础文献第八章', sections, showDate: true };
});
