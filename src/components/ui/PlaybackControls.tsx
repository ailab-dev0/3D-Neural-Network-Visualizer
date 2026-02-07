import { useVisualizationStore } from '../../stores/visualizationStore';
import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';

export default function PlaybackControls() {
  const currentModel = useModelStore((s) => s.currentModel);
  const animationState = useVisualizationStore((s) => s.animationState);
  const animationSpeed = useVisualizationStore((s) => s.animationSpeed);
  const showDataFlow = useVisualizationStore((s) => s.showDataFlow);
  const autoRotate = useVisualizationStore((s) => s.autoRotate);
  const play = useVisualizationStore((s) => s.play);
  const pause = useVisualizationStore((s) => s.pause);
  const stop = useVisualizationStore((s) => s.stop);
  const step = useVisualizationStore((s) => s.step);
  const setAnimationSpeed = useVisualizationStore((s) => s.setAnimationSpeed);
  const toggleDataFlow = useVisualizationStore((s) => s.toggleDataFlow);
  const setAutoRotate = useVisualizationStore((s) => s.setAutoRotate);
  const lightConeEnabled = useVisualizationStore((s) => s.lightConeEnabled);
  const toggleLightCone = useVisualizationStore((s) => s.toggleLightCone);

  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const isPlaying = animationState === 'playing';
  const speedPct = ((animationSpeed - 0.1) / 2.9) * 100;

  if (!currentModel) return null;

  // Center within the visible canvas area (offset by sidebar width when open)
  const sidebarWidth = sidebarOpen ? 290 : 0;

  return (
    <div
      className="fixed bottom-4 z-40"
      style={{
        left: `calc(${sidebarWidth}px + (100vw - ${sidebarWidth}px) / 2)`,
        transform: 'translateX(-50%)',
        transition: 'left 300ms ease',
      }}
    >
      <div
        className="glass-panel-strong rounded-2xl overflow-hidden flex flex-col"
        style={{
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Gradient accent line at top */}
        <div
          className="header-gradient-border"
          style={{ height: '2px' }}
        />
      <div className="px-6 py-3.5 flex items-center gap-4">
        {/* Transport controls */}
        <div className="flex items-center gap-2">
          {/* Stop */}
          <button
            onClick={stop}
            className="transport-btn w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer"
            style={{
              background: animationState === 'idle'
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(255, 82, 82, 0.12)',
              color: animationState === 'idle' ? 'var(--text-muted)' : 'var(--accent-red)',
              border: '1px solid var(--border)',
            }}
            title="Stop"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2.5" y="2.5" width="9" height="9" rx="1.5" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={isPlaying ? pause : play}
            className={`transport-btn w-11 h-11 flex items-center justify-center rounded-2xl cursor-pointer ${isPlaying ? 'play-pulse' : 'play-btn-idle'}`}
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, rgba(79, 195, 247, 0.2), rgba(79, 195, 247, 0.1))'
                : 'linear-gradient(135deg, rgba(105, 240, 174, 0.2), rgba(105, 240, 174, 0.1))',
              color: isPlaying ? 'var(--accent-blue)' : 'var(--accent-green)',
              border: `1px solid ${isPlaying ? 'rgba(79, 195, 247, 0.3)' : 'rgba(105, 240, 174, 0.3)'}`,
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="2" width="3.5" height="12" rx="1" />
                <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.5 2.5l9 5.5-9 5.5V2.5z" />
              </svg>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={step}
            className="transport-btn w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
            title="Step Forward"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M2 1.5l6.5 5.5-6.5 5.5V1.5z" />
              <rect x="10" y="1.5" width="2" height="11" rx="0.5" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div
          className="w-px h-9"
          style={{
            background: 'linear-gradient(180deg, transparent, var(--border-active), transparent)',
          }}
        />

        {/* Speed slider */}
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Speed
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono w-8 text-right px-1 py-0.5 rounded"
              style={{
                color: 'var(--accent-blue)',
                background: 'rgba(79, 195, 247, 0.06)',
              }}
            >
              {animationSpeed.toFixed(1)}x
            </span>
            <input
              type="range" min={0.1} max={3} step={0.1}
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-32 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent-blue) ${speedPct}%, rgba(255,255,255,0.06) ${speedPct}%)`,
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-px h-9"
          style={{
            background: 'linear-gradient(180deg, transparent, var(--border-active), transparent)',
          }}
        />

        {/* Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Data Flow toggle */}
          <button
            onClick={toggleDataFlow}
            className="transport-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer"
            style={{
              background: showDataFlow
                ? 'linear-gradient(135deg, rgba(105, 240, 174, 0.12), rgba(105, 240, 174, 0.06))'
                : 'rgba(255, 255, 255, 0.03)',
              color: showDataFlow ? 'var(--accent-green)' : 'var(--text-muted)',
              border: showDataFlow
                ? '1px solid rgba(105, 240, 174, 0.25)'
                : '1px solid var(--border)',
              boxShadow: showDataFlow ? '0 0 12px rgba(105, 240, 174, 0.1)' : 'none',
            }}
            title="Toggle Data Flow"
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="2" cy="6" r="1.5" />
              <circle cx="10" cy="6" r="1.5" />
              <path d="M3.5 6h5" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 1" />
            </svg>
            Flow
          </button>

          {/* Auto Rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="transport-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer"
            style={{
              background: autoRotate
                ? 'linear-gradient(135deg, rgba(179, 136, 255, 0.12), rgba(179, 136, 255, 0.06))'
                : 'rgba(255, 255, 255, 0.03)',
              color: autoRotate ? 'var(--accent-purple)' : 'var(--text-muted)',
              border: autoRotate
                ? '1px solid rgba(179, 136, 255, 0.25)'
                : '1px solid var(--border)',
              boxShadow: autoRotate ? '0 0 12px rgba(179, 136, 255, 0.1)' : 'none',
            }}
            title="Toggle Auto Rotate"
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M10.5 6A4.5 4.5 0 1 1 6 1.5" />
              <path d="M8 1l2.5 0.5L10 4" fill="none" />
            </svg>
            Rotate
          </button>

          {/* Light Cone toggle */}
          <button
            onClick={toggleLightCone}
            className="transport-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer"
            style={{
              background: lightConeEnabled
                ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 229, 255, 0.06))'
                : 'rgba(255, 255, 255, 0.03)',
              color: lightConeEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: lightConeEnabled
                ? '1px solid rgba(0, 229, 255, 0.25)'
                : '1px solid var(--border)',
              boxShadow: lightConeEnabled ? '0 0 12px rgba(0, 229, 255, 0.1)' : 'none',
            }}
            title="Toggle Cognitive Light Cone (C)"
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M6 1 L2 11 L10 11 Z" />
              <circle cx="6" cy="4" r="1" fill="currentColor" />
            </svg>
            Cone
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
