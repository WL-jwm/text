import React from 'react';
import { TrendingUp, TrendingDown, FileText, AlertTriangle } from 'lucide-react';
import { plainWaterBalance, cityWaterBalance, cityGroundwaterExtraction2000, shallowWaterQualityByClass, hydrogeologicalParams, cityExploitationPotential, cityGroundwaterPollution } from '../../data/groundwaterResources';
import { TechCard, StatCard } from '../UI';

export function ResourcesBalanceTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="总补给量" value={plainWaterBalance.totalRecharge.toFixed(1)} unit="亿m³/a" icon={TrendingUp} accent="blue" />
        <StatCard title="总排泄量" value={plainWaterBalance.totalDischarge.toFixed(1)} unit="亿m³/a" icon={TrendingDown} accent="red" />
        <StatCard title="年均超采" value={Math.abs(plainWaterBalance.balance).toFixed(1)} unit="亿m³/a" icon={AlertTriangle} accent="amber" />
        <StatCard title="评价时段" value="1991-2000" unit="" icon={FileText} accent="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="补给项构成" badge="亿m³/a">
          <div className="space-y-1.5">
            {plainWaterBalance.rechargeBreakdown.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 bg-gw-surface/50 rounded text-[10px]">
                <span className="text-gw-text">{r.item}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gw-border/30 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{width: r.percent + '%'}} />
                  </div>
                  <span className="font-mono text-gw-cyan w-16 text-right">{r.value.toFixed(2)}</span>
                  <span className="text-gw-muted w-10 text-right">{r.percent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </TechCard>
        <TechCard title="排泄项构成" badge="亿m³/a">
          <div className="space-y-1.5">
            {plainWaterBalance.dischargeBreakdown.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 bg-gw-surface/50 rounded text-[10px]">
                <span className="text-gw-text">{r.item}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gw-border/30 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{width: r.percent + '%'}} />
                  </div>
                  <span className="font-mono text-gw-cyan w-16 text-right">{r.value.toFixed(2)}</span>
                  <span className="text-gw-muted w-10 text-right">{r.percent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      <TechCard title="各市水均衡汇总（1991-2000年均值）" badge="亿m³/a">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1 px-1.5">城市</th>
              <th className="text-gw-muted py-1 px-1.5">面积(km²)</th>
              <th className="text-gw-muted py-1 px-1.5">补给量</th>
              <th className="text-gw-muted py-1 px-1.5">排泄量</th>
              <th className="text-gw-muted py-1 px-1.5">补排差</th>
              <th className="text-left text-gw-muted py-1 px-1.5">超采率</th>
            </tr></thead>
            <tbody>
              {cityWaterBalance.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1 px-1.5 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1 px-1.5 font-mono">{c.total.area.toLocaleString()}</td>
                  <td className="py-1 px-1.5 font-mono text-blue-400">{c.total.recharge.toFixed(2)}</td>
                  <td className="py-1 px-1.5 font-mono text-red-400">{c.total.discharge.toFixed(2)}</td>
                  <td className={'py-1 px-1.5 font-mono ' + (c.total.balance < 0 ? 'text-red-400' : 'text-emerald-400')}>{c.total.balance.toFixed(2)}</td>
                  <td className="py-1 px-1.5">
                    <span className={'px-1 py-0.5 rounded text-[9px] ' + (Math.abs(c.total.balance/c.total.recharge) > 0.2 ? 'bg-red-500/15 text-red-400' : Math.abs(c.total.balance/c.total.recharge) > 0.1 ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400')}>
                      {(Math.abs(c.total.balance)/c.total.recharge*100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="各市地下水开采量（2000年）" badge="亿m³/a">
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1 px-1">城市</th>
              <th className="text-gw-muted py-1 px-1">浅层淡水</th>
              <th className="text-gw-muted py-1 px-1">深层承压水</th>
              <th className="text-gw-muted py-1 px-1">微咸水</th>
              <th className="text-gw-muted py-1 px-1">总计</th>
              <th className="text-gw-muted py-1 px-1">农业</th>
              <th className="text-gw-muted py-1 px-1">工业</th>
              <th className="text-gw-muted py-1 px-1">生活</th>
            </tr></thead>
            <tbody>
              {cityGroundwaterExtraction2000.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1 px-1 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1 px-1 font-mono">{c.shallow.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono">{c.deep.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono">{c.brackish.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono text-gw-highlight">{c.total.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono">{c.agriculture.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono">{c.industry.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono">{c.domestic.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechCard title="浅层地下水质量分类" badge="面积占比">
          <div className="space-y-1.5">
            {shallowWaterQualityByClass.map((q, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 bg-gw-surface/50 rounded text-[10px]">
                <div className="flex items-center gap-2">
                  <span className={'w-4 h-4 rounded text-center text-[8px] leading-4 font-bold ' + (
                    q.class === 'Ⅰ类' ? 'bg-emerald-500 text-white' :
                    q.class === 'Ⅱ类' ? 'bg-blue-500 text-white' :
                    q.class === 'Ⅲ类' ? 'bg-amber-500 text-white' :
                    q.class === 'Ⅳ类' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                  )}>{q.class.replace('类','')}</span>
                  <span className="text-gw-text">{q.area}</span>
                </div>
                <span className="font-mono text-gw-muted">{q.percent}%</span>
              </div>
            ))}
          </div>
        </TechCard>
        <TechCard title="水文地质参数" badge="分区特征">
          <div className="space-y-2">
            {Object.entries(hydrogeologicalParams).map(([key, val]) => (
              <div key={key} className="p-1.5 bg-gw-surface/50 rounded text-[10px]">
                <span className="text-gw-text font-medium">{{
                  rainfallInfiltration: '降水入渗系数',
                  permeability: '渗透系数K',
                  specificYield: '给水度μ',
                  storageCoefficient: '释水系数S',
                  evaporationDepth: '潜水蒸发极限深度'
                }[key] || key}：</span>
                <span className="text-gw-muted">{val}</span>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      <TechCard title="各市地下水开采潜力（2000年基准）" badge="潜力指数">
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1 px-1">城市</th>
              <th className="text-gw-muted py-1 px-1">可采资源</th>
              <th className="text-gw-muted py-1 px-1">2000开采</th>
              <th className="text-gw-muted py-1 px-1">潜力指数</th>
              <th className="text-gw-muted py-1 px-1">剩余量</th>
              <th className="text-gw-muted py-1 px-1">超采量</th>
              <th className="text-left text-gw-muted py-1 px-1">状态</th>
            </tr></thead>
            <tbody>
              {cityExploitationPotential.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-1 px-1 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1 px-1 font-mono text-blue-400">{c.resource.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono">{c.extraction2000.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono">{c.potentialIndex.toFixed(2)}</td>
                  <td className={'py-1 px-1 font-mono ' + (c.surplus < 0 ? 'text-red-400' : 'text-emerald-400')}>{c.surplus.toFixed(2)}</td>
                  <td className="py-1 px-1 font-mono text-red-400">{c.overdraft.toFixed(2)}</td>
                  <td className="py-1 px-1">
                    <span className={'px-1 py-0.5 rounded text-[9px] ' + (c.potentialIndex > 1.5 ? 'bg-red-500/15 text-red-400' : c.potentialIndex > 1.2 ? 'bg-amber-500/15 text-amber-400' : c.potentialIndex > 1.0 ? 'bg-yellow-500/15 text-yellow-400' : 'bg-emerald-500/15 text-emerald-400')}>{c.note}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="各市地下水污染评价" badge="1998-1999年">
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[9px]">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1 px-0.5">城市</th>
              <th className="text-gw-muted py-1 px-0.5">未污染</th>
              <th className="text-gw-muted py-1 px-0.5">轻污染</th>
              <th className="text-gw-muted py-1 px-0.5">中污染</th>
              <th className="text-gw-muted py-1 px-0.5">重污染</th>
              <th className="text-gw-muted py-1 px-0.5">严重</th>
              <th className="text-left text-gw-muted py-1 px-0.5">主要污染物</th>
              <th className="text-gw-muted py-1 px-0.5">趋势</th>
            </tr></thead>
            <tbody>
              {cityGroundwaterPollution.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20">
                  <td className="py-0.5 px-0.5 font-medium text-gw-text">{c.city}</td>
                  <td className="py-0.5 px-0.5 font-mono text-emerald-400">{c.unpol}</td>
                  <td className="py-0.5 px-0.5 font-mono text-amber-400">{c.light}</td>
                  <td className="py-0.5 px-0.5 font-mono text-orange-400">{c.moderate}</td>
                  <td className="py-0.5 px-0.5 font-mono text-red-400">{c.heavy}</td>
                  <td className="py-0.5 px-0.5 font-mono text-red-600">{c.severe}</td>
                  <td className="py-0.5 px-0.5 text-gw-muted">{c.mainPollutants}</td>
                  <td className="py-0.5 px-0.5">
                    <span className={'px-1 py-0.5 rounded text-[8px] ' + (c.trend === '减缓' ? 'bg-emerald-500/15 text-emerald-400' : c.trend === '变差' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400')}>{c.trend}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <p className="text-[9px] text-gw-muted">数据来源：《中国地下水资源 河北卷》(2005) 第三、四、五、六章，评价时段1991-2000年</p>
    </div>
  );
}
