import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ANNModel } from '../../../models/ann-schema';
import { useVisualizationStore } from '../../../stores/visualizationStore';
import { COLORS, getActivationColor } from '../../../utils/colors';
import { calculateNeuronPositions, calculateLayerDepths } from '../../../utils/math';
import Neuron from '../../shared/Neuron';
import Connection from '../../shared/Connection';
import DataFlowParticle from '../../shared/DataFlowParticle';
import CognitiveLightCone from '../../shared/CognitiveLightCone';

interface ANNVisualizerProps {
  model: ANNModel;
}

interface LayerData {
  layer: ANNModel['layers'][0];
  positions: THREE.Vector3[];
  depth: number;
}

export default function ANNVisualizer({ model }: ANNVisualizerProps) {
  const showWeights = useVisualizationStore((s) => s.showWeights);
  const showLabels = useVisualizationStore((s) => s.showLabels);
  const showDataFlow = useVisualizationStore((s) => s.showDataFlow);
  const selectedLayerId = useVisualizationStore((s) => s.selectedLayerId);
  const animationState = useVisualizationStore((s) => s.animationState);
  const isPlaying = animationState === 'playing';
  const lightConeEnabled = useVisualizationStore((s) => s.lightConeEnabled);
  const lightConeMode = useVisualizationStore((s) => s.lightConeMode);
  const lightConeDepth = useVisualizationStore((s) => s.lightConeDepth);

  const layerData = useMemo((): LayerData[] => {
    const depths = calculateLayerDepths(model.layers.length, 6);

    return model.layers.map((layer, i) => {
      const layerPos = new THREE.Vector3(0, 0, depths[i]);
      const positions = calculateNeuronPositions(
        Math.min(layer.neurons, 32), // Cap visual neurons
        layerPos,
        1.0,
        8
      );
      return { layer, positions, depth: depths[i] };
    });
  }, [model]);

  const getLayerColor = (layer: ANNModel['layers'][0]): THREE.Color => {
    switch (layer.type) {
      case 'input': return COLORS.input;
      case 'output': return COLORS.output;
      default: return layer.activation ? getActivationColor(layer.activation) : COLORS.hidden;
    }
  };

  // Pre-compute connection weights with stable random values (avoid Math.random() in render path)
  const connectionData = useMemo(() => {
    const result: { fromLayerId: string; fromPos: THREE.Vector3; toPos: THREE.Vector3; weight: number }[] = [];

    for (let layerIdx = 0; layerIdx < layerData.length - 1; layerIdx++) {
      const { layer: fromLayer, positions: fromPositions } = layerData[layerIdx];
      const toData = layerData[layerIdx + 1];

      const maxConns = Math.min(fromPositions.length * toData.positions.length, 200);
      const skipFrom = Math.max(1, Math.floor(fromPositions.length / Math.sqrt(maxConns)));
      const skipTo = Math.max(1, Math.floor(toData.positions.length / Math.sqrt(maxConns)));

      for (let i = 0; i < fromPositions.length; i += skipFrom) {
        for (let j = 0; j < toData.positions.length; j += skipTo) {
          result.push({
            fromLayerId: fromLayer.id,
            fromPos: fromPositions[i],
            toPos: toData.positions[j],
            weight: 0.2 + Math.random() * 0.6,
          });
        }
      }
    }
    return result;
  }, [layerData]);

  // Cognitive Light Cone: determine which layers fall within the cone reach
  const lightConeActive = lightConeEnabled && selectedLayerId !== null;

  const selectedLayerIndex = useMemo(() => {
    if (!selectedLayerId) return -1;
    return layerData.findIndex((ld) => ld.layer.id === selectedLayerId);
  }, [layerData, selectedLayerId]);

  const layersInCone = useMemo(() => {
    const inCone = new Set<string>();
    if (!lightConeActive || selectedLayerIndex < 0) return inCone;

    // The selected layer is always in the cone
    inCone.add(layerData[selectedLayerIndex].layer.id);

    const showForward = lightConeMode === 'forward' || lightConeMode === 'both';
    const showBackward = lightConeMode === 'backward' || lightConeMode === 'both';

    // Forward: layers after the selected layer, up to lightConeDepth
    if (showForward) {
      for (let i = 1; i <= lightConeDepth; i++) {
        const idx = selectedLayerIndex + i;
        if (idx < layerData.length) {
          inCone.add(layerData[idx].layer.id);
        }
      }
    }

    // Backward: layers before the selected layer, up to lightConeDepth
    if (showBackward) {
      for (let i = 1; i <= lightConeDepth; i++) {
        const idx = selectedLayerIndex - i;
        if (idx >= 0) {
          inCone.add(layerData[idx].layer.id);
        }
      }
    }

    return inCone;
  }, [lightConeActive, selectedLayerIndex, lightConeMode, lightConeDepth, layerData]);

  // Cone geometry dimensions based on layer spacing and depth
  const coneParams = useMemo(() => {
    if (!lightConeActive || selectedLayerIndex < 0) {
      return { originPosition: [0, 0, 0] as [number, number, number], radius: 0, depth: 0 };
    }
    const originDepth = layerData[selectedLayerIndex].depth;
    const layerSpacing = layerData.length > 1 ? Math.abs(layerData[1].depth - layerData[0].depth) : 6;
    const coneDepthWorld = lightConeDepth * layerSpacing;
    // Radius expands proportionally — wider for more depth
    const coneRadius = 1.5 + lightConeDepth * 0.8;
    return {
      originPosition: [0, 0, originDepth] as [number, number, number],
      radius: coneRadius,
      depth: coneDepthWorld,
    };
  }, [lightConeActive, selectedLayerIndex, lightConeDepth, layerData]);

  // Pre-compute data flow particle assignments with stable random values
  const particleData = useMemo(() => {
    const result: { layerIdx: number; index: number; fromPos: THREE.Vector3; toPos: THREE.Vector3; speed: number }[] = [];

    for (let layerIdx = 0; layerIdx < layerData.length - 1; layerIdx++) {
      const { positions: fromPositions } = layerData[layerIdx];
      const toData = layerData[layerIdx + 1];

      const count = Math.min(3, fromPositions.length);
      for (let i = 0; i < count; i++) {
        const fromIdx = Math.floor(Math.random() * fromPositions.length);
        const toIdx = Math.floor(Math.random() * toData.positions.length);
        result.push({
          layerIdx,
          index: i,
          fromPos: fromPositions[fromIdx],
          toPos: toData.positions[toIdx],
          speed: 0.5 + Math.random() * 0.5,
        });
      }
    }
    return result;
  }, [layerData]);

  return (
    <group>
      {/* Scene dim overlay -- when light cone is active, dim the ambient scene slightly */}

      {/* Layers */}
      {layerData.map(({ layer, positions, depth }) => {
        const inCone = !lightConeActive || layersInCone.has(layer.id);
        // When light cone is active, layers outside the cone get dimmed
        const layerOpacityScale = lightConeActive ? (inCone ? 1.0 : 0.15) : 1.0;
        // Boost activation for neurons inside the cone
        const coneActivationBoost = lightConeActive && inCone ? 0.4 : 0;

        return (
          <group key={layer.id}>
            {/* Layer label */}
            {showLabels && (
              <Text
                position={[0, positions.length > 8 ? 3.5 : 2.5, depth]}
                fontSize={0.4}
                color={lightConeActive && !inCone ? '#444444' : '#e0e0e0'}
                anchorX="center"
                anchorY="bottom"
                font={undefined}
              >
                {layer.label || layer.id}
                {layer.neurons > 32 ? ` (${layer.neurons} neurons)` : ''}
              </Text>
            )}

            {/* Activation label */}
            {showLabels && layer.activation && (
              <Text
                position={[0, positions.length > 8 ? -3.5 : -2.5, depth]}
                fontSize={0.25}
                color={lightConeActive && !inCone ? '#333333' : getActivationColor(layer.activation).getStyle()}
                anchorX="center"
                anchorY="top"
                font={undefined}
              >
                {layer.activation.toUpperCase()}
              </Text>
            )}

            {/* Neurons rendered directly — no ActivationGlow wrapper */}
            {positions.map((pos, j) => (
              <Neuron
                key={`${layer.id}-${j}`}
                position={[pos.x, pos.y, pos.z]}
                color={getLayerColor(layer)}
                layerId={layer.id}
                neuronIndex={j}
                isSelected={selectedLayerId === layer.id}
                activation={
                  lightConeActive
                    ? (inCone ? (0.3 + (j % 5) * 0.14 + coneActivationBoost) * layerOpacityScale : 0)
                    : (0.3 + (j % 5) * 0.14) * layerOpacityScale
                }
                size={layer.type === 'input' ? 0.25 : layer.type === 'output' ? 0.35 : 0.3}
              />
            ))}
          </group>
        );
      })}

      {/* Connections between layers */}
      {showWeights && connectionData.map(({ fromLayerId, fromPos, toPos, weight }, connIdx) => {
        // Determine if this connection is within the light cone
        const connInCone = !lightConeActive || layersInCone.has(fromLayerId);
        const connWeight = lightConeActive
          ? (connInCone ? weight * 1.5 : weight * 0.08)
          : weight;

        return (
          <Connection
            key={`conn-${fromLayerId}-${connIdx}`}
            start={[fromPos.x, fromPos.y, fromPos.z]}
            end={[toPos.x, toPos.y, toPos.z]}
            weight={connWeight}
            color={COLORS.hidden}
            animated={isPlaying}
          />
        );
      })}

      {/* Data flow particles — gated by showDataFlow toggle */}
      {showDataFlow && particleData.map(({ layerIdx, index, fromPos, toPos, speed }) => (
        <DataFlowParticle
          key={`particle-${layerIdx}-${index}`}
          start={[fromPos.x, fromPos.y, fromPos.z]}
          end={[toPos.x, toPos.y, toPos.z]}
          speed={speed}
          delay={index * 0.7}
        />
      ))}

      {/* Cognitive Light Cone */}
      {lightConeActive && (
        <CognitiveLightCone
          originPosition={coneParams.originPosition}
          direction={lightConeMode}
          radius={coneParams.radius}
          depth={coneParams.depth}
        />
      )}
    </group>
  );
}
