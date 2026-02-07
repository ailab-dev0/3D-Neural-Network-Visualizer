import { useModelStore } from '../../stores/modelStore';

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

  return (
    <div
      className="fixed top-4 right-4 z-50 glass-panel rounded-xl px-4 py-3"
      style={{ minWidth: '160px' }}
    >
      <div
        className="text-sm font-semibold mb-1.5 truncate"
        style={{ color: 'var(--text-primary)' }}
      >
        {currentModel.name}
      </div>
      <div className="flex flex-col gap-1">
        {paramCount != null && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Params
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--accent-blue)' }}>
              {formatParameterCount(paramCount)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Layers
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--accent-purple)' }}>
            {layerCount}
          </span>
        </div>
      </div>
    </div>
  );
}
