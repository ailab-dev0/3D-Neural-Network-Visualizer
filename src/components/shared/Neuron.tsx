import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useVisualizationStore } from '../../stores/visualizationStore';

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
  const emissiveIntensity = isSelected ? 2 : hovered ? 1.5 : 0.3 + activation * 1.2;

  useFrame(() => {
    if (meshRef.current) {
      // Gentle pulse animation
      const pulse = 1 + Math.sin(Date.now() * 0.002 + neuronIndex * 0.5) * 0.05;
      meshRef.current.scale.setScalar(scaledSize * pulse);
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[1, 16, 16]}
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
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Glow halo */}
      <Sphere args={[1, 12, 12]} scale={scaledSize * 1.4}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08 + activation * 0.12}
          side={THREE.BackSide}
        />
      </Sphere>

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
