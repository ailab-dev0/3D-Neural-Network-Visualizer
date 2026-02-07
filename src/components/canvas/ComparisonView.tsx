import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import { useComparisonStore } from '../../stores/comparisonStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import ANNVisualizer from '../visualizers/ann/ANNVisualizer';
import CNNVisualizer from '../visualizers/cnn/CNNVisualizer';
import LLMVisualizer from '../visualizers/llm/LLMVisualizer';
import type { NetworkModel } from '../../stores/modelStore';
import type { ANNModel } from '../../models/ann-schema';
import type { CNNModel } from '../../models/cnn-schema';
import type { LLMModel } from '../../models/llm-schema';

/* ============================================
   Constants
   ============================================ */

const MODEL_TYPE_COLORS: Record<string, string> = {
  ann: 'var(--accent-purple, #b388ff)',
  cnn: 'var(--accent-orange, #ffab40)',
  llm: 'var(--accent-blue, #4fc3f7)',
};

const MODEL_TYPE_LABELS: Record<string, string> = {
  ann: 'Neural Network',
  cnn: 'Convolutional',
  llm: 'Transformer',
};

/** Camera defaults per model type */
const CAMERA_DEFAULTS: Record<string, { position: [number, number, number]; fov: number }> = {
  ann: { position: [0, 5, 22], fov: 58 },
  cnn: { position: [0, 8, 18], fov: 55 },
  llm: { position: [0, 12, 28], fov: 52 },
};

/* ============================================
   Helper: format large parameter counts
   ============================================ */
function formatParameterCount(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

/* ============================================
   ModelRenderer — Picks the correct visualizer
   ============================================ */
function ModelRenderer({ model }: { model: NetworkModel }) {
  switch (model.type) {
    case 'ann':
      return <ANNVisualizer model={model as ANNModel} />;
    case 'cnn':
      return <CNNVisualizer model={model as CNNModel} />;
    case 'llm':
      return <LLMVisualizer model={model as LLMModel} />;
    default:
      return null;
  }
}

/* ============================================
   GridFloor — Matches Scene.tsx styling
   ============================================ */
function GridFloor() {
  return (
    <Grid
      position={[0, -4, 0]}
      args={[80, 80]}
      cellSize={1}
      cellThickness={0.4}
      cellColor="#1a1a3e"
      sectionSize={5}
      sectionThickness={0.8}
      sectionColor="#2a2a5e"
      fadeDistance={50}
      fadeStrength={1.5}
      infiniteGrid={false}
      followCamera={false}
    />
  );
}

/* ============================================
   ComparisonCanvas — A self-contained 3D view
   ============================================ */
function ComparisonCanvas({ model }: { model: NetworkModel }) {
  const autoRotate = useVisualizationStore((s) => s.autoRotate);
  const cam = CAMERA_DEFAULTS[model.type] ?? CAMERA_DEFAULTS.ann;

  return (
    <Canvas
      camera={{ position: cam.position, fov: cam.fov, near: 0.1, far: 200 }}
      dpr={1.5}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0a0a0f' }}
    >
      <Suspense fallback={null}>
        {/* Lighting — simplified from Scene.tsx to save GPU */}
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#4fc3f7" />
        <pointLight position={[-10, -10, -5]} intensity={0.4} color="#b388ff" />
        <directionalLight position={[0, 5, 5]} intensity={0.3} />

        {/* Depth fog */}
        <fog attach="fog" args={['#0a0a0f', 60, 200]} />

        {/* Background stars */}
        <Stars radius={100} depth={50} count={1200} factor={3} saturation={0.5} fade speed={0.5} />

        {/* Grid floor */}
        <GridFloor />

        {/* Camera controls */}
        <OrbitControls
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={100}
          enablePan
        />

        {/* The actual model visualization */}
        <ModelRenderer model={model} />
      </Suspense>
    </Canvas>
  );
}

/* ============================================
   PanelLabel — Glassmorphism overlay label
   ============================================ */
function PanelLabel({
  side,
  model,
}: {
  side: 'A' | 'B';
  model: NetworkModel;
}) {
  const isA = side === 'A';
  const badgeColor = isA ? '#4fc3f7' : '#b388ff';
  const typeColor = MODEL_TYPE_COLORS[model.type] ?? '#4fc3f7';
  const typeLabel = MODEL_TYPE_LABELS[model.type] ?? model.type.toUpperCase();
  const paramCount = model.metadata?.parameters;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div
        className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-3"
        style={{ minWidth: '180px' }}
      >
        {/* Side badge (A or B) */}
        <span
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{
            background: `color-mix(in srgb, ${badgeColor} 20%, transparent)`,
            border: `1px solid color-mix(in srgb, ${badgeColor} 40%, transparent)`,
            color: badgeColor,
            boxShadow: `0 0 10px color-mix(in srgb, ${badgeColor} 30%, transparent)`,
          }}
        >
          {side}
        </span>

        <div className="flex flex-col gap-0.5 min-w-0">
          {/* Model name */}
          <span
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            {model.name}
          </span>

          {/* Type badge + params */}
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded inline-flex items-center gap-1"
              style={{
                color: typeColor,
                background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${typeColor} 25%, transparent)`,
              }}
            >
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: typeColor, boxShadow: `0 0 4px ${typeColor}` }}
              />
              {typeLabel}
            </span>

            {paramCount != null && (
              <span
                className="text-[10px] font-medium"
                style={{ color: 'var(--text-muted, #6e6e8a)' }}
              >
                {formatParameterCount(paramCount)} params
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   VsBadge — Centered "vs" divider badge
   ============================================ */
function VsBadge() {
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 42, 0.95), rgba(14, 14, 22, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow:
            '0 0 20px rgba(79, 195, 247, 0.15), 0 0 40px rgba(179, 136, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #4fc3f7, #b388ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          vs
        </span>
      </div>
    </div>
  );
}

/* ============================================
   ComparisonView — Main split-screen component
   ============================================ */
export default function ComparisonView() {
  const modelA = useComparisonStore((s) => s.modelA);
  const modelB = useComparisonStore((s) => s.modelB);

  if (!modelA || !modelB) return null;

  return (
    <div className="absolute inset-0 flex">
      {/* Left panel: Model A */}
      <div className="relative flex-1" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <ComparisonCanvas model={modelA.model} />
        <PanelLabel side="A" model={modelA.model} />
      </div>

      {/* Right panel: Model B */}
      <div className="relative flex-1">
        <ComparisonCanvas model={modelB.model} />
        <PanelLabel side="B" model={modelB.model} />
      </div>

      {/* Centered "vs" badge over the divider */}
      <VsBadge />
    </div>
  );
}
