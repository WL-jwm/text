/**
 * reportGenerator — Word 报告生成器
 * 
 * 基于 docx 库，支持多类型报告生成。
 * 数据通过 useReportData 预采集缓存传入，生成过程不阻塞 UI。
 */
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType,  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';

// ============================================================
// 类型定义
// ============================================================

export interface ReportSection {
  title: string;
  level: 1 | 2 | 3;
  content: (Paragraph | Table)[];
}

export interface ReportConfig {
  title: string;
  subtitle?: string;
  sections: ReportSection[];
  /** 封面是否显示日期 */
  showDate?: boolean;
}

// ============================================================
// 通用样式
// ============================================================

const STYLES = {
  title: {
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  },
  heading1: {
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 200 },
  },
  heading2: {
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 150 },
  },
  body: {
    size: 24, // 12pt in half-points
    font: 'SimSun',
  },
  tableHeader: {
    bold: true,
    size: 20,
    font: 'SimSun',
  },
  tableCell: {
    size: 20,
    font: 'SimSun',
  },
};

// ============================================================
// 表格构建工具
// ============================================================

interface TableColumn {
  header: string;
  width?: number; // 百分比
  align?: 'left' | 'center' | 'right';
}

/**
 * 构建 Word 表格
 */
export function buildTable(
  columns: TableColumn[],
  rows: string[][],
  options?: { caption?: string }
): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [];

  // 表标题
  if (options?.caption) {
    result.push(
      new Paragraph({
        children: [new TextRun({ text: options.caption, ...STYLES.tableHeader })],
        spacing: { before: 200, after: 100 },
      })
    );
  }


  // 构建表格行
  const tableRows: TableRow[] = [];

  // 表头行
  tableRows.push(
    new TableRow({
      children: columns.map(col =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: col.header, bold: true, size: 20, font: 'SimSun' })],
            alignment: AlignmentType.CENTER,
          })],
          shading: { fill: 'E8F5E9' },
        })
      ),
    })
  );

  // 数据行
  rows.forEach(rowData => {
    tableRows.push(
      new TableRow({
        children: rowData.map((cell, i) =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: cell, size: 20, font: 'SimSun' })],
              alignment: columns[i]?.align === 'right' ? AlignmentType.RIGHT
                : columns[i]?.align === 'left' ? AlignmentType.LEFT
                : AlignmentType.CENTER,
            })],
          })
        ),
      })
    );
  });

  result.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  return result;
}

/**
 * 构建正文段落
 */
export function buildParagraph(text: string, options?: { bold?: boolean; indent?: boolean }): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options?.bold,
        size: 24,
        font: 'SimSun',
      }),
    ],
    spacing: { after: 100, line: 360 }, // 1.5 倍行距
    indent: options?.indent ? { firstLine: 480 } : undefined,
  });
}

/**
 * 构建多段正文
 */
export function buildParagraphs(texts: string[]): Paragraph[] {
  return texts.map(t => buildParagraph(t, { indent: true }));
}

// ============================================================
// 报告生成器
// ============================================================

/**
 * 根据配置生成 Word 文档
 */
export function createReport(config: ReportConfig): Document {
  const children: (Paragraph | Table)[] = [];

  // 封面
  children.push(new Paragraph({ spacing: { before: 3000 } }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: config.title, bold: true, size: 44, font: 'SimHei' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  if (config.subtitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: config.subtitle, size: 28, font: 'SimSun', color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  if (config.showDate !== false) {
    const now = new Date();
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `生成日期：${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`, size: 24, font: 'SimSun', color: '999999' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: '河北省地下水环境信息平台', size: 24, font: 'SimSun', color: '999999' })],
      alignment: AlignmentType.CENTER,
    })
  );

  children.push(new Paragraph({ children: [], spacing: { before: 2000 } }));
  children.push(new Paragraph({ children: [], spacing: { before: 2000 } }));

  // 各章节
  for (const section of config.sections) {
    // 章节标题
    children.push(
      new Paragraph({
        children: [new TextRun({
          text: section.title,
          bold: true,
          size: section.level === 1 ? 32 : section.level === 2 ? 28 : 24,
          font: 'SimHei',
        })],
        heading: section.level === 1 ? HeadingLevel.HEADING_1
          : section.level === 2 ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_3,
        spacing: { before: section.level === 1 ? 400 : 200, after: 200 },
      })
    );

    // 章节内容
    for (const item of section.content) {
      children.push(item);
    }
  }

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch
        },
      },
      children,
    }],
  });
}

/**
 * 生成并下载报告
 */
export async function generateAndDownload(
  config: ReportConfig,
  filename?: string
): Promise<void> {
  const doc = createReport(config);
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([new Uint8Array(buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  saveAs(blob, filename || `${config.title}.docx`);
}

// ============================================================
// 报告类型注册表
// ============================================================

type ReportGenerator = (data: Record<string, unknown>) => ReportConfig;

const generators: Record<string, ReportGenerator> = {};

/**
 * 注册报告生成器
 */
export function registerReportGenerator(type: string, generator: ReportGenerator) {
  generators[type] = generator;
}

/**
 * 获取已注册的报告类型
 */
export function getRegisteredTypes(): string[] {
  return Object.keys(generators);
}

/**
 * 生成并下载指定类型的报告
 */
export function getReportConfig(
  type: string,
  data: Record<string, unknown>,
): ReportConfig | null {
  const generator = generators[type];
  if (!generator) return null;
  return generator(data);
}

export async function generateTypedReport(
  type: string,
  data: Record<string, unknown>,
  onProgress?: (pct: number) => void
): Promise<void> {
  const generator = generators[type];
  if (!generator) {
    throw new Error(`未注册的报告类型: ${type}`);
  }

  onProgress?.(10);

  // 异步生成，让出主线程
  const config = await new Promise<ReportConfig>(resolve => {
    setTimeout(() => resolve(generator(data)), 0);
  });

  onProgress?.(50);

  await generateAndDownload(config, `${type}-报告.docx`);

  onProgress?.(100);
}
