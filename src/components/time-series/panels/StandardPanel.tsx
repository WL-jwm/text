/**
 * B-26 地下水时间序列分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 自定义序列输入→趋势/统计/突变/预测/自相关
 *  2. 预设序列 — 6个河北典型监测点11年序列对比
 *  3. 方法说明 — Mann-Kendall/Pettitt/Sen斜率等统计方法
 *  4. 评价标准 — 趋势/波动/突变/模型校准标准
 * 面板组件：StandardPanel（拆分自 TimeSeriesCalculatorTab.tsx）
 */

import { TechCard, DataSourceNote } from '../../UI';
import { FilterableTechTable } from '../../FilterableTechTable';

// ── 面板4: 评价标准 ──
export function StandardPanel() {
  return (
    <div className="space-y-4">
      <TechCard title="趋势显著性评价" badge="Mann-Kendall">
        <FilterableTechTable
          headers={['|Z|值范围', '趋势方向', '显著性', '评价']}
          rows={[
            ['Z > 2.576', '上升', 'α=0.01极显著', '趋势极为明确'],
            ['1.96 < Z ≤ 2.576', '上升', 'α=0.05显著', '趋势明确'],
            ['1.645 < Z ≤ 1.96', '上升', 'α=0.10弱显著', '趋势较明确'],
            ['-1.645 ≤ Z ≤ 1.645', '无', '不显著', '无显著趋势'],
            ['-1.96 ≤ Z < -1.645', '下降', 'α=0.10弱显著', '趋势较明确'],
            ['-2.576 ≤ Z < -1.96', '下降', 'α=0.05显著', '趋势明确'],
            ['Z < -2.576', '下降', 'α=0.01极显著', '趋势极为明确'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="变差系数评价" badge="Cv分级">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            { grade: '极稳定', range: 'Cv<0.1', color: '#10b981', desc: '年际变化极小' },
            { grade: '稳定', range: '0.1≤Cv<0.2', color: '#06b6d4', desc: '年际变化较小' },
            { grade: '中等波动', range: '0.2≤Cv<0.35', color: '#f59e0b', desc: '年际变化适中' },
            { grade: '波动较大', range: '0.35≤Cv<0.5', color: '#f97316', desc: '年际变化明显' },
            { grade: '波动剧烈', range: 'Cv≥0.5', color: '#ef4444', desc: '年际变化极大' },
          ].map(g => (
            <div key={g.grade} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.grade}</div>
              <div className="text-[10px] font-mono text-gw-text mt-0.5">{g.range}</div>
              <div className="text-[9px] text-gw-muted mt-1 leading-tight">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="R²拟合优度评价" badge="回归模型">
        <FilterableTechTable
          headers={['R²范围', '评价', '适用性']}
          rows={[
            ['R²≥0.9', '优', '模型高度可靠，可放心用于预测'],
            ['0.7≤R²<0.9', '良', '模型较可靠，预测误差较小'],
            ['0.5≤R²<0.7', '合格', '模型基本可用，需注意不确定性'],
            ['0.3≤R²<0.5', '勉强', '模型精度低，预测仅供参考'],
            ['R²<0.3', '差', '模型不可用，需换用其他方法'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="统计特征参考" badge="偏度/峰度">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">偏度(Skewness)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              衡量分布对称性。|偏度|&lt;0.5为近正态(对称)；偏度&gt;0.5为右偏(长尾在高值侧)；偏度&lt;-0.5为左偏(长尾在低值侧)。
              水位埋深序列常呈右偏(少数极端深值拉长右尾)。
            </div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">峰度(Kurtosis, 超额峰度)</div>
            <div className="text-[10px] text-gw-muted mt-1">
              衡量分布尖峭程度(相对正态分布)。峰度≈0为正态峰；峰度&gt;0为尖峰(数据集中于均值附近)；
              峰度&lt;0为平峰(数据分散)。开采量序列常呈尖峰(多数年份接近均值，少数年份偏离较大)。
            </div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="水文统计方法 | 时间序列分析教材 | 河北省地下水监测技术规范" version="B-26" />
    </div>
  );
}
