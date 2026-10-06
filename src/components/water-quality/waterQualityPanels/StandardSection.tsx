/**
 * 标准指数法面板（拆分自 WaterQualityCalculatorTab.tsx）
 */
import { Plus, Trash2, Calculator, FileSpreadsheet, FileText, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { TechCard } from '../../UI';
import { exportStyledWaterQualityReport } from '../../../utils/waterQualityReportStyled';
import { generateWaterQualityReport } from '../../../utils/waterQualityReportWord';
import { type SampleResult, type EvaluationFactor } from '../../../utils/waterQualityCalculator';
import { CLASS_BG, type WaterSample } from './waterQualityConstants';

interface StandardSectionProps {
  samples: WaterSample[];
  results: SampleResult[];
  numericFactors: EvaluationFactor[];
  addSample: () => void;
  removeSample: (id: string) => void;
  updateSampleName: (id: string, name: string) => void;
  updateSampleValue: (id: string, factorName: string, value: string) => void;
  handleCalculate: () => void;
}

export function StandardSection({ samples, results, numericFactors, addSample, removeSample, updateSampleName, updateSampleValue, handleCalculate }: StandardSectionProps) {
  return (
        <div className="space-y-4">
          {/* 操作栏 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gw-muted">
              基于 GB/T 14848-2017 单因子标准指数法，综合评定取最差类别
            </span>
            <div className="flex gap-2">
              <button onClick={addSample}
                className="flex items-center gap-1 text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
                <Plus size={14} /> 添加水样
              </button>
              <button onClick={handleCalculate}
                className="flex items-center gap-1 text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
                <Calculator size={14} /> 计算评价
              </button>
              <button
                onClick={async () => {
                  const sukalovResults = samples
                    .filter(s => s.sukalovResult !== null)
                    .map(s => ({ name: s.name, result: s.sukalovResult! }));
                  await exportStyledWaterQualityReport(results, sukalovResults);
                }}
                disabled={results.length === 0 && !samples.some(s => s.sukalovResult)}
                className="flex items-center gap-1 text-xs bg-sky-600/15 text-sky-400 border border-sky-500/20 hover:bg-sky-600/25 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded transition-colors"
                title="导出为Excel文件(带样式)">
                <FileSpreadsheet size={14} /> 导出Excel
              </button>
              <button
                onClick={() => {
                  const sukalovResults = samples
                    .filter(s => s.sukalovResult !== null)
                    .map(s => ({ name: s.name, result: s.sukalovResult! }));
                  generateWaterQualityReport(results, sukalovResults);
                }}
                disabled={results.length === 0}
                className="flex items-center gap-1 text-xs bg-amber-600/15 text-amber-400 border border-amber-500/20 hover:bg-amber-600/25 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded transition-colors"
                title="生成Word评价报告">
                <FileText size={14} /> 导出Word
              </button>
            </div>
          </div>

          {/* 水样输入表格 */}
          {samples.map((sample) => (
            <TechCard key={sample.id} title={sample.name}>
              <div className="flex items-center justify-between mb-3">
                <input
                  value={sample.name}
                  onChange={e => updateSampleName(sample.id, e.target.value)}
                  className="text-sm font-medium bg-transparent border-b border-gw-border/50 focus:border-gw-highlight outline-none px-1 py-0.5 text-gw-text"
                />
                {samples.length > 1 && (
                  <button onClick={() => removeSample(sample.id)}
                    className="text-xs text-red-400/60 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gw-border/30">
                      <th className="text-left py-1.5 px-2 text-gw-muted font-medium w-36">评价因子</th>
                      <th className="text-left py-1.5 px-2 text-gw-muted font-medium w-12">单位</th>
                      <th className="text-left py-1.5 px-2 text-gw-muted font-medium">III类限值</th>
                      <th className="text-left py-1.5 px-2 text-gw-muted font-medium w-36">监测值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {numericFactors.map(factor => (
                      <tr key={factor.name} className="border-b border-gw-border/10 hover:bg-gw-surface/50">
                        <td className="py-1.5 px-2 text-gw-text">{factor.name}</td>
                        <td className="py-1.5 px-2 text-gw-muted">{factor.unit || '-'}</td>
                        <td className="py-1.5 px-2 text-gw-muted font-mono">{factor.III}</td>
                        <td className="py-1.5 px-2">
                          <input
                            value={sample.values[factor.name] || ''}
                            onChange={e => updateSampleValue(sample.id, factor.name, e.target.value)}
                            placeholder={factor.name === 'pH' ? '如 7.2' : '如 0.05 或 未检出0.01'}
                            className="w-full bg-gw-surface/50 border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text
                              placeholder:text-gw-muted/40 focus:border-gw-highlight/50 focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          ))}

          {/* 计算结果 */}
          {results.length > 0 && (
            <div className="space-y-4">
              <TechCard title="评价结果">
                {/* 综合评定概览 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {results.map(r => (
                    <div key={r.sampleName} className={`rounded-lg p-3 border ${
                      r.overallClassNum > 3
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-emerald-500/30 bg-emerald-500/5'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gw-text font-medium">{r.sampleName}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${CLASS_BG[r.overallClass] || 'bg-gray-500/15 text-gray-400'}`}>
                          {r.overallClassNum > 0 ? `${r.overallClass}类` : '-'}
                        </span>
                      </div>
                      {r.exceededCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-red-400">
                          <AlertTriangle size={10} />
                          超标因子({r.exceededCount}): {r.exceededFactors.join('、')}
                        </div>
                      )}
                      {r.exceededCount === 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle size={10} />
                          全部达标
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 详细Pi表 */}
                {results.map(r => (
                  <div key={r.sampleName} className="mb-4">
                    <h4 className="text-xs font-medium text-gw-text mb-2 flex items-center gap-1">
                      <ArrowRight size={12} /> {r.sampleName} - 标准指数明细
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gw-border/30">
                            <th className="text-left py-1.5 px-2 text-gw-muted font-medium">因子</th>
                            <th className="text-left py-1.5 px-2 text-gw-muted font-medium">单位</th>
                            <th className="text-left py-1.5 px-2 text-gw-muted font-medium">监测值</th>
                            <th className="text-left py-1.5 px-2 text-gw-muted font-medium">S(III类)</th>
                            <th className="text-left py-1.5 px-2 text-gw-muted font-medium">Pi</th>
                            <th className="text-left py-1.5 px-2 text-gw-muted font-medium">类别</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.factors.map(f => (
                            <tr key={f.name}
                              className={`border-b border-gw-border/10 ${
                                f.isExceeded ? 'bg-red-500/8' : ''
                              }`}>
                              <td className={`py-1.5 px-2 ${f.isExceeded ? 'text-red-400 font-medium' : 'text-gw-text'}`}>
                                {f.name}
                              </td>
                              <td className="py-1.5 px-2 text-gw-muted">{f.unit || '-'}</td>
                              <td className="py-1.5 px-2 text-gw-text font-mono">
                                {f.isND && f.detectionLimit ? `未检出 <${f.detectionLimit}` : f.value}
                              </td>
                              <td className="py-1.5 px-2 text-gw-muted font-mono">
                                {f.standardIII !== null ? f.standardIII : '-'}
                              </td>
                              <td className={`py-1.5 px-2 font-mono font-medium ${
                                f.isExceeded ? 'text-red-400' : 'text-gw-text'
                              }`}>
                                {f.Pi}
                              </td>
                              <td className="py-1.5 px-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${CLASS_BG[f.className] || ''}`}>
                                  {f.classNum > 0 ? `${f.className}类` : '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </TechCard>
            </div>
          )}
        </div>
  );
}
