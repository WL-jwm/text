/**
 * 地热资源报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('geothermal', (data) => {
  const sections: ReportConfig['sections'] = [];
  const fields = data.geothermalFields as Array<Record<string, unknown>>;
  const types = data.geothermalTypes as Array<Record<string, unknown>>;

  if (types && types.length > 0) {
    sections.push({
      title: '地热资源类型',
      level: 1,
      content: [
        ...buildTable(
          [{ header: '类型' }, { header: '数量' }, { header: '占比' }, { header: '热储温度' }, { header: '特征' }],
          types.map(t => [String(t.type), String(t.count), String(t.proportion), String(t.reservoirTemp), String(t.features)]),
          { caption: '表1 地热资源类型分类' }
        ),
      ],
    });
  }

  if (fields && fields.length > 0) {
    sections.push({
      title: '主要地热田',
      level: 1,
      content: [
        ...buildTable(
          [{ header: '名称' }, { header: '位置' }, { header: '类型' }, { header: '热储层' }, { header: '温度(°C)' }, { header: '面积(km²)' }, { header: '开发状态' }],
          fields.map(f => [String(f.name), String(f.location), String(f.type), String(f.reservoir), String(f.temperature), String(f.area), String(f.status)]),
          { caption: '表2 主要地热田一览' }
        ),
      ],
    });
  }

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '河北省共有8处主要地热田，以岩溶裂隙型（37.5%）和沉积盆地型（25.0%）为主。雄县地热田和牛驼镇地热田为华北地区规模最大的地热田，温度可达65~95°C，已实现大规模供暖利用。地热资源开发潜力大，是清洁能源的重要补充。',
    ]),
  });

  return { title: '河北省地热资源概况', subtitle: '基于1999年基础文献第十章', sections, showDate: true };
});
