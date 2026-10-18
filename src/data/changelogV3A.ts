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

  {
    version: 'v3.22.0',
    date: '2026-06-14',
    items: [
      'B19a: HydroProfile组件 - SVG绘制河北平原典型水文地质剖面图（山前-中部-滨海三带，深度0~600m，支持悬停查看岩性详情）',
      'B19a: Aquifer3D组件 - CSS 3D Transform实现含水层三维结构示意（拖拽旋转、点击查看各层参数）',
      'B19a: 集成HydroProfile到Geology.tsx stratigraphy tab',
      'B19a: 集成Aquifer3D到Geology.tsx aquifer tab',
      'B19b: ContourMap组件 - Canvas 2D IDW插值等值线/等值面图',
      'B19b: TimeAxis组件 - 动态时间轴动画（播放/暂停/调速/拖拽进度）',
      'B19b: 集成ContourMap到Environment.tsx shallow/deep tab（浅层/深层漏斗等值线）',
      'B19b: 集成TimeAxis到Exploitation.tsx trend/milestones tab（开采量演变+治理里程碑）',
    ],
  },

  {
    version: 'v3.21.0',
    date: '2026-06-14',
    items: [
      'B17b: 面包屑增强 - 支持location.state.tab参数锚点显示',
      'B17b: FractureWater/Geothermal/HydroZoneParams页面22个TechTable升级为FilterableTechTable（搜索过滤）',
      'B18: 数据导入面板(DataImportPanel) - CSV/JSON文件导入、解析、预览、删除',
      'B18: 数据标注面板(AnnotationsPanel) - 笔记/勘误/参考/疑问四类标注',
      'B18: 收藏面板(BookmarksPanel) - 页面收藏、搜索快照、分组管理',
      'B18: 数据校验面板(DataValidationPanel) - 字段校验/类型检查/范围验证/枚举校验',
      'B18: 个人工作台(Workspace) - 四Tab集成页面，IndexedDB持久化',
      'B18: Overview全模块入口新增"工作台"快捷按钮',
    ],
  },

  {
    version: 'v3.20.0',
    date: '2026-06-14',
    items: [
      '恢复Overview.tsx中丢失的7个Section区域（基础水文地质资料库/多维数据交叉分析/历史演变/开采管理/水质/冲洪积扇/全模块入口/专业分析工具箱）',
      '新增SectionAccordion包裹可折叠区域（取水许可/机井管理/环境地质问题）',
      '新增全模块入口16模块快速导航网格',
      '新增专业分析工具箱9个深度分析入口',
      '新增冲洪积扇蓄水构造表格、水源地概览图表',
      '新增1990s vs 2024历史对比图表',
      '新增水质演变堆叠图（污染程度+水质类别）',
      '新增各市超采治理成效状态表格',
    ],
  },

{
    version: 'v3.19.0',
    date: '2026-06-13',
    items: [
      'B16数据深挖(续): Resources.tsx新增"开采潜力"Tab(各市开采潜力评价/地下水污染现状/主要污染物检出率与超标率)，利用cityExploitationPotential/cityGroundwaterPollution/pollutantDetectionRates三组数据',
    ],
  },
  {
    version: 'v3.18.0',
    date: '2026-06-13',
    items: [
      'B14技术债务清理: Overview.tsx补全Toast导出通知',
      'B15 PWA离线支持: sw.js升级为完整Service Worker(预缓存44资产/Stale-While-Revalidate/Network First导航/版本检测更新); index.html新增离线提示横幅+安装到桌面按钮+beforeinstallprompt事件; manifest.json更新; 构建后自动生成precache-manifest.json(1.97MB/44资产)',
      'B16数据深挖: Geology.tsx tectonic Tab新增构造单元详表(Ⅰ~Ⅲ级+断裂表)+stratigraphy Tab新增第四系地层系统详表(2统6组); KarstWater.tsx新增4个Tab(岩溶发育深度分区/泉流量动态特征/岩溶泉补给特征/同位素特征与循环深度)',
    ],
  },
  {
    version: 'v3.18.0',
    date: '2026-06-13',
    items: [
      'B14技术债务清理: Overview.tsx补全Toast导出通知',
      'B16数据深挖: Geology.tsx tectonic Tab新增构造单元详表(Ⅰ~Ⅲ级+断裂表)+stratigraphy Tab新增第四系地层系统详表(2统6组); KarstWater.tsx新增4个Tab(岩溶发育深度分区/泉流量动态特征/岩溶泉补给特征/同位素特征与循环深度)',
    ],
  },
  {
    version: 'v3.17.0',
    date: '2026-06-13',
    items: [
      'P0激活hydrogeologyHistorical.ts沉睡数据(22导出→22导出全页面引用): HydroZoneParams新增历史泉水Tab(126条泉水+径流模数图)+经典参考Tab扩展7面板(K值/出水率/盆地/岩溶/水库/岩石力学/深层水); Geology地层Tab新增historicalStratigraphy详表; WaterSource新增灌区概况Tab(大型灌区+中型灌区分地区); Hydrochemistry新增离子迁移率Tab+承德水化学Tab+电阻率详表Tab+物探Tab扩展岩性电阻率/分区电阻率',
      'P1 SearchIndex大规模补全(230→527条目): 新增77条目模板(106个map块), 新增7个模块导入(groundwaterFunction/groundwaterResources/backgroundValues/exploitation/geology/geothermal)，补全environment/fractureWater/geology/geothermal/hydroParams/hydrochemistry/karstWater/mineHydrogeology/mineralWater/resources/salineSoil/salineWater/waterQuality/waterSource/hydrogeologyHistorical共18模块的未索引导出，覆盖漏斗区/开采管理/裂隙水案例/构造单元/含水层组/地热类型分区/给水度渗透系数/岩溶系统/矿床分类/盐碱土类型措施成因/咸水分区利用/水质评价污染物/水源地分类标准等重要数据',
    ],
  },
  {
    version: 'v3.16.0',
    date: '2026-06-13',
    items: [
      'mineHydrogeology.ts突水案例扩充(5条→10条): 新增东庞矿2003陷落柱突水(1167m³/min)、西石门铁矿2009岩溶突水(26000m³/20min)、迁西桃树峪铁矿2022透水(14死/3508万)、迁安马兰庄铁矿2023透水(3失联); 范各庄矿1984案例细化(陷落柱直径47~67m/空洞3.9万m³)',
    ],
  },
{
    version: 'v3.15.0',
    date: '2026-05-29',
    items: [
      'geothermal.ts深化(6.8KB→16.7KB): 新增geothermalGradientZoning(6区地温梯度/热流/分布)、geothermalFluidChemistry(6地热田流体化学/水化学类型/TDS/pH/F/SiO₂/H₂S/结垢/腐蚀)、geothermalTempProfile(5地热田500~3000m温度垂向分布)、geothermalHistory(6阶段开发沿革)、cityGeothermalPotential(10市潜力评估/优先级)、reinjectionDataExtended(5地热田回灌扩展数据)、geothermalResourceByZone(6区资源量统计)',
      'Geothermal.tsx页面增强(24.0KB→37.8KB): 新增"地温梯度"Tab(梯度分区表+温度垂向分布+开发沿革时间线)、"流体化学"Tab(6地热田流体化学详表)、"潜力评估"Tab(10市潜力表+资源分区统计+回灌扩展表)',
      'SearchIndex更新: 新增地热6条搜索条目',
    ],
  },
{
    version: 'v3.14.0',
    date: '2026-05-29',
    items: [
      'karstWater.ts深化(6.7KB→10.6KB): 新增karstDevelopmentDepth(5区岩溶发育深度分带)、springFlowDynamics(5个泉域流量动态/衰减系数/调节类型)、karstRechargeFeatures(5个泉域补给项构成/入渗系数)、karstIsotopeFeatures(5个泉域δD/δ18O/氚/14C/年龄/循环深度)',
      'salineWater.ts深化(5.6KB→8.8KB): 新增salineBody3D(咸水体三维分布/3种垂向类型/顶板埋深/厚度分区)、citySalineArea(8市咸水面积统计)、salineUtilizationCurrent(4类咸水利用现状)',
      'SearchIndex更新: 新增岩溶水4条+咸水3条搜索条目',
    ],
  },
{
    version: 'v3.13.1',
    date: '2026-05-29',
    items: [
      'Geology.tsx页面增强(46.9KB→50.8KB): 新增"地质发展史"Tab(三大演化阶段时间线/12个关键地质事件/河北平原四阶段形成演化), 引用geologicalHistory+plainEvolution',
      'Resources.tsx页面增强(80.6KB→85.7KB): 水均衡Tab补充cityExploitationPotential(9市开采潜力表)+potentialZoneSummary(三区统计卡片)+cityGroundwaterPollution(11市污染评价表)',
    ],
  },
{
    version: 'v3.13.0',
    date: '2026-05-29',
    items: [
      'P1-2 地下水资源评价模块深化(groundwaterResources.ts 12.7KB): 新增cityExploitationPotential(9市开采潜力/超采量/潜力指数)、potentialZoneSummary(有潜力区11549km²/平衡区5171km²/超采区56409km²+6项挖潜措施41.12亿m³)、cityGroundwaterPollution(11市污染分区面积+主要污染物+趋势)、pollutantDetectionRates(5项污染物检出率/超标率)、wastewaterDischarge1999(18.9亿t/a分流域), 数据来源《中国地下水资源 河北卷》(2005)第五、六章',
      'P1-2 geology.ts深化(15.3KB→21.0KB): 新增geologicalHistory(三大演化阶段/基底形成/盖层发展/强烈活动/含12个关键地质事件时间表)、plainEvolution(河北平原四阶段形成演化), 数据来源《区域地质志》(1982)第五篇',
      'SearchIndex更新: 新增开采潜力2条+污染评价3条搜索条目',
    ],
  },
{
    version: 'v3.12.1',
    date: '2026-05-29',
    items: [
      'P1-2 地下水资源评价模块深化(groundwaterResources.ts 12.7KB): 新增cityExploitationPotential(9市开采潜力/超采量/潜力指数)、potentialZoneSummary(有潜力区11549km²/平衡区5171km²/超采区56409km²+6项挖潜措施41.12亿m³)、cityGroundwaterPollution(11市污染分区面积+主要污染物+趋势)、pollutantDetectionRates(5项污染物检出率/超标率)、wastewaterDischarge1999(18.9亿t/a分流域), 数据来源《中国地下水资源 河北卷》(2005)第五、六章',
      'SearchIndex更新: 新增开采潜力2条+污染评价3条搜索条目',
    ],
  },
{
    version: 'v3.12.0',
    date: '2026-05-29',
    items: [
      'P1-2 地下水资源评价模块深化(groundwaterResources.ts 7.3KB): 新增cityGroundwaterExtraction2000(9市分类型开采量)、shallowWaterQualityByClass(5类水质面积占比)、hydrogeologicalParams(5项参数分区值), 数据来源《中国地下水资源 河北卷》(2005)',
      'P1-2 Resources.tsx页面增强: 71.4KB→80.6KB, 新增"水均衡"Tab(补给/排泄项构成+9市水均衡表+9市开采量表+水质分类+水文地质参数)',
      'SearchIndex更新: 新增地下水资源评价4条搜索条目',
    ],
  },
{
    version: 'v3.11.1',
    date: '2026-05-29',
    items: [
      'P1-2 地下水资源评价模块(groundwaterResources.ts, 7.1KB): 河北平原水均衡总表(1991-2000, 补给112.37/排泄129.32/超采16.95亿m³/a)、9市潜水-微承压水均衡(按矿化度<1/1~3/3~5g/L分级)、咸淡水分布面积统计(淡水32826km²/微咸水29016km²/半咸水7503km²)、水文地质参数(渗透系数/给水度/释水系数/入渗系数), 数据来源《中国地下水资源 河北卷》(2005)',
      'SearchIndex更新: 新增地下水资源评价4条搜索条目',
    ],
  },
{
    version: 'v3.11.0',
    date: '2026-05-29',
    items: [
      'P1-1 Geology.tsx页面增强: 33.7KB→46.9KB, 新增功能分区Tab(超采区划/禁限采/水位回升/功能区划)和背景值Tab(3分区16项背景值/11市超标因子/GB14848标准限值), 引用groundwaterFunction+backgroundValues数据模块',
      'SearchIndex更新: 新增地下水功能分区6条+背景值4条搜索条目',
    ],
  },
{
    version: 'v3.10.1',
    date: '2026-05-29',
    items: [
      'P0-3 地下水功能分区模块(groundwaterFunction.ts, 8KB): 超采区总体概况(69693km²/11市分布)、禁止开采区与限制开采区(4禁采+4限采)、水位回升动态(2019-2023深层+9.67m浅层+3.72m)、地下水功能区划(开发区/保护区/保留区/治理区), 数据来源河北省人民政府2022年通知',
      'P0-3 地下水环境背景值模块(backgroundValues.ts, 7.9KB): 浅层/深层各3个水文地质分区(山前/中部/滨海)共6套背景值(含pH/TDS/硬度/Cl/SO4/HCO3/Na/Ca/Mg/三氮/F/Fe/Mn/As/Cr6+等16项)、11市超标因子统计、GB/T 14848-2017标准限值对照表(13项指标5类)',
      'SearchIndex更新: 新增地下水功能分区6条+背景值4条搜索条目',
    ],
  },
{
    version: 'v3.10.0',
    date: '2026-05-29',
    items: [
      'P0-1 城市命名统一: 11市+定州+辛集统一为裸名(保定/唐山/廊坊/张家口/承德/沧州/石家庄/秦皇岛/衡水/邢台/邯郸/定州/辛集), 542处替换, 13个数据文件',
      'P0-2 geology.ts深化: 4.7KB→15.3KB, 新增quaternaryStratigraphy(河北平原第四系6组+坝上4组)、tectonicUnitsDetailed(中朝准地台/华北断拗5个Ⅲ级单元)、majorFaults(5条主要断裂)、bedrockSummary(太古界-新生界8个地层), 数据来源《河北省北京市天津市区域地质志》(1982)',
    ],
  },
{
    version: 'v3.9.3',
    date: '2026-05-29',
    items: [
      'H-1 性能优化: vite.config.ts数据chunk拆分(data-modules 309KB→189KB + data-resources 81KB独立 + data-search 43KB独立), 首屏加载减少120KB',
      'H-2 搜索覆盖补全: workspace新增4条(数据导入/标注/收藏/校验) + county-compare新增3条(总览/农业/依赖度), 总条目168条',
      'H-3 链接完整性终审: 23路由全部有效, 209+7=168条搜索条目(实际去重后), 0无效路径',
    ],
  },
{
    version: 'v3.9.2',
    date: '2026-05-29',
    items: [
      'F-1 无障碍增强: App.tsx添加skip-to-content跳转链接(键盘Tab可达,焦点时显示蓝色跳转按钮)',
      'F-2 打印适配优化: index.css新增D级图表分页保护(scan-line/ResponsiveContainer break-inside:avoid) + 表格行/表头分页保护 + 雷达图/散点图SVG颜色强制 + SectionTitle打印适配',
      'F-3 无障碍增强: GlobalSearch结果面板添加role=listbox + aria-live屏幕阅读器结果计数播报',
    ],
  },
{
    version: 'v3.9.2',
    date: '2026-05-29',
    items: [
      'E-1 CrossLink页面关联补全: 补全/map、/workspace、/county-compare、/changelog、/首页五个缺失路由的pageRelations映射',
      'E-2 SearchIndex搜索索引更新: 新增C-1水质达标率(11市)、C-3地面沉降(11市)、C-5同位素样点(21条)、C-5电阻率-矿化度(5级)、D级数据分析入口(5条)等约53条搜索条目',
      'E-3 Overview深度分析入口面板: 新增9项专业分析工具箱快捷入口(市级达标率/InSAR沉降/参数速查/同位素分析/数据质量雷达/三轴耦合/四维联动/县级资源/县级覆盖)',
    ],
  },
{
    version: 'v3.9.1',
    date: '2026-05-28',
    items: [
      'C-5 同位素丰富化: Hydrochemistry同位素Tab新增δD-δ18O ScatterChart散点图(GMWL/LMWL ReferenceLine斜线+4类含水层分区着色)',
      'C-5 同位素丰富化: 新增δ18O径向路径ComposedChart(山前→滨海) + 14C年龄-深度剖面ComposedChart',
      'C-5 同位素丰富化: 新增21个典型同位素采样点FilterableTechTable(含水层类型/δ18O/δD/氚/年龄/补给来源)',
      'C-5 同位素丰富化: 同位素水文地质意义解读4卡片(蒸发富集/古水识别/补给高程/补给时间)',
      'C-5 数据层: hydrochemistry.ts补充isotopeSamples(21样品)+delta18OPathway(6站点)+carbon14AgeDepth(6层)+gmwl/lmwl+resistivityMineralization(5级)',
    ],
  },
  {
    version: 'v3.8.2',
    date: '2026-05-28',
    items: [
      'C-4 参数速查: HydroZoneParams参数总览Tab新增速查面板(4类介质KPI+K值量级柱图8种岩性+释水系数5层+4快速取值卡片+入渗系数速查条)',
    ],
  },
  {
    version: 'v3.8.1',
    date: '2026-05-28',
    items: [
      'C-3 沉降更新: Environment沉降Tab新增2024 InSAR监测面板(4 KPI+11市速率柱图+沉降-开采关联ComposedChart双Y轴+监测明细表+分析结论4卡)',
      'C-3 数据层: environment.ts补充landSubsidence2024(11市)+subsidenceRateTrend(2014-2024)',
    ],
  },
  {
    version: 'v3.8.0',
    date: '2026-05-28',
    items: [
      'C-1 市级达标率: WaterQuality新增"市级达标率"Tab(4 KPI+11市达标率柱图三色分级+水质-供水量-水位三轴关联ComposedChart+评价明细表+分析结论4卡)',
      'C-1 数据层: waterQuality.ts补充cityGroundwaterQuality2024(11市)+qualityLevelTrend2020_2024(5年)',
    ],
  },
{
    version: 'v3.7.0',
    date: '2026-05-28',
    items: [
      'B-4 功能增强: DataInsight新增"县级资源分析"Tab(5市85县用水结构/地下水依赖度排名/农业占比/降水关联散点)',
      'B-5 功能增强: MapView新增"县级数据覆盖"图层(14市数据状态色标+弹窗统计/绿=已入库/黄=待补充/灰=无数据)',
      'B-6 功能增强: Overview新增县级降水数据摘要面板(最高Top5/最低Top5/平均降水)',
      '主题修复: Tailwind颜色token从硬编码hex改为CSS变量引用,实现暗色/亮色主题自动切换',
      '主题修复: 亮色主题对比度优化(--gw-muted加深至#475569/--gw-text加深至#0f172a/--gw-border加深至#cbd5e1)',
      '主题修复: 全量替换4个组件中58处硬编码gray/slate class为gw-主题变量(Resources/CountyWaterCompare/DataDashboard/InstallPrompt)',
      '主题修复: 新增gw-bg颜色token(--gw-bg:dark=#060d1a/light=#f0f4f8),修复Overview中bg-gw-bg未定义问题',
    ],
  },
    {
    version: 'v3.6.0',
    date: '2026-05-23',
    items: [
      'A级数据补全: 承德市降水量全11县区数据入库(降水/地表水/地下水/用水量)',
      'A级数据补全: 沧州市降水量全16县区数据入库(扫描版PDF OCR提取)',
      'A级数据补全: 唐山(13)/秦皇岛(7)/邯郸(17)/张家口(16)/廊坊(10)/衡水(11)县级骨架数据录入',
      'B级功能增强: Overview页面新增县级公报数据覆盖卡片+14市状态色标',
      'B级功能增强: Overview快速入口新增“县级对比”链接',
      'B级功能增强: CountyWaterCompare骨架数据提示+图表条件隐藏+市级标签标记',
      'B级功能增强: CountyWaterCompare跨市对比新增降水量对比图+明细表增加降水列',
      'B级功能增强: Resources县级表格单位修正+数据状态标记+降水量柱状图',
    ],
  },
  {
    version: 'v3.5.2',
    date: '2026-05-20',
    items: [
      '历史数据入库: 秦皇岛市2022年水资源公报数据(cityBulletin2022)',
      '历史数据入库: 含7县2开发区用水量/地下水供水量/平原区埋深数据',
      '数据来源: 秦皇岛市水利局swj.qhd.gov.cn(2022年公报PDF, 9页)',
    ],
  },
  {
    version: 'v3.5.1',
    date: '2026-05-19',
    items: [
      '县级对比扩展: 用水部门结构图/地下水占比图从Top15扩展为全部县(动态高度)',
      '县级对比扩展: 雷达图从Top5扩展为Top8县多维对比',
      '县级对比增强: 跨市明细表支持点击表头排序(9列全可排序)',
      '县级对比优化: 移除"仅显示前15个"截断提示,badge显示实际县数',
    ],
  },
  {
    version: 'v3.5',
    date: '2026-05-19',
    items: [
      '县级数据对比: CountyWaterCompare页面(5市85县用水结构/供水分析/跨市排行)',
      '县级数据对比: 用水总量排行/用水部门结构/地下水占比(红>80%橙>60%绿<60%)',
      '县级数据对比: 用水量vs地下水依赖度散点图/Top5县雷达图多维对比',
      '县级数据对比: 跨市对比模式(各市总量对比/地下水依赖度/Top30全省排行)',
      '县级数据对比: 保定专属地下水埋深变幅图(18县depth2023-2024)',
      '数据修复: Resources.tsx 56处TS类型错误修复(字段名对齐resources.ts)',
      '版本同步: index.html/PrintFooter/App.tsx底部 v3.3→v3.4',
    ],
  },
  {
    version: 'v3.9.0',
    date: '2026-05-19',
    items: [
      '个人工作台: Workspace页面(4 Tab集成数据导入/标注/收藏/校验)',
      'IndexedDB初始化: useStoreInit Hook(App启动自动初始化)',
      '数据导入: DataImportPanel组件(CSV/JSON拖拽上传/解析/预览/标签)',
      '数据标注: AnnotationsPanel组件(笔记/修正/参考/问题四类标注)',
      '收藏管理: BookmarksPanel组件(页面收藏/分组筛选/导航跳转)',
      '数据校验: DataValidationPanel组件(6类校验规则/内置模板/校验报告)',
      '路由注册: Workspace页面(/workspace)集成侧边栏导航',
    ],
  },
];
