/**
 * G-01a 数据源管理面板
 *
 * 提供通道级数据源配置 UI：
 *   - Mock/HTTP/WS 类型切换
 *   - HTTP 端点配置（URL/方法/超时/重试）
 *   - 通道启用/禁用
 *   - 连接测试
 *   - 连接日志查看
 *   - 通道错误展示
 */
import type { ChannelSourceConfig } from '../../config/realtimeConfig';
import { useI18n } from '../../hooks/useI18n';
import { type DataChannel, realtimeService } from '../../services/realtimeDataService';
import type { DataSourceType, LogEntry } from '../../services/realtimeDataSource';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ConnectionLogPanel } from './dataSourcePanels/ConnectionLogPanel';
import { CHANNELS, CHANNEL_LABELS, SOURCE_TYPE_LABELS } from './dataSourcePanels/dataSourceConstants';

export function DataSourcePanel(): React.ReactElement {
  const { t } = useI18n();
  const [configs, setConfigs] = useState<Record<DataChannel, ChannelSourceConfig>>(
    realtimeService.getAllSourceConfigs(),
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testingChannel, setTestingChannel] = useState<DataChannel | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [expandedChannel, setExpandedChannel] = useState<DataChannel | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [autoScroll, setAutoScroll] = useState(true);
  const [logFilter, setLogFilter] = useState<DataChannel | 'all'>('all');
  const logEndRef = useRef<HTMLDivElement>(null);

  // 订阅日志
  useEffect(() => {
    const unsub = realtimeService.onLogs(newLogs => setLogs([...newLogs]));
    return unsub;
  }, []);

  // 订阅通道错误
  useEffect(() => {
    const unsub = realtimeService.onChannelError((channel, error) => {
      setErrors(prev => ({ ...prev, [channel]: error }));
    });
    return unsub;
  }, []);

  // 自动滚动日志
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleTypeChange = useCallback((channel: DataChannel, type: DataSourceType) => {
    realtimeService.setDataSourceType(channel, type);
    setConfigs(realtimeService.getAllSourceConfigs());
  }, []);

  const handleToggleEnabled = useCallback((channel: DataChannel, enabled: boolean) => {
    realtimeService.setChannelEnabled(channel, enabled);
    setConfigs(realtimeService.getAllSourceConfigs());
  }, []);

  const handleHttpConfigUpdate = useCallback((
    channel: DataChannel,
    field: string,
    value: string | number,
  ) => {
    const config = configs[channel];
    if (!config.httpConfig) return;
    const updated = {
      ...config,
      httpConfig: { ...config.httpConfig, [field]: value },
    };
    realtimeService.updateSourceConfig(channel, updated);
    setConfigs(realtimeService.getAllSourceConfigs());
  }, [configs]);

  const handleResponseMappingUpdate = useCallback((
    channel: DataChannel,
    field: string,
    value: string | boolean,
  ) => {
    const config = configs[channel];
    if (!config.httpConfig) return;
    const updated = {
      ...config,
      httpConfig: {
        ...config.httpConfig,
        responseMapping: { ...config.httpConfig.responseMapping, [field]: value },
      },
    };
    realtimeService.updateSourceConfig(channel, updated);
    setConfigs(realtimeService.getAllSourceConfigs());
  }, [configs]);

  const handleTest = useCallback(async (channel: DataChannel) => {
    setTestingChannel(channel);
    const ok = await realtimeService.testConnection(channel);
    setTestResults(prev => ({ ...prev, [channel]: ok }));
    setTestingChannel(null);
  }, []);

  const handleClearLogs = useCallback(() => {
    realtimeService.clearLogs();
  }, []);

  const filteredLogs = logFilter === 'all' ? logs : logs.filter(l => l.channel === logFilter);

  return (
    <div className="space-y-4">
      {/* 通道配置列表 */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200">
            {t('settings.dataSources') || '数据源配置'}
          </h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          {CHANNELS.map(channel => {
            const config = configs[channel];
            const isExpanded = expandedChannel === channel;
            const error = errors[channel];
            const testResult = testResults[channel];

            return (
              <div key={channel} className="px-4 py-3">
                {/* 通道行 */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* 启用开关 */}
                  <button
                    onClick={() => handleToggleEnabled(channel, !config.enabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      config.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                    aria-label={`toggle-${channel}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        config.enabled ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>

                  {/* 通道名称 */}
                  <span className="text-sm font-medium text-slate-200 min-w-[80px]">
                    {CHANNEL_LABELS[channel]}
                  </span>

                  {/* 数据源类型选择 */}
                  <select
                    value={config.type}
                    onChange={e => handleTypeChange(channel, e.target.value as DataSourceType)}
                    className="text-xs bg-slate-700 text-slate-200 rounded px-2 py-1 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    {(Object.keys(SOURCE_TYPE_LABELS) as DataSourceType[]).map(type => (
                      <option key={type} value={type}>
                        {SOURCE_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>

                  {/* 错误指示 */}
                  {error && (
                    <span className="text-xs text-red-400" title={error}>
                      ⚠ {error.length > 30 ? error.slice(0, 30) + '...' : error}
                    </span>
                  )}

                  {/* 测试连接 */}
                  <button
                    onClick={() => handleTest(channel)}
                    disabled={testingChannel === channel || !config.enabled}
                    className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                  >
                    {testingChannel === channel ? '测试中...' : '测试连接'}
                  </button>
                  {testResult !== undefined && (
                    <span className={`text-xs ${testResult ? 'text-emerald-400' : 'text-red-400'}`}>
                      {testResult ? '✓ 成功' : '✗ 失败'}
                    </span>
                  )}

                  {/* 展开按钮 */}
                  <button
                    onClick={() => setExpandedChannel(isExpanded ? null : channel)}
                    className="text-xs text-slate-400 hover:text-slate-200 ml-auto"
                  >
                    {isExpanded ? '▼' : '▶'} 详细配置
                  </button>
                </div>

                {/* HTTP 详细配置 */}
                {isExpanded && config.type === 'http' && config.httpConfig && (
                  <div className="mt-3 space-y-2 pl-8 border-l-2 border-slate-700">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-slate-400">
                        API 端点
                        <input
                          type="text"
                          value={config.httpConfig.endpoint}
                          onChange={e => handleHttpConfigUpdate(channel, 'endpoint', e.target.value)}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        />
                      </label>
                      <label className="text-xs text-slate-400">
                        请求方法
                        <select
                          value={config.httpConfig.method ?? 'GET'}
                          onChange={e => handleHttpConfigUpdate(channel, 'method', e.target.value)}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="text-xs text-slate-400">
                        超时(ms)
                        <input
                          type="number"
                          value={config.httpConfig.timeoutMs ?? 10000}
                          onChange={e => handleHttpConfigUpdate(channel, 'timeoutMs', parseInt(e.target.value) || 10000)}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        />
                      </label>
                      <label className="text-xs text-slate-400">
                        重试次数
                        <input
                          type="number"
                          value={config.httpConfig.maxRetries ?? 3}
                          onChange={e => handleHttpConfigUpdate(channel, 'maxRetries', parseInt(e.target.value) || 3)}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        />
                      </label>
                      <label className="text-xs text-slate-400">
                        重试间隔(ms)
                        <input
                          type="number"
                          value={config.httpConfig.retryDelayMs ?? 2000}
                          onChange={e => handleHttpConfigUpdate(channel, 'retryDelayMs', parseInt(e.target.value) || 2000)}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-slate-400">
                        Auth Token
                        <input
                          type="password"
                          value={config.httpConfig.authToken ?? ''}
                          onChange={e => handleHttpConfigUpdate(channel, 'authToken', e.target.value)}
                          placeholder="Bearer token (可选)"
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        />
                      </label>
                      <label className="text-xs text-slate-400">
                        数据路径
                        <input
                          type="text"
                          value={config.httpConfig.responseMapping.dataPath ?? ''}
                          onChange={e => handleResponseMappingUpdate(channel, 'dataPath', e.target.value)}
                          placeholder="如 data.stations"
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="text-xs text-slate-400">
                        站点ID字段
                        <input
                          type="text"
                          value={config.httpConfig.responseMapping.stationIdPath}
                          onChange={e => handleResponseMappingUpdate(channel, 'stationIdPath', e.target.value)}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        />
                      </label>
                      <label className="text-xs text-slate-400">
                        数值字段
                        <input
                          type="text"
                          value={config.httpConfig.responseMapping.valuePath}
                          onChange={e => handleResponseMappingUpdate(channel, 'valuePath', e.target.value)}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        />
                      </label>
                      <label className="text-xs text-slate-400">
                        时间戳字段
                        <input
                          type="text"
                          value={config.httpConfig.responseMapping.timestampPath ?? ''}
                          onChange={e => handleResponseMappingUpdate(channel, 'timestampPath', e.target.value)}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Mock 提示 */}
                {isExpanded && config.type === 'mock' && (
                  <div className="mt-2 pl-8 text-xs text-slate-500 border-l-2 border-slate-700">
                    Mock 数据源使用本地模拟数据，无需额外配置。6个监测站 × 高斯噪声生成。
                  </div>
                )}

                {/* WS 配置 */}
                {isExpanded && config.type === 'ws' && config.wsConfig && (
                  <div className="mt-3 space-y-2 pl-8 border-l-2 border-slate-700">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-slate-400">
                        WebSocket URL
                        <input type="text" value={config.wsConfig.url}
                          onChange={e => { const updated = { ...config, wsConfig: { ...config.wsConfig!, url: e.target.value } }; realtimeService.updateSourceConfig(channel, updated); setConfigs(realtimeService.getAllSourceConfigs()); }}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700" />
                      </label>
                      <label className="text-xs text-slate-400">
                        心跳间隔(ms)
                        <input type="number" value={config.wsConfig.heartbeatMs ?? 30000}
                          onChange={e => { const updated = { ...config, wsConfig: { ...config.wsConfig!, heartbeatMs: parseInt(e.target.value) || 30000 } }; realtimeService.updateSourceConfig(channel, updated); setConfigs(realtimeService.getAllSourceConfigs()); }}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700" />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-slate-400">
                        重连间隔(ms)
                        <input type="number" value={config.wsConfig.reconnectDelayMs ?? 3000}
                          onChange={e => { const updated = { ...config, wsConfig: { ...config.wsConfig!, reconnectDelayMs: parseInt(e.target.value) || 3000 } }; realtimeService.updateSourceConfig(channel, updated); setConfigs(realtimeService.getAllSourceConfigs()); }}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700" />
                      </label>
                      <label className="text-xs text-slate-400">
                        最大重连次数
                        <input type="number" value={config.wsConfig.maxReconnects ?? 5}
                          onChange={e => { const updated = { ...config, wsConfig: { ...config.wsConfig!, maxReconnects: parseInt(e.target.value) || 5 } }; realtimeService.updateSourceConfig(channel, updated); setConfigs(realtimeService.getAllSourceConfigs()); }}
                          className="block w-full mt-1 text-xs bg-slate-900 text-slate-200 rounded px-2 py-1 border border-slate-700" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 连接日志 */}
      <ConnectionLogPanel filteredLogs={filteredLogs} logFilter={logFilter} onFilterChange={f => setLogFilter(f)} autoScroll={autoScroll} onAutoScrollChange={setAutoScroll} onClear={handleClearLogs} logEndRef={logEndRef} />
    </div>
  );
}
