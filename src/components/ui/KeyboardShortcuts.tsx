import { useState, useEffect } from 'react';

const SHORTCUTS = [
  { key: 'Space', description: 'Play / Pause animation' },
  { key: 'R', description: 'Toggle auto-rotate' },
  { key: 'L', description: 'Toggle labels' },
  { key: 'W', description: 'Toggle weights' },
  { key: 'F', description: 'Toggle data flow' },
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
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => setVisible(false)}
      />

      {/* Panel */}
      <div
        className="relative glass-panel rounded-2xl px-8 py-6"
        style={{ minWidth: '320px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setVisible(false)}
            className="w-6 h-6 flex items-center justify-center rounded text-xs cursor-pointer"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between gap-6">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {shortcut.description}
              </span>
              <kbd
                className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono shrink-0"
                style={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--accent-blue)',
                  minWidth: '28px',
                }}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Press <kbd
            className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono mx-0.5"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              color: 'var(--accent-blue)',
            }}
          >?</kbd> or <kbd
            className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono mx-0.5"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              color: 'var(--accent-blue)',
            }}
          >Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
