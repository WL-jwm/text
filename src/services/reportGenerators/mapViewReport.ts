/**
 * 空间地图综合报告生成器
 * 包含: 标注分布统计 / 系统区划 / 超采区划 / 资源量分级 / 综合分析
 */
import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';
import {
  springMarkers, geothermalMarkers, salineMarkers, waterSourceMarkers,
  mineMarkers, allMarkers, mapZones,
} from '../../data/mapData';
import {
  overdraftPolygons, getCityResourceGrades, getCityAggregatedInfo,
  gradeLabels,
} from '../../data/mapDataEnhanced';

registerReportGenerator('mapView', (_data) => {
  const sections: ReportConfig['sections'] = [];
  const markers = allMarkers();
  const grades = getCityResourceGrades().sort((a, b) => b.groundResource - a.groundResource);

  const categoryCounts = {
    spring: springMarkers.length,
    geothermal: geothermalMarkers().length,
    saline: salineMarkers.length,
    waterSource: waterSourceMarkers.length,
    mine: mineMarkers.length,
  };

  const shallowCount = overdraftPolygons.filter(p => p.type === 'shallow-general').length;
  const deepGeneralCount = overdraftPolygons.filter(p => p.type === 'deep-general').length;
  const deepSevereCount = overdraftPolygons.filter(p => p.type === 'deep-severe').length;
  const severeCities = ['保定', '沧州', '廊坊', '衡水'];

  // ============================================================
  // 第一章：标注分布统计
  // ============================================================
  sections.push({
    title: '标注分布统计',
    level: 1,
    content: [
      ...buildParagraphs([
        `平台共收录${markers.length}个地下水相关空间标注，涵盖泉域、地热田、咸水区、水源地和矿区5大类别。标注数据来源于河北省地下水系统区划(1999)及水资源公报(2024)。地图以天地图为底图，支持标注切换、图层控制、搜索定位等交互功能。`,
      ]),
      ...buildTable(
        [{ header: '类别' }, { header: '数量' }, { header: '说明' }],
        [
          ['泉域', String(categoryCounts.spring), '岩溶大泉/孔隙泉，含涞源泉/百泉/黑龙洞泉等10处'],
          ['地热田', String(categoryCounts.geothermal), '沉积盆地/隆起断裂/山间盆地，共8处'],
          ['咸水区', String(categoryCounts.saline), '滨海/冲湖积/冲积平原，6个区域代表点'],
          ['水源地', String(categoryCounts.waterSource), '孔隙水/岩溶水/深层水，12个主要水源地'],
          ['矿区', String(categoryCounts.mine), '煤矿/铁矿，8处矿区水文标注'],
          ['合计', String(markers.length), '-'],
        ],
        { caption: '表1 标注分类统计' }
      ),
    ],
  });

  // 标注清单
  sections.push({
    title: '标注清单',
    level: 2,
    content: [
      ...buildTable(
        [{ header: '名称' }, { header: '类型' }, { header: '分类' }, { header: '纬度' }, { header: '经度' }, { header: '描述' }],
        markers.map(m => [m.name, m.type, m.category, m.lat.toFixed(4), m.lng.toFixed(4), m.description]),
        { caption: '表2 标注清单' }
      ),
    ],
  });

  // ============================================================
  // 第二章：地下水系统区划
  // ============================================================
  sections.push({
    title: '地下水系统区划',
    level: 1,
    content: [
      ...buildParagraphs([
        `河北省共划分${mapZones.length}个地下水系统区（I~X），从内陆河到古黄河依次编号，总面积约18.8万km²。各系统区在水文地质条件、补排关系、水质特征等方面差异显著。`,
      ]),
      ...buildTable(
        [{ header: '编号' }, { header: '名称' }, { header: '面积' }, { header: '说明' }],
        mapZones.map(z => [z.code, z.name, z.info.split('|')[0].trim(), z.info.split('|').slice(1).join('|').trim()]),
        { caption: '表3 地下水系统区划' }
      ),
    ],
  });

  // ============================================================
  // 第三章：超采区划
  // ============================================================
  sections.push({
    title: '超采区划',
    level: 1,
    content: [
      ...buildParagraphs([
        `根据河北省人民政府2022年公布数据，全省超采区总面积69,693.3km²，其中浅层一般超采区36,669.5km²、深层一般超采区42,157.8km²（含严重超采区），浅深层重叠面积9,134km²。`,
        `浅层一般超采区涉及${shallowCount}个市区，深层一般超采区涉及${deepGeneralCount}个市区，深层严重超采区涉及${deepSevereCount}个市区。深层严重超采集中在${severeCities.join('、')}4市，其中沧州和衡水全市深层覆盖。`,
      ]),
      ...buildTable(
        [{ header: '城市' }, { header: '浅层类型' }, { header: '深层类型' }, { header: '备注' }],
        [
          ['石家庄', '一般超采区', '无', '山前平原浅层超采'],
          ['唐山', '一般超采区', '一般超采区', '浅深层均有超采'],
          ['秦皇岛', '一般超采区', '无', '范围较小'],
          ['邯郸', '一般超采区', '一般超采区', '浅深层基本重叠'],
          ['邢台', '一般超采区', '一般超采区', '大范围重叠'],
          ['保定', '一般超采区', '严重超采区', '浅层一般+深层严重'],
          ['张家口', '一般超采区', '无', '坝上地区'],
          ['承德', '一般超采区', '无', '范围有限'],
          ['沧州', '无', '严重超采区', '深层严重，浅层无超采'],
          ['廊坊', '一般超采区', '严重超采区', '浅层一般+深层严重'],
          ['衡水', '一般超采区', '严重超采区', '全市深层覆盖'],
        ],
        { caption: '表4 各市超采区类型一览' }
      ),
    ],
  });

  // ============================================================
  // 第四章：城市资源量分级
  // ============================================================
  sections.push({
    title: '城市地下水资源量分级',
    level: 1,
    content: [
      ...buildParagraphs([
        `基于2024年水资源公报，对全省11个设区市地下水资源量进行5级分级（1=丰富≥20亿m³，2=较丰富15~20，3=中等11~15，4=较少8~11，5=匮乏<8）。`,
        `资源量最丰富为${grades[0]?.city}（${grades[0]?.groundResource.toFixed(2)}亿m³），最匮乏为${grades[grades.length - 1]?.city}（${grades[grades.length - 1]?.groundResource.toFixed(2)}亿m³）。`,
      ]),
      ...buildTable(
        [{ header: '城市' }, { header: '地下水资源(亿m³)' }, { header: '供水量(亿m³)' }, { header: '占比(%)' }, { header: '总供水(亿m³)' }, { header: '等级' }],
        grades.map(g => {
          const info = getCityAggregatedInfo(g.city);
          return [
            g.city,
            g.groundResource.toFixed(2),
            info ? info.gwSupply.toFixed(2) : '-',
            info ? info.gwRatio.toFixed(1) + '%' : '-',
            info ? info.totalSupply.toFixed(2) : '-',
            `等级${g.grade} (${gradeLabels[g.grade]})`,
          ];
        }),
        { caption: '表5 各市地下水资源量分级' }
      ),
    ],
  });

  // ============================================================
  // 第五章：综合分析
  // ============================================================
  sections.push({
    title: '综合分析',
    level: 1,
    content: [
      ...buildParagraphs([
        '河北省地下水空间分布呈现显著地域差异：',
        `1. 资源量方面：保定、唐山、承德地下水资源量位居前三（均>15亿m³），张家口、沧州、衡水相对匮乏（<15亿m³），其中衡水最低（8.41亿m³），与其地处深层严重超采区的地位一致。`,
        `2. 超采格局：深层严重超采集中在${severeCities.join('、')}4市，其中沧州和衡水全市深层覆盖。保定深层严重超采区集中在蠡县-高阳-雄县一带。`,
        '3. 供水结构：张家口地下水供水占比最高(68.9%)，主要依赖地下水；沧州最低(18.7%)，受益于南水北调地表水替代。全省整体地下水供水占比呈下降趋势。',
        '4. 标注分布：10处岩溶泉域集中分布在太行山前，其中百泉已干涸，反映超采对泉域的严重影响。8处地热田主要分布在冀中坳陷和太行山前断裂带。',
      ]),
    ],
  });

  return {
    title: '河北省地下水 · 空间地图综合报告',
    sections,
  };
});
