import { useModelStore } from '../../stores/modelStore';

const MODEL_TYPE_COLORS: Record<string, string> = {
  ann: 'var(--accent-purple)',
  cnn: 'var(--accent-orange)',
  llm: 'var(--accent-blue)',
};

const MODEL_TYPE_FULL: Record<string, string> = {
  ann: 'Neural Network',
  cnn: 'Convolutional',
  llm: 'Transformer',
};

function formatParameterCount(count: number): string {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1)}B`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

export default function ModelInfo() {
  const currentModel = useModelStore((s) => s.currentModel);

  if (!currentModel) return null;

  const paramCount = currentModel.metadata?.parameters;
  const layerCount = currentModel.layers.length;
  const typeColor = MODEL_TYPE_COLORS[currentModel.type] ?? 'var(--accent-blue)';
  const archLabel = MODEL_TYPE_FULL[currentModel.type] ?? currentModel.type.toUpperCase();

  // Get first layer info for input dimensions display
  const firstLayer = currentModel.layers[0];
  let inputDimLabel: string | null = null;
  if (firstLayer) {
    if ('neurons' in firstLayer && firstLayer.neurons) {
      inputDimLabel = `${firstLayer.neurons}`;
    } else if ('width' in firstLayer && firstLayer.width && 'height' in firstLayer && firstLayer.height) {
      const f = firstLayer as { width: number; height: number; channels?: number };
      inputDimLabel = f.channels ? `${f.width}x${f.height}x${f.channels}` : `${f.width}x${f.height}`;
    }
  }

  return (
    <div
      className="fixed top-4 right-4 z-30 glass-panel-strong rounded-2xl overflow-hidden slide-in-right"
      style={{ minWidth: '220px', maxWidth: '280px' }}
    >
      {/* Top accent line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${typeColor}, transparent)`,
          opacity: 0.6,
        }}
      />

      <div className="px-5 py-4">
        {/* Type badge + Model name */}
        <div className="mb-3">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-md inline-flex items-center gap-1.5"
            style={{
              color: typeColor,
              background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${typeColor} 25%, transparent)`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: typeColor, boxShadow: `0 0 6px ${typeColor}` }}
            />
            {currentModel.type.toUpperCase()}
          </span>
        </div>

        <div
          className="text-[14px] font-bold leading-tight mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {currentModel.name}
        </div>

        {/* Description */}
        {currentModel.description && (
          <p
            className="text-[11px] leading-relaxed mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {currentModel.description}
          </p>
        )}

        {/* Divider */}
        <div
          className="h-px mb-3"
          style={{ background: 'linear-gradient(90deg, transparent, var(--border-active), transparent)' }}
        />

        {/* Stats */}
        <div className="flex flex-col gap-2">
          <div className="detail-row flex items-center justify-between gap-4">
            <span
              className="text-[11px] font-medium uppercase tracking-[0.1em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Architecture
            </span>
            <span
              className="text-[11px] font-medium px-1.5 py-0.5 rounded"
              style={{
                color: typeColor,
                background: `color-mix(in srgb, ${typeColor} 6%, transparent)`,
              }}
            >
              {archLabel}
            </span>
          </div>
          {paramCount != null && (
            <div className="detail-row flex items-center justify-between gap-4">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.1em]"
                style={{ color: 'var(--text-muted)' }}
              >
                Params
              </span>
              <span
                className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  color: 'var(--accent-blue)',
                  background: 'rgba(79, 195, 247, 0.06)',
                }}
              >
                {formatParameterCount(paramCount)}
              </span>
            </div>
          )}
          <div className="detail-row flex items-center justify-between gap-4">
            <span
              className="text-[11px] font-medium uppercase tracking-[0.1em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Layers
            </span>
            <span
              className="text-[11px] font-mono px-1.5 py-0.5 rounded"
              style={{
                color: 'var(--accent-purple)',
                background: 'rgba(179, 136, 255, 0.06)',
              }}
            >
              {layerCount}
            </span>
          </div>
          {inputDimLabel && (
            <div className="detail-row flex items-center justify-between gap-4">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.1em]"
                style={{ color: 'var(--text-muted)' }}
              >
                Input
              </span>
              <span
                className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  color: 'var(--accent-green)',
                  background: 'rgba(105, 240, 174, 0.06)',
                }}
              >
                {inputDimLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
