/**
 * jspdf-autotable 类型扩展
 *
 * jspdf-autotable 以插件方式向 jsPDF 实例注入 autoTable 方法（运行时经
 * applyPlugin 生效），但官方类型定义未扩展 jsPDF 接口。此文件通过
 * declare module 补齐 autoTable / lastAutoTable 两个成员，
 * 使 wellReportPdf.ts 等报告生成器能以强类型方式调用，消除 (doc as any)。
 */
import type { UserOptions } from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    /** 绘制自动表格（jspdf-autotable 插件方法） */
    autoTable(options: UserOptions): void;
    /** 最近一次绘制的表格，用于取得结尾纵坐标 */
    lastAutoTable: { finalY: number };
  }
}

export {};
