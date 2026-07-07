/**
 * 水资源公报简报报告生成器
 *
 * 注册为 'resources' 类型报告。
 * 数据通过 useReportData 预采集缓存传入。
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';

registerReportGenerator('resources', (data) => {
  const sections: ReportConfig['sections'] = [];

  // ============================================================
  // 第一章：水资源概况
  // ============================================================
  const summary = data.summary as Record<string, unknown>;
  sections.push({
    title: '水资源概况',
    level: 1,
    content: [
      ...buildParagraphs([
        `2024年河北省年降水量 ${summary.rainfallValue}mm，较多年均值变化 ${summary.rainfallChange}。水资源总量 ${summary.totalResourceValue} 亿m³，较多年均值 ${summary.totalResourceChange}。`,
        `其中地表水资源量 ${summary.surfaceWaterValue} 亿m³，地下水资源量 ${summary.groundwaterValue} 亿m³，人均水资源量 ${summary.perCapitaValue} m³/人。`,
      ]),
      ...buildTable(
        [{ header: '指标' }, { header: '数值' }, { header: '单位' }, { header: '较多年均值变化' }],
        [
          ['年降水量', String(summary.rainfallValue), 'mm', String(summary.rainfallChange)],
          ['水资源总量', String(summary.totalResourceValue), '亿m³', String(summary.totalResourceChange)],
          ['地表水资源量', String(summary.surfaceWaterValue), '亿m³', String(summary.surfaceWaterChange)],
          ['地下水资源量', String(summary.groundwaterValue), '亿m³', String(summary.groundwaterChange)],
          ['人均水资源量', String(summary.perCapitaValue), 'm³/人', '—'],
          ['径流系数', String(summary.runOffCoeff), '', '—'],
          ['径流模数', String(summary.runOffModule), '万m³/km²', '—'],
        ],
        { caption: '表1 2024年河北省水资源概况' }
      ),
    ],
  });

  // ============================================================
  // 第二章：各市水资源量
  // ============================================================
  const cityResources = data.cityResources as Array<{ city: string; surface: number; ground: number; total: number; coeff: number }> | undefined;
  if (cityResources && cityResources.length > 0) {
    sections.push({
      title: '各市水资源量',
      level: 1,
      content: [
        ...buildParagraphs(['2024年河北省各市水资源量统计如下表所示。']),
        ...buildTable(
          [{ header: '城市' }, { header: '地表水(亿m³)' }, { header: '地下水(亿m³)' }, { header: '总量(亿m³)' }, { header: '径流系数' }],
          cityResources.map(d => [d.city, d.surface.toFixed(2), d.ground.toFixed(2), d.total.toFixed(2), d.coeff.toFixed(2)]),
          { caption: '表2 各市水资源量统计' }
        ),
      ],
    });
  }

  // ============================================================
  // 第三章：供水结构
  // ============================================================
  const citySupply = data.citySupply as Array<{ city: string; gwSupply: number; totalSupply: number; gwRatio: number }> | undefined;
  if (citySupply && citySupply.length > 0) {
    // 计算全省合计
    const totalGW = citySupply.reduce((s, d) => s + d.gwSupply, 0);
    const totalAll = citySupply.reduce((s, d) => s + d.totalSupply, 0);
    const avgRatio = totalAll > 0 ? (totalGW / totalAll * 100).toFixed(1) : '—';

    sections.push({
      title: '供水结构',
      level: 1,
      content: [
        ...buildParagraphs([
          `2024年河北省 ${citySupply.length} 市总供水量 ${totalAll.toFixed(2)} 亿m³，其中地下水供水量 ${totalGW.toFixed(2)} 亿m³，地下水占比 ${avgRatio}%。`,
          '各市供水量及地下水占比详见下表。',
        ]),
        ...buildTable(
          [{ header: '城市' }, { header: '总供水(亿m³)' }, { header: '地下水供水(亿m³)' }, { header: '地下水占比(%)' }],
          citySupply.map(d => [d.city, d.totalSupply.toFixed(2), d.gwSupply.toFixed(2), d.gwRatio.toFixed(1)]),
          { caption: '表3 各市供水结构' }
        ),
      ],
    });
  }

  // ============================================================
  // 第四章：地下水动态
  // ============================================================
  const gwDynamic = data.gwDynamic as Record<string, unknown> | undefined;
  if (gwDynamic) {
    sections.push({
      title: '地下水动态',
      level: 1,
      content: [
        ...buildParagraphs([
          `2024年河北省平原区浅层地下水位平均回升 ${gwDynamic.shallowLevelRise}m，回升区面积占比 ${gwDynamic.shallowRiseArea}%，稳定区 ${gwDynamic.shallowStableArea}%，下降区 ${gwDynamic.shallowDeclineArea}%。`,
          `深层地下水位平均回升 ${gwDynamic.deepLevelRise}m，平原区地下水储存量增加 ${gwDynamic.plainStorageChange} 亿m³。`,
          `超采区深层水位回升 ${gwDynamic.overExploitDeepRise}m，浅层回升 ${gwDynamic.overExploitShallowRise}m，严重超采区面积减少 ${gwDynamic.overExploitAreaReduction}%。`,
          `2024年地下水开采量 ${gwDynamic.currentTotal} 亿m³，较1990年代峰值 ${gwDynamic.historicalExploitPeak} 亿m³ 下降 ${gwDynamic.declinePercent}%。`,
        ]),
        ...buildTable(
          [{ header: '指标' }, { header: '数值' }, { header: '单位' }],
          [
            ['浅层水位平均回升', String(gwDynamic.shallowLevelRise), 'm'],
            ['深层水位平均回升', String(gwDynamic.deepLevelRise), 'm'],
            ['回升区面积占比', String(gwDynamic.shallowRiseArea), '%'],
            ['稳定区面积占比', String(gwDynamic.shallowStableArea), '%'],
            ['下降区面积占比', String(gwDynamic.shallowDeclineArea), '%'],
            ['平原区储存量变化', String(gwDynamic.plainStorageChange), '亿m³'],
            ['当前地下水开采量', String(gwDynamic.currentTotal), '亿m³'],
            ['较峰值下降比例', String(gwDynamic.declinePercent), '%'],
          ],
          { caption: '表4 地下水动态特征' }
        ),
      ],
    });
  }

  // ============================================================
  // 第五章：时序变化
  // ============================================================
  const timeSeries = data.timeSeries as Array<{ year: string; total: number; surface: number; ground: number }> | undefined;
  if (timeSeries && timeSeries.length > 0) {
    const first = timeSeries[0];
    const last = timeSeries[timeSeries.length - 1];
    const totalChange = last.total - first.total;
    const totalChangePct = first.total > 0 ? ((totalChange / first.total) * 100).toFixed(1) : '—';

    sections.push({
      title: '水资源时序变化',
      level: 1,
      content: [
        ...buildParagraphs([
          `${first.year} 年至 ${last.year} 年，河北省水资源总量从 ${first.total.toFixed(1)} 亿m³ 变化至 ${last.total.toFixed(1)} 亿m³，变化 ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(1)} 亿m³（${totalChangePct}%）。`,
        ]),
        ...buildTable(
          [{ header: '年份' }, { header: '总量(亿m³)' }, { header: '地表水(亿m³)' }, { header: '地下水(亿m³)' }],
          timeSeries.map(d => [d.year, d.total.toFixed(1), d.surface.toFixed(1), d.ground.toFixed(1)]),
          { caption: '表5 水资源总量时序变化' }
        ),
      ],
    });
  }

  // ============================================================
  // 第六章：结论
  // ============================================================
  sections.push({
    title: '小结',
    level: 1,
    content: buildParagraphs([
      (data.conclusion as string) || '2024年河北省降水量偏丰，水资源总量较多年均值显著增加。地下水水位持续回升，超采治理成效显著。建议继续推进地下水超采综合治理，优化供水结构，提高水资源利用效率。',
    ]),
  });

  return {
    title: '河北省水资源公报简报',
    subtitle: '基于2024年河北省水资源公报',
    sections,
    showDate: true,
  };
});
