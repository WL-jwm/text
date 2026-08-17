import React, { useState } from 'react';
import { Settings, Waves, Crosshair, BookOpen, Layers } from 'lucide-react';
import { PRESET_MODEL_AREAS, type SimulationConfig, type PumpingWell } from '../../utils/numericalFlowSimulator';
import { ModelSetupPanel } from './sim-model-setup';
import { FlowSimulationPanel } from './sim-flow';
import { CalibrationPanel } from './sim-calibration';
import { ScenarioPanel } from './sim-scenario';
import { ReferencePanel } from './sim-reference';

export function NumericalFlowSimulatorTab() {
  const [activePanel, setActivePanel] = useState<number>(0);

  const [areaId, setAreaId] = useState<string>('taihang-piedmont');
  const initialArea = PRESET_MODEL_AREAS[0];
  const [config, setConfig] = useState<SimulationConfig>({
    grid: { ...initialArea.grid },
    aquifer: { ...initialArea.aquifer },
    boundary: { ...initialArea.boundary },
    wells: [...initialArea.wells],
    initialHead: initialArea.initialHead,
    isTransient: false,
    maxIterations: 500,
    convergenceTolerance: 0.01,
    sorFactor: 1.5,
  });
  const [wells, setWells] = useState<PumpingWell[]>([...initialArea.wells]);

  const panels = [
    { key: 0, label: '模型设置', icon: Settings },
    { key: 1, label: '流场模拟', icon: Waves },
    { key: 2, label: '反演校准', icon: Crosshair },
    { key: 3, label: '情景预测', icon: BookOpen },
    { key: 4, label: '参考说明', icon: Layers },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activePanel === p.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 0 && (
        <ModelSetupPanel
          areaId={areaId}
          setAreaId={setAreaId}
          config={config}
          setConfig={setConfig}
          wells={wells}
          setWells={setWells}
        />
      )}
      {activePanel === 1 && <FlowSimulationPanel config={config} wells={wells} />}
      {activePanel === 2 && <CalibrationPanel config={config} areaId={areaId} />}
      {activePanel === 3 && <ScenarioPanel config={config} wells={wells} />}
      {activePanel === 4 && <ReferencePanel />}
    </div>
  );
}
