/**
 * B-26 地下水时间序列分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 自定义序列输入→趋势/统计/突变/预测/自相关
 *  2. 预设序列 — 6个河北典型监测点11年序列对比
 *  3. 方法说明 — Mann-Kendall/Pettitt/Sen斜率等统计方法
 *  4. 评价标准 — 趋势/波动/突变/模型校准标准
 * 面板组件：MethodPanel（拆分自 TimeSeriesCalculatorTab.tsx）
 */

import { TechCard, DataSourceNote } from '../../UI';

// ── 面板3: 方法说明 ──
export function MethodPanel() {
  return (
    <div className="space-y-4">
      <TechCard title="趋势分析方法" badge="3种方法">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">线性回归（最小二乘法）</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">y = ax + b, a = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)</div>
            <div className="text-[10px] text-gw-muted mt-1">计算简单直观，给出斜率(年变化量)和R²(拟合优度)。适用于线性趋势明显的序列。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">Mann-Kendall检验</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">S = Σsign(xj - xi), Z = (S±1)/√Var(S)</div>
            <div className="text-[10px] text-gw-muted mt-1">非参数检验，不要求数据正态分布，对异常值不敏感。Z&gt;1.96或Z&lt;-1.96表示α=0.05下趋势显著。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">Sen斜率估计</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">β = median[(xj - xi) / (j - i)], ∀i &lt; j</div>
            <div className="text-[10px] text-gw-muted mt-1">非参数斜率估计，计算所有配对斜率的中位数。对异常值稳健，与Mann-Kendall检验配合使用。</div>
          </div>
        </div>
      </TechCard>

      <TechCard title="突变检测方法" badge="Pettitt检验">
        <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
          <div className="text-xs font-semibold text-gw-highlight">Pettitt检验</div>
          <div className="text-sm font-mono text-gw-cyan mt-1">Uk = ΣΣsign(xi - xj), p ≈ 2·exp(-6·U²/(n³+n²))</div>
          <div className="text-[10px] text-gw-muted mt-1">
            非参数突变检测方法，遍历所有可能的分割点，找到统计量|U|最大的位置作为潜在突变点。
            p&lt;0.05时认为突变显著。适用于检测序列中均值发生的阶跃变化。
          </div>
        </div>
      </TechCard>

      <TechCard title="预测模型" badge="2种模型">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">线性回归模型</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">y = a·x + b</div>
            <div className="text-[10px] text-gw-muted mt-1">最简单的预测模型，适用于线性趋势序列。置信区间基于残差标准差±1.96σ。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">指数回归模型</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">y = a·e^(b·x), 即 ln(y) = b·x + ln(a)</div>
            <div className="text-[10px] text-gw-muted mt-1">适用于指数增长/衰减序列（如衰减率、浓度变化）。对ln(y)做线性回归后反变换。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-[10px] text-gw-muted">模型选择：自动比较线性与指数模型的R²，选取拟合优度更高者。95%置信区间基于残差分布计算。</div>
          </div>
        </div>
      </TechCard>

      <TechCard title="自相关分析" badge="ACF">
        <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
          <div className="text-xs font-semibold text-gw-highlight">自相关函数 ACF</div>
          <div className="text-sm font-mono text-gw-cyan mt-1">ρk = Σ(xt-μ)(xt+k-μ) / Σ(xt-μ)²</div>
          <div className="text-[10px] text-gw-muted mt-1">
            衡量序列自身在不同滞后阶数上的相关性。95%置信界≈±1.96/√n。
            若ACF超出置信界，表明序列存在自相关（即当前值受历史值影响），预测时可利用此信息。
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="Mann-Kendall(1945) | Pettitt(1979) | Sen(1968) | 河北省地下水监测年报(2014-2024)" version="B-26" />
    </div>
  );
}
