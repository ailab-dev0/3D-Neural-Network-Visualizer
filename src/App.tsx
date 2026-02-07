import './styles/globals.css';

import { useEffect } from 'react';
import Scene from './components/canvas/Scene';
import Sidebar from './components/ui/Sidebar';
import PlaybackControls from './components/ui/PlaybackControls';
import LayerInspector from './components/ui/LayerInspector';
import ModelInfo from './components/ui/ModelInfo';
import KeyboardShortcuts from './components/ui/KeyboardShortcuts';
import NarrationPanel from './components/ui/NarrationPanel';
import ANNVisualizer from './components/visualizers/ann/ANNVisualizer';
import CNNVisualizer from './components/visualizers/cnn/CNNVisualizer';
import LLMVisualizer from './components/visualizers/llm/LLMVisualizer';
import { useModelStore } from './stores/modelStore';
import { useVisualizationStore } from './stores/visualizationStore';
import { useUIStore } from './stores/uiStore';
import { useNarrationStore } from './stores/narrationStore';
import { useComparisonStore } from './stores/comparisonStore';
import ComparisonView from './components/canvas/ComparisonView';
import ErrorBoundary from './components/shared/ErrorBoundary';
import type { ANNModel } from './models/ann-schema';
import type { CNNModel } from './models/cnn-schema';
import type { LLMModel } from './models/llm-schema';

function NetworkVisualization() {
  const currentModel = useModelStore((s) => s.currentModel);

  if (!currentModel) return null;

  switch (currentModel.type) {
    case 'ann':
      return <ANNVisualizer model={currentModel as ANNModel} />;
    case 'cnn':
      return <CNNVisualizer model={currentModel as CNNModel} />;
    case 'llm':
      return <LLMVisualizer model={currentModel as LLMModel} />;
    default:
      return null;
  }
}

/* ============================================
   Animated Empty State — Neural wireframe sketch
   ============================================ */
function EmptyState() {
  const currentModel = useModelStore((s) => s.currentModel);

  if (currentModel) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center px-6 fade-up">
        {/* Animated neural network wireframe */}
        <div className="mx-auto mb-6 relative" style={{ width: 140, height: 120 }}>
          <svg
            width="140"
            height="120"
            viewBox="0 0 140 120"
            fill="none"
            className="mx-auto"
          >
            {/* Connections — animated signal paths */}
            {/* Layer 1 to Layer 2 */}
            <line x1="25" y1="30" x2="70" y2="20" className="signal-path" stroke="var(--accent-blue)" strokeWidth="0.8" opacity="0.4" />
            <line x1="25" y1="30" x2="70" y2="50" className="signal-path" stroke="var(--accent-blue)" strokeWidth="0.8" opacity="0.3" />
            <line x1="25" y1="30" x2="70" y2="80" className="signal-path" stroke="var(--accent-blue)" strokeWidth="0.8" opacity="0.2" />
            <line x1="25" y1="60" x2="70" y2="20" className="signal-path" stroke="var(--accent-purple)" strokeWidth="0.8" opacity="0.2" />
            <line x1="25" y1="60" x2="70" y2="50" className="signal-path" stroke="var(--accent-purple)" strokeWidth="0.8" opacity="0.4" />
            <line x1="25" y1="60" x2="70" y2="80" className="signal-path" stroke="var(--accent-purple)" strokeWidth="0.8" opacity="0.3" />
            <line x1="25" y1="90" x2="70" y2="20" className="signal-path" stroke="var(--accent-green)" strokeWidth="0.8" opacity="0.2" />
            <line x1="25" y1="90" x2="70" y2="50" className="signal-path" stroke="var(--accent-green)" strokeWidth="0.8" opacity="0.3" />
            <line x1="25" y1="90" x2="70" y2="80" className="signal-path" stroke="var(--accent-green)" strokeWidth="0.8" opacity="0.4" />

            {/* Layer 2 to Layer 3 */}
            <line x1="70" y1="20" x2="115" y2="40" className="signal-path" stroke="var(--accent-blue)" strokeWidth="0.8" opacity="0.35" />
            <line x1="70" y1="20" x2="115" y2="80" className="signal-path" stroke="var(--accent-blue)" strokeWidth="0.8" opacity="0.2" />
            <line x1="70" y1="50" x2="115" y2="40" className="signal-path" stroke="var(--accent-purple)" strokeWidth="0.8" opacity="0.3" />
            <line x1="70" y1="50" x2="115" y2="80" className="signal-path" stroke="var(--accent-purple)" strokeWidth="0.8" opacity="0.35" />
            <line x1="70" y1="80" x2="115" y2="40" className="signal-path" stroke="var(--accent-green)" strokeWidth="0.8" opacity="0.2" />
            <line x1="70" y1="80" x2="115" y2="80" className="signal-path" stroke="var(--accent-green)" strokeWidth="0.8" opacity="0.35" />

            {/* Layer 1 — Input nodes */}
            <circle cx="25" cy="30" r="5" fill="var(--accent-blue)" className="node-breathe-1" />
            <circle cx="25" cy="60" r="5" fill="var(--accent-purple)" className="node-breathe-2" />
            <circle cx="25" cy="90" r="5" fill="var(--accent-green)" className="node-breathe-3" />

            {/* Layer 2 — Hidden nodes */}
            <circle cx="70" cy="20" r="5" fill="var(--accent-blue)" className="node-breathe-2" />
            <circle cx="70" cy="50" r="5" fill="var(--accent-purple)" className="node-breathe-3" />
            <circle cx="70" cy="80" r="5" fill="var(--accent-green)" className="node-breathe-1" />

            {/* Layer 3 — Output nodes */}
            <circle cx="115" cy="40" r="5" fill="var(--accent-blue)" className="node-breathe-3" />
            <circle cx="115" cy="80" r="5" fill="var(--accent-purple)" className="node-breathe-1" />

            {/* Subtle outer glow rings */}
            <circle cx="25" cy="30" r="8" stroke="var(--accent-blue)" strokeWidth="0.5" opacity="0.15" className="node-breathe-1" />
            <circle cx="70" cy="50" r="8" stroke="var(--accent-purple)" strokeWidth="0.5" opacity="0.15" className="node-breathe-2" />
            <circle cx="115" cy="40" r="8" stroke="var(--accent-blue)" strokeWidth="0.5" opacity="0.15" className="node-breathe-3" />
          </svg>
        </div>

        <p
          className="text-lg font-semibold mb-2 tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          Select a model to begin
        </p>
        <p
          className="text-sm max-w-xs mx-auto leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Choose a neural network preset from the sidebar to visualize its architecture in 3D
        </p>
      </div>
    </div>
  );
}

function useKeyboardShortcuts() {
  const { animationState, play, pause, toggleLabels, toggleWeights, toggleDataFlow, toggleLightCone, autoRotate, setAutoRotate } =
    useVisualizationStore();
  const { setSidebarTab } = useUIStore();
  const { setModelType } = useModelStore();
  const { toggleNarration, toggleVoice } = useNarrationStore();
  const comparisonMode = useComparisonStore((s) => s.comparisonMode);
  const enableComparison = useComparisonStore((s) => s.enableComparison);
  const disableComparison = useComparisonStore((s) => s.disableComparison);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (animationState === 'playing') {
            pause();
          } else {
            play();
          }
          break;
        case 'r':
        case 'R':
          setAutoRotate(!autoRotate);
          break;
        case 'l':
        case 'L':
          toggleLabels();
          break;
        case 'w':
        case 'W':
          toggleWeights();
          break;
        case 'f':
        case 'F':
          toggleDataFlow();
          break;
        case 'c':
        case 'C':
          toggleLightCone();
          break;
        case 'n':
        case 'N':
          toggleNarration();
          break;
        case 'v':
        case 'V':
          toggleVoice();
          break;
        case 'k':
        case 'K':
          if (comparisonMode) {
            disableComparison();
          } else {
            enableComparison();
            setSidebarTab('compare');
          }
          break;
        case '1':
          setModelType('ann');
          setSidebarTab('models');
          break;
        case '2':
          setModelType('cnn');
          setSidebarTab('models');
          break;
        case '3':
          setModelType('llm');
          setSidebarTab('models');
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animationState, autoRotate, comparisonMode, play, pause, toggleLabels, toggleWeights, toggleDataFlow, toggleLightCone, setAutoRotate, setSidebarTab, setModelType, toggleNarration, toggleVoice, enableComparison, disableComparison]);
}

export default function App() {
  useKeyboardShortcuts();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const comparisonMode = useComparisonStore((s) => s.comparisonMode);
  const modelA = useComparisonStore((s) => s.modelA);
  const modelB = useComparisonStore((s) => s.modelB);
  const showComparison = comparisonMode && modelA && modelB;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Header */}
      <header
        className="absolute top-0 right-0 z-50 pointer-events-none"
        style={{
          left: sidebarOpen ? '290px' : '0px',
          background: 'linear-gradient(to bottom, rgba(8, 8, 13, 0.85) 0%, rgba(8, 8, 13, 0.6) 40%, rgba(8, 8, 13, 0.2) 70%, transparent 100%)',
          transition: 'left 300ms ease',
        }}
      >
        <div className="relative flex items-center justify-center py-5 px-6">
          <div className="text-center">
            <h1 className="title-shimmer text-lg font-bold tracking-wide">
              Neural Network Visualizer
            </h1>
            <p
              className="text-xs font-medium uppercase tracking-[0.25em] mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Interactive 3D Architecture Explorer
            </p>
          </div>
          {/* Animated gradient underline accent */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 header-gradient-border"
            style={{
              width: '260px',
              borderRadius: '2px',
            }}
          />
        </div>
      </header>

      {/* 3D Canvas — comparison split-screen or single-canvas */}
      {showComparison ? (
        <div
          className="absolute inset-0"
          style={{
            left: sidebarOpen ? '290px' : '0px',
            transition: 'left 300ms ease',
          }}
        >
          <ErrorBoundary>
            <ComparisonView />
          </ErrorBoundary>
        </div>
      ) : (
        <>
          {/* Normal single canvas */}
          <div className="absolute inset-0">
            <ErrorBoundary>
              <Scene>
                <NetworkVisualization />
              </Scene>
            </ErrorBoundary>
          </div>

          {/* Empty state */}
          <EmptyState />
        </>
      )}

      {/* UI Overlays */}
      <Sidebar />
      {!showComparison && <PlaybackControls />}
      {!showComparison && <LayerInspector />}
      {!showComparison && <ModelInfo />}
      {!showComparison && <NarrationPanel />}
      <KeyboardShortcuts />
    </div>
  );
}
