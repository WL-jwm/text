/**
 * 报告合成器 — composeReport 主流程
 * 章节构建见 reportComposerBuilders，类型见 reportComposerTypes
 */

import { saveAs } from 'file-saver';
import { Packer, Paragraph, PageBreak, type Table } from 'docx';
import { loadReportGenerator } from '../services/reportGeneratorLoader';
import { createReport, buildTable, buildParagraph, getReportConfig, type ReportSection, type ReportConfig } from '../services/reportGenerator';
import type { ReportChapter } from '../store/reportGeneratorStore';
import { buildCoverParagraphs, buildTocParagraphs, buildSummaryParagraphs, buildConclusionParagraphs, buildReferencesParagraphs, getCachedData, numberToChinese } from './reportComposerBuilders';
import type { ComposeResult, ComposeContext } from './reportComposerTypes';

export type { ComposeResult, ComposeContext } from './reportComposerTypes';

export async function composeReport(
  ctx: ComposeContext,
  onProgress?: (pct: number) => void,
): Promise<ComposeResult> {
  const { meta, template, chapters, filename } = ctx;
  const enabledChapters = chapters.filter(c => c.enabled);
  const chapterSummary: ComposeResult['chapterSummary'] = [];

  try {
    // 收集各章节数据和报告配置
    const chapterConfigs: ReportSection[][] = [];
    const chapterDataList: Array<{ title: string; data: Record<string, unknown> | null }> = [];

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      chapterDataList.push({ title: ch.title, data: null });

      if (!ch.enabled) {
        chapterSummary.push({ title: ch.title, sectionCount: 0, hasData: false });
        continue;
      }

      const data = getCachedData(ch.moduleId);
      chapterDataList[i].data = data;

      if (!data) {
        chapterSummary.push({ title: ch.title, sectionCount: 0, hasData: false });
        continue;
      }

      // 动态加载并获取报告配置
      try {
        await loadReportGenerator(ch.reportType);
        const config = getReportConfig(ch.reportType, data);
        if (config?.sections && config.sections.length > 0) {
          chapterConfigs.push(config.sections);
          chapterSummary.push({ title: ch.title, sectionCount: config.sections.length, hasData: true });
        } else {
          // 回退到简易章节
          const simpleSection = buildFallbackSection(ch, data);
          chapterConfigs.push([simpleSection]);
          chapterSummary.push({ title: ch.title, sectionCount: 1, hasData: true });
        }
      } catch {
        const simpleSection = buildFallbackSection(ch, data);
        chapterConfigs.push([simpleSection]);
        chapterSummary.push({ title: ch.title, sectionCount: 1, hasData: true });
      }

      onProgress?.(Math.round(((i + 1) / chapters.length) * 60));
    }

    // 构建完整报告
    const allSections: ReportSection[] = [];

    // 自动章节：封面
    if (template.autoChapters.includes('cover')) {
      allSections.push({
        title: '封面',
        level: 1,
        content: buildCoverParagraphs(meta),
      });
    }

    // 自动章节：目录
    if (template.autoChapters.includes('toc')) {
      allSections.push({
        title: '目录',
        level: 1,
        content: buildTocParagraphs(enabledChapters),
      });
    }

    // 自动章节：摘要
    if (template.autoChapters.includes('summary')) {
      allSections.push({
        title: '摘要',
        level: 1,
        content: buildSummaryParagraphs(meta, chapters, chapterDataList),
      });
    }

    // 正文章节（编号）
    let chapterNum = 0;
    let configIdx = 0;
    for (const ch of chapters) {
      if (!ch.enabled) continue;
      chapterNum++;
      const configSections = chapterConfigs[configIdx] ?? [];
      configIdx++;

      // 为每个章节添加编号标题
      const chapterTitle = `第${numberToChinese(chapterNum)}章  ${ch.title}`;
      for (const section of configSections) {
        allSections.push({
          ...section,
          title: section.title === ch.title ? chapterTitle : `${chapterNum}.${section.title}`,
        });
      }

      // 章节间分页
      allSections.push({
        title: '',
        level: 1,
        content: [new Paragraph({ children: [new PageBreak()] })],
      });
    }

    // 自动章节：结论
    if (template.autoChapters.includes('conclusion')) {
      allSections.push({
        title: '结论',
        level: 1,
        content: buildConclusionParagraphs(template, chapters),
      });
    }

    // 自动章节：参考文献
    if (template.autoChapters.includes('references')) {
      allSections.push({
        title: '参考文献',
        level: 1,
        content: buildReferencesParagraphs(chapters),
      });
    }

    onProgress?.(80);

    // 生成 Word 文档
    const reportConfig: ReportConfig = {
      title: meta.title,
      subtitle: meta.subtitle || undefined,
      sections: allSections,
      showDate: false, // 封面已包含日期
    };

    const doc = createReport(reportConfig);
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([new Uint8Array(buffer)], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    saveAs(blob, filename);

    onProgress?.(100);

    return {
      success: true,
      filename,
      fileSize: blob.size,
      chapterSummary,
    };
  } catch (err) {
    return {
      success: false,
      filename,
      fileSize: 0,
      errorMsg: err instanceof Error ? err.message : '报告生成失败',
      chapterSummary,
    };
  }
}

// ============================================================
// 辅助函数
// ============================================================

/** 数字转中文（1-99） */

function buildFallbackSection(ch: ReportChapter, data: Record<string, unknown>): ReportSection {
  const content: (Paragraph | ReturnType<typeof buildTable>[number])[] = [
    buildParagraph(`模块：${ch.moduleLabel}`),
    buildParagraph(`本节数据来源于${ch.moduleLabel}模块的计算结果。`),
  ];

  const dataKeys = Object.keys(data);
  if (dataKeys.length > 0) {
    const firstKey = dataKeys[0];
    const firstVal = data[firstKey];

    if (Array.isArray(firstVal) && firstVal.length > 0 && typeof firstVal[0] === 'object') {
      const cols = Object.keys(firstVal[0] as object).slice(0, 8);
      const rows: string[][] = [];
      for (const item of firstVal.slice(0, 20)) {
        const obj = item as Record<string, unknown>;
        rows.push(cols.map(c => String(obj[c] ?? '')));
      }
      content.push(...buildTable(
        cols.map(c => ({ header: c })),
        rows,
        { caption: `${ch.title}数据表` },
      ));
    } else {
      for (const key of dataKeys.slice(0, 10)) {
        const val = data[key];
        const valStr = typeof val === 'object' ? JSON.stringify(val).substring(0, 200) : String(val);
        content.push(buildParagraph(`${key}: ${valStr}`));
      }
    }
  }

  return { title: ch.title, level: 1, content: content as (Paragraph | Table)[] };
}

// 为类型兼容性导入Table
