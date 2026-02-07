import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, RoundedBox, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { CNNModel, CNNLayer } from '../../../models/cnn-schema';
import { useVisualizationStore } from '../../../stores/visualizationStore';
import { COLORS } from '../../../utils/colors';

interface CNNVisualizerProps {
  model: CNNModel;
}

interface VisualLayer {
  layer: CNNLayer;
  position: THREE.Vector3;
  visualSize: { w: number; h: number; d: number };
}

function getLayerColor(type: CNNLayer['type']): THREE.Color {
  switch (type) {
    case 'input': return COLORS.input;
    case 'conv2d': return COLORS.conv;
    case 'maxpool': case 'avgpool': return COLORS.pool;
    case 'batchnorm': return COLORS.norm;
    case 'flatten': return new THREE.Color('#80deea');
    case 'dense': return COLORS.hidden;
    case 'output': return COLORS.output;
    default: return COLORS.hidden;
  }
}

function FeatureMapVolume({
  position,
  size,
  color,
  label,
  layerId,
  isSelected,
  layerIndex = 0,
}: {
  position: [number, number, number];
  size: { w: number; h: number; d: number };
  color: THREE.Color;
  label?: string;
  layerId: string;
  isSelected: boolean;
  layerIndex?: number;
}) {
  const showLabels = useVisualizationStore((s) => s.showLabels);
  const selectLayer = useVisualizationStore((s) => s.selectLayer);
  const animationState = useVisualizationStore((s) => s.animationState);
  const animationSpeed = useVisualizationStore((s) => s.animationSpeed);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  // Subtle pulse when animation is playing
  useFrame(() => {
    if (!matRef.current) return;
    if (animationState === 'playing') {
      const time = Date.now() * 0.001;
      const pulse = Math.sin(time * animationSpeed * 1.2 + layerIndex * 0.8) * 0.25;
      matRef.current.emissiveIntensity = (isSelected ? 1.5 : 0.3) + pulse;
      matRef.current.opacity = 0.7 + pulse * 0.1;
    } else {
      matRef.current.emissiveIntensity = isSelected ? 1.5 : 0.3;
      matRef.current.opacity = 0.7;
    }
  });

  return (
    <group position={position}>
      {/* Main volume */}
      <RoundedBox
        args={[size.w, size.h, size.d]}
        radius={0.05}
        smoothness={4}
        onClick={() => selectLayer(layerId)}
        onPointerEnter={() => { document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { document.body.style.cursor = 'auto'; }}
      >
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.5 : 0.3}
          transparent
          opacity={0.7}
          roughness={0.3}
          metalness={0.6}
          side={THREE.DoubleSide}
        />
      </RoundedBox>

      {/* Wireframe overlay */}
      <RoundedBox args={[size.w, size.h, size.d]} radius={0.05} smoothness={4}>
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </RoundedBox>

      {/* Glow */}
      <RoundedBox args={[size.w * 1.1, size.h * 1.1, size.d * 1.1]} radius={0.05} smoothness={4}>
        <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.BackSide} />
      </RoundedBox>

      {/* Label */}
      {showLabels && label && (
        <Text
          position={[0, size.h / 2 + 0.4, 0]}
          fontSize={0.25}
          color="#e0e0e0"
          anchorX="center"
          anchorY="bottom"
          maxWidth={4}
          font={undefined}
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function KernelVisual({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: number;
  color: THREE.Color;
}) {
  return (
    <group position={position}>
      <Box args={[size, size, size * 0.3]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
          wireframe
        />
      </Box>
    </group>
  );
}

export default function CNNVisualizer({ model }: CNNVisualizerProps) {
  const selectedLayerId = useVisualizationStore((s) => s.selectedLayerId);
  const showWeights = useVisualizationStore((s) => s.showWeights);

  const visualLayers = useMemo((): VisualLayer[] => {
    const scale = 0.04;
    let zOffset = 0;

    return model.layers.map((layer) => {
      let w: number, h: number, d: number;

      if (layer.width && layer.height && layer.channels) {
        w = layer.width * scale;
        h = layer.height * scale;
        d = Math.max(layer.channels * scale * 0.5, 0.2);
      } else if (layer.neurons) {
        const side = Math.ceil(Math.sqrt(layer.neurons));
        w = side * scale * 2;
        h = side * scale * 2;
        d = 0.3;
      } else {
        w = 1;
        h = 1;
        d = 0.3;
      }

      const spacing = Math.max(d, 1) + 1.5;
      const position = new THREE.Vector3(0, 0, zOffset);
      zOffset += spacing;

      return { layer, position, visualSize: { w, h, d } };
    });
  }, [model]);

  // Center the visualization
  const centerOffset = useMemo(() => {
    if (visualLayers.length === 0) return 0;
    const last = visualLayers[visualLayers.length - 1];
    return -last.position.z / 2;
  }, [visualLayers]);

  return (
    <group position={[0, 0, centerOffset]}>
      {visualLayers.map(({ layer, position, visualSize }, layerIdx) => (
        <group key={layer.id}>
          <FeatureMapVolume
            position={[position.x, position.y, position.z]}
            size={visualSize}
            color={getLayerColor(layer.type)}
            label={layer.label}
            layerId={layer.id}
            isSelected={selectedLayerId === layer.id}
            layerIndex={layerIdx}
          />

          {/* Show kernel for conv layers */}
          {showWeights && layer.type === 'conv2d' && layer.kernelSize && (
            <KernelVisual
              position={[visualSize.w / 2 + 0.5, 0, position.z]}
              size={layer.kernelSize * 0.15}
              color={COLORS.conv}
            />
          )}
        </group>
      ))}

      {/* Connection arrows and LayerTransition between layers */}
      {visualLayers.slice(0, -1).map(({ layer, position, visualSize }, i) => {
        const next = visualLayers[i + 1];
        const startZ = position.z + visualSize.d / 2;
        const endZ = next.position.z - next.visualSize.d / 2;

        return (
          <group key={`arrow-${layer.id}`}>
            {/* Simple line connection */}
            <Line
              points={[[0, 0, startZ], [0, 0, endZ]]}
              color="#4fc3f7"
              transparent
              opacity={0.3}
              lineWidth={1}
            />

            {/* Arrow head */}
            <mesh position={[0, 0, endZ]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.15, 0.3, 8]} />
              <meshBasicMaterial color="#4fc3f7" transparent opacity={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Skip connections */}
      {visualLayers.map(({ layer, position, visualSize }) => {
        if (!layer.skipTo) return null;
        const targetLayer = visualLayers.find((vl) => vl.layer.id === layer.skipTo);
        if (!targetLayer) return null;

        return (
          <Line
            key={`skip-${layer.id}`}
            points={[
              [visualSize.w / 2 + 0.3, 0, position.z],
              [targetLayer.visualSize.w / 2 + 0.3, 0, targetLayer.position.z],
            ]}
            color="#69f0ae"
            transparent
            opacity={0.6}
            lineWidth={1}
          />
        );
      })}
    </group>
  );
}
