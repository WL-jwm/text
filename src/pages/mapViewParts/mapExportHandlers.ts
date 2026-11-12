/**
 * 拆分自 MapView.tsx — 标注/超采区/资源分级/水源地/岩溶泉 Excel 导出处理函数集合
 */

import { karstSprings } from '../../data/karstWater';
import {
  type MapMarker,
  allMarkers,
  getVisibleMarkers,
  springMarkers,
  waterSourceMarkers,
  salineMarkers,
  geothermalMarkers,
  mineMarkers,
} from '../../data/mapData';
import { type CityResourceGrade, gradeLabels, overdraftPolygons } from '../../data/mapDataEnhanced';
import { importantWaterSources } from '../../data/waterSource';
import { exportExcel } from '../../utils/exportUtils';

interface MapExportDeps {
  notify: (msg: string) => void;
  visibleLayers: Set<string>;
  cityGrades: CityResourceGrade[];
}

/** 各标注分类统计（供地图区域统计条渲染） */
export function buildCategoryStats() {
  return [
    { label: '泉域', count: springMarkers.length, color: '#10b981', key: 'spring' },
    { label: '地热田', count: geothermalMarkers().length, color: '#ef4444', key: 'geothermal' },
    { label: '咸水区', count: salineMarkers.length, color: '#f59e0b', key: 'saline' },
    { label: '水源地', count: waterSourceMarkers.length, color: '#06b6d4', key: 'waterSource' },
    { label: '矿区', count: mineMarkers.length, color: '#8b5cf6', key: 'mine' },
  ];
}

/** 按关键词过滤标注（名称/类型/描述/分类四字段模糊匹配） */
export function filterMarkersByKeyword(searchText: string): MapMarker[] {
  return searchText.length > 0
    ? allMarkers().filter(m =>
        m.name.includes(searchText) ||
        m.type.includes(searchText) ||
        m.description.includes(searchText) ||
        m.category.includes(searchText)
      )
    : allMarkers();
}

/** 生成 6 个导出处理函数 */
export function buildMapExportHandlers({ notify, visibleLayers, cityGrades }: MapExportDeps) {
  /** 导出标注数据 */
  const handleExportMarkers = () => {
    exportExcel(
      ['名称', '类型', '分类', '纬度', '经度', '描述'],
      allMarkers().map(m => [m.name, m.type, m.category, m.lat.toFixed(4), m.lng.toFixed(4), m.description]),
      '河北地下水地图标注',
      '标注数据'
    );
    notify('标注数据已导出');
  };

  /** 导出当前可见标注 */
  const handleExportVisible = () => {
    const visible = getVisibleMarkers(visibleLayers);
    exportExcel(
      ['名称', '类型', '分类', '纬度', '经度', '描述'],
      visible.map(m => [m.name, m.type, m.category, m.lat.toFixed(4), m.lng.toFixed(4), m.description]),
      '河北地下水地图标注_已选' + visible.length + '个',
      '可见标注'
    );
    notify('标注数据已导出');
  };

  /** 导出超采区数据 */
  const handleExportOverdraft = () => {
    exportExcel(
      ['城市', '超采类型', '标签', '说明', '南界纬度', '西界经度', '北界纬度', '东界经度'],
      overdraftPolygons.map(p => [p.city, p.type, p.label, p.info, p.bounds[0][0], p.bounds[0][1], p.bounds[1][0], p.bounds[1][1]]),
      '河北省超采区划数据',
      '超采区'
    );
    notify('超采区数据已导出');
  };

  /** 导出资源量分级数据 */
  const handleExportResource = () => {
    exportExcel(
      ['城市', '地下水资源量(亿m³)', '地下水供水量(亿m³)', '供水占比(%)', '总供水量(亿m³)', '资源等级'],
      cityGrades.map(g => [g.city, g.groundResource, g.gwSupply, g.gwRatio, g.totalSupply, gradeLabels[g.grade]]),
      '河北省城市地下水资源量分级',
      '资源分级'
    );
    notify('资源量分级数据已导出');
  };

  /** 导出水源地POI数据 */
  const handleExportWaterSourcePOI = () => {
    exportExcel(
      ['名称', '类型', '供水量', '单位', '状态', '含水层', '保护区'],
      importantWaterSources.map(ws => [ws.name, ws.type, ws.supply, ws.unit, ws.status, ws.aquifer, ws.protection]),
      '河北省重要水源地',
      '水源地'
    );
    notify('水源地数据已导出');
  };

  /** 导出岩溶泉POI数据 */
  const handleExportKarstSpringPOI = () => {
    exportExcel(
      ['名称', '位置', '流量(m³/s)', '类型', '面积(km²)', '补给面积(km²)', '岩性', 'TDS(g/L)'],
      karstSprings.map(ks => [ks.name, ks.location, ks.discharge, ks.type, ks.area, ks.rechargeArea, ks.lithology, ks.tds]),
      '河北省岩溶大泉',
      '岩溶泉'
    );
    notify('岩溶泉数据已导出');
  };

  return {
    handleExportMarkers,
    handleExportVisible,
    handleExportOverdraft,
    handleExportResource,
    handleExportWaterSourcePOI,
    handleExportKarstSpringPOI,
  };
}
