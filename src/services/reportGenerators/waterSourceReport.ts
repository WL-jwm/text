/**
 * 水源地蓄水构造报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('water-source', (data) => {
  const sections: ReportConfig['sections'] = [];
  const summary = data.summary as Array<Record<string, unknown>>;
  const karst = data.karstBasin as Array<Record<string, unknown>>;

  sections.push({
    title: '蓄水构造类型概览',
    level: 1,
    content: [
      ...buildParagraphs(['河北省蓄水构造分为5种类型，共39处水源地。']),
      ...buildTable(
        [{ header: '类型' }, { header: '数量' }, { header: '面积(km²)' }, { header: '代表性水源地' }],
        summary.map(s => [String(s.type), String(s.count), String(s.totalArea), String(s.representative)]),
        { caption: '表1 蓄水构造类型概览' }
      ),
    ],
  });

  if (karst && karst.length > 0) {
    sections.push({
      title: '岩溶盆地型蓄水构造',
      level: 1,
      content: [
        ...buildParagraphs([`河北省共有 ${karst.length} 处岩溶盆地型蓄水构造，主要分布在太行山和燕山山区。`]),
        ...buildTable(
          [{ header: '名称' }, { header: '面积(km²)' }, { header: '岩性' }, { header: '埋深(m)' }, { header: '排泄特征' }],
          karst.map(k => [String(k.name), String(k.area), String(k.lithology), String(k.depth), String(k.discharge)]),
          { caption: '表2 岩溶盆地型蓄水构造特征' }
        ),
      ],
    });
  }

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '河北省蓄水构造以岩溶盆地型和冲洪积扇型为主，岩溶盆地型集中分布在太行山-燕山碳酸盐岩区，是大型泉域和集中供水水源地的基础。冲洪积扇型分布于山前平原，是平原区主要供水水源。古河道型分布于中部平原，是农村分散供水的重要水源。',
    ]),
  });

  return { title: '河北省水源地蓄水构造', subtitle: '基于1999年基础文献第七章', sections, showDate: true };
});
