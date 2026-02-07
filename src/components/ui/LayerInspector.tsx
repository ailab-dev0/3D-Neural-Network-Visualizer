import { useVisualizationStore } from '../../stores/visualizationStore';
import { useModelStore, type NetworkModel } from '../../stores/modelStore';
import type { ANNLayer } from '../../models/ann-schema';
import type { CNNLayer } from '../../models/cnn-schema';
import type { TransformerLayer } from '../../models/llm-schema';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function getLayerFromModel(
  model: NetworkModel,
  layerId: string,
): ANNLayer | CNNLayer | TransformerLayer | undefined {
  return model.layers.find((l) => l.id === layerId);
}

function calculateParamCount(model: NetworkModel, layerId: string): number | null {
  if (model.type === 'ann') {
    const layerIndex = model.layers.findIndex((l) => l.id === layerId);
    const layer = model.layers[layerIndex];
    if (!layer) return null;
    if (layer.type === 'input') return 0;
    const prevLayer = model.layers[layerIndex - 1];
    if (!prevLayer) return null;
    return prevLayer.neurons * layer.neurons + layer.neurons;
  }

  if (model.type === 'cnn') {
    const layer = model.layers.find((l) => l.id === layerId) as CNNLayer | undefined;
    if (!layer) return null;
    if (layer.type === 'conv2d' && layer.kernelSize && layer.filters) {
      const prevLayer = model.layers[model.layers.indexOf(layer) - 1] as CNNLayer | undefined;
      const inChannels = prevLayer?.channels ?? prevLayer?.filters ?? 1;
      return layer.kernelSize * layer.kernelSize * inChannels * layer.filters + layer.filters;
    }
    if (layer.type === 'dense' && layer.neurons) {
      const prevLayer = model.layers[model.layers.indexOf(layer) - 1] as CNNLayer | undefined;
      const prevNeurons = prevLayer?.neurons ?? 0;
      return prevNeurons * layer.neurons + layer.neurons;
    }
    return 0;
  }

  if (model.type === 'llm') {
    const layer = model.layers.find((l) => l.id === layerId) as TransformerLayer | undefined;
    if (!layer) return null;
    const { config } = model;
    switch (layer.type) {
      case 'embedding':
        return config.vocabSize * config.dModel;
      case 'positional_encoding':
        return config.maxSeqLen * config.dModel;
      case 'attention':
        return 4 * config.dModel * config.dModel;
      case 'feed_forward':
        return 2 * config.dModel * config.dFF + config.dModel + config.dFF;
      case 'layer_norm':
        return 2 * config.dModel;
      case 'output':
        return config.dModel * config.vocabSize;
      default:
        return 0;
    }
  }

  return null;
}

function ANNDetails({ layer }: { layer: ANNLayer }) {
  return (
    <div className="flex flex-col">
      <DetailRow label="Neurons" value={String(layer.neurons)} />
      {layer.activation && <DetailRow label="Activation" value={layer.activation.toUpperCase()} />}
      {layer.dropout !== undefined && <DetailRow label="Dropout" value={`${(layer.dropout * 100).toFixed(0)}%`} />}
    </div>
  );
}

function CNNDetails({ layer }: { layer: CNNLayer }) {
  return (
    <div className="flex flex-col">
      {layer.width && layer.height && <DetailRow label="Spatial" value={`${layer.width} x ${layer.height}`} />}
      {layer.channels !== undefined && <DetailRow label="Channels" value={String(layer.channels)} />}
      {layer.filters !== undefined && <DetailRow label="Filters" value={String(layer.filters)} />}
      {layer.kernelSize !== undefined && <DetailRow label="Kernel Size" value={`${layer.kernelSize} x ${layer.kernelSize}`} />}
      {layer.stride !== undefined && <DetailRow label="Stride" value={String(layer.stride)} />}
      {layer.padding !== undefined && <DetailRow label="Padding" value={String(layer.padding)} />}
      {layer.poolSize !== undefined && <DetailRow label="Pool Size" value={`${layer.poolSize} x ${layer.poolSize}`} />}
      {layer.neurons !== undefined && <DetailRow label="Neurons" value={String(layer.neurons)} />}
      {layer.activation && <DetailRow label="Activation" value={layer.activation.toUpperCase()} />}
    </div>
  );
}

function LLMDetails({ layer }: { layer: TransformerLayer }) {
  return (
    <div className="flex flex-col">
      {layer.config?.dModel !== undefined && <DetailRow label="d_model" value={String(layer.config.dModel)} />}
      {layer.config?.nHeads !== undefined && <DetailRow label="n_heads" value={String(layer.config.nHeads)} />}
      {layer.config?.dFF !== undefined && <DetailRow label="d_ff" value={String(layer.config.dFF)} />}
      {layer.config?.activation && <DetailRow label="Activation" value={layer.config.activation.toUpperCase()} />}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row flex items-center justify-between">
      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span
        className="text-[11px] font-mono px-1.5 py-0.5 rounded"
        style={{
          color: 'var(--text-primary)',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  input: 'var(--accent-blue)',
  hidden: 'var(--accent-purple)',
  output: 'var(--accent-green)',
  conv2d: 'var(--accent-orange)',
  maxpool: '#ffab40',
  avgpool: '#ffab40',
  batchnorm: '#90a4ae',
  flatten: '#80deea',
  dense: 'var(--accent-purple)',
  dropout: '#ff5252',
  embedding: '#ce93d8',
  positional_encoding: '#ce93d8',
  attention: '#f48fb1',
  feed_forward: '#80cbc4',
  layer_norm: '#90a4ae',
};

export default function LayerInspector() {
  const selectedLayerId = useVisualizationStore((s) => s.selectedLayerId);
  const selectLayer = useVisualizationStore((s) => s.selectLayer);
  const currentModel = useModelStore((s) => s.currentModel);

  if (!selectedLayerId || !currentModel) return null;

  const layer = getLayerFromModel(currentModel, selectedLayerId);
  if (!layer) return null;

  const paramCount = calculateParamCount(currentModel, selectedLayerId);
  const badgeColor = TYPE_BADGE_COLORS[layer.type] ?? 'var(--text-muted)';

  // Offset below ModelInfo when a model is loaded (ModelInfo is ~100px tall at top-4)
  const topOffset = currentModel ? 'calc(1rem + 110px)' : '1rem';

  return (
    <div className="fixed right-4 z-30 w-72 slide-in-right" style={{ top: topOffset }}>
      <div className="glass-panel rounded-xl overflow-hidden">
        {/* Top accent line */}
        <div
          className="h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${badgeColor}, transparent)`,
            opacity: 0.5,
          }}
        />

        {/* Header */}
        <div
          className="flex items-start justify-between p-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {layer.label || layer.id}
            </h3>
            <span
              className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase font-semibold tracking-wider"
              style={{
                color: badgeColor,
                background: `color-mix(in srgb, ${badgeColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${badgeColor} 20%, transparent)`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: badgeColor, boxShadow: `0 0 4px ${badgeColor}` }}
              />
              {layer.type.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={() => selectLayer(null)}
            className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer shrink-0 ml-2"
            style={{
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
            }}
            title="Close inspector"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        {/* Details */}
        <div className="p-4">
          {currentModel.type === 'ann' && <ANNDetails layer={layer as ANNLayer} />}
          {currentModel.type === 'cnn' && <CNNDetails layer={layer as CNNLayer} />}
          {currentModel.type === 'llm' && <LLMDetails layer={layer as TransformerLayer} />}

          {paramCount !== null && (
            <>
              <div
                className="h-px my-3"
                style={{
                  background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Parameters</span>
                <span
                  className="text-[12px] font-mono font-semibold px-2 py-0.5 rounded-md"
                  style={{
                    color: 'var(--accent-blue)',
                    background: 'rgba(79, 195, 247, 0.06)',
                  }}
                >
                  {formatNumber(paramCount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
