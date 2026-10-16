/**
 * 面板: CulturalPanel（拆分自 EcosystemServiceTab.tsx）
 */
import { TechCard, CollapsiblePanel } from '../../UI';
import { YAxis, Cell, CartesianGrid, XAxis, BarChart, ResponsiveContainer, Tooltip, Bar } from 'recharts';
import { type EcosystemServiceResult, TOOLTIP_STYLE } from './ecoConstants';
import { StatBox } from './StatBox';

export function CulturalPanel({ cultural, supporting }: { cultural: EcosystemServiceResult['cultural']; supporting: EcosystemServiceResult['supporting'] }) {
  const data = [
    { name: '休闲旅游', value: cultural.recreation.value },
    { name: '教育科研', value: cultural.education.value },
    { name: '地质遗迹/泉群', value: cultural.geological.value },
    { name: '生境维持', value: supporting.habitat.value },
    { name: '生物多样性', value: supporting.biodiversity.value },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="文化服务总价值" value={cultural.totalValue.toLocaleString()} unit="万元/年" color="#f59e0b" />
        <StatBox label="休闲旅游" value={cultural.recreation.value.toLocaleString()} unit="万元" color="#f59e0b" />
        <StatBox label="教育科研" value={cultural.education.value.toLocaleString()} unit="万元" color="#06b6d4" />
        <StatBox label="地质遗迹" value={cultural.geological.value.toLocaleString()} unit="万元" color="#8b5cf6" />
        <StatBox label="支持服务总价值" value={supporting.totalValue.toLocaleString()} unit="万元/年" color="#8b5cf6" />
        <StatBox label="生境维持" value={supporting.habitat.value.toLocaleString()} unit="万元" color="#10b981" />
        <StatBox label="生物多样性" value={supporting.biodiversity.value.toLocaleString()} unit="万元" color="#ef4444" />
        <StatBox label="濒危物种" value={supporting.biodiversity.species} unit="种" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">文化与支持服务价值</h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => `${v.toLocaleString()} 万元`} />
            <Bar dataKey="value" name="价值" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => <Cell key={i} fill={['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#ef4444'][i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechCard>
      
      <CollapsiblePanel title="文化与支持服务评估方法" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p><strong className="text-slate-300">休闲旅游</strong>: 旅行费用法(TCM)，游客量乘以平均消费。</p>
          <p><strong className="text-slate-300">教育科研</strong>: 科研经费直接计算，反映地下水科研的学术价值。</p>
          <p><strong className="text-slate-300">地质遗迹/泉群</strong>: 存在价值评估法，每个遗迹50万元/年，每个泉群100万元/年。</p>
          <p><strong className="text-slate-300">生境维持</strong>: 湿地面积乘以单位面积生物多样性价值。</p>
          <p><strong className="text-slate-300">生物多样性</strong>: 濒危物种保护价值，每种500万元/年。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}
