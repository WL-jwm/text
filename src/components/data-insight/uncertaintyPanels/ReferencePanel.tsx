/**
 * 拆分自 UncertaintyAnalysisTab.tsx
 */
import { Dice5, GitBranch, Filter, RefreshCw } from 'lucide-react';
import { CollapsiblePanel, DataSourceNote } from '../../UI';

export function ReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="Monte Carlo方法" defaultOpen icon={Dice5}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">原理</strong>：对每个不确定参数按其概率分布进行随机采样，将采样值代入模型计算输出。重复大量次数后，输出的统计分布即为模型输出的不确定性。</p>
          <p><strong className="text-gw-text">采样方法</strong>：支持4种分布 — 正态分布(均值±标准差)、均匀分布(最小~最大)、对数正态(乘法效应)、三角分布(最小-众数-最大)。</p>
          <p><strong className="text-gw-text">收敛判断</strong>：通过运行均值和运行标准差的收敛曲线判断样本数是否充足。通常5000-10000次即可收敛。</p>
          <p><strong className="text-gw-text">置信区间</strong>：P2.5-P97.5为95%CI，P5-P95为90%CI。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="Sobol敏感性分析" icon={GitBranch}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">一阶指数Si</strong>：单独由参数Xi引起的方差占总方差的比例。Si高表示该参数独立影响大。</p>
          <p><strong className="text-gw-text">总阶指数STi</strong>：包含参数Xi的所有效应（一阶+交互）。STi &gt; Si的差值即为该参数参与的交互效应。</p>
          <p><strong className="text-gw-text">Saltelli抽样</strong>：生成两个独立采样矩阵A和B，以及k个混合矩阵AB_i。共需N*(2k+2)次模型评估。</p>
          <p><strong className="text-gw-text">解读</strong>：一阶指数总和接近1 → 加性模型；远小于1 → 强交互效应。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="Morris筛选法" icon={Filter}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">基本效应EE</strong>：在一条轨迹上只改变一个参数(Δ)，计算(Δy/Δx)。每条轨迹有k个EE。</p>
          <p><strong className="text-gw-text">μ*（绝对均值）</strong>：衡量参数的整体影响大小。μ*越大，参数越重要。</p>
          <p><strong className="text-gw-text">σ（标准差）</strong>：衡量参数的非线性或交互效应。σ大表示参数效应依赖其他参数取值。</p>
          <p><strong className="text-gw-text">优势</strong>：计算量远小于Sobol(O(k*r))，适合初步筛选大量参数。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="Bootstrap方法" icon={RefreshCw}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">原理</strong>：从原始数据中有放回抽样B次（通常3000-5000次），每次计算统计量。B个统计量值的经验分布即为该统计量的抽样分布。</p>
          <p><strong className="text-gw-text">偏差</strong>：Bootstrap均值与原始估计的差。偏差过大时需使用偏差校正法。</p>
          <p><strong className="text-gw-text">置信区间</strong>：取Bootstrap分布的P2.5和P97.5作为95%CI，无需假设分布形式。</p>
        </div>
      </CollapsiblePanel>

      <DataSourceNote source="Saltelli et al. (2008) Global Sensitivity Analysis: The Primer | Morris (1991) Factorial Sampling Plans | Efron & Tibshirani (1993) An Introduction to the Bootstrap | Sobol (2001) Global sensitivity indices for nonlinear mathematical models" />
    </div>
  );
}
