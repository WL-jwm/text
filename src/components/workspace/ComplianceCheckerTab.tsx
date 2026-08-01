import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Scale, ShieldCheck, AlertTriangle, BookOpen,
  CheckCircle2, XCircle, FileText,
} from 'lucide-react';
import { TechCard, DataSourceNote, CollapsiblePanel } from '../UI';
import { PipelinePanel } from '../PipelinePanel';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  COMPLIANCE_PRESETS, REGULATIONS, GB14848_STANDARDS,
  calculateCompliance,
} from '../../utils/complianceChecker';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#94a3b8' },
};

const TABS = [
  { key: 'check', label: '合规检查', icon: ShieldCheck },
  { key: 'quality', label: '水质标准', icon: Scale },
  { key: 'laws', label: '法规清单', icon: FileText },
  { key: 'ref', label: '参考说明', icon: BookOpen },
] as const;

type TabKey = typeof TABS[number]['key'];

function StatBox({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-semibold" style={{ color: color || '#06b6d4' }}>
        {value}{unit && <span className="text-xs ml-1 text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

function ComplianceCheckPanel() {
  const [presetId, setPresetId] = useState('drinking_source');
  const preset = COMPLIANCE_PRESETS.find(p => p.id === presetId) || COMPLIANCE_PRESETS[0];
  const result = useMemo(() => calculateCompliance(preset.input), [preset]);
  
  return (
    <div className="space-y-4">
      <PipelinePanel
        moduleId="compliance"
        onReceive={(dataType, payload) => {
          if (dataType === 'waterQualityFactors' && payload.factors) {
            const factors = payload.factors as { factor: string; value: number }[];
            if (factors.length > 0) {
              const factorList = factors.map(f => `${f.factor}: ${f.value} mg/L`).join(', ');
              alert(`已接收水质数据(${factors.length}项因子):\n${factorList}\n\n请切换到合规检查的预设场景并手动更新水质数据。`);
            }
          }
        }}
      />
      <TechCard>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-400">预设场景:</span>
          <select value={presetId} onChange={e => setPresetId(e.target.value)}
            className="bg-slate-800/60 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none">
            {COMPLIANCE_PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="text-xs text-slate-500">{preset.description}</div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="综合合规评分" value={result.totalScore} unit="/100" color={result.totalScore >= 75 ? '#10b981' : '#f59e0b'} />
        <StatBox label="合规等级" value={result.complianceLevel} color={result.totalScore >= 75 ? '#10b981' : '#ef4444'} />
        <StatBox label="水质达标率" value={result.waterQuality.overallCompliance} unit="%" color="#06b6d4" />
        <StatBox label="水质类别" value={result.waterQuality.qualityGrade} unit="类" color="#8b5cf6" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">六维合规评分</h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={result.summary}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="score" name="得分" radius={[4, 4, 0, 0]}>
              {result.summary.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TechCard>
          <h4 className="text-xs font-semibold text-slate-300 mb-2">水质达标明细</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {result.waterQuality.details.map(d => (
              <div key={d.factor} className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
                <span className="text-slate-300">{d.factor}</span>
                <span className="text-slate-400">{d.value} {d.unit}</span>
                <span className="text-slate-400">限值: {d.limit} {d.unit}</span>
                {d.compliant 
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  : <XCircle className="w-3.5 h-3.5 text-red-400" />}
              </div>
            ))}
          </div>
        </TechCard>
        
        <TechCard>
          <h4 className="text-xs font-semibold text-slate-300 mb-2">存在问题</h4>
          <div className="space-y-1">
            {[...result.extractionPermit.issues, ...result.eiaCompliance.issues, ...result.sourceProtection.issues, ...result.pollutionControl.issues, ...result.overdraftManagement.issues].map((issue, i) => (
              <div key={i} className="text-xs text-amber-300 flex items-start gap-1.5 py-0.5">
                <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                {issue}
              </div>
            ))}
            {result.extractionPermit.issues.length === 0 && result.eiaCompliance.issues.length === 0 && result.sourceProtection.issues.length === 0 && result.pollutionControl.issues.length === 0 && result.overdraftManagement.issues.length === 0 && (
              <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 各项检查均合规
              </div>
            )}
          </div>
        </TechCard>
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-2">整改建议</h4>
        <ul className="space-y-1.5">
          {result.recommendations.map((r, i) => (
            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
              <span className="text-cyan-400 font-semibold">{i + 1}.</span>
              {r}
            </li>
          ))}
        </ul>
      </TechCard>
    </div>
  );
}

function QualityStandardPanel() {
  const headers = ['因子', '单位', 'I类', 'II类', 'III类', 'IV类', 'V类'];
  const rows = GB14848_STANDARDS.map(s => [s.factor, s.unit, String(s.I), String(s.II), String(s.III), String(s.IV), String(s.V)]);
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">GB/T 14848-2017 地下水质量标准</h3>
        <FilterableTechTable headers={headers} rows={rows} />
      </TechCard>
      
      <CollapsiblePanel title="标准使用说明" defaultOpen>
        <div className="text-xs text-slate-400 space-y-2">
          <p><strong className="text-slate-300">分类</strong>: I类(优)、II类(良)、III类(较好，可作饮用水源)、IV类(较差，农业工业用)、V类(差)。</p>
          <p><strong className="text-slate-300">评价方法</strong>: 单因子评价法，以最差因子类别作为综合水质类别。</p>
          <p><strong className="text-slate-300">适用范围</strong>: 一般地下水，不适用于地下热水、矿水、盐卤水。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

function LawsPanel() {
  const levelColors: Record<string, string> = {
    '法律': '#ef4444', '行政法规': '#f59e0b', '部门规章': '#06b6d4', '技术标准': '#10b981', '地方性法规': '#8b5cf6',
  };
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">地下水相关法规标准清单</h3>
        <div className="space-y-2">
          {REGULATIONS.map(r => (
            <div key={r.id} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{r.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${levelColors[r.level]}20`, color: levelColors[r.level] }}>{r.level}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${r.status === '现行' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>{r.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{r.issuer} | {r.date}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.keyPoints.map((k, i) => (
                      <span key={i} className="text-xs bg-slate-700/40 px-1.5 py-0.5 rounded text-slate-400">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}

function ReferencePanel() {
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">合规检查框架</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
            <div className="text-sm font-medium text-cyan-400 mb-2">六大检查维度</div>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>1. 水质标准合规 (GB/T 14848-2017)</li>
              <li>2. 取水许可合规 (水法/取水许可制度)</li>
              <li>3. 环评合规 (环评法/HJ 610)</li>
              <li>4. 水源地保护 (保护区划分技术规范)</li>
              <li>5. 污染防治 (水污染防治法/HJ 25)</li>
              <li>6. 超采管理 (地下水管理条例)</li>
            </ul>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
            <div className="text-sm font-medium text-cyan-400 mb-2">评分体系</div>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>水质达标: 25%权重</li>
              <li>取水许可: 15%权重</li>
              <li>环评合规: 20%权重</li>
              <li>水源地保护: 15%权重</li>
              <li>污染防治: 15%权重</li>
              <li>超采管理: 10%权重</li>
            </ul>
          </div>
        </div>
      </TechCard>
      
      <CollapsiblePanel title="参考法规与标准" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p>《中华人民共和国水法》(2016修订) - 取水许可与水资源管理</p>
          <p>《中华人民共和国水污染防治法》(2018) - 地下水污染防治</p>
          <p>《中华人民共和国环境影响评价法》(2018修订) - 建设项目环评</p>
          <p>GB/T 14848-2017 地下水质量标准 - 五类水质评价</p>
          <p>HJ 610-2016 地下水环境影响评价技术导则</p>
          <p>HJ 25.1-2019 建设用地土壤污染状况调查技术导则</p>
          <p>《地下水管理条例》(国务院令第748号, 2021) - 超采治理与取水管控</p>
          <p>《河北省地下水管理条例》(2021修订) - 地方管理细则</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

export function ComplianceCheckerTab() {
  const [activeTab, setActiveTab] = useState<TabKey>('check');
  
  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-100">法规标准合规检查器</h2>
          <span className="text-xs text-slate-500">B-40</span>
        </div>
        <p className="text-xs text-slate-400">
          地下水六大维度合规性检查: 水质标准/取水许可/环评/水源地保护/污染防治/超采管理
        </p>
      </TechCard>
      
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800/60 hover:text-slate-300'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {activeTab === 'check' && <ComplianceCheckPanel />}
      {activeTab === 'quality' && <QualityStandardPanel />}
      {activeTab === 'laws' && <LawsPanel />}
      {activeTab === 'ref' && <ReferencePanel />}
      
      <DataSourceNote source="基于现行法律法规与国家标准, 评分权重参考HJ 610-2016与地下水管理条例" />
    </div>
  );
}
