/**
 * B-25 地下水数值模拟参数估算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 水力参数转换+网格估算+稳定性判断+时间步长
 *  2. 模型校准 — 观测/模拟数据对比+NSE/RMSE/R²等指标
 *  3. 预设分区 — 6个河北典型数值模拟区参数对比
 *  4. 参考方法 — 数值方法+稳定性准则+校准标准
 * 面板组件：ReferencePanel（拆分自 NumericalModelCalculatorTab.tsx）
 */

import { TechCard, DataSourceNote } from '../../UI';
import { FilterableTechTable } from '../../FilterableTechTable';

// ── 面板4: 参考方法 ──
export function ReferencePanel() {
  return (
    <div className="space-y-4">
      <TechCard title="数值方法对比" badge="3种格式">
        <FilterableTechTable
          headers={['方法', '稳定性', '精度', '计算量', '适用场景', '时间步长限制']}
          rows={[
            ['显式差分(FTCS)', '条件稳定(Cr≤1)', '一阶O(Δt)', '最小', '简单问题/教学', 'Δt≤Δx²/(4D)'],
            ['隐式差分(BTCS)', '无条件稳定', '一阶O(Δt)', '中等', '生产项目', '无限制'],
            ['Crank-Nicolson', '无条件稳定', '二阶O(Δt²)', '较大', '高精度要求', '无限制'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="数值稳定性准则" badge="关键判据">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">Courant数准则</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">Cr = v × Δt / Δx ≤ 1</div>
            <div className="text-[10px] text-gw-muted mt-1">显式格式必须满足，否则数值不稳定。v为实际渗流速度，Δt为时间步长，Δx为网格尺寸。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">网格Peclet数准则</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">Pe = Δx / αL ≤ 2</div>
            <div className="text-[10px] text-gw-muted mt-1">溶质运移模拟中避免数值振荡的关键条件。αL为纵向弥散度，Δx为网格尺寸。Pe&gt;2时产生数值弥散和振荡。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">Neumann稳定性（扩散方程）</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">D × Δt / Δx² ≤ 1/4 (二维)</div>
            <div className="text-[10px] text-gw-muted mt-1">显式格式求解地下水流的稳定条件。D=T/S为水力扩散系数。</div>
          </div>
        </div>
      </TechCard>

      <TechCard title="模型校准评价标准" badge="NSE分级">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            { grade: '优秀', range: 'NSE≥0.90', color: '#10b981', desc: '模型可信度高，可直接用于预测' },
            { grade: '良好', range: '0.80≤NSE<0.90', color: '#06b6d4', desc: '模型较可靠，可用于情景预测' },
            { grade: '合格', range: '0.65≤NSE<0.80', color: '#f59e0b', desc: '基本可用，需注意不确定性' },
            { grade: '勉强', range: '0.50≤NSE<0.65', color: '#f97316', desc: '精度偏低，需进一步校准' },
            { grade: '不合格', range: 'NSE<0.50', color: '#ef4444', desc: '模型不可用，需重新构建' },
          ].map(g => (
            <div key={g.grade} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.grade}</div>
              <div className="text-[10px] font-mono text-gw-text mt-0.5">{g.range}</div>
              <div className="text-[9px] text-gw-muted mt-1 leading-tight">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="网格密度参考标准" badge="5级">
        <FilterableTechTable
          headers={['等级', '网格尺寸', '适用场景', '计算资源', '总节点量级']}
          rows={[
            ['粗网格', '~200m', '初步建模/概念验证', '普通PC', '<1万'],
            ['中粗网格', '~100m', '区域尺度模拟', '普通PC', '1~5万'],
            ['中等网格', '~50m', '常规生产项目', '工作站', '5~50万'],
            ['中细网格', '~25m', '重点区域精细模拟', '高性能工作站', '50~200万'],
            ['细网格', '~10m', '局部高精度模拟', '高性能集群', '>200万'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <DataSourceNote source="《地下水数值模拟》薛禹群 | MODFLOW/MT3DMS技术手册 | Anderson & Woessner(2015)" version="B-25" />
    </div>
  );
}
