import { useEffect, useRef, useState, useCallback } from 'react';
import { useNarrationStore, type NarrationEntry } from '../../stores/narrationStore';
import { useModelStore } from '../../stores/modelStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useUIStore } from '../../stores/uiStore';
import { voiceNarrator } from '../../utils/speech';
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

/* ============================================
   Speaker Icons for voice controls
   ============================================ */
function SpeakerOnIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
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
   Audio Waveform Animation Component
   ============================================ */
function AudioWaveform() {
  return (
    <div className="voice-waveform" title="Voice is speaking">
      <span className="voice-waveform-bar voice-waveform-bar-1" />
      <span className="voice-waveform-bar voice-waveform-bar-2" />
      <span className="voice-waveform-bar voice-waveform-bar-3" />
    </div>
  );
}

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
  const voiceEnabled = useNarrationStore((s) => s.voiceEnabled);
  const voiceRate = useNarrationStore((s) => s.voiceRate);
  const voiceVolume = useNarrationStore((s) => s.voiceVolume);
  const toggleVoice = useNarrationStore((s) => s.toggleVoice);

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
  const play = useVisualizationStore((s) => s.play);
  const toggleDataFlowFn = useVisualizationStore((s) => s.toggleDataFlow);

  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const { displayed, done } = useTypewriter(currentNarration, 25);
  const [showHistory, setShowHistory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
  const speakingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync voiceNarrator settings with store
  useEffect(() => {
    voiceNarrator.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  useEffect(() => {
    voiceNarrator.setRate(voiceRate);
  }, [voiceRate]);

  useEffect(() => {
    voiceNarrator.setVolume(voiceVolume);
  }, [voiceVolume]);

  // Poll speaking state for UI indicator
  useEffect(() => {
    speakingPollRef.current = setInterval(() => {
      setIsSpeaking(voiceNarrator.isSpeaking());
    }, 200);
    return () => {
      if (speakingPollRef.current) clearInterval(speakingPollRef.current);
    };
  }, []);

  // Speak narrations when they change (non-simulation narrations)
  useEffect(() => {
    if (!narrationEnabled || !currentNarration || !voiceEnabled) return;
    // Only auto-speak non-simulation narrations here.
    // Simulation narrations are handled by the simulation flow.
    const state = useNarrationStore.getState();
    if (state.simulationRunning) return;

    voiceNarrator.speak(currentNarration);
  }, [currentNarration, narrationEnabled, voiceEnabled]);

  // Stop voice when narration is disabled or voice is toggled off
  useEffect(() => {
    if (!narrationEnabled || !voiceEnabled) {
      voiceNarrator.stop();
    }
  }, [narrationEnabled, voiceEnabled]);

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

  // ---- SIMULATION: Generate steps and run with voice sync ----
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

    // Start visualization: play animation and enable data flow
    const vizState = useVisualizationStore.getState();
    if (vizState.animationState !== 'playing') {
      play();
    }
    if (!vizState.showDataFlow) {
      toggleDataFlowFn();
    }

    // Show first step and speak it
    const firstStep = steps[0];
    setNarration(firstStep.text, 'simulation');
    selectLayer(currentModel.layers[firstStep.layerIndex]?.id ?? null);

    // Speak the first step with voice
    if (voiceEnabled) {
      voiceNarrator.speak(firstStep.text);
    }
  }, [currentModel, startSimulation, setNarration, selectLayer, play, toggleDataFlowFn, voiceEnabled]);

  // Advance simulation when step changes — voice-synchronized
  useEffect(() => {
    if (!simulationRunning) return;

    const steps = simulationStepsRef.current;
    const currentStep = steps[simulationStep];
    if (!currentStep) return;

    // Determine wait time: use step duration, but if voice is enabled,
    // use a minimum that allows speech to complete (with a timeout cap)
    const baseDuration = currentStep.duration;
    const voiceActive = useNarrationStore.getState().voiceEnabled;

    // If voice is active, wait for speech to end OR timeout (whichever first)
    // The timeout prevents getting stuck if speech API has issues
    const maxWait = voiceActive ? Math.max(baseDuration, 8000) : baseDuration;

    let resolved = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    function advance() {
      if (resolved) return;
      resolved = true;

      if (pollInterval) clearInterval(pollInterval);
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);

      const stepsLocal = simulationStepsRef.current;
      const stepLocal = simulationStep;

      if (stepLocal < stepsLocal.length - 1) {
        advanceSimulation();
        const nextStep = stepsLocal[stepLocal + 1];
        if (nextStep && currentModel) {
          setNarration(nextStep.text, 'simulation');
          selectLayer(currentModel.layers[nextStep.layerIndex]?.id ?? null);

          // Speak the next step
          if (useNarrationStore.getState().voiceEnabled) {
            voiceNarrator.speak(nextStep.text);
          }
        }
      } else {
        // Last step finished
        if (useNarrationStore.getState().voiceEnabled) {
          voiceNarrator.speak('Simulation complete.');
        }
        stopSimulation();
      }
    }

    if (voiceActive) {
      // Wait for speech to finish, with a maximum timeout
      pollInterval = setInterval(() => {
        if (!voiceNarrator.isSpeaking()) {
          if (pollInterval) clearInterval(pollInterval);
          // Small pause between steps for natural pacing
          simulationTimerRef.current = setTimeout(advance, 400);
        }
      }, 150);

      // Safety timeout
      simulationTimerRef.current = setTimeout(() => {
        if (pollInterval) clearInterval(pollInterval);
        advance();
      }, maxWait);

      return () => {
        if (pollInterval) clearInterval(pollInterval);
        if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      };
    } else {
      // No voice: use original duration-based timing
      simulationTimerRef.current = setTimeout(advance, baseDuration);

      return () => {
        if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      };
    }
  }, [simulationRunning, simulationStep, currentModel, advanceSimulation, stopSimulation, setNarration, selectLayer, simulationTotalSteps]);

  // Stop voice when simulation stops
  const handleStopSimulation = useCallback(() => {
    voiceNarrator.stop();
    stopSimulation();
  }, [stopSimulation]);

  // Handle voice toggle from panel button
  const handleToggleVoice = useCallback(() => {
    toggleVoice();
  }, [toggleVoice]);

  // Don't render if narration is disabled
  if (!narrationEnabled) {
    return (
      <button
        onClick={toggleNarration}
        className="fixed bottom-20 z-40 w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer narration-toggle-btn"
        style={{
          left: sidebarOpen ? '296px' : '16px',
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 229, 255, 0.06))',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          color: 'var(--accent-cyan)',
          transition: 'left 300ms ease, all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
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
      className="fixed bottom-20 z-40 narration-panel-enter"
      style={{
        left: sidebarOpen ? '296px' : '16px',
        maxWidth: '460px',
        width: 'calc(100vw - 340px)',
        minWidth: '300px',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        transition: 'left 300ms ease',
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
        className="glass-panel-strong rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Gradient accent at top */}
        <div
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${iconColor}, transparent)`,
            opacity: 0.5,
          }}
        />
      <div className="px-5 py-4">
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
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md"
                style={{
                  color: 'var(--accent-cyan)',
                  background: 'rgba(0, 229, 255, 0.12)',
                  border: '1px solid rgba(0, 229, 255, 0.2)',
                }}
              >
                Step {simulationStep + 1}/{simulationTotalSteps}
              </span>
            )}
            {/* Audio waveform indicator when speaking */}
            {isSpeaking && voiceEnabled && <AudioWaveform />}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Voice toggle button */}
            <button
              onClick={handleToggleVoice}
              className={`w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer ${isSpeaking && voiceEnabled ? 'voice-speaker-pulse' : ''}`}
              style={{
                background: voiceEnabled ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                color: voiceEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: voiceEnabled ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid var(--border)',
                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              title={voiceEnabled ? 'Mute voice (V)' : 'Enable voice (V)'}
            >
              {voiceEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
            </button>

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
                onClick={handleStopSimulation}
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
          style={{ color: 'var(--text-secondary)', overflowWrap: 'break-word', wordBreak: 'break-word' }}
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
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
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
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Press</span>
          <kbd className="kbd-key" style={{ fontSize: '8px', padding: '0px 4px', minWidth: '14px', borderBottomWidth: '1.5px' }}>N</kbd>
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>to toggle</span>
          <span className="text-[9px] ml-1" style={{ color: 'var(--text-muted)' }}>|</span>
          <kbd className="kbd-key" style={{ fontSize: '8px', padding: '0px 4px', minWidth: '14px', borderBottomWidth: '1.5px' }}>V</kbd>
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>voice</span>
        </div>
      </div>
      </div>
    </div>
  );
}
