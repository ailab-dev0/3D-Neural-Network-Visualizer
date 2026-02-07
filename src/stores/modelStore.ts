import { create } from 'zustand';
import { createSimpleMLP, createDeepMLP } from '../models/ann-schema';
import type { ANNModel } from '../models/ann-schema';
import { createLeNet5, createMiniResNet } from '../models/cnn-schema';
import type { CNNModel } from '../models/cnn-schema';
import { createGPT2Small, createBERTTiny, createNanoTransformer } from '../models/llm-schema';
import type { LLMModel } from '../models/llm-schema';

export type NetworkModel = ANNModel | CNNModel | LLMModel;
export type ModelType = 'ann' | 'cnn' | 'llm';

export interface ModelPreset {
  id: string;
  name: string;
  type: ModelType;
  description: string;
  create: () => NetworkModel;
}

export const MODEL_PRESETS: ModelPreset[] = [
  { id: 'simple-mlp', name: 'Simple MLP', type: 'ann', description: '3-layer perceptron for classification', create: createSimpleMLP },
  { id: 'deep-mlp', name: 'Deep MLP', type: 'ann', description: 'Deep network with dropout', create: createDeepMLP },
  { id: 'lenet5', name: 'LeNet-5', type: 'cnn', description: 'Classic CNN for digit recognition', create: createLeNet5 },
  { id: 'mini-resnet', name: 'Mini ResNet', type: 'cnn', description: 'ResNet with skip connections', create: createMiniResNet },
  { id: 'gpt2-small', name: 'GPT-2 Small', type: 'llm', description: 'Decoder-only transformer', create: createGPT2Small },
  { id: 'bert-tiny', name: 'BERT Tiny', type: 'llm', description: 'Encoder-only transformer', create: createBERTTiny },
  { id: 'nano-transformer', name: 'Nano Transformer', type: 'llm', description: 'Minimal transformer for learning', create: createNanoTransformer },
];

interface ModelState {
  currentModel: NetworkModel | null;
  currentPresetId: string | null;
  modelType: ModelType;

  // Actions
  loadPreset: (presetId: string) => void;
  setModelType: (type: ModelType) => void;
  clearModel: () => void;
}

export const useModelStore = create<ModelState>((set) => ({
  currentModel: null,
  currentPresetId: null,
  modelType: 'ann',

  loadPreset: (presetId: string) => {
    const preset = MODEL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      set({
        currentModel: preset.create(),
        currentPresetId: presetId,
        modelType: preset.type,
      });
    }
  },

  setModelType: (type: ModelType) => {
    set({ modelType: type });
  },

  clearModel: () => {
    set({ currentModel: null, currentPresetId: null });
  },
}));
