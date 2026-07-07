// A-基础地质 (稳定可更新)
// 数据来源: 《河北省 北京市 天津市区域地质志》(1982) | 1:20万水文地质普查
// 版本: v3.0 | 更新频率: 调查年限型，无需年度更新

/** 含水系统 */
export const geology = {
  aquiferSystems: [
    { name: '孔隙水', area: '河北平原全区', note: '第四系松散沉积物含水层，分浅/中/深层', areaKm2: 83409, proportion: '46.9%' },
    { name: '岩溶水', area: '太行山/燕山山区', note: '碳酸盐岩溶含水系统，泉流量法评价', areaKm2: 38639, proportion: '21.7%' },
    { name: '裂隙水', area: '山区', areaKm2: 49700, note: '基岩裂隙水，实际开采量法评价', proportion: '28.0%' },
  ],
  systems: [
    { name: '滦河与冀东沿海', areaKm2: 51447, recharge: 19.48, exploitable: 16.86 },
    { name: '海河北系', areaKm2: 32328, recharge: 23.97, exploitable: 14.13 },
    { name: '海河南系', areaKm2: 89255, recharge: 100.86, exploitable: 72.61 },
    { name: '徒骇马颊', areaKm2: 365, recharge: 0.64, exploitable: 0.56 },
    { name: '辽河', areaKm2: 4413, recharge: 0.83, exploitable: 0.10 },
    { name: '内陆河', areaKm2: 11246, recharge: 4.66, exploitable: 2.13 },
  ],
  totalExploitable: 146.872,
  totalRecharge: 185.52,
  totalArea: 177748,
};

/** 第四系地层划分方案（河北平原区6组） */
export const quaternaryStratigraphy = {
  summary: '河北平原第四系发育齐全，总厚度200~600m，坝上及山区划分为2统4组，平原区划分为2统6组。数据来源：《河北省北京市天津市区域地质志》(1982)第五章第二节。',
  units: [
    {
      system: '全新统 Q₄',
      groups: [
        { name: '歧口组 Q_qp', thickness: '2~10m', depth: '20~40m', lithology: '冲积、湖沼积亚粘土、亚砂土夹砂层，沿海一带为海相层，并有风成砂堆积，局部夹泥炭', typeSection: '黄骅县歧口渔供3孔' },
        { name: '高湾组 Q₄g', thickness: '10~40m', depth: '20~40m', lithology: '西部平原为冲积、湖沼积泥质亚砂土与中细砂互层夹泥炭；东部为海积淤泥质粘土、亚砂土夹薄层泥炭', typeSection: '海兴县高湾村7-17-13孔' },
        { name: '杨家寺组 Q_y', thickness: '5~15m', depth: '20~40m', lithology: '山前地带为砂砾层，平原内部为冲湖积亚粘土、淤泥、亚砂土互层夹细砂层，上部局部夹泥炭，底部局部见火山碎屑岩', typeSection: '吴桥县杨家寺浅孔6' },
      ]
    },
    {
      system: '上更新统 Q₃',
      groups: [
        { name: '欧庄组上段', thickness: '10~40m', depth: '50~70m', lithology: '山前地带为冲洪积、冰水堆积砂砾层及亚砂土；东部平原为冲积、湖积细砂、亚砂土、亚粘土互层；滨海地区夹海相层', typeSection: '衡水欧庄村54孔' },
        { name: '欧庄组中段', thickness: '20~54m', depth: '90~120m', lithology: '山前地带为冲洪积砂、砂砾层；东部平原为冲积、湖积亚粘土、亚砂土互层夹细砂及淤泥层，局部夹泥炭；滨海地区夹海相层', typeSection: '衡水欧庄村54孔' },
        { name: '欧庄组下段', thickness: '30~60m', depth: '120~170m', lithology: '山前地带为冲洪积、冰水堆积砂砾层，上部为亚粘土、亚砂土、细砂互层；东部平原为冲积、湖积亚粘土、亚砂土互层夹细砂层，局部底部见玄武岩及火山碎屑岩', typeSection: '衡水欧庄村54孔' },
      ]
    },
    {
      system: '中更新统 Q₂',
      groups: [
        { name: '杨柳青组上段', thickness: '70~90m', depth: '200~280m', lithology: '综黄色、黄棕色为主，山前地带为冲积、洪积亚粘土、亚砂土夹砂砾层；东部平原为冲积、湖积亚粘土夹砂层', typeSection: '津西1孔(180~311.2m)' },
        { name: '杨柳青组下段', thickness: '80~100m', depth: '250~350m', lithology: '棕色、浅红棕色为主，山前地带为冰川-冰水堆积泥砾层或含泥砾卵石层；东部平原为冲积、湖积含砂亚粘土夹砂砾层，部分地区近底部夹玄武岩及火山碎屑岩', typeSection: '津西1孔' },
      ]
    },
    {
      system: '下更新统 Q₁',
      groups: [
        { name: '固安组上段', thickness: '70~100m', depth: '300~400m', lithology: '棕黄色、棕色混锈黄色为主，山前地带为冲积、洪积亚砂土、亚粘土夹砂砾层；东部平原为冲积、湖积亚粘土、亚砂土与细砂互层', typeSection: '固2孔(344.4~503m)' },
        { name: '固安组下段', thickness: '80~110m', depth: '350~500m(最深>600m)', lithology: '棕红色混锈黄色、灰绿色为主，山前地带为冰川-冰水堆积泥砾层夹砂砾层及亚粘土；东部平原为冲积、湖积粘土、亚粘土夹砂砾层，局部近底部夹凝灰岩及玄武岩', typeSection: '固2孔' },
      ]
    },
  ],
  // 坝上及山区第四系
  plateauUnits: [
    { name: '泥河湾组 Q₁n', era: '早更新世', distribution: '阳原盆地、蔚县盆地等', thickness: '90~110m', lithology: '河湖相灰色砂砾层和灰绿色亚粘土', fossil: '泥河湾动物群(Prooscidipparion-Equus)', typeSection: '阳原县红崖村南沟' },
    { name: '赤城组 Q₂c', era: '中更新世', distribution: '坝上高原', thickness: '30~80m', lithology: '冲洪积、冰水堆积砂砾石层夹亚粘土', typeSection: '赤城一带' },
    { name: '马兰组 Q₃m', era: '晚更新世', distribution: '山区及坝上', thickness: '10~50m', lithology: '风积黄土、冲洪积砂砾石层', typeSection: '北京斋堂马兰台' },
    { name: '全新统 Q₄', era: '全新世', distribution: '河谷及山间盆地', thickness: '5~30m', lithology: '冲积砂砾石、亚砂土、湖沼积淤泥质亚粘土', typeSection: '各主要河流河谷' },
  ],
};

/** 构造单元（扁平结构，用于页面展示） */
export const tectonicUnits = [
  { unit: '华北平原沉降区', area: '~83000km²', structure: '冀中台陷/黄骅台陷/临清台陷', features: '新生界厚层沉积，多级断块构造', aquiferCharacteristics: '多层孔隙水，垂向分带明显' },
  { unit: '太行山隆起区', area: '~26000km²', structure: '太行山前断裂带/赞皇背斜/武安向斜', features: '寒武奥陶系碳酸盐岩大面积出露', aquiferCharacteristics: '岩溶水发育，大型泉域系统' },
  { unit: '燕山隆起区', area: '~34000km²', structure: '马兰峪复背斜/兴隆-宽城褶皱带', features: '中上元古界碳酸盐岩+侵入岩', aquiferCharacteristics: '岩溶裂隙水，温泉发育' },
  { unit: '坝上高原区', area: '~18000km²', structure: '张北-康保断陷盆地', features: '新生界玄武岩覆盖+第四系湖积', aquiferCharacteristics: '浅层孔隙水，水量贫乏' },
];

/** 构造单元详细划分（据《区域地质志》1982） */
export const tectonicUnitsDetailed = [
  {
    level: 'Ⅰ级',
    name: '中朝准地台',
    code: 'I₂',
    description: '我国最古老的地台区，初始陆核在3000Ma以前出现，结晶基底于前1700Ma固结形成',
    subUnits: [
      {
        level: 'Ⅱ级', name: '内蒙古地轴', code: 'Ⅱ₁',
        description: '准地台北缘近东西向轴状隆起，长期处于裸露正性状态，阻隔中晚元古代及古生代南北海水沟通',
        boundary: '北界康保-围场深断裂，南界尚义-平泉深断裂西段接丰宁-隆化深断裂',
        width: '80~100km',
        subUnits: [
          { level: 'Ⅲ级', name: '张北台拱', code: 'Ⅲ₁¹', description: '波状高原，二元结构(太古代结晶基底+新生界覆盖)', boundary: '东以沽源-张北大断裂为界' },
          { level: 'Ⅲ级', name: '沽源陷断束', code: 'Ⅲ₁²', description: '发育晚侏罗世火山岩，产煤、油页岩、萤石、沸石' },
          { level: 'Ⅲ级', name: '围场拱断束', code: 'Ⅲ₁³', description: '上黄旗岩浆岩带，铜钼铅多金属矿化' },
        ]
      },
      {
        level: 'Ⅱ级', name: '燕山台褶带', code: 'Ⅱ₂',
        description: '中上元古界—古生界盖层发育，中生代强烈活化，褶皱断裂发育',
      },
      {
        level: 'Ⅱ级', name: '山西断隆', code: 'Ⅱ₃',
        description: '太行山隆起区，寒武奥陶系碳酸盐岩大面积出露',
      },
      {
        level: 'Ⅱ级', name: '华北断拗', code: 'Ⅱ₂⁴',
        description: '河北平原主体，新生代断陷盆地，沉积巨厚新生界',
        subUnits: [
          { level: 'Ⅲ级', name: '冀中坳陷(冀中台陷)', code: 'Ⅲ₂⁴¹', description: '华北断拗西部负向单元，太行山断裂带以东、沧县隆起以西，保定/廊坊/石家庄东部/衡水北部', features: '新生代凹陷，基底太古界或华力西期侵入体，坳陷幅度自东南向西北加大，西北部最深>500m' },
          { level: 'Ⅲ级', name: '沧县隆起(沧县台拱)', code: 'Ⅲ₂⁴²', description: '华北断拗中部正向单元，冀中坳陷东侧、黄骅坳陷西侧', features: '新生界覆盖相对较薄，基底相对抬升' },
          { level: 'Ⅲ级', name: '黄骅坳陷(黄骅台陷)', code: 'Ⅲ₂⁴³', description: '华北断拗东部负向单元，沧县隆起以东、埕宁隆起以西，天津东南部/沧州东部/唐山南部', features: '中新生代凹陷，巨厚新生代河湖相及海相沉积，重要油气产区' },
          { level: 'Ⅲ级', name: '临清坳陷(临清台陷)', code: 'Ⅲ₂⁴⁴', description: '华北断拗南部负向单元，邢台/邯郸/衡水南部', features: '中新生代凹陷，厚层新生代沉积' },
          { level: 'Ⅲ级', name: '埕宁隆起(埕宁台拱)', code: 'Ⅲ₂⁴⁵', description: '华北断拗东部正向单元，黄骅坳陷以东、渤海海域以西', features: '正向隆起，新生界沉积厚度较小，基底埋藏浅' },
        ]
      },
    ]
  },
  {
    level: 'Ⅰ级',
    name: '内蒙-大兴安岭地槽褶皱系',
    code: 'I₁',
    description: '具活动带性质，质变主旋回在华力西期，以康保-围场深断裂与中朝准地台分界',
  },
];

/** 第四系含水层组结构 */
export const quaternaryAquiferGroups = [
  { group: '第I含水组', depth: '0~50m', age: '全新统(Q₄)', lithology: '砂砾石/中细砂', K: '10~50 m/d', yield: '50~150', waterType: '潜水-微承压', quality: 'HCO₃-Ca·Mg', mainUse: '农业灌溉', rechargeSource: '大气降水/地表水入渗/灌溉回渗' },
  { group: '第II含水组', depth: '50~150m', age: '上更新统(Q₃)', lithology: '中细砂/粉细砂', K: '5~20 m/d', yield: '20~50', waterType: '承压水', quality: 'HCO₃-Ca·Na', mainUse: '农业/城镇供水', rechargeSource: '越流补给/侧向径流' },
  { group: '第III含水组', depth: '150~350m', age: '中更新统(Q₂)', lithology: '细砂/粉砂', K: '2~8 m/d', yield: '10~30', waterType: '承压水', quality: 'HCO₃·SO₄-Na·Ca', mainUse: '城镇供水(历史)', rechargeSource: '侧向径流/越流(弱)' },
  { group: '第IV含水组', depth: '350~550m', age: '下更新统(Q₁)', lithology: '粉砂/含砾细砂', K: '0.5~3 m/d', yield: '5~15', waterType: '深层承压水', quality: 'HCO₃-Na(高氟)', mainUse: '限制开采', rechargeSource: '侧向径流(极弱)' },
];

/** 地层与含水介质 */
export const stratigraphyAquifer = [
  { era: '新生界', period: '第四系', thickness: '200~600m', aquiferType: '孔隙水', distribution: '河北平原', areaPercent: '47%', productivity: '高', mainCity: '全区平原' },
  { era: '新生界', period: '新近系(N₁-N₂)', thickness: '500~2000m', aquiferType: '孔隙水(深层)', distribution: '平原深部', areaPercent: '15%', productivity: '中', mainCity: '沧州/衡水' },
  { era: '新生界', period: '古近系(E)', thickness: '1000~4000m', aquiferType: '孔隙裂隙水', distribution: '坳陷深部', areaPercent: '8%', productivity: '低', mainCity: '黄骅/冀中坳陷' },
  { era: '中生界', period: '侏罗系/白垩系(J-K)', thickness: '200~1500m', aquiferType: '裂隙水', distribution: '山间盆地', areaPercent: '8%', productivity: '低-中', mainCity: '蔚县/承德' },
  { era: '上古生界', period: '石炭/二叠系(C-P)', thickness: '200~800m', aquiferType: '裂隙水/岩溶水', distribution: '太行山东麓', areaPercent: '10%', productivity: '中', mainCity: '唐山/邯郸' },
  { era: '下古生界', period: '寒武/奥陶系(∈-O)', thickness: '500~1500m', aquiferType: '岩溶水(主要)', distribution: '太行山/燕山', areaPercent: '15%', productivity: '高', mainCity: '邯邢/井陉' },
  { era: '元古界', period: '蓟县系/长城系(Jx-Ch)', thickness: '3000~8000m', aquiferType: '岩溶裂隙水', distribution: '燕山山区', areaPercent: '5%', productivity: '中', mainCity: '承德/遵化' },
  { era: '太古界', period: '迁西群/阜平群(Ar)', thickness: '>10000m', aquiferType: '裂隙水(微弱)', distribution: '基底隆起区', areaPercent: '3%', productivity: '极低', mainCity: '迁西/阜平' },
];

/** 主要断裂带 */
export const majorFaults = [
  { name: '康保-围场深断裂', direction: '近东西向', length: '>400km', type: 'Ⅰ级构造边界', feature: '中朝准地台与内蒙-大兴安岭褶皱系分界', hydrogeology: '阻隔南北地下水系统' },
  { name: '尚义-平泉深断裂', direction: '近东西向', length: '>500km', type: '深断裂', feature: '内蒙古地轴南界', hydrogeology: '控制燕山南北地下水系统格局' },
  { name: '太行山山前断裂带', direction: '北北东向', length: '>600km', type: '大断裂带', feature: '太行山隆起与华北平原分界，由多条断裂组成', hydrogeology: '控制山前岩溶水系统与平原孔隙水系统转换' },
  { name: '沧东断裂', direction: '北北东向', length: '>300km', type: '大断裂', feature: '沧县隆起与黄骅坳陷分界', hydrogeology: '控制深层地下水径流方向' },
  { name: '紫荆关-灵山断裂', direction: '北北东向', length: '>200km', type: '大断裂', feature: '太行山内部重要断裂', hydrogeology: '控制岩溶水径流带' },
];

/** 基岩地质简表 */
export const bedrockSummary = {
  archean: '迁西群(Ar₁qx)、阜平群(Ar₁fp)：麻粒岩、片麻岩、磁铁石英岩，>10000m，构成结晶基底',
  proterozoic: '长城系(Ch)、蓟县系(Jx)、青白口系(Qn)：石英岩、白云岩、页岩，3000~8000m，燕山山区广泛出露',
  cambrianOrdovician: '寒武系(∈)、奥陶系(O)：灰岩、白云质灰岩、页岩，500~1500m，太行山、燕山出露',
  carboniferousPermian: '石炭系(C)、二叠系(P)：砂岩、页岩、灰岩夹煤层，200~800m，太行山东麓',
  mesozoic: '三叠系(T)、侏罗系(J)、白垩系(K)：砂岩、火山岩、砾岩，200~1500m，山间盆地',
  cenozoic: '第三系(E+N)、第四系(Q)：砂岩、泥岩、松散堆积物，平原区厚度200~600m，坳陷区>5000m',
};


/** 地质发展史（据《区域地质志》1982第五篇） */
export const geologicalHistory = {
  summary: '中朝准地台经历三大演化阶段：基底形成(Ar-Pt₁)→盖层发展(Pt₂-P₂)→强烈活动(T-Q)。内蒙-大兴安岭褶皱系在华力西期最终褶皱封闭。',
  stages: [
    {
      stage: '基底形成阶段',
      period: '太古代—早元古代(>3500~1700Ma)',
      events: [
        { time: '>3500Ma', event: '迁西期海底火山喷发，形成迁西群火山岩建造，初始陆核出现，完成陆壳与洋壳分异', evidence: 'Sm-Nd等时线年龄3500Ma' },
        { time: '3500~3000Ma', event: '阜平期沉积-火山活动，形成阜平群，陆壳增生扩大', evidence: '阜平群变质岩系' },
        { time: '3000~2500Ma', event: '五台期强烈构造运动(五台运动)，迁西群/阜平群遭受高角闪岩相-麻粒岩相变质和混合岩化', evidence: '同位素年龄2500Ma' },
        { time: '2500~1850Ma', event: '吕梁期裂谷环境沉积甘陶河群(5274m)和朱杖子群(>1058m)，大量拉斑玄武岩喷溢(累计3700m)', evidence: '低绿片岩相变质，2-7kbar/350-500℃' },
        { time: '~1850Ma', event: '吕梁运动主幕，甘陶河群/朱杖子群褶皱变质', evidence: '褶皱轴向近南北' },
        { time: '~1700Ma', event: '东焦群(类磨拉石建造)褶皱封闭，结晶基底最终固结，形成统一中朝准地台', evidence: '前地台阶段结束' },
      ],
      tectonic: '裂谷环境→挤压造山',
      magmatism: '拉斑玄武岩喷溢(3700m)',
      metamorphism: '高角闪岩相-麻粒岩相(迁西期) → 低绿片岩相(吕梁期)',
    },
    {
      stage: '盖层发展阶段',
      period: '中元古代—二叠纪(1700~250Ma)',
      events: [
        { time: '1700~1400Ma', event: '长城纪海侵，蓟县一带补偿沉积近万米，向南减薄(保定3000m/石家庄700m/邯郸400m)', evidence: '长城系常州沟组-高于庄组' },
        { time: '1400~1000Ma', event: '蓟县纪持续沉降，沉积燧石条带白云岩、页岩等', evidence: '蓟县系雾迷山组等' },
        { time: '1000~800Ma', event: '青白口纪海退，沉积碎屑岩-碳酸盐岩建造', evidence: '青白口系' },
        { time: '800~570Ma', event: '震旦纪(本区缺失)，整体抬升剥蚀', evidence: '区域不整合面' },
        { time: '570~440Ma', event: '寒武-奥陶纪大规模海侵，碳酸盐岩台地沉积(500~1500m)，三叶虫/牙形石繁盛', evidence: '17个三叶虫化石带/4个牙形石带' },
        { time: '440~320Ma', event: '中奥陶世末加里东运动，整体抬升，缺失志留-泥盆-早石炭世沉积', evidence: '长期风化剥蚀，古喀斯特发育' },
        { time: '320~250Ma', event: '石炭-二叠纪海陆交互相含煤建造，太行山东麓形成重要煤田', evidence: 'C-P含煤岩系，2系4统6组' },
      ],
      tectonic: '稳定克拉通，脉动升降("三降两升")',
      magmatism: '相对平静',
      metamorphism: '无区域变质',
    },
    {
      stage: '强烈活动阶段',
      period: '三叠纪—现代(250Ma~至今)',
      events: [
        { time: '250~205Ma', event: '早-中三叠世陆相红色碎屑岩沉积，晚三叠世印支运动，本区存在早三叠世地层', evidence: '石河口组划归晚三叠世' },
        { time: '205~135Ma', event: '燕山运动早-中幕(J₁-J₂)：强烈火山喷发(南大岭组玄武岩)+大规模花岗岩侵入，形成北北东向构造', evidence: '南大岭组为早侏罗世，九龙山组达尔文介动物群' },
        { time: '135~65Ma', event: '燕山运动晚幕(K₁)：热河生物群繁盛，火山-沉积建造(青石砬组)，早白垩世末强烈褶皱断裂', evidence: '固阳鱼化石，大规模逆冲推覆' },
        { time: '65~23Ma', event: '早第三纪(E)：华北断陷盆地形成，冀中/黄骅/临清坳陷强烈断陷，沉积河湖相+海相(500~4000m)', evidence: '重要油气生成期' },
        { time: '23~2.6Ma', event: '晚第三纪(N)：整体沉降，平原区沉积河湖相(500~2000m)，坝上玄武岩喷发', evidence: '明化镇组/馆陶组' },
        { time: '2.6Ma~至今', event: '第四纪(Q)：冰期-间冰期气候波动，河北平原堆积200~600m松散沉积，坝上泥河湾组河湖相沉积', evidence: '6组第四系地层划分' },
      ],
      tectonic: '燕山运动(挤压) → 喜马拉雅运动(拉张断陷)',
      magmatism: '燕山期大规模岩浆活动(侵入+喷发)，喜山期玄武岩喷发',
      metamorphism: '无区域变质，局部动力变质',
    },
  ],
};

/** 河北平原形成演化 */
export const plainEvolution = {
  summary: '河北平原是中新生代断陷盆地，在燕山运动奠定的构造格架上，经喜马拉雅运动强烈断陷，被新生界巨厚沉积充填而成。',
  stages: [
    { stage: '中生代奠基期', time: 'J-K', feature: '燕山运动形成北北东向隆坳相间构造格架(冀中坳陷/沧县隆起/黄骅坳陷)', deposition: '火山-碎屑岩建造' },
    { stage: '早第三纪断陷期', time: 'E', feature: '拉张断陷，各坳陷强烈沉降，形成巨厚河湖相沉积', deposition: '砂泥岩+蒸发岩，500~4000m' },
    { stage: '晚第三纪坳陷期', time: 'N', feature: '整体坳陷沉降，平原雏形形成，坝上玄武岩喷发', deposition: '河湖相砂泥岩，500~2000m' },
    { stage: '第四纪平原形成期', time: 'Q', feature: '冰期-间冰期气候控制，河流搬运堆积，河北平原最终形成', deposition: '冲洪积/冲湖积/海积，200~600m' },
  ],
};
