import { useRef, useLayoutEffect } from 'react';
import { useModelStore, MODEL_PRESETS, type ModelType } from '../../stores/modelStore';
import { useVisualizationStore, type LightConeMode } from '../../stores/visualizationStore';
import { useUIStore } from '../../stores/uiStore';
import { useNarrationStore } from '../../stores/narrationStore';
import ComparisonPanel from './ComparisonPanel';

/* ============================================
   SVG Icons — Inline, no external deps
   ============================================ */
function CubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function LayersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function SlidersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CompareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="8" height="18" rx="1.5" />
      <rect x="14" y="3" width="8" height="18" rx="1.5" />
      <path d="M10 8h4M10 12h4M10 16h4" strokeDasharray="2 2" />
    </svg>
  );
}

/* ============================================
   Constants
   ============================================ */
const MODEL_TYPE_LABELS: Record<ModelType, string> = {
  ann: 'Artificial Neural Networks',
  cnn: 'Convolutional Neural Networks',
  llm: 'Large Language Models',
};

const MODEL_TYPE_SHORT: Record<ModelType, string> = {
  ann: 'ANN',
  cnn: 'CNN',
  llm: 'LLM',
};

const MODEL_TYPE_COLORS: Record<ModelType, string> = {
  ann: 'var(--accent-purple)',
  cnn: 'var(--accent-orange)',
  llm: 'var(--accent-blue)',
};

const MODEL_TYPE_GLOWS: Record<ModelType, string> = {
  ann: 'rgba(179, 136, 255, 0.25)',
  cnn: 'rgba(255, 171, 64, 0.25)',
  llm: 'rgba(79, 195, 247, 0.25)',
};

const LAYER_TYPE_COLORS: Record<string, string> = {
  input: 'var(--accent-blue)',
  hidden: 'var(--accent-purple)',
  output: 'var(--accent-green)',
  conv2d: 'var(--accent-orange)',
  maxpool: '#ffab40',
  avgpool: '#ffab40',
  batchnorm: '#90a4ae',
  flatten: '#80deea',
  dense: 'var(--accent-purple)',
  dropout: 'var(--accent-red)',
  embedding: '#ce93d8',
  positional_encoding: '#ce93d8',
  attention: '#f48fb1',
  feed_forward: '#80cbc4',
  layer_norm: '#90a4ae',
};

/* ============================================
   Precomputed layer counts for preset badges
   ============================================ */
const PRESET_LAYER_COUNTS: Record<string, number> = {};
MODEL_PRESETS.forEach((p) => {
  try {
    PRESET_LAYER_COUNTS[p.id] = p.create().layers.length;
  } catch {
    PRESET_LAYER_COUNTS[p.id] = 0;
  }
});

/* ============================================
   Models Tab
   ============================================ */
function ModelsTab() {
  const loadPreset = useModelStore((s) => s.loadPreset);
  const currentPresetId = useModelStore((s) => s.currentPresetId);
  const groups = (['ann', 'cnn', 'llm'] as ModelType[]).map((type) => ({
    type,
    presets: MODEL_PRESETS.filter((p) => p.type === type),
  }));

  return (
    <div className="flex flex-col gap-7">
      {groups.map(({ type, presets }) => (
        <div key={type}>
          <h3
            className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3.5 flex items-center gap-2.5 pb-2"
            style={{
              color: MODEL_TYPE_COLORS[type],
              borderBottom: `1px solid color-mix(in srgb, ${MODEL_TYPE_COLORS[type]} 15%, transparent)`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: MODEL_TYPE_COLORS[type], boxShadow: `0 0 8px ${MODEL_TYPE_GLOWS[type]}` }}
            />
            {MODEL_TYPE_LABELS[type]}
          </h3>
          <div className="flex flex-col gap-1.5">
            {presets.map((preset) => {
              const isActive = currentPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.id)}
                  className={`preset-card preset-card-${type} w-full text-left px-4 py-3.5 rounded-xl cursor-pointer ${isActive ? 'preset-card-active' : ''}`}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, color-mix(in srgb, ${MODEL_TYPE_COLORS[type]} 14%, transparent), color-mix(in srgb, ${MODEL_TYPE_COLORS[type]} 6%, transparent))`
                      : undefined,
                    border: isActive
                      ? `1px solid color-mix(in srgb, ${MODEL_TYPE_COLORS[type]} 45%, transparent)`
                      : undefined,
                    ['--preset-color' as string]: MODEL_TYPE_COLORS[type],
                    ['--preset-glow' as string]: MODEL_TYPE_GLOWS[type],
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="text-[13px] font-semibold leading-tight"
                      style={{ color: isActive ? MODEL_TYPE_COLORS[type] : 'var(--text-primary)' }}
                    >
                      {preset.name}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
                        style={{
                          color: 'var(--text-muted)',
                          background: 'rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        {PRESET_LAYER_COUNTS[preset.id]}L
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase"
                        style={{
                          color: MODEL_TYPE_COLORS[type],
                          background: `color-mix(in srgb, ${MODEL_TYPE_COLORS[type]} 10%, transparent)`,
                        }}
                      >
                        {MODEL_TYPE_SHORT[type]}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>
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

/* ============================================
   Layers Tab
   ============================================ */
function LayersTab() {
  const currentModel = useModelStore((s) => s.currentModel);
  const selectedLayerId = useVisualizationStore((s) => s.selectedLayerId);
  const selectLayer = useVisualizationStore((s) => s.selectLayer);

  if (!currentModel) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Load a model to see its layers
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-center justify-between mb-3 pb-2"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {currentModel.name}
        </p>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full"
          style={{
            color: 'var(--accent-blue)',
            background: 'rgba(79, 195, 247, 0.1)',
          }}
        >
          {currentModel.layers.length} layers
        </span>
      </div>
      {currentModel.layers.map((layer, index) => {
        const isSelected = selectedLayerId === layer.id;
        const label = layer.label || layer.id;
        const dotColor = LAYER_TYPE_COLORS[layer.type] ?? 'var(--text-muted)';

        return (
          <button
            key={layer.id}
            onClick={() => selectLayer(isSelected ? null : layer.id)}
            className="w-full text-left px-3 py-2.5 rounded-xl cursor-pointer flex items-center gap-2.5 group"
            style={{
              background: isSelected
                ? 'rgba(179, 136, 255, 0.12)'
                : 'rgba(255, 255, 255, 0.015)',
              border: isSelected
                ? '1px solid rgba(179, 136, 255, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.04)',
              boxShadow: isSelected
                ? '0 0 16px rgba(179, 136, 255, 0.12)'
                : 'none',
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Index number */}
            <span
              className="text-[10px] font-mono w-5 text-center shrink-0 rounded-md py-0.5"
              style={{
                color: isSelected ? 'var(--accent-purple)' : 'var(--text-muted)',
                background: isSelected ? 'rgba(179, 136, 255, 0.08)' : 'transparent',
              }}
            >
              {index}
            </span>

            {/* Colored dot */}
            <span
              className="layer-dot"
              style={{ color: dotColor, background: dotColor }}
            />

            {/* Label & type */}
            <div className="min-w-0 flex-1">
              <div
                className="text-[13px] truncate leading-tight"
                style={{ color: isSelected ? 'var(--accent-purple)' : 'var(--text-primary)' }}
              >
                {label}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {layer.type.replace('_', ' ')}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================
   Settings Tab
   ============================================ */
function SettingsTab() {
  const glowIntensity = useVisualizationStore((s) => s.glowIntensity);
  const setGlowIntensity = useVisualizationStore((s) => s.setGlowIntensity);
  const neuronSize = useVisualizationStore((s) => s.neuronSize);
  const setNeuronSize = useVisualizationStore((s) => s.setNeuronSize);
  const connectionOpacity = useVisualizationStore((s) => s.connectionOpacity);
  const setConnectionOpacity = useVisualizationStore((s) => s.setConnectionOpacity);
  const showWeights = useVisualizationStore((s) => s.showWeights);
  const toggleWeights = useVisualizationStore((s) => s.toggleWeights);
  const showActivations = useVisualizationStore((s) => s.showActivations);
  const toggleActivations = useVisualizationStore((s) => s.toggleActivations);
  const showLabels = useVisualizationStore((s) => s.showLabels);
  const toggleLabels = useVisualizationStore((s) => s.toggleLabels);
  const showDataFlow = useVisualizationStore((s) => s.showDataFlow);
  const toggleDataFlow = useVisualizationStore((s) => s.toggleDataFlow);
  const lightConeEnabled = useVisualizationStore((s) => s.lightConeEnabled);
  const toggleLightCone = useVisualizationStore((s) => s.toggleLightCone);
  const lightConeMode = useVisualizationStore((s) => s.lightConeMode);
  const setLightConeMode = useVisualizationStore((s) => s.setLightConeMode);
  const lightConeDepth = useVisualizationStore((s) => s.lightConeDepth);
  const setLightConeDepth = useVisualizationStore((s) => s.setLightConeDepth);

  const voiceEnabled = useNarrationStore((s) => s.voiceEnabled);
  const toggleVoice = useNarrationStore((s) => s.toggleVoice);
  const voiceRate = useNarrationStore((s) => s.voiceRate);
  const setVoiceRate = useNarrationStore((s) => s.setVoiceRate);
  const voiceVolume = useNarrationStore((s) => s.voiceVolume);
  const setVoiceVolume = useNarrationStore((s) => s.setVoiceVolume);

  const CONE_MODES: { value: LightConeMode; label: string }[] = [
    { value: 'forward', label: 'Forward' },
    { value: 'backward', label: 'Backward' },
    { value: 'both', label: 'Both' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Sliders section */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4" />
          </svg>
          Visual Controls
        </h4>
        <div className="flex flex-col gap-5">
          <SliderSetting label="Glow Intensity" value={glowIntensity} min={0} max={1} step={0.05} onChange={setGlowIntensity} />
          <SliderSetting label="Neuron Size" value={neuronSize} min={0.5} max={2.0} step={0.1} onChange={setNeuronSize} />
          <SliderSetting label="Connection Opacity" value={connectionOpacity} min={0} max={1} step={0.05} onChange={setConnectionOpacity} />
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {/* Toggles section */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M3 9h18" />
          </svg>
          Display Options
        </h4>
        <div className="flex flex-col gap-3.5">
          <ToggleSetting label="Show Weights" checked={showWeights} onChange={toggleWeights} />
          <ToggleSetting label="Show Activations" checked={showActivations} onChange={toggleActivations} />
          <ToggleSetting label="Show Labels" checked={showLabels} onChange={toggleLabels} />
          <ToggleSetting label="Data Flow" checked={showDataFlow} onChange={toggleDataFlow} />
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {/* Cognitive Light Cone section */}
      <div>
        <h4
          className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4 flex items-center gap-2"
          style={{ color: lightConeEnabled ? '#00e5ff' : 'var(--text-secondary)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 1 L2 11 L10 11 Z" />
            <circle cx="6" cy="4" r="1" fill="currentColor" />
          </svg>
          Cognitive Light Cone
        </h4>

        <div className="flex flex-col gap-4">
          <ToggleSetting label="Enable Light Cone" checked={lightConeEnabled} onChange={toggleLightCone} />

          {lightConeEnabled && (
            <>
              {/* Mode selector */}
              <div>
                <span className="text-[12px] font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Cone Direction
                </span>
                <div className="flex gap-1.5">
                  {CONE_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setLightConeMode(mode.value)}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all duration-200"
                      style={{
                        background: lightConeMode === mode.value
                          ? mode.value === 'forward' ? 'rgba(0, 229, 255, 0.15)'
                          : mode.value === 'backward' ? 'rgba(213, 0, 249, 0.15)'
                          : 'rgba(124, 77, 255, 0.15)'
                          : 'rgba(255, 255, 255, 0.04)',
                        color: lightConeMode === mode.value
                          ? mode.value === 'forward' ? '#00e5ff'
                          : mode.value === 'backward' ? '#d500f9'
                          : '#7c4dff'
                          : 'var(--text-muted)',
                        border: lightConeMode === mode.value
                          ? `1px solid ${mode.value === 'forward' ? '#00e5ff' : mode.value === 'backward' ? '#d500f9' : '#7c4dff'}`
                          : '1px solid var(--border)',
                      }}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Depth slider */}
              <SliderSetting
                label="Cone Depth (Layers)"
                value={lightConeDepth}
                min={1}
                max={10}
                step={1}
                onChange={setLightConeDepth}
              />

              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Select a layer to see its information propagation cone. Press <kbd className="kbd-key" style={{ fontSize: '9px', padding: '1px 5px', minWidth: '18px', borderBottomWidth: '2px' }}>C</kbd> to toggle.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider" />

      {/* Voice Narration section */}
      <div>
        <h4
          className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4 flex items-center gap-2"
          style={{ color: voiceEnabled ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          Voice Narration
        </h4>

        <div className="flex flex-col gap-4">
          <ToggleSetting label="Enable Voice" checked={voiceEnabled} onChange={toggleVoice} />

          {voiceEnabled && (
            <>
              <SliderSetting
                label="Voice Speed"
                value={voiceRate}
                min={0.5}
                max={2.0}
                step={0.1}
                onChange={setVoiceRate}
              />

              <SliderSetting
                label="Voice Volume"
                value={voiceVolume}
                min={0}
                max={1}
                step={0.05}
                onChange={setVoiceVolume}
              />

              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Voice narration uses the Web Speech API built into your browser. Press <kbd className="kbd-key" style={{ fontSize: '9px', padding: '1px 5px', minWidth: '18px', borderBottomWidth: '2px' }}>V</kbd> to toggle.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Slider Setting — Modern styled
   ============================================ */
function SliderSetting({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span
          className="text-[11px] font-mono px-1.5 py-0.5 rounded-md"
          style={{
            color: 'var(--accent-blue)',
            background: 'rgba(79, 195, 247, 0.08)',
          }}
        >
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--accent-blue) ${pct}%, rgba(255,255,255,0.06) ${pct}%)`,
        }}
      />
    </div>
  );
}

/* ============================================
   Toggle Setting — Premium switch
   ============================================ */
function ToggleSetting({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between cursor-pointer group">
      <span
        className="text-[13px]"
        style={{ color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <button
        onClick={onChange}
        className="toggle-track"
        data-checked={checked}
        style={{
          background: checked ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.08)',
        }}
        aria-checked={checked}
        role="switch"
      />
    </div>
  );
}

/* ============================================
   Tab Configuration
   ============================================ */
type TabId = 'models' | 'layers' | 'settings' | 'compare';

const TABS: { id: TabId; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'models', label: 'Models', Icon: CubeIcon },
  { id: 'layers', label: 'Layers', Icon: LayersIcon },
  { id: 'settings', label: 'Settings', Icon: SlidersIcon },
  { id: 'compare', label: 'Compare', Icon: CompareIcon },
];

/* ============================================
   Main Sidebar Component
   ============================================ */
export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const sidebarTab = useUIStore((s) => s.sidebarTab);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarTab = useUIStore((s) => s.setSidebarTab);

  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Animated tab indicator
  useLayoutEffect(() => {
    if (!tabsRef.current || !indicatorRef.current) return;
    const activeIndex = TABS.findIndex((t) => t.id === sidebarTab);
    const tabElements = tabsRef.current.querySelectorAll('[data-tab]');
    const activeTab = tabElements[activeIndex] as HTMLElement | undefined;
    if (activeTab) {
      indicatorRef.current.style.left = `${activeTab.offsetLeft}px`;
      indicatorRef.current.style.width = `${activeTab.offsetWidth}px`;
    }
  }, [sidebarTab]);

  return (
    <div className="fixed top-0 left-0 h-full z-40 flex">
      {/* Sidebar panel */}
      <div
        className="sidebar-container h-full flex flex-col overflow-hidden"
        style={{
          width: '290px',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          borderRight: '1px solid var(--border)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          className="sidebar-content flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.18), rgba(179, 136, 255, 0.18))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 0 16px rgba(79, 195, 247, 0.1)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Controls</h2>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Configure visualization</p>
              </div>
            </div>
            {/* Gradient line below header */}
            <div className="section-divider mt-4" />
          </div>

          {/* Tab bar */}
          <div
            className="relative flex shrink-0 px-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div ref={tabsRef} className="flex w-full">
              {TABS.map((tab) => {
                const isActive = sidebarTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-tab={tab.id}
                    onClick={() => setSidebarTab(tab.id)}
                    className="flex-1 py-2.5 text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1.5"
                    style={{
                      color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                      background: 'transparent',
                      border: 'none',
                      transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <tab.Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Sliding indicator */}
            <div ref={indicatorRef} className="tab-indicator" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {sidebarTab === 'models' && <ModelsTab />}
            {sidebarTab === 'layers' && <LayersTab />}
            {sidebarTab === 'settings' && <SettingsTab />}
            {sidebarTab === 'compare' && <ComparisonPanel />}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3.5 shrink-0"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md" style={{ color: 'var(--accent-blue)', background: 'rgba(79, 195, 247, 0.08)' }}>
                  v1.0
                </span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>3D Neural Viz</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Press</span>
                <kbd className="kbd-key" style={{ fontSize: '9px', padding: '1px 5px', minWidth: '18px', borderBottomWidth: '2px' }}>?</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="self-start mt-5 w-8 h-8 flex items-center justify-center rounded-r-xl cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, var(--bg-panel), var(--bg-secondary))',
          border: '1px solid var(--border)',
          borderLeft: 'none',
          color: 'var(--text-secondary)',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.2)',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </button>
    </div>
  );
}
