/**
 * B-24 地下水功能评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入14项指标 → 四维度评分+综合评价
 *  2. 预设分区 — 6个河北典型功能区对比
 *  3. 评分标准 — 各指标评分细则
 *  4. 权重方法 — AHP权重+功能等级标准
 * 面板: ScoringStandardsPanel（拆分自 GroundwaterFunctionCalculatorTab.tsx）
 */
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard, DataSourceNote } from '../../UI';

export function ScoringStandardsPanel() {
  const standards: Array<{ indicator: string; group: string; criteria: string }> = [
    // 供水
    { indicator: '单井涌水量', group: '供水', criteria: '≥5000(95) | ≥2000(80) | ≥1000(65) | ≥500(50) | ≥100(35) | <100(20)' },
    { indicator: '水质级别', group: '供水', criteria: 'Ⅰ类(95) | Ⅱ类(85) | Ⅲ类(70) | Ⅳ类(50) | Ⅴ类(30)' },
    { indicator: '可开采模数', group: '供水', criteria: '≥20(90) | ≥10(75) | ≥5(60) | ≥2(45) | ≥1(30) | <1(15) 万m³/km²·a' },
    { indicator: '开采利用率', group: '供水', criteria: '≤30%(90) | ≤50%(75) | ≤70%(60) | ≤85%(45) | ≤100%(30) | >100%(15) 反向评分' },
    // 生态
    { indicator: '基流补给比例', group: '生态', criteria: '≥60%(90) | ≥40%(75) | ≥20%(60) | ≥10%(45) | >0%(30) | 0(15)' },
    { indicator: '湿地依赖度', group: '生态', criteria: '5级(95) | 4级(80) | 3级(60) | 2级(40) | 1级(20)' },
    { indicator: '植被依赖度', group: '生态', criteria: '≥60%(90) | ≥40%(75) | ≥20%(60) | ≥10%(45) | >0%(30) | 0(15)' },
    // 地质环境
    { indicator: '地面沉降速率', group: '地质环境', criteria: '0(95) | ≤5(80) | ≤10(65) | ≤20(50) | ≤40(35) | >40(20) mm/a 反向' },
    { indicator: '海水入侵距离', group: '地质环境', criteria: '0(95) | ≤1(70) | ≤3(55) | ≤5(40) | ≤10(25) | >10(15) km 反向' },
    { indicator: '盐渍化面积比', group: '地质环境', criteria: '0(95) | ≤5%(80) | ≤15%(65) | ≤30%(50) | ≤50%(35) | >50%(20) 反向' },
    // 调节
    { indicator: '含水层厚度', group: '地质环境', criteria: '≥50(90) | ≥30(75) | ≥15(60) | ≥5(45) | ≥1(30) | <1(15) m' },
    { indicator: '给水度', group: '调节', criteria: '≥0.25(90) | ≥0.15(75) | ≥0.08(60) | ≥0.04(45) | ≥0.02(30) | <0.02(15)' },
    { indicator: '年补给强度', group: '调节', criteria: '≥200(90) | ≥100(75) | ≥50(60) | ≥20(45) | ≥10(30) | <10(15) mm/a' },
    { indicator: '水位年变幅', group: '调节', criteria: '≤1(90) | ≤2(75) | ≤4(60) | ≤6(45) | ≤10(30) | >10(15) m 反向' },
  ];

  return (
    <div className="space-y-4">
      <TechCard title="指标评分细则" badge="14项指标">
        <FilterableTechTable
          headers={['指标', '维度', '评分标准（括号内为得分）']}
          rows={standards.map(s => [s.indicator, s.group, s.criteria])}
          filterPlaceholder="搜索指标..."
        />
      </TechCard>

      <TechCard title="功能等级标准" badge="5级">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            { grade: '优秀', range: '85~100', color: '#10b981', desc: '各功能维度均优，可适度开发' },
            { grade: '良好', range: '70~84', color: '#06b6d4', desc: '功能良好，维持现状管理' },
            { grade: '中等', range: '55~69', color: '#f59e0b', desc: '功能中等，限制开发' },
            { grade: '较差', range: '40~54', color: '#f97316', desc: '功能较差，涵养修复' },
            { grade: '差', range: '<40', color: '#ef4444', desc: '功能差，禁采保护' },
          ].map(g => (
            <div key={g.grade} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.grade}</div>
              <div className="text-xs font-mono text-gw-text mt-0.5">{g.range}分</div>
              <div className="text-[10px] text-gw-muted mt-1 leading-tight">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="功能区划对应关系" badge="区划建议">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-emerald-400">开发保护区（≥70分）</div>
            <div className="text-[10px] text-gw-muted mt-1">以供水开发为主，兼顾生态保护，可适度增加开采量。适用于太行山前冲洪积扇等补给条件好的区域。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-cyan-400">限制开发区（55~69分）</div>
            <div className="text-[10px] text-gw-muted mt-1">以维持现状为主，控制开采量，加强动态监测。适用于平原中部一般超采区。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-amber-400">涵养修复区（40~54分）</div>
            <div className="text-[10px] text-gw-muted mt-1">以涵养修复为主，压采减采，恢复地下水功能。适用于深层地下水严重超采区。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-red-400">禁采保护区（&lt;40分）</div>
            <div className="text-[10px] text-gw-muted mt-1">全面禁止开采，实施生态修复和地下水回补。适用于海水入侵区、严重沉降区等。</div>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="《地下水功能区划分技术要求》| DZ/T 0287 | 河北省地下水功能区划报告" version="B-24" />
    </div>
  );
}
