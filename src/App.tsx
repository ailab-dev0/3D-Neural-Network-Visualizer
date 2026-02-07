import './styles/globals.css';

import Scene from './components/canvas/Scene';
import Sidebar from './components/ui/Sidebar';
import PlaybackControls from './components/ui/PlaybackControls';
import LayerInspector from './components/ui/LayerInspector';
import ANNVisualizer from './components/visualizers/ann/ANNVisualizer';
import CNNVisualizer from './components/visualizers/cnn/CNNVisualizer';
import LLMVisualizer from './components/visualizers/llm/LLMVisualizer';
import { useModelStore } from './stores/modelStore';
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

function EmptyState() {
  const currentModel = useModelStore((s) => s.currentModel);

  if (currentModel) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center px-6">
        <div style={{ color: 'var(--accent-blue)', opacity: 0.3 }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-4"
          >
            <circle cx="32" cy="32" r="28" strokeDasharray="4 4" />
            <circle cx="22" cy="24" r="4" />
            <circle cx="42" cy="24" r="4" />
            <circle cx="32" cy="38" r="4" />
            <line x1="26" y1="24" x2="38" y2="24" />
            <line x1="22" y1="28" x2="32" y2="34" />
            <line x1="42" y1="28" x2="32" y2="34" />
          </svg>
        </div>
        <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Select a model to begin
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Choose a neural network preset from the sidebar to visualize its architecture in 3D
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Header */}
      <header
        className="absolute top-0 left-0 right-0 z-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 10, 15, 0.8), transparent)',
        }}
      >
        <div className="flex items-center justify-center py-3 px-4">
          <div className="text-center">
            <h1
              className="text-base font-semibold tracking-wide"
              style={{ color: 'var(--text-primary)' }}
            >
              Neural Network Visualizer
            </h1>
            <p className="text-[11px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Interactive 3D Architecture Explorer
            </p>
          </div>
        </div>
      </header>

      {/* 3D Canvas - full screen background */}
      <div className="absolute inset-0">
        <Scene>
          <NetworkVisualization />
        </Scene>
      </div>

      {/* Empty state */}
      <EmptyState />

      {/* UI Overlays */}
      <Sidebar />
      <PlaybackControls />
      <LayerInspector />
    </div>
  );
}
