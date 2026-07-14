import React, { useState, useCallback, useMemo } from 'react';
import { Calculator, Plus, Trash2, Beaker, AlertTriangle, CheckCircle, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { TechCard } from '../UI';
import { groundwaterQualityStandard } from '../../data/waterQuality';
import {
  classifySample,
  sukalovClassification,
  type SampleResult,
  type SukalovInput,
  type SukalovResult,
  type EvaluationFactor,
} from '../../utils/waterQualityCalculator';
import { exportWaterQualityReport } from '../../utils/waterQualityReportExport';

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

interface WaterSample {
  id: string;
  name: string;
  /** { 因子名: 监测值字符串 } */
  values: Record<string, string>;
  /** 苏卡列夫分类的离子浓度输入 */
  sukalovInput: SukalovForm;
  /** 苏卡列夫分类结果 */
  sukalovResult: SukalovResult | null;
}

interface SukalovForm {
  HCO3: string;
  SO4: string;
  Cl: string;
  Ca: string;
  Mg: string;
  Na: string;
}

const EMPTY_SUKALOV_FORM: SukalovForm = {
  HCO3: '', SO4: '', Cl: '', Ca: '', Mg: '', Na: '',
};

// ═══════════════════════════════════════════════════════
// 类别颜色映射
// ═══════════════════════════════════════════════════════


const CLASS_BG: Record<string, string> = {
  'I': 'bg-emerald-500/15 text-emerald-400',
  'II': 'bg-lime-500/15 text-lime-400',
  'III': 'bg-yellow-500/15 text-yellow-400',
  'IV': 'bg-orange-500/15 text-orange-400',
  'V': 'bg-red-500/15 text-red-400',
};

// ═══════════════════════════════════════════════════════
// 组件
// ═══════════════════════════════════════════════════════

export function WaterQualityCalculatorTab() {
  const [activeSection, setActiveSection] = useState<'standard' | 'sukalov'>('standard');
  const [samples, setSamples] = useState<WaterSample[]>([
    { id: '1', name: '水样1', values: {}, sukalovInput: { ...EMPTY_SUKALOV_FORM }, sukalovResult: null },
  ]);
  const [results, setResults] = useState<SampleResult[]>([]);
  const [selectedSukalovSample, setSelectedSukalovSample] = useState<string>('1');

  const factors = groundwaterQualityStandard.evaluationFactors as EvaluationFactor[];

  // ── 水样管理 ──

  const addSample = useCallback(() => {
    const id = String(Date.now());
    setSamples(prev => [...prev, { id, name: `水样${prev.length + 1}`, values: {}, sukalovInput: { ...EMPTY_SUKALOV_FORM }, sukalovResult: null }]);
  }, []);

  const removeSample = useCallback((id: string) => {
    setSamples(prev => prev.length > 1 ? prev.filter(s => s.id !== id) : prev);
  }, []);

  const updateSampleName = useCallback((id: string, name: string) => {
    setSamples(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  }, []);

  const updateSampleValue = useCallback((id: string, factorName: string, value: string) => {
    setSamples(prev => prev.map(s => s.id === id
      ? { ...s, values: { ...s.values, [factorName]: value } }
      : s
    ));
  }, []);

  // ── 标准指数法计算 ──

  const handleCalculate = useCallback(() => {
    const computed: SampleResult[] = [];
    for (const sample of samples) {
      const result = classifySample(sample.name, sample.values, factors);
      computed.push(result);
    }
    setResults(computed);
  }, [samples, factors]);

  // ── 苏卡列夫计算 ──

  const currentSukalovSample = useMemo(
    () => samples.find(s => s.id === selectedSukalovSample),
    [samples, selectedSukalovSample]
  );

  const updateSukalovValue = useCallback((sampleId: string, ion: keyof SukalovForm, value: string) => {
    setSamples(prev => prev.map(s => s.id === sampleId
      ? { ...s, sukalovInput: { ...s.sukalovInput, [ion]: value } }
      : s
    ));
  }, []);

  const handleSukalovCalculate = useCallback(() => {
    if (!currentSukalovSample) return;
    const form = currentSukalovSample.sukalovInput;
    const input: SukalovInput = {
      HCO3: parseFloat(form.HCO3) || 0,
      SO4: parseFloat(form.SO4) || 0,
      Cl: parseFloat(form.Cl) || 0,
      Ca: parseFloat(form.Ca) || 0,
      Mg: parseFloat(form.Mg) || 0,
      Na: parseFloat(form.Na) || 0,
    };
    const result = sukalovClassification(input);
    setSamples(prev => prev.map(s => s.id === currentSukalovSample.id
      ? { ...s, sukalovResult: result }
      : s
    ));
  }, [currentSukalovSample]);

  // ── 选择显示的因子（排除感官性状中不可计算的） ──

  const numericFactors = useMemo(() =>
    factors.filter(f => f.name === 'pH' || f.type !== '感官性状'),
    [factors]
  );

  return (
    <div className="space-y-4">
      {/* 切换面板 */}
      <div className="flex gap-2">
        <button onClick={() => setActiveSection('standard')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all
            ${activeSection === 'standard'
              ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
              : 'text-gw-muted hover:text-gw-text bg-gw-surface border border-transparent'}`}>
          <Calculator size={14} />
          标准指数法
        </button>
        <button onClick={() => setActiveSection('sukalov')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all
            ${activeSection === 'sukalov'
              ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
              : 'text-gw-muted hover:text-gw-text bg-gw-surface border border-transparent'}`}>
          <Beaker size={14} />
          苏卡列夫分类
        </button>
      </div>

      {/* ═══ 标准指数法面板 ═══ */}
      {activeSection === 'standard' && (
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
                onClick={() => {
                  const sukalovResults = samples
                    .filter(s => s.sukalovResult !== null)
                    .map(s => ({ name: s.name, result: s.sukalovResult! }));
                  exportWaterQualityReport(results, sukalovResults);
                }}
                disabled={results.length === 0 && !samples.some(s => s.sukalovResult)}
                className="flex items-center gap-1 text-xs bg-sky-600/15 text-sky-400 border border-sky-500/20 hover:bg-sky-600/25 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded transition-colors"
                title="导出为Excel文件">
                <FileSpreadsheet size={14} /> 导出报告
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
      )}

      {/* ═══ 苏卡列夫分类面板 ═══ */}
      {activeSection === 'sukalov' && (
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
                onClick={() => exportWaterQualityReport(results, samples
                  .filter(s => s.sukalovResult !== null)
                  .map(s => ({ name: s.name, result: s.sukalovResult! })))}
                disabled={results.length === 0 && !samples.some(s => s.sukalovResult)}
                className="flex items-center gap-1 text-xs bg-sky-600/15 text-sky-400 border border-sky-500/20 hover:bg-sky-600/25 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1 rounded transition-colors"
                title="导出为Excel文件">
                <FileSpreadsheet size={14} /> 导出报告
              </button>
            </div>
          </TechCard>

          {/* 苏卡列夫结果 */}
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
      )}
    </div>
  );
}
