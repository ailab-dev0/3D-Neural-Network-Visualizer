import { useEffect, useRef, useState, useCallback } from 'react';
import { useNarrationStore, type NarrationEntry } from '../../stores/narrationStore';
import { useModelStore } from '../../stores/modelStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useUIStore } from '../../stores/uiStore';
import {
  modelNarrations,
  layerNarrations,
  actionNarrations,
  tipNarrations,
  generateANNSimulationSteps,
  generateCNNSimulationSteps,
  generateLLMSimulationSteps,
  type SimulationStep,
} from '../../data/narrations';
import type { ANNModel } from '../../models/ann-schema';
import type { CNNModel } from '../../models/cnn-schema';
import type { LLMModel } from '../../models/llm-schema';

/* ============================================
   SVG Icons for narration types
   ============================================ */
function BrainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 0-7 7c0 3 2 5.5 4 7l3 3 3-3c2-1.5 4-4 4-7a7 7 0 0 0-7-7z" />
      <path d="M12 2v10" />
      <path d="M8 6c1 1 3 1 4 0" />
      <path d="M12 6c1 1 3 1 4 0" />
    </svg>
  );
}

function LayerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function ActionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function TipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function SimulationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l14 9-14 9V3z" />
    </svg>
  );
}

const ICON_MAP: Record<NarrationEntry['icon'], React.ComponentType> = {
  model: BrainIcon,
  layer: LayerIcon,
  action: ActionIcon,
  tip: TipIcon,
  simulation: SimulationIcon,
};

const ICON_COLOR_MAP: Record<NarrationEntry['icon'], string> = {
  model: 'var(--accent-purple)',
  layer: 'var(--accent-blue)',
  action: 'var(--accent-orange)',
  tip: 'var(--accent-green)',
  simulation: 'var(--accent-cyan)',
};

/* ============================================
   Typewriter Hook
   ============================================ */
function useTypewriter(text: string | null, speed: number = 25) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const textRef = useRef(text);

  useEffect(() => {
    // When text changes, reset
    if (text !== textRef.current) {
      textRef.current = text;
      indexRef.current = 0;
      setDisplayed('');
      setDone(false);
    }

    if (!text) {
      setDisplayed('');
      setDone(true);
      return;
    }

    function tick() {
      if (!textRef.current) return;
      const i = indexRef.current;
      if (i < textRef.current.length) {
        indexRef.current = i + 1;
        setDisplayed(textRef.current.slice(0, i + 1));
        timerRef.current = setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    }

    if (indexRef.current < text.length) {
      timerRef.current = setTimeout(tick, speed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed]);

  return { displayed, done };
}

/* ============================================
   Narration Panel Component
   ============================================ */
export default function NarrationPanel() {
  const narrationEnabled = useNarrationStore((s) => s.narrationEnabled);
  const currentNarration = useNarrationStore((s) => s.currentNarration);
  const currentIcon = useNarrationStore((s) => s.currentIcon);
  const narrationHistory = useNarrationStore((s) => s.narrationHistory);
  const setNarration = useNarrationStore((s) => s.setNarration);
  const setIsTyping = useNarrationStore((s) => s.setIsTyping);
  const simulationRunning = useNarrationStore((s) => s.simulationRunning);
  const simulationStep = useNarrationStore((s) => s.simulationStep);
  const simulationTotalSteps = useNarrationStore((s) => s.simulationTotalSteps);
  const startSimulation = useNarrationStore((s) => s.startSimulation);
  const stopSimulation = useNarrationStore((s) => s.stopSimulation);
  const advanceSimulation = useNarrationStore((s) => s.advanceSimulation);
  const toggleNarration = useNarrationStore((s) => s.toggleNarration);

  const currentModel = useModelStore((s) => s.currentModel);
  const currentPresetId = useModelStore((s) => s.currentPresetId);

  const animationState = useVisualizationStore((s) => s.animationState);
  const selectedLayerId = useVisualizationStore((s) => s.selectedLayerId);
  const showWeights = useVisualizationStore((s) => s.showWeights);
  const showDataFlow = useVisualizationStore((s) => s.showDataFlow);
  const showLabels = useVisualizationStore((s) => s.showLabels);
  const lightConeEnabled = useVisualizationStore((s) => s.lightConeEnabled);
  const autoRotate = useVisualizationStore((s) => s.autoRotate);
  const selectLayer = useVisualizationStore((s) => s.selectLayer);

  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const { displayed, done } = useTypewriter(currentNarration, 25);
  const [showHistory, setShowHistory] = useState(false);
  const simulationStepsRef = useRef<SimulationStep[]>([]);
  const simulationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPresetRef = useRef<string | null>(null);
  const prevLayerRef = useRef<string | null>(null);
  const prevWeightsRef = useRef(showWeights);
  const prevDataFlowRef = useRef(showDataFlow);
  const prevLabelsRef = useRef(showLabels);
  const prevLightConeRef = useRef(lightConeEnabled);
  const prevAutoRotateRef = useRef(autoRotate);
  const prevAnimStateRef = useRef(animationState);

  // Update typing state
  useEffect(() => {
    setIsTyping(!done);
  }, [done, setIsTyping]);

  // ---- TRIGGER: Model loaded ----
  useEffect(() => {
    if (!narrationEnabled) return;
    if (currentPresetId && currentPresetId !== prevPresetRef.current) {
      prevPresetRef.current = currentPresetId;
      const text = modelNarrations[currentPresetId];
      if (text) {
        setNarration(text, 'model');
      }
    }
  }, [currentPresetId, narrationEnabled, setNarration]);

  // ---- TRIGGER: Layer selected ----
  useEffect(() => {
    if (!narrationEnabled || !currentModel) return;
    if (selectedLayerId && selectedLayerId !== prevLayerRef.current) {
      prevLayerRef.current = selectedLayerId;
      const layer = currentModel.layers.find((l) => l.id === selectedLayerId);
      if (layer) {
        const layerType = layer.type;
        let text = layerNarrations[layerType];
        if (text) {
          // Add specific details from the layer
          const label = layer.label || layer.id;
          text = `[${label}] ${text}`;
          setNarration(text, 'layer');
        }
      }
    } else if (!selectedLayerId) {
      prevLayerRef.current = null;
    }
  }, [selectedLayerId, currentModel, narrationEnabled, setNarration]);

  // ---- TRIGGER: Animation state changed ----
  useEffect(() => {
    if (!narrationEnabled) return;
    if (animationState !== prevAnimStateRef.current) {
      const prev = prevAnimStateRef.current;
      prevAnimStateRef.current = animationState;

      if (animationState === 'playing' && prev !== 'playing') {
        const text = actionNarrations['play'];
        if (text) setNarration(text, 'action');
      } else if (animationState === 'paused' && prev === 'playing') {
        const text = actionNarrations['pause'];
        if (text) setNarration(text, 'action');
      } else if (animationState === 'idle' && prev !== 'idle') {
        const text = actionNarrations['stop'];
        if (text) setNarration(text, 'action');
      }
    }
  }, [animationState, narrationEnabled, setNarration]);

  // ---- TRIGGER: Toggle changes ----
  useEffect(() => {
    if (!narrationEnabled) return;
    if (showWeights !== prevWeightsRef.current) {
      prevWeightsRef.current = showWeights;
      const key = showWeights ? 'toggle-weights' : 'toggle-weights-off';
      const text = actionNarrations[key];
      if (text) setNarration(text, 'action');
    }
  }, [showWeights, narrationEnabled, setNarration]);

  useEffect(() => {
    if (!narrationEnabled) return;
    if (showDataFlow !== prevDataFlowRef.current) {
      prevDataFlowRef.current = showDataFlow;
      const key = showDataFlow ? 'toggle-dataflow' : 'toggle-dataflow-off';
      const text = actionNarrations[key];
      if (text) setNarration(text, 'action');
    }
  }, [showDataFlow, narrationEnabled, setNarration]);

  useEffect(() => {
    if (!narrationEnabled) return;
    if (showLabels !== prevLabelsRef.current) {
      prevLabelsRef.current = showLabels;
      const key = showLabels ? 'toggle-labels' : 'toggle-labels-off';
      const text = actionNarrations[key];
      if (text) setNarration(text, 'action');
    }
  }, [showLabels, narrationEnabled, setNarration]);

  useEffect(() => {
    if (!narrationEnabled) return;
    if (lightConeEnabled !== prevLightConeRef.current) {
      prevLightConeRef.current = lightConeEnabled;
      const key = lightConeEnabled ? 'toggle-lightcone' : 'toggle-lightcone-off';
      const text = actionNarrations[key];
      if (text) setNarration(text, 'action');
    }
  }, [lightConeEnabled, narrationEnabled, setNarration]);

  useEffect(() => {
    if (!narrationEnabled) return;
    if (autoRotate !== prevAutoRotateRef.current) {
      prevAutoRotateRef.current = autoRotate;
      const key = autoRotate ? 'toggle-autorotate' : 'toggle-autorotate-off';
      const text = actionNarrations[key];
      if (text) setNarration(text, 'action');
    }
  }, [autoRotate, narrationEnabled, setNarration]);

  // ---- TRIGGER: Idle tips ----
  useEffect(() => {
    if (!narrationEnabled || !currentModel) return;

    function scheduleTip() {
      tipTimerRef.current = setTimeout(() => {
        const { simulationRunning: simRunning, isTyping: typing } = useNarrationStore.getState();
        if (!simRunning && !typing) {
          const randomTip = tipNarrations[Math.floor(Math.random() * tipNarrations.length)];
          setNarration(randomTip, 'tip');
        }
        scheduleTip();
      }, 20000); // Show a tip every 20 seconds of idle
    }

    scheduleTip();
    return () => {
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    };
  }, [narrationEnabled, currentModel, setNarration]);

  // ---- SIMULATION: Generate steps and run ----
  const runSimulation = useCallback(() => {
    if (!currentModel) return;

    let steps: SimulationStep[] = [];

    switch (currentModel.type) {
      case 'ann':
        steps = generateANNSimulationSteps((currentModel as ANNModel).layers);
        break;
      case 'cnn':
        steps = generateCNNSimulationSteps((currentModel as CNNModel).layers);
        break;
      case 'llm':
        steps = generateLLMSimulationSteps(
          (currentModel as LLMModel).layers,
          (currentModel as LLMModel).config,
        );
        break;
    }

    if (steps.length === 0) return;

    simulationStepsRef.current = steps;
    startSimulation(steps.length);

    // Show first step
    const firstStep = steps[0];
    setNarration(firstStep.text, 'simulation');
    selectLayer(currentModel.layers[firstStep.layerIndex]?.id ?? null);
  }, [currentModel, startSimulation, setNarration, selectLayer]);

  // Advance simulation when step changes
  useEffect(() => {
    if (!simulationRunning) return;

    const steps = simulationStepsRef.current;
    const currentStep = steps[simulationStep];
    if (!currentStep) return;

    simulationTimerRef.current = setTimeout(() => {
      if (simulationStep < steps.length - 1) {
        advanceSimulation();
        const nextStep = steps[simulationStep + 1];
        if (nextStep && currentModel) {
          setNarration(nextStep.text, 'simulation');
          selectLayer(currentModel.layers[nextStep.layerIndex]?.id ?? null);
        }
      } else {
        stopSimulation();
      }
    }, currentStep.duration);

    return () => {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    };
  }, [simulationRunning, simulationStep, currentModel, advanceSimulation, stopSimulation, setNarration, selectLayer, simulationTotalSteps]);

  // Don't render if narration is disabled
  if (!narrationEnabled) {
    return (
      <button
        onClick={toggleNarration}
        className="fixed bottom-24 z-50 w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer narration-toggle-btn"
        style={{
          left: sidebarOpen ? '310px' : '16px',
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 229, 255, 0.06))',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          color: 'var(--accent-cyan)',
          transition: 'left 400ms cubic-bezier(0.16, 1, 0.3, 1), all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        title="Enable Narration (N)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );
  }

  const IconComponent = ICON_MAP[currentIcon];
  const iconColor = ICON_COLOR_MAP[currentIcon];

  // Only show history entries that are not the current narration
  const historyToShow = narrationHistory
    .filter((entry) => entry.text !== currentNarration)
    .slice(-2);

  return (
    <div
      className="fixed bottom-24 z-50 narration-panel-enter"
      style={{
        left: sidebarOpen ? '310px' : '16px',
        maxWidth: '420px',
        width: 'calc(100vw - 340px)',
        minWidth: '300px',
        transition: 'left 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* History (collapsible) */}
      {showHistory && historyToShow.length > 0 && (
        <div className="mb-2 flex flex-col gap-1.5 narration-history-enter">
          {historyToShow.map((entry, i) => {
            const HistIcon = ICON_MAP[entry.icon];
            const histColor = ICON_COLOR_MAP[entry.icon];
            return (
              <div
                key={entry.timestamp}
                className="glass-panel rounded-xl px-3.5 py-2.5 flex items-start gap-2.5"
                style={{
                  opacity: 0.5 + i * 0.2,
                  fontSize: '11px',
                  lineHeight: '1.5',
                }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: histColor }}>
                  <HistIcon />
                </span>
                <p style={{ color: 'var(--text-muted)' }}>{entry.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Main narration panel */}
      <div
        className="glass-panel-strong rounded-2xl px-4 py-3.5"
        style={{
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{
                background: `color-mix(in srgb, ${iconColor} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${iconColor} 30%, transparent)`,
                color: iconColor,
              }}
            >
              <IconComponent />
            </div>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: iconColor }}
            >
              {currentIcon === 'model' ? 'Model Info' :
               currentIcon === 'layer' ? 'Layer Details' :
               currentIcon === 'action' ? 'Action' :
               currentIcon === 'simulation' ? 'Simulation' :
               'Tip'}
            </span>
            {simulationRunning && (
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
                style={{
                  color: 'var(--accent-cyan)',
                  background: 'rgba(0, 229, 255, 0.1)',
                }}
              >
                Step {simulationStep + 1}/{simulationTotalSteps}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* History toggle */}
            {narrationHistory.length > 1 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer"
                style={{
                  background: showHistory ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
                title="Toggle history"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2v8M2 6h8" />
                </svg>
              </button>
            )}

            {/* Simulation button */}
            {currentModel && !simulationRunning && (
              <button
                onClick={runSimulation}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 229, 255, 0.06))',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(0, 229, 255, 0.25)',
                }}
                title="Run forward pass simulation with narration"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 1l8 5-8 5V1z" />
                </svg>
                Simulate
              </button>
            )}

            {simulationRunning && (
              <button
                onClick={stopSimulation}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.12), rgba(255, 82, 82, 0.06))',
                  color: 'var(--accent-red)',
                  border: '1px solid rgba(255, 82, 82, 0.25)',
                }}
                title="Stop simulation"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="2" y="2" width="8" height="8" rx="1" />
                </svg>
                Stop
              </button>
            )}

            {/* Close button */}
            <button
              onClick={toggleNarration}
              className="w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer"
              style={{
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
              }}
              title="Hide narration (N)"
            >
              <svg width="8" height="8" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Narration text with typewriter effect */}
        <div
          className="text-[13px] leading-relaxed min-h-[40px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {displayed || (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Interact with the visualizer to see explanations...
            </span>
          )}
          {!done && <span className="narration-cursor">|</span>}
        </div>

        {/* Progress bar for simulation */}
        {simulationRunning && (
          <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${((simulationStep + 1) / simulationTotalSteps) * 100}%`,
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
                transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 8px rgba(0, 229, 255, 0.3)',
              }}
            />
          </div>
        )}

        {/* Keyboard hint */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Press</span>
          <kbd className="kbd-key" style={{ fontSize: '8px', padding: '0px 4px', minWidth: '14px', borderBottomWidth: '1.5px' }}>N</kbd>
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>to toggle</span>
        </div>
      </div>
    </div>
  );
}
