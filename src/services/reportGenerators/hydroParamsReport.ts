/**
 * 水文地质参数报告生成器
 *
 * 注册为 'hydro-params' 类型报告。
 * 数据通过 useReportData 预采集缓存传入。
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('hydro-params', (data) => {
  const sections: ReportConfig['sections'] = [];

  // ============================================================
  // 第一章：含水层组划分
  // ============================================================
  const aquiferGroups = data.aquiferGroups as Array<{
    group: string; era: string; property: string; depth: string;
    lithology: string; K: string; T: string; mu: string; salinity: string; note: string;
  }>;

  if (aquiferGroups && aquiferGroups.length > 0) {
    sections.push({
      title: '含水层组划分',
      level: 1,
      content: [
        ...buildParagraphs([
          '河北省第四系含水层组自上而下划分为四个含水层组，各含水层组的时代、岩性、水文地质参数特征如下表所示。',
        ]),
        ...buildTable(
          [
            { header: '含水层组' }, { header: '时代' }, { header: '性质' },
            { header: '底界深度(m)' }, { header: '主要岩性' },
            { header: '渗透系数K(m/d)' }, { header: '导水系数T(m²/d)' },
            { header: '给水度μ' }, { header: '矿化度(g/L)' },
          ],
          aquiferGroups.map(d => [
            d.group, d.era, d.property, d.depth, d.lithology,
            d.K, d.T, d.mu, d.salinity,
          ]),
          { caption: '表1 河北省第四系含水层组参数特征' }
        ),
        ...buildParagraphs([
          '第一含水层组（Q3-4）为潜水-微承压水，底界埋深0~60m，以砂、砾石、卵石为主，渗透系数10~300m/d，是山前平原的主体含水层，直接接受降水入渗补给。',
          '第二含水层组（Q2）为承压水，底界埋深60~180m，以中细砂、粉砂为主，渗透系数1~50m/d，历史上为平原区主要开采层。',
          '第三含水层组（Q1）为深层承压水，底界埋深180~350m，以细砂、粉砂为主，渗透系数0.5~10m/d，水循环周期约1万年。',
          '第四含水层组（N2）为深层承压水，底界埋深350~600m，以粉砂、细砂为主，渗透系数0.1~5m/d，更新世-上新世沉积，循环极为缓慢。',
        ]),
      ],
    });
  }

  // ============================================================
  // 第二章：渗透系数经验值
  // ============================================================
  const permeability = data.permeability as Array<{
    lithology: string; Kh: string; Kv: string; ratio: string; source: string;
  }>;

  if (permeability && permeability.length > 0) {
    sections.push({
      title: '渗透系数经验值',
      level: 1,
      content: [
        ...buildParagraphs([
          '不同岩性介质的渗透系数经验值范围如下表所示，数据来源于1999年《河北省地下水》表6-16、6-17、6-24。',
        ]),
        ...buildTable(
          [
            { header: '岩性' }, { header: '水平渗透系数Kh(m/d)' },
            { header: '垂直渗透系数Kv(m/d)' }, { header: 'Kh/Kv' },
            { header: '资料来源' },
          ],
          permeability.map(d => [d.lithology, d.Kh, d.Kv, d.ratio, d.source]),
          { caption: '表2 不同岩性渗透系数经验值' }
        ),
      ],
    });
  }

  // ============================================================
  // 第三章：给水度与有效孔隙度
  // ============================================================
  const lithologyMu = data.lithologyMu as Array<{
    category: string; lithology: string; mu: string;
    K: string; ne: string; source: string;
  }>;

  if (lithologyMu && lithologyMu.length > 0) {
    sections.push({
      title: '给水度与有效孔隙度',
      level: 1,
      content: [
        ...buildParagraphs([
          '给水度（μ）和有效孔隙度（ne）是地下水评价中的重要参数，不同岩性的经验值如下表所示。',
        ]),
        ...buildTable(
          [
            { header: '类别' }, { header: '岩性' },
            { header: '给水度μ' }, { header: '渗透系数K(m/d)' },
            { header: '有效孔隙度ne' }, { header: '资料来源' },
          ],
          lithologyMu.map(d => [d.category, d.lithology, d.mu, d.K, d.ne, d.source]),
          { caption: '表3 岩性与给水度、有效孔隙度对照表' }
        ),
      ],
    });
  }

  // ============================================================
  // 第四章：降水入渗系数
  // ============================================================
  const infiltration = data.infiltration as Array<{
    lithology: string; plain: string; basin: string; mountain: string; optDepth: string; note: string;
  }>;

  if (infiltration && infiltration.length > 0) {
    sections.push({
      title: '降水入渗系数',
      level: 1,
      content: [
        ...buildParagraphs([
          '降水入渗系数（α）受包气带岩性、地下水位埋深、降水量等因素影响，不同岩性和地貌单元的入渗系数经验值如下表所示。',
        ]),
        ...buildTable(
          [
            { header: '岩性' }, { header: '平原区' },
            { header: '山间盆地' }, { header: '山区' },
            { header: '最佳水位埋深(m)' }, { header: '备注' },
          ],
          infiltration.map(d => [d.lithology, d.plain, d.basin, d.mountain, d.optDepth, d.note]),
          { caption: '表4 降水入渗系数经验值' }
        ),
      ],
    });
  }

  // ============================================================
  // 第五章：释水系数
  // ============================================================
  const storageCoeff = data.storageCoeff as Array<{
    era: string; lithology: string; mu_e: string; note: string;
  }>;

  if (storageCoeff && storageCoeff.length > 0) {
    sections.push({
      title: '承压含水层释水系数',
      level: 1,
      content: [
        ...buildParagraphs([
          '承压含水层的弹性释水系数（μe）随含水层时代和岩性不同而差异显著，深层含水层释水系数极小，可恢复性差。',
        ]),
        ...buildTable(
          [
            { header: '时代/含水层组' }, { header: '主要岩性' },
            { header: '弹性释水系数μe' }, { header: '备注' },
          ],
          storageCoeff.map(d => [d.era, d.lithology, d.mu_e, d.note]),
          { caption: '表5 承压含水层弹性释水系数' }
        ),
      ],
    });
  }

  // ============================================================
  // 第六章：地下水系统分区
  // ============================================================
  const systemZones = data.systemZones as Array<{
    code: string; name: string; area: number | null; areaPercent: number | null;
  }>;

  const subZones = data.subZones as Array<{
    code: string; name: string; parent: string;
    alpha: string | null; T: string | null; q: string | null;
    aquiferThickness: string | null; waterLevel: string | null; runoffModulus: string | null;
  }> | undefined;

  if (systemZones && systemZones.length > 0) {
    sections.push({
      title: '地下水系统分区',
      level: 1,
      content: [
        ...buildParagraphs([
          '河北省地下水系统划分为10个一级系统区，总面积约18.83万km²。各系统区概况如下表所示。',
        ]),
        ...buildTable(
          [
            { header: '编号' }, { header: '系统区名称' },
            { header: '面积(km²)' }, { header: '面积占比(%)' },
          ],
          systemZones.map(d => [
            d.code, d.name,
            d.area != null ? String(d.area) : '—',
            d.areaPercent != null ? String(d.areaPercent) : '—',
          ]),
          { caption: '表6 河北省地下水一级系统区' }
        ),
      ],
    });

    // 子区参数表（有完整数据的子区）
    if (subZones && subZones.length > 0) {
      // 只取有 alpha 或 T 数据的子区
      const detailedSubZones = subZones.filter(z => z.alpha || z.T);
      if (detailedSubZones.length > 0) {
        sections.push({
          title: '典型子区/小区参数',
          level: 2,
          content: [
            ...buildTable(
              [
                { header: '编号' }, { header: '名称' },
                { header: '入渗系数α' }, { header: '导水系数T(m²/d)' },
                { header: '单井涌水量(m³/h)' }, { header: '含水层厚度(m)' },
                { header: '水位埋深(m)' }, { header: '径流模数(万m³/km²·a)' },
              ],
              detailedSubZones.map(d => [
                d.code, d.name,
                d.alpha ?? '—', d.T ?? '—',
                d.q ?? '—', d.aquiferThickness ?? '—',
                d.waterLevel ?? '—', d.runoffModulus ?? '—',
              ]),
              { caption: '表7 典型子区/小区水文地质参数' }
            ),
          ],
        });
      }
    }
  }

  // ============================================================
  // 第七章：弥散度经验值
  // ============================================================
  const dispersivity = data.dispersivity as Array<{
    medium: string; aL: string; aT: string; note: string;
  }> | undefined;

  if (dispersivity && dispersivity.length > 0) {
    sections.push({
      title: '弥散度经验值',
      level: 1,
      content: [
        ...buildParagraphs([
          '弥散度是地下水溶质运移模拟的关键参数，纵向弥散度（aL）和横向弥散度（aT）的经验值如下表所示。',
        ]),
        ...buildTable(
          [
            { header: '介质类型' }, { header: '纵向弥散度aL(m)' },
            { header: '横向弥散度aT(m)' }, { header: '备注' },
          ],
          dispersivity.map(d => [d.medium, d.aL, d.aT, d.note]),
          { caption: '表8 弥散度经验值' }
        ),
      ],
    });
  }

  // ============================================================
  // 第八章：岩溶与裂隙含水介质
  // ============================================================
  const karstParams = data.karstParams as Array<{
    type: string; K: string; T: string; mu: string; area: string; note: string;
  }> | undefined;
  const fractureParams = data.fractureParams as Array<{
    type: string; lithology: string; K: string; springFlow: string; modulus: string;
  }> | undefined;

  if (karstParams && karstParams.length > 0) {
    sections.push({
      title: '岩溶含水层参数',
      level: 2,
      content: [
        ...buildTable(
          [
            { header: '类型' }, { header: '渗透系数K(m/d)' },
            { header: '导水系数T(m²/d)' }, { header: '给水度μ' },
            { header: '分布区域' }, { header: '备注' },
          ],
          karstParams.map(d => [d.type, d.K, d.T, d.mu, d.area, d.note]),
          { caption: '表9 岩溶含水层参数特征' }
        ),
      ],
    });
  }

  if (fractureParams && fractureParams.length > 0) {
    sections.push({
      title: '裂隙含水介质参数',
      level: 2,
      content: [
        ...buildTable(
          [
            { header: '类型' }, { header: '岩性' },
            { header: '渗透系数K(m/d)' }, { header: '泉流量(L/s)' },
            { header: '径流模数(万m³/km²·a)' },
          ],
          fractureParams.map(d => [d.type, d.lithology, d.K, d.springFlow, d.modulus]),
          { caption: '表10 裂隙含水介质参数特征' }
        ),
      ],
    });
  }

  // ============================================================
  // 第九章：山区降水入渗系数实测值
  // ============================================================
  const stationInfiltration = data.stationInfiltration as Array<{
    station: string; area: string; lithology: string; alpha: string;
  }> | undefined;

  if (stationInfiltration && stationInfiltration.length > 0) {
    sections.push({
      title: '山区水文站降水入渗系数实测值',
      level: 1,
      content: [
        ...buildParagraphs([
          '河北省山区典型水文站的降水入渗系数实测值如下表所示，数据来源于1999年《河北省地下水》F表。',
        ]),
        ...buildTable(
          [
            { header: '水文站' }, { header: '汇水面积(km²)' },
            { header: '岩性' }, { header: '入渗系数α' },
          ],
          stationInfiltration.map(d => [d.station, d.area, d.lithology, d.alpha]),
          { caption: '表11 山区典型水文站降水入渗系数实测值' }
        ),
      ],
    });
  }

  // ============================================================
  // 第十章：结论与使用建议
  // ============================================================
  sections.push({
    title: '结论与使用建议',
    level: 1,
    content: buildParagraphs([
      (data.conclusion as string) || '本报告汇总了河北省水文地质参数的典型经验值，涵盖含水层组划分、渗透系数、给水度、降水入渗系数、释水系数、弥散度等关键参数。',
      '使用建议：',
      '1. 环境影响评价中，应根据评价区实际水文地质条件，结合抽水试验等实测资料，合理选取参数值。经验值仅作为参考，不能替代实测数据。',
      '2. 山前冲洪积扇地区参数值偏高，滨海平原区参数值偏低，选取时应注意地域差异。',
      '3. 弥散度参数对模拟结果敏感，建议结合野外示踪试验确定，经验值仅用于初步分析。',
      '4. 深层承压水（第三、四含水层组）释水系数极小，水资源恢复极为缓慢，评价中应重点关注其可持续性。',
    ]),
  });

  return {
    title: '河北省水文地质参数汇编',
    subtitle: '基于1999年《河北省地下水》及区域水文地质普查资料',
    sections,
    showDate: true,
  };
});
