# Model Schema & Data Format Reference

Definitive reference for the data model powering the 3D Neural Network Visualizer.
Covers every schema, type definition, preset, and the mapping from data to 3D visuals.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Common Types](#2-common-types)
3. [ANN (Artificial Neural Network) Schema](#3-ann-artificial-neural-network-schema)
4. [CNN (Convolutional Neural Network) Schema](#4-cnn-convolutional-neural-network-schema)
5. [LLM (Large Language Model / Transformer) Schema](#5-llm-large-language-model--transformer-schema)
6. [Preset Registry](#6-preset-registry)
7. [Adding New Models](#7-adding-new-models)
8. [Visualization Mapping](#8-visualization-mapping)

---

## 1. Overview

### Architecture

The model system is built around three pillars:

```
src/models/
  ann-schema.ts    -- ANN interfaces + factory functions
  cnn-schema.ts    -- CNN interfaces + factory functions
  llm-schema.ts    -- LLM interfaces + factory functions

src/stores/
  modelStore.ts    -- Zustand store, discriminated union, preset registry

src/utils/
  colors.ts        -- Color palette for every layer/weight/activation type
  math.ts          -- Layout math (positions, curves, spacing)
```

### Discriminated Union Pattern

All three model types are combined into a single discriminated union using the
`type` field as the discriminant:

```typescript
// src/stores/modelStore.ts
export type NetworkModel = ANNModel | CNNModel | LLMModel;
export type ModelType = 'ann' | 'cnn' | 'llm';
```

TypeScript narrows the type automatically:

```typescript
function processModel(model: NetworkModel) {
  switch (model.type) {
    case 'ann':
      // model is ANNModel -- access model.connections
      break;
    case 'cnn':
      // model is CNNModel -- access model.layers[0].kernelSize
      break;
    case 'llm':
      // model is LLMModel -- access model.config.nHeads
      break;
  }
}
```

### Preset Registry

Presets are registered as `ModelPreset` objects in the `MODEL_PRESETS` array.
Each preset carries a factory function that produces a fully-formed model object
on demand. The Zustand store exposes `loadPreset(id)` which looks up the preset,
calls its factory, and sets the result as the current model.

```
User selects preset  -->  loadPreset("lenet5")
                             |
                             v
                     MODEL_PRESETS.find(p => p.id === "lenet5")
                             |
                             v
                     preset.create()  -->  createLeNet5()  -->  CNNModel
                             |
                             v
                     set({ currentModel, currentPresetId, modelType })
```

---

## 2. Common Types

### Metadata

Every model type carries an optional `metadata` object. While the exact fields
differ slightly by model type, the common shape is:

```typescript
metadata?: {
  framework?: string;    // "PyTorch", "TensorFlow", etc.
  trainedOn?: string;    // Dataset name
  accuracy?: number;     // 0..1, top-1 accuracy
  parameters?: number;   // Total trainable parameter count
}
```

CNN models add one extra field:

```typescript
  flops?: number;        // Floating-point operations
```

LLM models add one extra field:

```typescript
  tokenizer?: string;    // "BPE", "WordPiece", "SentencePiece", "Character-level"
```

### Activation Functions

All layer types that support activations share the same union:

```typescript
activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear';
```

LLM feed-forward layers use a separate set:

```typescript
activation?: 'gelu' | 'relu' | 'swish';
```

### Color Palette (from `src/utils/colors.ts`)

| Key              | Hex       | Used for                    |
|------------------|-----------|-----------------------------|
| `input`          | `#4fc3f7` | Input layers (light blue)   |
| `hidden`         | `#b388ff` | Hidden / dense layers       |
| `output`         | `#69f0ae` | Output layers (green)       |
| `conv`           | `#ff8a65` | Convolution layers (orange) |
| `pool`           | `#ffab40` | Pooling layers (amber)      |
| `attention`      | `#f48fb1` | Attention layers (pink)     |
| `feedForward`    | `#80cbc4` | FFN layers (teal)           |
| `norm`           | `#90a4ae` | Normalization (blue-grey)   |
| `embedding`      | `#ce93d8` | Embedding layers            |
| `positiveWeight` | `#ffd54f` | Positive weight connections  |
| `negativeWeight` | `#42a5f5` | Negative weight connections  |
| `zeroWeight`     | `#616161` | Near-zero weight connections |
| `dataParticle`   | `#76ff03` | Forward-pass data flow      |
| `gradientParticle`| `#ff1744`| Gradient backprop flow      |

Activation-specific colors (from `getActivationColor`):

| Activation | Hex       |
|------------|-----------|
| `relu`     | `#ff5252` |
| `sigmoid`  | `#ffab40` |
| `tanh`     | `#40c4ff` |
| `softmax`  | `#69f0ae` |
| `gelu`     | `#ea80fc` |
| _(default)_| `#9e9e9e` |

### Layout Utilities (from `src/utils/math.ts`)

| Function                     | Purpose                                         |
|------------------------------|-------------------------------------------------|
| `calculateNeuronPositions`   | Arrange neurons in a grid within a layer plane   |
| `calculateFeatureMapPositions`| Compute 3D box dimensions for CNN feature maps  |
| `generateConnectionCurve`    | Create quadratic Bezier curves between neurons   |
| `calculateLayerDepths`       | Evenly space layers along the Z-axis             |
| `smoothStep`                 | Smooth interpolation `t*t*(3-2t)`                |
| `easeInOutCubic`             | Cubic ease-in-out for animations                 |
| `mapRange`                   | Linear remap from one range to another           |

---

## 3. ANN (Artificial Neural Network) Schema

**Source:** `src/models/ann-schema.ts`

### Type Definitions

```typescript
export interface ANNLayer {
  id: string;                                                // Unique layer identifier
  type: 'input' | 'hidden' | 'output';                      // Layer role
  neurons: number;                                           // Neuron count in this layer
  activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear';
  dropout?: number;                                          // Dropout rate (0..1)
  label?: string;                                            // Display label
}

export interface ANNConnection {
  fromLayer: string;           // Source layer ID
  toLayer: string;             // Target layer ID
  weights?: number[][];        // Weight matrix [fromNeuron][toNeuron]
  biases?: number[];           // Bias vector for the target layer
}

export interface ANNModel {
  type: 'ann';                 // Discriminant -- always 'ann'
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
```

### Layer Types

| Type     | Description                                    |
|----------|------------------------------------------------|
| `input`  | Entry point; no activation or dropout           |
| `hidden` | Interior fully-connected layer                  |
| `output` | Terminal layer; typically uses `softmax`/`sigmoid` |

### Properties

| Property     | Type       | Description                                          |
|--------------|------------|------------------------------------------------------|
| `neurons`    | `number`   | How many neurons in the layer                        |
| `activation` | `string?`  | Activation function applied after the linear transform |
| `dropout`    | `number?`  | Fraction of neurons randomly zeroed during training  |
| `weights`    | `number[][]?` | Optional explicit weight matrix on connections     |
| `biases`     | `number[]?`  | Optional explicit bias vector on connections        |

### Parameter Counting

For a connection between layers of size `m` and `n`:

```
parameters = m * n  (weights)  +  n  (biases)
```

Total model parameters = sum over all connections.

---

### Preset 1: Simple MLP

**Factory:** `createSimpleMLP()`

| Field       | Value                                  |
|-------------|----------------------------------------|
| Name        | Simple MLP                             |
| Description | A 3-layer multi-layer perceptron for classification |
| Dataset     | Iris Dataset                           |
| Accuracy    | 97%                                    |
| Parameters  | 372                                    |

**Architecture:**

```
  Input (8)     Hidden 1 (16)     Hidden 2 (12)     Output (4)
  --------      ------------      ------------      ----------
  o o o o       o o o o o o       o o o o o o       o o o o
  o o o o       o o o o o o       o o o o o o
                o o o o o o
                o o

  [no act]       [ReLU]            [ReLU]           [Softmax]

   8 ---------> 16 ------------> 12 ------------> 4
       128+16=144    192+12=204     48+4=52
```

**Parameter breakdown:**

| Connection             | Weights | Biases | Total |
|------------------------|---------|--------|-------|
| input -> hidden1       | 8x16=128  | 16   | 144   |
| hidden1 -> hidden2     | 16x12=192 | 12   | 204   |
| hidden2 -> output      | 12x4=48   | 4    | 52    |
| **Total**              |           |        | **400** |

**Use case:** Teaching basic MLP concepts; classification on small tabular
datasets like Iris.

---

### Preset 2: Deep MLP

**Factory:** `createDeepMLP()`

| Field       | Value                                         |
|-------------|-----------------------------------------------|
| Name        | Deep MLP                                      |
| Description | A deep multi-layer perceptron with dropout regularization |
| Dataset     | MNIST                                         |
| Accuracy    | 98%                                           |
| Parameters  | 19,626                                        |

**Architecture:**

```
  Input     Hidden 1    Hidden 2    Hidden 3    Hidden 4    Output
   (16)      (64)        (128)       (64)        (32)       (10)
    |          |            |           |           |          |
    o         oooo        oooooo      oooo        oooo       oooo
    o         oooo        oooooo      oooo        oooo       oooo
    o         oooo        oooooo      oooo        oooo       oo
    o         oooo        oooooo      oooo        oooo
   ...        ...          ...        ...         ...

  [none]   [ReLU]       [ReLU]      [ReLU]     [ReLU]    [Softmax]
           drop=0.3     drop=0.3    drop=0.2
```

```
  16 ----> 64 ----> 128 ----> 64 ----> 32 ----> 10
     1088    8320     8256     2080      330
```

**Parameter breakdown:**

| Connection              | Weights   | Biases | Total  |
|-------------------------|-----------|--------|--------|
| input -> hidden1        | 16x64=1024  | 64   | 1,088  |
| hidden1 -> hidden2      | 64x128=8192 | 128  | 8,320  |
| hidden2 -> hidden3      | 128x64=8192 | 64   | 8,256  |
| hidden3 -> hidden4      | 64x32=2048  | 32   | 2,080  |
| hidden4 -> output       | 32x10=320   | 10   | 330    |
| **Total**               |             |        | **20,074** |

**Use case:** Demonstrating deep network concepts: vanishing gradients, dropout
regularization, and training dynamics on MNIST.

---

### Preset 3: Autoencoder

**Factory:** `createAutoencoder()`

| Field       | Value                                                  |
|-------------|--------------------------------------------------------|
| Name        | Autoencoder                                            |
| Description | Symmetric encoder-decoder architecture with a compressed bottleneck layer |
| Dataset     | MNIST (unsupervised)                                   |
| Parameters  | 6,372                                                  |

**Architecture:**

```
                        ENCODER                 DECODER
  Input   Enc 1   Enc 2   Bottleneck   Dec 1   Dec 2   Output
  (64)    (32)    (16)       (4)       (16)    (32)    (64)
    |       |       |         |          |       |       |
  oooo    oooo    oooo       oo        oooo    oooo    oooo
  oooo    oooo    oooo       oo        oooo    oooo    oooo
  oooo    oooo    oooo                 oooo    oooo    oooo
  oooo    oooo    oooo                 oooo    oooo    oooo
  oooo    oooo                         oooo    oooo    oooo
  oooo    oooo                         oooo    oooo    oooo
  oooo    oooo                                 oooo    oooo
  oooo                                                 oooo

  64 --> 32 --> 16 --> 4 --> 16 --> 32 --> 64
    2080   528    68    80   528   2080
```

**Symmetry diagram:**

```
  64 ----\                        /---- 64
          32 ----\          /---- 32
                  16 -- 4 -- 16
          32 ----/          \---- 32
  64 ----/                        \---- 64
```

**Parameter breakdown:**

| Connection              | Weights    | Biases | Total  |
|-------------------------|------------|--------|--------|
| input -> enc1           | 64x32=2048   | 32   | 2,080  |
| enc1 -> enc2            | 32x16=512    | 16   | 528    |
| enc2 -> bottleneck      | 16x4=64      | 4    | 68     |
| bottleneck -> dec1      | 4x16=64      | 16   | 80     |
| dec1 -> dec2            | 16x32=512    | 32   | 544    |
| dec2 -> output          | 32x64=2048   | 64   | 2,112  |
| **Total**               |              |        | **5,412** |

**Use case:** Teaching unsupervised learning, dimensionality reduction, and
representation learning. The symmetric hourglass shape makes the
compression/reconstruction concept visually intuitive.

---

### Preset 4: XOR Network

**Factory:** `createXOR()`

| Field       | Value                                              |
|-------------|----------------------------------------------------|
| Name        | XOR Network                                        |
| Description | Minimal 2-2-1 network that solves the classic XOR problem |
| Dataset     | XOR truth table                                    |
| Accuracy    | 100%                                               |
| Parameters  | 9                                                  |

**Architecture:**

```
  Input (2)     Hidden (2)     Output (1)
  ---------     ----------     ----------
     o              o              o
     o              o

   [none]        [tanh]        [sigmoid]

   2 ----------> 2 ----------> 1
      4+2=6         2+1=3
```

**Truth table solved:**

```
  x1  x2  |  XOR
  ---------+------
   0   0   |   0
   0   1   |   1
   1   0   |   1
   1   1   |   0
```

**Parameter breakdown:**

| Connection          | Weights | Biases | Total |
|---------------------|---------|--------|-------|
| input -> hidden1    | 2x2=4   | 2      | 6     |
| hidden1 -> output   | 2x1=2   | 1      | 3     |
| **Total**           |         |        | **9** |

**Use case:** The classic teaching example for why neural networks need hidden
layers. A single perceptron cannot solve XOR; adding one hidden layer makes it
solvable. This is the smallest non-trivial fully-connected network.

---

## 4. CNN (Convolutional Neural Network) Schema

**Source:** `src/models/cnn-schema.ts`

### Type Definitions

```typescript
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

  // Spatial dimensions (for conv/pool layers)
  width?: number;
  height?: number;
  channels?: number;

  // Conv-specific
  kernelSize?: number;     // e.g. 3 for a 3x3 kernel
  stride?: number;         // Step size (default 1)
  padding?: number;        // Zero-padding pixels
  filters?: number;        // Number of output feature maps

  // Pool-specific
  poolSize?: number;       // e.g. 2 for 2x2 pooling window

  // Dense-specific
  neurons?: number;        // Neuron count for FC layers
  activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear';
  dropout?: number;

  // Skip connection target
  skipTo?: string;         // Layer ID that this layer adds a skip connection to
}

export interface CNNModel {
  type: 'cnn';             // Discriminant -- always 'cnn'
  name: string;
  description?: string;
  layers: CNNLayer[];      // Ordered list, connections are implicit (sequential)
  metadata?: {
    framework?: string;
    trainedOn?: string;
    accuracy?: number;
    parameters?: number;
    flops?: number;
  };
}
```

### Layer Types

| Type        | Description                                        |
|-------------|----------------------------------------------------|
| `input`     | Raw image input with width/height/channels          |
| `conv2d`    | 2D convolution with learnable filters               |
| `maxpool`   | Max pooling -- takes the max in each window         |
| `avgpool`   | Average pooling -- takes the mean in each window    |
| `batchnorm` | Batch normalization -- normalizes activations       |
| `dropout`   | Randomly zeroes feature map channels                |
| `flatten`   | Reshapes spatial tensor to 1D vector                |
| `dense`     | Fully connected layer                               |
| `output`    | Final classification layer                          |

### Key Properties

| Property     | Applies to           | Description                                |
|--------------|----------------------|--------------------------------------------|
| `width`      | spatial layers       | Spatial width of feature map               |
| `height`     | spatial layers       | Spatial height of feature map              |
| `channels`   | spatial layers       | Number of feature maps / channels          |
| `kernelSize` | `conv2d`             | Filter window size (e.g. 3 = 3x3)         |
| `stride`     | `conv2d`             | Step size for sliding the filter           |
| `padding`    | `conv2d`             | Zero-padding added to each side            |
| `filters`    | `conv2d`             | Number of output feature maps              |
| `poolSize`   | `maxpool`, `avgpool` | Pooling window size (e.g. 2 = 2x2)        |
| `neurons`    | `dense`, `output`, `flatten` | Neuron count for FC layers        |
| `skipTo`     | any                  | Layer ID for residual / skip connections   |

### Output Spatial Dimension Formula

For `conv2d`:

```
output_size = floor((input_size - kernelSize + 2 * padding) / stride) + 1
```

For `maxpool` / `avgpool`:

```
output_size = floor(input_size / poolSize)
```

### Connections

CNN connections are **implicit** -- layers are connected sequentially in array
order. Skip connections are expressed via the `skipTo` property on a layer,
pointing back to an earlier layer by ID.

---

### Preset 1: LeNet-5

**Factory:** `createLeNet5()`

| Field       | Value                                              |
|-------------|----------------------------------------------------|
| Name        | LeNet-5                                            |
| Description | Classic CNN architecture by Yann LeCun (1998) for handwritten digit recognition |
| Framework   | PyTorch                                            |
| Dataset     | MNIST                                              |
| Accuracy    | 99.2%                                              |
| Parameters  | 61,706                                             |

**Architecture:**

```
  Input        Conv1       Pool1       Conv2       Pool2      Flat     FC1     FC2    Output
  32x32x1     28x28x6    14x14x6    10x10x16    5x5x16     (400)   (120)   (84)    (10)

  +------+   +------+   +----+     +------+    +--+
  |      |   | 5x5  |   |    |     | 5x5  |    |  |
  |  32  |-->| 6f   |-->| /2 |--->| 16f  |--->|/2|---> [400] --> [120] --> [84] --> [10]
  |      |   |      |   |    |     |      |    |  |
  +------+   +------+   +----+     +------+    +--+
   1 ch       tanh       avg        tanh        avg          tanh    tanh   softmax
```

**Layer-by-layer:**

```
  Layer       Type      Shape         Kernel   Stride  Activation  Params
  -----------------------------------------------------------------------
  input       input     32x32x1       -        -       -           0
  conv1       conv2d    28x28x6       5x5      1       tanh        156
  pool1       avgpool   14x14x6       2x2      2       -           0
  conv2       conv2d    10x10x16      5x5      1       tanh        2,416
  pool2       avgpool   5x5x16        2x2      2       -           0
  flatten     flatten   (400)         -        -       -           0
  fc1         dense     (120)         -        -       tanh        48,120
  fc2         dense     (84)          -        -       tanh        10,164
  output      output    (10)          -        -       softmax     850
  -----------------------------------------------------------------------
  Total                                                             61,706
```

**Use case:** The foundational CNN. Perfect for teaching convolution, pooling,
and how spatial dimensions reduce through the network.

---

### Preset 2: Mini ResNet

**Factory:** `createMiniResNet()`

| Field       | Value                                              |
|-------------|----------------------------------------------------|
| Name        | Mini ResNet                                        |
| Description | Simplified ResNet with skip connections for image classification |
| Framework   | PyTorch                                            |
| Dataset     | CIFAR-10                                           |
| Accuracy    | 91%                                                |
| Parameters  | 47,530                                             |

**Architecture:**

```
  Input      Conv1   BN    ResBlock 1           ResBlock 2         Pool   Flat   Out
  32x32x3   32x32   32x32  32x32x16            16x16x32          1x1    (32)   (10)
             x16     x16

                      +--------+                +--------+
                      |        |                |        |
  [Input] -> [Conv] -> [BN] -> [Conv] -> [Conv+skip] -> [Conv(s2)] -> [Conv] -> [GAP] -> [10]
                      |                  |
                      +-----skip---------+
```

**Layer-by-layer:**

```
  Layer         Type      Shape         Kernel  Stride  Skip     Activation
  ---------------------------------------------------------------------------
  input         input     32x32x3       -       -       -        -
  conv1         conv2d    32x32x16      3x3     1       -        relu
  bn1           batchnorm 32x32x16      -       -       -        -
  res1_conv1    conv2d    32x32x16      3x3     1       -        relu
  res1_conv2    conv2d    32x32x16      3x3     1       -> bn1   relu
  res2_conv1    conv2d    16x16x32      3x3     2       -        relu
  res2_conv2    conv2d    16x16x32      3x3     1       -        relu
  pool          avgpool   1x1x32        16x16   -       -        -
  flatten       flatten   (32)          -       -       -        -
  output        output    (10)          -       -       -        softmax
```

**Use case:** Demonstrates residual / skip connections, the key innovation of
ResNet. The skip from `res1_conv2` back to `bn1` shows how gradients can flow
through shortcut paths.

---

### Preset 3: AlexNet (Simplified)

**Factory:** `createAlexNet()`

| Field       | Value                                                    |
|-------------|----------------------------------------------------------|
| Name        | AlexNet (Simplified)                                     |
| Description | Simplified AlexNet (Krizhevsky 2012) -- the architecture that launched the deep learning era |
| Framework   | PyTorch                                                  |
| Dataset     | ImageNet                                                 |
| Accuracy    | 63.3%                                                    |
| Parameters  | 62,378,344                                               |

**Architecture:**

```
  Input         Conv1        Pool1       Conv2        Pool2
  227x227x3    55x55x96    27x27x96    27x27x256   13x13x256
  +--------+   +------+    +----+      +------+     +----+
  |        |   |11x11 |    | 3x3|      | 5x5  |     |3x3|
  |  227   |-->| 96f  |--->|max |--->  |256f  |---->|max |
  |        |   | s=4  |    | s=2|      |      |     |s=2 |
  +--------+   +------+    +----+      +------+     +----+

  Conv3        Conv4        Conv5        Pool3      Flat     FC1     FC2    Output
  13x13x384   13x13x384   13x13x256    6x6x256   (9216)   (512)   (512)  (1000)
  +------+    +------+    +------+     +----+
  | 3x3  |    | 3x3  |    | 3x3  |     |3x3|
  | 384f  |--> | 384f  |--> | 256f  |--> |max |---> [9216] -> [512] -> [512] -> [1000]
  |      |    |      |    |      |     |s=2 |       d=0.5   d=0.5   softmax
  +------+    +------+    +------+     +----+
```

**Layer-by-layer:**

```
  Layer     Type      Shape          Kernel  Stride  Dropout  Activation
  -----------------------------------------------------------------------
  input     input     227x227x3      -       -       -        -
  conv1     conv2d    55x55x96       11x11   4       -        relu
  pool1     maxpool   27x27x96       3x3     2       -        -
  conv2     conv2d    27x27x256      5x5     1       -        relu
  pool2     maxpool   13x13x256      3x3     2       -        -
  conv3     conv2d    13x13x384      3x3     1       -        relu
  conv4     conv2d    13x13x384      3x3     1       -        relu
  conv5     conv2d    13x13x256      3x3     1       -        relu
  pool3     maxpool   6x6x256        3x3     2       -        -
  flatten   flatten   (9216)         -       -       -        -
  fc1       dense     (512)          -       -       0.5      relu
  fc2       dense     (512)          -       -       0.5      relu
  output    output    (1000)         -       -       -        softmax
  -----------------------------------------------------------------------
  Total parameters: 62,378,344
```

**Use case:** The architecture that started the modern deep learning era by
winning ImageNet 2012. Demonstrates large kernels, aggressive pooling, and
heavy dropout in the classifier head.

---

### Preset 4: VGG-11 (Simplified)

**Factory:** `createVGG11()`

| Field       | Value                                                    |
|-------------|----------------------------------------------------------|
| Name        | VGG-11 (Simplified)                                      |
| Description | Simplified VGG-11 (Simonyan & Zisserman 2014) -- uniform 3x3 conv design philosophy |
| Framework   | PyTorch                                                  |
| Dataset     | ImageNet                                                 |
| Accuracy    | 69.2%                                                    |
| Parameters  | 132,863,336                                              |

**Architecture:**

```
  Block 1          Block 2          Block 3              Block 4              Block 5
  224x224          112x112          56x56                28x28                14x14
  +---------+      +---------+      +---------+          +---------+          +---------+
  |Conv 64  |      |Conv 128 |      |Conv 256 |          |Conv 512 |          |Conv 512 |
  |  3x3    |      |  3x3    |      |  3x3    |          |  3x3    |          |  3x3    |
  |---------|      |---------|      |Conv 256 |          |Conv 512 |          |Conv 512 |
  |MaxPool  |      |MaxPool  |      |  3x3    |          |  3x3    |          |  3x3    |
  |  2x2    |      |  2x2    |      |---------|          |---------|          |---------|
  +---------+      +---------+      |MaxPool  |          |MaxPool  |          |MaxPool  |
                                    |  2x2    |          |  2x2    |          |  2x2    |
                                    +---------+          +---------+          +---------+

  --> Flatten (512) --> FC1 (256, d=0.5) --> FC2 (256, d=0.5) --> Output (1000)
```

**Layer-by-layer:**

```
  Layer     Type      Shape          Kernel  Stride  Dropout  Activation
  -----------------------------------------------------------------------
  input     input     224x224x3      -       -       -        -
  conv1     conv2d    224x224x64     3x3     1       -        relu
  pool1     maxpool   112x112x64    2x2     2       -        -
  conv2     conv2d    112x112x128   3x3     1       -        relu
  pool2     maxpool   56x56x128     2x2     2       -        -
  conv3a    conv2d    56x56x256     3x3     1       -        relu
  conv3b    conv2d    56x56x256     3x3     1       -        relu
  pool3     maxpool   28x28x256     2x2     2       -        -
  conv4a    conv2d    28x28x512     3x3     1       -        relu
  conv4b    conv2d    28x28x512     3x3     1       -        relu
  pool4     maxpool   14x14x512     2x2     2       -        -
  conv5a    conv2d    14x14x512     3x3     1       -        relu
  conv5b    conv2d    14x14x512     3x3     1       -        relu
  pool5     maxpool   7x7x512       2x2     2       -        -
  flatten   flatten   (512)         -       -       -        -
  fc1       dense     (256)         -       -       0.5      relu
  fc2       dense     (256)         -       -       0.5      relu
  output    output    (1000)        -       -       -        softmax
  -----------------------------------------------------------------------
  Total parameters: 132,863,336
```

**Use case:** Demonstrates the "simplicity wins" philosophy -- using only 3x3
convolutions stacked deeper and deeper. Shows how doubling channels while
halving spatial dimensions is a fundamental CNN pattern.

---

## 5. LLM (Large Language Model / Transformer) Schema

**Source:** `src/models/llm-schema.ts`

### Type Definitions

```typescript
export interface TransformerConfig {
  vocabSize: number;         // Size of token vocabulary
  maxSeqLen: number;         // Maximum input sequence length
  dModel: number;            // Model / embedding dimension
  nHeads: number;            // Number of attention heads
  nLayers: number;           // Number of transformer blocks
  dFF: number;               // Feed-forward intermediate dimension
  dropout?: number;          // Dropout rate
  architecture: 'encoder-only' | 'decoder-only' | 'encoder-decoder';
}

export interface AttentionHead {
  headIndex: number;         // 0-based head index
  dK: number;                // Key dimension per head (typically dModel / nHeads)
}

export interface TransformerLayer {
  id: string;                // Unique layer identifier
  layerIndex: number;        // Global position in the layer stack
  type: 'embedding' | 'positional_encoding' | 'attention' | 'feed_forward' | 'layer_norm' | 'output';
  label?: string;
  config?: {
    nHeads?: number;
    dModel?: number;
    dFF?: number;
    activation?: 'gelu' | 'relu' | 'swish';
  };
}

export interface LLMModel {
  type: 'llm';               // Discriminant -- always 'llm'
  name: string;
  description?: string;
  config: TransformerConfig;  // Global transformer configuration
  layers: TransformerLayer[]; // Generated layer list
  metadata?: {
    framework?: string;
    trainedOn?: string;
    parameters?: number;
    tokenizer?: string;
  };
}
```

### Layer Types

| Type                    | Description                                        |
|-------------------------|----------------------------------------------------|
| `embedding`             | Token embedding lookup (vocabSize -> dModel)        |
| `positional_encoding`   | Adds position information to embeddings             |
| `attention`             | Multi-head self-attention sublayer                  |
| `feed_forward`          | Position-wise FFN (dModel -> dFF -> dModel)         |
| `layer_norm`            | Layer normalization (pre-norm architecture)         |
| `output`                | Final linear projection to vocabulary logits        |

### Transformer Block Internals

Each transformer block is composed of 4 layers generated by
`generateTransformerLayers()`:

```
For each block i (0 to nLayers-1):

  1. layer_{i}_ln1    -- Pre-attention layer norm
  2. layer_{i}_attn   -- Multi-head self-attention
  3. layer_{i}_ln2    -- Pre-FFN layer norm
  4. layer_{i}_ff     -- Feed-forward network

This follows the Pre-LayerNorm Transformer pattern:

  x -> LayerNorm -> Attention -> +residual -> LayerNorm -> FFN -> +residual
```

**Complete layer generation pattern:**

```
  [embedding]                              layerIndex = 0
  [positional_encoding]                    layerIndex = 1
  --- Transformer Block 0 ---
    [layer_0_ln1]   (pre-attention norm)   layerIndex = 2
    [layer_0_attn]  (multi-head attention) layerIndex = 3
    [layer_0_ln2]   (pre-FFN norm)         layerIndex = 4
    [layer_0_ff]    (feed-forward)         layerIndex = 5
  --- Transformer Block 1 ---
    [layer_1_ln1]                          layerIndex = 6
    [layer_1_attn]                         layerIndex = 7
    [layer_1_ln2]                          layerIndex = 8
    [layer_1_ff]                           layerIndex = 9
  ... (repeat for each block)
  [output]                                 layerIndex = 2 + nLayers * 4
```

### Attention Mechanism

Each attention layer has `nHeads` heads, each operating on a subspace of
dimension `dK = dModel / nHeads`.

For multi-head attention:
- **Q, K, V projections:** 3 matrices of size `(dModel x dModel)` = `3 * dModel^2` params
- **Output projection:** 1 matrix of size `(dModel x dModel)` = `dModel^2` params
- **Total per attention layer:** `4 * dModel^2`

### Feed-Forward Network

Two linear transformations with a non-linearity:

```
FFN(x) = activation(x * W1 + b1) * W2 + b2
```

- `W1`: `(dModel x dFF)` + `dFF` bias
- `W2`: `(dFF x dModel)` + `dModel` bias
- **Total per FFN layer:** `2 * dModel * dFF + dFF + dModel`

---

### Preset 1: GPT-2 Small (Simplified)

**Factory:** `createGPT2Small()`

| Field        | Value                                              |
|--------------|----------------------------------------------------|
| Name         | GPT-2 Small (Simplified)                           |
| Description  | Decoder-only transformer (4 layers shown of 12) for text generation |
| Architecture | decoder-only                                       |
| Framework    | PyTorch                                            |
| Dataset      | WebText                                            |
| Tokenizer    | BPE                                                |
| Parameters   | 124,000,000 (full model)                           |

**Config:**

```typescript
{
  vocabSize: 50257,
  maxSeqLen: 1024,
  dModel: 768,
  nHeads: 12,
  nLayers: 4,        // Simplified (real GPT-2 Small: 12)
  dFF: 3072,
  dropout: 0.1,
  architecture: 'decoder-only',
}
```

**Architecture:**

```
  Tokens
    |
    v
  [Token Embedding: 50257 -> 768]
    |
    v
  [Positional Encoding: max 1024]
    |
    v
  +----------------------------------+
  | Transformer Block 0              |
  |  LayerNorm -> MHA (12 heads)     |
  |  LayerNorm -> FFN (768->3072->768)|
  +----------------------------------+
    |
  +----------------------------------+
  | Transformer Block 1              |
  |  (same structure)                |
  +----------------------------------+
    |
  +----------------------------------+
  | Transformer Block 2              |
  +----------------------------------+
    |
  +----------------------------------+
  | Transformer Block 3              |
  +----------------------------------+
    |
    v
  [Output: 50257 logits]
```

**Generated layers:** 18 total (2 bookend + 4 blocks x 4 layers/block)

**Use case:** The canonical decoder-only language model. Demonstrates
autoregressive text generation, causal attention masking, and the GPT
architecture family.

---

### Preset 2: BERT Tiny

**Factory:** `createBERTTiny()`

| Field        | Value                                              |
|--------------|----------------------------------------------------|
| Name         | BERT Tiny                                          |
| Description  | Minimal encoder-only transformer for understanding attention mechanisms |
| Architecture | encoder-only                                       |
| Framework    | PyTorch                                            |
| Dataset      | BookCorpus + Wikipedia                             |
| Tokenizer    | WordPiece                                          |
| Parameters   | 4,400,000                                          |

**Config:**

```typescript
{
  vocabSize: 30522,
  maxSeqLen: 512,
  dModel: 128,
  nHeads: 2,
  nLayers: 2,
  dFF: 512,
  dropout: 0.1,
  architecture: 'encoder-only',
}
```

**Architecture:**

```
  Tokens
    |
    v
  [Token Embedding: 30522 -> 128]
    |
    v
  [Positional Encoding: max 512]
    |
    v
  +----------------------------------+
  | Transformer Block 0              |
  |  LayerNorm -> MHA (2 heads)      |
  |  dK per head = 64                |
  |  LayerNorm -> FFN (128->512->128)|
  +----------------------------------+
    |
  +----------------------------------+
  | Transformer Block 1              |
  |  (same structure)                |
  +----------------------------------+
    |
    v
  [Output: 30522 logits]
```

**Generated layers:** 10 total (2 bookend + 2 blocks x 4 layers/block)

**Use case:** Teaching bidirectional attention (encoder-only means no causal
mask). Small enough to trace every attention weight by hand. Demonstrates the
BERT family of models used for understanding/classification tasks.

---

### Preset 3: Nano Transformer

**Factory:** `createNanoTransformer()`

| Field        | Value                                              |
|--------------|----------------------------------------------------|
| Name         | Nano Transformer                                   |
| Description  | Tiny transformer perfect for understanding the building blocks |
| Architecture | decoder-only                                       |
| Tokenizer    | Character-level                                    |
| Parameters   | 52,000                                             |

**Config:**

```typescript
{
  vocabSize: 256,
  maxSeqLen: 32,
  dModel: 64,
  nHeads: 4,
  nLayers: 2,
  dFF: 256,
  architecture: 'decoder-only',
}
```

**Architecture:**

```
  Characters (byte-level)
    |
    v
  [Token Embedding: 256 -> 64]
    |
    v
  [Positional Encoding: max 32]
    |
    v
  +----------------------------------+
  | Transformer Block 0              |
  |  LayerNorm -> MHA (4 heads)      |
  |  dK per head = 16                |
  |  LayerNorm -> FFN (64->256->64)  |
  +----------------------------------+
    |
  +----------------------------------+
  | Transformer Block 1              |
  |  (same structure)                |
  +----------------------------------+
    |
    v
  [Output: 256 logits]
```

**Generated layers:** 10 total

**Use case:** The smallest practical transformer. Uses character-level
tokenization with a 256-byte vocabulary. Small enough to fit entirely in the
visualizer with every attention head and FFN visible. Ideal for students
learning transformer internals for the first time.

---

### Preset 4: Tiny Llama

**Factory:** `createTinyLlama()`

| Field        | Value                                              |
|--------------|----------------------------------------------------|
| Name         | Tiny Llama                                         |
| Description  | Small Llama-style decoder-only model with RoPE and SwiGLU (4 of 22 layers shown) |
| Architecture | decoder-only                                       |
| Framework    | PyTorch                                            |
| Dataset      | SlimPajama + StarCoder                             |
| Tokenizer    | SentencePiece                                      |
| Parameters   | 1,100,000,000 (full model)                         |

**Config:**

```typescript
{
  vocabSize: 32000,
  maxSeqLen: 2048,
  dModel: 512,
  nHeads: 8,
  nLayers: 4,         // Simplified (real TinyLlama: 22)
  dFF: 1376,
  dropout: 0.0,
  architecture: 'decoder-only',
}
```

**Architecture:**

```
  Tokens (SentencePiece)
    |
    v
  [Token Embedding: 32000 -> 512]
    |
    v
  [Positional Encoding: max 2048 (RoPE-style)]
    |
    v
  +-------------------------------------+
  | Transformer Block 0                 |
  |  LayerNorm -> MHA (8 heads)         |
  |  dK per head = 64                   |
  |  LayerNorm -> FFN (512->1376->512)  |
  |  (SwiGLU activation)               |
  +-------------------------------------+
    |
  +-------------------------------------+
  | Transformer Block 1                 |
  +-------------------------------------+
    |
  +-------------------------------------+
  | Transformer Block 2                 |
  +-------------------------------------+
    |
  +-------------------------------------+
  | Transformer Block 3                 |
  +-------------------------------------+
    |
    v
  [Output: 32000 logits]
```

**Generated layers:** 18 total (2 bookend + 4 blocks x 4 layers/block)

**Use case:** Represents the Llama model family. Demonstrates modern LLM
techniques: SwiGLU activations, RoPE positional embeddings, and training on
mixed code + text data. The 4-layer simplification keeps visualization
manageable while showing the real model's structure.

---

### Preset 5: Mini GPT

**Factory:** `createMiniGPT()`

| Field        | Value                                              |
|--------------|----------------------------------------------------|
| Name         | Mini GPT                                           |
| Description  | Minimal GPT for teaching -- small enough to trace every operation by hand |
| Architecture | decoder-only                                       |
| Tokenizer    | Character-level                                    |
| Parameters   | ~161,280                                           |

**Config:**

```typescript
{
  vocabSize: 512,
  maxSeqLen: 64,
  dModel: 96,
  nHeads: 3,
  nLayers: 3,
  dFF: 384,
  dropout: 0.1,
  architecture: 'decoder-only',
}
```

**Architecture:**

```
  Characters
    |
    v
  [Token Embedding: 512 -> 96]
    |
    v
  [Positional Encoding: max 64]
    |
    v
  +----------------------------------+
  | Transformer Block 0              |
  |  LayerNorm -> MHA (3 heads)      |
  |  dK per head = 32                |
  |  LayerNorm -> FFN (96->384->96)  |
  +----------------------------------+
    |
  +----------------------------------+
  | Transformer Block 1              |
  +----------------------------------+
    |
  +----------------------------------+
  | Transformer Block 2              |
  +----------------------------------+
    |
    v
  [Output: 512 logits]
```

**Parameter estimate:**

```
  Embedding:    512 * 96            =  49,152
  Pos encoding: 96 * 64             =   6,144
  Per block:
    Attention:  4 * 96 * 96         =  36,864
    FFN:        96 * 384 + 384 * 96 =  73,728
  3 blocks:     3 * (36864 + 73728) = 331,776
  Output:       96 * 512            =  49,152
  ----------------------------------------
  Approximate total:                 ~436,224
```

(The `metadata.parameters` field in source computes:
`96*512 + 96*64 + 3*(4*96*96 + 96*384 + 384*96) + 96*512`)

**Generated layers:** 14 total (2 bookend + 3 blocks x 4 layers/block)

**Use case:** A GPT small enough to trace every matrix multiplication by hand.
Three attention heads map to primary components (subject, verb, context)
making attention patterns interpretable. Ideal for classroom walkthroughs of
the full transformer forward pass.

---

## 6. Preset Registry

**Source:** `src/stores/modelStore.ts`

### ModelPreset Interface

```typescript
export interface ModelPreset {
  id: string;               // URL-friendly unique ID (e.g. "lenet5")
  name: string;             // Human-readable name (e.g. "LeNet-5")
  type: ModelType;          // 'ann' | 'cnn' | 'llm'
  description: string;      // Short description for the preset picker
  create: () => NetworkModel;  // Factory function that builds the full model
}
```

### Complete Preset Registry

```typescript
export const MODEL_PRESETS: ModelPreset[] = [
  // ANN presets
  { id: 'simple-mlp',       name: 'Simple MLP',       type: 'ann', ... create: createSimpleMLP },
  { id: 'deep-mlp',         name: 'Deep MLP',         type: 'ann', ... create: createDeepMLP },
  { id: 'autoencoder',      name: 'Autoencoder',      type: 'ann', ... create: createAutoencoder },
  { id: 'xor-network',      name: 'XOR Network',      type: 'ann', ... create: createXOR },

  // CNN presets
  { id: 'lenet5',           name: 'LeNet-5',          type: 'cnn', ... create: createLeNet5 },
  { id: 'mini-resnet',      name: 'Mini ResNet',      type: 'cnn', ... create: createMiniResNet },
  { id: 'alexnet',          name: 'AlexNet',          type: 'cnn', ... create: createAlexNet },
  { id: 'vgg11',            name: 'VGG-11',           type: 'cnn', ... create: createVGG11 },

  // LLM presets
  { id: 'gpt2-small',       name: 'GPT-2 Small',      type: 'llm', ... create: createGPT2Small },
  { id: 'bert-tiny',        name: 'BERT Tiny',         type: 'llm', ... create: createBERTTiny },
  { id: 'nano-transformer', name: 'Nano Transformer',  type: 'llm', ... create: createNanoTransformer },
  { id: 'tiny-llama',       name: 'Tiny Llama',        type: 'llm', ... create: createTinyLlama },
  { id: 'mini-gpt',         name: 'Mini GPT',          type: 'llm', ... create: createMiniGPT },
];
```

### Zustand Store

```typescript
interface ModelState {
  currentModel: NetworkModel | null;    // The active model (or null)
  currentPresetId: string | null;       // ID of the loaded preset
  modelType: ModelType;                 // Currently selected model category

  loadPreset: (presetId: string) => void;   // Look up & instantiate a preset
  setModelType: (type: ModelType) => void;  // Switch the category filter
  clearModel: () => void;                   // Unload the current model
}
```

**`loadPreset` implementation:**

```typescript
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
```

Key design decisions:
- Models are created lazily (factory called only when the user selects a preset)
- The store holds a single model at a time (no model list / history)
- `modelType` is kept in sync with the loaded preset's type

---

## 7. Adding New Models

Step-by-step guide for adding a new model type or preset.

### Adding a New Preset to an Existing Model Type

**Example: adding a "ResNet-18" preset to the CNN category.**

**Step 1:** Add the factory function to `src/models/cnn-schema.ts`:

```typescript
export function createResNet18(): CNNModel {
  return {
    type: 'cnn',
    name: 'ResNet-18',
    description: 'Full ResNet-18 with residual blocks',
    layers: [
      { id: 'input', type: 'input', width: 224, height: 224, channels: 3, label: 'Input' },
      // ... define all layers
      { id: 'output', type: 'output', neurons: 1000, activation: 'softmax', label: 'Output' },
    ],
    metadata: {
      framework: 'PyTorch',
      trainedOn: 'ImageNet',
      parameters: 11_689_512,
    },
  };
}
```

**Step 2:** Register it in `src/stores/modelStore.ts`:

```typescript
import { createResNet18 } from '../models/cnn-schema';

// Add to MODEL_PRESETS array:
{ id: 'resnet18', name: 'ResNet-18', type: 'cnn', description: 'Full ResNet-18 with skip connections', create: createResNet18 },
```

That is all -- the existing CNN visualizer will automatically handle the new preset.

### Adding an Entirely New Model Type

**Example: adding a GAN (Generative Adversarial Network) type.**

**Step 1:** Create the schema file `src/models/gan-schema.ts`:

```typescript
export interface GANLayer {
  id: string;
  type: 'noise_input' | 'conv_transpose' | 'conv2d' | 'batchnorm' | 'output';
  // ... properties specific to GAN layers
}

export interface GANModel {
  type: 'gan';               // New discriminant value
  name: string;
  description?: string;
  generator: GANLayer[];
  discriminator: GANLayer[];
  metadata?: { /* ... */ };
}

export function createDCGAN(): GANModel { /* ... */ }
```

**Step 2:** Update the discriminated union in `src/stores/modelStore.ts`:

```typescript
import type { GANModel } from '../models/gan-schema';
import { createDCGAN } from '../models/gan-schema';

export type NetworkModel = ANNModel | CNNModel | LLMModel | GANModel;
export type ModelType = 'ann' | 'cnn' | 'llm' | 'gan';

// Add to MODEL_PRESETS:
{ id: 'dcgan', name: 'DCGAN', type: 'gan', description: 'Deep Convolutional GAN', create: createDCGAN },
```

**Step 3:** Create the visualizer component at
`src/components/visualizers/gan/GANVisualizer.tsx`:

```typescript
import type { GANModel } from '../../../models/gan-schema';

interface GANVisualizerProps {
  model: GANModel;
}

export default function GANVisualizer({ model }: GANVisualizerProps) {
  // Render generator and discriminator as two parallel 3D structures
  return (
    <group>
      {/* Generator column */}
      {/* Discriminator column */}
      {/* Generated sample flow between them */}
    </group>
  );
}
```

**Step 4:** Wire it into the main canvas by updating the model-type switch:

```typescript
switch (model.type) {
  case 'ann': return <ANNVisualizer model={model} />;
  case 'cnn': return <CNNVisualizer model={model} />;
  case 'llm': return <LLMVisualizer model={model} />;
  case 'gan': return <GANVisualizer model={model} />;
}
```

---

## 8. Visualization Mapping

How each model type maps from data to 3D geometry.

### ANN Visualization

**Source:** `src/components/visualizers/ann/ANNVisualizer.tsx`

```
Data                          3D Representation
----                          ------------------
ANNLayer                  --> Column of spheres at a Z-depth
  .neurons                --> Number of spheres (capped at 32)
  .type                   --> Sphere color (input=blue, hidden=purple, output=green)
  .activation             --> Activation label below layer; tints sphere color

ANNConnection             --> Bezier curves connecting sphere pairs
  .weights                --> Curve opacity / golden-blue color gradient

Data flow                 --> Animated green particles along curves
```

**Layout algorithm:**

1. Layers are spaced along the Z-axis using `calculateLayerDepths(n, spacing=6)`
2. Neurons within each layer are arranged in a grid:
   - `maxPerRow = 8` (wraps to multiple rows)
   - `spacing = 1.0` between neurons
   - Maximum `32` neurons rendered per layer (larger counts shown in label)
3. Connections are thinned to max `200` per layer pair using stride-based sampling
4. Data flow particles: up to 3 per inter-layer gap, animated from random source to random target neuron

**Sphere sizes by layer type:**

| Layer type | Sphere radius |
|------------|---------------|
| `input`    | 0.25          |
| `hidden`   | 0.30          |
| `output`   | 0.35          |

### CNN Visualization

**Source:** `src/components/visualizers/cnn/CNNVisualizer.tsx`

```
Data                          3D Representation
----                          ------------------
CNNLayer (spatial)        --> RoundedBox (3D volume)
  .width, .height         --> Box width and height (scaled by 0.04)
  .channels               --> Box depth (scaled by 0.04 * 0.5, min 0.2)

CNNLayer (dense/flatten)  --> Flat RoundedBox (depth = 0.3)
  .neurons                --> Side = ceil(sqrt(neurons)) * 0.08

CNNLayer.type             --> Color mapping:
                               input=#4fc3f7, conv=#ff8a65, pool=#ffab40
                               batchnorm=#90a4ae, flatten=#80deea
                               dense=#b388ff, output=#69f0ae

Conv kernel               --> Small wireframe Box beside the conv volume
  .kernelSize             --> Box size = kernelSize * 0.15

Connections               --> Line + cone arrow between successive volumes
Skip connections          --> Green line from skipTo source to target
```

**Layout algorithm:**

1. Layers are placed sequentially along the Z-axis
2. Spacing between layers = `max(depth, 1) + 1.5`
3. The entire group is centered by shifting Z by `-(lastZ / 2)`
4. Feature map volumes have:
   - Width = `layer.width * 0.04`
   - Height = `layer.height * 0.04`
   - Depth = `max(layer.channels * 0.04 * 0.5, 0.2)`

**Visual features:**

- Volumes have triple rendering: solid material + wireframe overlay + glow shell
- Conv layers show a floating kernel box to the right when "show weights" is on
- Skip connections render as green lines offset to the right side of volumes
- All volumes are clickable (triggers layer selection in the store)

### LLM Visualization

**Source:** `src/components/visualizers/llm/LLMVisualizer.tsx`

```
Data                          3D Representation
----                          ------------------
Input tokens              --> Row of floating RoundedBoxes (T0, T1, ...)
                               Color: #ce93d8 (embedding purple)
                               Up to 8 tokens shown

TransformerBlock          --> Stacked group descending on Y-axis
  Container               --> Large translucent RoundedBox (#1a1a2e)

Attention layer           --> Torus rings (one per head, max 4 shown)
  Per head                --> Colored torus ring (from ATTENTION_HEAD_COLORS)
  Attention weights       --> Bezier beams between token X-positions
                               Color = head color, opacity = attention strength
                               Animated pulsing via sin(time)

Feed-forward layer        --> Two opposing Cylinder (truncated cones)
  Expansion (dModel->dFF) --> Cone widening from left
  Compression (dFF->dModel)--> Cone narrowing to right
  Ratio                   --> Cone angle = dFF / dModel

Embedding layer           --> Text label "Embedding (vocab -> dModel)"
Output layer              --> Text label "Output (vocab logits)"
```

**Layout algorithm:**

1. Input tokens are placed in a row along X at Y=0, spacing=1.2
2. Layers are grouped into blocks. Each block descends by `blockSpacing = 5` on Y
3. Grouping logic:
   - `embedding`, `positional_encoding`, `output` each get their own block
   - `layer_norm`, `attention`, `layer_norm`, `feed_forward` are grouped into one block
4. Within each transformer block:
   - Attention visualization sits at Y=+1 (above center)
   - FFN visualization sits at Y=-1 (below center)

**Attention beams:**

- Each head generates `2-3` attention connections per token
- Beams are quadratic Bezier curves with the midpoint raised by `0.5 + strength * 1.5`
- 12 distinct head colors from `ATTENTION_HEAD_COLORS` palette
- Beam opacity pulses: `0.1 + strength * 0.6 + sin(t * 0.002) * 0.1`

**Token blocks:**

- Each token is a `RoundedBox(0.8, 0.4, 0.4)` with radius 0.08
- Tokens bob up and down: `y + sin(time + index * 0.5) * 0.1`

---

## Example: Full Model Object

Here is what `createSimpleMLP()` returns, as a concrete example of the data
structure that flows through the entire system:

```typescript
{
  type: 'ann',
  name: 'Simple MLP',
  description: 'A 3-layer multi-layer perceptron for classification',
  layers: [
    { id: 'input',   type: 'input',  neurons: 8,  label: 'Input' },
    { id: 'hidden1', type: 'hidden', neurons: 16, activation: 'relu', label: 'Hidden 1' },
    { id: 'hidden2', type: 'hidden', neurons: 12, activation: 'relu', label: 'Hidden 2' },
    { id: 'output',  type: 'output', neurons: 4,  activation: 'softmax', label: 'Output' },
  ],
  connections: [
    { fromLayer: 'input',   toLayer: 'hidden1' },
    { fromLayer: 'hidden1', toLayer: 'hidden2' },
    { fromLayer: 'hidden2', toLayer: 'output' },
  ],
  metadata: {
    parameters: 400,
    trainedOn: 'Iris Dataset',
    accuracy: 0.97,
  },
}
```

This object is:
1. Created by the `createSimpleMLP()` factory
2. Stored in `useModelStore.currentModel`
3. Passed to `<ANNVisualizer model={model} />` via the discriminated union switch
4. Converted to 3D geometry: 4 columns of spheres, 3 sets of Bezier connections, animated particles

---

*This document was generated from the source code at `src/models/`, `src/stores/modelStore.ts`, `src/utils/colors.ts`, `src/utils/math.ts`, and `src/components/visualizers/`.*
