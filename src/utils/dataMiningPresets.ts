/**
 * 水质数据挖掘 — 预设数据集（自 dataMiningCalculator 拆分）
 */
import type { WaterQualitySample } from './dataMiningTypes';

export const PRESET_DATASETS: { name: string; description: string; samples: WaterQualitySample[] }[] = [
  {
    name: '太行山前平原区',
    description: '石家庄-保定-邢台山前冲洪积扇，浅层地下水，总体水质良好',
    samples: [
      { id: 'SJZ-01', location: '石家庄正定', pH: 7.2, totalHardness: 320, tds: 480, chloride: 85, sulfate: 120, bicarbonate: 280, sodium: 45, calcium: 88, magnesium: 25, iron: 0.15, fluoride: 0.3, nitrate: 8.5, ammonia: 0.05 },
      { id: 'SJZ-02', location: '石家庄鹿泉', pH: 7.5, totalHardness: 350, tds: 520, chloride: 95, sulfate: 135, bicarbonate: 310, sodium: 52, calcium: 95, magnesium: 28, iron: 0.18, fluoride: 0.35, nitrate: 12.0, ammonia: 0.08 },
      { id: 'BD-01', location: '保定满城', pH: 7.3, totalHardness: 300, tds: 450, chloride: 75, sulfate: 110, bicarbonate: 265, sodium: 40, calcium: 82, magnesium: 22, iron: 0.12, fluoride: 0.25, nitrate: 7.2, ammonia: 0.03 },
      { id: 'BD-02', location: '保定徐水', pH: 7.4, totalHardness: 330, tds: 490, chloride: 88, sulfate: 125, bicarbonate: 290, sodium: 48, calcium: 90, magnesium: 26, iron: 0.16, fluoride: 0.32, nitrate: 9.8, ammonia: 0.06 },
      { id: 'XT-01', location: '邢台沙河', pH: 7.1, totalHardness: 310, tds: 470, chloride: 80, sulfate: 118, bicarbonate: 275, sodium: 43, calcium: 85, magnesium: 24, iron: 0.14, fluoride: 0.28, nitrate: 8.0, ammonia: 0.04 },
      { id: 'XT-02', location: '邢台临城', pH: 7.6, totalHardness: 360, tds: 540, chloride: 100, sulfate: 140, bicarbonate: 320, sodium: 55, calcium: 98, magnesium: 30, iron: 0.20, fluoride: 0.38, nitrate: 13.5, ammonia: 0.10 },
      { id: 'HD-01', location: '邯郸武安', pH: 7.2, totalHardness: 340, tds: 510, chloride: 92, sulfate: 130, bicarbonate: 300, sodium: 50, calcium: 92, magnesium: 27, iron: 0.17, fluoride: 0.33, nitrate: 10.5, ammonia: 0.07 },
      { id: 'HD-02', location: '邯郸涉县', pH: 7.4, totalHardness: 325, tds: 485, chloride: 82, sulfate: 122, bicarbonate: 285, sodium: 46, calcium: 88, magnesium: 25, iron: 0.15, fluoride: 0.30, nitrate: 9.0, ammonia: 0.05 },
      { id: 'SJZ-03', location: '石家庄栾城', pH: 7.3, totalHardness: 345, tds: 505, chloride: 90, sulfate: 128, bicarbonate: 295, sodium: 49, calcium: 94, magnesium: 27, iron: 0.16, fluoride: 0.31, nitrate: 9.5, ammonia: 0.06 },
      { id: 'BD-03', location: '保定定州', pH: 7.5, totalHardness: 355, tds: 525, chloride: 96, sulfate: 138, bicarbonate: 305, sodium: 53, calcium: 96, magnesium: 29, iron: 0.19, fluoride: 0.36, nitrate: 11.5, ammonia: 0.09 },
    ],
  },
  {
    name: '中部冲积平原区',
    description: '衡水-沧州中部平原，深层地下水为主，矿化度偏高',
    samples: [
      { id: 'HS-01', location: '衡水桃城', pH: 7.8, totalHardness: 480, tds: 880, chloride: 220, sulfate: 180, bicarbonate: 350, sodium: 180, calcium: 110, magnesium: 45, iron: 0.35, fluoride: 0.8, nitrate: 5.5, ammonia: 0.15 },
      { id: 'HS-02', location: '衡水冀州', pH: 8.0, totalHardness: 520, tds: 950, chloride: 250, sulfate: 200, bicarbonate: 370, sodium: 200, calcium: 120, magnesium: 50, iron: 0.40, fluoride: 0.9, nitrate: 4.2, ammonia: 0.20 },
      { id: 'CZ-01', location: '沧州运河区', pH: 8.2, totalHardness: 580, tds: 1200, chloride: 320, sulfate: 240, bicarbonate: 400, sodium: 280, calcium: 130, magnesium: 58, iron: 0.50, fluoride: 1.2, nitrate: 3.0, ammonia: 0.25 },
      { id: 'CZ-02', location: '沧州青县', pH: 8.1, totalHardness: 550, tds: 1100, chloride: 290, sulfate: 220, bicarbonate: 380, sodium: 250, calcium: 125, magnesium: 55, iron: 0.45, fluoride: 1.1, nitrate: 3.5, ammonia: 0.22 },
      { id: 'HS-03', location: '衡水枣强', pH: 7.9, totalHardness: 500, tds: 920, chloride: 240, sulfate: 190, bicarbonate: 360, sodium: 190, calcium: 115, magnesium: 48, iron: 0.38, fluoride: 0.85, nitrate: 4.8, ammonia: 0.18 },
      { id: 'CZ-03', location: '沧州献县', pH: 8.3, totalHardness: 600, tds: 1250, chloride: 340, sulfate: 250, bicarbonate: 410, sodium: 300, calcium: 135, magnesium: 60, iron: 0.55, fluoride: 1.3, nitrate: 2.5, ammonia: 0.28 },
      { id: 'HS-04', location: '衡水武邑', pH: 7.7, totalHardness: 470, tds: 850, chloride: 210, sulfate: 170, bicarbonate: 340, sodium: 170, calcium: 105, magnesium: 42, iron: 0.32, fluoride: 0.75, nitrate: 6.0, ammonia: 0.14 },
      { id: 'CZ-04', location: '沧州河间', pH: 8.0, totalHardness: 540, tds: 1050, chloride: 280, sulfate: 210, bicarbonate: 375, sodium: 230, calcium: 122, magnesium: 53, iron: 0.42, fluoride: 1.0, nitrate: 3.8, ammonia: 0.21 },
      { id: 'HS-05', location: '衡水深州', pH: 7.8, totalHardness: 490, tds: 890, chloride: 225, sulfate: 185, bicarbonate: 355, sodium: 185, calcium: 112, magnesium: 46, iron: 0.36, fluoride: 0.82, nitrate: 5.2, ammonia: 0.16 },
      { id: 'CZ-05', location: '沧州任丘', pH: 8.1, totalHardness: 560, tds: 1150, chloride: 310, sulfate: 230, bicarbonate: 390, sodium: 265, calcium: 128, magnesium: 56, iron: 0.48, fluoride: 1.15, nitrate: 3.2, ammonia: 0.24 },
    ],
  },
  {
    name: '滨海平原区',
    description: '唐山-秦皇岛滨海地带，咸水入侵影响显著',
    samples: [
      { id: 'TS-01', location: '唐山丰南', pH: 7.5, totalHardness: 680, tds: 1800, chloride: 520, sulfate: 320, bicarbonate: 380, sodium: 450, calcium: 150, magnesium: 75, iron: 0.65, fluoride: 1.5, nitrate: 2.0, ammonia: 0.35 },
      { id: 'TS-02', location: '唐山滦南', pH: 7.6, totalHardness: 650, tds: 1700, chloride: 490, sulfate: 300, bicarbonate: 370, sodium: 420, calcium: 145, magnesium: 70, iron: 0.60, fluoride: 1.4, nitrate: 2.5, ammonia: 0.32 },
      { id: 'QHD-01', location: '秦皇岛昌黎', pH: 7.4, totalHardness: 520, tds: 980, chloride: 280, sulfate: 200, bicarbonate: 340, sodium: 220, calcium: 118, magnesium: 52, iron: 0.42, fluoride: 0.95, nitrate: 4.5, ammonia: 0.20 },
      { id: 'TS-03', location: '唐山海港', pH: 7.3, totalHardness: 720, tds: 2100, chloride: 620, sulfate: 360, bicarbonate: 400, sodium: 520, calcium: 160, magnesium: 82, iron: 0.70, fluoride: 1.7, nitrate: 1.5, ammonia: 0.40 },
      { id: 'QHD-02', location: '秦皇岛抚宁', pH: 7.2, totalHardness: 480, tds: 850, chloride: 230, sulfate: 180, bicarbonate: 320, sodium: 180, calcium: 108, magnesium: 48, iron: 0.35, fluoride: 0.75, nitrate: 6.5, ammonia: 0.16 },
      { id: 'TS-04', location: '唐山乐亭', pH: 7.5, totalHardness: 690, tds: 1850, chloride: 540, sulfate: 330, bicarbonate: 385, sodium: 460, calcium: 152, magnesium: 78, iron: 0.68, fluoride: 1.55, nitrate: 1.8, ammonia: 0.36 },
      { id: 'QHD-03', location: '秦皇岛卢龙', pH: 7.3, totalHardness: 510, tds: 920, chloride: 260, sulfate: 195, bicarbonate: 330, sodium: 210, calcium: 115, magnesium: 50, iron: 0.38, fluoride: 0.88, nitrate: 5.0, ammonia: 0.18 },
      { id: 'TS-05', location: '唐山曹妃甸', pH: 7.4, totalHardness: 750, tds: 2200, chloride: 650, sulfate: 380, bicarbonate: 410, sodium: 540, calcium: 165, magnesium: 85, iron: 0.72, fluoride: 1.8, nitrate: 1.2, ammonia: 0.42 },
      { id: 'QHD-04', location: '秦皇岛青龙', pH: 7.1, totalHardness: 460, tds: 820, chloride: 210, sulfate: 170, bicarbonate: 310, sodium: 165, calcium: 102, magnesium: 45, iron: 0.30, fluoride: 0.70, nitrate: 7.0, ammonia: 0.14 },
      { id: 'TS-06', location: '唐山迁安', pH: 7.2, totalHardness: 500, tds: 900, chloride: 240, sulfate: 190, bicarbonate: 325, sodium: 195, calcium: 112, magnesium: 50, iron: 0.36, fluoride: 0.82, nitrate: 5.5, ammonia: 0.17 },
    ],
  },
  {
    name: '坝上高原区',
    description: '张家口-承德坝上地区，高原内陆盆地地下水',
    samples: [
      { id: 'ZJK-01', location: '张北', pH: 7.8, totalHardness: 280, tds: 380, chloride: 55, sulfate: 90, bicarbonate: 230, sodium: 35, calcium: 72, magnesium: 20, iron: 0.08, fluoride: 0.20, nitrate: 5.5, ammonia: 0.02 },
      { id: 'ZJK-02', location: '康保', pH: 8.0, totalHardness: 260, tds: 360, chloride: 48, sulfate: 85, bicarbonate: 220, sodium: 32, calcium: 68, magnesium: 18, iron: 0.06, fluoride: 0.18, nitrate: 4.8, ammonia: 0.02 },
      { id: 'CD-01', location: '丰宁', pH: 7.6, totalHardness: 300, tds: 420, chloride: 62, sulfate: 100, bicarbonate: 250, sodium: 38, calcium: 78, magnesium: 22, iron: 0.10, fluoride: 0.22, nitrate: 6.2, ammonia: 0.03 },
      { id: 'ZJK-03', location: '沽源', pH: 7.9, totalHardness: 270, tds: 370, chloride: 52, sulfate: 88, bicarbonate: 225, sodium: 34, calcium: 70, magnesium: 19, iron: 0.07, fluoride: 0.19, nitrate: 5.0, ammonia: 0.02 },
      { id: 'CD-02', location: '围场', pH: 7.7, totalHardness: 290, tds: 400, chloride: 58, sulfate: 95, bicarbonate: 240, sodium: 36, calcium: 75, magnesium: 21, iron: 0.09, fluoride: 0.21, nitrate: 5.8, ammonia: 0.03 },
      { id: 'ZJK-04', location: '尚义', pH: 8.1, totalHardness: 250, tds: 350, chloride: 45, sulfate: 80, bicarbonate: 215, sodium: 30, calcium: 65, magnesium: 17, iron: 0.05, fluoride: 0.17, nitrate: 4.5, ammonia: 0.01 },
      { id: 'CD-03', location: '宽城', pH: 7.5, totalHardness: 310, tds: 430, chloride: 65, sulfate: 105, bicarbonate: 255, sodium: 40, calcium: 80, magnesium: 23, iron: 0.11, fluoride: 0.23, nitrate: 6.5, ammonia: 0.03 },
      { id: 'ZJK-05', location: '赤城', pH: 7.4, totalHardness: 320, tds: 440, chloride: 68, sulfate: 108, bicarbonate: 260, sodium: 42, calcium: 82, magnesium: 24, iron: 0.12, fluoride: 0.24, nitrate: 6.8, ammonia: 0.04 },
      { id: 'CD-04', location: '平泉', pH: 7.6, totalHardness: 295, tds: 410, chloride: 60, sulfate: 98, bicarbonate: 245, sodium: 37, calcium: 76, magnesium: 21, iron: 0.09, fluoride: 0.20, nitrate: 5.5, ammonia: 0.02 },
      { id: 'ZJK-06', location: '崇礼', pH: 7.8, totalHardness: 285, tds: 390, chloride: 56, sulfate: 92, bicarbonate: 235, sodium: 36, calcium: 74, magnesium: 20, iron: 0.08, fluoride: 0.21, nitrate: 5.2, ammonia: 0.02 },
    ],
  },
  {
    name: '燕山丘陵区',
    description: '承德-张家口燕山山地丘陵，基岩裂隙水',
    samples: [
      { id: 'CD-05', location: '承德市区', pH: 7.3, totalHardness: 350, tds: 480, chloride: 70, sulfate: 130, bicarbonate: 270, sodium: 42, calcium: 90, magnesium: 28, iron: 0.18, fluoride: 0.30, nitrate: 8.2, ammonia: 0.05 },
      { id: 'ZJK-07', location: '怀来', pH: 7.5, totalHardness: 380, tds: 520, chloride: 82, sulfate: 145, bicarbonate: 290, sodium: 48, calcium: 98, magnesium: 32, iron: 0.22, fluoride: 0.35, nitrate: 10.5, ammonia: 0.07 },
      { id: 'CD-06', location: '兴隆', pH: 7.2, totalHardness: 340, tds: 470, chloride: 68, sulfate: 125, bicarbonate: 265, sodium: 40, calcium: 88, magnesium: 26, iron: 0.16, fluoride: 0.28, nitrate: 7.8, ammonia: 0.04 },
      { id: 'ZJK-08', location: '涿鹿', pH: 7.4, totalHardness: 360, tds: 490, chloride: 75, sulfate: 135, bicarbonate: 278, sodium: 44, calcium: 92, magnesium: 30, iron: 0.19, fluoride: 0.32, nitrate: 9.0, ammonia: 0.06 },
      { id: 'CD-07', location: '滦平', pH: 7.3, totalHardness: 345, tds: 475, chloride: 72, sulfate: 128, bicarbonate: 270, sodium: 43, calcium: 89, magnesium: 27, iron: 0.17, fluoride: 0.29, nitrate: 8.5, ammonia: 0.05 },
      { id: 'ZJK-09', location: '蔚县', pH: 7.6, totalHardness: 390, tds: 530, chloride: 85, sulfate: 150, bicarbonate: 295, sodium: 50, calcium: 100, magnesium: 33, iron: 0.23, fluoride: 0.36, nitrate: 11.0, ammonia: 0.08 },
      { id: 'CD-08', location: '隆化', pH: 7.1, totalHardness: 330, tds: 460, chloride: 65, sulfate: 120, bicarbonate: 260, sodium: 38, calcium: 86, magnesium: 25, iron: 0.15, fluoride: 0.27, nitrate: 7.5, ammonia: 0.04 },
      { id: 'ZJK-10', location: '阳原', pH: 7.5, totalHardness: 370, tds: 505, chloride: 78, sulfate: 140, bicarbonate: 282, sodium: 46, calcium: 95, magnesium: 31, iron: 0.20, fluoride: 0.33, nitrate: 9.5, ammonia: 0.06 },
      { id: 'CD-09', location: '承德双桥', pH: 7.4, totalHardness: 355, tds: 485, chloride: 74, sulfate: 132, bicarbonate: 275, sodium: 44, calcium: 91, magnesium: 29, iron: 0.18, fluoride: 0.31, nitrate: 8.8, ammonia: 0.05 },
      { id: 'ZJK-11', location: '宣化', pH: 7.2, totalHardness: 365, tds: 495, chloride: 76, sulfate: 138, bicarbonate: 280, sodium: 45, calcium: 93, magnesium: 30, iron: 0.19, fluoride: 0.32, nitrate: 9.2, ammonia: 0.06 },
    ],
  },
  {
    name: '黑龙港流域',
    description: '邢台-邯郸-衡水交界，典型缺水地区，水质复杂',
    samples: [
      { id: 'XT-03', location: '邢台平乡', pH: 7.9, totalHardness: 560, tds: 1100, chloride: 310, sulfate: 250, bicarbonate: 360, sodium: 280, calcium: 130, magnesium: 55, iron: 0.48, fluoride: 1.1, nitrate: 3.8, ammonia: 0.25 },
      { id: 'HD-03', location: '邯郸大名', pH: 8.0, totalHardness: 590, tds: 1180, chloride: 340, sulfate: 270, bicarbonate: 380, sodium: 310, calcium: 138, magnesium: 58, iron: 0.52, fluoride: 1.2, nitrate: 3.2, ammonia: 0.28 },
      { id: 'HS-06', location: '衡水故城', pH: 7.8, totalHardness: 530, tds: 1020, chloride: 290, sulfate: 230, bicarbonate: 350, sodium: 250, calcium: 122, magnesium: 52, iron: 0.44, fluoride: 1.0, nitrate: 4.2, ammonia: 0.22 },
      { id: 'XT-04', location: '邢台广宗', pH: 7.7, totalHardness: 510, tds: 980, chloride: 275, sulfate: 220, bicarbonate: 345, sodium: 240, calcium: 118, magnesium: 50, iron: 0.42, fluoride: 0.95, nitrate: 4.5, ammonia: 0.20 },
      { id: 'HD-04', location: '邯郸魏县', pH: 8.1, totalHardness: 600, tds: 1200, chloride: 350, sulfate: 280, bicarbonate: 390, sodium: 320, calcium: 140, magnesium: 60, iron: 0.55, fluoride: 1.25, nitrate: 3.0, ammonia: 0.30 },
      { id: 'XT-05', location: '邢台威县', pH: 7.6, totalHardness: 520, tds: 1000, chloride: 285, sulfate: 225, bicarbonate: 348, sodium: 245, calcium: 120, magnesium: 51, iron: 0.43, fluoride: 0.98, nitrate: 4.0, ammonia: 0.21 },
      { id: 'HS-07', location: '衡水景县', pH: 7.9, totalHardness: 540, tds: 1050, chloride: 300, sulfate: 240, bicarbonate: 355, sodium: 260, calcium: 125, magnesium: 53, iron: 0.45, fluoride: 1.05, nitrate: 3.6, ammonia: 0.23 },
      { id: 'HD-05', location: '邯郸馆陶', pH: 8.2, totalHardness: 610, tds: 1250, chloride: 360, sulfate: 290, bicarbonate: 395, sodium: 330, calcium: 142, magnesium: 62, iron: 0.58, fluoride: 1.3, nitrate: 2.8, ammonia: 0.32 },
      { id: 'XT-06', location: '邢台清河', pH: 7.8, totalHardness: 550, tds: 1080, chloride: 305, sulfate: 245, bicarbonate: 358, sodium: 270, calcium: 128, magnesium: 54, iron: 0.46, fluoride: 1.08, nitrate: 3.5, ammonia: 0.24 },
      { id: 'HD-06', location: '邯郸丘县', pH: 7.7, totalHardness: 525, tds: 1010, chloride: 288, sulfate: 232, bicarbonate: 350, sodium: 248, calcium: 121, magnesium: 51, iron: 0.43, fluoride: 0.97, nitrate: 4.1, ammonia: 0.21 },
    ],
  },
];

