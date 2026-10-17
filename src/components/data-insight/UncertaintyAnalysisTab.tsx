/**
 * B-36 不确定性分析与敏感性诊断器 Tab
 *
 * 5大面板：
 *  1. Monte Carlo — 参数分布设置+输出统计+直方图+CDF+收敛曲线
 *  2. Sobol敏感性 — 一阶/总阶指数+二阶交互+参数贡献饼图
 *  3. Morris筛选 — 基本效应 mu, mu*, sigma + 参数排名 + 影响分类
 *  4. 局部敏感性 — OAT扰动+弹性系数+龙卷风图
 *  5. Bootstrap — 重采样置信区间+直方图
 */

import { useState, useMemo } from 'react';
import { Dice5, GitBranch, Filter, Wind, RefreshCw, BookOpen, Settings } from 'lucide-react';
import { TechCard } from '../UI';
import {
  PRESET_MODELS, DISTRIBUTION_LABELS,
  type UncertainParameter, type ModelFunction,
} from '../../utils/uncertaintyAnalyzer';
import { MonteCarloPanel } from './uncertaintyPanels/MonteCarloPanel';
import { SobolPanel } from './uncertaintyPanels/SobolPanel';
import { MorrisPanel } from './uncertaintyPanels/MorrisPanel';
import { LocalSensitivityPanel } from './uncertaintyPanels/LocalSensitivityPanel';
import { BootstrapPanel } from './uncertaintyPanels/BootstrapPanel';
import { ReferencePanel } from './uncertaintyPanels/ReferencePanel';

export function UncertaintyAnalysisTab() {
  const [activePanel, setActivePanel] = useState<number>(0);
  const [modelId, setModelId] = useState<string>(PRESET_MODELS[0].id);

  const model = useMemo(() => PRESET_MODELS.find(m => m.id === modelId) ?? PRESET_MODELS[0], [modelId]);
  const parameters = model.parameters as unknown as UncertainParameter[];
  const modelFn = model as unknown as ModelFunction;

  const panels = [
    { key: 0, label: 'Monte Carlo', icon: Dice5 },
    { key: 1, label: 'Sobol敏感性', icon: GitBranch },
    { key: 2, label: 'Morris筛选', icon: Filter },
    { key: 3, label: '局部敏感性', icon: Wind },
    { key: 4, label: 'Bootstrap', icon: RefreshCw },
    { key: 5, label: '参考说明', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      {/* 模型选择 */}
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Settings size={16} className="text-gw-blue" />
          <h4 className="text-sm font-semibold text-gw-text">选择分析模型</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PRESET_MODELS.map(m => (
            <button key={m.id} onClick={() => setModelId(m.id)}
              className={`p-2 rounded-lg text-left transition-all ${
                modelId === m.id
                  ? 'bg-gw-blue/20 border border-gw-blue/40 text-gw-highlight'
                  : 'bg-gw-surface border border-gw-border text-gw-muted hover:border-gw-blue/20'
              }`}
            >
              <div className="text-xs font-medium">{m.name}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{m.description}</div>
            </button>
          ))}
        </div>

        {/* 参数分布显示 */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">参数</th>
                <th className="text-center py-1 px-2">符号</th>
                <th className="text-center py-1 px-2">分布类型</th>
                <th className="text-center py-1 px-2">均值</th>
                <th className="text-center py-1 px-2">标准差</th>
                <th className="text-center py-1 px-2">范围</th>
                <th className="text-center py-1 px-2">单位</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {parameters.map((p, idx) => (
                <tr key={idx} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">{p.name}</td>
                  <td className="py-1 px-2 text-center font-mono">{p.symbol}</td>
                  <td className="py-1 px-2 text-center">{DISTRIBUTION_LABELS[p.distribution]}</td>
                  <td className="py-1 px-2 text-center text-cyan-400">{p.mean}</td>
                  <td className="py-1 px-2 text-center text-amber-400">{p.stdDev}</td>
                  <td className="py-1 px-2 text-center text-[10px]">[{p.min}, {p.max}]</td>
                  <td className="py-1 px-2 text-center">{p.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      {/* 面板切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activePanel === p.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 0 && <MonteCarloPanel model={modelFn} parameters={parameters} />}
      {activePanel === 1 && <SobolPanel model={modelFn} parameters={parameters} />}
      {activePanel === 2 && <MorrisPanel model={modelFn} parameters={parameters} />}
      {activePanel === 3 && <LocalSensitivityPanel model={modelFn} parameters={parameters} />}
      {activePanel === 4 && <BootstrapPanel model={modelFn} parameters={parameters} />}
      {activePanel === 5 && <ReferencePanel />}
    </div>
  );
}
