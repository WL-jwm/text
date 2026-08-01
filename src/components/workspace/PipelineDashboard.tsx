/**
 * PipelineDashboard — 工作台数据流总览面板
 *
 * 可视化展示所有模块间的数据链路状态、数据包列表和传输日志
 */

import React, { useEffect, useState } from 'react';
import { Share2, ArrowRight, Database, Activity, ToggleLeft, ToggleRight, Trash2, Bell } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { usePipelineStore, MODULE_REGISTRY } from '../../store/usePipelineStore';

const MODULE_NAMES: Record<string, string> = Object.fromEntries(
  MODULE_REGISTRY.map(m => [m.id, m.name]),
);


export function PipelineDashboard() {
  const {
    packages, links, notifications, init, toggleLink, removePackage, clearNotifications,
  } = usePipelineStore();

  const [tab, setTab] = useState<'overview' | 'links' | 'packages' | 'log'>('overview');

  useEffect(() => { init(); }, [init]);

  const activeLinks = links.filter(l => l.active);
  const totalLinks = links.length;
  const incomingAvailable = links.filter(l => packages.some(p => p.sourceModule === l.sourceModule && p.dataType === l.dataType));

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            跨模块数据流总览
          </h2>
          <span className="text-xs text-slate-500">D-01</span>
        </div>
        <p className="text-xs text-slate-400">
          10 个模块通过 8 条预定义链路实现数据联动。各模块发布计算结果到数据总线，其他模块可按需接收。
        </p>
      </TechCard>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="已发布数据包" value={packages.length} unit="个" accent="cyan" />
        <StatCard title="激活链路" value={activeLinks.length} unit={`/${totalLinks}`} accent="green" />
        <StatCard title="可用数据流" value={incomingAvailable.length} unit="条" accent="amber" />
        <StatCard title="注册模块" value={MODULE_REGISTRY.length} unit="个" accent="purple" />
      </div>

      {/* Tab 切换 */}
      <div className="flex flex-wrap gap-1.5">
        {([
          { key: 'overview', label: '模块关系图' },
          { key: 'links', label: '数据链路' },
          { key: 'packages', label: '数据包列表' },
          { key: 'log', label: '传输日志' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 模块关系图 */}
      {tab === 'overview' && (
        <TechCard>
          <h4 className="text-xs font-semibold text-slate-300 mb-3">模块数据流关系图</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 text-slate-400">模块</th>
                  <th className="text-left py-2 px-2 text-slate-400">编号</th>
                  <th className="text-left py-2 px-2 text-slate-400">发布数据</th>
                  <th className="text-left py-2 px-2 text-slate-400">接收数据</th>
                  <th className="text-center py-2 px-2 text-slate-400">数据包数</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_REGISTRY.map(m => {
                  const pkgCount = packages.filter(p => p.sourceModule === m.id).length;
                  return (
                    <tr key={m.id} className="border-b border-slate-800">
                      <td className="py-2 px-2 text-slate-200">{m.name}</td>
                      <td className="py-2 px-2 text-cyan-400">{m.code}</td>
                      <td className="py-2 px-2">
                        {m.publishes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {m.publishes.map(p => (
                              <span key={p} className="bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded text-xs">{p}</span>
                            ))}
                          </div>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="py-2 px-2">
                        {m.subscribes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {m.subscribes.map(s => (
                              <span key={s} className="bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded text-xs">{s}</span>
                            ))}
                          </div>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="text-center py-2 px-2">
                        {pkgCount > 0 ? <span className="text-amber-400 font-semibold">{pkgCount}</span> : <span className="text-slate-600">0</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TechCard>
      )}

      {/* 数据链路 */}
      {tab === 'links' && (
        <TechCard>
          <h4 className="text-xs font-semibold text-slate-300 mb-3">数据链路管理（点击开关激活/停用）</h4>
          <div className="space-y-2">
            {links.map(link => {
              const hasData = packages.some(p => p.sourceModule === link.sourceModule && p.dataType === link.dataType);
              return (
                <div key={link.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  link.active ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-slate-800/30 border-slate-700/30'
                }`}>
                  <button onClick={() => toggleLink(link.id)} className="flex-shrink-0">
                    {link.active
                      ? <ToggleRight className="w-6 h-6 text-cyan-400" />
                      : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-200">{MODULE_NAMES[link.sourceModule] || link.sourceModule}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-200">{MODULE_NAMES[link.targetModule] || link.targetModule}</span>
                      {hasData && (
                        <span className="bg-emerald-500/15 text-emerald-300 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Database className="w-3 h-3" /> 有数据
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{link.description}</div>
                    {link.lastTransfer && (
                      <div className="text-xs text-slate-600 mt-0.5">最后传输: {link.lastTransfer}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TechCard>
      )}

      {/* 数据包列表 */}
      {tab === 'packages' && (
        <TechCard>
          <h4 className="text-xs font-semibold text-slate-300 mb-3">已发布数据包</h4>
          {packages.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
              暂无数据包。在各计算模块中点击"推送数据"即可发布。
            </div>
          ) : (
            <div className="space-y-2">
              {packages.map(pkg => (
                <div key={pkg.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <Database className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200">{pkg.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {MODULE_NAMES[pkg.sourceModule] || pkg.sourceModule}
                      {pkg.sourceContext ? ` · ${pkg.sourceContext}` : ''}
                      {' · '}{pkg.dataType}
                      {' · '}{new Date(pkg.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <button
                    onClick={() => removePackage(pkg.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TechCard>
      )}

      {/* 传输日志 */}
      {tab === 'log' && (
        <TechCard>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              传输通知日志
            </h4>
            {notifications.length > 0 && (
              <button onClick={clearNotifications} className="text-xs text-slate-500 hover:text-red-400">
                清空
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              暂无传输记录
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map(n => (
                <div key={n.id} className={`flex items-center gap-2 p-2 rounded text-xs ${
                  n.type === 'success' ? 'bg-emerald-500/5 text-emerald-300' : 'bg-blue-500/5 text-blue-300'
                }`}>
                  <span className="text-slate-500">{new Date(n.timestamp).toLocaleTimeString('zh-CN')}</span>
                  <span>{n.message}</span>
                </div>
              ))}
            </div>
          )}
        </TechCard>
      )}

      <DataSourceNote source="D-01跨模块数据流架构: Pipeline Data Bus + Publish/Subscribe模式" />
    </div>
  );
}
