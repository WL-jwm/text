/**
 * 裂隙水报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('fracture-water', (data) => {
  const sections: ReportConfig['sections'] = [];
  const types = data.fractureTypes as Array<Record<string, unknown>>;

  sections.push({
    title: '裂隙水类型与特征',
    level: 1,
    content: [
      ...buildParagraphs(['河北省基岩裂隙水分为风化带网状裂隙水、层状裂隙水和构造裂隙水三种类型，是山区分散供水的主要水源。']),
      ...buildTable(
        [{ header: '类型' }, { header: '分布' }, { header: '埋深(m)' }, { header: '水量(m³/d)' }, { header: '水质' }, { header: '占比' }],
        (types || []).map(t => [String(t.type), String(t.distribution), String(t.depth), String(t.yield), String(t.waterQuality), String(t.proportion)]),
        { caption: '表1 裂隙水类型与特征' }
      ),
    ],
  });

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '风化带网状裂隙水分布最广（~55%），是山区农村分散供水的主要水源，但水量一般<100m³/d。层状裂隙水（~30%）富水性中等，可在厚层砂岩和断层带获得100~500m³/d水量。构造裂隙水（~15%）水量变化大，局部可形成富水块段。',
    ]),
  });

  return { title: '河北省基岩裂隙水资源概况', subtitle: '基于1999年基础文献第九章', sections, showDate: true };
});
