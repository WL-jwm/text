import React, { useState, useMemo} from 'react';
import { MessageSquare, Plus, Trash2, Tag, Filter } from 'lucide-react';
import { TechCard } from './UI';
import { useAppStore, CustomAnnotation } from '../store/useAppStore';
import { useToast } from './Toast';

type AnnotationCategory = 'note' | 'correction' | 'reference' | 'question';
const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  note: { label: '笔记', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  correction: { label: '勘误', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  reference: { label: '参考', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  question: { label: '疑问', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
};

export function AnnotationsPanel() {
  const { annotations, addAnnotation, updateAnnotation, deleteAnnotation } = useAppStore();
  const { success } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formTarget, setFormTarget] = useState('');
  const [formCategory, setFormCategory] = useState<'note' | 'correction' | 'reference' | 'question'>('note');
  const [formContent, setFormContent] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // 当前页面路径
  const currentPath = window.location.pathname;

  // 按目标分组的标注
  const grouped = useMemo(() => {
    let list = annotations;
    if (filterCategory) {
      list = list.filter(a => a.category === filterCategory);
    }
    const groups = new Map<string, CustomAnnotation[]>();
    list.forEach(a => {
      const key = a.target || '未关联';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    });
    return groups;
  }, [annotations, filterCategory]);

  // 提交标注
  const handleSubmit = async () => {
    if (!formContent.trim()) return;
    if (editId) {
      await updateAnnotation(editId, { content: formContent, category: formCategory });
      success('标注已更新');
    } else {
      await addAnnotation({
        target: formTarget || currentPath,
        category: formCategory,
        content: formContent.trim(),
      });
      success('标注已添加');
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormTarget('');
    setFormCategory('note');
    setFormContent('');
  };

  const startEdit = (a: CustomAnnotation) => {
    setEditId(a.id);
    setFormTarget(a.target);
    setFormCategory(a.category);
    setFormContent(a.content);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* ── 添加/编辑表单 ── */}
      {showForm && (
        <TechCard title={editId ? '编辑标注' : '添加标注'} icon={editId ? Tag : Plus}>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gw-muted block mb-1">关联目标(页面路径)</label>
                <input
                  value={formTarget}
                  onChange={e => setFormTarget(e.target.value)}
                  placeholder={currentPath}
                  className="w-full px-3 py-1.5 bg-gw-surface/50 border border-gw-border/30 rounded-lg text-xs text-gw-text focus:outline-none focus:border-gw-blue/40"
                />
              </div>
              <div>
                <label className="text-xs text-gw-muted block mb-1">类别</label>
                <div className="flex gap-1.5">
                  {(Object.entries(CATEGORY_CONFIG) as [string, typeof CATEGORY_CONFIG[string]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setFormCategory(key as AnnotationCategory)}
                      className={`px-2 py-1 text-[10px] rounded border transition-all ${
                        formCategory === key
                          ? `${cfg.bg} ${cfg.color}`
                          : 'text-gw-muted border-gw-border/20 hover:border-gw-border'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gw-muted block mb-1">内容</label>
              <textarea
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                rows={3}
                placeholder="输入标注内容..."
                className="w-full px-3 py-1.5 bg-gw-surface/50 border border-gw-border/30 rounded-lg text-xs text-gw-text focus:outline-none focus:border-gw-blue/40 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!formContent.trim()}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-1.5 bg-gw-blue/20 text-gw-highlight border border-gw-blue/30 rounded-lg text-xs hover:bg-gw-blue/30 transition-all disabled:opacity-40"
              >
                <Plus size={12} />
                {editId ? '保存修改' : '添加标注'}
              </button>
              <button onClick={resetForm} className="px-3 py-1.5 text-gw-muted border border-gw-border/30 rounded-lg text-xs hover:border-gw-border transition-all">
                取消
              </button>
            </div>
          </div>
        </TechCard>
      )}

      {/* ── 标注列表 ── */}
      <TechCard title="数据标注" icon={MessageSquare} badge={annotations.length > 0 ? `${annotations.length}条` : undefined}>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-1 px-4 py-2 mb-3 bg-gw-blue/10 text-gw-highlight border border-gw-blue/20 rounded-lg text-xs hover:bg-gw-blue/20 transition-all"
          >
            <Plus size={12} />
            添加标注
          </button>
        )}

        {annotations.length === 0 ? (
          <p className="text-xs text-gw-muted text-center py-6">暂无标注，点击上方按钮添加</p>
        ) : (
          <div className="space-y-3">
            {/* 类别筛选 */}
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-gw-muted" />
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setFilterCategory(null)}
                  className={`px-2 py-0.5 text-[10px] rounded border transition-all ${
                    !filterCategory ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30' : 'text-gw-muted border-gw-border/20'
                  }`}
                >
                  全部
                </button>
                {(Object.entries(CATEGORY_CONFIG) as [string, typeof CATEGORY_CONFIG[string]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(key === filterCategory ? null : key)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition-all ${
                      filterCategory === key ? `${cfg.bg} ${cfg.color}` : 'text-gw-muted border-gw-border/20'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 按目标分组显示 */}
            {Array.from(grouped.entries()).map(([target, items]) => (
              <div key={target} className="space-y-1.5">
                <p className="text-[10px] text-gw-muted/60 font-mono truncate">{target}</p>
                {items.map(a => {
                  const cfg = CATEGORY_CONFIG[a.category] || CATEGORY_CONFIG.note;
                  return (
                    <div key={a.id} className={`p-2.5 rounded-lg border ${cfg.bg} group`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[10px] ${cfg.color} font-medium`}>{cfg.label}</span>
                            <span className="text-[10px] text-gw-muted/40">
                              {new Date(a.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                            {a.updatedAt !== a.createdAt && (
                              <span className="text-[10px] text-gw-muted/30">(已编辑)</span>
                            )}
                          </div>
                          <p className="text-xs text-gw-text leading-relaxed whitespace-pre-wrap">{a.content}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => startEdit(a)} className="p-1 text-gw-muted hover:text-gw-blue rounded" title="编辑">
                            <Tag size={11} />
                          </button>
                          <button onClick={() => { deleteAnnotation(a.id); success('标注已删除'); }} className="p-1 text-gw-muted hover:text-red-400 rounded" title="删除">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </TechCard>

      {/* ── 标注统计 ── */}
      {annotations.length > 0 && (
        <TechCard title="标注统计" icon={MessageSquare}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {(Object.entries(CATEGORY_CONFIG) as [string, typeof CATEGORY_CONFIG[string]][]).map(([key, cfg]) => {
              const count = annotations.filter(a => a.category === key).length;
              return (
                <div key={key} className={`p-2 rounded-lg border text-center ${cfg.bg}`}>
                  <p className={`text-lg font-bold ${cfg.color.split(' ')[0]}`}>{count}</p>
                  <p className={`text-[10px] ${cfg.color.split(' ')[0]}/60`}>{cfg.label}</p>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gw-muted/40">
            涉及 {new Set(annotations.map(a => a.target)).size} 个关联目标 | 共 {annotations.length} 条标注
          </p>
        </TechCard>
      )}
    </div>
  );
}
