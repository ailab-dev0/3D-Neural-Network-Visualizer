/** Schema for Convolutional Neural Network models */

export type CNNLayerType =
  | 'input'
  | 'conv2d'
  | 'maxpool'
  | 'avgpool'
  | 'batchnorm'
  | 'dropout'
  | 'flatten'
  | 'dense'
  | 'output';

export interface CNNLayer {
  id: string;
  type: CNNLayerType;
  label?: string;

  // Spatial dimensions
  width?: number;
  height?: number;
  channels?: number;

  // Conv-specific
  kernelSize?: number;
  stride?: number;
  padding?: number;
  filters?: number;

  // Pool-specific
  poolSize?: number;

  // Dense-specific
  neurons?: number;
  activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear';
  dropout?: number;

  // Skip connection target
  skipTo?: string;
}

export interface CNNModel {
  type: 'cnn';
  name: string;
  description?: string;
  layers: CNNLayer[];
  metadata?: {
    framework?: string;
    trainedOn?: string;
    accuracy?: number;
    parameters?: number;
    flops?: number;
  };
}

/** LeNet-5 preset */
export function createLeNet5(): CNNModel {
  return {
    type: 'cnn',
    name: 'LeNet-5',
    description: 'Classic CNN architecture by Yann LeCun (1998) for handwritten digit recognition',
    layers: [
      { id: 'input', type: 'input', width: 32, height: 32, channels: 1, label: 'Input (32x32x1)' },
      { id: 'conv1', type: 'conv2d', filters: 6, kernelSize: 5, stride: 1, padding: 0, activation: 'tanh', width: 28, height: 28, channels: 6, label: 'Conv1 (5x5, 6 filters)' },
      { id: 'pool1', type: 'avgpool', poolSize: 2, width: 14, height: 14, channels: 6, label: 'AvgPool (2x2)' },
      { id: 'conv2', type: 'conv2d', filters: 16, kernelSize: 5, stride: 1, padding: 0, activation: 'tanh', width: 10, height: 10, channels: 16, label: 'Conv2 (5x5, 16 filters)' },
      { id: 'pool2', type: 'avgpool', poolSize: 2, width: 5, height: 5, channels: 16, label: 'AvgPool (2x2)' },
      { id: 'flatten', type: 'flatten', neurons: 400, label: 'Flatten (400)' },
      { id: 'fc1', type: 'dense', neurons: 120, activation: 'tanh', label: 'FC1 (120)' },
      { id: 'fc2', type: 'dense', neurons: 84, activation: 'tanh', label: 'FC2 (84)' },
      { id: 'output', type: 'output', neurons: 10, activation: 'softmax', label: 'Output (10)' },
    ],
    metadata: {
      framework: 'PyTorch',
      trainedOn: 'MNIST',
      accuracy: 0.992,
      parameters: 61706,
    },
  };
}

/** Simple ResNet block preset */
export function createMiniResNet(): CNNModel {
  return {
    type: 'cnn',
    name: 'Mini ResNet',
    description: 'Simplified ResNet with skip connections for image classification',
    layers: [
      { id: 'input', type: 'input', width: 32, height: 32, channels: 3, label: 'Input (32x32x3)' },
      { id: 'conv1', type: 'conv2d', filters: 16, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 32, height: 32, channels: 16, label: 'Conv1 (3x3, 16)' },
      { id: 'bn1', type: 'batchnorm', width: 32, height: 32, channels: 16, label: 'BatchNorm' },
      // ResBlock 1
      { id: 'res1_conv1', type: 'conv2d', filters: 16, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 32, height: 32, channels: 16, label: 'ResBlock1 Conv1' },
      { id: 'res1_conv2', type: 'conv2d', filters: 16, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 32, height: 32, channels: 16, skipTo: 'bn1', label: 'ResBlock1 Conv2 (+skip)' },
      // ResBlock 2
      { id: 'res2_conv1', type: 'conv2d', filters: 32, kernelSize: 3, stride: 2, padding: 1, activation: 'relu', width: 16, height: 16, channels: 32, label: 'ResBlock2 Conv1 (stride 2)' },
      { id: 'res2_conv2', type: 'conv2d', filters: 32, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 16, height: 16, channels: 32, label: 'ResBlock2 Conv2' },
      { id: 'pool', type: 'avgpool', poolSize: 16, width: 1, height: 1, channels: 32, label: 'GlobalAvgPool' },
      { id: 'flatten', type: 'flatten', neurons: 32, label: 'Flatten' },
      { id: 'output', type: 'output', neurons: 10, activation: 'softmax', label: 'Output (10)' },
    ],
    metadata: {
      framework: 'PyTorch',
      trainedOn: 'CIFAR-10',
      accuracy: 0.91,
      parameters: 47530,
    },
  };
}
