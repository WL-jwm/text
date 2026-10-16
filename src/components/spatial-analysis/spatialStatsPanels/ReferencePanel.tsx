/**
 * B-29 地下水空间统计分析器 Tab
 *
 * 4大面板：
 *  1. Moran's I — 全局空间自相关+LISA局部热点/冷点
 *  2. 半变异函数 — 实验+理论模型拟合(球状/指数/高斯)
 *  3. 交叉验证 — 克里金插值精度评估(留一法)
 *  4. 参考 — 空间统计方法与判据说明
 * 面板: ReferencePanel（拆分自 SpatialStatsCalculatorTab.tsx）
 */
import { FilterableTechTable } from '../../FilterableTechTable';
import { DataSourceNote, TechCard } from '../../UI';

export function ReferencePanel() {
  return (
    <div className="space-y-4">
      <TechCard title="Moran's I 方法说明" badge="全局空间自相关">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">计算公式</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">I = (n/S₀) × ΣᵢΣⱼ wᵢⱼ(xᵢ-x̄)(xⱼ-x̄) / Σᵢ(xᵢ-x̄)²</div>
            <div className="text-[10px] text-gw-muted mt-1">
              n为样本数，S₀=ΣᵢΣⱼwᵢⱼ为权重矩阵之和，x̄为均值。E[I]=-1/(n-1)为期望值。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">结果判读</div>
            <div className="text-[10px] text-gw-muted mt-1">
              I &gt; E[I] 且 Z &gt; 1.96：空间聚集（高值或低值聚集）<br/>
              I ≈ E[I]：空间随机分布<br/>
              I &lt; E[I] 且 Z &lt; -1.96：空间离散（高低值交替）
            </div>
          </div>
        </div>
      </TechCard>

      <TechCard title="LISA 局部空间自相关" badge="热点/冷点">
        <div className="grid grid-cols-2 gap-2">
          {[
            { q: 'HH', color: '#ef4444', desc: '高值被高值包围，热点区域' },
            { q: 'LL', color: '#06b6d4', desc: '低值被低值包围，冷点区域' },
            { q: 'HL', color: '#f59e0b', desc: '高值被低值包围，空间异常' },
            { q: 'LH', color: '#8b5cf6', desc: '低值被高值包围，空间异常' },
          ].map(g => (
            <div key={g.q} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.q}</div>
              <div className="text-[10px] text-gw-muted mt-1">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="半变异函数模型" badge="3种理论模型">
        <FilterableTechTable
          headers={['模型', '公式', '特点', '适用场景']}
          rows={[
            ['球状模型', 'γ(h)=C₀+C×[1.5(h/a)-0.5(h/a)³]', '变程处达到基台', '最常用，适用于大多数地质数据'],
            ['指数模型', 'γ(h)=C₀+C×[1-exp(-3h/a)]', '渐近逼近基台', '连续变化的空间变量'],
            ['高斯模型', 'γ(h)=C₀+C×[1-exp(-3h²/a²)]', '原点处抛物线', '变化平缓的空间变量'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="块金效应评价" badge="空间自相关强度">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {[
            { range: 'C0/(C0+C)<0.25', level: '强', color: '#10b981', desc: '空间结构明显，适合克里金插值' },
            { range: '0.25~0.50', level: '中等', color: '#06b6d4', desc: '有一定空间结构，插值效果尚可' },
            { range: '0.50~0.75', level: '弱', color: '#f59e0b', desc: '空间结构弱，需增加采样密度' },
            { range: '>0.75', level: '极弱', color: '#ef4444', desc: '随机变异为主，不宜空间插值' },
          ].map(g => (
            <div key={g.level} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.level}</div>
              <div className="text-[10px] font-mono text-gw-text mt-0.5">{g.range}</div>
              <div className="text-[9px] text-gw-muted mt-1 leading-tight">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="交叉验证指标" badge="插值精度">
        <FilterableTechTable
          headers={['指标', '公式', '评价标准', '说明']}
          rows={[
            ['ME(平均误差)', 'Σ(actual-predicted)/n', '接近0为优', '反映系统偏差，越小越好'],
            ['RMSE(均方根误差)', '√[Σ(actual-predicted)²/n]', '越小越好', '对大偏差敏感'],
            ['MAE(平均绝对误差)', 'Σ|actual-predicted|/n', '越小越好', '稳健的误差度量'],
            ['精度等级', 'RMSE/均值', '<10%优, <20%良, <30%合格', '相对误差分级'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <DataSourceNote source="Moran(1950) | Anselin(1995) LISA | Cressie(1993) Statistics for Spatial Data | 河北省地下水监测网" version="B-29" />
    </div>
  );
}
