/**
 * 拆分自 changelog.ts — 数据库变更日志（部分条目）
 */

export const changelogEntries = [
  {
    version: 'v3.27.0',
    date: '2026-06-18',
    changes: [
      '大文件拆分阶段3: DataInsight.tsx Tab面板提取 (1549→638行, -911行, 6个组件到src/components/data-insight/)',
      '大文件拆分阶段4: Resources.tsx Tab面板提取 (1605→287行, -1318行, 8个组件到src/components/resources/)',
      '修复6个组件JSX fragment闭合/条件渲染/import路径/缺失导入等构建错误',
      'DataInsight.tsx: 修复ResourceEnvTab/SupplyStructureTab/CountyAnalysisTab/RegionalCompareTab/OverExploitTab/ClassicDataTab的JSX结构',
      'Resources.tsx: 提取ResourcesOverviewTab/SupplyTab/DynamicTab/TimeseriesTab/BulletinTab/OverexploitTab/BalanceTab/PotentialTab',
      '大文件拆分总进度: 4阶段全部完成, 4个大文件累计减少5129行',
    ],
  },

  {
    version: 'v3.26.0',
    date: '2026-06-18',
    changes: [
      'Overview大文件拆分: 提取8个独立组件到src/components/overview/ (-1081行/-26%)',
      '新增OverExploitMilestones超采治理里程碑组件',
      '新增CrossAnalysis多维数据交叉分析组件',
      '新增AlluvialFansWaterSources冲洪积扇与水源地组件',
      '新增ExploitationControlComparison开采治理对比组件',
      '新增HydrogeologyReferenceLibrary水文地质资料库组件',
      '新增ExploitationManagement开采管理组件',
      '新增HistoricalEvolution历史演变组件',
      '新增PollutionQualityComparison污染水质对比组件',
      'Overview.tsx: 2645行→1564行, 构建产物67.93KB→44.92KB',
    ],
  },
  {
    version: 'v3.25.0',
    date: '2026-06-18',
    changes: [
      'ChartExport图表导出全页面覆盖(19/23, 含Overview/WaterQuality/Geothermal等核心页面)',
      'ErrorBoundary错误边界 - 23个路由全部包裹，防止单组件崩溃白屏',
      'searchIndex.ts拆分为5个模块文件(86KB -> 5×10KB)，提升可维护性',
      'Overview.tsx 4图表集成ChartExport导出按钮',
      'WaterQuality 6图表集成ChartExport导出按钮',
      'Geothermal 5图表集成ChartExport导出按钮',
      'HydroZoneParams 4图表集成ChartExport导出按钮',
      'CountyWaterCompare 6图表集成ChartExport导出按钮',
    ]
  },
  {
    version: 'v3.24.3',
    date: '2026-06-16',
    items: [
      '集成C6: Hydrochemistry(苏卡列夫分类) + KarstWater(开发状态) + FractureWater(类型/富水性分区) + MineHydrogeology(矿区/突水) + SalineWater(咸水分布) + SalineSoil(盐碱地) + MineralWater(产地) + WaterSource(蓄水构造) + SystemZoning(系统分区) 共9个页面添加ChartExport',
    ],
  },

  {
    version: 'v3.24.2',
    date: '2026-06-16',
    items: [
      '集成C6: Environment.tsx 3个tab(浅层漏斗/深层漏斗/地面沉降)导出按钮升级为ChartExport(xlsx/csv/json)',
      '集成C6: Exploitation.tsx 3个区域(页面顶部/开采量明细/机井管理)添加ChartExport',
      '集成C6: Geology.tsx 4个TechCard(含水层组/构造单元/功能区划/超标因子)添加ChartExport',
    ],
  },

  {
    version: 'v3.24.1',
    date: '2026-06-16',
    items: [
      '集成C3+C4: Changelog页面新增"数据源注册表"和"交叉数据校验报告"两个区块',
      '集成C6: Resources页面"各市地下水资源量"图表升级为ChartExport(xlsx/csv/json)',
      '集成C6: DataInsight页面顶部新增统一数据导出按钮(资源-环境关联数据)',
      '集成C7: WaterQuality页面"质量标准"tab添加标准版本选择器(展示GB/T 14848-2017元信息)',
    ],
  },

  {
    version: 'v3.24.0',
    date: '2026-06-16',
    items: [
      'C1: Overview.tsx拆分(5074行→4926行)，useCountUp/KPICard/GaugeCard提取为OverviewHelpers.tsx',
      'C2: dbMeta更新到v3.23.0实际数据(25模块/270导出/30组件/200搜索条目)，兼容Changelog.tsx旧字段',
      'C3: 4个数据模块(hydroParams/zoneParams/searchIndex/backgroundValues)补充标准来源注释',
      'C3: 新增dataSourceRegistry.ts统一管理25个数据模块的来源/年份/频率/可靠度',
      'C4: 新增dataValidation.ts交叉校验模块，4类校验(供水量一致性/漏斗范围/数据新鲜度/源完整性)',
      'C5: index.css新增C5打印样式增强(A4页面/15mm边距/白底深字/隐藏交互/图表避免断页)',
      'C6: 新增ChartExport组件支持xlsx/csv/json/png四格式图表数据导出',
      'C7: 新增standards.ts管理6类国标/行标的版本切换(地下水/地表水/饮用水/土壤/污水/超采)',
      'C8: 搜索索引补充3条缺失模块(hydrogeologyReference/mapData/zoneParams)，覆盖全部25模块',
    ],
  },

  {
    version: 'v3.27.0',
    date: '2026-06-16',
    items: [
      'B20a: 生成《河北省地下水环境信息平台 技术文档 v3.22.0》(Word, 9章/47KB)，涵盖项目概述/技术架构/页面清单/组件文档/数据字典/可视化组件/部署指南/变更日志/构建分析',
      'B20b: 盘点并文档化30个共享组件(289KB)和25个数据模块(233+导出项)',
      'B20c: 编写Nginx部署配置 + PWA缓存策略 + 部署检查清单',
      'B20d: 构建产物分析(45文件/2MB) + 包体积优化建议',
    ],
  },

];
