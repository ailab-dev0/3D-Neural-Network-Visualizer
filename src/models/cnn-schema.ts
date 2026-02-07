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
      { id: 'input', type: 'input', width: 32, height: 32, channels: 1, label: 'Grayscale Image Input (32x32x1)' },
      { id: 'conv1', type: 'conv2d', filters: 6, kernelSize: 5, stride: 1, padding: 0, activation: 'tanh', width: 28, height: 28, channels: 6, label: 'Conv2D — Edge Detection (6 filters, 5x5, tanh) → 28x28' },
      { id: 'pool1', type: 'avgpool', poolSize: 2, width: 14, height: 14, channels: 6, label: 'Avg Pooling 2x2 — Spatial Downsampling → 14x14' },
      { id: 'conv2', type: 'conv2d', filters: 16, kernelSize: 5, stride: 1, padding: 0, activation: 'tanh', width: 10, height: 10, channels: 16, label: 'Conv2D — Shape Detection (16 filters, 5x5, tanh) → 10x10' },
      { id: 'pool2', type: 'avgpool', poolSize: 2, width: 5, height: 5, channels: 16, label: 'Avg Pooling 2x2 — Spatial Downsampling → 5x5' },
      { id: 'flatten', type: 'flatten', neurons: 400, label: 'Flatten — Feature Maps to Vector (400)' },
      { id: 'fc1', type: 'dense', neurons: 120, activation: 'tanh', label: 'Fully Connected — Feature Combination (120, tanh)' },
      { id: 'fc2', type: 'dense', neurons: 84, activation: 'tanh', label: 'Fully Connected — Decision Layer (84, tanh)' },
      { id: 'output', type: 'output', neurons: 10, activation: 'softmax', label: 'Digit Classification Output (10 classes)' },
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
      { id: 'input', type: 'input', width: 32, height: 32, channels: 3, label: 'RGB Image Input (32x32x3)' },
      { id: 'conv1', type: 'conv2d', filters: 16, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 32, height: 32, channels: 16, label: 'Initial Conv2D — Low-Level Features (16 filters, 3x3, ReLU)' },
      { id: 'bn1', type: 'batchnorm', width: 32, height: 32, channels: 16, label: 'Batch Normalization — Stabilize Training' },
      // ResBlock 1
      { id: 'res1_conv1', type: 'conv2d', filters: 16, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 32, height: 32, channels: 16, label: 'ResBlock 1 — Conv2D A (16 filters, 3x3, ReLU)' },
      { id: 'res1_conv2', type: 'conv2d', filters: 16, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 32, height: 32, channels: 16, skipTo: 'bn1', label: 'ResBlock 1 — Conv2D B + Skip Connection (identity shortcut)' },
      // ResBlock 2
      { id: 'res2_conv1', type: 'conv2d', filters: 32, kernelSize: 3, stride: 2, padding: 1, activation: 'relu', width: 16, height: 16, channels: 32, label: 'ResBlock 2 — Conv2D A (32 filters, 3x3, stride 2 downsampling)' },
      { id: 'res2_conv2', type: 'conv2d', filters: 32, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 16, height: 16, channels: 32, label: 'ResBlock 2 — Conv2D B (32 filters, 3x3, ReLU)' },
      { id: 'pool', type: 'avgpool', poolSize: 16, width: 1, height: 1, channels: 32, label: 'Global Average Pooling — Spatial Summarization (16x16 → 1x1)' },
      { id: 'flatten', type: 'flatten', neurons: 32, label: 'Flatten — Feature Vector (32)' },
      { id: 'output', type: 'output', neurons: 10, activation: 'softmax', label: 'Image Classification Output (10 classes)' },
    ],
    metadata: {
      framework: 'PyTorch',
      trainedOn: 'CIFAR-10',
      accuracy: 0.91,
      parameters: 47530,
    },
  };
}

/** Simplified AlexNet preset (5 conv layers + 3 FC) */
export function createAlexNet(): CNNModel {
  return {
    type: 'cnn',
    name: 'AlexNet (Simplified)',
    description: 'Simplified AlexNet (Krizhevsky 2012) — the architecture that launched the deep learning era',
    layers: [
      { id: 'input', type: 'input', width: 227, height: 227, channels: 3, label: 'RGB Image Input (227x227x3)' },
      { id: 'conv1', type: 'conv2d', filters: 96, kernelSize: 11, stride: 4, padding: 0, activation: 'relu', width: 55, height: 55, channels: 96, label: 'Conv2D — Large Receptive Field (96 filters, 11x11, stride 4) → 55x55' },
      { id: 'pool1', type: 'maxpool', poolSize: 3, width: 27, height: 27, channels: 96, label: 'Max Pooling 3x3 — Downsample → 27x27' },
      { id: 'conv2', type: 'conv2d', filters: 256, kernelSize: 5, stride: 1, padding: 2, activation: 'relu', width: 27, height: 27, channels: 256, label: 'Conv2D — Texture Detection (256 filters, 5x5, ReLU) → 27x27' },
      { id: 'pool2', type: 'maxpool', poolSize: 3, width: 13, height: 13, channels: 256, label: 'Max Pooling 3x3 — Downsample → 13x13' },
      { id: 'conv3', type: 'conv2d', filters: 384, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 13, height: 13, channels: 384, label: 'Conv2D — Pattern Combination (384 filters, 3x3, ReLU)' },
      { id: 'conv4', type: 'conv2d', filters: 384, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 13, height: 13, channels: 384, label: 'Conv2D — Abstract Features (384 filters, 3x3, ReLU)' },
      { id: 'conv5', type: 'conv2d', filters: 256, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 13, height: 13, channels: 256, label: 'Conv2D — High-Level Features (256 filters, 3x3, ReLU)' },
      { id: 'pool3', type: 'maxpool', poolSize: 3, width: 6, height: 6, channels: 256, label: 'Max Pooling 3x3 — Final Downsample → 6x6' },
      { id: 'flatten', type: 'flatten', neurons: 9216, label: 'Flatten — Feature Maps to Vector (9216)' },
      { id: 'fc1', type: 'dense', neurons: 512, activation: 'relu', dropout: 0.5, label: 'Fully Connected — Feature Integration (512, ReLU, 50% dropout)' },
      { id: 'fc2', type: 'dense', neurons: 512, activation: 'relu', dropout: 0.5, label: 'Fully Connected — Decision Layer (512, ReLU, 50% dropout)' },
      { id: 'output', type: 'output', neurons: 1000, activation: 'softmax', label: 'ImageNet Classification Output (1000 classes)' },
    ],
    metadata: {
      framework: 'PyTorch',
      trainedOn: 'ImageNet',
      accuracy: 0.633,
      parameters: 62_378_344,
    },
  };
}

/** Simplified VGG-11 preset */
export function createVGG11(): CNNModel {
  return {
    type: 'cnn',
    name: 'VGG-11 (Simplified)',
    description: 'Simplified VGG-11 (Simonyan & Zisserman 2014) — uniform 3x3 conv design philosophy',
    layers: [
      { id: 'input', type: 'input', width: 224, height: 224, channels: 3, label: 'RGB Image Input (224x224x3)' },
      // Block 1
      { id: 'conv1', type: 'conv2d', filters: 64, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 224, height: 224, channels: 64, label: 'Block 1 — Conv2D Edge Detection (64 filters, 3x3, ReLU)' },
      { id: 'pool1', type: 'maxpool', poolSize: 2, width: 112, height: 112, channels: 64, label: 'Block 1 — Max Pooling 2x2 → 112x112' },
      // Block 2
      { id: 'conv2', type: 'conv2d', filters: 128, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 112, height: 112, channels: 128, label: 'Block 2 — Conv2D Texture Features (128 filters, 3x3, ReLU)' },
      { id: 'pool2', type: 'maxpool', poolSize: 2, width: 56, height: 56, channels: 128, label: 'Block 2 — Max Pooling 2x2 → 56x56' },
      // Block 3
      { id: 'conv3a', type: 'conv2d', filters: 256, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 56, height: 56, channels: 256, label: 'Block 3 — Conv2D Shape Features A (256 filters, 3x3, ReLU)' },
      { id: 'conv3b', type: 'conv2d', filters: 256, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 56, height: 56, channels: 256, label: 'Block 3 — Conv2D Shape Features B (256 filters, 3x3, ReLU)' },
      { id: 'pool3', type: 'maxpool', poolSize: 2, width: 28, height: 28, channels: 256, label: 'Block 3 — Max Pooling 2x2 → 28x28' },
      // Block 4
      { id: 'conv4a', type: 'conv2d', filters: 512, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 28, height: 28, channels: 512, label: 'Block 4 — Conv2D Object Parts A (512 filters, 3x3, ReLU)' },
      { id: 'conv4b', type: 'conv2d', filters: 512, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 28, height: 28, channels: 512, label: 'Block 4 — Conv2D Object Parts B (512 filters, 3x3, ReLU)' },
      { id: 'pool4', type: 'maxpool', poolSize: 2, width: 14, height: 14, channels: 512, label: 'Block 4 — Max Pooling 2x2 → 14x14' },
      // Block 5
      { id: 'conv5a', type: 'conv2d', filters: 512, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 14, height: 14, channels: 512, label: 'Block 5 — Conv2D Semantic Features A (512 filters, 3x3, ReLU)' },
      { id: 'conv5b', type: 'conv2d', filters: 512, kernelSize: 3, stride: 1, padding: 1, activation: 'relu', width: 14, height: 14, channels: 512, label: 'Block 5 — Conv2D Semantic Features B (512 filters, 3x3, ReLU)' },
      { id: 'pool5', type: 'maxpool', poolSize: 2, width: 7, height: 7, channels: 512, label: 'Block 5 — Max Pooling 2x2 → 7x7' },
      // Classifier
      { id: 'flatten', type: 'flatten', neurons: 512, label: 'Flatten — Feature Maps to Vector (512)' },
      { id: 'fc1', type: 'dense', neurons: 256, activation: 'relu', dropout: 0.5, label: 'Classifier — Feature Integration (256, ReLU, 50% dropout)' },
      { id: 'fc2', type: 'dense', neurons: 256, activation: 'relu', dropout: 0.5, label: 'Classifier — Decision Layer (256, ReLU, 50% dropout)' },
      { id: 'output', type: 'output', neurons: 1000, activation: 'softmax', label: 'ImageNet Classification Output (1000 classes)' },
    ],
    metadata: {
      framework: 'PyTorch',
      trainedOn: 'ImageNet',
      accuracy: 0.692,
      parameters: 132_863_336,
    },
  };
}
