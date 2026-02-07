/** Schema for LLM / Transformer models */

export interface TransformerConfig {
  vocabSize: number;
  maxSeqLen: number;
  dModel: number;
  nHeads: number;
  nLayers: number;
  dFF: number; // feed-forward intermediate dimension
  dropout?: number;
  architecture: 'encoder-only' | 'decoder-only' | 'encoder-decoder';
}

export interface AttentionHead {
  headIndex: number;
  dK: number; // key dimension per head
}

export interface TransformerLayer {
  id: string;
  layerIndex: number;
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
  type: 'llm';
  name: string;
  description?: string;
  config: TransformerConfig;
  layers: TransformerLayer[];
  metadata?: {
    framework?: string;
    trainedOn?: string;
    parameters?: number;
    tokenizer?: string;
  };
}

/** Generate layers for a transformer model */
function generateTransformerLayers(config: TransformerConfig): TransformerLayer[] {
  const layers: TransformerLayer[] = [];
  const dK = Math.floor(config.dModel / config.nHeads);
  const archLabel = config.architecture === 'encoder-only' ? 'Encoder' : 'Decoder';

  layers.push({
    id: 'embedding',
    layerIndex: 0,
    type: 'embedding',
    label: `Token Embedding — Vocabulary ${config.vocabSize.toLocaleString()} → ${config.dModel}-dim vectors`,
    config: { dModel: config.dModel },
  });

  layers.push({
    id: 'pos_encoding',
    layerIndex: 1,
    type: 'positional_encoding',
    label: `Positional Encoding — Sequence position info (max ${config.maxSeqLen.toLocaleString()} tokens)`,
    config: { dModel: config.dModel },
  });

  for (let i = 0; i < config.nLayers; i++) {
    const blockNum = i + 1;

    layers.push({
      id: `layer_${i}_ln1`,
      layerIndex: 2 + i * 4,
      type: 'layer_norm',
      label: `${archLabel} Block ${blockNum} — Pre-Attention LayerNorm (stabilize gradients)`,
      config: { dModel: config.dModel },
    });

    layers.push({
      id: `layer_${i}_attn`,
      layerIndex: 3 + i * 4,
      type: 'attention',
      label: `${archLabel} Block ${blockNum} — Self-Attention (${config.nHeads} heads, d_k=${dK})`,
      config: { nHeads: config.nHeads, dModel: config.dModel },
    });

    layers.push({
      id: `layer_${i}_ln2`,
      layerIndex: 4 + i * 4,
      type: 'layer_norm',
      label: `${archLabel} Block ${blockNum} — Pre-FFN LayerNorm (stabilize gradients)`,
      config: { dModel: config.dModel },
    });

    layers.push({
      id: `layer_${i}_ff`,
      layerIndex: 5 + i * 4,
      type: 'feed_forward',
      label: `${archLabel} Block ${blockNum} — Feed-Forward Network (${config.dModel} → ${config.dFF} → ${config.dModel}, GELU)`,
      config: { dModel: config.dModel, dFF: config.dFF, activation: 'gelu' },
    });
  }

  layers.push({
    id: 'output',
    layerIndex: 2 + config.nLayers * 4,
    type: 'output',
    label: `Output Projection — Logits over ${config.vocabSize.toLocaleString()} token vocabulary`,
    config: { dModel: config.dModel },
  });

  return layers;
}

/** GPT-2 Small preset */
export function createGPT2Small(): LLMModel {
  const config: TransformerConfig = {
    vocabSize: 50257,
    maxSeqLen: 1024,
    dModel: 768,
    nHeads: 12,
    nLayers: 4, // Simplified for visualization (real: 12)
    dFF: 3072,
    dropout: 0.1,
    architecture: 'decoder-only',
  };

  return {
    type: 'llm',
    name: 'GPT-2 Small (Simplified)',
    description: 'Decoder-only transformer (4 layers shown of 12) for text generation',
    config,
    layers: generateTransformerLayers(config),
    metadata: {
      framework: 'PyTorch',
      trainedOn: 'WebText',
      parameters: 124_000_000,
      tokenizer: 'BPE',
    },
  };
}

/** BERT Tiny preset */
export function createBERTTiny(): LLMModel {
  const config: TransformerConfig = {
    vocabSize: 30522,
    maxSeqLen: 512,
    dModel: 128,
    nHeads: 2,
    nLayers: 2,
    dFF: 512,
    dropout: 0.1,
    architecture: 'encoder-only',
  };

  return {
    type: 'llm',
    name: 'BERT Tiny',
    description: 'Minimal encoder-only transformer for understanding attention mechanisms',
    config,
    layers: generateTransformerLayers(config),
    metadata: {
      framework: 'PyTorch',
      trainedOn: 'BookCorpus + Wikipedia',
      parameters: 4_400_000,
      tokenizer: 'WordPiece',
    },
  };
}

/** Nano Transformer for educational use */
export function createNanoTransformer(): LLMModel {
  const config: TransformerConfig = {
    vocabSize: 256,
    maxSeqLen: 32,
    dModel: 64,
    nHeads: 4,
    nLayers: 2,
    dFF: 256,
    architecture: 'decoder-only',
  };

  return {
    type: 'llm',
    name: 'Nano Transformer',
    description: 'Tiny transformer perfect for understanding the building blocks',
    config,
    layers: generateTransformerLayers(config),
    metadata: {
      parameters: 52_000,
      tokenizer: 'Character-level',
    },
  };
}

/** Tiny Llama preset — small Llama-style decoder-only model */
export function createTinyLlama(): LLMModel {
  const config: TransformerConfig = {
    vocabSize: 32000,
    maxSeqLen: 2048,
    dModel: 512,
    nHeads: 8,
    nLayers: 4, // Simplified for visualization (real TinyLlama has 22)
    dFF: 1376,
    dropout: 0.0,
    architecture: 'decoder-only',
  };

  return {
    type: 'llm',
    name: 'Tiny Llama',
    description: 'Small Llama-style decoder-only model with RoPE and SwiGLU (4 of 22 layers shown)',
    config,
    layers: generateTransformerLayers(config),
    metadata: {
      framework: 'PyTorch',
      trainedOn: 'SlimPajama + StarCoder',
      parameters: 1_100_000_000,
      tokenizer: 'SentencePiece',
    },
  };
}

/** Mini GPT preset — minimal GPT for teaching transformer concepts */
export function createMiniGPT(): LLMModel {
  const config: TransformerConfig = {
    vocabSize: 512,
    maxSeqLen: 64,
    dModel: 96,
    nHeads: 3,
    nLayers: 3,
    dFF: 384,
    dropout: 0.1,
    architecture: 'decoder-only',
  };

  return {
    type: 'llm',
    name: 'Mini GPT',
    description: 'Minimal GPT for teaching — small enough to trace every operation by hand',
    config,
    layers: generateTransformerLayers(config),
    metadata: {
      parameters: 96 * 512 + 96 * 64 + 3 * (4 * 96 * 96 + 96 * 384 + 384 * 96) + 96 * 512,
      tokenizer: 'Character-level',
    },
  };
}
