import { Database, ShieldCheck, AlertTriangle, FileCheck } from 'lucide-react';
import { changelog, dataSources, dbMeta } from '../data/changelog';
import { dataSourceRegistry, getSourceStats } from '../data/dataSourceRegistry';
import { getValidationResult } from '../data/dataValidation';
import { SectionTitle } from '../components/UI';
import { DataDashboard } from '../components/DataDashboard';

export function Changelog() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-gw-text">数据库变更日志</h1>
        <p className="text-sm text-gw-muted mt-1">E-数据来源与扩展 | 版本更新记录与数据来源清单</p>
      </div>

      {/* 数据资产仪表盘 */}
      <DataDashboard />

      {/* DB meta */}
      <div className="card-glow bg-gw-card rounded-xl p-5">
        <SectionTitle>数据库概况</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '数据库名称', value: dbMeta.name },
            { label: '当前版本', value: dbMeta.version },
            { label: '最后更新', value: dbMeta.lastUpdate },
            { label: '总Sheet数', value: `${dbMeta.totalSheets}个` },
            { label: '总数据行', value: `${dbMeta.totalRows}行` },
            { label: '文件大小', value: dbMeta.fileSize },
            { label: '已更新Sheet', value: `${dbMeta.updatedSheets.length}个` },
            { label: '静态Sheet', value: `${dbMeta.staticSheets.length}个` },
          ].map((item) => (
            <div key={item.label} className="p-3 bg-gw-surface rounded-lg">
              <p className="text-xs text-gw-muted">{item.label}</p>
              <p className="text-sm font-mono font-semibold text-gw-text mt-1">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="text-xs text-gw-muted mb-2">已更新至2024年数据的Sheet:</p>
          <div className="flex flex-wrap gap-2">
            {dbMeta.updatedSheets.map((s, i) => (
              <span key={i} className="px-2 py-1 rounded text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{s}</span>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs text-gw-muted mb-2">静态数据Sheet(调查年限型，无需年度更新):</p>
          <div className="flex flex-wrap gap-2">
            {dbMeta.staticSheets.map((s, i) => (
              <span key={i} className="px-2 py-1 rounded text-xs bg-gw-surface text-gw-muted border border-gw-border/50">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Version changelog */}
      <div className="card-glow bg-gw-card rounded-xl p-5">
        <SectionTitle>版本更新记录</SectionTitle>
        <div className="space-y-6">
          {changelog.map((ver) => (
            <div key={ver.version}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-mono font-semibold ${ver.version === 'v1.1' ? 'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface text-gw-muted border border-gw-border'}`}>
                  {ver.version}
                </span>
                <span className="text-sm text-gw-muted">{ver.date}</span>
                <span className="text-sm text-gw-text">{ver.scope}</span>
              </div>
              <div className="ml-4 space-y-2">
                {(ver.items || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gw-cyan flex-shrink-0 mt-1.5" />
                    <div>
                      <span className="font-mono text-gw-cyan">{typeof item === 'object' ? item.sheet : ''}</span>
                      <span className="text-gw-muted">: {typeof item === 'object' ? item.update : item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div className="card-glow bg-gw-card rounded-xl p-5">
        <SectionTitle>数据来源清单</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-2 px-3 font-mono w-16">编号</th>
                <th className="text-left text-gw-muted py-2 px-3">来源名称</th>
                <th className="text-left text-gw-muted py-2 px-3">类型</th>
                <th className="text-left text-gw-muted py-2 px-3">覆盖内容</th>
              </tr>
            </thead>
            <tbody>
              {dataSources.map((src) => (
                <tr key={src.id} className="border-b border-gw-border/50 hover:bg-gw-surface/30">
                  <td className="py-2 px-3 font-mono text-gw-cyan">{src.id}</td>
                  <td className="py-2 px-3 text-gw-text">{src.name}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-gw-surface text-gw-muted">{src.type}</span>
                  </td>
                  <td className="py-2 px-3 text-gw-muted">{src.coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
      {/* C3: 数据源注册表 */}
      <div className="card-glow bg-gw-card rounded-xl p-5">
        <SectionTitle>
          <span className="flex items-center gap-2">
            <Database size={16} className="text-gw-cyan" />
            数据源注册表 (C3)
          </span>
        </SectionTitle>
        <p className="text-xs text-gw-muted mb-3">
          平台共 {getSourceStats().total} 个数据模块，按更新频率和可靠度集中管理溯源信息。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {Object.entries(getSourceStats().byUpdateFrequency).map(([k, v]) => (
            <div key={k} className="p-3 bg-gw-surface rounded-lg text-center">
              <p className="text-xs text-gw-muted">{k}</p>
              <p className="text-xl font-mono font-bold text-gw-cyan mt-1">{v}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left py-2 px-2 text-gw-muted">模块</th>
                <th className="text-left py-2 px-2 text-gw-muted">类别</th>
                <th className="text-left py-2 px-2 text-gw-muted">数据来源</th>
                <th className="text-left py-2 px-2 text-gw-muted">年份</th>
                <th className="text-left py-2 px-2 text-gw-muted">更新频率</th>
                <th className="text-center py-2 px-2 text-gw-muted">可靠度</th>
              </tr>
            </thead>
            <tbody>
              {dataSourceRegistry.map((s) => (
                <tr key={s.module} className="border-b border-gw-border/50 hover:bg-gw-surface/30">
                  <td className="py-1.5 px-2 font-mono text-gw-cyan">{s.module}</td>
                  <td className="py-1.5 px-2 text-gw-text">{s.category}</td>
                  <td className="py-1.5 px-2 text-gw-muted">{s.source}</td>
                  <td className="py-1.5 px-2 text-gw-muted font-mono">{s.dataYears}</td>
                  <td className="py-1.5 px-2 text-gw-muted">{s.updateFrequency}</td>
                  <td className="py-1.5 px-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      s.reliability === '高' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                      s.reliability === '中' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                      'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}>{s.reliability}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* C4: 交叉数据校验报告 */}
      <div className="card-glow bg-gw-card rounded-xl p-5">
        <SectionTitle>
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-gw-cyan" />
            交叉数据校验报告 (C4)
          </span>
        </SectionTitle>
        {(() => {
          const result = getValidationResult();
          return (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="p-3 bg-gw-surface rounded-lg text-center">
                  <p className="text-xs text-gw-muted">校验项总数</p>
                  <p className="text-xl font-mono font-bold text-gw-text mt-1">{result.summary.total}</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                  <p className="text-xs text-red-400">错误</p>
                  <p className="text-xl font-mono font-bold text-red-400 mt-1">{result.summary.error}</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                  <p className="text-xs text-amber-400">警告</p>
                  <p className="text-xl font-mono font-bold text-amber-400 mt-1">{result.summary.warning}</p>
                </div>
                <div className="p-3 bg-gw-surface rounded-lg text-center">
                  <p className="text-xs text-gw-muted">提示</p>
                  <p className="text-xl font-mono font-bold text-gw-text mt-1">{result.summary.info}</p>
                </div>
                <div className="p-3 bg-gw-surface rounded-lg text-center">
                  <p className="text-xs text-gw-muted">阻塞项</p>
                  <p className="text-xl font-mono font-bold text-gw-text mt-1">{result.summary.blocking}</p>
                </div>
              </div>
              {result.issues.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <FileCheck size={16} className="text-emerald-400" />
                  <span className="text-sm text-emerald-400">所有校验通过，数据一致性良好</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {result.issues.map((issue, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${
                      issue.level === 'error' ? 'bg-red-500/10 border-red-500/30' :
                      issue.level === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-gw-surface border-gw-border/50'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className={
                          issue.level === 'error' ? 'text-red-400 mt-0.5' :
                          issue.level === 'warning' ? 'text-amber-400 mt-0.5' :
                          'text-gw-muted mt-0.5'
                        } />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            issue.level === 'error' ? 'text-red-400' :
                            issue.level === 'warning' ? 'text-amber-400' :
                            'text-gw-text'
                          }`}>{issue.title}</p>
                          <p className="text-xs text-gw-muted mt-1">{issue.message}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gw-surface text-gw-muted font-mono">
                              {issue.category}
                            </span>
                            {issue.affectedModules.map(m => (
                              <span key={m} className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 font-mono">
                                {m}
                              </span>
                            ))}
                            {issue.blocking && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-mono">
                                阻塞
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Pending updates */}
      <div className="card-glow bg-gw-card rounded-xl p-5">
        <SectionTitle>待更新事项</SectionTitle>
        <div className="space-y-3">
          {[
            { priority: 'P3', item: '水化学/同位素时间序列(G表)', note: '需新监测周期数据，降级为P4处理' },
            { priority: 'P4', item: '矿泉水水质/储量(I表)', note: '无新标准/新水源地数据，暂无更新内容' },
            { priority: '近期', item: '水资源基础调查(2024-2026)', note: '完成后可更新J表咸水/F2表深层均衡/M表环境地质精确数据' },
            { priority: '近期', item: '衡水深层回补试验场', note: '全国规模最大，可提供深层均衡参数' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gw-surface rounded-lg">
              <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap flex-shrink-0 mt-0.5 ${
                item.priority === 'P3' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                item.priority === 'P4' ? 'bg-gw-surface text-gw-muted border border-gw-border' :
                'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30'
              }`}>{item.priority}</span>
              <div>
                <p className="text-sm text-gw-text">{item.item}</p>
                <p className="text-xs text-gw-muted mt-0.5">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
