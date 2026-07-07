/**
 * 地下水系统区划报告生成器
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('system-zoning', (data) => {
  const sections: ReportConfig['sections'] = [];
  const zones = data.systemZones as Array<Record<string, unknown>>;
  const subZones = data.subZones as Array<Record<string, unknown>>;

  sections.push({
    title: '地下水系统一级分区',
    level: 1,
    content: [
      ...buildParagraphs([
        `河北省共划分 ${zones.length} 个地下水系统一级区，总面积约 18.77 万 km²。`,
        '分区依据：以地表水系流域为基础，结合地质构造、水文地质条件和地下水流动系统特征，将全省划分为内陆河、辽河-大凌河、潮白河-蓟运河、滦河、冀东沿海、永定河、大清河、子牙河、漳卫河、古黄河共10个地下水系统区。',
      ]),
      ...buildTable(
        [{ header: '代号' }, { header: '名称' }, { header: '面积(km²)' }, { header: '占比(%)' }, { header: '含水层类型' }, { header: '主要特征' }],
        zones.map(z => [String(z.code), String(z.name), String(z.area), String(z.proportion), String(z.aquiferType), String(z.features)]),
        { caption: '表1 河北省地下水系统一级分区' }
      ),
    ],
  });

  // 子区统计
  const subCount = subZones?.length || 0;
  const subAreaCount = subZones?.filter(s => String(s.type) === '子区').length || 0;
  const cellCount = subZones?.filter(s => String(s.type) === '小区').length || 0;

  sections.push({
    title: '二级分区（子区与小区）',
    level: 1,
    content: [
      ...buildParagraphs([
        `全省共划分 ${subCount} 个二级分区，其中子区 ${subAreaCount} 个、小区 ${cellCount} 个。`,
        '子区以次级流域和地质构造单元为边界，小区在子区内进一步按水文地质条件差异划分。',
      ]),
      ...buildTable(
        [{ header: '所属一级区' }, { header: '序号' }, { header: '名称' }, { header: '类型' }],
        subZones.map(s => [String(s.parentCode), String(s.seq), String(s.name), String(s.type)]),
        { caption: '表2 地下水系统二级分区' }
      ),
    ],
  });

  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '河北省地下水系统区划以地表水系流域为基础，兼顾地质构造和水文地质条件，形成"10个一级区—子区—小区"三级划分体系。滦河（IV）、子牙河（VIII）、大清河（VII）为三大主要系统区，合计面积占比54.4%。该区划是河北省地下水资源评价、开发利用和保护的基础框架。',
    ]),
  });

  return { title: '河北省地下水系统区划报告', subtitle: '基于1999年基础文献第五章', sections, showDate: true };
});
