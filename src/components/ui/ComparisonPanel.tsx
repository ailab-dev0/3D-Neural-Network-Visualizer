import { useMemo } from 'react';
import { useComparisonStore } from '../../stores/comparisonStore';
import { MODEL_PRESETS, type NetworkModel, type ModelType } from '../../stores/modelStore';
import type { ANNModel } from '../../models/ann-schema';
import type { CNNModel } from '../../models/cnn-schema';
import type { LLMModel } from '../../models/llm-schema';

/* ============================================
   Utility: extract comparison metrics from a model
   ============================================ */
interface ModelMetrics {
  name: string;
  type: ModelType;
  description: string;
  totalParameters: number;
  layerCount: number;
  layerTypes: Record<string, number>;
  inputDimension: string;
  outputDimension: string;
}

function getModelMetrics(model: NetworkModel): ModelMetrics {
  const layerTypes: Record<string, number> = {};
  for (const layer of model.layers) {
    layerTypes[layer.type] = (layerTypes[layer.type] || 0) + 1;
  }

  let totalParameters = 0;
  let inputDimension = '';
  let outputDimension = '';

  if (model.type === 'ann') {
    const ann = model as ANNModel;
    totalParameters = ann.metadata?.parameters ?? 0;
    const first = ann.layers[0];
    const last = ann.layers[ann.layers.length - 1];
    inputDimension = `${first.neurons} neurons`;
    outputDimension = `${last.neurons} neurons`;
  } else if (model.type === 'cnn') {
    const cnn = model as CNNModel;
    totalParameters = cnn.metadata?.parameters ?? 0;
    const first = cnn.layers[0];
    const last = cnn.layers[cnn.layers.length - 1];
    if (first.width && first.height && first.channels) {
      inputDimension = `${first.width}x${first.height}x${first.channels}`;
    } else if (first.neurons) {
      inputDimension = `${first.neurons}`;
    }
    if (last.neurons) {
      outputDimension = `${last.neurons} classes`;
    } else if (last.width && last.height && last.channels) {
      outputDimension = `${last.width}x${last.height}x${last.channels}`;
    }
  } else if (model.type === 'llm') {
    const llm = model as LLMModel;
    totalParameters = llm.metadata?.parameters ?? 0;
    inputDimension = `vocab ${llm.config.vocabSize}, seq ${llm.config.maxSeqLen}`;
    outputDimension = `${llm.config.vocabSize} logits`;
  }

  return {
    name: model.name,
    type: model.type,
    description: model.description ?? '',
    totalParameters,
    layerCount: model.layers.length,
    layerTypes,
    inputDimension,
    outputDimension,
  };
}

function formatParams(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

const MODEL_TYPE_LABELS: Record<ModelType, string> = {
  ann: 'ANN',
  cnn: 'CNN',
  llm: 'LLM',
};

const MODEL_TYPE_COLORS: Record<ModelType, string> = {
  ann: 'var(--accent-purple)',
  cnn: 'var(--accent-orange)',
  llm: 'var(--accent-blue)',
};

/* ============================================
   SVG Icons
   ============================================ */
function SwapIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

/* ============================================
   Comparison Bar — animated relative bar chart
   ============================================ */
function ComparisonBar({
  valueA,
  valueB,
  labelA,
  labelB,
}: {
  valueA: number;
  valueB: number;
  labelA: string;
  labelB: string;
}) {
  const maxVal = Math.max(valueA, valueB, 1);
  const pctA = (valueA / maxVal) * 100;
  const pctB = (valueB / maxVal) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Model A bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono w-16 text-right shrink-0" style={{ color: 'var(--accent-blue)' }}>
          {labelA}
        </span>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pctA}%`,
              background: 'linear-gradient(90deg, var(--accent-blue), rgba(79, 195, 247, 0.6))',
              transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>
      {/* Model B bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono w-16 text-right shrink-0" style={{ color: 'var(--accent-purple)' }}>
          {labelB}
        </span>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pctB}%`,
              background: 'linear-gradient(90deg, var(--accent-purple), rgba(179, 136, 255, 0.6))',
              transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Model Selector Dropdown
   ============================================ */
function ModelSelector({
  label,
  color,
  selectedPresetId,
  onSelect,
}: {
  label: string;
  color: string;
  selectedPresetId: string | null;
  onSelect: (presetId: string) => void;
}) {
  const groups = (['ann', 'cnn', 'llm'] as ModelType[]).map((type) => ({
    type,
    presets: MODEL_PRESETS.filter((p) => p.type === type),
  }));

  return (
    <div>
      <label
        className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5 block"
        style={{ color }}
      >
        {label}
      </label>
      <select
        value={selectedPresetId ?? ''}
        onChange={(e) => {
          if (e.target.value) onSelect(e.target.value);
        }}
        className="w-full rounded-lg px-3 py-2 text-[12px] font-medium cursor-pointer"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${selectedPresetId ? color : 'var(--border)'}`,
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color 250ms ease',
        }}
      >
        <option value="" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
          Select a model...
        </option>
        {groups.map(({ type, presets }) => (
          <optgroup
            key={type}
            label={MODEL_TYPE_LABELS[type]}
            style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
          >
            {presets.map((preset) => (
              <option
                key={preset.id}
                value={preset.id}
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                {preset.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

/* ============================================
   Stats Row
   ============================================ */
function StatsRow({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: string;
  valueB: string;
}) {
  return (
    <div
      className="flex items-center gap-2 py-2 px-2 rounded-lg"
      style={{ background: 'rgba(255, 255, 255, 0.02)' }}
    >
      <span className="text-[11px] flex-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-[11px] font-mono text-right w-24" style={{ color: 'var(--accent-blue)' }}>
        {valueA}
      </span>
      <span className="text-[11px] font-mono text-right w-24" style={{ color: 'var(--accent-purple)' }}>
        {valueB}
      </span>
    </div>
  );
}

/* ============================================
   Layer Type Badge
   ============================================ */
function LayerTypeBadge({ type, count, color }: { type: string; count: number; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md"
      style={{
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
      }}
    >
      {type.replace('_', ' ')}
      <span style={{ opacity: 0.7 }}>x{count}</span>
    </span>
  );
}

/* ============================================
   Main ComparisonPanel (inline in sidebar)
   ============================================ */
export default function ComparisonPanel() {
  const modelA = useComparisonStore((s) => s.modelA);
  const modelB = useComparisonStore((s) => s.modelB);
  const setModelA = useComparisonStore((s) => s.setModelA);
  const setModelB = useComparisonStore((s) => s.setModelB);
  const swapModels = useComparisonStore((s) => s.swapModels);
  const clearComparison = useComparisonStore((s) => s.clearComparison);

  const metricsA = useMemo(() => (modelA ? getModelMetrics(modelA.model) : null), [modelA]);
  const metricsB = useMemo(() => (modelB ? getModelMetrics(modelB.model) : null), [modelB]);

  // Merge all layer types from both models
  const allLayerTypes = useMemo(() => {
    const types = new Set<string>();
    if (metricsA) Object.keys(metricsA.layerTypes).forEach((t) => types.add(t));
    if (metricsB) Object.keys(metricsB.layerTypes).forEach((t) => types.add(t));
    return Array.from(types).sort();
  }, [metricsA, metricsB]);

  const bothSelected = metricsA !== null && metricsB !== null;

  return (
    <div className="flex flex-col gap-5">
      {/* Model Selectors */}
      <div className="flex flex-col gap-3">
        <ModelSelector
          label="Model A"
          color="var(--accent-blue)"
          selectedPresetId={modelA?.presetId ?? null}
          onSelect={setModelA}
        />
        <ModelSelector
          label="Model B"
          color="var(--accent-purple)"
          selectedPresetId={modelB?.presetId ?? null}
          onSelect={setModelB}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={swapModels}
          disabled={!modelA && !modelB}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium cursor-pointer"
          style={{
            background: modelA || modelB ? 'rgba(79, 195, 247, 0.08)' : 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            color: modelA || modelB ? 'var(--accent-blue)' : 'var(--text-muted)',
            opacity: !modelA && !modelB ? 0.5 : 1,
            transition: 'all 250ms ease',
          }}
        >
          <SwapIcon size={12} />
          Swap
        </button>
        <button
          onClick={clearComparison}
          disabled={!modelA && !modelB}
          className="flex-1 py-2 rounded-lg text-[11px] font-medium cursor-pointer"
          style={{
            background: modelA || modelB ? 'rgba(255, 82, 82, 0.08)' : 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            color: modelA || modelB ? 'var(--accent-red)' : 'var(--text-muted)',
            opacity: !modelA && !modelB ? 0.5 : 1,
            transition: 'all 250ms ease',
          }}
        >
          Clear
        </button>
      </div>

      {/* Empty state */}
      {!bothSelected && (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>
            <rect x="2" y="3" width="8" height="18" rx="1.5" />
            <rect x="14" y="3" width="8" height="18" rx="1.5" />
            <path d="M10 8h4M10 12h4M10 16h4" strokeDasharray="2 2" />
          </svg>
          <p className="text-[11px] text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Select two models above to compare their architectures side-by-side
          </p>
        </div>
      )}

      {/* Comparison Results */}
      {bothSelected && metricsA && metricsB && (
        <>
          {/* Divider */}
          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Architecture Summary */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--text-muted)' }}>
              Architecture Summary
            </h4>
            <div className="flex flex-col gap-2">
              {/* Model A summary */}
              <div
                className="px-3 py-2 rounded-xl"
                style={{
                  background: 'rgba(79, 195, 247, 0.04)',
                  border: '1px solid rgba(79, 195, 247, 0.15)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent-blue)', boxShadow: '0 0 6px rgba(79, 195, 247, 0.4)' }}
                  />
                  <span className="text-[12px] font-medium" style={{ color: 'var(--accent-blue)' }}>
                    {metricsA.name}
                  </span>
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded-full ml-auto"
                    style={{
                      color: MODEL_TYPE_COLORS[metricsA.type],
                      background: `color-mix(in srgb, ${MODEL_TYPE_COLORS[metricsA.type]} 10%, transparent)`,
                    }}
                  >
                    {MODEL_TYPE_LABELS[metricsA.type]}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {metricsA.description}
                </p>
              </div>

              {/* Model B summary */}
              <div
                className="px-3 py-2 rounded-xl"
                style={{
                  background: 'rgba(179, 136, 255, 0.04)',
                  border: '1px solid rgba(179, 136, 255, 0.15)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent-purple)', boxShadow: '0 0 6px rgba(179, 136, 255, 0.4)' }}
                  />
                  <span className="text-[12px] font-medium" style={{ color: 'var(--accent-purple)' }}>
                    {metricsB.name}
                  </span>
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded-full ml-auto"
                    style={{
                      color: MODEL_TYPE_COLORS[metricsB.type],
                      background: `color-mix(in srgb, ${MODEL_TYPE_COLORS[metricsB.type]} 10%, transparent)`,
                    }}
                  >
                    {MODEL_TYPE_LABELS[metricsB.type]}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {metricsB.description}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Stats Comparison Table */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--text-muted)' }}>
              Metrics Comparison
            </h4>

            {/* Table Header */}
            <div className="flex items-center gap-2 mb-2 px-2">
              <span className="text-[10px] flex-1" style={{ color: 'var(--text-muted)' }}>Metric</span>
              <span className="text-[10px] font-semibold text-right w-24" style={{ color: 'var(--accent-blue)' }}>Model A</span>
              <span className="text-[10px] font-semibold text-right w-24" style={{ color: 'var(--accent-purple)' }}>Model B</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <StatsRow
                label="Type"
                valueA={MODEL_TYPE_LABELS[metricsA.type]}
                valueB={MODEL_TYPE_LABELS[metricsB.type]}
              />
              <StatsRow
                label="Parameters"
                valueA={formatParams(metricsA.totalParameters)}
                valueB={formatParams(metricsB.totalParameters)}
              />
              <StatsRow
                label="Layers"
                valueA={metricsA.layerCount.toString()}
                valueB={metricsB.layerCount.toString()}
              />
              <StatsRow
                label="Input"
                valueA={metricsA.inputDimension}
                valueB={metricsB.inputDimension}
              />
              <StatsRow
                label="Output"
                valueA={metricsA.outputDimension}
                valueB={metricsB.outputDimension}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Visual Diff Bars */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--text-muted)' }}>
              Visual Comparison
            </h4>

            <div className="flex flex-col gap-4">
              {/* Parameters bar */}
              <div>
                <span className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Parameters
                </span>
                <ComparisonBar
                  valueA={metricsA.totalParameters}
                  valueB={metricsB.totalParameters}
                  labelA={formatParams(metricsA.totalParameters)}
                  labelB={formatParams(metricsB.totalParameters)}
                />
              </div>

              {/* Layer count bar */}
              <div>
                <span className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Layer Count
                </span>
                <ComparisonBar
                  valueA={metricsA.layerCount}
                  valueB={metricsB.layerCount}
                  labelA={metricsA.layerCount.toString()}
                  labelB={metricsB.layerCount.toString()}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Layer Types Breakdown */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--text-muted)' }}>
              Layer Types
            </h4>

            <div className="flex flex-col gap-3">
              {/* Model A layer types */}
              <div>
                <span className="text-[10px] font-semibold block mb-1.5" style={{ color: 'var(--accent-blue)' }}>
                  Model A
                </span>
                <div className="flex flex-wrap gap-1">
                  {allLayerTypes.map((type) => {
                    const count = metricsA.layerTypes[type] ?? 0;
                    if (count === 0) return null;
                    return (
                      <LayerTypeBadge
                        key={`a-${type}`}
                        type={type}
                        count={count}
                        color="var(--accent-blue)"
                      />
                    );
                  })}
                </div>
              </div>

              {/* Model B layer types */}
              <div>
                <span className="text-[10px] font-semibold block mb-1.5" style={{ color: 'var(--accent-purple)' }}>
                  Model B
                </span>
                <div className="flex flex-wrap gap-1">
                  {allLayerTypes.map((type) => {
                    const count = metricsB.layerTypes[type] ?? 0;
                    if (count === 0) return null;
                    return (
                      <LayerTypeBadge
                        key={`b-${type}`}
                        type={type}
                        count={count}
                        color="var(--accent-purple)"
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer hint */}
          <div className="pt-2">
            <p className="text-[10px] text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Press <kbd className="kbd-key" style={{ fontSize: '9px', padding: '1px 5px', minWidth: '18px', borderBottomWidth: '2px' }}>K</kbd> to toggle comparison mode
            </p>
          </div>
        </>
      )}
    </div>
  );
}
