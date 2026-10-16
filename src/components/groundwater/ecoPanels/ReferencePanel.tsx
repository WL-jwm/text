/**
 * 面板: ReferencePanel（拆分自 EcosystemServiceTab.tsx）
 */
import { REGION_PRESETS } from '../../../utils/ecosystemServiceEvaluator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { CollapsiblePanel, TechCard } from '../../UI';

export function ReferencePanel() {
  const headers = ['服务大类', '服务子类', '评估方法', '数据来源'];
  const rows = [
    ['供给服务', '生活/农业/工业供水', '市场价值法', '水资源公报+水价标准'],
    ['供给服务', '生态用水', '影子价格法', '生活水价×80%'],
    ['调节服务', '基流维持', '替代工程法', '水库建设成本2元/m³'],
    ['调节服务', '水质净化', '替代成本法', '污水处理成本'],
    ['调节服务', '气候调节', '碳交易法', '碳储量×碳交易价'],
    ['调节服务', '洪水调蓄', '避免损失法', '调蓄空间×洪灾损失'],
    ['调节服务', '蒸散发调节', '微气候价值法', '蒸散发量×0.5元/m³'],
    ['文化服务', '休闲旅游', '旅行费用法(TCM)', '游客量×平均消费'],
    ['文化服务', '教育科研', '直接计算法', '科研经费统计'],
    ['文化服务', '地质遗迹/泉群', '存在价值法', '50/100万元/个·年'],
    ['支持服务', '生境维持', '单位面积价值法', '湿地面积×生物多样性价值'],
    ['支持服务', '生物多样性', '物种保护价值法', '濒危物种×500万元/种'],
  ];
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">评估方法与数据来源</h3>
        <FilterableTechTable headers={headers} rows={rows} />
      </TechCard>
      
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">预设区域数据</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REGION_PRESETS.map(r => (
            <div key={r.id} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <div className="text-sm font-medium text-cyan-400">{r.name}</div>
              <div className="text-xs text-slate-400 mt-1">{r.description}</div>
              <div className="text-xs text-slate-500 mt-1">人口: {r.population}万</div>
            </div>
          ))}
        </div>
      </TechCard>
      
      <CollapsiblePanel title="理论基础与参考文献" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p><strong className="text-slate-300">TEV框架</strong>: 总经济价值(Total Economic Value) = 使用价值 + 非使用价值，包括直接/间接使用价值、选择价值和存在价值。</p>
          <p><strong className="text-slate-300">MA框架</strong>: 千年生态系统评估(Millennium Ecosystem Assessment)将生态系统服务分为供给、调节、文化、支持四大类。</p>
          <p><strong className="text-slate-300">价值转移法</strong>: 基于Costanza et al.(2014)全球生态系统服务价值评估成果，结合区域修正系数进行本地化估算。</p>
          <p><strong className="text-slate-300">参考标准</strong>: GB/T 38582-2020《生态系统评估 生态系统服务评估方法》、HJ 1169-2021《生态保护红线监管技术指南》。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}
