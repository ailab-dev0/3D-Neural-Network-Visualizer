import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizationStore } from '../../stores/visualizationStore';

interface LayerTransitionProps {
  /** Start position of the connection [x, y, z] */
  start: [number, number, number];
  /** End position of the connection [x, y, z] */
  end: [number, number, number];
  /** Number of particles flowing along the path */
  particleCount?: number;
  /** Color of the tube and particles */
  color?: THREE.Color;
  /** Radius of the tube path */
  tubeRadius?: number;
  /** Size of each flowing particle */
  particleSize?: number;
}

/**
 * Animated connections between layers that show data flow direction
 * with arrow-like particle streams flowing along a tube/path geometry.
 */
export default function LayerTransition({
  start,
  end,
  particleCount = 6,
  color = new THREE.Color('#4fc3f7'),
  tubeRadius = 0.02,
  particleSize = 0.06,
}: LayerTransitionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particleRefs = useRef<THREE.Mesh[]>([]);
  const trailRefs = useRef<THREE.Mesh[]>([]);

  const animationSpeed = useVisualizationStore((s) => s.animationSpeed);
  const animationState = useVisualizationStore((s) => s.animationState);
  const connectionOpacity = useVisualizationStore((s) => s.connectionOpacity);

  // Build a quadratic bezier curve between start and end with a gentle arc
  const curve = useMemo(() => {
    const startV = new THREE.Vector3(...start);
    const endV = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().lerpVectors(startV, endV, 0.5);
    // Arc upward proportional to distance
    const dist = startV.distanceTo(endV);
    mid.y += dist * 0.12;
    return new THREE.QuadraticBezierCurve3(startV, mid, endV);
  }, [start, end]);

  // Create tube geometry along the curve
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, tubeRadius, 8, false);
  }, [curve, tubeRadius]);

  // Create an arrowhead cone position at the end
  const arrowPosition = useMemo(() => {
    return curve.getPointAt(0.98);
  }, [curve]);

  const arrowRotation = useMemo((): [number, number, number] => {
    const tangent = curve.getTangentAt(0.98);
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent.normalize());
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return [euler.x, euler.y, euler.z];
  }, [curve]);

  // Pre-compute staggered offsets for particles
  const particleOffsets = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => i / particleCount);
  }, [particleCount]);

  // Animate particles flowing along the curve
  useFrame(() => {
    const isPlaying = animationState === 'playing';

    for (let i = 0; i < particleCount; i++) {
      const mesh = particleRefs.current[i];
      if (!mesh) continue;

      if (!isPlaying) {
        mesh.visible = false;
        const trail = trailRefs.current[i];
        if (trail) trail.visible = false;
        continue;
      }

      mesh.visible = true;

      // Each particle moves at a different phase offset
      const speed = animationSpeed * 0.4;
      const t = ((Date.now() * 0.001 * speed + particleOffsets[i]) % 1);
      const point = curve.getPointAt(t);
      mesh.position.copy(point);

      // Pulse the particle size with a sine wave peaked at the middle of the path
      const pulse = 1 + Math.sin(t * Math.PI) * 0.6;
      mesh.scale.setScalar(particleSize * pulse);

      // Fade in at start, fade out at end
      const fadeAlpha = Math.sin(t * Math.PI);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = fadeAlpha * 0.9;

      // Trailing particle (slightly behind the main one)
      const trail = trailRefs.current[i];
      if (trail) {
        trail.visible = true;
        const tTrail = Math.max(0, t - 0.04);
        const trailPoint = curve.getPointAt(tTrail);
        trail.position.copy(trailPoint);
        trail.scale.setScalar(particleSize * pulse * 0.6);
        const trailMat = trail.material as THREE.MeshBasicMaterial;
        trailMat.opacity = fadeAlpha * 0.4;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Tube path */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={connectionOpacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Arrow head at the end */}
      <mesh position={arrowPosition} rotation={arrowRotation}>
        <coneGeometry args={[tubeRadius * 4, tubeRadius * 10, 6]} />
        <meshBasicMaterial color={color} transparent opacity={connectionOpacity * 0.6} />
      </mesh>

      {/* Flowing particles */}
      {particleOffsets.map((_, i) => (
        <group key={`particle-group-${i}`}>
          {/* Main particle */}
          <mesh
            ref={(el) => { if (el) particleRefs.current[i] = el; }}
            visible={false}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Trail particle */}
          <mesh
            ref={(el) => { if (el) trailRefs.current[i] = el; }}
            visible={false}
          >
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
