/**
 * 拆分自 hydrogeologyHistorical.ts
 */

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

