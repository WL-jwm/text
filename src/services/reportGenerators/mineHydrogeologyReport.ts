/**
 * 矿床水文地质报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('mine-hydrogeology', (data) => {
  const sections: ReportConfig['sections'] = [];
  const mines = data.mineData as Array<Record<string, unknown>>;

  sections.push({
    title: '主要矿床水文地质特征',
    level: 1,
    content: [
      ...buildParagraphs([`河北省共有 ${mines?.length || 0} 个主要矿床需进行水文地质评价。`]),
      ...buildTable(
        [{ header: '矿床名称' }, { header: '位置' }, { header: '矿种' }, { header: '含水层类型' }, { header: '涌水量(m³/h)' }, { header: '水文地质类型' }],
        (mines || []).map(m => [String(m.mine), String(m.location), String(m.oreType), String(m.aquiferType), String(m.mineWaterInflow), String(m.hydrogeologyType)]),
        { caption: '表1 主要矿床水文地质特征' }
      ),
    ],
  });

  if (mines && mines.length > 0) {
    sections.push({
      title: '充水水源与防治措施',
      level: 1,
      content: [
        ...buildTable(
          [{ header: '矿床名称' }, { header: '充水水源' }, { header: '富水性' }, { header: '排水方式' }, { header: '影响' }],
          mines.map(m => [String(m.mine), String(m.waterFillingSource), String(m.waterRichness), String(m.drainage), String(m.impact)]),
          { caption: '表2 矿床充水水源与防治措施' }
        ),
      ],
    });
  }

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '河北省主要矿床水文地质问题以岩溶充水和孔隙裂隙充水为主。开滦煤矿、峰峰煤矿等煤田受奥陶系灰岩岩溶水威胁最大，涌水量可达3~15m³/h。铁矿矿山受岩溶水和孔隙水双重充水影响。防治措施以强排疏干和帷幕注浆为主，需注意长期开采对区域地下水流场的影响。',
    ]),
  });

  return { title: '河北省矿床水文地质评价', subtitle: '基于1999年基础文献第十四章', sections, showDate: true };
});
