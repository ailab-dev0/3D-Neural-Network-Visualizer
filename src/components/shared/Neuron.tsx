import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useVisualizationStore } from '../../stores/visualizationStore';

// Shared geometries at module level -- reused by all Neuron instances to save memory
const SHARED_NEURON_GEOMETRY = new THREE.SphereGeometry(1, 16, 16);
const SHARED_GLOW_GEOMETRY = new THREE.SphereGeometry(1, 12, 12);

interface NeuronProps {
  position: [number, number, number];
  color: THREE.Color;
  size?: number;
  label?: string;
  layerId: string;
  neuronIndex: number;
  activation?: number; // 0 to 1
  isSelected?: boolean;
}

export default function Neuron({
  position,
  color,
  size = 0.3,
  label,
  layerId,
  neuronIndex,
  activation = 0,
  isSelected = false,
}: NeuronProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const neuronSize = useVisualizationStore((s) => s.neuronSize);
  const showLabels = useVisualizationStore((s) => s.showLabels);
  const selectLayer = useVisualizationStore((s) => s.selectLayer);
  const hoverLayer = useVisualizationStore((s) => s.hoverLayer);

  const scaledSize = size * neuronSize;
  const emissiveIntensity = isSelected ? 4.0 : hovered ? 1.5 : 0.3 + activation * 1.2;

  useFrame(() => {
    if (meshRef.current) {
      const pulse = isSelected
        ? 1 + Math.sin(Date.now() * 0.004) * 0.15  // Dramatic pulse when selected
        : 1 + Math.sin(Date.now() * 0.002 + neuronIndex * 0.5) * 0.05;
      const selectedScale = isSelected ? scaledSize * 1.4 : scaledSize;
      meshRef.current.scale.setScalar(selectedScale * pulse);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={SHARED_NEURON_GEOMETRY}
        scale={scaledSize}
        onClick={() => selectLayer(layerId)}
        onPointerEnter={() => {
          setHovered(true);
          hoverLayer(layerId);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          hoverLayer(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? new THREE.Color('#00e5ff') : color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glow halo */}
      <mesh geometry={SHARED_GLOW_GEOMETRY} scale={isSelected ? scaledSize * 2.2 : scaledSize * 1.4}>
        <meshBasicMaterial
          color={isSelected ? new THREE.Color('#00e5ff') : color}
          transparent
          opacity={isSelected ? 0.25 : 0.08 + activation * 0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {showLabels && label && hovered && (
        <Html distanceFactor={15} style={{ pointerEvents: 'none' }}>
          <div className="glass-panel px-2 py-1 rounded text-xs whitespace-nowrap text-white">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
