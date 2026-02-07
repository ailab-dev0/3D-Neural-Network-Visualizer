/** Schema for Artificial Neural Network (fully-connected) models */

export interface ANNLayer {
  id: string;
  type: 'input' | 'hidden' | 'output';
  neurons: number;
  activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear';
  dropout?: number;
  label?: string;
}

export interface ANNConnection {
  fromLayer: string;
  toLayer: string;
  weights?: number[][]; // [fromNeuron][toNeuron]
  biases?: number[];
}

export interface ANNModel {
  type: 'ann';
  name: string;
  description?: string;
  layers: ANNLayer[];
  connections: ANNConnection[];
  metadata?: {
    framework?: string;
    trainedOn?: string;
    accuracy?: number;
    parameters?: number;
  };
}

/** Generate a simple MLP preset */
export function createSimpleMLP(): ANNModel {
  return {
    type: 'ann',
    name: 'Simple MLP',
    description: 'A 3-layer multi-layer perceptron for classification',
    layers: [
      { id: 'input', type: 'input', neurons: 8, label: 'Input Features (8)' },
      { id: 'hidden1', type: 'hidden', neurons: 16, activation: 'relu', label: 'Feature Extraction — Dense 16 (ReLU)' },
      { id: 'hidden2', type: 'hidden', neurons: 12, activation: 'relu', label: 'Decision Layer — Dense 12 (ReLU)' },
      { id: 'output', type: 'output', neurons: 4, activation: 'softmax', label: 'Classification Output (4 classes)' },
    ],
    connections: [
      { fromLayer: 'input', toLayer: 'hidden1' },
      { fromLayer: 'hidden1', toLayer: 'hidden2' },
      { fromLayer: 'hidden2', toLayer: 'output' },
    ],
    metadata: {
      parameters: 8 * 16 + 16 + 16 * 12 + 12 + 12 * 4 + 4,
      trainedOn: 'Iris Dataset',
      accuracy: 0.97,
    },
  };
}

/** Generate a deep MLP preset */
export function createDeepMLP(): ANNModel {
  return {
    type: 'ann',
    name: 'Deep MLP',
    description: 'A deep multi-layer perceptron with dropout regularization',
    layers: [
      { id: 'input', type: 'input', neurons: 16, label: 'Input Features (16)' },
      { id: 'hidden1', type: 'hidden', neurons: 64, activation: 'relu', dropout: 0.3, label: 'Feature Extraction — Dense 64 (ReLU, 30% dropout)' },
      { id: 'hidden2', type: 'hidden', neurons: 128, activation: 'relu', dropout: 0.3, label: 'Pattern Recognition — Dense 128 (ReLU, 30% dropout)' },
      { id: 'hidden3', type: 'hidden', neurons: 64, activation: 'relu', dropout: 0.2, label: 'Feature Compression — Dense 64 (ReLU, 20% dropout)' },
      { id: 'hidden4', type: 'hidden', neurons: 32, activation: 'relu', label: 'Decision Layer — Dense 32 (ReLU)' },
      { id: 'output', type: 'output', neurons: 10, activation: 'softmax', label: 'Classification Output (10 classes)' },
    ],
    connections: [
      { fromLayer: 'input', toLayer: 'hidden1' },
      { fromLayer: 'hidden1', toLayer: 'hidden2' },
      { fromLayer: 'hidden2', toLayer: 'hidden3' },
      { fromLayer: 'hidden3', toLayer: 'hidden4' },
      { fromLayer: 'hidden4', toLayer: 'output' },
    ],
    metadata: {
      parameters: 16 * 64 + 64 + 64 * 128 + 128 + 128 * 64 + 64 + 64 * 32 + 32 + 32 * 10 + 10,
      trainedOn: 'MNIST',
      accuracy: 0.98,
    },
  };
}

/** Generate an Autoencoder preset with encoder/decoder and bottleneck */
export function createAutoencoder(): ANNModel {
  return {
    type: 'ann',
    name: 'Autoencoder',
    description: 'Symmetric encoder-decoder architecture with a compressed bottleneck layer',
    layers: [
      { id: 'input', type: 'input', neurons: 64, label: 'Input Signal (64 dims)' },
      { id: 'enc1', type: 'hidden', neurons: 32, activation: 'relu', label: 'Encoder — Compression Stage 1 (64 → 32)' },
      { id: 'enc2', type: 'hidden', neurons: 16, activation: 'relu', label: 'Encoder — Compression Stage 2 (32 → 16)' },
      { id: 'bottleneck', type: 'hidden', neurons: 4, activation: 'relu', label: 'Latent Bottleneck — Compressed Representation (4 dims)' },
      { id: 'dec1', type: 'hidden', neurons: 16, activation: 'relu', label: 'Decoder — Expansion Stage 1 (4 → 16)' },
      { id: 'dec2', type: 'hidden', neurons: 32, activation: 'relu', label: 'Decoder — Expansion Stage 2 (16 → 32)' },
      { id: 'output', type: 'output', neurons: 64, activation: 'sigmoid', label: 'Reconstructed Output (64 dims)' },
    ],
    connections: [
      { fromLayer: 'input', toLayer: 'enc1' },
      { fromLayer: 'enc1', toLayer: 'enc2' },
      { fromLayer: 'enc2', toLayer: 'bottleneck' },
      { fromLayer: 'bottleneck', toLayer: 'dec1' },
      { fromLayer: 'dec1', toLayer: 'dec2' },
      { fromLayer: 'dec2', toLayer: 'output' },
    ],
    metadata: {
      parameters: 64 * 32 + 32 + 32 * 16 + 16 + 16 * 4 + 4 + 4 * 16 + 16 + 16 * 32 + 32 + 32 * 64 + 64,
      trainedOn: 'MNIST (unsupervised)',
    },
  };
}

/** Generate a minimal XOR network preset for teaching */
export function createXOR(): ANNModel {
  return {
    type: 'ann',
    name: 'XOR Network',
    description: 'Minimal 2-2-1 network that solves the classic XOR problem',
    layers: [
      { id: 'input', type: 'input', neurons: 2, label: 'Binary Inputs (A, B)' },
      { id: 'hidden1', type: 'hidden', neurons: 2, activation: 'tanh', label: 'Nonlinear Separation — Dense 2 (tanh)' },
      { id: 'output', type: 'output', neurons: 1, activation: 'sigmoid', label: 'XOR Decision Output (sigmoid)' },
    ],
    connections: [
      { fromLayer: 'input', toLayer: 'hidden1' },
      { fromLayer: 'hidden1', toLayer: 'output' },
    ],
    metadata: {
      parameters: 2 * 2 + 2 + 2 * 1 + 1,
      trainedOn: 'XOR truth table',
      accuracy: 1.0,
    },
  };
}
