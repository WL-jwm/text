/**
 * 河北省地下水基础资料数据库总览报告
 * 涵盖核心指标、各市水位动态、资源量时序、供水结构、超采治理、深层漏斗消散等
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('overview', (data) => {
  const sections: ReportConfig['sections'] = [];
  const summary = (data.summary || []) as Array<Record<string, unknown>>;
  const cityWaterLevel = (data.cityWaterLevel || []) as Array<Record<string, unknown>>;
  const systemZones = (data.systemZones || []) as Array<Record<string, unknown>>;
  const overExploitDetail = (data.overExploitDetail || []) as Array<Record<string, unknown>>;
  const historicalComp = (data.historicalComp || []) as Array<Record<string, unknown>>;
  const countyDataStats = data.countyDataStats as Record<string, unknown> | undefined;

  // ── 第1章：总览 ──
  sections.push({
    title: '河北省地下水基础资料数据库总览',
    level: 1,
    content: [
      ...buildParagraphs([
        '本报告基于河北省地下水基础资料数据库（v2.0），综合水资源公报、生态环境公报及水文地质调查资料，对全省地下水资源的核心指标进行汇总分析。',
        '数据库涵盖水资源量、水质评价、水化学、系统区划、基础地质、水文参数、水源地、开采管理、岩溶水、裂隙水、地热资源、矿泉水、咸水分布、盐碱土、矿山地质、环境问题等16个专业模块。',
        countyDataStats ? `县级数据覆盖${String(countyDataStats.cities)}个地级市共${String(countyDataStats.totalCounties)}个县级行政区，其中${String(countyDataStats.dataCounties)}个县有完整数据，${String(countyDataStats.skelCounties)}个县数据待补充。` : '',
      ]),
    ],
  });

  // ── 第2章：核心指标汇总 ──
  if (summary.length > 0) {
    sections.push({
      title: '2024年度核心指标汇总',
      level: 1,
      content: [
        ...buildParagraphs([
          '以下为2024年度河北省地下水资源的核心指标，反映了近年来超采治理成效显著——地下水供水量持续下降，深层漏斗全面消散，浅层水位大面积回升。',
        ]),
        ...buildTable(
          [{ header: '指标' }, { header: '数值' }, { header: '年份' }, { header: '备注' }],
          summary.map(s => [String(s.指标), String(s.数值), String(s.年份), String(s.备注)]),
          { caption: '表1 2024年度核心指标汇总' }
        ),
      ],
    });
  }

  // ── 第3章：各市地下水位动态 ──
  if (cityWaterLevel.length > 0) {
    const sorted = [...cityWaterLevel].sort((a, b) =>
      Number((b as Record<string, unknown>).浅层水位变化 || 0) - Number((a as Record<string, unknown>).浅层水位变化 || 0)
    );

    sections.push({
      title: '各市浅层地下水位年变幅',
      level: 1,
      content: [
        ...buildParagraphs([
          '2024年全省浅层地下水位整体呈回升态势，回升幅度较大的城市集中在山前平原超采区，受益于南水北调水源置换和农业节水措施。',
        ]),
        ...buildTable(
          [
            { header: '城市' },
            { header: '浅层水位变化(m)' },
            { header: '深层水位变化(m)' },
            { header: '供水总量(亿m³)' },
            { header: '地下水供水(亿m³)' },
          ],
          sorted.map(c => [
            String(c.城市 || c.city),
            String(c.浅层水位变化 ?? c.shallowChange ?? '-'),
            String(c.深层水位变化 ?? c.deepChange ?? '-'),
            String(c.供水总量 ?? c.totalSupply ?? '-'),
            String(c.地下水供水量 ?? c.gwSupply ?? '-'),
          ]),
          { caption: '表2 各市地下水位年变幅（2024年）' }
        ),
      ],
    });
  }

  // ── 第4章：历史对比与超采治理 ──
  if (historicalComp.length > 0) {
    sections.push({
      title: '历史对比与超采治理成效',
      level: 1,
      content: [
        ...buildParagraphs([
          '河北省自2014年启动地下水超采综合治理以来，地下水资源量、开采量、漏斗面积等指标均发生显著变化。以下为关键指标的历史对比。',
        ]),
        ...buildTable(
          [
            { header: '指标' },
            { header: '基准值' },
            { header: '2024年' },
            { header: '变化量' },
            { header: '单位' },
          ],
          historicalComp.map(h => [
            String(h.name),
            String(h.period1980s ?? h.value2014 ?? '-'),
            String(h.year2024 ?? h.value2024 ?? '-'),
            String(h.change),
            String(h.unit),
          ]),
          { caption: '表3 关键指标历史对比' }
        ),
      ],
    });
  }

  // ── 第5章：超采治理各市详情 ──
  if (overExploitDetail.length > 0) {
    sections.push({
      title: '超采治理各市详情',
      level: 1,
      content: [
        ...buildParagraphs([
          '以下为各地级市超采区治理的具体数据，包括超采面积、治理面积、压采量和水位变化。',
        ]),
        ...buildTable(
          [
            { header: '城市' },
            { header: '超采面积(km²)' },
            { header: '治理面积(km²)' },
            { header: '压采量(亿m³)' },
            { header: '水位变化(m)' },
            { header: '状态' },
          ],
          overExploitDetail.map(d => [
            String(d.city),
            String(d.overexploitArea),
            String(d.controlArea),
            String(d.reductionVolume),
            String(d.waterLevelChange),
            String(d.status),
          ]),
          { caption: '表4 各市超采治理详情' }
        ),
      ],
    });
  }

  // ── 第6章：系统区划概要 ──
  if (systemZones.length > 0) {
    const activeZones = systemZones.filter(z => Number(z.area) > 0).sort((a, b) => Number(b.area) - Number(a.area)).slice(0, 5);
    const totalArea = systemZones.reduce((s, z) => s + Number(z.area), 0);

    sections.push({
      title: '地下水系统区划概要',
      level: 1,
      content: [
        ...buildParagraphs([
          `河北省共划分 ${systemZones.length} 个地下水系统一级区，总面积约 ${totalArea.toLocaleString()} km²。以下为面积最大的5个系统区。`,
        ]),
        ...buildTable(
          [
            { header: '名称' },
            { header: '面积(km²)' },
            { header: '占比(%)' },
            { header: '补给量(亿m³/a)' },
            { header: '排泄量(亿m³/a)' },
          ],
          activeZones.map(z => [
            String(z.name),
            String(z.area),
            String(z.proportion),
            String(z.recharge ?? '-'),
            String(z.discharge ?? '-'),
          ]),
          { caption: '表5 地下水系统一级区面积排名（Top 5）' }
        ),
      ],
    });
  }

  // ── 第7章：结论 ──
  sections.push({
    title: '结论',
    level: 1,
    content: buildParagraphs([
      '1. 地下水超采治理取得历史性突破：2024年深层地下水漏斗全部消散，严重超采区缩减99%，是河北省地下水管理的重要里程碑。',
      '2. 供水量结构持续优化：地下水供水量从历史峰值155.3亿m³降至94.5亿m³，南水北调水源置换效果显著。',
      '3. 浅层地下水位大面积回升：全省平均浅层水位回升0.70m，深层水位回升1.91m，地下水资源储量增加33.33亿m³。',
      '4. 饮用水源水质全面达标：27个水源地全部达到III类及以上标准，水质安全得到保障。',
      '5. 数据库建设不断完善：16个专业模块已全部上线，县级数据覆盖持续扩大，为河北省地下水资源管理和科学研究提供全面的数据支撑。',
    ]),
  });

  return {
    title: '河北省地下水基础资料数据库总览报告',
    subtitle: '综合水资源公报·生态环境公报·水文地质调查',
    sections,
    showDate: true,
  };
});
