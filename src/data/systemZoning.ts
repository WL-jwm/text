// T-地下水系统区划 (固定型)
// 数据来源: 1999（基础文献）| 第五章 地下水系统区划及分区特征
// 版本: v2.0 | 更新频率: 区划调整时更新

/** 地下水系统区一级分区 */
export const systemZones = [
  { code: 'I', name: '内陆河地下水系统区', subCount: 6, cellCount: 0, area: 10922, proportion: 5.8, aquiferType: '孔隙裂隙水', features: '坝上高原封闭/半封闭内陆盆地，以淖为中心汇流，降水入渗补给，蒸发排泄', recharge: '降水入渗为主', discharge: '潜水蒸发+淖泊排泄', waterQuality: 'HCO₃-Ca·Mg型，矿化度<0.5g/L' },
  { code: 'II', name: '辽河-大凌河地下水系统区', subCount: 0, cellCount: 0, area: 0, proportion: 0, aquiferType: '裂隙水', features: '河北省内未完全闭合，未进一步划分', recharge: '-', discharge: '-', waterQuality: '-' },
  { code: 'III', name: '潮白河-蓟运河地下水系统区', subCount: 4, cellCount: 4, area: 19419, proportion: 10.3, aquiferType: '孔隙裂隙水/岩溶裂隙水', features: '山区以岩浆岩变质岩风化裂隙为主，平原冲洪积扇孔隙水', recharge: '降水入渗+河流渗漏+侧向径流', discharge: '人工开采+河流排泄+侧向流出', waterQuality: '山区HCO₃-Ca型，平原HCO₃-Ca·Na型' },
  { code: 'IV', name: '滦河地下水系统区', subCount: 6, cellCount: 5, area: 41949, proportion: 22.3, aquiferType: '孔隙裂隙水/岩溶裂隙水', features: '基本完整系统，NW-SE展布，山区-山间盆地-滨海完整剖面', recharge: '降水入渗+河流渗漏+山前侧向补给', discharge: '泉水排泄+人工开采+河道排泄+滨海蒸发', waterQuality: '山前HCO₃型→滨海Cl-Na型，水平分带明显' },
  { code: 'V', name: '冀东沿海诸河地下水系统区', subCount: 2, cellCount: 2, area: 3348, proportion: 1.8, aquiferType: '裂隙水/孔隙水', features: '多条独立入海小河，基本不与相邻系统发生水量交换', recharge: '降水入渗+地表水渗漏', discharge: '河流排泄+直接入海+蒸发', waterQuality: 'HCO₃-Ca型为主，近岸Cl·HCO₃型' },
  { code: 'VI', name: '永定河地下水系统区', subCount: 3, cellCount: 3, area: 21258, proportion: 11.3, aquiferType: '孔隙裂隙水/岩溶水', features: '跨蒙晋冀京津，含张家口/蔚县-阳原/怀来-涿鹿三大山间盆地', recharge: '降水入渗+河流渗漏+盆地周边侧向补给', discharge: '人工开采+河流排泄+蒸发', waterQuality: '盆地HCO₃-Ca型，矿化度0.3~0.8g/L' },
  { code: 'VII', name: '大清河地下水系统区', subCount: 6, cellCount: 4, area: 27937, proportion: 14.9, aquiferType: '岩溶裂隙水/孔隙水', features: '含涞源/威州等著名泉域，岩溶水系统发育完整', recharge: '降水入渗+岩溶水补给+山前侧向补给', discharge: '泉水排泄+人工开采+侧向径流', waterQuality: '山区HCO₃-Ca型，平原HCO₃-Ca·Mg→HCO₃·SO₄-Ca·Na型' },
  { code: 'VIII', name: '子牙河地下水系统区', subCount: 5, cellCount: 5, area: 32326, proportion: 17.2, aquiferType: '岩溶裂隙水/孔隙水', features: '含滹沱河/滏阳河两大子系统，百泉/黑龙洞等重要泉域', recharge: '降水入渗+河流渗漏+渠系渗漏+南水北调', discharge: '人工开采+河流排泄+侧向流出', waterQuality: '山前HCO₃-Ca→中部SO₄·HCO₃→滨海Cl-Na型' },
  { code: 'IX', name: '漳卫河地下水系统区', subCount: 4, cellCount: 4, area: 0, proportion: 0, aquiferType: '岩溶水/孔隙水', features: '含东风湖/珍珠泉泉域', recharge: '降水入渗+岩溶水补给', discharge: '泉水排泄+人工开采', waterQuality: '山区HCO₃-Ca型，平原HCO₃·Cl-Na·Ca型' },
  { code: 'X', name: '古黄河地下水系统区', subCount: 2, cellCount: 0, area: 11067, proportion: 5.9, aquiferType: '孔隙水', features: '省内未完全闭合，中部冲湖积平原-滨海平原', recharge: '降水入渗+黄河侧渗(历史)+渠系渗漏', discharge: '人工开采+蒸发+侧向流出', waterQuality: 'HCO₃·Cl-Na·Mg型，矿化度1~5g/L咸水区广布' },
];

/** 系统子区明细 */
export const subZones = [
  // I - 内陆河 (6子区)
  { parentCode: 'I', seq: 1, name: '照阳河裂隙地下水系统子区', type: '子区' },
  { parentCode: 'I', seq: 2, name: '察汗淖孔隙裂隙地下水系统子区', type: '子区' },
  { parentCode: 'I', seq: 3, name: '小盐淖孔隙裂隙地下水系统子区', type: '子区' },
  { parentCode: 'I', seq: 4, name: '安固里淖孔隙孔洞裂隙地下水系统子区', type: '子区' },
  { parentCode: 'I', seq: 5, name: '九连城淖孔隙裂隙地下水系统子区', type: '子区' },
  { parentCode: 'I', seq: 6, name: '囫囵淖孔隙裂隙地下水系统子区', type: '子区' },
  // III - 潮白河-蓟运河 (4子区 + 4小区)
  { parentCode: 'III', seq: 1, name: '潮白河裂隙地下水系统子区', type: '子区' },
  { parentCode: 'III', seq: 2, name: '蓟运河岩溶裂隙地下水系统子区', type: '子区' },
  { parentCode: 'III', seq: 2.1, name: '洵河岩溶裂隙地下水系统小区', type: '小区' },
  { parentCode: 'III', seq: 2.2, name: '遵化盆地孔隙岩溶地下水系统小区', type: '小区' },
  { parentCode: 'III', seq: 2.3, name: '还乡河岩溶地下水系统小区', type: '小区' },
  { parentCode: 'III', seq: 3, name: '潮白河-蓟运河冲洪积扇孔隙地下水系统子区', type: '子区' },
  { parentCode: 'III', seq: 3.1, name: '潮白河冲洪积扇孔隙地下水系统小区', type: '小区' },
  { parentCode: 'III', seq: 3.2, name: '蓟运河冲洪积扇孔隙地下水系统小区', type: '小区' },
  { parentCode: 'III', seq: 4, name: '潮白河-蓟运河冲积海积孔隙地下水系统子区', type: '子区' },
  // IV - 滦河 (6子区 + 5小区)
  { parentCode: 'IV', seq: 1, name: '坝上高原孔隙裂隙地下水系统子区', type: '子区' },
  { parentCode: 'IV', seq: 1.1, name: '闪电河孔隙裂隙地下水系统小区', type: '小区' },
  { parentCode: 'IV', seq: 1.2, name: '小滦河孔隙裂隙地下水系统小区', type: '小区' },
  { parentCode: 'IV', seq: 2, name: '滦河中上游裂隙地下水系统子区', type: '子区' },
  { parentCode: 'IV', seq: 3, name: '滦河中游裂隙岩溶地下水系统子区', type: '子区' },
  { parentCode: 'IV', seq: 3.1, name: '老牛河-长河岩溶裂隙地下水系统小区', type: '小区' },
  { parentCode: 'IV', seq: 3.2, name: '青龙河裂隙岩溶地下水系统小区', type: '小区' },
  { parentCode: 'IV', seq: 4, name: '滦河中下游孔隙裂隙地下水系统子区', type: '子区' },
  { parentCode: 'IV', seq: 4.1, name: '迁安盆地孔隙裂隙地下水系统小区', type: '小区' },
  { parentCode: 'IV', seq: 4.2, name: '沙河孔隙地下水系统小区', type: '小区' },
  { parentCode: 'IV', seq: 5, name: '滦河冲洪积扇孔隙地下水系统子区', type: '子区' },
  { parentCode: 'IV', seq: 6, name: '滦河冲积海积孔隙地下水系统子区', type: '子区' },
  // V - 冀东沿海 (2子区 + 2小区)
  { parentCode: 'V', seq: 1, name: '大石河-洋河裂隙地下水系统子区', type: '子区' },
  { parentCode: 'V', seq: 1.1, name: '柳江盆地岩溶地下水系统小区', type: '小区' },
  { parentCode: 'V', seq: 1.2, name: '大石河-洋河孔隙裂隙地下水系统小区', type: '小区' },
  { parentCode: 'V', seq: 2, name: '冀东沿海诸河冲洪积扇孔隙地下水系统子区', type: '子区' },
  // VI - 永定河 (3子区 + 3小区)
  { parentCode: 'VI', seq: 1, name: '永定河中游孔隙裂隙地下水系统子区', type: '子区' },
  { parentCode: 'VI', seq: 1.1, name: '张家口盆地孔隙裂隙地下水系统小区', type: '小区' },
  { parentCode: 'VI', seq: 1.2, name: '蔚县-阳原盆地孔隙岩溶地下水系统小区', type: '小区' },
  { parentCode: 'VI', seq: 1.3, name: '怀来-涿鹿盆地岩溶孔隙地下水系统小区', type: '小区' },
  { parentCode: 'VI', seq: 2, name: '永定河冲洪积扇孔隙地下水系统子区', type: '子区' },
  { parentCode: 'VI', seq: 3, name: '永定河古河道带孔隙地下水系统子区', type: '子区' },
  // VII - 大清河 (6子区 + 4小区)
  { parentCode: 'VII', seq: 1, name: '拒马河岩溶裂隙地下水系统子区', type: '子区' },
  { parentCode: 'VII', seq: 1.1, name: '涞源泉泉域岩溶地下水系统小区', type: '小区' },
  { parentCode: 'VII', seq: 1.2, name: '北拒马河岩溶裂隙地下水系统小区', type: '小区' },
  { parentCode: 'VII', seq: 1.3, name: '易水河岩溶裂隙地下水系统小区', type: '小区' },
  { parentCode: 'VII', seq: 2, name: '瀑河-漕河岩溶裂隙地下水系统子区', type: '子区' },
  { parentCode: 'VII', seq: 3, name: '唐河-界河岩溶裂隙地下水系统子区', type: '子区' },
  { parentCode: 'VII', seq: 4, name: '大沙河-磁河裂隙岩溶地下水系统子区', type: '子区' },
  { parentCode: 'VII', seq: 5, name: '大清河冲洪积扇孔隙地下水系统子区', type: '子区' },
  { parentCode: 'VII', seq: 5.1, name: '拒马河冲洪积扇孔隙地下水系统小区', type: '小区' },
  { parentCode: 'VII', seq: 5.2, name: '瀑河-漕河冲洪积扇孔隙地下水系统小区', type: '小区' },
  { parentCode: 'VII', seq: 5.3, name: '唐河-界河冲洪积扇孔隙地下水系统小区', type: '小区' },
  { parentCode: 'VII', seq: 5.4, name: '大沙河-磁河冲洪积扇孔隙地下水系统小区', type: '小区' },
  { parentCode: 'VII', seq: 6, name: '大清河古河道孔隙地下水系统子区', type: '子区' },
  // VIII - 子牙河 (5子区 + 5小区)
  { parentCode: 'VIII', seq: 1, name: '滹沱河裂隙岩溶地下水系统子区', type: '子区' },
  { parentCode: 'VIII', seq: 2, name: '滏阳河岩溶裂隙地下水系统子区', type: '子区' },
  { parentCode: 'VIII', seq: 2.1, name: '槐河裂隙地下水系统小区', type: '小区' },
  { parentCode: 'VIII', seq: 2.2, name: '十股泉泉域岩溶地下水系统小区', type: '小区' },
  { parentCode: 'VIII', seq: 2.3, name: '百泉泉域岩溶地下水系统小区', type: '小区' },
  { parentCode: 'VIII', seq: 2.4, name: '黑龙洞泉泉域岩溶地下水系统小区', type: '小区' },
  { parentCode: 'VIII', seq: 3, name: '子牙河冲洪积扇孔隙地下水系统子区', type: '子区' },
  { parentCode: 'VIII', seq: 3.1, name: '滹沱河冲洪积扇孔隙地下水系统小区', type: '小区' },
  { parentCode: 'VIII', seq: 3.2, name: '滏阳河支流冲洪积扇孔隙地下水系统小区', type: '小区' },
  { parentCode: 'VIII', seq: 4, name: '子牙河古河道带孔隙地下水系统子区', type: '子区' },
  { parentCode: 'VIII', seq: 4.1, name: '滹沱河古河道带孔隙地下水系统小区', type: '小区' },
  { parentCode: 'VIII', seq: 4.2, name: '子牙河古河道带孔隙地下水系统小区', type: '小区' },
  { parentCode: 'VIII', seq: 5, name: '子牙河冲积海积孔隙地下水系统子区', type: '子区' },
  // IX - 漳卫河 (4子区 + 2小区)
  { parentCode: 'IX', seq: 1, name: '漳河岩溶地下水系统子区', type: '子区' },
  { parentCode: 'IX', seq: 1.1, name: '东风湖泉域岩溶地下水系统小区', type: '小区' },
  { parentCode: 'IX', seq: 1.2, name: '珍珠泉泉域岩溶地下水系统小区', type: '小区' },
  { parentCode: 'IX', seq: 2, name: '漳河冲洪积扇孔隙地下水系统子区', type: '子区' },
  { parentCode: 'IX', seq: 3, name: '漳卫河古河道带孔隙地下水系统子区', type: '子区' },
  { parentCode: 'IX', seq: 4, name: '漳卫河冲积海积孔隙地下水系统子区', type: '子区' },
  // X - 古黄河 (2子区)
  { parentCode: 'X', seq: 1, name: '古黄河冲积湖积孔隙地下水系统子区', type: '子区' },
  { parentCode: 'X', seq: 2, name: '古黄河冲积海积孔隙地下水系统子区', type: '子区' },
];

/** 系统区补给排泄特征（v2.0新增） */
export const zoneRechargeDischarge = [
  { code: 'I', name: '内陆河', rainfallInfiltration: '主要补给源，入渗系数0.10~0.15', riverLeakage: '无', lateralInflow: '周边基岩侧向少量补给', irrigationReturn: '农田灌溉回渗少量', evaporation: '主要排泄，蒸发力强', artificialExtraction: '零星开采', springDischarge: '无', outflow: '以淖为中心，内部循环' },
  { code: 'III', name: '潮白河-蓟运河', rainfallInfiltration: '山区入渗0.15~0.25，平原0.12~0.18', riverLeakage: '潮白河/蓟运河山前段渗漏补给', lateralInflow: '北部山区侧向补给', irrigationReturn: '渠灌区回渗补给', evaporation: '中部平原蒸发排泄', artificialExtraction: '主要排泄(北京供水+农业)', springDischarge: '山区少量', outflow: '向东南方向径流' },
  { code: 'IV', name: '滦河', rainfallInfiltration: '山区入渗0.12~0.25，平原0.10~0.18', riverLeakage: '滦河干支流出山口大量渗漏', lateralInflow: '北部燕山侧向补给', irrigationReturn: '潘家口/大黑汀灌区回渗', evaporation: '滨海平原蒸发排泄', artificialExtraction: '唐山/秦皇岛城市供水+农业', springDischarge: '桃林口/冷口等泉', outflow: '向渤海排泄' },
  { code: 'V', name: '冀东沿海', rainfallInfiltration: '入渗系数0.10~0.15', riverLeakage: '小河渗漏补给有限', lateralInflow: '西侧滦河系统侧向补给', irrigationReturn: '少量', evaporation: '滨海蒸发', artificialExtraction: '少量农业开采', springDischarge: '无', outflow: '直接入海' },
  { code: 'VI', name: '永定河', rainfallInfiltration: '山区入渗0.12~0.20，盆地0.10~0.15', riverLeakage: '桑干河/洋河出山口渗漏', lateralInflow: '盆地周边侧向补给', irrigationReturn: '官厅灌区回渗', evaporation: '盆地中心蒸发', artificialExtraction: '张家口城市供水+农业', springDischarge: '蔚县南山北泉', outflow: '向北京方向径流' },
  { code: 'VII', name: '大清河', rainfallInfiltration: '山区入渗0.15~0.30(岩溶区高)，平原0.12~0.18', riverLeakage: '拒马河/唐河/大沙河出山口渗漏', lateralInflow: '太行山侧向补给丰富', irrigationReturn: '渠灌回渗', evaporation: '平原中部', artificialExtraction: '保定/雄安供水+农业(大量)', springDischarge: '涞源泉3.2m³/s+威州泉9.48m³/s', outflow: '向东部平原径流' },
  { code: 'VIII', name: '子牙河', rainfallInfiltration: '山区入渗0.15~0.28，平原0.08~0.15', riverLeakage: '滹沱河/滏阳河出山口渗漏', lateralInflow: '太行山侧向补给', irrigationReturn: '石津渠+南水北调渠道回渗', evaporation: '中东部蒸发', artificialExtraction: '石家庄/邢台/邯郸供水(核心开采区)', springDischarge: '百泉+黑龙洞(历史大泉，已干涸)', outflow: '向东部滨海径流' },
  { code: 'IX', name: '漳卫河', rainfallInfiltration: '山区入渗0.15~0.25', riverLeakage: '漳河出山口渗漏', lateralInflow: '太行山南段侧向补给', irrigationReturn: '少量', evaporation: '平原区蒸发', artificialExtraction: '邯郸南部供水', springDischarge: '东风湖泉2.5m³/s', outflow: '向河南方向径流' },
  { code: 'X', name: '古黄河', rainfallInfiltration: '入渗系数0.05~0.10(弱透水层)', riverLeakage: '历史上黄河侧渗补给(已终止)', lateralInflow: '西部子牙河系统侧向补给', irrigationReturn: '引黄灌区回渗', evaporation: '主要排泄，蒸发量大', artificialExtraction: '沧州/衡水深层承压水开采', springDischarge: '无', outflow: '向南排泄' },
];

/** 系统区含水层参数概要（v2.0新增） */
export const zoneAquiferParams = [
  { code: 'I', name: '内陆河', aquiferType: '第四系孔隙+基岩裂隙', thickness: '10~50m(盆地中心)', lithology: '砂砾石+风化裂隙带', K: '1~20m/d', T: '50~500m²/d', mu: '0.05~0.12', specificYield: '0.03~0.08', waterLevel: '埋深1~5m', quality: 'HCO₃-Ca·Mg，<0.5g/L' },
  { code: 'III', name: '潮白河-蓟运河', aquiferType: '冲洪积扇孔隙+山前岩溶', thickness: '20~80m(扇顶)~150m(前缘)', lithology: '卵砾石→中粗砂→细砂', K: '50~200m/d(扇顶)', T: '1000~5000m²/d', mu: '0.15~0.25', specificYield: '0.10~0.20', waterLevel: '埋深5~30m', quality: 'HCO₃-Ca→HCO₃·SO₄型' },
  { code: 'IV', name: '滦河', aquiferType: '冲洪积扇孔隙+山间盆地孔隙', thickness: '30~120m', lithology: '卵砾石(山前)→中细砂(滨海)', K: '10~150m/d', T: '500~8000m²/d', mu: '0.10~0.22', specificYield: '0.08~0.18', waterLevel: '埋深3~40m', quality: 'HCO₃→SO₄·Cl→Cl型分带' },
  { code: 'V', name: '冀东沿海', aquiferType: '裂隙+冲积扇孔隙', thickness: '10~40m', lithology: '风化带+砂砾石', K: '5~50m/d', T: '100~1000m²/d', mu: '0.08~0.15', specificYield: '0.05~0.10', waterLevel: '埋深2~15m', quality: 'HCO₃-Ca型为主' },
  { code: 'VI', name: '永定河', aquiferType: '盆地孔隙+岩溶', thickness: '20~80m(盆地)', lithology: '砂砾石(盆地)+灰岩(山区)', K: '10~100m/d(盆地)', T: '200~3000m²/d', mu: '0.08~0.18', specificYield: '0.06~0.12', waterLevel: '埋深5~30m', quality: 'HCO₃-Ca·Mg，0.3~0.8g/L' },
  { code: 'VII', name: '大清河', aquiferType: '岩溶+冲洪积扇孔隙', thickness: '50~200m(山前多含水层)', lithology: '灰岩(山区)+卵砾石(平原)', K: '10~500m/d(岩溶区高值)', T: '500~10000m²/d', mu: '0.12~0.25', specificYield: '0.08~0.20', waterLevel: '埋深5~50m', quality: 'HCO₃-Ca→HCO₃·SO₄-Ca·Na' },
  { code: 'VIII', name: '子牙河', aquiferType: '岩溶+多层孔隙', thickness: '100~300m(多层)', lithology: '灰岩(山区)+多层砂(平原)', K: '5~300m/d', T: '200~5000m²/d', mu: '0.05~0.20', specificYield: '0.04~0.15', waterLevel: '埋深5~60m(漏斗区>40m)', quality: 'HCO₃→SO₄→Cl型，深层高氟' },
  { code: 'IX', name: '漳卫河', aquiferType: '岩溶+孔隙', thickness: '30~150m', lithology: '灰岩+砂砾石', K: '10~200m/d', T: '200~3000m²/d', mu: '0.08~0.18', specificYield: '0.05~0.12', waterLevel: '埋深5~40m', quality: 'HCO₃-Ca→HCO₃·Cl-Na' },
  { code: 'X', name: '古黄河', aquiferType: '冲积湖积孔隙', thickness: '100~350m(多层)', lithology: '中细砂+粉砂(多层结构)', K: '1~10m/d', T: '50~500m²/d', mu: '0.02~0.08', specificYield: '0.02~0.05', waterLevel: '埋深2~15m', quality: 'HCO₃·Cl-Na，1~5g/L咸水广布' },
];

/** 系统区边界类型统计（v2.0新增） */
export const zoneBoundaryStats = [
  { boundaryType: '水文地质边界(隔水断层)', count: 18, description: '阻水断层构成系统侧向边界' },
  { boundaryType: '地形分水岭边界', count: 15, description: '以地形分水岭为界的天然补给边界' },
  { boundaryType: '岩性隔水边界', count: 12, description: '弱透水/隔水岩层构成底部或侧向边界' },
  { boundaryType: '河流排泄边界', count: 8, description: '河流切割含水层，构成排泄基准面' },
  { boundaryType: '海岸线边界', count: 4, description: '滨海系统东部以海岸线为排泄边界' },
  { boundaryType: '人工边界(行政区划)', count: 3, description: '跨省系统以省界为人为划定边界' },
];
