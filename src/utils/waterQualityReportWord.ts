/**
 * water quality report word generator
 * based on reportGenerator.ts
 */
import {
  type ReportConfig,
  type ReportSection,
  buildTable,
  buildParagraph,
  buildParagraphs,
  generateAndDownload,
} from '../services/reportGenerator';
import type { SampleResult, SukalovResult } from './waterQualityCalculator';

// ═══════════════════════════════════════════════════════
// Section builders
// ═══════════════════════════════════════════════════════

function buildMethodSection(): ReportSection {
  return {
    title: '\u4e00\u3001\u8bc4\u4ef7\u6807\u51c6\u4e0e\u65b9\u6cd5',
    level: 1,
    content: [
      ...buildParagraphs([
        '\u5730\u4e0b\u6c34\u8d28\u91cf\u8bc4\u4ef7\u6267\u884c\u300a\u5730\u4e0b\u6c34\u8d28\u91cf\u6807\u51c6\u300b(GB/T 14848-2017)\uff0c\u91c7\u7528\u5355\u56e0\u5b50\u6807\u51c6\u6307\u6570\u6cd5\u8fdb\u884c\u8bc4\u4ef7\u3002',
        '\u5355\u56e0\u5b50\u6807\u51c6\u6307\u6570\u6cd5\u7684\u8bc4\u4ef7\u539f\u5219\u4e3a\uff1a\u5bf9\u6bcf\u4e2a\u8bc4\u4ef7\u56e0\u5b50\u5206\u522b\u8ba1\u7b97\u6807\u51c6\u6307\u6570Pi\uff0c\u4ee5\u6240\u6709\u53c2\u8bc4\u56e0\u5b50\u4e2d\u7684\u6700\u5dee\u7c7b\u522b\u4f5c\u4e3a\u8be5\u6c34\u6837\u7684\u7efc\u5408\u8bc4\u5b9a\u7c7b\u522b\u3002\u5f53\u67d0\u4e00\u56e0\u5b50\u7684\u6807\u51c6\u6307\u6570Pi\u5927\u4e8e1\u65f6\uff0c\u5224\u5b9a\u8be5\u56e0\u5b50\u8d85\u6807\u3002',
        'pH\u6807\u51c6\u6307\u6570\u91c7\u7528\u7279\u6b8a\u516c\u5f0f\u8ba1\u7b97\uff1a\u5f53pH\u503c\u57286.5~8.5\u8303\u56f4\u5185\u65f6\uff0cPi=0\uff1b\u5f53pH\u503c\u5c0f\u4e8e6.5\u65f6\uff0cPpH=(7.0-pHi)/(7.0-6.5)\uff1b\u5f53pH\u503c\u5927\u4e8e8.5\u65f6\uff0cPpH=(pHi-7.0)/(8.5-7.0)\u3002',
        '\u672a\u68c0\u51fa\u6570\u636e\u5904\u7406\uff1a\u5f53\u76d1\u6d4b\u7ed3\u679c\u4e3a\u201c\u672a\u68c0\u51fa\u201d\u65f6\uff0c\u4ee5\u68c0\u51fa\u9650\u768450%\u53c2\u4e0e\u6807\u51c6\u6307\u6570\u8ba1\u7b97\u3002',
      ]),
    ],
  };
}

function buildOverviewSubSection(samples: SampleResult[]): ReportSection {
  const columns = [
    { header: '\u6c34\u6837\u540d\u79f0', width: 20 },
    { header: '\u53c2\u8bc4\u56e0\u5b50\u6570', width: 15 },
    { header: '\u8d85\u6807\u56e0\u5b50\u6570', width: 15 },
    { header: '\u8d85\u6807\u56e0\u5b50', width: 25 },
    { header: '\u7efc\u5408\u8bc4\u5b9a', width: 15 },
    { header: '\u8bc4\u4ef7\u7ed3\u8bba', width: 10 },
  ];
  const rows = samples.map(s => [
    s.sampleName,
    String(s.factors.length),
    String(s.exceededCount),
    s.exceededCount > 0 ? s.exceededFactors.join('\u3001') : '\u65e0',
    s.overallClassNum > 0 ? `${s.overallClass}\u7c7b` : '-',
    s.overallClassNum <= 3 ? '\u8fbe\u6807' : '\u8d85\u6807',
  ]);
  return {
    title: '2.1 \u7efc\u5408\u8bc4\u5b9a\u6c47\u603b',
    level: 2,
    content: [
      buildParagraph(
        `\u672c\u6b21\u5171\u5bf9${samples.length}\u4e2a\u6c34\u6837\u8fdb\u884c\u4e86\u6c34\u8d28\u8bc4\u4ef7\uff0c\u8bc4\u4ef7\u56e0\u5b50\u6db5\u76d6\u4e00\u822c\u5316\u5b66\u6307\u6807\u548c\u6bd2\u7406\u5b66\u6307\u6807\u3002\u5404\u6c34\u6837\u7efc\u5408\u8bc4\u5b9a\u7ed3\u679c\u89c1\u88681\u3002`,
        { indent: true },
      ),
      ...buildTable(columns, rows, { caption: '\u88681 \u6c34\u8d28\u8bc4\u4ef7\u7efc\u5408\u8bc4\u5b9a\u7ed3\u679c' }),
    ],
  };
}

function buildDetailSubSections(samples: SampleResult[]): ReportSection[] {
  const sections: ReportSection[] = [];
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const tableNum = i + 2;
    const columns = [
      { header: '\u8bc4\u4ef7\u56e0\u5b50', width: 16 },
      { header: '\u5355\u4f4d', width: 10 },
      { header: '\u76d1\u6d4b\u503c', width: 14 },
      { header: 'III\u7c7b\u9650\u503c', width: 12 },
      { header: 'Pi', width: 10 },
      { header: '\u662f\u5426\u8d85\u6807', width: 12 },
      { header: '\u8bc4\u5b9a\u7c7b\u522b', width: 12 },
      { header: '\u5907\u6ce8', width: 14 },
    ];
    const rows = s.factors.map(f => [
      f.name,
      f.unit,
      f.isND && f.detectionLimit ? `\u672a\u68c0\u51fa <${f.detectionLimit}` : f.value,
      f.standardIII !== null ? String(f.standardIII) : '-',
      f.Pi,
      f.isExceeded ? '\u662f' : '\u5426',
      f.classNum > 0 ? `${f.className}\u7c7b` : '-',
      f.isND ? '\u4ee5\u68c0\u51fa\u965050%\u8ba1' : '',
    ]);
    sections.push({
      title: `2.2.${i + 1} ${s.sampleName}\u6807\u51c6\u6307\u6570\u660e\u7ec6`,
      level: 2,
      content: [
        ...buildTable(columns, rows, { caption: `\u8868${tableNum} ${s.sampleName}\u6807\u51c6\u6307\u6570\u660e\u7ec6` }),
      ],
    });
  }
  return sections;
}

function buildExceededSection(samples: SampleResult[]): ReportSection {
  const allExceeded: { sampleName: string; factor: SampleResult['factors'][number] }[] = [];
  for (const s of samples) {
    for (const f of s.factors) {
      if (f.isExceeded) {
        allExceeded.push({ sampleName: s.sampleName, factor: f });
      }
    }
  }
  if (allExceeded.length === 0) {
    return {
      title: '2.3 \u8d85\u6807\u56e0\u5b50\u5206\u6790',
      level: 2,
      content: [
        buildParagraph(
          '\u5404\u6c34\u6837\u6240\u6709\u8bc4\u4ef7\u56e0\u5b50\u5747\u6ee1\u8db3\u300a\u5730\u4e0b\u6c34\u8d28\u91cf\u6807\u51c6\u300b(GB/T 14848-2017)III\u7c7b\u6807\u51c6\u8981\u6c42\uff0c\u65e0\u8d85\u6807\u56e0\u5b50\u3002',
          { indent: true },
        ),
      ],
    };
  }
  const columns = [
    { header: '\u6c34\u6837\u540d\u79f0', width: 18 },
    { header: '\u8d85\u6807\u56e0\u5b50', width: 16 },
    { header: '\u5355\u4f4d', width: 10 },
    { header: '\u76d1\u6d4b\u503c', width: 14 },
    { header: 'III\u7c7b\u9650\u503c', width: 12 },
    { header: 'Pi', width: 10 },
    { header: '\u8bc4\u5b9a\u7c7b\u522b', width: 12 },
  ];
  const rows = allExceeded.map(e => [
    e.sampleName,
    e.factor.name,
    e.factor.unit,
    e.factor.value,
    e.factor.standardIII !== null ? String(e.factor.standardIII) : '-',
    e.factor.Pi,
    e.factor.classNum > 0 ? `${e.factor.className}\u7c7b` : '-',
  ]);
  const analysisTexts: string[] = [];
  for (const s of samples) {
    if (s.exceededCount === 0) continue;
    const cls = s.factors
      .filter(f => f.isExceeded)
      .map(f => `${f.name}(${f.className}\u7c7b, Pi=${f.Pi})`)
      .join('\uff1b');
    analysisTexts.push(
      `${s.sampleName}\u5171${s.exceededCount}\u9879\u56e0\u5b50\u8d85\u6807\uff1a${cls}\u3002`,
    );
  }
  return {
    title: '2.3 \u8d85\u6807\u56e0\u5b50\u5206\u6790',
    level: 2,
    content: [
      buildParagraph(
        `\u672c\u6b21\u8bc4\u4ef7\u4e2d\uff0c\u5171\u68c0\u51fa${allExceeded.length}\u9879\u8d85\u6807\u56e0\u5b50\uff0c\u6d89\u53ca${new Set(allExceeded.map(e => e.sampleName)).size}\u4e2a\u6c34\u6837\u3002`,
        { indent: true },
      ),
      ...buildTable(columns, rows, { caption: `\u8868${samples.length + 2} \u8d85\u6807\u56e0\u5b50\u6c47\u603b` }),
      ...buildParagraphs(analysisTexts),
    ],
  };
}

function buildSukalovSection(sukalovList: { name: string; result: SukalovResult }[]): ReportSection {
  if (sukalovList.length === 0) {
    return {
      title: '\u4e09\u3001\u82cf\u5361\u5217\u592b\u6c34\u5316\u5b66\u5206\u7c7b',
      level: 1,
      content: [
        buildParagraph('\u672c\u6b21\u8bc4\u4ef7\u672a\u8fdb\u884c\u82cf\u5361\u5217\u592b\u6c34\u5316\u5b66\u5206\u7c7b\u3002', { indent: true }),
      ],
    };
  }
  const ionLabelMap: Record<string, string> = {
    HCO3: 'HCO\u2083\u207b', SO4: 'SO\u2084\u00b2\u207b', Cl: 'Cl\u207b',
    Ca: 'Ca\u00b2\u207a', Mg: 'Mg\u00b2\u207a', Na: 'Na\u207a',
  };
  const columns = [
    { header: '\u6c34\u6837\u540d\u79f0', width: 15 },
    { header: '\u6c34\u5316\u5b66\u7c7b\u578b', width: 20 },
    { header: '\u5206\u533a\u53f7', width: 10 },
    { header: '\u9634\u79bb\u5b50\u4f18\u52bf', width: 18 },
    { header: '\u9633\u79bb\u5b50\u4f18\u52bf', width: 18 },
    { header: 'HCO\u2083\u207b %ep', width: 10, align: 'right' as const },
    { header: 'SO\u2084\u00b2\u207b %ep', width: 10, align: 'right' as const },
    { header: 'Cl\u207b %ep', width: 10, align: 'right' as const },
    { header: 'Ca\u00b2\u207a %ep', width: 10, align: 'right' as const },
    { header: 'Mg\u00b2\u207a %ep', width: 10, align: 'right' as const },
    { header: 'Na\u207a %ep', width: 10, align: 'right' as const },
  ];
  const rows = sukalovList.map(item => [
    item.name,
    item.result.type,
    item.result.zone > 0 ? String(item.result.zone) : '-',
    item.result.anions.map(a => ionLabelMap[a] ?? a).join('\u00b7') || '\u65e0',
    item.result.cations.map(c => ionLabelMap[c] ?? c).join('\u00b7') || '\u65e0',
    item.result.anionPercentages.HCO3.toFixed(1) + '%',
    item.result.anionPercentages.SO4.toFixed(1) + '%',
    item.result.anionPercentages.Cl.toFixed(1) + '%',
    item.result.cationPercentages.Ca.toFixed(1) + '%',
    item.result.cationPercentages.Mg.toFixed(1) + '%',
    item.result.cationPercentages.Na.toFixed(1) + '%',
  ]);
  const analysisTexts = sukalovList.map(item => {
    const type = item.result.type !== '\u672a\u77e5-\u672a\u77e5' ? item.result.type : '\u672a\u77e5';
    const zone = item.result.zone > 0 ? `\uff0c\u82cf\u5361\u5217\u592b\u5206\u533a\u53f7\u4e3a${item.result.zone}` : '';
    const anionDesc = item.result.anions.length > 0
      ? `\u9634\u79bb\u5b50\u4ee5${item.result.anions.map(a => ionLabelMap[a] ?? a).join('\u3001')}\u4e3a\u4e3b`
      : '';
    const cationDesc = item.result.cations.length > 0
      ? `\u9633\u79bb\u5b50\u4ee5${item.result.cations.map(c => ionLabelMap[c] ?? c).join('\u3001')}\u4e3a\u4e3b`
      : '';
    return `${item.name}\u6c34\u5316\u5b66\u7c7b\u578b\u4e3a${type}${zone}\u3002${anionDesc}\uff0c${cationDesc}\u3002`;
  });
  return {
    title: '\u4e09\u3001\u82cf\u5361\u5217\u592b\u6c34\u5316\u5b66\u5206\u7c7b',
    level: 1,
    content: [
      buildParagraph(
        '\u91c7\u7528\u82cf\u5361\u5217\u592b\u5206\u7c7b\u6cd5\u5bf9\u5730\u4e0b\u6c34\u6c34\u5316\u5b66\u6210\u5206\u8fdb\u884c\u5206\u7c7b\u3002\u5c066\u79cd\u4e3b\u8981\u79bb\u5b50\u6d53\u5ea6\u6362\u7b97\u4e3a\u6beb\u5f53\u91cf\u6d53\u5ea6(meq/L)\uff0c\u8ba1\u7b97\u6beb\u514b\u5f53\u91cf\u767e\u5206\u6bd4(%ep)\uff0c\u53d6\u5927\u4e8e25%ep\u7684\u79bb\u5b50\u786e\u5b9a\u6c34\u5316\u5b66\u7c7b\u578b\u548c\u5206\u533a\u53f7\u3002',
        { indent: true },
      ),
      ...buildTable(columns, rows, { caption: `\u8868${sukalovList.length + 10} \u82cf\u5361\u5217\u592b\u6c34\u5316\u5b66\u5206\u7c7b\u7ed3\u679c` }),
      ...buildParagraphs(analysisTexts),
    ],
  };
}

function buildConclusionSection(
  samples: SampleResult[],
  sukalovList: { name: string; result: SukalovResult }[],
): ReportSection {
  const conclusionTexts: string[] = [];
  for (const s of samples) {
    const isCompliant = s.overallClassNum <= 3;
    const exceeded = s.exceededCount > 0
      ? `\uff0c\u8d85\u6807\u56e0\u5b50\u4e3a${s.exceededFactors.join('\u3001')}`
      : '\uff0c\u5404\u9879\u8bc4\u4ef7\u56e0\u5b50\u5747\u8fbe\u6807';
    conclusionTexts.push(
      `\u6839\u636e\u5355\u56e0\u5b50\u6807\u51c6\u6307\u6570\u6cd5\u8bc4\u4ef7\uff0c${s.sampleName}\u5730\u4e0b\u6c34\u6c34\u8d28\u7efc\u5408\u8bc4\u5b9a\u4e3a${s.overallClass}\u7c7b(${isCompliant ? '\u8fbe\u6807' : '\u8d85\u6807'})${exceeded}\uff0c${isCompliant ? '\u6ee1\u8db3' : '\u4e0d\u6ee1\u8db3'}\u300a\u5730\u4e0b\u6c34\u8d28\u91cf\u6807\u51c6\u300b(GB/T 14848-2017)III\u7c7b\u6807\u51c6\u8981\u6c42\u3002`,
    );
  }
  if (sukalovList.length > 0) {
    const types = sukalovList.map(item => `${item.name}(${item.result.type})`).join('\u3001');
    conclusionTexts.push(`\u6c34\u5316\u5b66\u7c7b\u578b\u5206\u6790\u7ed3\u679c\uff1a${types}\u3002`);
  }
  return {
    title: '\u56db\u3001\u7efc\u5408\u8bc4\u4ef7\u7ed3\u8bba',
    level: 1,
    content: [...buildParagraphs(conclusionTexts)],
  };
}

// ═══════════════════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════════════════

export async function generateWaterQualityReport(
  samples: SampleResult[],
  sukalovList?: { name: string; result: SukalovResult }[],
  filename?: string,
): Promise<void> {
  const sections: ReportSection[] = [];
  sections.push(buildMethodSection());

  const resultSection: ReportSection = {
    title: '\u4e8c\u3001\u8bc4\u4ef7\u7ed3\u679c',
    level: 1,
    content: [
      buildParagraph(
        `\u672c\u6b21\u8bc4\u4ef7\u5171\u6d89\u53ca${samples.length}\u4e2a\u6c34\u6837\uff0c\u91c7\u7528\u5355\u56e0\u5b50\u6807\u51c6\u6307\u6570\u6cd5\u5bf9\u5404\u9879\u6c34\u8d28\u6307\u6807\u8fdb\u884c\u4e86\u9010\u4e00\u8bc4\u4ef7\u3002`,
        { indent: true },
      ),
    ],
  };
  sections.push(resultSection);
  sections.push(buildOverviewSubSection(samples));
  sections.push(...buildDetailSubSections(samples));
  sections.push(buildExceededSection(samples));
  sections.push(buildSukalovSection(sukalovList ?? []));
  sections.push(buildConclusionSection(samples, sukalovList ?? []));

  const config: ReportConfig = {
    title: '\u5730\u4e0b\u6c34\u6c34\u8d28\u8bc4\u4ef7\u62a5\u544a',
    subtitle: '\u57fa\u4e8e GB/T 14848-2017 \u5355\u56e0\u5b50\u6807\u51c6\u6307\u6570\u6cd5',
    sections,
    showDate: true,
  };

  await generateAndDownload(config, `${filename ?? '\u5730\u4e0b\u6c34\u6c34\u8d28\u8bc4\u4ef7\u62a5\u544a'}.docx`);
}
