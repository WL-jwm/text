/**
 * 水质评价报告生成器
 * 
 * 注册为 'water-quality' 类型报告。
 * 数据通过 useReportData 预采集缓存传入。
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

// 注册水质评价报告生成器
registerReportGenerator('water-quality', (data) => {
  const sections: ReportConfig['sections'] = [];

  // ============================================================
  // 第一章：评价概述
  // ============================================================
  sections.push({
    title: '评价概述',
    level: 1,
    content: buildParagraphs([
      '本次评价依据《地下水质量标准》（GB/T 14848-2017），采用单因子标准指数法进行水质评价。',
      `共评价监测点 ${(data.totalSites as string) || '—'} 个，涉及 ${(data.totalFactors as string) || '—'} 项评价因子。`,
    ]),
  });

  // ============================================================
  // 第二章：评价标准
  // ============================================================
  const standards = data.standards as Array<{ class: string; name: string; description: string }> | undefined;
  if (standards && standards.length > 0) {
    sections.push({
      title: '评价标准',
      level: 1,
      content: buildTable(
        [{ header: '类别' }, { header: '名称' }, { header: '描述' }],
        standards.map(s => [s.class, s.name, s.description]),
        { caption: '表1 地下水质量分类标准' }
      ),
    });
  }

  // ============================================================
  // 第三章：单因子评价结果
  // ============================================================
  const evaluationResults = data.evaluationResults as Array<Record<string, unknown>> | undefined;
  if (evaluationResults && evaluationResults.length > 0) {
    const headers = Object.keys(evaluationResults[0]);
    sections.push({
      title: '单因子评价结果',
      level: 1,
      content: [
        ...buildParagraphs(['采用标准指数法对各监测点进行单因子评价，结果如下表所示。']),
        ...buildTable(
          headers.map(h => ({ header: h })),
          evaluationResults.map(row => headers.map(h => String(row[h] ?? ''))),
          { caption: '表2 单因子评价结果' }
        ),
      ],
    });
  }

  // ============================================================
  // 第四章：超标因子分析
  // ============================================================
  const pollutionStats = data.pollutionStats as Array<{ name: string; rate: string; maxRate: string }> | undefined;
  if (pollutionStats && pollutionStats.length > 0) {
    sections.push({
      title: '超标因子分析',
      level: 1,
      content: [
        ...buildParagraphs(['统计各评价因子的超标情况，主要超标因子如下表所示。']),
        ...buildTable(
          [{ header: '因子名称' }, { header: '超标率' }, { header: '最大超标倍数' }],
          pollutionStats.map(p => [p.name, p.rate, p.maxRate]),
          { caption: '表3 主要超标因子统计' }
        ),
      ],
    });
  }

  // ============================================================
  // 第五章：结论与建议
  // ============================================================
  sections.push({
    title: '结论与建议',
    level: 1,
    content: buildParagraphs([
      `综合评价结果表明，评价区地下水质量以 ${(data.dominantClass as string) || '—'} 类水为主，达标率为 ${(data.complianceRate as string) || '—'}。`,
      (data.conclusion as string) || '建议加强地下水监测与保护工作，重点关注超标因子的污染来源控制。',
    ]),
  });

  return {
    title: '地下水水质评价报告',
    subtitle: '河北省地下水环境信息平台',
    sections,
    showDate: true,
  };
});
