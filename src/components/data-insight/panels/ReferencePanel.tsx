/**
 * ReferencePanel — 交互分析面板（自 GwSwInteractionTab.tsx 拆分）
 */
import { Droplets, ArrowLeftRight, Thermometer, Waves, MapPin } from 'lucide-react';
import { CollapsiblePanel, DataSourceNote } from '../../UI';
import { PRESET_RIVERS } from '../../../utils/gwSwInteractionCalculator';

// ── 面板5: 参考说明 ──
export function ReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="基流分割方法" defaultOpen icon={Droplets}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">BFI法</strong>：英国水文研究所提出的滑块最小值法。将径流序列分为N天块，取每块最小值，平滑连接作为基流。简单直观但对时间窗口敏感。</p>
          <p><strong className="text-gw-text">Chapman滤波</strong>：b[k] = a * b[k-1] + (1-a)/2 * (q[k] + q[k-1])。一阶递归滤波器，a为退水常数(通常0.9-0.95)。</p>
          <p><strong className="text-gw-text">Eckhardt滤波</strong>：引入最大BFI参数(BFI_max)，考虑含水层类型。承压水BFI_max=0.8-0.9，潜水0.5-0.8。是目前最常用的方法。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="交换通量计算" icon={ArrowLeftRight}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">Darcy法</strong>：Q = K * W * L * (h_river - h_gw) / b</p>
          <p>其中K为河床渗透系数(m/d)，W为河宽(m)，L为河段长度(m)，h为水位(m)，b为河床沉积物厚度(m)。</p>
          <p>正值表示河流补给地下水（下渗），负值表示地下水排泄到河流。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="温度示踪原理" icon={Thermometer}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">热扩散方程</strong>：dT/dt = a * d²T/dz²，其中a为热扩散系数(m²/s)。</p>
          <p><strong className="text-gw-text">振幅衰减</strong>：A(z)/A(0) = exp(-z/d)，d = sqrt(2a/w)为阻尼深度，w为角频率。</p>
          <p><strong className="text-gw-text">相位滞后</strong>：Df = z/d * (T/2p)，T为波动周期。</p>
          <p><strong className="text-gw-text">流速推断</strong>：通过振幅衰减比值反演垂直流速，正值为下行流，负值为上行流。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="交互类型分类" icon={Waves}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">类型</th>
                <th className="text-left py-1 px-2">特征</th>
                <th className="text-left py-1 px-2">典型区域</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-green-400">增益型</td>
                <td className="py-1 px-2">地下水排泄到河流</td>
                <td className="py-1 px-2 text-[10px]">平原区下游、排泄区</td>
              </tr>
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-red-400">失水型</td>
                <td className="py-1 px-2">河水补给地下水</td>
                <td className="py-1 px-2 text-[10px]">山前冲洪积扇、引水渠道</td>
              </tr>
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-amber-400">穿越型</td>
                <td className="py-1 px-2">交换方向季节性交替</td>
                <td className="py-1 px-2 text-[10px]">平原区中游、水位波动区</td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-purple-400">悬托型</td>
                <td className="py-1 px-2">河床高于地下水位</td>
                <td className="py-1 px-2 text-[10px]">山前段、岩溶区</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="预设河流数据" icon={MapPin}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">河流</th>
                <th className="text-center py-1 px-2">断面数</th>
                <th className="text-center py-1 px-2">段长(km)</th>
                <th className="text-center py-1 px-2">流域面积(km²)</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {PRESET_RIVERS.map(r => (
                <tr key={r.id} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">{r.name}</td>
                  <td className="py-1 px-2 text-center">{r.points.length}</td>
                  <td className="py-1 px-2 text-center">{r.segmentLength / 1000}</td>
                  <td className="py-1 px-2 text-center">{r.area.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <DataSourceNote source="Brutsaert (2005) Hydrology: An Introduction | Eckhardt (2005) How to construct recursive digital filters | Hatch (2006) Quantifying surface water-groundwater interaction | 河北省水资源公报(2023) | 海河流域水文资料" />
    </div>
  );
}
