/**
 * 报告合成器 — 章节内容构建器
 *  封面 / 目录 / 摘要 / 章节摘要 / 结论 / 参考文献 + 数据采集 + 中文数字工具
 */

import { Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, TabStopType, TabStopPosition } from 'docx';
import { useReportCacheStore, buildCacheKey } from '../stores/reportCacheStore';
import type { ReportMeta, ReportChapter, ReportTemplate } from '../store/reportGeneratorStore';

export function numberToChinese(num: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (num < 10) return digits[num];
  if (num < 20) return '十' + (num % 10 === 0 ? '' : digits[num % 10]);
  const tens = Math.floor(num / 10);
  const ones = num % 10;
  return digits[tens] + '十' + (ones === 0 ? '' : digits[ones]);
}

/** 构建回退章节（无报告生成器时） */

export function getCachedData(moduleId: string): Record<string, unknown> | null {
  const store = useReportCacheStore.getState();
  const key = buildCacheKey(moduleId);
  return store.getCache<Record<string, unknown>>(key);
}

// ============================================================
// 自动章节生成
// ============================================================

/** 生成封面段落 */

export function buildCoverParagraphs(meta: ReportMeta): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 4000 } }),
    new Paragraph({
      children: [new TextRun({ text: meta.title, bold: true, size: 52, font: 'SimHei' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    ...(meta.subtitle ? [new Paragraph({
      children: [new TextRun({ text: meta.subtitle, size: 32, font: 'SimSun', color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })] : []),
    new Paragraph({
      children: [new TextRun({ text: `编制单位：${meta.organization}`, size: 24, font: 'SimSun', color: '888888' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    ...(meta.author ? [new Paragraph({
      children: [new TextRun({ text: `编制人：${meta.author}`, size: 24, font: 'SimSun', color: '888888' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })] : []),
    new Paragraph({
      children: [new TextRun({ text: `日期：${meta.date}`, size: 24, font: 'SimSun', color: '888888' })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

/** 生成目录段落 */
export function buildTocParagraphs(chapters: ReportChapter[]): Paragraph[] {
  const paras: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: '目  录', bold: true, size: 36, font: 'SimHei' })],
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),
  ];

  let chapterNum = 0;
  for (const ch of chapters) {
    if (!ch.enabled) continue;
    chapterNum++;
    const title = `第${numberToChinese(chapterNum)}章  ${ch.title}`;
    paras.push(new Paragraph({
      children: [
        new TextRun({ text: title, size: 24, font: 'SimSun' }),
        new TextRun({ text: '\t' }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { after: 100 },
    }));
  }

  paras.push(new Paragraph({ children: [new PageBreak()] }));
  return paras;
}

/** 生成摘要段落 */
export function buildSummaryParagraphs(
  meta: ReportMeta,
  chapters: ReportChapter[],
  chapterData: Array<{ title: string; data: Record<string, unknown> | null }>,
): Paragraph[] {
  const enabledChapters = chapters.filter(c => c.enabled);
  const moduleList = enabledChapters.map(c => c.title).join('、');

  const paras: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: '摘  要', bold: true, size: 36, font: 'SimHei' })],
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: `本报告由河北省地下水环境信息平台自动生成，综合分析了${moduleList}等${enabledChapters.length}个方面的内容。`,
        size: 24, font: 'SimSun',
      })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200, line: 360 },
    }),
  ];

  // 生成各章节简要摘要
  let chapterNum = 0;
  for (let i = 0; i < chapters.length; i++) {
    if (!chapters[i].enabled) continue;
    chapterNum++;
    const ch = chapters[i];
    const data = chapterData[i]?.data;
    const summary = generateChapterSummary(ch.moduleId, data);
    if (summary) {
      paras.push(new Paragraph({
        children: [new TextRun({
          text: `第${numberToChinese(chapterNum)}章${ch.title}：${summary}`,
          size: 24, font: 'SimSun',
        })],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 150, line: 360 },
      }));
    }
  }

  paras.push(new Paragraph({ children: [new PageBreak()] }));
  return paras;
}

/** 根据模块类型和数据生成简要摘要 */
export function generateChapterSummary(moduleId: string, data: Record<string, unknown> | null): string {
  if (!data) return '数据未采集，详见正文章节。';

  const dataKeys = Object.keys(data);
  const keyCount = dataKeys.length;

  switch (moduleId) {
    case 'overview':
      return `包含${keyCount}个数据维度，涵盖区域地下水基本概况。`;
    case 'water-quality':
      return `基于${keyCount}个数据段进行水质评价，采用单因子标准指数法。`;
    case 'groundwater-balance':
      return `涵盖补给排泄均衡分析，含${keyCount}个均衡要素。`;
    case 'hydrochemistry':
      return `包含Piper三线图分析和苏卡列夫分类，${keyCount}个水化学数据段。`;
    case 'geology':
      return `涵盖区域地质构造和含水层结构特征。`;
    case 'hydro-params':
      return `含${keyCount}个水文地质参数数据段。`;
    case 'environment':
      return `分析地面沉降、海水入侵等环境地质问题。`;
    case 'exploitation':
      return `统计开采量并分析趋势，含${keyCount}个数据段。`;
    default:
      return `包含${keyCount}个数据段的分析内容。`;
  }
}

/** 生成结论段落 */
export function buildConclusionParagraphs(
  template: ReportTemplate,
  chapters: ReportChapter[],
): Paragraph[] {
  const enabledChapters = chapters.filter(c => c.enabled);
  const moduleList = enabledChapters.map(c => c.title).join('、');

  return [
    new Paragraph({
      children: [new TextRun({ text: '结  论', bold: true, size: 36, font: 'SimHei' })],
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: `本报告对${moduleList}等方面进行了系统分析，主要结论如下：`,
        size: 24, font: 'SimSun',
      })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200, line: 360 },
    }),
    ...enabledChapters.map((ch, i) => new Paragraph({
      children: [new TextRun({
        text: `${i + 1}. ${ch.title}部分已完成分析评估，详见正文相关章节。`,
        size: 24, font: 'SimSun',
      })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 120, line: 360 },
    })),
    new Paragraph({
      children: [new TextRun({
        text: template.conclusionTemplate,
        size: 24, font: 'SimSun',
      })],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 200, after: 200, line: 360 },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

/** 生成参考文献段落 */
export function buildReferencesParagraphs(chapters: ReportChapter[]): Paragraph[] {
  const refs = [
    'GB/T 14848-2017《地下水质量标准》',
    'GB 50027-2001《供水水文地质勘察规范》',
    'HJ 610-2016《环境影响评价技术导则 地下水环境》',
    'HJ 254-2022《地下水环境状况调查评价工作指南》',
    '《河北省地下水管理条例》',
    '《河北省水资源公报》',
  ];

  // 根据模块添加特定参考文献
  const moduleIds = new Set(chapters.filter(c => c.enabled).map(c => c.moduleId));
  if (moduleIds.has('groundwater-balance')) {
    refs.push('《中国地下水资源 河北卷》(2005)');
  }
  if (moduleIds.has('water-source')) {
    refs.push('HJ 338-2018《饮用水水源保护区划分技术规范》');
  }
  if (moduleIds.has('environment')) {
    refs.push('DZ/T 0286-2015《地质灾害危险性评估规范》');
  }
  if (moduleIds.has('hydrochemistry')) {
    refs.push('《水文地球化学基础》(中国地质大学出版社)');
  }

  return [
    new Paragraph({
      children: [new TextRun({ text: '参考文献', bold: true, size: 36, font: 'SimHei' })],
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),
    ...refs.map((ref, i) => new Paragraph({
      children: [new TextRun({
        text: `[${i + 1}] ${ref}`,
        size: 22, font: 'SimSun',
      })],
      spacing: { after: 100, line: 320 },
    })),
  ];
}

// ============================================================
// 核心编排函数
// ============================================================

