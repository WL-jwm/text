/**
 * 水质评价报告 Excel 导出工具
 *
 * 使用 SheetJS 库生成多 Sheet xlsx 文件，包含 5 个 Sheet：
 *   1. 评价概览 — 各水样综合评定汇总
 *   2. 标准指数明细 — 逐因子 Pi 计算表（按水样分组）
 *   3. 超标汇总 — 仅超标因子行
 *   4. 苏卡列夫分类 — %ep + 水化学类型 + 分区号
 *   5. 评价标准 — GB/T 14848-2017 限值参考表
 */
import * as XLSX from 'xlsx';
import type { SampleResult, SukalovResult } from './waterQualityCalculator';
import { groundwaterQualityStandard } from '../data/waterQuality';

// ═══════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 尝试解析 Pi 字符串为数值，失败返回 null */
function parsePiToNumber(pi: string): number | null {
  if (!pi) return null;
  const num = parseFloat(pi);
  return isNaN(num) ? null : num;
}

/** 生成文件名 */
function buildFilename(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.xlsx`;
}

// ═══════════════════════════════════════════════════════
// Sheet 构建函数
// ═══════════════════════════════════════════════════════

/** Sheet 1：评价概览 */
function buildOverviewSheet(samples: SampleResult[]): XLSX.WorkSheet {
  const rows = samples.map(s => {
    // 计算最大 Pi 值
    let maxPi: string = '-';
    let maxPiNum = -1;
    for (const f of s.factors) {
      const num = parsePiToNumber(f.Pi);
      if (num !== null && num > maxPiNum) {
        maxPiNum = num;
        maxPi = f.Pi;
      }
    }

    return {
      '水样名称': s.sampleName,
      '综合评定类别': s.overallClassNum > 0 ? `${s.overallClass}类` : '-',
      '类别数字': s.overallClassNum,
      '参评因子数': s.factors.length,
      '超标因子数': s.exceededCount,
      '超标因子名称': s.exceededCount > 0
        ? s.exceededFactors.join('、')
        : '全部达标',
      '最大Pi值': maxPi,
      '评价结论': s.overallClassNum <= 3 ? '达标' : '超标',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 }, // 水样名称
    { wch: 12 }, // 综合评定类别
    { wch: 8 },  // 类别数字
    { wch: 10 }, // 参评因子数
    { wch: 10 }, // 超标因子数
    { wch: 36 }, // 超标因子名称
    { wch: 12 }, // 最大Pi值
    { wch: 10 }, // 评价结论
  ];
  return ws;
}

/** Sheet 2：标准指数明细 */
function buildDetailSheet(samples: SampleResult[]): XLSX.WorkSheet {
  const rows: Record<string, unknown>[] = [];

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];

    // 相邻水样之间插入空行分隔（第一个水样不插入）
    if (i > 0) {
      rows.push({});
    }

    for (const f of s.factors) {
      rows.push({
        '水样名称': s.sampleName,
        '评价因子': f.name,
        '单位': f.unit,
        '监测值(原始)': f.value,
        '监测值(数值)': f.numericValue,
        'S(III类)': f.standardIII,
        'Pi': f.Pi,
        '是否超标': f.isExceeded ? '是' : '否',
        '评定类别': f.classNum > 0 ? `${f.className}类` : '-',
        '类别数字': f.classNum,
        '未检出': f.isND ? '是' : '否',
        '检出限': f.detectionLimit,
      });
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 }, // 水样名称
    { wch: 18 }, // 评价因子
    { wch: 8 },  // 单位
    { wch: 18 }, // 监测值(原始)
    { wch: 12 }, // 监测值(数值)
    { wch: 10 }, // S(III类)
    { wch: 16 }, // Pi
    { wch: 8 },  // 是否超标
    { wch: 10 }, // 评定类别
    { wch: 8 },  // 类别数字
    { wch: 8 },  // 未检出
    { wch: 10 }, // 检出限
  ];
  return ws;
}

/** Sheet 3：超标汇总 */
function buildExceededSheet(samples: SampleResult[]): XLSX.WorkSheet {
  const exceededFactors: {
    sampleName: string;
    name: string;
    unit: string;
    value: string;
    standardIII: number | null;
    Pi: string;
    className: string;
    exceededMultiple: string;
  }[] = [];

  for (const s of samples) {
    for (const f of s.factors) {
      if (!f.isExceeded) continue;

      const piNum = parsePiToNumber(f.Pi);
      const multiple = piNum !== null && piNum > 1
        ? `${(piNum - 1).toFixed(2)}倍`
        : '-';

      exceededFactors.push({
        sampleName: s.sampleName,
        name: f.name,
        unit: f.unit,
        value: f.value,
        standardIII: f.standardIII,
        Pi: f.Pi,
        className: f.classNum > 0 ? `${f.className}类` : '-',
        exceededMultiple: multiple,
      });
    }
  }

  // 全部达标时写入备注行
  const rows = exceededFactors.length > 0
    ? exceededFactors.map(f => ({
        '水样名称': f.sampleName,
        '评价因子': f.name,
        '单位': f.unit,
        '监测值': f.value,
        'S(III类)': f.standardIII,
        'Pi': f.Pi,
        '评定类别': f.className,
        '超标倍数': f.exceededMultiple,
      }))
    : [{ '备注': '全部达标，无超标因子' }];

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 }, // 水样名称
    { wch: 18 }, // 评价因子
    { wch: 8 },  // 单位
    { wch: 18 }, // 监测值
    { wch: 10 }, // S(III类)
    { wch: 16 }, // Pi
    { wch: 10 }, // 评定类别
    { wch: 12 }, // 超标倍数
  ];
  return ws;
}

/** Sheet 4：苏卡列夫分类 */
function buildSukalovSheet(sukalov: SukalovResult | null): XLSX.WorkSheet {
  const ionLabelMap: Record<string, string> = {
    HCO3: 'HCO₃⁻',
    SO4: 'SO₄²⁻',
    Cl: 'Cl⁻',
    Ca: 'Ca²⁺',
    Mg: 'Mg²⁺',
    Na: 'Na⁺',
  };

  const rows = sukalov
    ? [{
        '水样名称': '水样1',
        '水化学类型': sukalov.type,
        '分区号': sukalov.zone > 0 ? sukalov.zone : '未分类',
        [`${ionLabelMap.HCO3} %ep`]: Number(sukalov.anionPercentages.HCO3.toFixed(1)),
        [`${ionLabelMap.SO4} %ep`]: Number(sukalov.anionPercentages.SO4.toFixed(1)),
        [`${ionLabelMap.Cl} %ep`]: Number(sukalov.anionPercentages.Cl.toFixed(1)),
        [`${ionLabelMap.Ca} %ep`]: Number(sukalov.cationPercentages.Ca.toFixed(1)),
        [`${ionLabelMap.Mg} %ep`]: Number(sukalov.cationPercentages.Mg.toFixed(1)),
        [`${ionLabelMap.Na} %ep`]: Number(sukalov.cationPercentages.Na.toFixed(1)),
        '阴离子优势': sukalov.anions.length > 0
          ? sukalov.anions.map(a => ionLabelMap[a] ?? a).join('·')
          : '无',
        '阳离子优势': sukalov.cations.length > 0
          ? sukalov.cations.map(c => ionLabelMap[c] ?? c).join('·')
          : '无',
      }]
    : [{ '备注': '未执行苏卡列夫分类' }];

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 }, // 水样名称
    { wch: 22 }, // 水化学类型
    { wch: 8 },  // 分区号
    { wch: 12 }, // HCO3 %ep
    { wch: 12 }, // SO4 %ep
    { wch: 12 }, // Cl %ep
    { wch: 12 }, // Ca %ep
    { wch: 12 }, // Mg %ep
    { wch: 12 }, // Na %ep
    { wch: 16 }, // 阴离子优势
    { wch: 16 }, // 阳离子优势
  ];
  return ws;
}

/** Sheet 5：评价标准 */
function buildStandardSheet(): XLSX.WorkSheet {
  const factors = groundwaterQualityStandard.evaluationFactors as {
    name: string;
    unit: string;
    I: string;
    II: string;
    III: string;
    IV: string;
    V: string;
  }[];

  const rows = factors.map(f => ({
    '评价因子': f.name,
    '单位': f.unit,
    'I类': f.I,
    'II类': f.II,
    'III类': f.III,
    'IV类': f.IV,
    'V类': f.V,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 18 }, // 评价因子
    { wch: 8 },  // 单位
    { wch: 14 }, // I类
    { wch: 14 }, // II类
    { wch: 14 }, // III类
    { wch: 14 }, // IV类
    { wch: 14 }, // V类
  ];
  return ws;
}

// ═══════════════════════════════════════════════════════
// 主导出函数
// ═══════════════════════════════════════════════════════

/**
 * 导出水质评价结果为 Excel 文件
 *
 * @param samples   标准指数法评价结果数组（可为空数组）
 * @param sukalov   苏卡列夫分类结果（可为 null）
 * @param filename  文件名前缀，默认 "水质评价报告"
 */
export function exportWaterQualityReport(
  samples: SampleResult[],
  sukalov: SukalovResult | null,
  filename?: string,
): void {
  const wb = XLSX.utils.book_new();

  const ws1 = buildOverviewSheet(samples);
  XLSX.utils.book_append_sheet(wb, ws1, '评价概览');

  const ws2 = buildDetailSheet(samples);
  XLSX.utils.book_append_sheet(wb, ws2, '标准指数明细');

  const ws3 = buildExceededSheet(samples);
  XLSX.utils.book_append_sheet(wb, ws3, '超标汇总');

  const ws4 = buildSukalovSheet(sukalov);
  XLSX.utils.book_append_sheet(wb, ws4, '苏卡列夫分类');

  const ws5 = buildStandardSheet();
  XLSX.utils.book_append_sheet(wb, ws5, '评价标准');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  downloadBlob(blob, buildFilename(filename ?? '水质评价报告'));
}
