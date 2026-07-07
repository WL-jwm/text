/**
 * 环境地质简报报告生成器
 *
 * 注册为 'environment' 类型报告。
 * 数据通过 useReportData 预采集缓存传入。
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('environment', (data) => {
  const sections: ReportConfig['sections'] = [];

  // ============================================================
  // 第一章：地下水漏斗概况
  // ============================================================
  const shallowTotal = data.shallowTotal as Record<string, unknown>;
  const deepTotal = data.deepTotal as Record<string, unknown>;

  sections.push({
    title: '地下水漏斗概况',
    level: 1,
    content: [
      ...buildParagraphs([
        `2024年河北省浅层漏斗总面积 ${shallowTotal.totalArea} km²，较上年 ${shallowTotal.prevArea} km² 变化 ${shallowTotal.areaChange} km²，水位${shallowTotal.levelChange}。`,
        `深层漏斗总面积 ${deepTotal.totalArea} km²，较上年 ${deepTotal.prevArea} km² 减少 ${Math.abs(Number(deepTotal.areaChange))} km²，深层漏斗${deepTotal.status}。`,
      ]),
    ],
  });

  // ============================================================
  // 第二章：浅层漏斗
  // ============================================================
  const shallowCones = data.shallowCones as Array<{
    name: string; center: string; waterLevel: number;
    area: number; prevArea: number; areaChange: number; levelChange: string;
  }>;

  if (shallowCones && shallowCones.length > 0) {
    sections.push({
      title: '浅层地下水漏斗',
      level: 1,
      content: [
        ...buildParagraphs([
          '2024年河北省平原区共发育5个浅层地下水漏斗，总面积为4,287.81 km²，较上年减少733.6 km²。各漏斗特征如下表所示。',
        ]),
        ...buildTable(
          [
            { header: '漏斗名称' }, { header: '中心位置' },
            { header: '中心水位(m)' }, { header: '面积(km²)' },
            { header: '上年面积(km²)' }, { header: '面积变化(km²)' },
            { header: '水位变化' },
          ],
          shallowCones.map(d => [
            d.name, d.center,
            String(d.waterLevel), String(d.area),
            String(d.prevArea), String(d.areaChange),
            d.levelChange,
          ]),
          { caption: '表1 2024年浅层地下水漏斗特征' }
        ),
        ...buildParagraphs([
          '丰南漏斗面积减少最多（-591.39 km²），雄县固安漏斗面积增加最多（+73.69 km²）。全部浅层漏斗水位均呈上升趋势，表明浅层地下水超采治理取得积极成效。',
        ]),
      ],
    });
  }

  // ============================================================
  // 第三章：深层漏斗（历史性突破）
  // ============================================================
  const deepCones = data.deepCones as Array<{
    name: string; center: string; waterLevel: number;
    area: number; prevArea: number; areaChange: number; levelChange: string;
  }>;

  if (deepCones && deepCones.length > 0) {
    sections.push({
      title: '深层地下水漏斗——历史性消散',
      level: 1,
      content: [
        ...buildParagraphs([
          '2024年河北省深层地下水漏斗全部消散，这是河北省地下水超采综合治理的历史性突破。',
          '深层漏斗面积从2023年的350.99 km²降至0 km²，三个深层漏斗全部实现清零。',
        ]),
        ...buildTable(
          [
            { header: '漏斗名称' }, { header: '中心位置' },
            { header: '中心水位(m)' }, { header: '2024年面积(km²)' },
            { header: '2023年面积(km²)' }, { header: '面积变化(km²)' },
            { header: '水位变化' },
          ],
          deepCones.map(d => [
            d.name, d.center,
            String(d.waterLevel), String(d.area),
            String(d.prevArea), String(d.areaChange),
            d.levelChange,
          ]),
          { caption: '表2 2024年深层地下水漏斗特征' }
        ),
      ],
    });
  }

  // ============================================================
  // 第四章：历史漏斗对比
  // ============================================================
  const historicalCones = data.historicalCones as Array<{
    name: string; location: string; aquifer: string;
    centerDepth: string; area: string; cause: string; declineRate: string;
  }>;

  if (historicalCones && historicalCones.length > 0) {
    sections.push({
      title: '1990年代历史漏斗对比',
      level: 1,
      content: [
        ...buildParagraphs([
          '1990年代河北省平原区曾发育多个大型地下水漏斗，与2024年现状形成鲜明对比。历史漏斗特征如下表所示。',
        ]),
        ...buildTable(
          [
            { header: '漏斗名称' }, { header: '位置' },
            { header: '含水层组' }, { header: '中心埋深(m)' },
            { header: '面积(km²)' }, { header: '成因' },
            { header: '下降速率(m/a)' },
          ],
          historicalCones.map(d => [
            d.name, d.location, d.aquifer,
            d.centerDepth, d.area, d.cause, d.declineRate,
          ]),
          { caption: '表3 1990年代历史地下水漏斗特征' }
        ),
        ...buildParagraphs([
          '沧州漏斗曾是华北最大的深层地下水漏斗，面积约1,000 km²，中心埋深超过80m。2024年沧州深层漏斗已完全消散，水位回升显著。',
        ]),
      ],
    });
  }

  // ============================================================
  // 第五章：地面沉降
  // ============================================================
  const subsidence2024 = data.subsidence2024 as Array<{
    city: string; maxRateMmYr: number; avgRateMmYr: number;
    totalMm: number; center: string; trend: string; note: string;
  }>;

  if (subsidence2024 && subsidence2024.length > 0) {
    const severe = subsidence2024.filter(s => s.totalMm >= 1000).length;
    const moderate = subsidence2024.filter(s => s.totalMm >= 500 && s.totalMm < 1000).length;
    const slight = subsidence2024.filter(s => s.totalMm < 500).length;

    sections.push({
      title: '地面沉降',
      level: 1,
      content: [
        ...buildParagraphs([
          `2024年河北省InSAR监测显示，${subsidence2024.length}个地市中，重度沉降（累计≥1000mm）${severe}个，中等沉降（500~1000mm）${moderate}个，轻度沉降（<500mm）${slight}个。`,
          '沧州累计沉降量最大（1,156mm），但沉降速率已从峰值56mm/年降至18.5mm/年。全省沉降速率连续六年呈下降趋势。',
        ]),
        ...buildTable(
          [
            { header: '城市' }, { header: '最大速率(mm/年)' },
            { header: '平均速率(mm/年)' }, { header: '累计沉降(mm)' },
            { header: '沉降中心' }, { header: '趋势' },
          ],
          subsidence2024.map(d => [
            d.city, String(d.maxRateMmYr), String(d.avgRateMmYr),
            String(d.totalMm), d.center, d.trend,
          ]),
          { caption: '表4 2024年各市地面沉降监测数据' }
        ),
      ],
    });
  }

  // ============================================================
  // 第六章：沉降速率演变趋势
  // ============================================================
  const subsidenceTrend = data.subsidenceTrend as Array<{
    year: number; maxRate: number; avgRate: number; gwExploitation: number; note: string;
  }>;

  if (subsidenceTrend && subsidenceTrend.length > 0) {
    const first = subsidenceTrend[0];
    const last = subsidenceTrend[subsidenceTrend.length - 1];
    const maxRateDecline = first.maxRate - last.maxRate;
    const avgRateDecline = first.avgRate - last.avgRate;
    const gwReduction = first.gwExploitation - last.gwExploitation;

    sections.push({
      title: '沉降速率历史演变（2014-2024）',
      level: 1,
      content: [
        ...buildParagraphs([
          `2014年至2024年，河北省最大沉降速率从 ${first.maxRate}mm/年 降至 ${last.maxRate}mm/年，下降 ${maxRateDecline.toFixed(1)}mm/年（降幅 ${(maxRateDecline / first.maxRate * 100).toFixed(0)}%）；平均沉降速率从 ${first.avgRate}mm/年 降至 ${last.avgRate}mm/年，下降 ${avgRateDecline.toFixed(1)}mm/年。`,
          `同期地下水开采量从 ${first.gwExploitation}亿m³ 降至 ${last.gwExploitation}亿m³，减少 ${gwReduction.toFixed(1)}亿m³（降幅 ${(gwReduction / first.gwExploitation * 100).toFixed(0)}%），沉降速率与地下水开采量呈显著正相关。`,
        ]),
        ...buildTable(
          [
            { header: '年份' }, { header: '最大速率(mm/年)' },
            { header: '平均速率(mm/年)' }, { header: '地下水开采量(亿m³)' },
            { header: '备注' },
          ],
          subsidenceTrend.map(d => [
            String(d.year), String(d.maxRate), String(d.avgRate),
            String(d.gwExploitation), d.note,
          ]),
          { caption: '表5 沉降速率与地下水开采量演变趋势' }
        ),
      ],
    });
  }

  // ============================================================
  // 第七章：环境地质现状与治理措施
  // ============================================================
  const envStatus = data.envStatus as Record<string, string>;
  const envProblems = data.envProblems as Array<{
    problem: string; area: string; impact: string; measure2024: string;
  }>;

  if (envProblems && envProblems.length > 0) {
    sections.push({
      title: '环境地质问题与治理措施',
      level: 1,
      content: [
        ...buildParagraphs([
          '河北省环境地质问题主要包括地面沉降、海水入侵、水质污染、高氟水和咸水入侵等。2024年各项治理措施持续推进，深层漏斗消散带动整体环境改善。',
        ]),
        ...buildTable(
          [
            { header: '环境问题' }, { header: '分布区域' },
            { header: '影响程度' }, { header: '2024年治理措施' },
          ],
          envProblems.map(d => [d.problem, d.area, d.impact, d.measure2024]),
          { caption: '表6 环境地质问题与治理措施' }
        ),
      ],
    });
  }

  // 环境现状总览
  if (envStatus) {
    sections.push({
      title: '2024年环境地质现状总览',
      level: 2,
      content: buildTable(
        [{ header: '项目' }, { header: '现状' }],
        Object.entries(envStatus).map(([key, val]) => {
          const labels: Record<string, string> = {
            settlement: '地面沉降',
            hengshuiClear: '衡水深层超采区清零',
            recharge: '深层回补试验场',
            seawaterIntrusion: '海(咸)水入侵防治',
            overExploitArea: '超采治理',
          };
          return [labels[key] || key, val];
        }),
        { caption: '表7 2024年环境地质现状' }
      ),
    });
  }

  // ============================================================
  // 第八章：结论
  // ============================================================
  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      (data.conclusion as string) || '2024年河北省环境地质状况持续改善，深层地下水漏斗全部消散，地面沉降速率连续六年下降，超采治理取得历史性成效。建议继续巩固治理成果，加强地面沉降监测网络建设，推进深层地下水回补试验，确保地下水资源的可持续利用。',
    ]),
  });

  return {
    title: '河北省环境地质简报',
    subtitle: '基于2024年地下水漏斗与地面沉降监测数据',
    sections,
    showDate: true,
  };
});
