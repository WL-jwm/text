/**
 * 地下水环境背景值报告生成器
 * 涵盖：分区背景值、浅深对比、超标因子、标准对照
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('groundwater-background', (data) => {
  const sections: ReportConfig['sections'] = [];
  const bg = (data.groundwaterBackground || {}) as Record<string, unknown>;
  const shallow = (bg.shallow || []) as Array<Record<string, unknown>>;
  const deep = (bg.deep || []) as Array<Record<string, unknown>>;
  const exceed = (data.cityExceedanceFactors || []) as Array<Record<string, unknown>>;
  const standard = (data.waterQualityStandard || {}) as Record<string, unknown>;
  const indicators = (standard.indicators || []) as Array<Record<string, unknown>>;

  // ── 第1章：概述 ──
  sections.push({
    title: '报告概述',
    level: 1,
    content: buildParagraphs([
      '本报告基于河北省地质环境监测院多年监测成果和生态环境部《地下水环境背景值统计表征技术指南(试行)》(2023)，对河北平原地下水化学背景值进行系统整理。',
      '背景值按山前平原、中部平原、滨海平原三个水文地质分区统计，以P5-P95区间表示天然状态下各指标含量范围。',
      '浅层地下水化学类型从山前HCO₃-Ca·Mg型向滨海Cl-Na型过渡，反映地下水从补给区到排泄区的天然演化规律。',
    ]),
  });

  // ── 第2章：分区背景值 ──
  if (shallow.length > 0) {
    sections.push({
      title: '浅层地下水背景值',
      level: 1,
      content: [
        ...buildParagraphs([
          `浅层地下水按 ${shallow.length} 个水文地质分区统计：${shallow.map(z => z.zone).join('、')}。`,
          '山前平原地下水交替积极，水质优良，TDS 300~600 mg/L，为HCO₃-Ca·Mg型水。',
          '中部平原地下水径流滞缓，TDS升高至500~1500 mg/L，局部高氟（F 0.5~2.0 mg/L）。',
          '滨海平原受海相沉积影响，TDS 1000~3000 mg/L，Cl⁻ 200~1000 mg/L，F 1.0~4.0 mg/L，水质较差。',
        ]),
        ...buildTable(
          [{ header: '分区' }, { header: '分布范围' }, { header: 'pH' }, { header: 'TDS(mg/L)' }, { header: '总硬度(mg/L)' }, { header: '水化学类型' }],
          shallow.map(z => [String(z.zone), String(z.cities), String(z.pH), String(z.TDS), String(z.totalHardness), String(z.waterType)]),
          { caption: '表1 浅层地下水背景值分区统计' }
        ),
      ],
    });
  }

  if (deep.length > 0) {
    sections.push({
      title: '深层地下水背景值',
      level: 1,
      content: [
        ...buildParagraphs([
          `深层承压水按 ${deep.length} 个分区统计：${deep.map(z => z.zone).join('、')}。`,
          '深层水以HCO₃-Na型为主，Na⁺占优势，pH偏碱性（8.0~9.0），高氟问题突出。',
          '山前深层水质较好（TDS 400~800 mg/L），中部深层F 1.0~3.0 mg/L，滨海深层F 1.5~5.0 mg/L。',
        ]),
        ...buildTable(
          [{ header: '分区' }, { header: '分布范围' }, { header: 'pH' }, { header: 'TDS(mg/L)' }, { header: 'F(mg/L)' }, { header: '水化学类型' }],
          deep.map(z => [String(z.zone), String(z.cities), String(z.pH), String(z.TDS), String(z.F), String(z.waterType)]),
          { caption: '表2 深层地下水背景值分区统计' }
        ),
      ],
    });
  }

  // ── 第3章：超标因子 ──
  if (exceed.length > 0) {
    sections.push({
      title: '各市地下水超标因子',
      level: 1,
      content: [
        ...buildParagraphs([
          `全省 ${exceed.length} 个地级市地下水均存在不同程度超标，浅层水以总硬度、TDS、硝酸盐为主，深层水以氟化物为主。`,
          '山前平原城市（石家庄、保定、邢台、邯郸）浅层水硝酸盐超标与农业面源污染有关。',
          '中部和滨海平原城市（沧州、衡水、廊坊）深层水高氟高咸水为原生地质背景。',
        ]),
        ...buildTable(
          [{ header: '城市' }, { header: '浅层超标因子' }, { header: '深层超标因子' }, { header: '说明' }],
          exceed.map(c => [String(c.city), String(c.shallow), String(c.deep), String(c.note)]),
          { caption: '表3 各市地下水主要超标因子' }
        ),
      ],
    });
  }

  // ── 第4章：标准对照 ──
  if (indicators.length > 0) {
    sections.push({
      title: '质量标准对照',
      level: 1,
      content: [
        ...buildParagraphs([
          `依据 ${String(standard.standard)} 地下水质量分类标准，对主要指标限值进行对照。`,
          'Ⅲ类水限值是集中式生活饮用水水源标准，背景值超出Ⅲ类限值的指标应作为重点关注因子。',
        ]),
        ...buildTable(
          [{ header: '指标' }, { header: 'Ⅰ/Ⅱ类' }, { header: 'Ⅲ类' }, { header: 'Ⅳ类' }, { header: 'Ⅴ类' }, { header: '单位' }],
          indicators.map(ind => [String(ind.name), String(ind.I_II), String(ind.III), String(ind.IV), String(ind.V), String(ind.unit)]),
          { caption: '表4 地下水质量标准限值对照' }
        ),
      ],
    });
  }

  // ── 第5章：结论 ──
  sections.push({
    title: '结论与建议',
    level: 1,
    content: buildParagraphs([
      '1. 河北平原地下水化学背景呈明显分带性：山前平原→中部平原→滨海平原，TDS、Cl、F、Na等指标逐步升高，水化学类型从HCO₃-Ca·Mg型过渡到Cl-Na型。',
      '2. 浅层水与深层水差异显著：浅层水受降水和人类活动影响大，深层水以Na⁺占优、pH偏碱性、高氟为特征。',
      '3. 原生地质背景是超标主因：中部和滨海平原的TDS、Cl、F超标主要受海相沉积和蒸发浓缩控制，非人为污染。',
      '4. 人为影响不可忽视：山前平原硝酸盐超标与农业面源污染密切相关，需加强农业面源管控。',
      '5. 建议：环评中背景值取值应区分水文地质分区，避免跨区套用；超标因子判定应区分原生背景与人为污染。',
    ]),
  });

  return {
    title: '河北省地下水环境背景值报告',
    subtitle: '河北省地质环境监测院 · 生态环境部背景值技术指南(2023)',
    sections,
    showDate: true,
  };
});
