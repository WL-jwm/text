// H-地热 (调查年限型)
// 数据来源: 1999（基础文献）+ 2024年数据 | 第十章
// 版本: v2.0 | 更新频率: 5-10年更新

/** 地热田一览 */
export const geothermalFields = [
  { id: 1, name: '雄县地热田', location: '雄县', type: '岩溶裂隙型', reservoir: '奥陶系/寒武系灰岩', temperature: '65~85', depth: '1200~2500', area: '320', provenReserves: '2.8×10⁸', utilization: '供暖+洗浴', annualUtilization: '1.2×10⁷', status: '大规模开发' },
  { id: 2, name: '牛驼镇地热田', location: '固安-永清', type: '岩溶裂隙型', reservoir: '蓟县系白云岩', temperature: '70~95', depth: '1000~2000', area: '260', provenReserves: '3.5×10⁸', utilization: '供暖+种植', annualUtilization: '8.5×10⁶', status: '大规模开发' },
  { id: 3, name: '新河地热田', location: '新河县', type: '沉积盆地型', reservoir: '新近系馆陶组砂岩', temperature: '55~72', depth: '1500~2500', area: '180', provenReserves: '1.5×10⁸', utilization: '供暖+养殖', annualUtilization: '3.2×10⁶', status: '规模开发' },
  { id: 4, name: '宁晋-柏乡地热田', location: '宁晋-柏乡', type: '岩溶裂隙型', reservoir: '奥陶系灰岩', temperature: '60~78', depth: '1500~3000', area: '220', provenReserves: '2.1×10⁸', utilization: '供暖+工业', annualUtilization: '5.8×10⁶', status: '规模开发' },
  { id: 5, name: '阳原地热田', location: '阳原县', type: '断裂构造型', reservoir: '花岗岩裂隙', temperature: '45~68', depth: '800~1500', area: '95', provenReserves: '5.0×10⁷', utilization: '洗浴+旅游', annualUtilization: '1.5×10⁶', status: '初期开发' },
  { id: 6, name: '平山地热田', location: '平山县温塘', type: '断裂构造型', reservoir: '片麻岩裂隙', temperature: '58~72', depth: '500~1200', area: '65', provenReserves: '3.0×10⁷', utilization: '温泉旅游+疗养', annualUtilization: '2.0×10⁶', status: '规模开发' },
  { id: 7, name: '赤城地热田', location: '赤城县', type: '断裂构造型', reservoir: '花岗片麻岩', temperature: '52~68', depth: '600~1500', area: '80', provenReserves: '4.5×10⁷', utilization: '温泉旅游+供暖', annualUtilization: '1.8×10⁶', status: '初期开发' },
  { id: 8, name: '蠡县-高阳地热田', location: '蠡县-高阳', type: '沉积盆地型', reservoir: '馆陶组砂岩', temperature: '50~65', depth: '1500~2200', area: '150', provenReserves: '1.2×10⁸', utilization: '供暖', annualUtilization: '4.5×10⁶', status: '规模开发' },
];

/** 地热资源类型分类 */
export const geothermalTypes = [
  { type: '岩溶裂隙型', count: 3, proportion: '37.5%', reservoirTemp: '60~95°C', features: '层状热储，温度高，资源量大，冀中台陷区主要类型', representative: '雄县/牛驼镇/宁晋' },
  { type: '沉积盆地型', count: 2, proportion: '25.0%', reservoirTemp: '50~72°C', features: '砂岩热储，分布广，开发成本低', representative: '新河/蠡县-高阳' },
  { type: '断裂构造型', count: 3, proportion: '37.5%', reservoirTemp: '45~72°C', features: '带状热储，受断裂控制，温度变化大', representative: '平山/赤城/阳原' },
];

/** 地热资源分区 */
export const geothermalZoning = [
  { zone: '冀中台陷地热区', area: '~1200km²', avgTemp: '65~80°C', heatSource: '深部热传导', mainFields: '雄县/牛驼镇/蠡县-高阳', potential: '极高', status: '成熟开发' },
  { zone: '冀南台陷地热区', area: '~500km²', avgTemp: '55~75°C', heatSource: '深部热传导+岩浆余热', mainFields: '宁晋-柏乡/新河', potential: '高', status: '规模开发' },
  { zone: '太行山前断裂地热带', area: '~300km²', avgTemp: '45~68°C', heatSource: '断裂深循环', mainFields: '平山/涉县', potential: '中', status: '旅游开发为主' },
  { zone: '燕山山前断裂地热带', area: '~200km²', avgTemp: '45~68°C', heatSource: '断裂深循环', mainFields: '赤城/阳原/怀来', potential: '中-高', status: '初期开发' },
];

/** 地温梯度数据 */
export const geothermalGradient = [
  { region: '雄县', gradient: '3.5~4.2', unit: '°C/100m', depth1000m: '55~60', depth2000m: '75~85', depth3000m: '100~120', category: '高热流' },
  { region: '牛驼镇', gradient: '3.8~4.5', unit: '°C/100m', depth1000m: '58~65', depth2000m: '80~95', depth3000m: '110~130', category: '高热流' },
  { region: '宁晋', gradient: '3.0~3.5', unit: '°C/100m', depth1000m: '48~55', depth2000m: '65~78', depth3000m: '85~100', category: '中高热流' },
  { region: '新河', gradient: '2.8~3.2', unit: '°C/100m', depth1000m: '45~52', depth2000m: '60~72', depth3000m: '78~92', category: '中热流' },
  { region: '平山', gradient: '2.5~3.5', unit: '°C/100m', depth1000m: '40~55', depth2000m: '55~72', depth3000m: '70~90', category: '中热流' },
  { region: '赤城', gradient: '2.5~3.0', unit: '°C/100m', depth1000m: '38~48', depth2000m: '52~68', depth3000m: '65~85', category: '中热流' },
];

/** 地热开发利用方式 */
export const geothermalUtilization = [
  { use: '地热供暖', scale: '~4500万m²', proportion: '65%', description: '雄县全国首例地热供暖无烟城，替代燃煤供暖', efficiency: 'COP 3.5~4.5(热泵)' },
  { use: '温泉旅游/洗浴', scale: '~120处', proportion: '15%', description: '平山温塘/赤城汤泉/固安温泉城等', efficiency: '直接利用' },
  { use: '农业种植/养殖', scale: '~8000亩', proportion: '10%', description: '温室大棚/热带鱼养殖/食用菌', efficiency: '尾水余热利用' },
  { use: '工业利用', scale: '~50处', proportion: '5%', description: '农产品干燥/纺织印染/石油开采', efficiency: '直接+热泵' },
  { use: '发电(试验)', scale: '2处', proportion: '<1%', description: '双工质发电试验，温度需>90°C', efficiency: '10~15%' },
];

/** 地热资源量统计 */
export const geothermalResources = {
  totalReserves: '~2.8×10¹⁸ J',
  recoverable: '~3.5×10¹⁷ J',
  equivalentCoal: '~1.2×10¹⁰ t 标煤',
  annualReplaceable: '~5.0×10⁶ t 标煤/a',
  heatingPotential: '~2.0×10⁸ m²',
  topProvinces: '全国地热资源第8位',
  basinType: '华北盆地(沉积盆地型)为主',
};

/** 地热回灌数据 */
export const geothermalReinjection = {
  xiongxian: { reinjectionRate: '95%', totalWells: 42, productionWells: 22, reinjectionWells: 20, annualExtraction: '1.2×10⁷m³', annualReinjection: '1.14×10⁷m³', pressureRecovery: '水位回升5~8m/a' },
  niutuozhen: { reinjectionRate: '88%', totalWells: 35, productionWells: 20, reinjectionWells: 15, annualExtraction: '8.5×10⁶m³', annualReinjection: '7.5×10⁶m³', pressureRecovery: '水位回升3~5m/a' },
};


/** 河北省地温梯度分区（据钻孔测温统计） */
export const geothermalGradientZoning = [
  { zone: '冀中坳陷高热流区', gradient: '3.5~5.0°C/100m', heatFlow: '75~95mW/m²', distribution: '雄县/牛驼镇/霸州/固安/永清', feature: '基底隆起区，热流值最高，地热开发核心区', representative: '牛驼镇凸起4.5°C/100m' },
  { zone: '沧县隆起中高热流区', gradient: '3.0~4.0°C/100m', heatFlow: '65~80mW/m²', distribution: '沧州/献县/河间/任丘', feature: '隆起区热流较高，局部有异常', representative: '献县3.8°C/100m' },
  { zone: '黄骅坳陷中热流区', gradient: '2.8~3.5°C/100m', heatFlow: '60~72mW/m²', distribution: '黄骅/海兴/盐山/孟村', feature: '坳陷区热流中等，沉积盖层厚', representative: '黄骅3.0°C/100m' },
  { zone: '临清坳陷中热流区', gradient: '2.8~3.2°C/100m', heatFlow: '58~68mW/m²', distribution: '邯郸东部/邢台东部/衡水南部', feature: '坳陷区热流中等', representative: '宁晋3.2°C/100m' },
  { zone: '太行山隆起低热流区', gradient: '1.5~2.5°C/100m', heatFlow: '40~55mW/m²', distribution: '太行山区/山前地带', feature: '隆起区热流低，但断裂带局部异常', representative: '平山温塘断裂带3.5°C/100m' },
  { zone: '燕山隆起低热流区', gradient: '1.5~2.5°C/100m', heatFlow: '38~52mW/m²', distribution: '燕山山区/坝上高原', feature: '隆起区热流低，断裂带局部异常', representative: '赤城断裂带3.0°C/100m' },
];

/** 地热流体化学特征 */
export const geothermalFluidChemistry = [
  { field: '雄县地热田', waterType: 'Cl·HCO₃-Na型', TDS: '1500~2500', pH: '7.5~8.5', F: '3~8', SiO2: '40~80', H2S: '0.5~2.0', totalMineralization: '矿化度中等', scaling: '中等结垢', corrosion: '弱腐蚀', note: '氟含量较高，需脱氟处理' },
  { field: '牛驼镇地热田', waterType: 'Cl·SO₄-Na型', TDS: '2000~3500', pH: '7.0~8.0', F: '5~12', SiO2: '50~90', H2S: '1.0~3.0', totalMineralization: '矿化度较高', scaling: '中等-严重结垢', corrosion: '中等腐蚀', note: '高氟高矿化，回灌要求高' },
  { field: '宁晋-柏乡地热田', waterType: 'HCO₃·Cl-Na型', TDS: '1000~2000', pH: '7.5~8.2', F: '2~6', SiO2: '30~60', H2S: '0.3~1.0', totalMineralization: '矿化度中等', scaling: '轻度结垢', corrosion: '弱腐蚀', note: '水质较好' },
  { field: '新河地热田', waterType: 'HCO₃-Na型', TDS: '800~1500', pH: '7.8~8.5', F: '1~4', SiO2: '20~50', H2S: '0.1~0.5', totalMineralization: '矿化度较低', scaling: '轻度结垢', corrosion: '弱腐蚀', note: '水质优良' },
  { field: '平山温塘', waterType: 'HCO₃·SO₄-Na·Ca型', TDS: '500~1000', pH: '7.0~8.0', F: '2~5', SiO2: '30~60', H2S: '0.5~2.0', totalMineralization: '低矿化度', scaling: '轻度结垢', corrosion: '弱腐蚀', note: '医疗热矿水，含氡' },
  { field: '赤城汤泉', waterType: 'SO₄·HCO₃-Na型', TDS: '600~1200', pH: '7.5~8.5', F: '3~6', SiO2: '40~70', H2S: '1.0~3.0', totalMineralization: '低矿化度', scaling: '轻度结垢', corrosion: '弱腐蚀', note: '医疗热矿水' },
];

/** 地热井温度垂向分布 */
export const geothermalTempProfile = [
  { field: '雄县', depth500: '42~48', depth1000: '55~62', depth1500: '68~75', depth2000: '78~88', depth2500: '90~100', depth3000: '105~120', reservoir: '奥陶系灰岩' },
  { field: '牛驼镇', depth500: '45~52', depth1000: '58~68', depth1500: '72~82', depth2000: '85~98', depth2500: '100~115', depth3000: '115~135', reservoir: '蓟县系白云岩' },
  { field: '宁晋', depth500: '38~45', depth1000: '50~58', depth1500: '62~70', depth2000: '72~80', depth2500: '82~92', depth3000: '92~105', reservoir: '奥陶系灰岩' },
  { field: '新河', depth500: '35~42', depth1000: '45~55', depth1500: '55~65', depth2000: '65~75', depth2500: '75~85', depth3000: '85~95', reservoir: '馆陶组砂岩' },
  { field: '平山', depth500: '35~45', depth1000: '45~58', depth1500: '55~68', depth2000: '62~75', depth2500: '—', depth3000: '—', reservoir: '片麻岩裂隙' },
];

/** 地热开发历史沿革 */
export const geothermalHistory = [
  { period: '1970s以前', event: '天然温泉利用，平山温塘/赤城汤泉等历史温泉自然出露，民间洗浴疗养', milestone: '传统利用' },
  { period: '1970s-1990s', event: '地质勘查阶段，河北省地矿局开展地热资源普查，发现雄县/牛驼镇等大型地热田', milestone: '资源发现' },
  { period: '1990s-2005', event: '初期开发阶段，地热井钻探增多，主要用于温泉洗浴和供暖试点', milestone: '起步开发' },
  { period: '2005-2015', event: '规模开发阶段，雄县建成全国首例地热供暖无烟城，牛驼镇/宁晋等相继规模开发', milestone: '规模开发' },
  { period: '2015-2020', event: '回灌推广阶段，要求采灌平衡，雄县回灌率达95%，全省回灌率提升至70%+', milestone: '回灌推广' },
  { period: '2020至今', event: '清洁供暖替代阶段，地热纳入河北省清洁能源规划，新增供暖面积500万m²/a', milestone: '能源替代' },
];

/** 各市地热资源潜力评估 */
export const cityGeothermalPotential = [
  { city: '雄安新区(雄县/容城/安新)', gradient: '3.5~4.5', heatFlow: '75~95', recoverable: '8.5×10¹⁶J', heatingArea: '5000万m²', development: '大规模', priority: '极高', note: '国家级地热示范区' },
  { city: '廊坊(固安/永清/霸州)', gradient: '3.0~4.5', heatFlow: '65~90', recoverable: '5.0×10¹⁶J', heatingArea: '3000万m²', development: '大规模', priority: '高', note: '牛驼镇凸起延伸区' },
  { city: '沧州(献县/河间/任丘)', gradient: '3.0~4.0', heatFlow: '65~80', recoverable: '4.0×10¹⁶J', heatingArea: '2500万m²', development: '中大规模', priority: '高', note: '沧县隆起区' },
  { city: '邢台(宁晋/柏乡/新河)', gradient: '2.8~3.5', heatFlow: '58~72', recoverable: '3.0×10¹⁶J', heatingArea: '2000万m²', development: '中规模', priority: '中高', note: '临清坳陷北部' },
  { city: '邯郸(邯郸东部)', gradient: '2.5~3.2', heatFlow: '55~68', recoverable: '2.0×10¹⁶J', heatingArea: '1500万m²', development: '中规模', priority: '中', note: '临清坳陷南部' },
  { city: '保定(高阳/蠡县)', gradient: '2.8~3.5', heatFlow: '60~75', recoverable: '2.5×10¹⁶J', heatingArea: '1500万m²', development: '中规模', priority: '中', note: '冀中坳陷' },
  { city: '石家庄(市区/辛集)', gradient: '2.5~3.0', heatFlow: '55~65', recoverable: '1.5×10¹⁶J', heatingArea: '1000万m²', development: '中小规模', priority: '中低', note: '山前过渡带' },
  { city: '衡水(全市)', gradient: '2.5~3.0', heatFlow: '55~65', recoverable: '1.5×10¹⁶J', heatingArea: '1000万m²', development: '中小规模', priority: '中低', note: '坳陷区' },
  { city: '张家口(赤城/阳原/怀来)', gradient: '2.0~3.0', heatFlow: '40~60', recoverable: '0.8×10¹⁶J', heatingArea: '500万m²', development: '小规模', priority: '低', note: '断裂带局部开发' },
  { city: '唐山(市区/玉田)', gradient: '2.0~2.8', heatFlow: '45~58', recoverable: '1.0×10¹⁶J', heatingArea: '600万m²', development: '小规模', priority: '低', note: '燕山前缘' },
];

/** 地热回灌数据扩展 */
export const reinjectionDataExtended = [
  { field: '雄县地热田', wells: 42, production: 22, reinjection: 20, reinjectionRate: 95, annualExtraction: '1.20×10⁷', annualReinjection: '1.14×10⁷', pressureChange: '+5~8m/a', startYear: 2010, note: '采灌平衡典范' },
  { field: '牛驼镇地热田', wells: 35, production: 20, reinjection: 15, reinjectionRate: 88, annualExtraction: '8.5×10⁶', annualReinjection: '7.5×10⁶', pressureChange: '+3~5m/a', startYear: 2012, note: '回灌率持续提升' },
  { field: '宁晋-柏乡地热田', wells: 18, production: 12, reinjection: 6, reinjectionRate: 65, annualExtraction: '5.8×10⁶', annualReinjection: '3.8×10⁶', pressureChange: '-1~2m/a', startYear: 2015, note: '回灌率待提升' },
  { field: '新河地热田', wells: 12, production: 8, reinjection: 4, reinjectionRate: 60, annualExtraction: '3.2×10⁶', annualReinjection: '1.9×10⁶', pressureChange: '-2~1m/a', startYear: 2015, note: '回灌率待提升' },
  { field: '蠡县-高阳地热田', wells: 15, production: 10, reinjection: 5, reinjectionRate: 55, annualExtraction: '4.5×10⁶', annualReinjection: '2.5×10⁶', pressureChange: '-3~0m/a', startYear: 2016, note: '回灌井不足' },
];

/** 地热资源量分区统计 */
export const geothermalResourceByZone = [
  { zone: '冀中台陷', area: 1200, reserves: '1.2×10¹⁸J', recoverable: '1.5×10¹⁷J', equivalentCoal: '5.0×10⁹t', heatingArea: '1.0×10⁸m²', grade: 'Ⅰ类' },
  { zone: '沧县隆起', area: 800, reserves: '6.0×10¹⁷J', recoverable: '8.0×10¹⁶J', equivalentCoal: '2.5×10⁹t', heatingArea: '5.0×10⁷m²', grade: 'Ⅰ类' },
  { zone: '黄骅坳陷', area: 600, reserves: '4.0×10¹⁷J', recoverable: '5.0×10¹⁶J', equivalentCoal: '1.5×10⁹t', heatingArea: '3.0×10⁷m²', grade: 'Ⅱ类' },
  { zone: '临清坳陷', area: 500, reserves: '3.0×10¹⁷J', recoverable: '4.0×10¹⁶J', equivalentCoal: '1.0×10⁹t', heatingArea: '2.0×10⁷m²', grade: 'Ⅱ类' },
  { zone: '太行山断裂带', area: 300, reserves: '1.5×10¹⁷J', recoverable: '2.0×10¹⁶J', equivalentCoal: '5.0×10⁸t', heatingArea: '5.0×10⁶m²', grade: 'Ⅲ类' },
  { zone: '燕山断裂带', area: 200, reserves: '1.0×10¹⁷J', recoverable: '1.0×10¹⁶J', equivalentCoal: '3.0×10⁸t', heatingArea: '3.0×10⁶m²', grade: 'Ⅲ类' },
];
