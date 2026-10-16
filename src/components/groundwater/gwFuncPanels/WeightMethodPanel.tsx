/**
 * B-24 地下水功能评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入14项指标 → 四维度评分+综合评价
 *  2. 预设分区 — 6个河北典型功能区对比
 *  3. 评分标准 — 各指标评分细则
 *  4. 权重方法 — AHP权重+功能等级标准
 * 面板: WeightMethodPanel（拆分自 GroundwaterFunctionCalculatorTab.tsx）
 */
import { DIMENSION_WEIGHTS } from '../../../utils/groundwaterFunctionCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartTooltip, DataSourceNote, TechCard } from '../../UI';
import { YAxis, Cell, CartesianGrid, XAxis, BarChart, ResponsiveContainer, Tooltip, Bar } from 'recharts';

export function WeightMethodPanel() {
  const weightData = [
    { name: '供水功能', weight: DIMENSION_WEIGHTS.supply * 100, color: '#06b6d4' },
    { name: '生态功能', weight: DIMENSION_WEIGHTS.ecology * 100, color: '#10b981' },
    { name: '地质环境功能', weight: DIMENSION_WEIGHTS.geoEnvironment * 100, color: '#f59e0b' },
    { name: '调节功能', weight: DIMENSION_WEIGHTS.regulation * 100, color: '#8b5cf6' },
  ];

  const indicatorWeights: Array<{ dim: string; indicator: string; weight: string; color: string }> = [
    { dim: '供水功能', indicator: '单井涌水量', weight: '30%', color: '#06b6d4' },
    { dim: '供水功能', indicator: '水质级别', weight: '25%', color: '#06b6d4' },
    { dim: '供水功能', indicator: '可开采模数', weight: '25%', color: '#06b6d4' },
    { dim: '供水功能', indicator: '开采利用率', weight: '20%', color: '#06b6d4' },
    { dim: '生态功能', indicator: '基流补给比例', weight: '40%', color: '#10b981' },
    { dim: '生态功能', indicator: '湿地依赖度', weight: '30%', color: '#10b981' },
    { dim: '生态功能', indicator: '植被依赖度', weight: '30%', color: '#10b981' },
    { dim: '地质环境功能', indicator: '地面沉降速率', weight: '40%', color: '#f59e0b' },
    { dim: '地质环境功能', indicator: '海水入侵距离', weight: '30%', color: '#f59e0b' },
    { dim: '地质环境功能', indicator: '盐渍化面积比', weight: '30%', color: '#f59e0b' },
    { dim: '调节功能', indicator: '含水层厚度', weight: '25%', color: '#8b5cf6' },
    { dim: '调节功能', indicator: '给水度', weight: '25%', color: '#8b5cf6' },
    { dim: '调节功能', indicator: '年补给强度', weight: '30%', color: '#8b5cf6' },
    { dim: '调节功能', indicator: '水位年变幅', weight: '20%', color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-4">
      <LazyChartCard title="AHP维度权重分布" height={260}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weightData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" horizontal={false} />
            <XAxis type="number" domain={[0, 40]} stroke="#64748b" fontSize={10} unit="%" />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={100} />
            <Tooltip content={<ChartTooltip title="权重" unit="%" />} />
            <Bar dataKey="weight" name="权重" radius={[0, 4, 4, 0]}>
              {weightData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="指标层权重明细" badge="14项指标">
        <FilterableTechTable
          headers={['维度', '指标', '指标层权重', '颜色']}
          rows={indicatorWeights.map(w => [w.dim, w.indicator, w.weight, w.color])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="AHP层次分析法说明" badge="方法说明">
        <div className="space-y-3">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">层次结构</div>
            <div className="text-[10px] text-gw-muted mt-1">
              目标层(A): 地下水综合功能评价 → 准则层(B): 供水/生态/地质环境/调节四维度 → 指标层(C): 14项具体指标
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">权重确定方法</div>
            <div className="text-[10px] text-gw-muted mt-1">
              采用专家打分法构建判断矩阵，通过一致性检验(CR&lt;0.1)确定维度权重。供水功能权重最高(35%)，体现地下水首要服务功能；
              地质环境功能(25%)反映环境约束；生态功能与调节功能各占20%。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">综合评分公式</div>
            <div className="text-sm font-mono text-gw-highlight mt-1">
              F = Σ(Bi × Wi) = B供×0.35 + B生×0.20 + B地×0.25 + B调×0.20
            </div>
            <div className="text-[10px] text-gw-muted mt-1">
              其中 Bi 为各维度内指标加权得分，Wi 为维度权重。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">主导功能判定</div>
            <div className="text-[10px] text-gw-muted mt-1">
              取四维度中得分最高者为主导功能，用于功能区划方向引导。当最高与次高差距&lt;5分时，标记为多功能复合区。
            </div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="DZ/T 0287《地下水功能区划分技术要求》| AHP层次分析法 | 河北省地下水功能区划报告" version="B-24" />
    </div>
  );
}
