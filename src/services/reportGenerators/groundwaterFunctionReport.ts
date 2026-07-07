/**
 * 地下水超采区划与功能区报告生成器
 * 涵盖：超采总览、各市分布、功能区划、水位回升、禁采/限采区
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('groundwater-function', (data) => {
  const sections: ReportConfig['sections'] = [];
  const overview = (data.overdraftOverview || {}) as Record<string, unknown>;
  const cityZones = (data.cityOverdraftZones || []) as Array<Record<string, unknown>>;
  const restricted = (data.restrictedZones || {}) as Record<string, unknown>;
  const forbidden = (restricted.forbidden || []) as Array<Record<string, unknown>>;
  const limited = (restricted.limited || []) as Array<Record<string, unknown>>;
  const recovery = (data.waterLevelRecovery || {}) as Record<string, unknown>;
  const annualData = (recovery.annualData || []) as Array<Record<string, unknown>>;
  const funcZones = (data.groundwaterFunctionZones || []) as Array<Record<string, unknown>>;
  const controlResults = (data.overdraftControlResults || {}) as Record<string, unknown>;

  // ── 第1章：超采总览 ──
  sections.push({
    title: '超采区总体概况',
    level: 1,
    content: [
      ...buildParagraphs([
        `依据河北省人民政府《关于公布地下水超采区和禁止开采区、限制开采区范围的通知》(2022)，全省超采区总面积 ${String(overview.totalArea)} km²。`,
        `其中浅层超采面积 ${String(overview.shallowOverdraft)} km²，深层超采面积 ${String(overview.deepOverdraft)} km²，浅层与深层重叠面积 ${String(overview.overlapArea)} km²。`,
        '超采区涉及全省11个地级市，其中沧州、衡水、廊坊三市深层承压水为严重超采区，是超采治理的重点区域。',
      ]),
      ...buildTable(
        [{ header: '指标' }, { header: '数值' }, { header: '单位' }],
        [
          ['超采区总面积', String(overview.totalArea), 'km²'],
          ['浅层超采面积', String(overview.shallowOverdraft), 'km²'],
          ['深层超采面积', String(overview.deepOverdraft), 'km²'],
          ['浅层与深层重叠面积', String(overview.overlapArea), 'km²'],
        ],
        { caption: '表1 超采区面积概况' }
      ),
    ],
  });

  // ── 第2章：各市超采区分布 ──
  if (cityZones.length > 0) {
    const shallowCount = cityZones.filter(c => String(c.shallowType) !== '—').length;
    const deepCount = cityZones.filter(c => String(c.deepType) !== '—').length;
    const severeCount = cityZones.filter(c => String(c.deepType) === '严重超采区').length;

    sections.push({
      title: '各市超采区类型与分布',
      level: 1,
      content: [
        ...buildParagraphs([
          `全省 ${cityZones.length} 个地级市中，${shallowCount} 个市有浅层超采区，${deepCount} 个市有深层超采区，${severeCount} 个市存在深层严重超采区。`,
        ]),
        ...buildTable(
          [
            { header: '城市' },
            { header: '浅层超采类型' },
            { header: '深层超采类型' },
            { header: '备注' },
          ],
          cityZones.map(c => [
            String(c.city),
            String(c.shallowType),
            String(c.deepType),
            String(c.note),
          ]),
          { caption: '表2 各市超采区类型与分布' }
        ),
      ],
    });
  }

  // ── 第3章：禁止开采区与限制开采区 ──
  if (forbidden.length > 0 || limited.length > 0) {
    sections.push({
      title: '禁止开采区与限制开采区',
      level: 1,
      content: [
        ...buildParagraphs([
          '为加强地下水超采治理，河北省划定了禁止开采区和限制开采区，实施分区管控。',
        ]),
        ...(forbidden.length > 0 ? [
          ...buildParagraphs(['禁止开采区：']),
          ...buildTable(
            [{ header: '城市' }, { header: '范围' }, { header: '原因' }],
            forbidden.map(z => [String(z.city), String(z.scope), String(z.reason)]),
            { caption: '表3 禁止开采区' }
          ),
        ] : []),
        ...(limited.length > 0 ? [
          ...buildParagraphs(['限制开采区：']),
          ...buildTable(
            [{ header: '城市' }, { header: '范围' }, { header: '原因' }],
            limited.map(z => [String(z.city), String(z.scope), String(z.reason)]),
            { caption: '表4 限制开采区' }
          ),
        ] : []),
      ],
    });
  }

  // ── 第4章：地下水功能区划 ──
  if (funcZones.length > 0) {
    sections.push({
      title: '地下水功能区划',
      level: 1,
      content: [
        ...buildParagraphs([
          '河北省地下水功能区划采用"四区管理"体系，包括开发区、保护区、保留区和治理区。',
        ]),
        ...buildTable(
          [
            { header: '功能区' },
            { header: '代码' },
            { header: '说明' },
            { header: '保护目标' },
          ],
          funcZones.map(z => [
            String(z.zone),
            String(z.code),
            String(z.description),
            String(z.protectionTarget),
          ]),
          { caption: '表5 地下水功能区划' }
        ),
      ],
    });
  }

  // ── 第5章：水位回升动态 ──
  if (annualData.length > 0) {
    const last = annualData[annualData.length - 1];
    const first = annualData[0];

    sections.push({
      title: '水位回升动态（2019-2023）',
      level: 1,
      content: [
        ...buildParagraphs([
          `2014年以来河北省大力实施地下水超采综合治理，截至2023年底全省深层水位较2019年底回升 ${String(recovery.deepRecovery)}m，浅层水位回升 ${String(recovery.shallowRecovery)}m。`,
          `浅层水位从 ${String(first.shallowDepth)}m 回升至 ${String(last.shallowDepth)}m，深层水位从 ${String(first.deepDepth)}m 回升至 ${String(last.deepDepth)}m。`,
        ]),
        ...buildTable(
          [
            { header: '年份' },
            { header: '浅层埋深(m)' },
            { header: '深层埋深(m)' },
            { header: '浅层回升(m)' },
            { header: '深层回升(m)' },
            { header: '备注' },
          ],
          annualData.map(d => [
            String(d.year),
            String(d.shallowDepth),
            String(d.deepDepth),
            String(d.shallowRise),
            String(d.deepRise),
            String(d.note),
          ]),
          { caption: '表6 水位回升动态数据' }
        ),
      ],
    });
  }

  // ── 第6章：超采治理成效 ──
  sections.push({
    title: '超采治理成效',
    level: 1,
    content: buildParagraphs([
      `1. 水位回升显著：全省 ${String(controlResults.shallowRiseCounties)} 个县浅层水位回升（占${String(controlResults.shallowRisePercent)}%），${String(controlResults.deepRiseCounties)} 个县深层水位回升（占${String(controlResults.deepRisePercent)}%）。`,
      `2. 深层漏斗消散：2024年全省3个深层地下水漏斗全部消散，严重超采区缩减99%，是河北省地下水管理的重要里程碑。`,
      '3. 压采成效突出：地下水供水量从2014年峰值155.3亿m³降至2024年的94.5亿m³，降幅达39%。',
      '4. 水源替代：南水北调中线工程和引黄入冀补淀工程为禁采区和限采区提供了替代水源，保障了区域供水安全。',
      '5. 持续治理方向：仍需在农业节水、种植结构调整、水源置换等方面持续发力，巩固超采治理成果。',
    ]),
  });

  return {
    title: '河北省地下水超采区划与功能区报告',
    subtitle: '基于2022年河北省人民政府通知·水利厅监测通报',
    sections,
    showDate: true,
  };
});
