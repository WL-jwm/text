import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, MapPin, FolderOpen, ChevronRight } from 'lucide-react';
import { TechCard } from './UI';
import { useAppStore, DataBookmark } from '../store/useAppStore';
import { useToast } from './Toast';

export function BookmarksPanel() {
  const { bookmarks, addBookmark, deleteBookmark } = useAppStore();
  const { success } = useToast();
  const navigate = useNavigate();

  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentQuery, ] = useState('');
  const [groupName, setGroupName] = useState('');
  const [filterGroup, setFilterGroup] = useState<string | null>(null);

  // 监听路由变化
  useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname);
    updatePath();
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  // 获取所有分组
  const groups = useMemo(() => {
    const g = new Map<string, number>();
    bookmarks.forEach(b => {
      const key = b.group || '未分组';
      g.set(key, (g.get(key) || 0) + 1);
    });
    return Array.from(g.entries()).sort((a, b) => b[1] - a[1]);
  }, [bookmarks]);

  // 筛选后的书签
  const filtered = useMemo(() => {
    let list = bookmarks;
    if (filterGroup) {
      list = list.filter(b => (b.group || '未分组') === filterGroup);
    }
    // 按分组排序
    return list.sort((a, b) => {
      const ga = (a.group || '未分组').localeCompare(b.group || '未分组');
      if (ga !== 0) return ga;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [bookmarks, filterGroup]);

  // 添加当前页面书签
  const handleAdd = async () => {
    if (!currentPath) return;
    const pageNames: Record<string, string> = {
      '/': '总览',
      '/resources': '水资源量',
      '/water-quality': '水质评价',
      '/environment': '环境地质',
      '/exploitation': '开采管理',
      '/hydrochemistry': '水化学/咸水',
      '/geology': '基础地质',
      '/hydro-zone-params': '水文地质参数',
      '/water-source': '水源地',
      '/geothermal': '地热资源',
      '/mineral-water': '矿泉水',
      '/saline-soil': '盐碱土',
      '/mine-hydrogeology': '矿床水文地质',
      '/karst-water': '岩溶水',
      '/fracture-water': '裂隙水',
      '/map': '空间地图',
      '/data-insight': '数据洞察',
      '/system-zoning': '系统区划',
      '/changelog': '变更日志',
      '/workspace': '个人工作台',
    };
    await addBookmark({
      title: pageNames[currentPath] || currentPath,
      path: currentPath,
      query: currentQuery || undefined,
      group: groupName || undefined,
    });
    success('已收藏当前页面');
    setGroupName('');
  };

  // 跳转到书签
  const handleNavigate = (bookmark: DataBookmark) => {
    navigate(bookmark.path);
  };

  return (
    <div className="space-y-4">
      {/* ── 快速收藏 ── */}
      <TechCard title="快速收藏" icon={Bookmark}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <MapPin size={14} className="text-gw-cyan flex-shrink-0" />
            <span className="text-xs text-gw-text flex-1 truncate">{currentPath}</span>
            {currentQuery && <span className="text-xs text-gw-muted">{currentQuery}</span>}
          </div>
          <div className="flex gap-2">
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="分组名(可选)"
              className="flex-1 px-3 py-1.5 bg-gw-surface/50 border border-gw-border/30 rounded-lg text-xs text-gw-text focus:outline-none focus:border-gw-blue/40"
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-4 py-1.5 bg-gw-blue/20 text-gw-highlight border border-gw-blue/30 rounded-lg text-xs hover:bg-gw-blue/30 transition-all"
            >
              <Bookmark size={12} />
              收藏
            </button>
          </div>
        </div>
      </TechCard>

      {/* ── 收藏列表 ── */}
      <TechCard title="我的收藏" icon={FolderOpen} badge={bookmarks.length > 0 ? `${bookmarks.length}条` : undefined}>
        {bookmarks.length === 0 ? (
          <p className="text-xs text-gw-muted text-center py-6">暂无收藏，点击上方按钮收藏当前页面</p>
        ) : (
          <div className="space-y-3">
            {/* 分组筛选 */}
            {groups.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterGroup(null)}
                  className={`px-2 py-0.5 text-[10px] rounded border transition-all ${
                    filterGroup === null
                      ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30'
                      : 'text-gw-muted border-gw-border/20 hover:border-gw-border'
                  }`}
                >
                  全部
                </button>
                {groups.map(([name, count]) => (
                  <button
                    key={name}
                    onClick={() => setFilterGroup(name === filterGroup ? null : name)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition-all ${
                      filterGroup === name
                        ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30'
                        : 'text-gw-muted border-gw-border/20 hover:border-gw-border'
                    }`}
                  >
                    {name} ({count})
                  </button>
                ))}
              </div>
            )}

            {/* 书签列表 */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin">
              {filtered.map(bm => (
                <div
                  key={bm.id}
                  className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg border border-gw-border/20 group hover:border-gw-blue/20 transition-all cursor-pointer"
                  onClick={() => handleNavigate(bm)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <ChevronRight size={12} className="text-gw-muted/40 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gw-text font-medium truncate">{bm.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gw-muted">{bm.path}</span>
                        {bm.group && (
                          <span className="text-[10px] text-gw-muted/50">[{bm.group}]</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[9px] text-gw-muted/40">
                      {new Date(bm.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteBookmark(bm.id); success('已删除收藏'); }}
                      className="p-1 text-gw-muted/30 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </TechCard>

      {/* ── 数据集快捷收藏 ── */}
      <BookmarkDatasetsSection />
    </div>
  );
}

/* ── 数据集快捷收藏子组件 ── */
function BookmarkDatasetsSection() {
  const { datasets, bookmarks, addBookmark } = useAppStore();
  const { success } = useToast();

  if (datasets.length === 0) return null;

  return (
    <TechCard title="收藏数据集" icon={FolderOpen} badge={`${datasets.length}个可收藏`}>
      <p className="text-xs text-gw-muted mb-3">收藏已导入的数据集，方便快速查找</p>
      <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
        {datasets.map(ds => {
          const alreadyBookmarked = bookmarks.some(b => b.path === '/workspace' && b.query === ds.id);
          return (
            <div key={ds.id} className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg border border-gw-border/20">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gw-text font-medium truncate">{ds.name}</p>
                <p className="text-[10px] text-gw-muted">{ds.totalRows}行 | {ds.source.toUpperCase()}</p>
              </div>
              <button
                onClick={async () => {
                  if (alreadyBookmarked) {
                    success('已收藏过该数据集');
                    return;
                  }
                  await addBookmark({
                    title: `数据集: ${ds.name}`,
                    path: '/workspace',
                    query: ds.id,
                    group: '数据集',
                  });
                  success(`已收藏: ${ds.name}`);
                }}
                className={`p-1.5 rounded transition-all flex-shrink-0 ${
                  alreadyBookmarked
                    ? 'text-gw-blue/40 cursor-default'
                    : 'text-gw-muted/40 hover:text-gw-blue'
                }`}
                title={alreadyBookmarked ? '已收藏' : '收藏'}
              >
                <Bookmark size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </TechCard>
  );
}
