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
      { id: 'input', type: 'input', neurons: 8, label: 'Input' },
      { id: 'hidden1', type: 'hidden', neurons: 16, activation: 'relu', label: 'Hidden 1' },
      { id: 'hidden2', type: 'hidden', neurons: 12, activation: 'relu', label: 'Hidden 2' },
      { id: 'output', type: 'output', neurons: 4, activation: 'softmax', label: 'Output' },
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
      { id: 'input', type: 'input', neurons: 16, label: 'Input' },
      { id: 'hidden1', type: 'hidden', neurons: 64, activation: 'relu', dropout: 0.3, label: 'Hidden 1' },
      { id: 'hidden2', type: 'hidden', neurons: 128, activation: 'relu', dropout: 0.3, label: 'Hidden 2' },
      { id: 'hidden3', type: 'hidden', neurons: 64, activation: 'relu', dropout: 0.2, label: 'Hidden 3' },
      { id: 'hidden4', type: 'hidden', neurons: 32, activation: 'relu', label: 'Hidden 4' },
      { id: 'output', type: 'output', neurons: 10, activation: 'softmax', label: 'Output' },
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
