import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Torus, Cylinder, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { LLMModel, TransformerLayer } from '../../../models/llm-schema';
import { useVisualizationStore } from '../../../stores/visualizationStore';
import { COLORS, ATTENTION_HEAD_COLORS } from '../../../utils/colors';

interface LLMVisualizerProps {
  model: LLMModel;
}

/** Attention beam between positions */
function AttentionBeam({
  from,
  to,
  headIndex,
  strength,
}: {
  from: [number, number, number];
  to: [number, number, number];
  headIndex: number;
  strength: number;
}) {
  const ref = useRef<THREE.Line>(null!);
  const color = ATTENTION_HEAD_COLORS[headIndex % ATTENTION_HEAD_COLORS.length];

  const lineObj = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.y += 0.5 + strength * 1.5;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(16));
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: strength * 0.5,
    });
    return new THREE.Line(geometry, material);
  }, [from, to, strength, color]);

  useFrame(() => {
    if (ref.current) {
      const mat = ref.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.1 + strength * 0.6 + Math.sin(Date.now() * 0.002) * 0.1;
    }
  });

  return <primitive ref={ref} object={lineObj} />;
}

/** Token embedding as a floating sphere */
function TokenBlock({
  position,
  label,
  index,
}: {
  position: [number, number, number];
  label: string;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(Date.now() * 0.001 + index * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      <RoundedBox ref={ref} args={[0.8, 0.4, 0.4]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={COLORS.embedding}
          emissive={COLORS.embedding}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </RoundedBox>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.18}
        color="#e0e0e0"
        anchorX="center"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

/** Attention layer visualization */
function AttentionLayerViz({
  position,
  nHeads,
  seqLen,
  layerIndex,
}: {
  position: [number, number, number];
  nHeads: number;
  seqLen: number;
  layerIndex: number;
}) {
  const showDataFlow = useVisualizationStore((s) => s.showDataFlow);

  // Generate sample attention pattern
  const beams = useMemo(() => {
    const result: { from: number; to: number; head: number; strength: number }[] = [];
    const tokenCount = Math.min(seqLen, 8); // Limit for performance

    for (let h = 0; h < Math.min(nHeads, 4); h++) {
      for (let i = 0; i < tokenCount; i++) {
        // Each token attends to 2-3 other tokens
        const attendCount = 2 + Math.floor(Math.random() * 2);
        for (let a = 0; a < attendCount; a++) {
          const j = Math.floor(Math.random() * tokenCount);
          result.push({
            from: i,
            to: j,
            head: h,
            strength: 0.2 + Math.random() * 0.8,
          });
        }
      }
    }
    return result;
  }, [nHeads, seqLen]);

  const tokenSpacing = 1.2;
  const tokenCount = Math.min(seqLen, 8);

  return (
    <group position={position}>
      {/* Attention label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color={COLORS.attention.getStyle()}
        anchorX="center"
        font={undefined}
      >
        {`Multi-Head Attention (${nHeads} heads)`}
      </Text>

      {/* Head indicators */}
      {Array.from({ length: Math.min(nHeads, 4) }).map((_, h) => (
        <Torus
          key={`head-${h}`}
          args={[tokenCount * tokenSpacing * 0.3, 0.03, 8, 32]}
          position={[0, -0.5 - h * 0.15, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={ATTENTION_HEAD_COLORS[h]}
            transparent
            opacity={0.2}
          />
        </Torus>
      ))}

      {/* Attention beams */}
      {showDataFlow && beams.map((beam, i) => {
        const fromX = (beam.from - (tokenCount - 1) / 2) * tokenSpacing;
        const toX = (beam.to - (tokenCount - 1) / 2) * tokenSpacing;
        return (
          <AttentionBeam
            key={`beam-${layerIndex}-${i}`}
            from={[fromX, 0, 0]}
            to={[toX, 0, 0]}
            headIndex={beam.head}
            strength={beam.strength}
          />
        );
      })}
    </group>
  );
}

/** Feed-forward network as an expansion tunnel */
function FeedForwardViz({
  position,
  dModel,
  dFF,
}: {
  position: [number, number, number];
  dModel: number;
  dFF: number;
}) {
  const ratio = dFF / dModel;

  return (
    <group position={position}>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.25}
        color={COLORS.feedForward.getStyle()}
        anchorX="center"
        font={undefined}
      >
        {`FFN (${dModel} → ${dFF} → ${dModel})`}
      </Text>

      {/* Expansion */}
      <Cylinder
        args={[0.5, 0.5 * ratio, 1.5, 16, 1, true]}
        position={[-1, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial
          color={COLORS.feedForward}
          emissive={COLORS.feedForward}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </Cylinder>

      {/* Compression */}
      <Cylinder
        args={[0.5 * ratio, 0.5, 1.5, 16, 1, true]}
        position={[1, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial
          color={COLORS.feedForward}
          emissive={COLORS.feedForward}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </Cylinder>
    </group>
  );
}

export default function LLMVisualizer({ model }: LLMVisualizerProps) {
  const showLabels = useVisualizationStore((s) => s.showLabels);

  const { config } = model;
  const tokenCount = Math.min(config.maxSeqLen, 8);
  const tokenSpacing = 1.2;

  // Group layers by transformer block
  const blocks = useMemo(() => {
    const result: { index: number; layers: TransformerLayer[] }[] = [];
    let currentBlock: TransformerLayer[] = [];
    let blockIndex = 0;

    for (const layer of model.layers) {
      if (layer.type === 'embedding' || layer.type === 'positional_encoding' || layer.type === 'output') {
        result.push({ index: blockIndex++, layers: [layer] });
      } else {
        currentBlock.push(layer);
        if (layer.type === 'feed_forward') {
          result.push({ index: blockIndex++, layers: [...currentBlock] });
          currentBlock = [];
        }
      }
    }
    if (currentBlock.length > 0) {
      result.push({ index: blockIndex, layers: currentBlock });
    }

    return result;
  }, [model]);

  let yOffset = 0;
  const blockSpacing = 5;

  return (
    <group>
      {/* Input tokens */}
      <group position={[0, yOffset, 0]}>
        {Array.from({ length: tokenCount }).map((_, i) => (
          <TokenBlock
            key={`token-${i}`}
            position={[(i - (tokenCount - 1) / 2) * tokenSpacing, 0, 0]}
            label={`T${i}`}
            index={i}
          />
        ))}
        {showLabels && (
          <Text
            position={[0, -1, 0]}
            fontSize={0.3}
            color="#9e9e9e"
            anchorX="center"
            font={undefined}
          >
            Input Tokens
          </Text>
        )}
      </group>

      {/* Transformer blocks */}
      {blocks.map((block) => {
        yOffset -= blockSpacing;
        const hasAttention = block.layers.some((l) => l.type === 'attention');
        const hasFF = block.layers.some((l) => l.type === 'feed_forward');
        const isEmbedding = block.layers.some((l) => l.type === 'embedding');
        const isOutput = block.layers.some((l) => l.type === 'output');

        return (
          <group key={`block-${block.index}`} position={[0, yOffset, 0]}>
            {/* Block container */}
            {hasAttention && (
              <>
                <RoundedBox
                  args={[tokenCount * tokenSpacing + 2, blockSpacing - 1, 2]}
                  radius={0.1}
                  smoothness={4}
                >
                  <meshStandardMaterial
                    color="#1a1a2e"
                    transparent
                    opacity={0.15}
                    side={THREE.DoubleSide}
                  />
                </RoundedBox>

                <AttentionLayerViz
                  position={[0, 1, 0]}
                  nHeads={config.nHeads}
                  seqLen={tokenCount}
                  layerIndex={block.index}
                />
              </>
            )}

            {hasFF && (
              <FeedForwardViz
                position={[0, -1, 0]}
                dModel={config.dModel}
                dFF={config.dFF}
              />
            )}

            {isEmbedding && showLabels && (
              <Text
                position={[0, 0, 0]}
                fontSize={0.3}
                color={COLORS.embedding.getStyle()}
                anchorX="center"
                font={undefined}
              >
                {`Embedding (${config.vocabSize} → ${config.dModel})`}
              </Text>
            )}

            {isOutput && showLabels && (
              <Text
                position={[0, 0, 0]}
                fontSize={0.3}
                color={COLORS.output.getStyle()}
                anchorX="center"
                font={undefined}
              >
                {`Output (${config.vocabSize} logits)`}
              </Text>
            )}

            {/* Block label */}
            {hasAttention && showLabels && (
              <Text
                position={[-(tokenCount * tokenSpacing) / 2 - 1.5, 0, 0]}
                fontSize={0.25}
                color="#616161"
                anchorX="right"
                font={undefined}
              >
                {`Layer ${block.index - 2}`}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}
