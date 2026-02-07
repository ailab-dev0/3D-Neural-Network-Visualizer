import { useVisualizationStore } from '../../stores/visualizationStore';

export default function PlaybackControls() {
  const {
    animationState, animationSpeed, showDataFlow, autoRotate,
    play, pause, stop, step, setAnimationSpeed, toggleDataFlow, setAutoRotate,
  } = useVisualizationStore();

  const isPlaying = animationState === 'playing';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-panel rounded-2xl px-6 py-4 flex items-center gap-5">
        {/* Transport controls */}
        <div className="flex items-center gap-2">
          {/* Stop */}
          <button
            onClick={stop}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer"
            style={{
              background: animationState === 'idle' ? 'transparent' : 'rgba(255, 82, 82, 0.15)',
              color: animationState === 'idle' ? 'var(--text-muted)' : 'var(--accent-red)',
              border: '1px solid var(--border)',
            }}
            title="Stop"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="2" width="10" height="10" rx="1" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={isPlaying ? pause : play}
            className="w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer"
            style={{
              background: isPlaying ? 'rgba(79, 195, 247, 0.2)' : 'rgba(105, 240, 174, 0.2)',
              color: isPlaying ? 'var(--accent-blue)' : 'var(--accent-green)',
              border: `1px solid ${isPlaying ? 'var(--accent-blue)' : 'var(--accent-green)'}`,
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="2" width="4" height="12" rx="1" />
                <rect x="9" y="2" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2l10 6-10 6V2z" />
              </svg>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={step}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer"
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
            title="Step Forward"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M2 1l7 6-7 6V1z" />
              <rect x="10" y="1" width="2.5" height="12" rx="0.5" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8" style={{ background: 'var(--border)' }} />

        {/* Speed slider */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Speed
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono w-8 text-right" style={{ color: 'var(--accent-blue)' }}>
              {animationSpeed.toFixed(1)}x
            </span>
            <input
              type="range" min={0.1} max={3} step={0.1}
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-24 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent-blue) ${((animationSpeed - 0.1) / 2.9) * 100}%, var(--border) ${((animationSpeed - 0.1) / 2.9) * 100}%)`,
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8" style={{ background: 'var(--border)' }} />

        {/* Toggles */}
        <div className="flex items-center gap-3">
          {/* Data Flow toggle */}
          <button
            onClick={toggleDataFlow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: showDataFlow ? 'rgba(105, 240, 174, 0.15)' : 'transparent',
              color: showDataFlow ? 'var(--accent-green)' : 'var(--text-muted)',
              border: showDataFlow ? '1px solid var(--accent-green)' : '1px solid var(--border)',
            }}
            title="Toggle Data Flow"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="2" cy="6" r="1.5" />
              <circle cx="10" cy="6" r="1.5" />
              <path d="M3.5 6h5" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 1" />
            </svg>
            Flow
          </button>

          {/* Auto Rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: autoRotate ? 'rgba(179, 136, 255, 0.15)' : 'transparent',
              color: autoRotate ? 'var(--accent-purple)' : 'var(--text-muted)',
              border: autoRotate ? '1px solid var(--accent-purple)' : '1px solid var(--border)',
            }}
            title="Toggle Auto Rotate"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M10.5 6A4.5 4.5 0 1 1 6 1.5" />
              <path d="M8 1l2.5 0.5L10 4" fill="none" />
            </svg>
            Rotate
          </button>
        </div>
      </div>
    </div>
  );
}
