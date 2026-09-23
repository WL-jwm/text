/**
 * B-34 地下水-地表水交互分析器 Tab
 *
 * 5大面板（已拆分至 ./panels/）：
 *  1. 基流分割 — 三种数字滤波法+径流过程线+BFI对比
 *  2. 交换通量 — Darcy法+河段剖面图+通量统计
 *  3. 河岸带分析 — 温度示踪+振幅衰减+停留时间
 *  4. 交互分类 — 类型判定+特征+管理建议
 *  5. 参考说明 — 方法原理+预设河流+公式
 */
import { useState } from 'react';
import { Waves, ArrowLeftRight, Thermometer, BookOpen, Droplets, MapPin } from 'lucide-react';
import { TechCard } from '../UI';
import { PRESET_RIVERS } from '../../utils/gwSwInteractionCalculator';
import { BaseflowPanel } from './panels/BaseflowPanel';
import { ExchangeFluxPanel } from './panels/ExchangeFluxPanel';
import { HyporheicPanel } from './panels/HyporheicPanel';
import { ClassificationPanel } from './panels/ClassificationPanel';
import { ReferencePanel } from './panels/ReferencePanel';

export function GwSwInteractionTab() {
  const [activePanel, setActivePanel] = useState<number>(0);
  const [riverId, setRiverId] = useState<string>(PRESET_RIVERS[0].id);

  const panels = [
    { key: 0, label: '基流分割', icon: Droplets },
    { key: 1, label: '交换通量', icon: ArrowLeftRight },
    { key: 2, label: '河岸带分析', icon: Thermometer },
    { key: 3, label: '交互分类', icon: Waves },
    { key: 4, label: '参考说明', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      {/* 河流选择 */}
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-gw-blue" />
          <h4 className="text-sm font-semibold text-gw-text">选择河流</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_RIVERS.map(r => (
            <button
              key={r.id}
              onClick={() => setRiverId(r.id)}
              className={`p-2 rounded-lg text-left transition-all ${
                riverId === r.id
                  ? 'bg-gw-blue/20 border border-gw-blue/40 text-gw-highlight'
                  : 'bg-gw-surface border border-gw-border text-gw-muted hover:border-gw-blue/20'
              }`}
            >
              <div className="text-xs font-medium">{r.name}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{r.points.length}个断面</div>
            </button>
          ))}
        </div>
      </TechCard>

      {/* 面板切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePanel(p.key)}
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

      {/* 面板内容 */}
      {activePanel === 0 && <BaseflowPanel riverId={riverId} />}
      {activePanel === 1 && <ExchangeFluxPanel riverId={riverId} />}
      {activePanel === 2 && <HyporheicPanel riverId={riverId} />}
      {activePanel === 3 && <ClassificationPanel riverId={riverId} />}
      {activePanel === 4 && <ReferencePanel />}
    </div>
  );
}
