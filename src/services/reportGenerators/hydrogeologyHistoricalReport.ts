/**
 * 历史水文地质参数汇编报告生成器
 * 涵盖：泉水数据库、含水层参数、河流渗漏、盆地参数、工程地质、物探参数、地层柱状
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('hydrogeology-historical', (data) => {
  const sections: ReportConfig['sections'] = [];
  const springs = (data.historicalSprings || []) as Array<Record<string, unknown>>;
  const springStats = (data.springStatsByRegion || []) as Array<Record<string, unknown>>;
  const riverLeakage = (data.riverLeakageData || []) as Array<Record<string, unknown>>;
  const runoffModulus = (data.mountainRunoffModulus || []) as Array<Record<string, unknown>>;
  const yieldRate = (data.aquiferYieldRate || []) as Array<Record<string, unknown>>;
  const huailai = (data.huailaiBasinParams || []) as Array<Record<string, unknown>>;
  const karst = (data.hanxingKarstParams || []) as Array<Record<string, unknown>>;
  const basins = (data.basinAquiferParams || []) as Array<Record<string, unknown>>;
  const reservoirs = (data.reservoirGeology || []) as Array<Record<string, unknown>>;
  const irrigation = (data.largeIrrigationDistricts || []) as Array<Record<string, unknown>>;

  // ── 第1章：概述 ──
  const totalSprings = springs.length;
  const totalRegions = springStats.length;
  const totalRiver = riverLeakage.length;
  const totalReservoirs = reservoirs.length;

  sections.push({
    title: '报告概述',
    level: 1,
    content: buildParagraphs([
      `本报告基于《河北省水文地质工程地质》(1980年代, OCR识别)整理汇编，涵盖 ${totalSprings} 条历史泉水数据库、${totalRiver} 条河流渗漏数据、含水层参数、工程地质、物探参数等 ${totalRegions} 大类基础水文地质参数。`,
      `泉水数据库覆盖 ${totalRegions} 个地区（邯邢、石家庄、唐山、承德、保定、张家口），出露条件涵盖碳酸盐岩、片麻岩、花岗岩、第四系松散层等多种类型。`,
      '数据来源于1980年代河北省水文地质普查成果，为环评参数取值和区域水文地质分析提供历史参考依据。',
    ]),
  });

  // ── 第2章：泉水数据库 ──
  if (springs.length > 0) {
    sections.push({
      title: '泉水数据库',
      level: 1,
      content: [
        ...buildParagraphs([
          `共收录 ${totalSprings} 处历史泉水数据，按地区统计：${springStats.map(s => `${s.region}${s.count}处`).join('、')}。`,
          '流量最大的泉水为峰峰黑龙洞泉（21600~32400 m³/h），其次为涉县东风湖泉群（5832~7488 m³/h），均为中奥陶系灰岩岩溶泉。',
        ]),
        ...buildTable(
          [{ header: '地区' }, { header: '泉水数量' }],
          springStats.map(s => [String(s.region), String(s.count)]),
          { caption: '表1 泉水分地区统计' }
        ),
      ],
    });
  }

  // ── 第3章：含水层参数 ──
  if (yieldRate.length > 0) {
    sections.push({
      title: '含水层参数',
      level: 1,
      content: [
        ...buildParagraphs([
          '含水层出水率经验值按岩性和含水组划分，第I含水组山前冲洪积扇主流带出水率最高（卵石3.00~5.00 m³/(h·m)），粉砂最低（0.30~0.50 m³/(h·m)）。',
          '渗透系数K值分区统计显示，山前平原中砂渗透系数15~25 m/d，中部平原12~18 m/d，东部及滨海平原10~15 m/d，呈递减趋势。',
        ]),
        ...buildTable(
          [{ header: '岩性' }, { header: '含水组' }, { header: '分区' }, { header: '出水率(m³/(h·m))' }],
          yieldRate.slice(0, 12).map(a => [String(a.lithology), String(a.aquiferGroup), String(a.region), String(a.range)]),
          { caption: '表2 含水层出水率经验值（第I含水组山前区）' }
        ),
      ],
    });
  }

  // ── 第4章：河流渗漏与径流 ──
  if (riverLeakage.length > 0) {
    sections.push({
      title: '河流渗漏与径流模数',
      level: 1,
      content: [
        ...buildParagraphs([
          `收录 ${totalRiver} 条河流渗漏数据，主要分布在太行山前碳酸盐岩分布区。沙河(朱庄川)漏失量最大，多年平均漏失2.64 m³/s。`,
        ]),
        ...buildTable(
          [{ header: '河流' }, { header: '渗漏段' }, { header: '实测漏失(m³/s)' }, { header: '平均漏失(m³/s)' }],
          riverLeakage.map(r => [String(r.river), String(r.section), String(r.measuredLeakage), String(r.avgLeakage)]),
          { caption: '表3 河流渗漏数据' }
        ),
        ...(runoffModulus.length > 0 ? [
          ...buildParagraphs(['山区径流模数统计：']),
          ...buildTable(
            [{ header: '岩性组合' }, { header: '范围(L/(s·km²))' }, { header: '平均值' }],
            runoffModulus.map(m => [String(m.rockType), String(m.range), String(m.average)]),
            { caption: '表4 山区径流模数' }
          ),
        ] : []),
      ],
    });
  }

  // ── 第5章：盆地参数与岩溶水 ──
  if (karst.length > 0 || basins.length > 0) {
    sections.push({
      title: '盆地参数与岩溶水',
      level: 1,
      content: [
        ...(karst.length > 0 ? [
          ...buildParagraphs(['邯邢地区岩溶水参数：']),
          ...buildTable(
            [{ header: '位置' }, { header: '含水层' }, { header: '出水率(m³/(h·m))' }],
            karst.map(k => [String(k.location), String(k.aquifer), String(k.yieldRate)]),
            { caption: '表5 邯邢地区岩溶水参数' }
          ),
        ] : []),
        ...(huailai.length > 0 ? [
          ...buildParagraphs(['怀来盆地冲洪积扇分段参数：扇顶部出水率32~98 m³/(h·m)，扇中部17 m³/(h·m)，扇前缘3~10 m³/(h·m)，冲积平原<1 m³/(h·m)。']),
        ] : []),
      ],
    });
  }

  // ── 第6章：工程地质 ──
  if (reservoirs.length > 0) {
    sections.push({
      title: '工程地质',
      level: 1,
      content: [
        ...buildParagraphs([
          `收录 ${totalReservoirs} 座大型水库工程地质数据，坝基岩性以片麻岩为主。`,
        ]),
        ...buildTable(
          [{ header: '水库' }, { header: '位置' }, { header: '坝型' }, { header: '坝基岩性' }],
          reservoirs.map(r => [String(r.name), String(r.location), String(r.damType), String(r.foundationRock)]),
          { caption: '表6 大型水库工程地质' }
        ),
        ...(irrigation.length > 0 ? [
          ...buildParagraphs(['大型灌区工程数据：']),
          ...buildTable(
            [{ header: '灌区' }, { header: '水源' }, { header: '设计流量(m³/s)' }, { header: '设计面积(万亩)' }],
            irrigation.map(d => [String(d.name), String(d.waterSource), String(d.designFlow), String(d.designArea)]),
            { caption: '表7 大型灌区工程数据' }
          ),
        ] : []),
      ],
    });
  }

  // ── 第7章：结论 ──
  sections.push({
    title: '结论与建议',
    level: 1,
    content: buildParagraphs([
      '1. 历史泉水数据库是区域水文地质研究的重要基础资料，126处泉水反映了1980年代前河北省天然地下水排泄格局，其中多处泉水（如黑龙洞泉、百泉等）因开采已干涸或流量锐减。',
      '2. 含水层参数（出水率、渗透系数、给水度）为环评参数取值提供了重要参考，但需注意1980年代参数与当前水文地质条件的差异。',
      '3. 河流渗漏数据对山前碳酸盐岩分布区的地表水-地下水转化研究具有重要价值，部分河段已因水利工程修建而改变渗漏特征。',
      '4. 工程地质和物探参数为水利工程选址和地球物理勘探提供了历史参考依据。',
      '5. 建议：在使用历史参数时，应结合当前水文地质条件和最新调查成果进行综合判断，不宜直接套用。',
    ]),
  });

  return {
    title: '河北省历史水文地质参数汇编报告',
    subtitle: '《河北省水文地质工程地质》(1980年代, OCR识别)',
    sections,
    showDate: true,
  };
});
