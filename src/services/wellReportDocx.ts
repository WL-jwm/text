/**
 * H-03 报告自动生成 — Word 报告生成器
 *
 * 基于报告数据模型生成 .docx 报告，支持在浏览器端下载。
 * 使用 docx 库（v9.x）+ file-saver。
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageOrientation,
  VerticalAlign,
} from 'docx';
import { saveAs } from 'file-saver';
import type { WellReportData } from './wellReport';
import { formatGeneratedAt, getThresholdNote } from './wellReport';

// ============================================================
// 样式常量
// ============================================================

const COLORS = {
  primary: '#1a3a5c',
  accent: '#2c5f8a',
  text: '#333333',
  muted: '#666666',
  headerBg: '#e8f0f8',
  normal: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  stale: '#9ca3af',
};

const FONT = 'Microsoft YaHei';

// ============================================================
// 辅助函数
// ============================================================

function titleRun(text: string, color = COLORS.primary, size = 22, bold = true): TextRun {
  return new TextRun({ text, bold, size, color, font: FONT });
}

function headingRun(text: string, color = COLORS.primary, size = 16): TextRun {
  return new TextRun({ text, bold: true, size, color, font: FONT });
}

function bodyRun(text: string, color = COLORS.text, size = 10.5, bold = false): TextRun {
  return new TextRun({ text, bold, size, color, font: FONT });
}

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    children: [headingRun(text)],
  });
}

function subHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 100 },
    children: [new TextRun({ text, bold: true, size: 13, color: COLORS.accent, font: FONT })],
  });
}

function bodyParagraph(text: string, opts: { bold?: boolean; color?: string; size?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [bodyRun(text, opts.color, opts.size, opts.bold)],
  });
}

function keyValueParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [bodyRun(label, COLORS.muted, 10), bodyRun(value, COLORS.text, 10, true)],
  });
}

function makeCell(text: string, opts: { bold?: boolean; bg?: string; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}): TableCell {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    shading: opts.bg ? { fill: opts.bg, type: 'clear' } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: opts.align ?? AlignmentType.LEFT,
        children: [bodyRun(text, opts.color, 9, opts.bold)],
      }),
    ],
  });
}

function makeTable(headers: string[], rows: string[][]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => makeCell(h, { bold: true, bg: COLORS.headerBg, color: COLORS.primary })),
  });

  const bodyRows = rows.map((row, i) => new TableRow({
    children: row.map((cell, j) => {
      // 状态列着色
      let color: string | undefined;
      if (headers[j] === '状态' || headers[j] === '级别') {
        if (cell === '正常' || cell === '运行中') color = COLORS.normal;
        else if (cell === '预警') color = COLORS.warning;
        else if (cell === '超标') color = COLORS.critical;
        else if (cell === '过期') color = COLORS.stale;
      }
      return makeCell(cell, { color, bg: i % 2 === 1 ? '#f7fafc' : undefined });
    }),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: '#cccccc' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '#cccccc' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '#cccccc' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '#cccccc' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: '#dddddd' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: '#dddddd' },
    },
  });
}

// ============================================================
// 报告生成
// ============================================================

export function buildWellReportDoc(data: WellReportData): Document {
  const children: (Paragraph | Table)[] = [];

  // ── 封面标题 ──
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 200 },
      children: [titleRun(data.meta.title, COLORS.primary, 28)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [bodyRun(data.meta.unit, COLORS.muted, 12)],
    }),
  );

  // ── 报告信息 ──
  children.push(
    subHeading('报告信息'),
    keyValueParagraph('报告期间：', data.meta.period),
    keyValueParagraph('生成时间：', formatGeneratedAt(data.meta.generatedAt)),
    keyValueParagraph('编制单位：', data.meta.unit),
  );

  // ── 一、监测井网总览 ──
  children.push(heading('一、监测井网总览'));
  children.push(bodyParagraph(
    `本次报告共统计监测井 ${data.summary.totalWells} 口，覆盖 ${data.summary.cities} 个城市、${data.summary.aquiferTypes} 类含水层。其中运行中井 ${data.summary.activeWells} 口，实时数据覆盖率 ${data.summary.coverage}%，异常井 ${data.summary.abnormalCount} 口（其中超标 ${data.summary.criticalCount} 口）。`,
  ));

  // 摘要统计表
  children.push(
    subHeading('关键指标'),
    makeTable(
      ['监测井总数', '覆盖城市', '运行井数', '含水层类型', '数据覆盖率', '异常井'],
      [[
        String(data.summary.totalWells),
        String(data.summary.cities),
        String(data.summary.activeWells),
        String(data.summary.aquiferTypes),
        `${data.summary.coverage}%`,
        String(data.summary.abnormalCount),
      ]],
    ),
  );

  // ── 二、含水层与城市分布 ──
  children.push(heading('二、含水层与城市分布'));
  if (data.aquiferRows.length > 0) {
    children.push(
      subHeading('含水层分布'),
      makeTable(
        ['含水层', '井数', '平均井深(m)', '运行井'],
        data.aquiferRows.map(r => [r.label, String(r.count), String(r.avgDepth), String(r.activeCount)]),
      ),
    );
  }
  if (data.cityRows.length > 0) {
    children.push(
      subHeading('城市分布'),
      makeTable(
        ['城市', '井数', '含水层类型'],
        data.cityRows.map(r => [r.city, String(r.count), r.aquiferDesc]),
      ),
    );
  }

  // ── 三、实时监测状态 ──
  if (data.realtimeRows.length > 0) {
    children.push(heading('三、实时监测状态'));
    children.push(
      makeTable(
        ['通道', '井数', '正常', '预警', '超标', '过期', '覆盖率'],
        data.realtimeRows.map(r => [
          r.label,
          String(r.total),
          String(r.normal),
          String(r.warning),
          String(r.critical),
          String(r.stale),
          `${r.coverage}%`,
        ]),
      ),
    );
  }

  // ── 四、告警清单 ──
  if (data.alertRows.length > 0) {
    children.push(heading('四、告警清单'));
    children.push(
      makeTable(
        ['井名', '城市', '通道', '级别', '当前值', '告警详情'],
        data.alertRows.map(a => [a.wellName, a.city, a.channelLabel, a.severityLabel, a.valueText, a.detail]),
      ),
    );
  } else {
    children.push(heading('四、告警清单'));
    children.push(bodyParagraph('本次报告期间无告警记录。'));
  }

  // ── 五、井详情表 ──
  if (data.wellRows.length > 0) {
    children.push(heading('五、监测井明细'));
    children.push(
      makeTable(
        ['井名', '编号', '城市', '含水层', '井深(m)', '监测指标', '实时值', '状态'],
        data.wellRows.map(w => [
          w.name,
          w.id,
          w.city,
          w.aquiferLabel,
          String(w.depth),
          w.indicatorLabel,
          w.realtimeValue,
          w.statusLabel,
        ]),
      ),
    );
  }

  // ── 附注 ──
  children.push(heading('附注'));
  children.push(bodyParagraph('指标阈值说明：', { bold: true }));
  const notes = getThresholdNote().split('\n');
  notes.forEach(n => children.push(bodyParagraph(n, { size: 9, color: COLORS.muted })));

  return new Document({
    creator: data.meta.unit,
    title: data.meta.title,
    description: '地下水监测井网综合分析报告',
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 21 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 },
          },
        },
        children,
      },
    ],
  });
}

/**
 * 生成并下载报告
 */
export async function downloadWellReport(
  data: WellReportData,
): Promise<{ ok: boolean; filename: string; message: string }> {
  try {
    const doc = buildWellReportDoc(data);
    const blob = await Packer.toBlob(doc);
    const filename = `${data.meta.title}-${data.meta.period}.docx`;
    saveAs(blob, filename);
    return { ok: true, filename, message: '报告已生成并下载' };
  } catch (err) {
    return {
      ok: false,
      filename: '',
      message: err instanceof Error ? err.message : String(err),
    };
  }
}