/**
 * B-27 地下水背景值统计分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 单因子背景值确定（3种方法对比）
 *  2. 分区对比 — 3个分区6项因子背景值差异分析
 *  3. 超标统计 — 各因子超标率/超标倍数/污染指数
 *  4. 趋势检测 — 多年背景值变化趋势+偏移判断
 * 面板: TrendPanel（拆分自 BackgroundValueCalculatorTab.tsx）
 */
import { calcAllTrends } from '../../../utils/backgroundValueCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, ChartTooltip, DataSourceNote, StatCard } from '../../UI';
import { TrendingDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { YAxis, Line, XAxis, CartesianGrid, Legend, Tooltip, LineChart, ResponsiveContainer } from 'recharts';

export function TrendPanel() {
  const results = useMemo(() => calcAllTrends(), []);

  const _trendLineData = useMemo(() => {
    // 合并所有因子的年份数据
    if (results.length === 0) return [];
    const years = results[0].years;
    return years.map((y, i) => {
      const item: Record<string, number | string> = { year: String(y) };
      results.forEach(r => {
        if (r.yearlyMeans[i] !== undefined) {
          item[r.factor] = r.yearlyMeans[i];
        }
      });
      return item;
    });
  }, [results]);

  const [selectedFactor, setSelectedFactor] = useState(results[0]?.factor ?? 'TDS');
  const selectedResult = results.find(r => r.factor === selectedFactor) ?? results[0];

  const selectedLineData = useMemo(() => {
    if (!selectedResult) return [];
    return selectedResult.years.map((y, i) => ({
      year: String(y),
      实测值: selectedResult.yearlyMeans[i],
      趋势线: selectedResult.slope * y + (selectedResult.yearlyMeans.reduce((a, b) => a + b, 0) / selectedResult.yearlyMeans.length - selectedResult.slope * selectedResult.years.reduce((a, b) => a + b, 0) / selectedResult.years.length),
    }));
  }, [selectedResult]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="趋势因子" value={results.length} unit="项" icon={TrendingDown} accent="blue" />
        <StatCard title="显著变化" value={results.filter(r => r.backgroundShift).length} unit={`/${results.length}`} icon={TrendingDown} accent="amber" />
        <StatCard title="上升因子" value={results.filter(r => r.trend === '上升').length} unit="个" icon={TrendingDown} accent="red" />
        <StatCard title="下降因子" value={results.filter(r => r.trend === '下降').length} unit="个" icon={TrendingDown} accent="emerald" />
      </div>

      {/* 因子选择器 */}
      <TechCard title="趋势分析详情" badge={selectedFactor}>
        <div className="flex flex-wrap gap-1 mb-3">
          {results.map(r => (
            <button key={r.factor} onClick={() => setSelectedFactor(r.factor)}
              className={`px-2 py-1 rounded text-[10px] transition-all ${selectedFactor === r.factor ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
              {r.factor}
            </button>
          ))}
        </div>

        {selectedResult && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">斜率/年</div>
                <div className="text-base font-mono text-gw-highlight">{selectedResult.slope}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">年变化率</div>
                <div className="text-base font-mono" style={{ color: selectedResult.trend === '上升' ? '#ef4444' : selectedResult.trend === '下降' ? '#10b981' : '#64748b' }}>{selectedResult.annualChangeRate}%</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">R²</div>
                <div className="text-base font-mono text-gw-cyan">{selectedResult.r2}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">趋势</div>
                <div className="text-base" style={{ color: selectedResult.trend === '上升' ? '#ef4444' : selectedResult.trend === '下降' ? '#10b981' : '#64748b' }}>{selectedResult.trend}</div>
              </div>
            </div>
            <div className={`p-2 rounded text-[10px] mb-3 ${selectedResult.backgroundShift ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {selectedResult.note}
            </div>

            <LazyChartCard title={`${selectedFactor}背景值多年变化趋势`} height={280}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={selectedLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip content={<ChartTooltip title={selectedFactor} />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line dataKey="实测值" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                  <Line dataKey="趋势线" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </>
        )}
      </TechCard>

      <TechCard title="各因子趋势汇总">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            因子: r.factor,
            斜率: r.slope,
            年变化率: r.annualChangeRate,
            R2: r.r2,
            趋势: r.trend,
            背景值偏移: r.backgroundShift ? '是' : '否',
          }))} filename="background-trend" sheetName="背景值趋势" formats={['xlsx', 'csv', 'json']} label="导出趋势分析" />
        </div>
        <FilterableTechTable
          headers={['因子', '斜率/年', '年变化率(%)', 'R²', '趋势', '背景值偏移', '说明']}
          rows={results.map(r => [
            r.factor, String(r.slope), String(r.annualChangeRate),
            String(r.r2), r.trend,
            r.backgroundShift ? '是' : '否',
            r.note.substring(0, 30) + '...',
          ])}
          filterPlaceholder="搜索因子..."
        />
      </TechCard>

      <DataSourceNote source="GB/T 14848-2017《地下水质量标准》| 生态环境部《地下水环境背景值统计表征技术指南(试行)》(2023) | 河北省地质环境监测院" version="B-27" />
    </div>
  );
}
