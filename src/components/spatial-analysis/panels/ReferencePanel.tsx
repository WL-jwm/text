/**
 * 面板5: 参考说明
 *  B-33 监测网优化 — 密度标准+评价方法+优化建议（自 MonitoringNetworkTab.tsx 拆分）
 */
import { Grid3x3, MapPin, Activity, Gauge } from 'lucide-react';
import { DataSourceNote, CollapsiblePanel } from '../../UI';
import { DENSITY_STANDARDS } from '../../../utils/monitoringNetworkCalculator';

export function ReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="监测井密度标准" defaultOpen icon={Grid3x3}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">含水层类型</th>
                <th className="text-center py-1 px-2">最小密度(km²/口)</th>
                <th className="text-center py-1 px-2">推荐密度</th>
                <th className="text-center py-1 px-2">最大密度</th>
                <th className="text-left py-1 px-2">参考依据</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {DENSITY_STANDARDS.map(s => (
                <tr key={s.type} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">{s.label}</td>
                  <td className="py-1 px-2 text-center">{s.minSpacing}</td>
                  <td className="py-1 px-2 text-center text-green-400">{s.recommended}</td>
                  <td className="py-1 px-2 text-center">{s.maxSpacing}</td>
                  <td className="py-1 px-2 text-[10px] text-gw-muted">DZ/T 0307-2017</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="空间覆盖评价方法" icon={MapPin}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">泰森多边形法</strong>：将研究区划分为若干泰森多边形，每个多边形内只有一口监测井，多边形的面积即为该井的控制面积。控制面积越大，说明该井代表的范围越广。</p>
          <p><strong className="text-gw-text">覆盖空白识别</strong>：当某网格到最近监测井的距离超过阈值（取网格最大尺寸的30%），标记为覆盖空白。空白区域集中的位置应优先增设监测井。</p>
          <p><strong className="text-gw-text">均匀度指数</strong>：基于Gini系数的补集，衡量各监测井控制面积的均衡程度。指数越接近1，分布越均匀。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="频率优化方法" icon={Activity}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">自相关分析</strong>：计算水位时间序列的一阶自相关系数r1。r1越接近1，连续观测值相关性越高，存在冗余信息。</p>
          <p><strong className="text-gw-text">推荐频率公式</strong>：f = round(12 * (1 - r1²))。当r1高（变化平缓）时降低频率，r1低（变化快速）时提高频率。范围限制在2~24次/年。</p>
          <p><strong className="text-gw-text">冗余指数</strong>：R = r1²，反映连续观测中重复信息的比例。R {'>'} 0.64 (r1 {'>'} 0.8)时建议降低采样频率。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="信息熵与冗余度" icon={Gauge}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">信息熵</strong>：H = -Σ p(x) * log2(p(x))。将水位数据离散化为10个区间，计算Shannon熵。熵值越高，监测井提供的信息量越大。</p>
          <p><strong className="text-gw-text">井间相关性</strong>：计算各监测井水位序列的皮尔逊相关系数。相关系数绝对值 {'>'} 0.85的井对视为冗余，可考虑整合或调整位置。</p>
          <p><strong className="text-gw-text">效率评分</strong>：综合冗余率(50%)+独立性(30%)+信息熵(20%)，满分100。评分 {'>'} 80为优秀，{'<'} 40需重新规划。</p>
        </div>
      </CollapsiblePanel>

      <DataSourceNote source="DZ/T 0307-2017《地下水监测网设计规范》| GB/T 14848-2017《地下水质量标准》| 河北省地下水监测规划(2021-2025) | 水利部《地下水监测工程技术规范》SL 360-2006" />
    </div>
  );
}
