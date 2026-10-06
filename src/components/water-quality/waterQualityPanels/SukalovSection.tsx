/**
 * 苏卡列夫分类面板（拆分自 WaterQualityCalculatorTab.tsx）
 */
import { Beaker, FileSpreadsheet, FileText } from 'lucide-react';
import { TechCard } from '../../UI';
import { exportStyledWaterQualityReport } from '../../../utils/waterQualityReportStyled';
import { generateWaterQualityReport } from '../../../utils/waterQualityReportWord';
import { type SampleResult } from '../../../utils/waterQualityCalculator';
import { type WaterSample, type SukalovForm } from './waterQualityConstants';

interface SukalovSectionProps {
  samples: WaterSample[];
  results: SampleResult[];
  selectedSukalovSample: string;
  setSelectedSukalovSample: (id: string) => void;
  currentSukalovSample: WaterSample | undefined;
  updateSukalovValue: (sampleId: string, ion: keyof SukalovForm, value: string) => void;
  handleSukalovCalculate: () => void;
}

export function SukalovSection({ samples, results, selectedSukalovSample, setSelectedSukalovSample, currentSukalovSample, updateSukalovValue, handleSukalovCalculate }: SukalovSectionProps) {
  return (
        <div className="space-y-4">
          {/* 操作栏 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gw-muted">
              选择水样并输入6种主要离子浓度(mg/L)，与标准指数法共享水样列表
            </span>
            <div className="flex gap-2">
              <select
                value={selectedSukalovSample}
                onChange={e => setSelectedSukalovSample(e.target.value)}
                className="bg-gw-surface/50 border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text
                  focus:border-gw-highlight/50 focus:outline-none"
              >
                {samples.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <TechCard title={currentSukalovSample ? `苏卡列夫分类 — ${currentSukalovSample.name}` : '苏卡列夫水化学分类'}>
            <p className="text-[10px] text-gw-muted mb-3 italic">
              输入6种主要离子浓度(mg/L)，自动计算毫当量浓度和百分当量，进行苏卡列夫分类。{'>'}25%ep的离子纳入水化学类型命名。
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* 阴离子 */}
              {(
                [
                  { key: 'HCO3' as const, label: 'HCO₃⁻', desc: '重碳酸根' },
                  { key: 'SO4' as const, label: 'SO₄²⁻', desc: '硫酸根' },
                  { key: 'Cl' as const, label: 'Cl⁻', desc: '氯离子' },
                  { key: 'Ca' as const, label: 'Ca²⁺', desc: '钙' },
                  { key: 'Mg' as const, label: 'Mg²⁺', desc: '镁' },
                  { key: 'Na' as const, label: 'Na⁺', desc: '钠' },
                ]
              ).map(ion => (
                <div key={ion.key} className="space-y-1">
                  <label className="text-xs text-gw-text font-medium">{ion.label}</label>
                  <span className="block text-[10px] text-gw-muted">{ion.desc} (mg/L)</span>
                  <input
                    value={currentSukalovSample?.sukalovInput[ion.key] ?? ''}
                    onChange={e => updateSukalovValue(selectedSukalovSample, ion.key, e.target.value)}
                    type="number"
                    step="any"
                    className="w-full bg-gw-surface/50 border border-gw-border/30 rounded px-2 py-1.5 text-xs text-gw-text
                      placeholder:text-gw-muted/40 focus:border-gw-highlight/50 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={handleSukalovCalculate}
                className="flex items-center gap-1 text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
                <Beaker size={14} /> 计算分类
              </button>
              <button
                onClick={async () => {
                  await exportStyledWaterQualityReport(results, samples
                    .filter(s => s.sukalovResult !== null)
                    .map(s => ({ name: s.name, result: s.sukalovResult! })));
                }}
                disabled={results.length === 0 && !samples.some(s => s.sukalovResult)}
                className="flex items-center gap-1 text-xs bg-sky-600/15 text-sky-400 border border-sky-500/20 hover:bg-sky-600/25 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded transition-colors"
                title="导出为Excel文件(带样式)">
                <FileSpreadsheet size={14} /> 导出Excel
              </button>
              <button
                onClick={() => generateWaterQualityReport(results, samples
                  .filter(s => s.sukalovResult !== null)
                  .map(s => ({ name: s.name, result: s.sukalovResult! })))}
                disabled={results.length === 0}
                className="flex items-center gap-1 text-xs bg-amber-600/15 text-amber-400 border border-amber-500/20 hover:bg-amber-600/25 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded transition-colors"
                title="生成Word评价报告">
                <FileText size={14} /> 导出Word
              </button>
            </div>
          </TechCard>
          {currentSukalovSample?.sukalovResult && (
            <TechCard title={`分类结果 — ${currentSukalovSample.name}`}>
              <div className="space-y-4">
                {/* 水化学类型 */}
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gw-muted">水化学类型：</div>
                  <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold font-mono ${
                    currentSukalovSample.sukalovResult.type !== '未知-未知'
                      ? 'border-gw-blue/30 bg-gw-blue/10 text-gw-highlight'
                      : 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                  }`}>
                    {currentSukalovSample.sukalovResult.type}
                  </div>
                  {currentSukalovSample.sukalovResult.zone > 0 && (
                    <div className="px-2 py-1 rounded text-xs bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                      分区号: {currentSukalovSample.sukalovResult.zone}
                    </div>
                  )}
                </div>

                {/* 阴离子百分当量 */}
                <div>
                  <h4 className="text-xs font-medium text-gw-text mb-2">阴离子百分当量 (%ep)</h4>
                  <div className="space-y-2">
                    {Object.entries(currentSukalovSample.sukalovResult.anionPercentages).map(([ion, pct]) => {
                      const ionLabel: Record<string, string> = { HCO3: 'HCO₃⁻', SO4: 'SO₄²⁻', Cl: 'Cl⁻' };
                      return (
                        <div key={ion} className="flex items-center gap-3">
                          <span className="text-xs text-gw-text w-16">{ionLabel[ion]}</span>
                          <div className="flex-1 bg-gw-surface/50 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(pct, 100)}%`,
                                backgroundColor: pct > 25 ? '#3b82f6' : '#6b7280',
                              }}
                            />
                          </div>
                          <span className={`text-xs font-mono w-14 text-right ${pct > 25 ? 'text-gw-highlight font-bold' : 'text-gw-muted'}`}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 阳离子百分当量 */}
                <div>
                  <h4 className="text-xs font-medium text-gw-text mb-2">阳离子百分当量 (%ep)</h4>
                  <div className="space-y-2">
                    {Object.entries(currentSukalovSample.sukalovResult.cationPercentages).map(([ion, pct]) => {
                      const ionLabel: Record<string, string> = { Ca: 'Ca²⁺', Mg: 'Mg²⁺', Na: 'Na⁺' };
                      return (
                        <div key={ion} className="flex items-center gap-3">
                          <span className="text-xs text-gw-text w-16">{ionLabel[ion]}</span>
                          <div className="flex-1 bg-gw-surface/50 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(pct, 100)}%`,
                                backgroundColor: pct > 25 ? '#f59e0b' : '#6b7280',
                              }}
                            />
                          </div>
                          <span className={`text-xs font-mono w-14 text-right ${pct > 25 ? 'text-amber-400 font-bold' : 'text-gw-muted'}`}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 优势离子说明 */}
                <div className="flex gap-4 flex-wrap">
                  <div className="text-xs text-gw-muted">
                    阴离子优势: {currentSukalovSample.sukalovResult.anions.length > 0
                      ? currentSukalovSample.sukalovResult.anions.map(a => {
                          const m: Record<string, string> = { HCO3: 'HCO₃', SO4: 'SO₄', Cl: 'Cl' };
                          return m[a] || a;
                        }).join(' > ')
                      : '无'}
                  </div>
                  <div className="text-xs text-gw-muted">
                    阳离子优势: {currentSukalovSample.sukalovResult.cations.length > 0
                      ? currentSukalovSample.sukalovResult.cations.map(c => {
                          const m: Record<string, string> = { Ca: 'Ca', Mg: 'Mg', Na: 'Na' };
                          return m[c] || c;
                        }).join(' > ')
                      : '无'}
                  </div>
                </div>
              </div>
            </TechCard>
          )}
        </div>
  );
}
