import React, { useState, useCallback, useMemo } from 'react';
import { Calculator, Beaker } from 'lucide-react';
import { PipelinePanel } from '../PipelinePanel';
import { usePipeline } from '../../hooks/usePipeline';
import { groundwaterQualityStandard } from '../../data/waterQuality';
import {
  classifySample,
  sukalovClassification,
  type SampleResult,
  type SukalovInput,
  type EvaluationFactor,
} from '../../utils/waterQualityCalculator';
import { type WaterSample, type SukalovForm, EMPTY_SUKALOV_FORM } from './waterQualityPanels/waterQualityConstants';
import { StandardSection } from './waterQualityPanels/StandardSection';
import { SukalovSection } from './waterQualityPanels/SukalovSection';

export function WaterQualityCalculatorTab() {
  const [activeSection, setActiveSection] = useState<'standard' | 'sukalov'>('standard');
  const [samples, setSamples] = useState<WaterSample[]>([
    { id: '1', name: '水样1', values: {}, sukalovInput: { ...EMPTY_SUKALOV_FORM }, sukalovResult: null },
  ]);
  const [results, setResults] = useState<SampleResult[]>([]);
  const { publishData } = usePipeline('waterQuality');
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
    // 发布到数据总线
    const factorsData = samples.map(s => ({
      sampleName: s.name,
      factors: Object.entries(s.values)
        .filter(([, v]) => v !== '' && !isNaN(Number(v)))
        .map(([name, v]) => ({ factor: name, value: Number(v) }))
        .filter(f => f.value > 0),
    })).flatMap(s => s.factors);
    if (factorsData.length > 0) {
      publishData('waterQualityFactors', `水质评价结果(${samples.length}个水样)`, { factors: factorsData, sampleCount: samples.length });
    }
  }, [samples, factors, publishData]);

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
      <StandardSection
        samples={samples}
        results={results}
        numericFactors={numericFactors}
        addSample={addSample}
        removeSample={removeSample}
        updateSampleName={updateSampleName}
        updateSampleValue={updateSampleValue}
        handleCalculate={handleCalculate}
      />

      {/* ═══ 苏卡列夫分类面板 ═══ */}
      <SukalovSection
        samples={samples}
        results={results}
        selectedSukalovSample={selectedSukalovSample}
        setSelectedSukalovSample={setSelectedSukalovSample}
        currentSukalovSample={currentSukalovSample}
        updateSukalovValue={updateSukalovValue}
        handleSukalovCalculate={handleSukalovCalculate}
      />
      <PipelinePanel moduleId="waterQuality" onPublish={() => {
        const factorsData = samples.map(s => ({
          sampleName: s.name,
          factors: Object.entries(s.values)
            .filter(([, v]) => v !== '' && !isNaN(Number(v)))
            .map(([name, v]) => ({ factor: name, value: Number(v) }))
            .filter(f => f.value > 0),
        })).flatMap(s => s.factors);
        if (factorsData.length > 0) {
          publishData('waterQualityFactors', `水质评价结果(${samples.length}个水样)`, { factors: factorsData, sampleCount: samples.length });
        }
      }} />
    </div>
  );
}