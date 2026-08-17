import { DataSourceNote, CollapsiblePanel } from '../UI';
import { PipelinePanel } from '../PipelinePanel';
import { MapPin, Layers, BookOpen, Settings } from 'lucide-react';
import { AQUIFER_TYPE_LABEL } from './sim-constants';
import { PRESET_MODEL_AREAS } from '../../utils/numericalFlowSimulator';

export function ReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="有限差分法原理" defaultOpen icon={BookOpen}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">控制方程</strong>（二维承压含水层非稳定流）：</p>
          <div className="bg-gw-surface p-3 rounded font-mono text-[11px] text-gw-text">
            d/dx(T_x . dh/dx) + d/dy(T_y . dh/dy) + W = S . dh/dt
          </div>
          <p>其中 T 为导水系数 (m²/d)，h 为水头 (m)，W 为源汇项 (m³/d/m²)，S 为储水系数。</p>
          <p><strong className="text-gw-text">离散化</strong>：对每个网格节点 (i,j)，将偏微分方程替换为差分方程，得到线性方程组。采用中心差分格式，二阶精度。</p>
          <p><strong className="text-gw-text">迭代求解</strong>：Gauss-Seidel 迭代 + SOR (Successive Over-Relaxation) 加速。SOR 因子 范围 [1.0, 2.0]，默认 1.5。收敛条件为最大水头变化量小于容差。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="边界条件类型" icon={Layers}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">类型</th>
                <th className="text-left py-1 px-2">物理含义</th>
                <th className="text-left py-1 px-2">数学表达</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-cyan-400">定水头</td>
                <td className="py-1 px-2">边界水位恒定（河流/湖泊）</td>
                <td className="py-1 px-2 font-mono">h = h0</td>
              </tr>
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-purple-400">隔水边界</td>
                <td className="py-1 px-2">无流量通过（基岩/断层）</td>
                <td className="py-1 px-2 font-mono">dh/dn = 0</td>
              </tr>
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-blue-400">通用水头</td>
                <td className="py-1 px-2">远场水头+导水阻力</td>
                <td className="py-1 px-2 font-mono">Q = C.(h_ext - h)</td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-green-400">补给边界</td>
                <td className="py-1 px-2">面状补给（降雨入渗）</td>
                <td className="py-1 px-2 font-mono">W = R . dx . dy</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="参数校准方法" icon={Settings}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">校准目标</strong>：调整渗透系数 K 和补给量 R，使模拟水头与观测水头偏差最小化。</p>
          <p><strong className="text-gw-text">优化方法</strong>：基于梯度的迭代修正（Gauss-Marquardt 简化版）。每步对三个参数（Kx, Ky, Recharge）进行扰动，计算目标函数（RMSE）对每个参数的敏感度，沿最陡下降方向更新。</p>
          <p><strong className="text-gw-text">评价指标</strong>：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-gw-text">RMSE</strong>（均方根误差）：小于 1m 为优，1-3m 为良，大于 3m 需改进</li>
            <li><strong className="text-gw-text">MAE</strong>（平均绝对误差）：反映整体偏差水平</li>
            <li><strong className="text-gw-text">R²</strong>（决定系数）：大于 0.9 为优，0.7-0.9 为良，小于 0.7 需改进</li>
          </ul>
          <p><strong className="text-gw-text">步长衰减</strong>：每轮迭代步长乘以 0.95，确保后期精细搜索。收敛容差 0.5m。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="预设研究区域说明" icon={MapPin}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">区域</th>
                <th className="text-center py-1 px-2">含水层类型</th>
                <th className="text-center py-1 px-2">Kx (m/d)</th>
                <th className="text-center py-1 px-2">厚度 (m)</th>
                <th className="text-center py-1 px-2">补给 (mm/a)</th>
                <th className="text-center py-1 px-2">网格</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {PRESET_MODEL_AREAS.map(a => (
                <tr key={a.id} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">{a.name}</td>
                  <td className="py-1 px-2 text-center">{AQUIFER_TYPE_LABEL[a.aquifer.type]}</td>
                  <td className="py-1 px-2 text-center">{a.aquifer.kx}</td>
                  <td className="py-1 px-2 text-center">{a.aquifer.thickness}</td>
                  <td className="py-1 px-2 text-center">{a.aquifer.rechargeRate}</td>
                  <td className="py-1 px-2 text-center text-[10px]">{a.grid.rows}x{a.grid.cols}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <PipelinePanel moduleId="numericalSim" onReceive={(dataType, payload) => {
        if (dataType === 'aquiferParams') {
          const parts: string[] = [];
          if (payload.hydraulicConductivity) parts.push(`K=${payload.hydraulicConductivity} m/d`);
          if (payload.hydraulicGradient) parts.push(`I=${payload.hydraulicGradient}`);
          if (parts.length > 0) alert(`已接收含水层参数:\n${parts.join(', ')}\n\n请在模型设置中手动更新对应参数。`);
        } else if (dataType === 'balanceResult') {
          if (payload.balance !== undefined) alert(`已接收均衡结果:\n补给=${payload.recharge} \u4e07m\u00b3, 排泄=${payload.discharge} \u4e07m\u00b3, 均衡差=${payload.balance} \u4e07m\u00b3\n\n请据此调整模拟边界条件。`);
        }
      }} />
      <DataSourceNote source="MODFLOW 2005 用户指南 | 薛禹群《地下水数值模拟》| 河北省水文地质图集 | 河北省地下水超采区评价报告(2022)" />
    </div>
  );
}
