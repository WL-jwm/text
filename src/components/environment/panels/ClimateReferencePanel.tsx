/**
 * B-37 气候变化对地下水影响评估器 Tab
 *
 * 5大面板：
 *  1. 气候降尺度 — 历史气候数据+GCM降尺度+降水/气温趋势
 *  2. 补给量预测 — 降水-补给关系+多情景补给变化
 *  3. 干旱指数 — SPI/SPEI计算+干旱分级+传导滞后
 *  4. 适应策略 — 策略库+情景匹配+优先级排序
 *  5. 参考说明 — 降尺度方法+补给公式+干旱指数+GCM情景
 * 面板组件：ReferencePanel（拆分自 ClimateImpactTab.tsx）
 */

import { CloudRain, Thermometer, Droplets, Sun } from 'lucide-react';
import { DataSourceNote, CollapsiblePanel } from '../../UI';
import { SCENARIO_PARAMS } from '../../../utils/climateImpactCalculator';

// ── 面板5: 参考说明 ──
export function ClimateReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="Delta降尺度方法" defaultOpen icon={CloudRain}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">原理</strong>：将GCM网格的气候变化信号(Delta)叠加到历史观测数据上。未来降水 = 历史降水 x (1 + dP%)，未来气温 = 历史气温 + dT。</p>
          <p><strong className="text-gw-text">优势</strong>：简单直观，保留了历史数据的自然变率特征，适用于区域尺度影响评估。</p>
          <p><strong className="text-gw-text">局限</strong>：假设未来气候变率与历史一致，无法捕捉极端事件频率的变化。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="补给量估算方法" icon={Droplets}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">Bredenkamp法</strong>：R = alpha x (P - beta x PET)，alpha和beta根据含水层类型确定。松散岩类alpha=0.25, beta=0.5。</p>
          <p><strong className="text-gw-text">Chaturvedi法</strong>：R = 1.35 x (P - 14)^0.5，适用于半干旱区，P大于14mm时才有补给。</p>
          <p><strong className="text-gw-text">Budyko框架</strong>：基于水量平衡，AET = PET x f(P/PET)，补给量 = 30%的水分盈余。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="干旱指数(SPI/SPEI)" icon={Sun}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">SPI</strong>：标准降水指数，将降水序列拟合Gamma分布后转换为标准正态变量。SPI &lt; -1为干旱，&lt; -2为极端干旱。</p>
          <p><strong className="text-gw-text">SPEI</strong>：标准降水蒸散指数，在SPI基础上引入蒸散发（水分平衡P-PET），更能反映变暖条件下的干旱加剧。</p>
          <p><strong className="text-gw-text">干旱传导</strong>：气象干旱(SPI)→土壤水分干旱→水文干旱(SPEI)通常滞后3-6个月。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="CMIP气候情景" icon={Thermometer}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">情景</th>
                <th className="text-center py-1 px-2">升温(℃)</th>
                <th className="text-center py-1 px-2">降水变化</th>
                <th className="text-left py-1 px-2">描述</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {Object.entries(SCENARIO_PARAMS).filter(([k]) => k !== 'historical').map(([key, val]) => (
                <tr key={key} className="border-b border-gw-border/50">
                  <td className="py-1 px-2" style={{ color: val.color }}>{val.label}</td>
                  <td className="py-1 px-2 text-center text-red-400">+{val.deltaTemp}</td>
                  <td className="py-1 px-2 text-center">{val.deltaPrecip > 0 ? '+' : ''}{val.deltaPrecip}%</td>
                  <td className="py-1 px-2 text-[10px]">{key.startsWith('rcp') ? 'CMIP5代表性浓度路径' : 'CMIP6共享社会经济路径'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <DataSourceNote source="IPCC AR6 (2021) Working Group I | CMIP6数据计划 | 中国气象局国家气候中心 | 河北省气候变化监测公报(2023) | Bredenkamp (1970) | McKee et al. (1993) SPI | Vicente-Serrano et al. (2010) SPEI" />
    </div>
  );
}
