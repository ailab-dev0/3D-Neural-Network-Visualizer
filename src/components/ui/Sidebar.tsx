import { useModelStore, MODEL_PRESETS, type ModelType } from '../../stores/modelStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useUIStore } from '../../stores/uiStore';

const MODEL_TYPE_LABELS: Record<ModelType, string> = {
  ann: 'Artificial Neural Networks',
  cnn: 'Convolutional Neural Networks',
  llm: 'Large Language Models',
};

const MODEL_TYPE_COLORS: Record<ModelType, string> = {
  ann: 'var(--accent-purple)',
  cnn: 'var(--accent-orange)',
  llm: 'var(--accent-blue)',
};

function ModelsTab() {
  const { loadPreset, currentPresetId } = useModelStore();
  const groups = (['ann', 'cnn', 'llm'] as ModelType[]).map((type) => ({
    type,
    presets: MODEL_PRESETS.filter((p) => p.type === type),
  }));

  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ type, presets }) => (
        <div key={type}>
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: MODEL_TYPE_COLORS[type] }}
          >
            {MODEL_TYPE_LABELS[type]}
          </h3>
          <div className="flex flex-col gap-1">
            {presets.map((preset) => {
              const isActive = currentPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.id)}
                  className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                  style={{
                    background: isActive ? 'rgba(79, 195, 247, 0.15)' : 'transparent',
                    border: isActive ? '1px solid var(--accent-blue)' : '1px solid transparent',
                  }}
                >
                  <div
                    className="text-sm font-medium"
                    style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)' }}
                  >
                    {preset.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LayersTab() {
  const currentModel = useModelStore((s) => s.currentModel);
  const { selectedLayerId, selectLayer } = useVisualizationStore();

  if (!currentModel) {
    return (
      <div className="flex items-center justify-center h-32" style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm text-center">Load a model to see its layers</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
        {currentModel.name} &mdash; {currentModel.layers.length} layers
      </p>
      {currentModel.layers.map((layer, index) => {
        const isSelected = selectedLayerId === layer.id;
        const label = layer.label || layer.id;

        return (
          <button
            key={layer.id}
            onClick={() => selectLayer(isSelected ? null : layer.id)}
            className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
            style={{
              background: isSelected ? 'rgba(179, 136, 255, 0.15)' : 'transparent',
              border: isSelected ? '1px solid var(--accent-purple)' : '1px solid transparent',
            }}
          >
            <span
              className="text-xs font-mono w-5 text-center shrink-0"
              style={{ color: 'var(--text-muted)' }}
            >
              {index}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="text-sm truncate"
                style={{ color: isSelected ? 'var(--accent-purple)' : 'var(--text-primary)' }}
              >
                {label}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {layer.type}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SettingsTab() {
  const {
    glowIntensity, setGlowIntensity,
    neuronSize, setNeuronSize,
    connectionOpacity, setConnectionOpacity,
    showWeights, toggleWeights,
    showActivations, toggleActivations,
    showLabels, toggleLabels,
    showDataFlow, toggleDataFlow,
  } = useVisualizationStore();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <SliderSetting label="Glow Intensity" value={glowIntensity} min={0} max={1} step={0.05} onChange={setGlowIntensity} />
        <SliderSetting label="Neuron Size" value={neuronSize} min={0.5} max={2.0} step={0.1} onChange={setNeuronSize} />
        <SliderSetting label="Connection Opacity" value={connectionOpacity} min={0} max={1} step={0.05} onChange={setConnectionOpacity} />
      </div>

      <div className="h-px" style={{ background: 'var(--border)' }} />

      <div className="flex flex-col gap-3">
        <ToggleSetting label="Show Weights" checked={showWeights} onChange={toggleWeights} />
        <ToggleSetting label="Show Activations" checked={showActivations} onChange={toggleActivations} />
        <ToggleSetting label="Show Labels" checked={showLabels} onChange={toggleLabels} />
        <ToggleSetting label="Data Flow" checked={showDataFlow} onChange={toggleDataFlow} />
      </div>
    </div>
  );
}

function SliderSetting({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-xs font-mono" style={{ color: 'var(--accent-blue)' }}>{value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--accent-blue) ${((value - min) / (max - min)) * 100}%, var(--border) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </div>
  );
}

function ToggleSetting({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <button
        onClick={onChange}
        className="relative w-9 h-5 rounded-full transition-colors duration-200"
        style={{ background: checked ? 'var(--accent-blue)' : 'var(--border)' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200"
          style={{
            background: 'var(--text-primary)',
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </button>
    </label>
  );
}

type TabId = 'models' | 'layers' | 'settings';
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'models', label: 'Models', icon: '\u25A6' },
  { id: 'layers', label: 'Layers', icon: '\u2630' },
  { id: 'settings', label: 'Settings', icon: '\u2699' },
];

export default function Sidebar() {
  const { sidebarOpen, sidebarTab, toggleSidebar, setSidebarTab } = useUIStore();

  return (
    <div className="fixed top-0 left-0 h-full z-50 flex">
      <div
        className="h-full flex flex-col transition-all duration-300 overflow-hidden"
        style={{
          width: sidebarOpen ? '280px' : '0px',
          background: 'var(--bg-secondary)',
          borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="p-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Controls</h2>
        </div>

        <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          {TABS.map((tab) => {
            const isActive = sidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id)}
                className="flex-1 py-2 text-xs font-medium transition-colors duration-200 cursor-pointer"
                style={{
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                }}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sidebarTab === 'models' && <ModelsTab />}
          {sidebarTab === 'layers' && <LayersTab />}
          {sidebarTab === 'settings' && <SettingsTab />}
        </div>
      </div>

      <button
        onClick={toggleSidebar}
        className="self-start mt-4 w-8 h-8 flex items-center justify-center rounded-r-lg cursor-pointer transition-colors duration-200"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderLeft: 'none',
          color: 'var(--text-secondary)',
        }}
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <span className="text-sm">{sidebarOpen ? '\u25C0' : '\u25B6'}</span>
      </button>
    </div>
  );
}
