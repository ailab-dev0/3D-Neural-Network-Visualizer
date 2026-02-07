import { create } from 'zustand';
import { createSimpleMLP, createDeepMLP, createAutoencoder, createXOR } from '../models/ann-schema';
import type { ANNModel } from '../models/ann-schema';
import { createLeNet5, createMiniResNet, createAlexNet, createVGG11 } from '../models/cnn-schema';
import type { CNNModel } from '../models/cnn-schema';
import { createGPT2Small, createBERTTiny, createNanoTransformer, createTinyLlama, createMiniGPT } from '../models/llm-schema';
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
  // ANN presets
  { id: 'simple-mlp', name: 'Simple MLP', type: 'ann', description: '3-layer perceptron for classification', create: createSimpleMLP },
  { id: 'deep-mlp', name: 'Deep MLP', type: 'ann', description: 'Deep network with dropout', create: createDeepMLP },
  { id: 'autoencoder', name: 'Autoencoder', type: 'ann', description: 'Encoder-decoder with compressed bottleneck', create: createAutoencoder },
  { id: 'xor-network', name: 'XOR Network', type: 'ann', description: 'Minimal 2-2-1 network for XOR problem', create: createXOR },
  // CNN presets
  { id: 'lenet5', name: 'LeNet-5', type: 'cnn', description: 'Classic CNN for digit recognition', create: createLeNet5 },
  { id: 'mini-resnet', name: 'Mini ResNet', type: 'cnn', description: 'ResNet with skip connections', create: createMiniResNet },
  { id: 'alexnet', name: 'AlexNet', type: 'cnn', description: 'Simplified AlexNet (5 conv + 3 FC)', create: createAlexNet },
  { id: 'vgg11', name: 'VGG-11', type: 'cnn', description: 'Simplified VGG-11 with uniform 3x3 convs', create: createVGG11 },
  // LLM presets
  { id: 'gpt2-small', name: 'GPT-2 Small', type: 'llm', description: 'Decoder-only transformer', create: createGPT2Small },
  { id: 'bert-tiny', name: 'BERT Tiny', type: 'llm', description: 'Encoder-only transformer', create: createBERTTiny },
  { id: 'nano-transformer', name: 'Nano Transformer', type: 'llm', description: 'Minimal transformer for learning', create: createNanoTransformer },
  { id: 'tiny-llama', name: 'Tiny Llama', type: 'llm', description: 'Small Llama-style model with SwiGLU', create: createTinyLlama },
  { id: 'mini-gpt', name: 'Mini GPT', type: 'llm', description: 'Minimal GPT for teaching transformers', create: createMiniGPT },
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
