/**
 * B-32 决策支持引擎 — 常量与枚举定义
 *  预警等级 / 评价指标权重说明（自 decisionSupportAlgorithms.ts 拆分）
 */

export const WARNING_LEVELS = ['蓝色', '黄色', '橙色', '红色'] as const;

export type WarningLevel = typeof WARNING_LEVELS[number];

export const weightDescriptions: Record<string, string> = {
  '水资源保障': '保障供水安全和用水需求满足程度',
  '生态效益': '对地下水位恢复、水质改善的生态贡献',
  '经济可行性': '投资成本合理性和经济回报率',
  '技术可行性': '技术成熟度和实施难度',
  '社会可接受度': '公众接受度和政策协调性',
};
