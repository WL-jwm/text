/**
 * 矿泉水报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('mineral-water', (data) => {
  const sections: ReportConfig['sections'] = [];
  const sites = data.mineralWaterSites as Array<Record<string, unknown>>;

  sections.push({
    title: '矿泉水产地一览',
    level: 1,
    content: [
      ...buildParagraphs([`河北省共有 ${sites?.length || 0} 处矿泉水产地，主要分布在太行山和燕山山区。`]),
      ...buildTable(
        [{ header: '名称' }, { header: '位置' }, { header: '类型' }, { header: '水温(°C)' }, { header: '日产量(m³/d)' }, { header: '矿化度' }, { header: '状态' }],
        (sites || []).map(s => [String(s.name), String(s.location), String(s.type), String(s.temperature), String(s.dailyYield), String(s.mineralization), String(s.status)]),
        { caption: '表1 矿泉水产地一览' }
      ),
    ],
  });

  const producing = sites?.filter(s => String(s.status) === '生产中').length || 0;
  const exploring = sites?.filter(s => String(s.status) === '勘查中').length || 0;

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      `河北省矿泉水以偏硅酸型和锶型为主，${producing} 处处于生产状态，${exploring} 处处于勘查阶段。平山温塘、赤城汤泉、隆化七家等产地日产量可达800~2000m³/d，开发利用前景良好。`,
    ]),
  });

  return { title: '河北省矿泉水资源概况', subtitle: '基于1999年基础文献第十一章', sections, showDate: true };
});
