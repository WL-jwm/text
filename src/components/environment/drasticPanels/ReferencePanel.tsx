/**
 * B-16 地下水脆弱性评价（DRASTIC模型）Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入7参数 → DRASTIC指数/脆弱性等级/参数分解
 *  2. 分区评价 — 8预设分区对比 + 面积统计
 *  3. 污染风险 — 污染源叠加风险分析
 *  4. 参数参考 — 7参数评分表查表
 * 面板: ReferencePanel（拆分自 DrasticVulnerabilityTab.tsx）
 */
import { AQUIFER_MEDIA_RATINGS, SOIL_MEDIA_RATINGS, VADOSE_MEDIA_RATINGS, DRASTIC_WEIGHTS, RECHARGE_RATINGS, TOPOGRAPHY_RATINGS, DEPTH_RATINGS, CONDUCTIVITY_RATINGS } from '../../../utils/drasticCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';

export function ReferencePanel() {
  return (
    <div className="space-y-4">
      <FilterableTechTable
        headers={['埋深范围(m)', '评分']}
        rows={DEPTH_RATINGS.map(r => [r.range, r.rating])}
      />
      <FilterableTechTable
        headers={['净补给量(mm/a)', '评分']}
        rows={RECHARGE_RATINGS.map(r => [r.range, r.rating])}
      />
      <FilterableTechTable
        headers={['含水层介质', '评分', '典型特征']}
        rows={Object.entries(AQUIFER_MEDIA_RATINGS).map(([, v]) => [v.label, v.rating, v.typical])}
      />
      <FilterableTechTable
        headers={['土壤介质', '评分']}
        rows={Object.entries(SOIL_MEDIA_RATINGS).map(([, v]) => [v.label, v.rating])}
      />
      <FilterableTechTable
        headers={['地形坡度(%)', '评分']}
        rows={TOPOGRAPHY_RATINGS.map(r => [r.range, r.rating])}
      />
      <FilterableTechTable
        headers={['非饱和带介质', '评分']}
        rows={Object.entries(VADOSE_MEDIA_RATINGS).map(([, v]) => [v.label, v.rating])}
      />
      <FilterableTechTable
        headers={['渗透系数(m/d)', '评分']}
        rows={CONDUCTIVITY_RATINGS.map(r => [r.range, r.rating])}
      />

      <FilterableTechTable
        headers={['参数', '代码', '权重', '说明']}
        rows={[
          ['地下水埋深', 'D', DRASTIC_WEIGHTS.D, '埋深越大，污染物到达时间越长'],
          ['净补给量', 'R', DRASTIC_WEIGHTS.R, '补给量大，污染物运移快'],
          ['含水层介质', 'A', DRASTIC_WEIGHTS.A, '介质孔隙/裂隙决定渗透性'],
          ['土壤介质', 'S', DRASTIC_WEIGHTS.S, '粘土层有过滤吸附作用'],
          ['地形坡度', 'T', DRASTIC_WEIGHTS.T, '坡度大则径流快、入渗少'],
          ['非饱和带介质', 'I', DRASTIC_WEIGHTS.I, '决定污染物垂向运移路径'],
          ['渗透系数', 'C', DRASTIC_WEIGHTS.C, '反映含水层导水能力'],
        ]}
      />
    </div>
  );
}
