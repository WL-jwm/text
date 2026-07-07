/**
 * 地下水均衡与资源评价报告生成器
 * 涵盖：平原区水均衡、各市均衡、开采潜力、水质评价、污染评价
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('groundwater-balance', (data) => {
  const sections: ReportConfig['sections'] = [];
  const balance = (data.plainWaterBalance || {}) as Record<string, unknown>;
  const recharge = (balance.rechargeBreakdown || []) as Array<Record<string, unknown>>;
  const discharge = (balance.dischargeBreakdown || []) as Array<Record<string, unknown>>;
  const cityBalance = (data.cityWaterBalance || []) as Array<Record<string, unknown>>;
  const extraction = (data.cityGroundwaterExtraction2000 || []) as Array<Record<string, unknown>>;
  const potential = (data.cityExploitationPotential || []) as Array<Record<string, unknown>>;
  const potentialSummary = (data.potentialZoneSummary || {}) as Record<string, unknown>;
  const zones = (potentialSummary.zones || []) as Array<Record<string, unknown>>;
  const quality = (data.shallowWaterQualityByClass || []) as Array<Record<string, unknown>>;
  const pollution = (data.cityGroundwaterPollution || []) as Array<Record<string, unknown>>;

  // ── 第1章：概述 ──
  sections.push({
    title: '报告概述',
    level: 1,
    content: buildParagraphs([
      `本报告基于《中国地下水资源 河北卷》(2005) 第三、四、六章数据，对河北省平原区地下水均衡、各市开采潜力、水质评价和污染状况进行系统分析。`,
      `河北平原区（1991-2000年均值）总补给量 ${String(balance.totalRecharge)} 亿m³/a，总排泄量 ${String(balance.totalDischarge)} 亿m³/a，年均超采 ${String(Math.abs(Number(balance.balance)))} 亿m³/a。`,
      '人工开采是地下水排泄的主要方式，占总排泄量的79.96%，农业开采占总开采量的76.8%。',
    ]),
  });

  // ── 第2章：平原区水均衡 ──
  if (recharge.length > 0) {
    sections.push({
      title: '河北平原区水均衡',
      level: 1,
      content: [
        ...buildParagraphs([
          `均衡期 ${String(balance.period)}，总补给 ${String(balance.totalRecharge)} 亿m³/a，总排泄 ${String(balance.totalDischarge)} 亿m³/a，均衡差 ${String(balance.balance)} 亿m³/a。`,
          '降水入渗补给是主要补给来源（65.45%），人工开采是主要排泄途径（79.96%）。',
        ]),
        ...buildTable(
          [{ header: '补给项' }, { header: '水量(亿m³/a)' }, { header: '占比(%)' }],
          recharge.map(r => [String(r.item), String(r.value), String(r.percent)]),
          { caption: '表1 补给项构成' }
        ),
        ...buildTable(
          [{ header: '排泄项' }, { header: '水量(亿m³/a)' }, { header: '占比(%)' }],
          discharge.map(d => [String(d.item), String(d.value), String(d.percent)]),
          { caption: '表2 排泄项构成' }
        ),
      ],
    });
  }

  // ── 第3章：各市均衡与开采量 ──
  if (cityBalance.length > 0) {
    sections.push({
      title: '各市地下水均衡与开采量',
      level: 1,
      content: [
        ...buildParagraphs([
          '各市潜水-微承压水平均均衡差均为负值，其中保定市超采最严重（-4.48亿m³/a），石家庄次之（-3.88亿m³/a）。',
        ]),
        ...buildTable(
          [{ header: '城市' }, { header: '面积(km²)' }, { header: '补给量(亿m³/a)' }, { header: '排泄量(亿m³/a)' }, { header: '均衡差(亿m³/a)' }],
          cityBalance.map(c => {
            const total = (c.total || {}) as Record<string, unknown>;
            return [String(c.city), String(total.area), String(total.recharge), String(total.discharge), String(total.balance)];
          }),
          { caption: '表3 各市潜水-微承压水均衡' }
        ),
        ...(extraction.length > 0 ? [
          ...buildTable(
            [{ header: '城市' }, { header: '总开采(亿m³)' }, { header: '农业' }, { header: '工业' }, { header: '生活' }],
            extraction.map(e => [String(e.city), String(e.total), String(e.agriculture), String(e.industry), String(e.domestic)]),
            { caption: '表4 各市地下水开采量（2000年）' }
          ),
        ] : []),
      ],
    });
  }

  // ── 第4章：开采潜力 ──
  if (potential.length > 0) {
    sections.push({
      title: '地下水开采潜力评价',
      level: 1,
      content: [
        ...buildParagraphs([
          `全省平原区可开采资源总量 ${String(potentialSummary.totalResource)} 亿m³/a，2000年实际开采 ${String(potentialSummary.totalExtraction2000)} 亿m³/a，超采 ${String(Math.abs(Number(potentialSummary.totalSurplus)))} 亿m³/a。`,
          `超采区面积占 ${String(zones.length > 2 ? zones[2].percent : '-')}%，基本平衡区占 ${String(zones.length > 1 ? zones[1].percent : '-')}%，有潜力区仅占 ${String(zones.length > 0 ? zones[0].percent : '-')}%。`,
        ]),
        ...buildTable(
          [{ header: '城市' }, { header: '可采资源(亿m³/a)' }, { header: '实际开采(亿m³/a)' }, { header: '潜力指数' }, { header: '盈余/超采(亿m³/a)' }, { header: '状态' }],
          potential.map(p => [String(p.city), String(p.resource), String(p.extraction2000), String(p.potentialIndex), String(p.surplus), String(p.note)]),
          { caption: '表5 各市开采潜力评价' }
        ),
      ],
    });
  }

  // ── 第5章：水质评价 ──
  if (quality.length > 0) {
    sections.push({
      title: '地下水质量评价',
      level: 1,
      content: [
        ...buildParagraphs([
          '浅层地下水Ⅰ~Ⅲ类水占60%，主要分布在山丘区、坝上高原和山前冲洪积平原；Ⅳ~Ⅴ类水占40%，主要分布在中部冲湖积平原和滨海平原。',
          '1999年全省废污水排放量18.9亿t，其中工业废水12.1亿t（64%），生活污水6.8亿t（36%）。',
        ]),
        ...buildTable(
          [{ header: '类别' }, { header: '分布范围' }, { header: '占比(%)' }],
          quality.map(q => [String(q.class), String(q.area), String(q.percent)]),
          { caption: '表6 浅层地下水质量分类' }
        ),
      ],
    });
  }

  // ── 第6章：污染评价 ──
  if (pollution.length > 0) {
    sections.push({
      title: '地下水污染评价',
      level: 1,
      content: [
        ...buildParagraphs([
          '全省地下水污染以轻污染为主，唐山、廊坊、秦皇岛等市污染面积较大。铁（Fe）检出率最高（91.4%），超标率38.5%；锰（Mn）检出率50.4%，超标率26.6%。',
        ]),
        ...buildTable(
          [{ header: '城市' }, { header: '未污染(km²)' }, { header: '轻污染(km²)' }, { header: '中污染(km²)' }, { header: '重污染(km²)' }, { header: '严重污染(km²)' }, { header: '趋势' }],
          pollution.map(p => [String(p.city), String(p.unpol), String(p.light), String(p.moderate), String(p.heavy), String(p.severe), String(p.trend)]),
          { caption: '表7 各市地下水污染面积统计' }
        ),
      ],
    });
  }

  // ── 第7章：结论 ──
  sections.push({
    title: '结论与建议',
    level: 1,
    content: buildParagraphs([
      '1. 地下水严重超采：河北平原区年均超采16.95亿m³，超采区面积占77.14%，廊坊、衡水为严重超采区。',
      '2. 农业是地下水开采主因：农业开采占总开采量的76.8%，农业节水是压减开采的关键。',
      '3. 水质呈分区特征：山前平原水质较好（Ⅰ~Ⅲ类），中部和滨海平原水质较差（Ⅳ~Ⅴ类），天然背景与人为污染叠加。',
      '4. 污染形势严峻：铁、锰超标严重，唐山、廊坊、秦皇岛等市污染面积大，主要污染物为总硬度、硝酸盐、酚、氰等。',
      '5. 潜力增量措施：农业节水可增加18.37亿m³/a，微咸水利用7.35亿m³/a，工业节水8.38亿m³/a，合计可缓解超采43.45亿m³/a。',
      '6. 建议：持续推进农业节水灌溉，加大微咸水利用和污水资源化力度，加强重点区域地下水污染治理。',
    ]),
  });

  return {
    title: '河北省地下水均衡与资源评价报告',
    subtitle: '《中国地下水资源 河北卷》(2005)',
    sections,
    showDate: true,
  };
});
