import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AQUIFER_LABELS } from '../../services/wellNetwork';
import type { Well, AquiferType } from '../../services/wellNetwork';
import type { DataChannel } from '../../services/realtimeDataService';
import { AQUIFER_TYPES, CHANNELS, CHANNEL_LABELS } from './constants';

export function AddWellForm({ onAdd, onClose }: {
  onAdd: (well: Omit<Well, 'id'>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('石家庄');
  const [latitude, setLatitude] = useState(38.0);
  const [longitude, setLongitude] = useState(114.5);
  const [aquiferType, setAquiferType] = useState<AquiferType>('shallowPorous');
  const [depth, setDepth] = useState(100);
  const [indicator, setIndicator] = useState<DataChannel>('waterLevel');
  const [builtYear, setBuiltYear] = useState(2024);

  const cities = ['石家庄', '保定', '沧州', '衡水', '邢台', '廊坊', '邯郸', '秦皇岛', '承德', '张家口', '唐山'];

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      city,
      latitude,
      longitude,
      aquiferType,
      depth,
      indicators: [indicator],
      status: 'active',
      builtYear,
    });
    onClose();
  };

  return (
    <div className="border border-gw-cyan/30 rounded-lg bg-gw-surface/10 p-2.5 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gw-text">
        <Plus size={12} className="text-gw-cyan" />
        新增监测井
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">井名 *</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="如：唐山监测站"
            className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none focus:border-gw-cyan/50"
          />
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">城市</span>
          <select value={city} onChange={e => setCity(e.target.value)} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none">
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">纬度</span>
          <input type="number" value={latitude} onChange={e => setLatitude(Number(e.target.value))} step="0.01" className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none" />
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">经度</span>
          <input type="number" value={longitude} onChange={e => setLongitude(Number(e.target.value))} step="0.01" className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none" />
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">含水层</span>
          <select value={aquiferType} onChange={e => setAquiferType(e.target.value as AquiferType)} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none">
            {AQUIFER_TYPES.map(t => <option key={t} value={t}>{AQUIFER_LABELS[t]}</option>)}
          </select>
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">井深(m)</span>
          <input type="number" value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none" />
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">监测指标</span>
          <select value={indicator} onChange={e => setIndicator(e.target.value as DataChannel)} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none">
            {CHANNELS.map(c => <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>)}
          </select>
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">建成年份</span>
          <input type="number" value={builtYear} onChange={e => setBuiltYear(Number(e.target.value))} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none" />
        </label>
      </div>

      <div className="flex justify-end gap-1.5 pt-1">
        <button onClick={onClose} className="px-2 py-1 text-[9px] text-gw-muted hover:text-gw-text transition-colors">取消</button>
        <button onClick={handleSubmit} className="px-2.5 py-1 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors">保存</button>
      </div>
    </div>
  );
}

// ── 主组件 ──

