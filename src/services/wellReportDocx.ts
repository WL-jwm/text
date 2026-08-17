/**
 * Q-03 优化版 — Word 报告生成器
 * 同步 PDF 样式：专业封面+摘要卡片+含水层中文名+表格着色+页脚说明
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
// 配色方案（与 PDF 统一）
// ============================================================
const COLORS = {
  primary: '#1a3a5c',
  accent: '#06b6d4',
  text: '#333333',
  muted: '#666666',
  light: '#94a3b8',
  headerBg: '#2c3e50',
  headerText: '#ffffff',
  rowAlt: '#f5f7fa',
  normal: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  stale: '#9ca3af',
};

const FONT = 'Microsoft YaHei';

// ============================================================
// 辅助函数
// ============================================================

function titleRun(text: string, color = COLORS.primary, size = 28, bold = true): TextRun {
  return new TextRun({ text, bold, size, color, font: FONT });
}

function subtitleRun(text: string, color = COLORS.muted, size = 12): TextRun {
  return new TextRun({ text, bold: false, size, color, font: FONT });
}

function bodyRun(text: string, color = COLORS.text, size = 10.5, bold = false): TextRun {
  return new TextRun({ text, bold, size, color, font: FONT });
}

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 18, color: COLORS.primary, font: FONT })],
  });
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    indent: { left: 180 },
    children: [
      new TextRun({ text: '▎', bold: true, size: 16, color: COLORS.accent, font: FONT }),
      new TextRun({ text, bold: true, size: 14, color: COLORS.primary, font: FONT }),
    ],
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
    indent: { left: 200 },
    children: [bodyRun(label, COLORS.light, 10), bodyRun(value, COLORS.text, 10, true)],
  });
}

// ============================================================
// 表格构建
// ============================================================

function makeCell(
  text: string,
  opts: { bold?: boolean; bg?: string; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; width?: number } = {},
): TableCell {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    shading: opts.bg ? { fill: opts.bg, type: 'clear' } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        alignment: opts.align ?? AlignmentType.LEFT,
        spacing: { after: 0 },
        children: [bodyRun(text, opts.color, 9, opts.bold)],
      }),
    ],
  });
}

function makeTable(headers: string[], rows: string[][]): Table {
  const colWidth = Math.floor(100 / headers.length);

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h =>
      makeCell(h, { bold: true, bg: COLORS.headerBg, color: COLORS.headerText, align: AlignmentType.CENTER, width: colWidth }),
    ),
  });

  const bodyRows = rows.map((row, i) => new TableRow({
    children: row.map((cell, j) => {
      // 状态列着色
      let color: string | undefined;
      const header = headers[j] ?? '';
      if (header === '状态' || header === '级别' || header === '严重度') {
        if (cell === '正常' || cell === '运行中') color = COLORS.normal;
        else if (cell === '预警') color = COLORS.warning;
        else if (cell === '严重' || cell === '超标') color = COLORS.critical;
        else if (cell === '过期') color = COLORS.stale;
      }
      return makeCell(cell, { color, bg: i % 2 === 1 ? COLORS.rowAlt : undefined, width: colWidth });
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
// 含水层中文名映射
// ============================================================
const AQUIFER_LABELS: Record<string, string> = {
  shallowPorous: '浅层孔隙水',
  deepPorous: '深层孔隙水',
  karst: '岩溶水',
  fracture: '裂隙水',
};

function aquiferLabel(type: string): string {
  return AQUIFER_LABELS[type] ?? type;
}


// ============================================================
// 报告生成
// ============================================================

export function buildWellReportDoc(data: WellReportData): Document {
  const children: (Paragraph | Table)[] = [];

  // ── 封面标题 ──
  children.push(
    new Paragraph({ spacing: { before: 800 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [titleRun('地下水监测井网分析报告', COLORS.primary, 28)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [bodyRun('──────────────────', COLORS.accent, 11)],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [subtitleRun(data.meta.unit, COLORS.muted, 12)],
    }),
  );

  // ── 报告信息卡片 ──
  children.push(sectionTitle('报告信息'));
  children.push(keyValueParagraph('报告编号：', data.meta.reportId));
  children.push(keyValueParagraph('生成时间：', formatGeneratedAt(data.meta.generatedAt)));
  children.push(keyValueParagraph('编制单位：', data.meta.unit));
  children.push(keyValueParagraph('评估日期：', data.summary.assessmentDate));

  // ── 一、报告摘要 ──
  children.push(heading('一、报告摘要'));
  children.push(bodyParagraph(
    `本次报告共统计监测井 ${data.summary.totalWells} 口，覆盖 ${data.summary.cities} 个城市、${data.summary.aquiferTypes} 类含水层。` +
    `其中运行中井 ${data.summary.activeWells} 口，实时数据覆盖率 ${data.summary.coverage}%，` +
    `告警 ${data.summary.alertCount} 条（严重 ${data.summary.criticalAlerts} 条）。`,
  ));

  // 关键指标表
  children.push(sectionTitle('关键指标'));
  children.push(
    makeTable(
      ['监测井总数', '覆盖城市', '运行井数', '含水层类型', '告警总数', '严重告警'],
      [[
        String(data.summary.totalWells),
        String(data.summary.cities),
        String(data.summary.activeWells),
        String(data.summary.aquiferTypes),
        String(data.summary.alertCount),
        String(data.summary.criticalAlerts),
      ]],
    ),
  );

  // ── 二、含水层与城市分布 ──
  children.push(heading('二、含水层与城市分布'));
  if (data.aquiferRows.length > 0) {
    children.push(sectionTitle('含水层分布'));
    children.push(
      makeTable(
        ['含水层类型', '井数', '平均井深(m)', '运行井数'],
        data.aquiferRows.map(r => [aquiferLabel(r.type), String(r.count), String(r.avgDepth), String(r.activeCount)]),
      ),
    );
  }
  if (data.cityRows.length > 0) {
    children.push(sectionTitle('城市分布'));
    children.push(
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
        ['监测通道', '总井数', '正常', '预警', '超标', '过期', '覆盖率'],
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
  children.push(heading('四、告警清单'));
  if (data.alertRows.length > 0) {
    children.push(
      makeTable(
        ['井名', '城市', '通道', '级别', '当前值', '告警详情'],
        data.alertRows.map(a => [a.wellName, a.city, a.channelLabel, a.severityLabel, a.valueText, a.detail]),
      ),
    );
  } else {
    children.push(bodyParagraph('本次报告期间无告警记录。'));
  }

  // ── 五、监测井明细 ──
  if (data.wellRows.length > 0) {
    children.push(heading('五、监测井明细'));
    children.push(
      makeTable(
        ['井名', '编号', '城市', '含水层', '井深(m)', '监测指标', '实时值', '状态'],
        data.wellRows.map(w => [
          w.name,
          w.id,
          w.city,
          aquiferLabel(w.aquiferLabel),
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
  children.push(bodyParagraph(''));
  children.push(bodyParagraph('数据来源：河北省地下水环境信息平台', { size: 9, color: COLORS.muted }));
  children.push(bodyParagraph('免责声明：本报告仅供参考，不构成专业法律意见。', { size: 9, color: COLORS.muted }));

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