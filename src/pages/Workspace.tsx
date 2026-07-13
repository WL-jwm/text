import { useTabTransition } from '../hooks/useTabTransition';
import React, { useState, useEffect } from 'react';
import { Database, Upload, BookMarked, Shield, Layers, Activity } from 'lucide-react';
import { SectionTitle, StatCard } from '../components/UI';
const DataImportPanel = React.lazy(() => import('../components/DataImportPanel').then(m => ({ default: m.DataImportPanel })));
const AnnotationsPanel = React.lazy(() => import('../components/AnnotationsPanel').then(m => ({ default: m.AnnotationsPanel })));
const BookmarksPanel = React.lazy(() => import('../components/BookmarksPanel').then(m => ({ default: m.BookmarksPanel })));
const DataValidationPanel = React.lazy(() => import('../components/DataValidationPanel').then(m => ({ default: m.DataValidationPanel })));
const DataQualityDashboard = React.lazy(() => import('../components/DataQualityDashboard').then(m => ({ default: m.DataQualityDashboard })));
import { useAppStore } from '../store/useAppStore';

type TabKey = 'import' | 'annotations' | 'bookmarks' | 'validation' | 'quality';

const tabs: { key: TabKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'import', label: '数据导入', icon: Upload, desc: 'CSV/JSON文件导入、解析、预览' },
  { key: 'annotations', label: '数据标注', icon: BookMarked, desc: '自定义注释、修正、参考资料' },
  { key: 'bookmarks', label: '我的收藏', icon: Database, desc: '页面收藏、搜索快照、分组管理' },
  { key: 'validation', label: '数据校验', icon: Shield, desc: '字段校验、类型检查、范围验证' },
  { key: 'quality', label: '质量仪表盘', icon: Activity, desc: '全平台数据完整性扫描与跨模块一致性校验' },
];

export function Workspace() {
  const [activeTab, setActiveTab] = useTabTransition<TabKey>('import');
  const { datasets, annotations, bookmarks } = useAppStore();

  // 检查 IndexedDB 是否已初始化（有数据或已初始化）
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // 等待 store init 完成
    const check = () => {
      const state = useAppStore.getState();
      if (state.initialized) {
        setDbReady(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }, []);

  const totalItems = datasets.length + annotations.length + bookmarks.length;

  return (
    <div className="space-y-4">
      <SectionTitle icon={Layers}>个人工作台</SectionTitle>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="已导入数据集"
          value={datasets.length}
          unit="个"
          icon={Upload}
          accent="blue"
        />
        <StatCard
          title="数据标注"
          value={annotations.length}
          unit="条"
          icon={BookMarked}
          accent="cyan"
        />
        <StatCard
          title="收藏记录"
          value={bookmarks.length}
          unit="条"
          icon={Database}
          accent="purple"
        />
        <StatCard
          title="存储状态"
          value={dbReady ? '就绪' : '加载中'}
          icon={Shield}
          accent="green"
        />
      </div>

      {!dbReady && (
        <div className="flex items-center gap-3 p-4 bg-gw-surface/50 rounded-xl border border-gw-border/30">
          <div className="w-5 h-5 border-2 border-gw-blue/40 border-t-gw-blue rounded-full animate-spin" />
          <p className="text-xs text-gw-muted">正在初始化本地数据库...</p>
        </div>
      )}

      {/* Tab 切换 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {tabs.map(tab => {
          const count = tab.key === 'import' ? datasets.length
            : tab.key === 'annotations' ? annotations.length
            : tab.key === 'bookmarks' ? bookmarks.length
            : 0;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all border ${
                activeTab === tab.key
                  ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30 shadow-[0_0_8px_rgba(59,130,246,0.1)]'
                  : 'text-gw-muted border-gw-border/20 hover:border-gw-border hover:text-gw-text'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                  activeTab === tab.key ? 'bg-gw-blue/20' : 'bg-gw-surface'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 内容 */}
      <div>
        {activeTab === 'import' && <DataImportPanel />}
        {activeTab === 'annotations' && <AnnotationsPanel />}
        {activeTab === 'bookmarks' && <BookmarksPanel />}
        {activeTab === 'validation' && <DataValidationPanel />}
        {activeTab === 'quality' && <DataQualityDashboard />}
      </div>

      {/* 存储说明 */}
      {dbReady && totalItems > 0 && (
        <div className="p-3 bg-gw-surface/30 rounded-lg border border-gw-border/20">
          <p className="text-[10px] text-gw-muted/50">
            数据存储于浏览器本地 IndexedDB (hebei-groundwater-db)，清除浏览器缓存将丢失自定义数据。
            当前存储: {datasets.length}个数据集 / {annotations.length}条标注 / {bookmarks.length}条收藏
          </p>
        </div>
      )}
    </div>
  );
}
