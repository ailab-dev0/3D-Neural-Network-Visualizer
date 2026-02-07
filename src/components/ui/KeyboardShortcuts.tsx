import { useState, useEffect } from 'react';

const SHORTCUTS = [
  { key: 'Space', description: 'Play / Pause animation' },
  { key: 'R', description: 'Toggle auto-rotate' },
  { key: 'L', description: 'Toggle labels' },
  { key: 'W', description: 'Toggle weights' },
  { key: 'F', description: 'Toggle data flow' },
  { key: 'C', description: 'Toggle cognitive light cone' },
  { key: 'N', description: 'Toggle narration panel' },
  { key: '1', description: 'Switch to ANN tab' },
  { key: '2', description: 'Switch to CNN tab' },
  { key: '3', description: 'Switch to LLM tab' },
] as const;

export default function KeyboardShortcuts() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '?') {
        setVisible((prev) => !prev);
      }
      if (e.key === 'Escape' && visible) {
        setVisible(false);
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-enter"
        style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => setVisible(false)}
      />

      {/* Panel */}
      <div
        className="relative glass-panel-strong rounded-2xl px-8 py-7 modal-enter"
        style={{ minWidth: '360px', maxWidth: '420px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.12), rgba(179, 136, 255, 0.12))',
                border: '1px solid var(--border)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <line x1="6" y1="8" x2="6" y2="8" />
                <line x1="10" y1="8" x2="10" y2="8" />
                <line x1="14" y1="8" x2="14" y2="8" />
                <line x1="18" y1="8" x2="18" y2="8" />
                <line x1="8" y1="16" x2="16" y2="16" />
              </svg>
            </div>
            <h2 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
            style={{
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        {/* Shortcut list */}
        <div className="flex flex-col gap-1">
          {SHORTCUTS.map((shortcut, i) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between gap-6 py-2 px-2 rounded-lg"
              style={{
                background: i % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
              }}
            >
              <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {shortcut.description}
              </span>
              <kbd className="kbd-key shrink-0">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-5 pt-4 flex items-center justify-center gap-1.5"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Press</span>
          <kbd className="kbd-key" style={{ fontSize: '10px', padding: '1px 6px', minWidth: '22px', borderBottomWidth: '2px' }}>?</kbd>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>or</span>
          <kbd className="kbd-key" style={{ fontSize: '10px', padding: '1px 6px', minWidth: '22px', borderBottomWidth: '2px' }}>Esc</kbd>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>to close</span>
        </div>
      </div>
    </div>
  );
}
