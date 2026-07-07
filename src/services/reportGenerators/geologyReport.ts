/**
 * 基础地质报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('geology', (data) => {
  const sections: ReportConfig['sections'] = [];
  const g = data.geology as Record<string, unknown>;
  const aquiferSystems = g.aquiferSystems as Array<Record<string, unknown>>;
  const systems = g.systems as Array<Record<string, unknown>>;

  sections.push({
    title: '含水系统类型',
    level: 1,
    content: [
      ...buildParagraphs(['河北省含水系统分为孔隙水、岩溶水和裂隙水三大类型。']),
      ...buildTable(
        [{ header: '类型' }, { header: '分布区域' }, { header: '面积(km²)' }, { header: '占比(%)' }, { header: '说明' }],
        aquiferSystems.map(a => [String(a.name), String(a.area), String(a.areaKm2), String(a.proportion), String(a.note)]),
        { caption: '表1 河北省含水系统类型' }
      ),
    ],
  });

  sections.push({
    title: '流域水资源系统',
    level: 1,
    content: [
      ...buildParagraphs(['河北省按流域划分6个水资源系统，总可开采资源量146.87亿m³/年。']),
      ...buildTable(
        [{ header: '系统名称' }, { header: '面积(km²)' }, { header: '补给量(亿m³)' }, { header: '可开采量(亿m³)' }],
        systems.map(s => [String(s.name), String(s.areaKm2), String(s.recharge), String(s.exploitable)]),
        { caption: '表2 流域水资源系统' }
      ),
    ],
  });

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '河北省地下水可开采资源总量146.87亿m³/年，其中海河南系占比最大（72.61亿m³/年，49.4%），孔隙水为主要含水类型（面积占比46.9%）。地质构造控制着含水系统的空间分布，太行山-燕山山区以岩溶水和裂隙水为主，河北平原以孔隙水为主。',
    ]),
  });

  return { title: '河北省基础地质概况', subtitle: '基于《河北省区域地质志》', sections, showDate: true };
});
