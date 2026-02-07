import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ANNModel } from '../../../models/ann-schema';
import { useVisualizationStore } from '../../../stores/visualizationStore';
import { COLORS, getActivationColor } from '../../../utils/colors';
import { calculateNeuronPositions, calculateLayerDepths } from '../../../utils/math';
import Neuron from '../../shared/Neuron';
import Connection from '../../shared/Connection';
import DataFlowParticle from '../../shared/DataFlowParticle';

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
  const showDataFlow = useVisualizationStore((s) => s.showDataFlow);
  const showLabels = useVisualizationStore((s) => s.showLabels);
  const selectedLayerId = useVisualizationStore((s) => s.selectedLayerId);

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

  return (
    <group>
      {/* Layers */}
      {layerData.map(({ layer, positions, depth }) => (
        <group key={layer.id}>
          {/* Layer label */}
          {showLabels && (
            <Text
              position={[0, positions.length > 8 ? 3.5 : 2.5, depth]}
              fontSize={0.4}
              color="#e0e0e0"
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
              color={getActivationColor(layer.activation).getStyle()}
              anchorX="center"
              anchorY="top"
              font={undefined}
            >
              {layer.activation.toUpperCase()}
            </Text>
          )}

          {/* Neurons */}
          {positions.map((pos, j) => (
            <Neuron
              key={`${layer.id}-${j}`}
              position={[pos.x, pos.y, pos.z]}
              color={getLayerColor(layer)}
              layerId={layer.id}
              neuronIndex={j}
              isSelected={selectedLayerId === layer.id}
              size={layer.type === 'input' ? 0.25 : layer.type === 'output' ? 0.35 : 0.3}
            />
          ))}
        </group>
      ))}

      {/* Connections between layers */}
      {showWeights && layerData.slice(0, -1).map(({ layer: fromLayer, positions: fromPositions }, layerIdx) => {
        const toData = layerData[layerIdx + 1];
        const connections: React.JSX.Element[] = [];

        // Limit connections for performance
        const maxConns = Math.min(fromPositions.length * toData.positions.length, 200);
        const skipFrom = Math.max(1, Math.floor(fromPositions.length / Math.sqrt(maxConns)));
        const skipTo = Math.max(1, Math.floor(toData.positions.length / Math.sqrt(maxConns)));

        for (let i = 0; i < fromPositions.length; i += skipFrom) {
          for (let j = 0; j < toData.positions.length; j += skipTo) {
            const from = fromPositions[i];
            const to = toData.positions[j];
            const weight = 0.2 + Math.random() * 0.6; // Simulated weights

            connections.push(
              <Connection
                key={`conn-${fromLayer.id}-${i}-${j}`}
                start={[from.x, from.y, from.z]}
                end={[to.x, to.y, to.z]}
                weight={weight}
                color={COLORS.hidden}
              />
            );
          }
        }
        return connections;
      })}

      {/* Data flow particles */}
      {showDataFlow && layerData.slice(0, -1).map(({ positions: fromPositions }, layerIdx) => {
        const toData = layerData[layerIdx + 1];
        const particles: React.JSX.Element[] = [];

        // Show a few animated particles per layer connection
        const count = Math.min(3, fromPositions.length);
        for (let i = 0; i < count; i++) {
          const fromIdx = Math.floor(Math.random() * fromPositions.length);
          const toIdx = Math.floor(Math.random() * toData.positions.length);
          const from = fromPositions[fromIdx];
          const to = toData.positions[toIdx];

          particles.push(
            <DataFlowParticle
              key={`particle-${layerIdx}-${i}`}
              start={[from.x, from.y, from.z]}
              end={[to.x, to.y, to.z]}
              speed={0.5 + Math.random() * 0.5}
              delay={i * 0.7}
            />
          );
        }
        return particles;
      })}
    </group>
  );
}
