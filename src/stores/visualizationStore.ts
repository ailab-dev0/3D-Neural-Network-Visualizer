import { create } from 'zustand';

export type ViewMode = 'orbit' | 'flythrough' | 'inspect';
export type AnimationState = 'idle' | 'playing' | 'paused' | 'stepping';
export type LightConeMode = 'forward' | 'backward' | 'both';

interface VisualizationState {
  // Camera
  viewMode: ViewMode;
  autoRotate: boolean;

  // Animation
  animationState: AnimationState;
  animationSpeed: number; // 0.1 to 3.0
  currentStep: number;
  totalSteps: number;

  // Layer selection
  selectedLayerId: string | null;
  hoveredLayerId: string | null;
  highlightedConnections: string[];

  // Visual settings
  showWeights: boolean;
  showActivations: boolean;
  showLabels: boolean;
  showDataFlow: boolean;
  glowIntensity: number; // 0 to 1
  neuronSize: number; // 0.5 to 2.0
  connectionOpacity: number; // 0 to 1

  // Cognitive Light Cone
  lightConeEnabled: boolean;
  lightConeMode: LightConeMode;
  lightConeDepth: number; // 1-10

  // Educational mode
  educationalMode: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setAutoRotate: (auto: boolean) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  step: () => void;
  setAnimationSpeed: (speed: number) => void;
  selectLayer: (layerId: string | null) => void;
  hoverLayer: (layerId: string | null) => void;
  toggleWeights: () => void;
  toggleActivations: () => void;
  toggleLabels: () => void;
  toggleDataFlow: () => void;
  setGlowIntensity: (intensity: number) => void;
  setNeuronSize: (size: number) => void;
  setConnectionOpacity: (opacity: number) => void;
  toggleLightCone: () => void;
  setLightConeMode: (mode: LightConeMode) => void;
  setLightConeDepth: (depth: number) => void;
  toggleEducationalMode: () => void;
}

export const useVisualizationStore = create<VisualizationState>((set) => ({
  viewMode: 'orbit',
  autoRotate: false,
  animationState: 'playing',
  animationSpeed: 1.0,
  currentStep: 0,
  totalSteps: 0,
  selectedLayerId: null,
  hoveredLayerId: null,
  highlightedConnections: [],
  showWeights: true,
  showActivations: true,
  showLabels: false,
  showDataFlow: false,
  glowIntensity: 0.35,
  neuronSize: 1.0,
  connectionOpacity: 0.25,
  lightConeEnabled: false,
  lightConeMode: 'both',
  lightConeDepth: 3,
  educationalMode: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setAutoRotate: (auto) => set({ autoRotate: auto }),
  play: () => set({ animationState: 'playing' }),
  pause: () => set({ animationState: 'paused' }),
  stop: () => set({ animationState: 'idle', currentStep: 0 }),
  step: () => set((s) => ({ animationState: 'stepping', currentStep: Math.min(s.currentStep + 1, s.totalSteps) })),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  selectLayer: (layerId) => set({ selectedLayerId: layerId }),
  hoverLayer: (layerId) => set({ hoveredLayerId: layerId }),
  toggleWeights: () => set((s) => ({ showWeights: !s.showWeights })),
  toggleActivations: () => set((s) => ({ showActivations: !s.showActivations })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleDataFlow: () => set((s) => ({ showDataFlow: !s.showDataFlow })),
  setGlowIntensity: (intensity) => set({ glowIntensity: intensity }),
  setNeuronSize: (size) => set({ neuronSize: size }),
  setConnectionOpacity: (opacity) => set({ connectionOpacity: opacity }),
  toggleLightCone: () => set((s) => ({ lightConeEnabled: !s.lightConeEnabled })),
  setLightConeMode: (mode) => set({ lightConeMode: mode }),
  setLightConeDepth: (depth) => set({ lightConeDepth: Math.max(1, Math.min(10, depth)) }),
  toggleEducationalMode: () => set((s) => ({ educationalMode: !s.educationalMode })),
}));
