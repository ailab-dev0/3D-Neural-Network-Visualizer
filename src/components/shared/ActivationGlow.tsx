import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useVisualizationStore } from '../../stores/visualizationStore';

interface ActivationGlowProps {
  /** The child neuron/element to wrap */
  children: React.ReactNode;
  /** Base activation value from 0 to 1 */
  activation?: number;
  /** Color of the glow effect */
  color?: THREE.Color;
  /** Radius of the glow sphere relative to the neuron */
  glowScale?: number;
  /** Unique index used to offset the sine wave phase */
  phaseOffset?: number;
}

/**
 * A component that wraps neurons and pulses their glow based on
 * simulated activation values. Uses sine-wave animation synced
 * to the animation speed from visualizationStore.
 */
export default function ActivationGlow({
  children,
  activation = 0.5,
  color = new THREE.Color('#4fc3f7'),
  glowScale = 1.8,
  phaseOffset = 0,
}: ActivationGlowProps) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  const animationSpeed = useVisualizationStore((s) => s.animationSpeed);
  const animationState = useVisualizationStore((s) => s.animationState);
  const glowIntensity = useVisualizationStore((s) => s.glowIntensity);
  const showActivations = useVisualizationStore((s) => s.showActivations);

  useFrame(() => {
    if (!outerRef.current || !innerRef.current) return;

    const isPlaying = animationState === 'playing';

    // Sine wave oscillation synced to animation speed
    const time = Date.now() * 0.001;
    const frequency = animationSpeed * 1.5;
    const sineValue = Math.sin(time * frequency + phaseOffset);

    // Activation modulates the glow amplitude
    const baseGlow = activation * glowIntensity;

    if (isPlaying && showActivations) {
      // Dynamic pulsing: base glow + sine modulation
      const pulseAmplitude = activation * 0.3;
      const currentGlow = baseGlow + sineValue * pulseAmplitude;

      // Outer glow sphere opacity
      const outerMat = outerRef.current.material as THREE.MeshBasicMaterial;
      outerMat.opacity = Math.max(0.02, currentGlow * 0.15);

      // Outer glow scale breathes
      const breathScale = glowScale * (1 + sineValue * 0.1 * activation);
      outerRef.current.scale.setScalar(breathScale);

      // Inner ring opacity
      const innerMat = innerRef.current.material as THREE.MeshBasicMaterial;
      innerMat.opacity = Math.max(0.01, currentGlow * 0.08);
      innerRef.current.scale.setScalar(glowScale * 1.3 * (1 + sineValue * 0.05 * activation));
    } else {
      // Static glow when paused
      const outerMat = outerRef.current.material as THREE.MeshBasicMaterial;
      outerMat.opacity = showActivations ? baseGlow * 0.1 : 0.02;
      outerRef.current.scale.setScalar(glowScale);

      const innerMat = innerRef.current.material as THREE.MeshBasicMaterial;
      innerMat.opacity = showActivations ? baseGlow * 0.05 : 0.01;
      innerRef.current.scale.setScalar(glowScale * 1.3);
    }
  });

  return (
    <group>
      {/* The wrapped child (neuron/element) */}
      {children}

      {/* Outer glow halo */}
      <Sphere ref={outerRef} args={[1, 12, 12]} scale={glowScale}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>

      {/* Inner diffuse ring */}
      <Sphere ref={innerRef} args={[1, 10, 10]} scale={glowScale * 1.3}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>
    </group>
  );
}
