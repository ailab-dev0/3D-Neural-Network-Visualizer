/**
 * Educational narration content for the 3D Neural Network Visualizer.
 * Each narration provides real ML knowledge that teaches concepts as users explore.
 */

/* ============================================
   Model Narrations — Triggered when a preset is loaded
   Keyed by preset ID from modelStore.ts
   ============================================ */
export const modelNarrations: Record<string, string> = {
  // ANN presets
  'simple-mlp':
    'You loaded a Simple Multi-Layer Perceptron (MLP) — the foundational architecture of deep learning. This 3-layer network has 8 input neurons, two hidden layers with 16 and 12 neurons using ReLU activation, and a 4-class softmax output. With roughly 380 trainable parameters, it can learn non-linear decision boundaries for tasks like classifying the Iris flower dataset.',

  'deep-mlp':
    'This is a Deep MLP with 5 layers and over 19,000 parameters. It uses dropout regularization (30% in early layers, 20% later) to randomly deactivate neurons during training, which prevents the network from memorizing the training data. Deeper networks like this one can model increasingly complex patterns, but they also require careful regularization to generalize well.',

  'autoencoder':
    'You are viewing an Autoencoder — a network that learns to compress data into a compact representation and then reconstruct it. Notice the symmetric "hourglass" shape: the encoder layers progressively shrink from 32 to 8 neurons (the bottleneck), and the decoder mirrors this back to 32. The bottleneck forces the network to learn only the most essential features of the input data, making autoencoders powerful for dimensionality reduction and anomaly detection.',

  'xor-network':
    'This minimal 2-2-1 XOR Network is historically significant — it demonstrates why single-layer perceptrons fail and why hidden layers matter. The XOR problem (exclusive OR) is not linearly separable, meaning no single straight line can divide the outputs. The 2-neuron hidden layer creates a non-linear feature space where XOR becomes solvable, which was a key insight in the development of neural networks.',

  // CNN presets
  'lenet5':
    'LeNet-5, designed by Yann LeCun in 1998, is one of the earliest Convolutional Neural Networks and the architecture that proved CNNs could recognize handwritten digits. It processes 32x32 grayscale images through alternating convolution and pooling layers, progressively extracting higher-level features. With only 61,706 parameters, it achieves 99.2% accuracy on MNIST — a testament to the efficiency of the convolution operation.',

  'mini-resnet':
    'This Mini ResNet implements residual connections (skip connections), the breakthrough innovation from the 2015 ResNet paper by He et al. Skip connections allow gradients to flow directly through the network by adding the input of a block to its output. This solved the degradation problem where very deep networks paradoxically performed worse than shallow ones, enabling networks with hundreds of layers to be trained effectively.',

  'alexnet':
    'AlexNet, created by Alex Krizhevsky in 2012, ignited the deep learning revolution by winning ImageNet with a 15.3% error rate — dramatically beating traditional methods. This simplified version shows its key innovations: deep stacked convolutions (5 conv layers + 3 FC layers), ReLU activation instead of the slower sigmoid, and dropout for regularization. AlexNet proved that large CNNs trained on GPUs could learn powerful visual features.',

  'vgg11':
    'VGG-11, from the Visual Geometry Group at Oxford (2014), demonstrated that network depth with very simple architecture choices is key to performance. It uses exclusively 3x3 convolutions stacked repeatedly — two 3x3 convolutions have the same receptive field as a single 5x5 but with fewer parameters and more non-linearity. This uniform design philosophy influenced countless subsequent architectures.',

  // LLM presets
  'gpt2-small':
    'GPT-2 Small is a decoder-only transformer with 12 layers, 12 attention heads, and a 768-dimensional model space. It uses causal (masked) self-attention, meaning each token can only attend to previous tokens — this autoregressive property is what enables text generation. With approximately 124 million parameters, GPT-2 demonstrated that large language models trained on diverse internet text could perform many NLP tasks without task-specific training.',

  'bert-tiny':
    'BERT Tiny is an encoder-only transformer that uses bidirectional attention — unlike GPT, each token can attend to all other tokens in both directions. BERT was pre-trained with two objectives: Masked Language Modeling (predicting randomly hidden words) and Next Sentence Prediction. This bidirectional context understanding makes BERT exceptionally good at tasks like question answering, sentiment analysis, and named entity recognition.',

  'nano-transformer':
    'This Nano Transformer is a minimal teaching model with just 2 layers, 2 attention heads, and a 64-dimensional embedding space. Despite its small size, it contains all the core components of modern transformers: token embedding, positional encoding, multi-head self-attention, feed-forward networks, and layer normalization. It is designed to help you understand the transformer architecture without the complexity of production-scale models.',

  'tiny-llama':
    'Tiny Llama is a small Llama-style decoder-only model featuring SwiGLU activation in its feed-forward layers. SwiGLU (Swish-Gated Linear Unit) was shown by Noam Shazeer to improve transformer performance over standard ReLU or GELU activations. With 4 layers, 4 attention heads, and a 256-dimensional model space, this architecture follows the design principles of Meta\'s Llama family of models.',

  'mini-gpt':
    'Mini GPT is a compact GPT-style model designed for teaching transformer concepts. With 3 layers and 3 attention heads in a 192-dimensional space, it is small enough to visualize every component while faithfully representing the GPT architecture. The decoder-only design means information flows strictly left-to-right through the attention mechanism, which is how the model learns to predict the next token in a sequence.',
};

/* ============================================
   Layer Narrations — Triggered when a layer is selected
   Keyed by layer type
   ============================================ */
export const layerNarrations: Record<string, string> = {
  // ANN layer types
  input:
    'This is the Input Layer — the entry point where raw data enters the network. Each neuron represents one feature dimension of the input. The input layer performs no computation; it simply passes values to the first hidden layer through weighted connections. The number of input neurons must match the dimensionality of your data.',

  hidden:
    'This is a Hidden Layer — where the actual learning happens. Each neuron computes a weighted sum of all inputs from the previous layer, adds a bias term, and applies an activation function. Hidden layers progressively transform the data into representations that make the final classification or regression task easier. Deeper hidden layers typically learn more abstract features.',

  output:
    'This is the Output Layer — where the network produces its final predictions. For classification tasks, it typically uses softmax activation to output probability distributions across classes. For regression, it uses linear activation. The number of output neurons matches the number of target values or classes the network needs to predict.',

  // CNN layer types
  conv2d:
    'This is a 2D Convolutional Layer — the core building block of CNNs. It slides small learnable filters (kernels) across the input, computing dot products at each position to produce feature maps. Each filter learns to detect a specific pattern: early layers detect edges and textures, while deeper layers detect complex shapes and objects. Weight sharing across spatial positions makes convolutions extremely parameter-efficient.',

  maxpool:
    'This is a Max Pooling Layer — it reduces spatial dimensions by taking the maximum value in each local window. By keeping only the strongest activation, max pooling provides translation invariance (detecting a feature regardless of its exact position) and reduces computation for subsequent layers. A 2x2 pool with stride 2 halves both the width and height of the feature maps.',

  avgpool:
    'This is an Average Pooling Layer — similar to max pooling, but it takes the mean value in each window instead of the maximum. Average pooling retains more information about the overall magnitude of activations in a region, while max pooling emphasizes the strongest signal. Average pooling is often used in the final layers of modern architectures as Global Average Pooling.',

  batchnorm:
    'This is a Batch Normalization Layer — it normalizes the activations to have zero mean and unit variance within each mini-batch. Batch normalization stabilizes training by reducing internal covariate shift, allows higher learning rates, and acts as a mild regularizer. It applies learnable scale and shift parameters after normalization so the network can still represent any function.',

  dropout:
    'This is a Dropout Layer — a regularization technique that randomly sets a fraction of neuron activations to zero during training. This forces the network to develop redundant representations and prevents co-adaptation of neurons. At inference time, dropout is disabled and weights are scaled accordingly. A dropout rate of 0.5 means each neuron has a 50% chance of being dropped each training step.',

  flatten:
    'This is a Flatten Layer — it reshapes multi-dimensional feature maps (height x width x channels) into a one-dimensional vector. This is the bridge between convolutional layers and fully-connected layers. For example, a 5x5x16 feature map becomes a 400-element vector. Flattening preserves all the spatial feature information but discards the 2D spatial structure.',

  dense:
    'This is a Dense (Fully-Connected) Layer — every neuron connects to every neuron in the previous layer. Dense layers combine spatially distributed features into global representations for classification. They contain the most parameters in a CNN, which is why modern architectures try to minimize their use with Global Average Pooling.',

  // LLM / Transformer layer types
  embedding:
    'This is the Token Embedding Layer — it converts discrete token IDs into continuous vector representations. Each token in the vocabulary has a learned embedding vector. These embeddings capture semantic relationships: words with similar meanings end up with similar vectors. The embedding dimension determines the richness of these representations.',

  positional_encoding:
    'This is the Positional Encoding Layer — it injects information about token positions into the embeddings. Since self-attention is permutation-invariant (it has no inherent notion of order), positional encodings are essential for the model to understand sequence structure. Sinusoidal encodings use fixed mathematical patterns, while learned positional embeddings are trained alongside the model.',

  attention:
    'This is a Multi-Head Self-Attention Layer — the key innovation of the Transformer architecture. Each attention head independently computes Query, Key, and Value projections, then calculates attention scores as softmax(QK^T / sqrt(d_k)) * V. Multiple heads allow the model to attend to different types of relationships simultaneously — one head might track syntax while another tracks semantics.',

  feed_forward:
    'This is a Feed-Forward Network (FFN) Layer — applied independently to each token position after attention. It consists of two linear transformations with a non-linear activation (typically GELU or SwiGLU) in between, expanding the dimensionality and then projecting it back. The FFN is where much of the model\'s factual knowledge is believed to be stored, acting as a key-value memory.',

  layer_norm:
    'This is a Layer Normalization Layer — it normalizes activations across the feature dimension for each token independently (unlike batch norm, which normalizes across the batch). Layer norm stabilizes training and is used before attention and feed-forward blocks in pre-norm transformers. It ensures activations stay in a well-behaved range throughout the deep transformer stack.',
};

/* ============================================
   Action Narrations — Triggered by user interactions
   ============================================ */
export const actionNarrations: Record<string, string> = {
  play:
    'Animation started! Watch how data flows through the network layer by layer. In a real forward pass, input values are multiplied by weights, summed, and transformed by activation functions at each layer until reaching the output.',

  pause:
    'Animation paused. You can inspect individual layers by clicking on them, or adjust visualization settings to see different aspects of the network architecture.',

  stop:
    'Animation stopped and reset. The network is now in its idle state. Click Play or press Space to watch the forward pass again.',

  'toggle-weights':
    'Weight connections are now visible. Brighter and thicker lines represent stronger connection weights. In neural networks, these weights are the learnable parameters — they are adjusted during training via backpropagation to minimize the loss function.',

  'toggle-weights-off':
    'Weight connections are now hidden. The weight values are still there — they are just not being displayed. Weights are the core of what a neural network "learns" during training.',

  'toggle-dataflow':
    'Data flow particles are now active. The green particles represent data signals propagating through the network. In a real neural network, these would be numerical activation values flowing from one layer to the next through weighted connections.',

  'toggle-dataflow-off':
    'Data flow visualization is now hidden. The actual data flow still occurs — numerical values pass between layers through matrix multiplications and activation functions.',

  'toggle-lightcone':
    'Cognitive Light Cone is now enabled. This visualization shows the "sphere of influence" — which layers are affected by or contribute to the selected layer. Forward cone shows downstream impact; backward cone shows upstream dependencies.',

  'toggle-lightcone-off':
    'Cognitive Light Cone is now disabled. Select a layer and re-enable the light cone to see how information propagates through the network from that point.',

  'toggle-labels':
    'Layer labels are now visible, showing the name and configuration of each layer in the network architecture.',

  'toggle-labels-off':
    'Layer labels are now hidden for a cleaner visualization. Press L to toggle them back on.',

  'toggle-autorotate':
    'Auto-rotation is now active. The camera orbits around the network, giving you a 3D perspective of the architecture from all angles.',

  'toggle-autorotate-off':
    'Auto-rotation is now paused. You can manually orbit by clicking and dragging, zoom with the scroll wheel, and pan with right-click drag.',
};

/* ============================================
   Idle Tips — Shown when nothing is happening
   ============================================ */
export const tipNarrations: string[] = [
  'Click any layer or neuron to inspect its details and see a description of what it does.',
  'Press Space to start or stop the forward pass animation and watch data flow through the network.',
  'Try loading different models from the sidebar to compare architectures — notice how CNNs and Transformers differ structurally.',
  'Use the speed slider in the playback controls to slow down or speed up the animation for better observation.',
  'Press W to toggle weight visualization — brighter connections indicate stronger learned weights.',
  'Press F to toggle data flow particles — watch the green signals propagate through the network.',
  'Press C to enable the Cognitive Light Cone and see how information propagates from a selected layer.',
  'Compare the Simple MLP and Deep MLP to understand how depth and dropout affect network architecture.',
  'Load the Autoencoder to see the symmetric encoder-decoder structure with a compressed bottleneck.',
  'Switch between ANN, CNN, and LLM models using the 1, 2, and 3 keys to compare fundamentally different architectures.',
  'The XOR Network is the smallest model that demonstrates why hidden layers are necessary for non-linear problems.',
  'Notice how LeNet-5 alternates convolution and pooling layers — this is the classic CNN pattern for hierarchical feature extraction.',
  'Press N to toggle this narration panel on or off.',
];

/* ============================================
   Simulation Step Narrations — Used during forward pass simulation
   These are template functions that accept model-specific info
   ============================================ */
export interface SimulationStep {
  text: string;
  layerIndex: number;
  duration: number; // milliseconds to display this step
}

/** Generate simulation narration steps for an ANN model */
export function generateANNSimulationSteps(
  layers: { id: string; type: string; neurons: number; activation?: string; label?: string }[],
): SimulationStep[] {
  const steps: SimulationStep[] = [];

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const prev = i > 0 ? layers[i - 1] : null;

    if (layer.type === 'input') {
      steps.push({
        text: `Input data enters the network through ${layer.neurons} input neurons. Each neuron represents one feature of the input — for example, pixel intensities, sensor readings, or normalized measurements.`,
        layerIndex: i,
        duration: 3000,
      });
    } else if (layer.type === 'hidden') {
      const act = layer.activation ?? 'linear';
      const activationDesc =
        act === 'relu'
          ? 'ReLU (Rectified Linear Unit) sets all negative values to zero, introducing sparsity and non-linearity'
          : act === 'sigmoid'
            ? 'Sigmoid squashes values to the range [0, 1], useful for probability-like outputs'
            : act === 'tanh'
              ? 'Tanh squashes values to [-1, 1], centering the output around zero for faster convergence'
              : `${act} activation transforms the signal`;

      steps.push({
        text: `Signals propagate through ${prev ? prev.neurons : '?'} weighted connections into "${layer.label || layer.id}" with ${layer.neurons} neurons. ${activationDesc}. Each neuron computes: output = activation(sum(weights * inputs) + bias).`,
        layerIndex: i,
        duration: 3500,
      });
    } else if (layer.type === 'output') {
      const act = layer.activation ?? 'linear';
      const outputDesc =
        act === 'softmax'
          ? `The softmax function converts ${layer.neurons} raw scores into a probability distribution that sums to 1, letting us interpret each output as the confidence for a class.`
          : act === 'sigmoid'
            ? `Sigmoid activation produces ${layer.neurons} independent probabilities, each between 0 and 1.`
            : `Linear activation produces ${layer.neurons} raw output values for regression.`;

      steps.push({
        text: `The output layer produces the final prediction with ${layer.neurons} neurons. ${outputDesc} The predicted class is whichever output neuron has the highest activation.`,
        layerIndex: i,
        duration: 3500,
      });
    }
  }

  steps.push({
    text: 'Forward pass complete! In training, the loss function now compares this prediction to the true label, and backpropagation calculates how to adjust every weight in the network to reduce the error.',
    layerIndex: layers.length - 1,
    duration: 4000,
  });

  return steps;
}

/** Generate simulation narration steps for a CNN model */
export function generateCNNSimulationSteps(
  layers: { id: string; type: string; label?: string; filters?: number; kernelSize?: number; poolSize?: number; neurons?: number; activation?: string; width?: number; height?: number; channels?: number }[],
): SimulationStep[] {
  const steps: SimulationStep[] = [];

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];

    switch (layer.type) {
      case 'input':
        steps.push({
          text: `An image enters the network as a ${layer.width}x${layer.height} grid with ${layer.channels} channel${layer.channels === 1 ? '' : 's'}. ${layer.channels === 1 ? 'Each pixel is a grayscale intensity value.' : 'Each pixel has RGB color values.'} The CNN will process this spatial data while preserving its 2D structure.`,
          layerIndex: i,
          duration: 3000,
        });
        break;

      case 'conv2d':
        steps.push({
          text: `${layer.filters} convolutional filters of size ${layer.kernelSize}x${layer.kernelSize} slide across the input, each learning to detect a different feature pattern. The output is ${layer.width}x${layer.height}x${layer.filters} — each filter produces one feature map showing where its learned pattern appears in the image.`,
          layerIndex: i,
          duration: 3500,
        });
        break;

      case 'maxpool':
      case 'avgpool': {
        const poolType = layer.type === 'maxpool' ? 'maximum' : 'average';
        steps.push({
          text: `${layer.type === 'maxpool' ? 'Max' : 'Average'} pooling with a ${layer.poolSize}x${layer.poolSize} window reduces the spatial dimensions by taking the ${poolType} value in each region. This provides translation invariance and reduces the feature map to ${layer.width}x${layer.height}, cutting computation for the next layer.`,
          layerIndex: i,
          duration: 3000,
        });
        break;
      }

      case 'batchnorm':
        steps.push({
          text: `Batch normalization standardizes the activations, making training more stable and allowing higher learning rates. It normalizes across the batch dimension and then applies learnable scale and shift parameters.`,
          layerIndex: i,
          duration: 2500,
        });
        break;

      case 'flatten':
        steps.push({
          text: `The 2D feature maps are flattened into a single vector of ${layer.neurons} values. This bridges the convolutional feature extraction stage with the fully-connected classification stage. All spatial structure is now encoded in the activation values.`,
          layerIndex: i,
          duration: 2500,
        });
        break;

      case 'dense':
        steps.push({
          text: `A fully-connected layer with ${layer.neurons} neurons combines all the extracted features. Each neuron is connected to every element of the flattened vector, learning global patterns that the convolutional layers could not capture on their own.`,
          layerIndex: i,
          duration: 3000,
        });
        break;

      case 'output':
        steps.push({
          text: `The output layer classifies the image into one of ${layer.neurons} categories using softmax. The highest activation indicates the network's predicted class. The entire pipeline — from raw pixels to this prediction — was learned end-to-end from labeled training data.`,
          layerIndex: i,
          duration: 3500,
        });
        break;

      case 'dropout':
        steps.push({
          text: `Dropout randomly deactivates neurons during training to prevent overfitting. At inference time (like now), all neurons are active and weights are scaled to compensate. This regularization technique forces the network to learn robust, redundant features.`,
          layerIndex: i,
          duration: 2500,
        });
        break;
    }
  }

  steps.push({
    text: 'Forward pass complete! The CNN has transformed raw pixel data into a class prediction through a hierarchy of increasingly abstract feature representations — from edges to textures to object parts to whole objects.',
    layerIndex: layers.length - 1,
    duration: 4000,
  });

  return steps;
}

/** Generate simulation narration steps for an LLM / Transformer model */
export function generateLLMSimulationSteps(
  layers: { id: string; type: string; label?: string; config?: { nHeads?: number; dModel?: number; dFF?: number; activation?: string } }[],
  config: { vocabSize: number; maxSeqLen: number; dModel: number; nHeads: number; nLayers: number; architecture: string },
): SimulationStep[] {
  const steps: SimulationStep[] = [];

  // Group layers into logical blocks
  let transformerBlockCount = 0;

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];

    switch (layer.type) {
      case 'embedding':
        steps.push({
          text: `Input tokens are converted to ${config.dModel}-dimensional embedding vectors. Each of the ${config.vocabSize.toLocaleString()} possible tokens maps to a unique learned vector that captures its semantic meaning. Similar words will have similar embedding vectors.`,
          layerIndex: i,
          duration: 3500,
        });
        break;

      case 'positional_encoding':
        steps.push({
          text: `Positional encodings are added to the token embeddings, giving the model a sense of token order. Without these, the model would treat "The cat sat on the mat" identically to "The mat sat on the cat." The maximum sequence length is ${config.maxSeqLen} tokens.`,
          layerIndex: i,
          duration: 3000,
        });
        break;

      case 'layer_norm':
        // Only narrate the first layer norm per transformer block
        if (layer.id.includes('ln1')) {
          transformerBlockCount++;
          steps.push({
            text: `Entering Transformer Block ${transformerBlockCount} of ${config.nLayers}. Layer normalization first stabilizes the activations. This ${config.architecture} architecture processes all ${config.nLayers} blocks sequentially, each refining the representation.`,
            layerIndex: i,
            duration: 2500,
          });
        }
        break;

      case 'attention':
        steps.push({
          text: `Multi-Head Self-Attention with ${config.nHeads} heads. Each head independently computes attention: which tokens should "look at" which other tokens. With ${config.dModel / config.nHeads}d per head, the model captures diverse relationship patterns — syntactic dependencies, semantic associations, and long-range context.`,
          layerIndex: i,
          duration: 3500,
        });
        break;

      case 'feed_forward': {
        const act = layer.config?.activation ?? 'gelu';
        steps.push({
          text: `The Feed-Forward Network expands each token's representation to ${layer.config?.dFF ?? config.dModel * 4} dimensions with ${act.toUpperCase()} activation, then projects back to ${config.dModel}d. This is where much of the model's factual knowledge is stored — each FFN acts like a learned lookup table.`,
          layerIndex: i,
          duration: 3000,
        });
        break;
      }

      case 'output':
        steps.push({
          text: `The final output layer projects the ${config.dModel}-dimensional representations back to vocabulary size (${config.vocabSize.toLocaleString()}), producing a probability distribution over all possible next tokens. The token with the highest probability becomes the model's prediction.`,
          layerIndex: i,
          duration: 3500,
        });
        break;
    }
  }

  steps.push({
    text: `Forward pass complete! The ${config.architecture} transformer processed the input through ${config.nLayers} attention blocks, each allowing every token to gather context from the sequence. This "attention is all you need" mechanism is what makes transformers so effective for language understanding and generation.`,
    layerIndex: layers.length - 1,
    duration: 4000,
  });

  return steps;
}
