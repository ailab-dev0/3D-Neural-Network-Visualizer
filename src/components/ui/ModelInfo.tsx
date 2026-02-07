import { useModelStore } from '../../stores/modelStore';

const MODEL_TYPE_COLORS: Record<string, string> = {
  ann: 'var(--accent-purple)',
  cnn: 'var(--accent-orange)',
  llm: 'var(--accent-blue)',
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

  return (
    <div
      className="fixed top-4 right-4 z-30 glass-panel rounded-xl overflow-hidden slide-in-right"
      style={{ minWidth: '180px', maxWidth: '220px' }}
    >
      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${typeColor}, transparent)`,
          opacity: 0.5,
        }}
      />

      <div className="px-4 py-3">
        {/* Model name with type dot */}
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: typeColor,
              boxShadow: `0 0 8px ${typeColor}`,
            }}
          />
          <div
            className="text-[13px] font-semibold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {currentModel.name}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-1.5">
          {paramCount != null && (
            <div className="detail-row flex items-center justify-between gap-4">
              <span
                className="text-[10px] font-medium uppercase tracking-[0.1em]"
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
              className="text-[10px] font-medium uppercase tracking-[0.1em]"
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
          <div className="detail-row flex items-center justify-between gap-4">
            <span
              className="text-[10px] font-medium uppercase tracking-[0.1em]"
              style={{ color: 'var(--text-muted)' }}
            >
              Type
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                color: typeColor,
                background: `color-mix(in srgb, ${typeColor} 8%, transparent)`,
              }}
            >
              {currentModel.type}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
