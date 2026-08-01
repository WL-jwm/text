/**
 * PipelinePanel — 嵌入各模块的数据流面板
 *
 * 功能:
 * - 显示入站数据链路（其他模块推送给本模块的数据）
 * - 显示出站数据链路（本模块可推送给其他模块的数据）
 * - 一键推送/接收数据
 */

import React, { useState } from 'react';
import { Share2, ArrowRight, Inbox, Upload, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePipelineStore, MODULE_REGISTRY, type ModuleId } from '../store/usePipelineStore';
import { TechCard } from './UI';

const MODULE_NAMES: Record<string, string> = Object.fromEntries(
  MODULE_REGISTRY.map(m => [m.id, m.name]),
);

interface PipelinePanelProps {
  moduleId: ModuleId;
  /** 发布数据的回调 */
  onPublish?: () => void;
  /** 接收数据后的回调 */
  onReceive?: (dataType: string, payload: Record<string, unknown>) => void;
}

export function PipelinePanel({ moduleId, onPublish, onReceive }: PipelinePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const links = usePipelineStore(s => s.links);
  const packages = usePipelineStore(s => s.packages);

  const incomingLinks = links.filter(l => l.targetModule === moduleId);
  const outgoingLinks = links.filter(l => l.sourceModule === moduleId);

  // 可用入站数据：有对应数据包的链路
  const availableIncoming = incomingLinks.filter(link =>
    packages.some(p => p.sourceModule === link.sourceModule && p.dataType === link.dataType),
  );

  // 可用出站：链路目标对应的模块
  const hasOutgoing = outgoingLinks.length > 0;

  if (incomingLinks.length === 0 && outgoingLinks.length === 0) return null;

  return (
    <TechCard>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">跨模块数据流</span>
          {availableIncoming.length > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-1.5 py-0.5 rounded-full">
              {availableIncoming.length} 条数据待接收
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">{expanded ? '收起' : '展开'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* 入站链路 */}
          {incomingLinks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                <Inbox className="w-3.5 h-3.5" />
                <span>入站数据</span>
              </div>
              <div className="space-y-1.5">
                {incomingLinks.map(link => {
                  const pkg = packages.find(
                    p => p.sourceModule === link.sourceModule && p.dataType === link.dataType,
                  );
                  const hasData = !!pkg;
                  return (
                    <div
                      key={link.id}
                      className={`flex items-center gap-2 p-2 rounded text-xs ${
                        hasData ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-slate-800/30 border border-slate-700/30'
                      }`}
                    >
                      <span className="text-slate-300 min-w-[80px]">
                        {MODULE_NAMES[link.sourceModule] || link.sourceModule}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-400 flex-1 truncate" title={link.description}>
                        {link.description}
                      </span>
                      {hasData ? (
                        <button
                          onClick={() => onReceive?.(link.dataType, pkg.payload)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 transition-colors text-xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          接收
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          无数据
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 出站链路 */}
          {hasOutgoing && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                <Upload className="w-3.5 h-3.5" />
                <span>出站数据</span>
              </div>
              <div className="space-y-1.5">
                {outgoingLinks.map(link => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 p-2 rounded text-xs bg-slate-800/30 border border-slate-700/30"
                  >
                    <span className="text-slate-400 flex-1 truncate" title={link.description}>
                      → {MODULE_NAMES[link.targetModule] || link.targetModule}
                    </span>
                    <span className="text-slate-500 text-xs">{link.description}</span>
                  </div>
                ))}
                {onPublish && (
                  <button
                    onClick={onPublish}
                    className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30 transition-colors text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    推送数据到数据总线
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </TechCard>
  );
}
