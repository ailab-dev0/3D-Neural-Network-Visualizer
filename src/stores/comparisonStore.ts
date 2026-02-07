import { create } from 'zustand';
import { MODEL_PRESETS, type NetworkModel } from './modelStore';

interface ComparisonState {
  comparisonMode: boolean;
  modelA: { presetId: string; model: NetworkModel } | null;
  modelB: { presetId: string; model: NetworkModel } | null;

  // Actions
  enableComparison: () => void;
  disableComparison: () => void;
  setModelA: (presetId: string) => void;
  setModelB: (presetId: string) => void;
  swapModels: () => void;
  clearComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  comparisonMode: false,
  modelA: null,
  modelB: null,

  enableComparison: () => set({ comparisonMode: true }),

  disableComparison: () => set({ comparisonMode: false }),

  setModelA: (presetId: string) => {
    const preset = MODEL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      set({ modelA: { presetId, model: preset.create() } });
    }
  },

  setModelB: (presetId: string) => {
    const preset = MODEL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      set({ modelB: { presetId, model: preset.create() } });
    }
  },

  swapModels: () =>
    set((state) => ({
      modelA: state.modelB,
      modelB: state.modelA,
    })),

  clearComparison: () =>
    set({
      comparisonMode: false,
      modelA: null,
      modelB: null,
    }),
}));
