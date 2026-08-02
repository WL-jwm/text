/**
 * 报告生成器 Store (D-03)
 *
 * 管理报告模板、章节选择、报告配置状态。
 * 与 D-02 的批量导出不同，D-03 专注于生成结构化的完整 Word 报告：
 * 封面 → 目录 → 摘要 → 编号章节 → 结论 → 参考文献
 */

import { create } from 'zustand';

// ============================================================
// 类型定义
// ============================================================

/** 章节来源类型 */
export type ChapterSourceType = 'module' | 'auto';

/** 报告章节 */
export interface ReportChapter {
  /** 章节ID */
  id: string;
  /** 显示标题 */
  title: string;
  /** 来源模块ID（与 exportCenterStore 的 source id 一致） */
  moduleId: string;
  /** 来源模块显示名 */
  moduleLabel: string;
  /** reportGenerator 类型 */
  reportType: string;
  /** 章节序号（运行时计算） */
  order: number;
  /** 是否启用 */
  enabled: boolean;
}

/** 自动章节类型 */
export type AutoChapterType = 'cover' | 'toc' | 'summary' | 'conclusion' | 'references';

/** 报告模板 */
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  /** 模板包含的模块章节（按顺序） */
  chapters: Array<{ moduleId: string; title: string }>;
  /** 自动生成的章节 */
  autoChapters: AutoChapterType[];
  /** 结论模板 */
  conclusionTemplate: string;
  /** 适用场景 */
  scenario: string;
}

/** 报告元信息 */
export interface ReportMeta {
  title: string;
  subtitle: string;
  author: string;
  organization: string;
  /** 报告日期 */
  date: string;
}

interface ReportGeneratorState {
  /** 所有可用模板 */
  templates: ReportTemplate[];
  /** 当前选中模板ID */
  selectedTemplateId: string;
  /** 当前章节列表（可拖拽排序） */
  chapters: ReportChapter[];
  /** 报告元信息 */
  meta: ReportMeta;
  /** 是否正在生成 */
  isGenerating: boolean;
  /** 生成进度 */
  progress: { current: number; total: number };
  /** 预览模式 */
  previewMode: boolean;

  /** 选择模板 */
  selectTemplate: (id: string) => void;
  /** 切换章节启用 */
  toggleChapter: (id: string) => void;
  /** 移动章节顺序 */
  moveChapter: (id: string, direction: 'up' | 'down') => void;
  /** 更新章节标题 */
  updateChapterTitle: (id: string, title: string) => void;
  /** 添加自定义章节 */
  addChapter: (moduleId: string) => void;
  /** 移除章节 */
  removeChapter: (id: string) => void;
  /** 更新报告元信息 */
  updateMeta: (partial: Partial<ReportMeta>) => void;
  /** 设置生成状态 */
  setGenerating: (generating: boolean, progress?: { current: number; total: number }) => void;
  /** 切换预览模式 */
  togglePreview: () => void;
  /** 重置为模板默认 */
  resetToTemplate: () => void;
}

// ============================================================
// 预定义报告模板
// ============================================================

const TEMPLATES: ReportTemplate[] = [
  {
    id: 'eia',
    name: '地下水环境影响评价报告',
    description: '适用于建设项目地下水环评，涵盖水文地质、水质、均衡、脆弱性、风险、合规全链条',
    scenario: '建设项目环评',
    autoChapters: ['cover', 'toc', 'summary', 'conclusion', 'references'],
    conclusionTemplate: '综合以上分析，评价区地下水环境受{污染源}影响程度为{等级}。含水层防污性能{脆弱性等级}，污染风险{风险等级}。建议{建议措施}。',
    chapters: [
      { moduleId: 'overview', title: '评价区概况' },
      { moduleId: 'geology', title: '水文地质条件' },
      { moduleId: 'hydro-params', title: '水文地质参数' },
      { moduleId: 'water-quality', title: '地下水水质现状评价' },
      { moduleId: 'groundwater-balance', title: '地下水均衡分析' },
      { moduleId: 'hydrochemistry', title: '水化学特征分析' },
      { moduleId: 'environment', title: '环境地质问题' },
      { moduleId: 'groundwater-background', title: '背景值统计' },
      { moduleId: 'dataQuality', title: '数据质量说明' },
    ],
  },
  {
    id: 'water-source',
    name: '水源地保护区划分报告',
    description: '适用于饮用水水源地保护区划分技术报告',
    scenario: '水源地保护',
    autoChapters: ['cover', 'toc', 'summary', 'conclusion', 'references'],
    conclusionTemplate: '依据划分结果，水源地一级保护区面积{面积}，二级保护区面积{面积}。水质满足{标准}要求，污染风险{风险等级}。建议加强保护区监督管理。',
    chapters: [
      { moduleId: 'overview', title: '水源地概况' },
      { moduleId: 'geology', title: '区域水文地质' },
      { moduleId: 'hydro-params', title: '含水层参数' },
      { moduleId: 'water-quality', title: '水质现状评价' },
      { moduleId: 'groundwater-balance', title: '水量均衡分析' },
      { moduleId: 'water-source', title: '保护区划分方案' },
      { moduleId: 'hydrochemistry', title: '水化学特征' },
      { moduleId: 'groundwater-function', title: '功能区划' },
    ],
  },
  {
    id: 'regional',
    name: '区域地下水评价报告',
    description: '适用于区域性地下水综合评价，涵盖资源量、水质、开采、环境地质',
    scenario: '区域评价',
    autoChapters: ['cover', 'toc', 'summary', 'conclusion', 'references'],
    conclusionTemplate: '全区地下水总补给量{补给量}亿m³/a，可开采量{可开采量}亿m³/a。水质以{水质等级}为主，开采系数{开采系数}，{超采状态}。建议{建议措施}。',
    chapters: [
      { moduleId: 'overview', title: '区域概况' },
      { moduleId: 'system-zoning', title: '水文地质分区' },
      { moduleId: 'resources', title: '地下水资源量' },
      { moduleId: 'water-quality', title: '水质评价' },
      { moduleId: 'exploitation', title: '开采现状分析' },
      { moduleId: 'groundwater-balance', title: '均衡分析' },
      { moduleId: 'environment', title: '环境地质问题' },
      { moduleId: 'county-water-compare', title: '县域对比分析' },
      { moduleId: 'time-series', title: '动态趋势分析' },
    ],
  },
  {
    id: 'remediation',
    name: '地下水修复方案报告',
    description: '适用于污染场地地下水修复技术方案编制',
    scenario: '修复评估',
    autoChapters: ['cover', 'toc', 'summary', 'conclusion', 'references'],
    conclusionTemplate: '基于污染特征和水文地质条件，推荐{修复技术}方案。修复周期{周期}，修复效率{效率}。风险评估表明修复后风险降至{风险等级}。',
    chapters: [
      { moduleId: 'overview', title: '场地概况' },
      { moduleId: 'geology', title: '水文地质条件' },
      { moduleId: 'hydro-params', title: '含水层参数' },
      { moduleId: 'water-quality', title: '污染现状评价' },
      { moduleId: 'hydrochemistry', title: '水化学分析' },
      { moduleId: 'groundwater-background', title: '背景值对比' },
      { moduleId: 'environment', title: '环境影响分析' },
    ],
  },
  {
    id: 'custom',
    name: '自定义报告',
    description: '自由选择模块和章节，灵活组合',
    scenario: '通用',
    autoChapters: ['cover', 'toc', 'conclusion'],
    conclusionTemplate: '本报告综合分析了{模块列表}等方面的内容，为地下水环境管理提供技术支撑。',
    chapters: [],
  },
];

// ============================================================
// 模块名称映射（用于自定义添加章节时显示）
// ============================================================

export const MODULE_LABELS: Record<string, string> = {
  'overview': '区域地下水概况',
  'resources': '地下水资源评价',
  'water-quality': '水质评价计算器',
  'groundwater-balance': '地下水均衡计算',
  'exploitation': '地下水开采分析',
  'environment': '环境地质问题',
  'hydrochemistry': '水化学分析',
  'geology': '水文地质背景',
  'hydro-params': '水文地质参数',
  'water-source': '水源地保护区划分',
  'geothermal': '地热资源评价',
  'mineral-water': '矿泉水评价',
  'saline-water': '咸水入侵评价',
  'saline-soil': '土壤盐碱化评价',
  'mine-hydrogeology': '矿坑水文地质',
  'karst-water': '岩溶水系统',
  'fracture-water': '裂隙水计算',
  'system-zoning': '水文地质分区',
  'map-view': '空间分布视图',
  'data-insight': '数据洞察分析',
  'dataQuality': '数据质量评估',
  'county-water-compare': '县域横向对比',
  'groundwater-function': '地下水功能分区',
  'hydrogeology-historical': '历史水文地质',
  'groundwater-background': '背景值统计',
  'spatial-analysis': '空间统计分析',
  'time-series': '时序趋势分析',
};

// ============================================================
// 默认报告元信息
// ============================================================

const DEFAULT_META: ReportMeta = {
  title: '河北省地下水环境信息综合报告',
  subtitle: '',
  author: '',
  organization: '河北瑞三元环境科技有限公司',
  date: new Date().toISOString().slice(0, 10),
};

// ============================================================
// 辅助函数
// ============================================================

function buildChaptersFromTemplate(template: ReportTemplate): ReportChapter[] {
  return template.chapters.map((ch, idx) => ({
    id: `ch-${idx}-${ch.moduleId}`,
    title: ch.title,
    moduleId: ch.moduleId,
    moduleLabel: MODULE_LABELS[ch.moduleId] ?? ch.moduleId,
    reportType: ch.moduleId,
    order: idx,
    enabled: true,
  }));
}

// ============================================================
// Store
// ============================================================

export const useReportGeneratorStore = create<ReportGeneratorState>((set, get) => ({
  templates: TEMPLATES,
  selectedTemplateId: 'eia',
  chapters: buildChaptersFromTemplate(TEMPLATES[0]),
  meta: { ...DEFAULT_META },
  isGenerating: false,
  progress: { current: 0, total: 0 },
  previewMode: false,

  selectTemplate: (id) => {
    const template = get().templates.find(t => t.id === id);
    if (!template) return;
    set({
      selectedTemplateId: id,
      chapters: buildChaptersFromTemplate(template),
    });
  },

  toggleChapter: (id) => {
    set(state => ({
      chapters: state.chapters.map(ch =>
        ch.id === id ? { ...ch, enabled: !ch.enabled } : ch
      ),
    }));
  },

  moveChapter: (id, direction) => {
    const chapters = [...get().chapters];
    const idx = chapters.findIndex(ch => ch.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= chapters.length) return;
    [chapters[idx], chapters[swapIdx]] = [chapters[swapIdx], chapters[idx]];
    set({ chapters: chapters.map((ch, i) => ({ ...ch, order: i })) });
  },

  updateChapterTitle: (id, title) => {
    set(state => ({
      chapters: state.chapters.map(ch =>
        ch.id === id ? { ...ch, title } : ch
      ),
    }));
  },

  addChapter: (moduleId) => {
    const label = MODULE_LABELS[moduleId] ?? moduleId;
    const newCh: ReportChapter = {
      id: `ch-custom-${Date.now()}-${moduleId}`,
      title: label,
      moduleId,
      moduleLabel: label,
      reportType: moduleId,
      order: get().chapters.length,
      enabled: true,
    };
    set(state => ({ chapters: [...state.chapters, newCh] }));
  },

  removeChapter: (id) => {
    set(state => ({
      chapters: state.chapters
        .filter(ch => ch.id !== id)
        .map((ch, i) => ({ ...ch, order: i })),
    }));
  },

  updateMeta: (partial) => {
    set(state => ({ meta: { ...state.meta, ...partial } }));
  },

  setGenerating: (generating, progress) => {
    set({ isGenerating: generating, progress: progress ?? { current: 0, total: 0 } });
  },

  togglePreview: () => set(state => ({ previewMode: !state.previewMode })),

  resetToTemplate: () => {
    const template = get().templates.find(t => t.id === get().selectedTemplateId);
    if (template) {
      set({ chapters: buildChaptersFromTemplate(template) });
    }
  },
}));

// ============================================================
// 辅助导出
// ============================================================

/** 获取当前选中模板 */
export function getSelectedTemplate(state: ReportGeneratorState): ReportTemplate | undefined {
  return state.templates.find(t => t.id === state.selectedTemplateId);
}

/** 生成报告文件名 */
export function generateReportFilename(meta: ReportMeta): string {
  const dateStr = meta.date.replace(/-/g, '');
  return `${meta.title}_${dateStr}.docx`;
}
