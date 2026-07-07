// ═══════════════════════════════════════════════════════════
// 历史水文地质基础参数汇编
// 数据来源: 《河北省水文地质工程地质》(1980年代, OCR识别)
// 版本: v1.0 | 2026-05-21
// 说明: 本文件收录1980年代历史基础水文地质参数, 供环评参数取值参考
// 注: 数据来自扫描版PDF OCR识别, 部分数值可能存在偏差, 建议与原文核对
// ═══════════════════════════════════════════════════════════

import type {} from './hydroParams';

// ───────────────────────────────────────────────────────
// 一、泉水数据库 (126条, 表15)
// ───────────────────────────────────────────────────────

export interface HistoricalSpring {
  id: number;
  region: string;       // 地区
  location: string;     // 位置
  flow: string;         // 流量 m³/h (可能有范围值)
  geology: string;      // 出露地层或构造条件
}

export const historicalSprings: HistoricalSpring[] = [
  { id: 1, region: '邯邢', location: '峰峰黑龙洞泉', flow: '21600~32400', geology: '中奥陶系石灰岩' },
  { id: 2, region: '邯邢', location: '涉县青塔龙洞村', flow: '648', geology: '中寒武系灰岩' },
  { id: 3, region: '邯邢', location: '涉县东风湖泉群', flow: '5832~7488', geology: '中奥陶系灰岩' },
  { id: 4, region: '邯邢', location: '武安县红首村', flow: '64.8', geology: '下奥陶系灰岩' },
  { id: 5, region: '邯邢', location: '磁县北食口南', flow: '103', geology: '中寒武系灰岩' },
  { id: 6, region: '邯邢', location: '涉县西达公社牛家庄', flow: '29.8', geology: '中寒武系灰岩' },
  { id: 7, region: '邯邢', location: '涉县赵郝', flow: '124', geology: '中寒武系灰岩' },
  { id: 8, region: '邯邢', location: '邢台县王山铺', flow: '106', geology: '下寒武系灰岩' },
  { id: 9, region: '邯邢', location: '邢台县龙也沟', flow: '90.7', geology: '震旦亚界大红峪砂岩' },
  { id: 10, region: '邯邢', location: '邢台县小鼠沟', flow: '64.8', geology: '震旦亚界大红峪砂岩' },
  { id: 11, region: '邯邢', location: '邢台县朱温坪', flow: '66.9', geology: '震旦亚界大红峪砾岩' },
  { id: 12, region: '邯邢', location: '内邱县井行室', flow: '12', geology: '前震旦亚界片麻岩' },
  { id: 13, region: '邯邢', location: '邢台县浆水镇', flow: '58.8', geology: '前震旦亚界片麻岩' },
  { id: 14, region: '邯邢', location: '武安县丰峪村', flow: '129.6', geology: '前震旦亚界片麻岩' },
  // --- 石家庄 ---
  { id: 15, region: '石家庄', location: '灵寿县宅南公社瓦房台猪石沟', flow: '1.08', geology: '太古界片麻岩' },
  { id: 16, region: '石家庄', location: '灵寿县南营公社木佛塔村南', flow: '6.48', geology: '太古界片麻岩' },
  { id: 17, region: '石家庄', location: '灵寿县瓦房台村西', flow: '1.62', geology: '片麻岩与岩脉接触' },
  { id: 18, region: '石家庄', location: '平山县孟家庄公社北平村', flow: '46.8', geology: '太古界大理岩接触泉' },
  { id: 19, region: '石家庄', location: '井陉县胡滩家公社洞沟', flow: '1~44', geology: '下元古界变质石英岩接触泉' },
  { id: 20, region: '石家庄', location: '获鹿县梁庄公社水峪南', flow: '57.6', geology: '元古界长石石英砂岩,断层上盘' },
  { id: 21, region: '石家庄', location: '行唐县泉子头村中', flow: '12', geology: '太古界白云岩' },
  { id: 22, region: '石家庄', location: '平山县甘秋公社观南庄南坪', flow: '139.6', geology: '中寒武系鲕状灰岩' },
  { id: 23, region: '石家庄', location: '平山县塔崖公社汤汤水村', flow: '720~1', geology: '中寒武系鲕状灰岩' },
  { id: 24, region: '石家庄', location: '平山县塔崖公社井子峪村', flow: '50', geology: '中寒武系鲕状灰岩' },
  { id: 25, region: '石家庄', location: '灵寿县团泊口公社河东村', flow: '38.52', geology: '第四系卵石层' },
  { id: 26, region: '石家庄', location: '井陉县戚州公社段庄西北', flow: '2160', geology: '奥陶系灰岩' },
  { id: 27, region: '石家庄', location: '井陉县戚州公社河西村', flow: '1944', geology: '奥陶系灰岩' },
  { id: 28, region: '石家庄', location: '井陉县孙庄公社冶里村', flow: '72', geology: '鲕状结晶灰岩上升泉' },
  { id: 29, region: '石家庄', location: '行唐县九口子公社东寺上村', flow: '2.88', geology: '太古界片麻岩' },
  { id: 30, region: '石家庄', location: '赞皇县楼底公社西格台西', flow: '36~1', geology: '震旦亚界石英砂岩' },
  { id: 36, region: '石家庄', location: '获鹿县干河草东南', flow: '1~93', geology: '震旦亚界砂岩上升泉' },
  { id: 39, region: '石家庄', location: '迁安县新集公社泉庄村', flow: '78.2', geology: '震旦亚界白云岩接触泉' },
  { id: 42, region: '石家庄', location: '抚宁县平山营公社王庄', flow: '27', geology: '震旦亚界灰岩' },
  { id: 43, region: '石家庄', location: '迁安县大五里公社水峪西霸王峰', flow: '68', geology: '震旦亚界白云岩上升泉' },
  { id: 49, region: '石家庄', location: '滦县杨柳庄公社东赵庄', flow: '106.5', geology: '震旦亚界白云岩逆断层阻水' },
  { id: 55, region: '石家庄', location: '玉田县八里铺公社石家庄北东', flow: '864', geology: '第四系松散层' },
  { id: 56, region: '石家庄', location: '深县高城子公社福山寺东', flow: '1759', geology: '第四系土层上升泉' },
  { id: 62, region: '石家庄', location: '台头营黑沟西北', flow: '10.8~10', geology: '花岗岩,水温10°C' },
  { id: 80, region: '石家庄', location: '涞源县乌龙沟', flow: '36', geology: '太古界片麻岩下降泉' },
  // --- 唐山 ---
  { id: 31, region: '唐山', location: '迁安县大五里公社王家湾', flow: '49.2', geology: '碳酸盐岩' },
  { id: 32, region: '唐山', location: '抚宁县猩猩路公社红亮寺', flow: '54', geology: '燕山期花岗岩' },
  { id: 33, region: '唐山', location: '抚宁县姚周寨公社崖子山', flow: '1.85', geology: '花岗岩' },
  { id: 34, region: '唐山', location: '抚宁县猩猩', flow: '11~108', geology: '燕山期花岗岩' },
  { id: 35, region: '唐山', location: '遵化建明公社白马峪', flow: '11', geology: '震旦亚界大红峪石英砂岩' },
  { id: 37, region: '唐山', location: '迁安县徐流营九龙泉', flow: '4~2', geology: '震旦亚界白云岩' },
  { id: 38, region: '唐山', location: '迁西县忍宇口公社北山南头', flow: '2', geology: '震旦亚界高于庄组白云岩' },
  { id: 40, region: '唐山', location: '迁安县铜洞子西北', flow: '20~2', geology: '震旦亚界白云岩' },
  { id: 41, region: '唐山', location: '芦龙县大杨各庄公社荆子峪', flow: '32.2', geology: '震旦亚界白云岩' },
  { id: 44, region: '唐山', location: '迁安县北营公社水泉村', flow: '128', geology: '震旦亚界白云岩' },
  { id: 45, region: '唐山', location: '玉田县螺山公社前螺山', flow: '21.6~17', geology: '震旦亚界白云岩,水温17°C' },
  { id: 46, region: '唐山', location: '玉田县郭家屯西大泉庄', flow: '78.2', geology: '碳酸盐岩' },
  { id: 47, region: '唐山', location: '玉田县亮甲山店公社小泉庄', flow: '111~9', geology: '碳酸盐岩' },
  { id: 48, region: '唐山', location: '丰润县王营营公社上水路村', flow: '30~13', geology: '震旦亚界白云岩,水温13°C' },
  { id: 50, region: '唐山', location: '迁安县崇家岭尚庄西北', flow: '29.9~13', geology: '震旦亚界白云岩,水温13°C' },
  { id: 51, region: '唐山', location: '迁西县南观公社岭村', flow: '32~90', geology: '震旦亚界白云岩' },
  { id: 52, region: '唐山', location: '迁安县新房子公社水泉村北', flow: '1738', geology: '震旦亚界白云岩' },
  { id: 53, region: '唐山', location: '芦龙县刘家营公社刘家口', flow: '126~13.5', geology: '震旦亚界白云岩,水温13.5°C' },
  { id: 54, region: '唐山', location: '芦龙县刘家营公社佛峪东南', flow: '489.86', geology: '碳酸盐岩' },
  { id: 79, region: '唐山', location: '迁安县建昌营', flow: '1224', geology: '奥陶亚界灰岩' },
  // --- 承德 ---
  { id: 57, region: '承德', location: '围场县龙头沟脑', flow: '6.66', geology: '基岩裂隙' },
  { id: 58, region: '承德', location: '兴隆县牛圈子四马道大梁南王台', flow: '56.2', geology: '基岩裂隙' },
  { id: 59, region: '承德', location: '丰宁县选将营木沟脐', flow: '12.6', geology: '花岗岩' },
  { id: 60, region: '承德', location: '围场县锥子山六道岔七道', flow: '9.18~1', geology: '花岗岩' },
  { id: 61, region: '承德', location: '丰宁县南关企水沟', flow: '2.52', geology: '花岗岩' },
  { id: 63, region: '承德', location: '丰宁县高地南西', flow: '1652~15.93', geology: '安山凝灰岩,水温3°C' },
  { id: 64, region: '承德', location: '围场县套作窝铺', flow: '18.36~2', geology: '安山斑岩,水温2°C' },
  { id: 65, region: '承德', location: '围场县豆奎乡石梁沟', flow: '15.93~6.5', geology: '凝灰岩,水温6.5°C' },
  { id: 66, region: '承德', location: '隆化县荒地村', flow: '11~12.96', geology: '凝灰岩,水温8.5°C' },
  { id: 67, region: '承德', location: '围场县城子台公社二阜新地', flow: '35.6~7.5', geology: '玄武岩,水温7.5°C' },
  { id: 68, region: '承德', location: '围场县二人盘', flow: '37', geology: '第三系玄武岩' },
  { id: 69, region: '承德', location: '隆化县丰富沟', flow: '11~5', geology: '第三系玄武岩,水温8°C' },
  { id: 70, region: '承德', location: '大常岗西山岔', flow: '10.8~17', geology: '侏罗系安山岩,水温17°C' },
  { id: 71, region: '承德', location: '承德县六沟公社水泉', flow: '204', geology: '碳酸盐岩' },
  { id: 72, region: '承德', location: '兴隆县大石洞', flow: '777', geology: '碳酸盐岩' },
  { id: 73, region: '承德', location: '承德县滴水崖', flow: '104.8', geology: '碳酸盐岩' },
  { id: 74, region: '承德', location: '兴隆县阎杖子水帘洞北', flow: '540', geology: '碳酸盐岩' },
  { id: 76, region: '承德', location: '青龙县西周杖子', flow: '216', geology: '震旦亚界雾迷山组灰岩' },
  { id: 77, region: '承德', location: '平泉县五十家子鹰手营子', flow: '3240~12.8', geology: '奥陶亚界灰岩,水温12.8°C' },
  { id: 78, region: '承德', location: '平泉县刘八店大院', flow: '288~11', geology: '奥陶亚界灰岩,水温11°C' },
  // --- 保定 ---
  { id: 81, region: '保定', location: '易县龙家铺村南', flow: '180', geology: '太古界断层下降泉' },
  { id: 82, region: '保定', location: '阜平县夹石腰东南', flow: '72', geology: '太古界下降泉' },
  { id: 83, region: '保定', location: '阜平县栗对槽西南', flow: '36', geology: '太古界下降泉' },
  { id: 84, region: '保定', location: '阜平县土穹里东南', flow: '36', geology: '花岗岩裂隙下降泉' },
  { id: 85, region: '保定', location: '涞源县牌角村东', flow: '111~27', geology: '震旦亚界灰岩下降泉' },
  { id: 86, region: '保定', location: '涞水县跑马泉', flow: '194.4', geology: '碳酸盐岩' },
  { id: 87, region: '保定', location: '易县五花也村东南沟', flow: '54', geology: '震旦亚界白云岩裂隙下降泉' },
  { id: 88, region: '保定', location: '易县桐角村东北', flow: '30', geology: '震旦亚界白云岩断层下降泉' },
  { id: 89, region: '保定', location: '易县果树沟村东', flow: '28.8', geology: '震旦亚界灰岩下降泉群' },
  { id: 90, region: '保定', location: '涞源县东杏花村', flow: '72', geology: '碳酸盐岩' },
  { id: 91, region: '保定', location: '涞源县杨家庄镇', flow: '36', geology: '片麻岩裂隙下降泉' },
  { id: 92, region: '保定', location: '涞源县甲村', flow: '108', geology: '震旦亚界白云岩' },
  { id: 93, region: '保定', location: '涞源县插箭岭', flow: '302.4', geology: '奥陶系灰岩' },
  { id: 94, region: '保定', location: '涞源县王安镇', flow: '216', geology: '奥陶系灰岩' },
  { id: 95, region: '保定', location: '涞源县北石佛', flow: '72', geology: '震旦亚界灰岩' },
  { id: 96, region: '保定', location: '涞源县南马庄', flow: '36', geology: '片麻岩' },
  { id: 97, region: '保定', location: '涞源县东团堡', flow: '100.8', geology: '碳酸盐岩' },
  { id: 98, region: '保定', location: '涞源县走马驿', flow: '540', geology: '碳酸盐岩' },
  { id: 99, region: '保定', location: '涞源县银坊', flow: '1080', geology: '奥陶系灰岩' },
  { id: 100, region: '保定', location: '涞源县北城子', flow: '720', geology: '碳酸盐岩' },
  { id: 101, region: '保定', location: '易县紫荆关', flow: '72', geology: '震旦亚界白云岩' },
  { id: 102, region: '保定', location: '易县西陵', flow: '36', geology: '片麻岩' },
  { id: 103, region: '保定', location: '易县梁各庄', flow: '180', geology: '震旦亚界灰岩' },
  { id: 104, region: '保定', location: '易县下盘石', flow: '28.8', geology: '震旦亚界白云岩' },
  { id: 105, region: '保定', location: '易县富岗', flow: '108', geology: '震旦亚界灰岩' },
  { id: 106, region: '保定', location: '易县牛岗', flow: '36', geology: '片麻岩' },
  { id: 107, region: '保定', location: '唐县迷城', flow: '72', geology: '震旦亚界白云岩' },
  { id: 108, region: '保定', location: '唐县倒马关', flow: '360', geology: '碳酸盐岩' },
  { id: 109, region: '保定', location: '唐县川里', flow: '180', geology: '震旦亚界灰岩' },
  { id: 110, region: '保定', location: '唐县军城', flow: '540', geology: '碳酸盐岩' },
  { id: 111, region: '保定', location: '唐县大洋', flow: '360', geology: '碳酸盐岩' },
  { id: 112, region: '保定', location: '曲阳县灵山', flow: '28.8', geology: '碳酸盐岩' },
  { id: 113, region: '保定', location: '曲阳县党城', flow: '72', geology: '震旦亚界灰岩' },
  { id: 114, region: '保定', location: '曲阳县产德', flow: '36', geology: '碳酸盐岩' },
  // --- 张家口 ---
  { id: 115, region: '张家口', location: '赤城县周立沟汤泉', flow: '86.7', geology: '花岗片麻岩,温泉' },
  { id: 116, region: '张家口', location: '赤城县捕子亩温泉', flow: '-', geology: '花岗片麻岩,温泉' },
  { id: 117, region: '张家口', location: '怀来县后郝窑热水孔', flow: '36', geology: '花岗岩裂隙,水温89°C' },
  { id: 118, region: '张家口', location: '怀来县暖泉', flow: '-', geology: '碳酸盐岩,温泉' },
  { id: 119, region: '张家口', location: '阳原县棵洗搪泉', flow: '180', geology: '碳酸盐岩' },
  { id: 120, region: '张家口', location: '阳原县煤洗捎泉', flow: '-', geology: '碳酸盐岩' },
  { id: 121, region: '张家口', location: '隆化县西大坝暖水泉', flow: '36', geology: '碳酸盐岩' },
  { id: 122, region: '张家口', location: '围场县三湾子热水汤泉', flow: '-', geology: '碳酸盐岩,温泉' },
  { id: 123, region: '张家口', location: '卢龙县崔庄汤池', flow: '-', geology: '碳酸盐岩,温泉' },
  { id: 124, region: '张家口', location: '邢台县朱庄温泉', flow: '-', geology: '碳酸盐岩,温泉' },
  { id: 125, region: '张家口', location: '赤城县龙潭泉', flow: '-', geology: '中上元古界白云岩' },
  { id: 126, region: '张家口', location: '蔚县南山北泉', flow: '-', geology: '奥陶系+寒武系灰岩' },
];

// 泉水分地区统计
export const springStatsByRegion = [
  { region: '保定', count: 34 },
  { region: '石家庄', count: 29 },
  { region: '唐山', count: 20 },
  { region: '承德', count: 17 },
  { region: '邯邢', count: 14 },
  { region: '张家口', count: 12 },
];

// ───────────────────────────────────────────────────────
// 二、河流渗漏数据 (12条, 表17)
// ───────────────────────────────────────────────────────

export interface RiverLeakage {
  id: number;
  river: string;
  section: string;
  measuredLeakage: string;  // 实测漏失量 m³/s
  avgLeakage: string;       // 多年平均漏失量 m³/s
  note: string;
}

export const riverLeakageData: RiverLeakage[] = [
  { id: 1, river: '滏阳河', section: '韩村', measuredLeakage: '168/74.7.28', avgLeakage: '0.36/73', note: '碳酸盐岩分布区' },
  { id: 2, river: '小马河', section: '交台村以下', measuredLeakage: '146/74.7.27', avgLeakage: '-', note: '上游常年有水' },
  { id: 3, river: '白马河', section: '南青山以下至潭村', measuredLeakage: '2700/63.8.4', avgLeakage: '0.98', note: '南青山测流量0.48m³/s' },
  { id: 4, river: '七里河', section: '黄店以下', measuredLeakage: '-', avgLeakage: '-', note: '漏失段仅汛期有水' },
  { id: 5, river: '沙河(朱庄川)', section: '朱庄以下至东坚固', measuredLeakage: '8360/51.3/63', avgLeakage: '2.64', note: '56-74年朱庄平均值' },
  { id: 6, river: '渡口川', section: '渡口以下至八里庙', measuredLeakage: '-', avgLeakage: '0.61', note: '渡口以上常年有水' },
  { id: 7, river: '马会河', section: '柴关以下至西石门', measuredLeakage: '-', avgLeakage: '0.22', note: '柴关以上常年有水' },
  { id: 8, river: '北洛河', section: '高村', measuredLeakage: '2180/63.8.6', avgLeakage: '0.86', note: '贺进一带断流' },
  { id: 9, river: '南洺河', section: '小店以下', measuredLeakage: '495/56.8.3', avgLeakage: '0.10', note: '多年平均流量0.15~0.2m³/s' },
  { id: 10, river: '清漳河', section: '石门以下至涉县断层', measuredLeakage: '5660/63.8.6', avgLeakage: '0.59', note: '多年旱季一般断流' },
  { id: 11, river: '通天河(曲阳)', section: '南宋家庄至南家庄', measuredLeakage: '-', avgLeakage: '0.5~1', note: '至渗失段全部潜入地下' },
  { id: 12, river: '干沟河(曲阳)', section: '葫芦汪至磨子山', measuredLeakage: '-', avgLeakage: '0.3~0.5', note: '至渗失段全部潜入地下' },
];

// ───────────────────────────────────────────────────────
// 三、山区径流模数 (表16)
// ───────────────────────────────────────────────────────

export interface RunoffModulus {
  rockType: string;
  range: string;        // 变化范围 L/(s·km²)
  average: string;      // 平均值 L/(s·km²)
}

export const mountainRunoffModulus: RunoffModulus[] = [
  { rockType: '第四系松散岩石与部分沉积岩', range: '8.89', average: '8.89' },
  { rockType: '沉积岩', range: '3.13~5.47', average: '3.77' },
  { rockType: '沉积岩与岩浆岩', range: '2.41~4.39', average: '3.26' },
  { rockType: '沉积岩与变质岩', range: '2.28~3.74', average: '2.81' },
  { rockType: '变质岩', range: '1.63~2.99', average: '2.40' },
];

// ───────────────────────────────────────────────────────
// 四、含水层出水率经验值 (表100)
// 单位: m³/h·m³ (厚度1m砂层水位降低1m时的出水量)
// ───────────────────────────────────────────────────────

export interface YieldRate {
  lithology: string;
  code: string;
  aquiferGroup: string;
  region: string;
  range: string;
}

export const aquiferYieldRate: YieldRate[] = [
  // 第I含水组 - 山前冲洪积扇主流带(邯郸/邢台/石家庄/保定)
  { lithology: '粉砂', code: 'F', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '0.30~0.50' },
  { lithology: '细砂', code: 'X', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '0.40~0.70' },
  { lithology: '中砂', code: 'Z', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '0.60~0.80' },
  { lithology: '粗砂', code: 'C', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '0.80~1.20' },
  { lithology: '砾石', code: 'Li', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '2.20~2.80' },
  { lithology: '卵石', code: 'Lu', aquiferGroup: 'I', region: '山前(邯邢石保)', range: '3.00~5.00' },
  // 第I含水组 - 廊坊(全淡水)
  { lithology: '粉砂', code: 'F', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '0.30~0.50' },
  { lithology: '细砂', code: 'X', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '0.60~0.65' },
  { lithology: '中砂', code: 'Z', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '0.80~1.00' },
  { lithology: '粗砂', code: 'C', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '1.12~1.50' },
  { lithology: '砾石', code: 'Li', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '1.50~2.00' },
  { lithology: '卵石', code: 'Lu', aquiferGroup: 'I', region: '廊坊(全淡水)', range: '2.00~3.00' },
  // 第II含水组 - 山前
  { lithology: '粉砂', code: 'F', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '0.25~0.30' },
  { lithology: '细砂', code: 'X', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '0.35~0.45' },
  { lithology: '中砂', code: 'Z', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '0.45~0.60' },
  { lithology: '粗砂', code: 'C', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '0.60~0.80' },
  { lithology: '砾石', code: 'Li', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '1.50~2.00' },
  { lithology: '卵石', code: 'Lu', aquiferGroup: 'II', region: '山前(邯邢石保)', range: '2.00~3.00' },
  // 第II含水组 - 廊坊
  { lithology: '粉砂', code: 'F', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.16~0.24' },
  { lithology: '细砂', code: 'X', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.25~0.37' },
  { lithology: '中砂', code: 'Z', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.38~0.48' },
  { lithology: '粗砂', code: 'C', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.49~0.50' },
  { lithology: '砾石', code: 'Li', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '0.90~1.10' },
  { lithology: '卵石', code: 'Lu', aquiferGroup: 'II', region: '廊坊(全淡水)', range: '1.30~1.70' },
];

// ───────────────────────────────────────────────────────
// 五、渗透系数K值分区统计 (表112)
// 单位: m/d
// ───────────────────────────────────────────────────────

export interface KValue {
  lithology: string;
  aquiferGroup: string;
  plainZone: string;
  range: string;
}

export const kValueByZone: KValue[] = [
  // 第I含水组
  { lithology: '粉砂', aquiferGroup: 'I', plainZone: '山前平原', range: '5~8' },
  { lithology: '粉砂', aquiferGroup: 'I', plainZone: '中部平原', range: '4~6' },
  { lithology: '粉砂', aquiferGroup: 'I', plainZone: '东部及滨海', range: '8~5(推断)' },
  { lithology: '细砂', aquiferGroup: 'I', plainZone: '山前平原', range: '8~12' },
  { lithology: '细砂', aquiferGroup: 'I', plainZone: '中部平原', range: '6~10' },
  { lithology: '细砂', aquiferGroup: 'I', plainZone: '东部及滨海', range: '5~8' },
  { lithology: '中砂', aquiferGroup: 'I', plainZone: '山前平原', range: '15~25' },
  { lithology: '中砂', aquiferGroup: 'I', plainZone: '中部平原', range: '12~18' },
  { lithology: '中砂', aquiferGroup: 'I', plainZone: '东部及滨海', range: '10~15' },
  { lithology: '粗砂', aquiferGroup: 'I', plainZone: '山前平原', range: '20~50' },
  { lithology: '粗砂', aquiferGroup: 'I', plainZone: '中部平原', range: '18~25(推断)' },
  { lithology: '粗砂', aquiferGroup: 'I', plainZone: '东部及滨海', range: '15~20' },
  { lithology: '砾石', aquiferGroup: 'I', plainZone: '山前平原', range: '50~70或>70' },
  { lithology: '卵石', aquiferGroup: 'I', plainZone: '山前平原', range: '>100(推断)' },
  // 第II含水组
  { lithology: '粉砂', aquiferGroup: 'II', plainZone: '山前平原', range: '<3.5' },
  { lithology: '粉砂', aquiferGroup: 'II', plainZone: '中部平原', range: '<2.5' },
  { lithology: '粉砂', aquiferGroup: 'II', plainZone: '东部及滨海', range: '<1' },
  { lithology: '细砂', aquiferGroup: 'II', plainZone: '山前平原', range: '3.8~8' },
  { lithology: '细砂', aquiferGroup: 'II', plainZone: '中部平原', range: '4.5~10' },
  { lithology: '细砂', aquiferGroup: 'II', plainZone: '东部及滨海', range: '1~8' },
  { lithology: '中砂', aquiferGroup: 'II', plainZone: '山前平原', range: '4.5~12' },
  { lithology: '中砂', aquiferGroup: 'II', plainZone: '中部平原', range: '5~15' },
  { lithology: '中砂', aquiferGroup: 'II', plainZone: '东部及滨海', range: '8~10' },
  { lithology: '粗砂', aquiferGroup: 'II', plainZone: '山前平原', range: '5.5~13' },
  { lithology: '粗砂', aquiferGroup: 'II', plainZone: '中部平原', range: '8~20' },
  { lithology: '粗砂', aquiferGroup: 'II', plainZone: '东部及滨海', range: '6~12' },
  { lithology: '砾石', aquiferGroup: 'II', plainZone: '山前平原', range: '20~50(推断)' },
  { lithology: '卵石', aquiferGroup: 'II', plainZone: '山前平原', range: '>50' },
];

// ───────────────────────────────────────────────────────
// 六、出水率与含水层厚度关系 (表101)
// ───────────────────────────────────────────────────────

export interface ThicknessYieldRelation {
  lithology: string;
  thicknessRange: string;
  yieldRate: string;
}

export const thicknessYieldRelation: ThicknessYieldRelation[] = [
  { lithology: '粉砂', thicknessRange: '<5m', yieldRate: '0.18~0.23' },
  { lithology: '粉砂', thicknessRange: '5~10m', yieldRate: '0.23~0.28' },
  { lithology: '粉砂', thicknessRange: '>10m', yieldRate: '0.28~0.34' },
  { lithology: '细砂', thicknessRange: '<5m', yieldRate: '0.35~0.40' },
  { lithology: '细砂', thicknessRange: '5~10m', yieldRate: '0.40~0.45' },
  { lithology: '细砂', thicknessRange: '>10m', yieldRate: '0.45~0.52' },
  { lithology: '中砂', thicknessRange: '<5m', yieldRate: '0.50~0.60' },
  { lithology: '中砂', thicknessRange: '5~10m', yieldRate: '0.60~0.80' },
  { lithology: '中砂', thicknessRange: '>10m', yieldRate: '0.80~1.00' },
  { lithology: '粗砂', thicknessRange: '<5m', yieldRate: '1.00~1.50' },
  { lithology: '粗砂', thicknessRange: '5~10m', yieldRate: '1.50~2.00' },
  { lithology: '粗砂', thicknessRange: '>10m', yieldRate: '2.00~3.00' },
];

// ───────────────────────────────────────────────────────
// 七、深层水参数
// ───────────────────────────────────────────────────────

export interface DeepWaterParam {
  region: string;
  elasticReleaseCoeff: string;  // 弹性释放系数 S
  leakageRechargeCoeff: string; // 越流补给系数 e
  leakageMax: string;           // 越流系数最大
  leakageMin: string;           // 越流系数最小
}

export const deepWaterParams: DeepWaterParam[] = [
  { region: '沧州', elasticReleaseCoeff: '0.364×10⁻²', leakageRechargeCoeff: '0.177×10⁻⁴', leakageMax: '2660', leakageMin: '152' },
  { region: '衡水', elasticReleaseCoeff: '0.428×10⁻²', leakageRechargeCoeff: '0.189×10⁻⁴', leakageMax: '1716', leakageMin: '171' },
  { region: '邢台', elasticReleaseCoeff: '0.277×10⁻²', leakageRechargeCoeff: '0.134×10⁻⁴', leakageMax: '2660', leakageMin: '158' },
];

// ───────────────────────────────────────────────────────
// 八、给水度与砂层厚度 (分地区)
// ───────────────────────────────────────────────────────

export interface RegionSpecificYield {
  region: string;
  aquiferGroup: string;
  area: string;       // km²
  sandThickness: string;  // m
  specificYield: string;  // 给水度
  staticReserve: string;  // 砂层静储量 亿m³
}

export const regionSpecificYield: RegionSpecificYield[] = [
  { region: '廊坊', aquiferGroup: '浅层I+II', area: '3298', sandThickness: '9.4', specificYield: '0.15', staticReserve: '46.506' },
  { region: '邢台', aquiferGroup: '浅层I', area: '2642', sandThickness: '8.8~9.26', specificYield: '0.165', staticReserve: '38.761' },
  { region: '保定', aquiferGroup: '浅层I+II', area: '1864', sandThickness: '40.18', specificYield: '0.134~0.206', staticReserve: '100.360' },
  { region: '石家庄', aquiferGroup: '浅层I+II', area: '10478', sandThickness: '38.34', specificYield: '0.05', staticReserve: '827.557' },
  { region: '石家庄', aquiferGroup: '浅层I+II', area: '6976', sandThickness: '46.87', specificYield: '0.2456', staticReserve: '803.026' },
];

// ───────────────────────────────────────────────────────
// 九、山前冲洪积扇分段参数 (怀来盆地)
// ───────────────────────────────────────────────────────

export interface FanZoneParam {
  position: string;
  lithology: string;
  thickness: string;     // m
  yieldRate: string;     // m³/(h·m)
  waterLevel: string;    // m
  waterType: string;
  salinity: string;      // g/L
}

export const huailaiBasinParams: FanZoneParam[] = [
  { position: '扇顶部', lithology: '漂砾、卵石', thickness: '>100', yieldRate: '32~98', waterLevel: '100~>40', waterType: 'HCO₃-Ca·Mg', salinity: '<0.1' },
  { position: '扇中部', lithology: '砂、卵石', thickness: '33', yieldRate: '17', waterLevel: '10~40', waterType: 'HCO₃-Ca·Mg', salinity: '0.5~1.0' },
  { position: '扇前缘', lithology: '砂、砾石', thickness: '0~18', yieldRate: '3~10', waterLevel: '5~10', waterType: 'HCO₃·Cl-Ca·Mg', salinity: '1.0~1.7' },
  { position: '冲积平原', lithology: '粉细砂', thickness: '16', yieldRate: '<1', waterLevel: '<5', waterType: 'Cl·SO₄-Na', salinity: '>3.0' },
];

// ───────────────────────────────────────────────────────
// 十、邯邢地区岩溶水参数
// ───────────────────────────────────────────────────────

export interface KarstYieldParam {
  location: string;
  aquifer: string;
  yieldRate: string;     // m³/(h·m)
  source: string;
}

export const hanxingKarstParams: KarstYieldParam[] = [
  { location: '白龙洞径流段', aquifer: '中奥陶系灰岩', yieldRate: '116.7~217.6', source: '抽水' },
  { location: '黑龙洞北洛河径流带', aquifer: '中奥陶系灰岩', yieldRate: '3124.8', source: '注水试验' },
  { location: '黑龙洞漳河径流带', aquifer: '中奥陶系灰岩', yieldRate: '23.2~318.9', source: '抽水' },
  { location: '康二城径流带', aquifer: '中奥陶系灰岩', yieldRate: '18.4~19.6', source: '抽水' },
  { location: '邢台白马河百泉径流带', aquifer: '寒武-奥陶系灰岩', yieldRate: '13.9~6006', source: '抽水' },
  { location: '邢台七里河百泉径流带', aquifer: '寒武-奥陶系灰岩', yieldRate: '8.1~330', source: '抽水' },
  { location: '邢台沙河百泉径流带', aquifer: '寒武-奥陶系灰岩', yieldRate: '8.4~67.7', source: '抽水' },
  { location: '邢台北洺河百泉径流带', aquifer: '寒武-奥陶系灰岩', yieldRate: '5.9~330', source: '抽水' },
];

// ───────────────────────────────────────────────────────
// 十一、各盆地含水层参数
// ───────────────────────────────────────────────────────

export interface BasinAquiferParam {
  location: string;
  lithology: string;
  thickness: string;    // m
  yieldRate: string;    // m³/(h·m)
  waterLevel: string;   // m
}

export const basinAquiferParams: BasinAquiferParam[] = [
  { location: '遵化山间盆地', lithology: '粗砂/砾石', thickness: '20~100', yieldRate: '10~50', waterLevel: '2~5' },
  { location: '张家口-宣化盆地', lithology: '砂砾石', thickness: '20~100', yieldRate: '10~50', waterLevel: '30~2' },
  { location: '张家口-宣化盆地中部', lithology: '砂砾石', thickness: '40~80', yieldRate: '30~100', waterLevel: '2~5' },
  { location: '怀来-延庆盆地冲积层', lithology: '砾石/砂', thickness: '25~100', yieldRate: '30~100', waterLevel: '<5' },
  { location: '怀来-延庆盆地山前', lithology: '冲洪积砂砾石', thickness: '25~100', yieldRate: '30~150', waterLevel: '5~6' },
  { location: '兴隆-平泉', lithology: '雾迷山白云岩', thickness: '-', yieldRate: '0.1~1.7(最大)', waterLevel: '-' },
  { location: '迁安-卢龙宽谷', lithology: '冲洪积砂砾石', thickness: '10~100', yieldRate: '8~10', waterLevel: '-' },
  { location: '山海关-马兰峪', lithology: '砂砾石/粗砂', thickness: '-', yieldRate: '10~20', waterLevel: '-' },
];

// ───────────────────────────────────────────────────────
// 十二、水库工程地质数据
// ───────────────────────────────────────────────────────

export interface ReservoirGeology {
  name: string;
  location: string;
  damType: string;
  foundationRock: string;
}

export const reservoirGeology: ReservoirGeology[] = [
  { name: '岗南水库', location: '平山/滹沱河', damType: '土坝', foundationRock: '片麻岩' },
  { name: '黄壁庄水库', location: '平山/滹沱河', damType: '土坝', foundationRock: '千枚岩' },
  { name: '王快水库', location: '曲阳/沙河', damType: '土坝', foundationRock: '片麻岩/千枚岩' },
  { name: '岳城水库', location: '磁县/漳河', damType: '土坝', foundationRock: '粉细砂' },
  { name: '潘家口水库', location: '迁西/滦河', damType: '混凝土坝', foundationRock: '片麻岩' },
  { name: '大黑汀水库', location: '迁西/滦河', damType: '-', foundationRock: '片麻岩' },
];

// ───────────────────────────────────────────────────────
// 十三、岩石力学参数 (抗压强度, kg/cm²)
// ───────────────────────────────────────────────────────

export interface RockMechanics {
  location: string;
  rockName: string;
  compressiveDry: string;     // 干燥抗压
  compressiveSaturated: string; // 饱和抗压
}

export const rockMechanics: RockMechanics[] = [
  { location: '岗南水库', rockName: '均质花岗片麻岩', compressiveDry: '1589', compressiveSaturated: '-' },
  { location: '岗南水库', rockName: '含铁花岗片麻岩', compressiveDry: '1747', compressiveSaturated: '-' },
  { location: '岗南水库', rockName: '角闪石片麻岩', compressiveDry: '1795', compressiveSaturated: '1256' },
  { location: '岗南水库', rockName: '大理岩', compressiveDry: '832', compressiveSaturated: '792' },
  { location: '岗南水库', rockName: '中性岩脉', compressiveDry: '2304', compressiveSaturated: '1233' },
  { location: '王快水库', rockName: '伟晶岩', compressiveDry: '1207', compressiveSaturated: '1113' },
  { location: '子桥水库', rockName: '花岗岩', compressiveDry: '1165', compressiveSaturated: '1045' },
  { location: '黄壁庄水库', rockName: '新鲜千枚岩', compressiveDry: '1177~1914', compressiveSaturated: '1040' },
];

// ───────────────────────────────────────────────────────
// 十四、电性层与矿化度对应关系 (表305)
// ───────────────────────────────────────────────────────

export interface ResistivitySalinity {
  resistivityRange: string;  // 欧姆·m
  salinityRange: string;     // g/L
  waterType: string;
}

export const resistivitySalinityRelation: ResistivitySalinity[] = [
  { resistivityRange: '>20', salinityRange: '<1.2', waterType: '淡水' },
  { resistivityRange: '14~20', salinityRange: '1.2~2', waterType: '微咸水' },
  { resistivityRange: '11~14', salinityRange: '2~3', waterType: '半咸水' },
  { resistivityRange: '8~11', salinityRange: '3~5', waterType: '咸水' },
  { resistivityRange: '<8', salinityRange: '>5', waterType: '高矿化咸水' },
];

// ───────────────────────────────────────────────────────
// 十五、岩性电阻率参数 (表308, 钓鱼台水库)
// ───────────────────────────────────────────────────────

export interface LithologyResistivity {
  lithology: string;
  resistivity: string;  // 欧姆·m
  note: string;
}

export const lithologyResistivity: LithologyResistivity[] = [
  { lithology: '粉砂', resistivity: '100~300', note: '' },
  { lithology: '亚砂土', resistivity: '60~100', note: '' },
  { lithology: '亚粘土', resistivity: '30~40', note: '' },
  { lithology: '粘土', resistivity: '10~20', note: '' },
  { lithology: '风化花岗岩', resistivity: '60~80', note: '' },
  { lithology: '新鲜花岗岩', resistivity: '500~2000', note: '' },
  { lithology: '风化花岗片麻岩', resistivity: '55~150', note: '' },
  { lithology: '新鲜花岗片麻岩', resistivity: '400~600', note: '' },
];

// ───────────────────────────────────────────────────────
// 十六、河北平原油性电阻率分区 (表313)
// ───────────────────────────────────────────────────────

export interface PlainResistivityZone {
  hydroZone: string;
  sand: string;      // 砂层 欧姆·m
  siltySand: string;  // 亚砂土
  siltyClay: string;  // 亚粘土
  clay: string;       // 粘土
}

export const plainResistivityZones: PlainResistivityZone[] = [
  { hydroZone: '山前平原', sand: '10~120', siltySand: '6~30', siltyClay: '8~24', clay: '2.5~16' },
  { hydroZone: '中部平原', sand: '17~60', siltySand: '9~28', siltyClay: '5~18', clay: '4~12' },
  { hydroZone: '滨海平原', sand: '7~30', siltySand: '5~16', siltyClay: '4~12', clay: '8~10' },
];

// ───────────────────────────────────────────────────────
// 十七、地层柱状简表
// ───────────────────────────────────────────────────────

export interface StratigraphyUnit {
  era: string;
  system: string;
  series: string;
  group: string;
  thickness: string;   // m
  mainLithology: string;
  aquiferNote: string;
}

export const historicalStratigraphy: StratigraphyUnit[] = [
  { era: '新生界', system: '第四系', series: '', group: '', thickness: '数十~数百', mainLithology: '砂砾石、砂、粘性土', aquiferNote: '主要孔隙含水层' },
  { era: '新生界', system: '第三系', series: '上新统', group: '', thickness: '', mainLithology: '玄武岩、砂砾岩', aquiferNote: '深层孔隙水' },
  { era: '中生界', system: '侏罗系', series: '上统', group: '九龙山组', thickness: '89~1382', mainLithology: '杂色页岩、砂岩、砾岩', aquiferNote: '裂隙水,水量小' },
  { era: '中生界', system: '侏罗系', series: '下统', group: '门头沟组', thickness: '194~716', mainLithology: '砾岩、砂岩、页岩夹煤层', aquiferNote: '裂隙水' },
  { era: '上古生界', system: '二叠系', series: '上统', group: '上石盒子组', thickness: '', mainLithology: '红色砂岩、杂色粘土页岩', aquiferNote: '裂隙水,弱含水' },
  { era: '上古生界', system: '二叠系', series: '下统', group: '山西组', thickness: '40', mainLithology: '黑色页岩夹煤层', aquiferNote: '裂隙水,弱含水' },
  { era: '上古生界', system: '石炭系', series: '上统', group: '太原群', thickness: '120~130', mainLithology: '砂岩、页岩夹煤层', aquiferNote: '裂隙水,弱含水' },
  { era: '上古生界', system: '石炭系', series: '下统', group: '本溪群', thickness: '20~85', mainLithology: '页岩、灰岩夹煤层', aquiferNote: '裂隙水' },
  { era: '上古生界', system: '奥陶系', series: '中统', group: '马家沟组', thickness: '354~654', mainLithology: '深灰色石灰岩', aquiferNote: '主要岩溶含水层' },
  { era: '上古生界', system: '奥陶系', series: '下统', group: '冶里组', thickness: '65~154', mainLithology: '白云岩和粘土质白云岩', aquiferNote: '岩溶裂隙含水' },
  { era: '上古生界', system: '寒武系', series: '中统', group: '张夏组', thickness: '160~223', mainLithology: '鲕状灰岩、灰岩', aquiferNote: '岩溶含水层' },
  { era: '上古生界', system: '寒武系', series: '下统', group: '馒头组', thickness: '40~56', mainLithology: '粗砂岩、砾岩、页岩', aquiferNote: '弱含水' },
  { era: '上元古界', system: '震旦亚界', series: '中统', group: '雾迷山组', thickness: '最厚', mainLithology: '白云岩', aquiferNote: '主要含水层' },
  { era: '上元古界', system: '震旦亚界', series: '下统', group: '高于庄组', thickness: '', mainLithology: '白云质灰岩', aquiferNote: '岩溶裂隙含水' },
  { era: '上元古界', system: '震旦亚界', series: '下统', group: '大红峪组', thickness: '', mainLithology: '石英砂岩', aquiferNote: '裂隙含水' },
  { era: '下元古界', system: '', series: '', group: '甘陶河群', thickness: '366~3000', mainLithology: '砂岩、板岩、安山岩', aquiferNote: '裂隙水' },
  { era: '太古界', system: '', series: '', group: '阜平群', thickness: '', mainLithology: '片岩、片麻岩夹大理岩', aquiferNote: '风化裂隙水' },
];

// ───────────────────────────────────────────────────────
// 十八、灌区工程数据
// ───────────────────────────────────────────────────────

export interface IrrigationDistrict {
  name: string;
  waterSource: string;
  designFlow: string;        // m³/s
  actualFlow: string;
  designArea: string;        // 万亩
  actualArea: string;
  efficiency: string;        // 渠系水有效利用系数
}

export const largeIrrigationDistricts: IrrigationDistrict[] = [
  { name: '石津灌区', waterSource: '黄壁庄水库', designFlow: '100', actualFlow: '228', designArea: '200', actualArea: '134', efficiency: '0.354' },
  { name: '民有渠灌区', waterSource: '岳城水库', designFlow: '100', actualFlow: '240', designArea: '180', actualArea: '-', efficiency: '0.3' },
  { name: '滏阳河灌区', waterSource: '东武仕水库', designFlow: '45', actualFlow: '30', designArea: '64.5', actualArea: '48', efficiency: '0.5' },
  { name: '唐河灌区', waterSource: '西大洋水库', designFlow: '68', actualFlow: '42', designArea: '100', actualArea: '47', efficiency: '0.52' },
  { name: '王快灌区', waterSource: '王快水库', designFlow: '80', actualFlow: '80', designArea: '208', actualArea: '150', efficiency: '0.4' },
  { name: '易水灌区', waterSource: '安各庄水库', designFlow: '23', actualFlow: '36.2', designArea: '34.7', actualArea: '-', efficiency: '0.47' },
  { name: '房涞溷灌区', waterSource: '拒马河', designFlow: '22.45', actualFlow: '18.8', designArea: '40.7', actualArea: '30', efficiency: '0.403' },
];

export interface MediumIrrigationByRegion {
  region: string;
  count: number;
  designFlow: string;
  actualFlow: string;
  designArea: string;
}

export const mediumIrrigationByRegion: MediumIrrigationByRegion[] = [
  { region: '邯郸', count: 7, designFlow: '55.5', actualFlow: '38.5', designArea: '42.19' },
  { region: '邢台', count: 14, designFlow: '64.7', actualFlow: '52.6', designArea: '81.80' },
  { region: '石家庄', count: 19, designFlow: '107.9', actualFlow: '91.8', designArea: '111.56' },
  { region: '保定', count: 17, designFlow: '84.7', actualFlow: '55.6', designArea: '53.21' },
  { region: '廊坊', count: 6, designFlow: '102.5', actualFlow: '85.0', designArea: '32.95' },
  { region: '沧州', count: 5, designFlow: '110.0', actualFlow: '56.0', designArea: '39.50' },
  { region: '衡水', count: 11, designFlow: '129.4', actualFlow: '111.4', designArea: '58.48' },
  { region: '张家口', count: 45, designFlow: '1312.3', actualFlow: '956.7', designArea: '122.54' },
];

// ───────────────────────────────────────────────────────
// 十九、离子迁移率 (表314, 18°C)
// ───────────────────────────────────────────────────────

export interface IonMobility {
  ion: string;
  mobility: string;  // ×10⁻⁶ cm²/(s·V)
  ionType: string;
}

export const ionMobility: IonMobility[] = [
  { ion: 'H⁺', mobility: '324.2', ionType: '阳离子' },
  { ion: 'K⁺', mobility: '66.5', ionType: '阳离子' },
  { ion: 'Na⁺', mobility: '45.6', ionType: '阳离子' },
  { ion: 'Ca²⁺', mobility: '53.4', ionType: '阳离子' },
  { ion: 'Mg²⁺', mobility: '46.6', ionType: '阳离子' },
  { ion: 'OH⁻', mobility: '180.2', ionType: '阴离子' },
  { ion: 'Cl⁻', mobility: '67.6', ionType: '阴离子' },
  { ion: 'SO₄²⁻', mobility: '70.4', ionType: '阴离子' },
  { ion: 'HCO₃⁻', mobility: '39.4', ionType: '阴离子' },
];

// ───────────────────────────────────────────────────────
// 二十、承德地区水化学特征 (表18)
// ───────────────────────────────────────────────────────

export interface ChengdeHydrochemZone {
  component: string;
  strongErosion: string;   // 强烈侵蚀区(浅部)
  erosionDepositShallow: string; // 侵蚀-堆积区(浅部)
  erosionDepositDeep: string;   // 侵蚀-堆积区(深部)
  unit: string;
}

export const chengdeHydrochemistry: ChengdeHydrochemZone[] = [
  { component: 'Ca²⁺', strongErosion: '24~62', erosionDepositShallow: '24~1000', erosionDepositDeep: '62~17735', unit: 'mg/L' },
  { component: 'Mg²⁺', strongErosion: '4.6~15.67', erosionDepositShallow: '4.3~32', erosionDepositDeep: '27.6~5168', unit: 'mg/L' },
  { component: 'Na⁺', strongErosion: '1.24', erosionDepositShallow: '17.6', erosionDepositDeep: '21.6', unit: 'mg/L' },
  { component: 'SO₄²⁻', strongErosion: '7.5~16.86', erosionDepositShallow: '18~31.26', erosionDepositDeep: '36.5', unit: 'mg/L' },
  { component: '矿化度', strongErosion: '<0.3', erosionDepositShallow: '0.3~0.64', erosionDepositDeep: '0.627~0.869', unit: 'g/L' },
  { component: 'pH', strongErosion: '6~6.5', erosionDepositShallow: '6~7.88', erosionDepositDeep: '7.95', unit: '' },
  { component: '总硬度(德度)', strongErosion: '4.4~9.4', erosionDepositShallow: '10.4~25.38', erosionDepositDeep: '24.77~36.67', unit: '' },
];
