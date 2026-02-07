import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LightConeMode } from '../../stores/visualizationStore';
import LightConeParticles from './LightConeParticles';

// Module-level shared geometries
const CONE_SEGMENTS = 48;
const CONE_HEIGHT_SEGMENTS = 12;
const SHARED_CONE_GEOMETRY = new THREE.ConeGeometry(1, 1, CONE_SEGMENTS, CONE_HEIGHT_SEGMENTS, true);
const SHARED_WIREFRAME_GEOMETRY = new THREE.ConeGeometry(1, 1, 24, 8, true);
const SHARED_RING_GEOMETRY = new THREE.RingGeometry(0.95, 1.0, CONE_SEGMENTS);
const SHARED_ORIGIN_SPHERE_GEOMETRY = new THREE.SphereGeometry(1, 24, 24);

interface CognitiveLightConeProps {
  originPosition: [number, number, number];
  direction: LightConeMode;
  radius: number;
  depth: number;
}

/** A single cone (forward or backward) with glow, wireframe, and ring */
function SingleCone({
  position,
  radius,
  height,
  color,
  flipDirection,
}: {
  position: [number, number, number];
  radius: number;
  height: number;
  color: THREE.Color;
  flipDirection: boolean;
}) {
  const coneRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Pulsing animation
  useFrame(() => {
    const time = Date.now() * 0.001;
    const pulse = 1.0 + Math.sin(time * 1.5) * 0.04;
    const breathe = 1.0 + Math.sin(time * 0.8) * 0.02;

    if (coneRef.current) {
      const mat = coneRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(time * 2.0) * 0.03;
      coneRef.current.scale.set(radius * pulse, height, radius * pulse);
    }
    if (wireRef.current) {
      const mat = wireRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(time * 1.2 + 1.0) * 0.04;
      wireRef.current.scale.set(radius * breathe, height, radius * breathe);
    }
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(time * 3.0) * 0.08;
      ringRef.current.scale.setScalar(radius * pulse);
    }
  });

  // Rotation: cone geometry tip is at +Y, base at -Y
  // Forward cone: opens toward +Z (deeper layers), so rotate -90 deg around X
  // Backward cone: opens toward -Z (earlier layers), so rotate +90 deg around X
  const rotationX = flipDirection ? Math.PI / 2 : -Math.PI / 2;
  // Offset the cone so the tip is at origin and it extends outward
  const offsetZ = flipDirection ? -height / 2 : height / 2;

  const px = position[0];
  const py = position[1];
  const pz = position[2];

  return (
    <group position={[px, py, pz + offsetZ]}>
      {/* Main semi-transparent cone */}
      <mesh
        ref={coneRef}
        geometry={SHARED_CONE_GEOMETRY}
        rotation={[rotationX, 0, 0]}
        scale={[radius, height, radius]}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe overlay for structure */}
      <mesh
        ref={wireRef}
        geometry={SHARED_WIREFRAME_GEOMETRY}
        rotation={[rotationX, 0, 0]}
        scale={[radius, height, radius]}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          wireframe
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Ring at the base of the cone (the wide end) */}
      <group position={[0, 0, flipDirection ? -height / 2 : height / 2]}>
        <mesh
          ref={ringRef}
          geometry={SHARED_RING_GEOMETRY}
          rotation={[Math.PI / 2, 0, 0]}
          scale={radius}
        >
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/** Glowing origin sphere at the selection point */
function OriginGlow({
  position,
  color,
}: {
  position: [number, number, number];
  color: THREE.Color;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const time = Date.now() * 0.001;
      const pulse = 0.25 + Math.sin(time * 3.0) * 0.05;
      meshRef.current.scale.setScalar(pulse);
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(time * 2.5) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={SHARED_ORIGIN_SPHERE_GEOMETRY} scale={0.25}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

const FORWARD_COLOR = new THREE.Color('#00e5ff');  // Cyan
const BACKWARD_COLOR = new THREE.Color('#d500f9'); // Magenta
const BOTH_COLOR = new THREE.Color('#7c4dff');     // Deep purple (for origin glow in 'both' mode)

export default function CognitiveLightCone({
  originPosition,
  direction,
  radius,
  depth,
}: CognitiveLightConeProps) {
  const showForward = direction === 'forward' || direction === 'both';
  const showBackward = direction === 'backward' || direction === 'both';

  const originColor = useMemo(() => {
    if (direction === 'both') return BOTH_COLOR;
    if (direction === 'forward') return FORWARD_COLOR;
    return BACKWARD_COLOR;
  }, [direction]);

  return (
    <group>
      {/* Origin glow */}
      <OriginGlow position={originPosition} color={originColor} />

      {/* Forward cone (toward deeper layers, +Z) */}
      {showForward && (
        <>
          <SingleCone
            position={originPosition}
            radius={radius}
            height={depth}
            color={FORWARD_COLOR}
            flipDirection={false}
          />
          <LightConeParticles
            originPosition={originPosition}
            radius={radius}
            height={depth}
            color={FORWARD_COLOR}
            direction="forward"
          />
        </>
      )}

      {/* Backward cone (toward earlier layers, -Z) */}
      {showBackward && (
        <>
          <SingleCone
            position={originPosition}
            radius={radius}
            height={depth}
            color={BACKWARD_COLOR}
            flipDirection={true}
          />
          <LightConeParticles
            originPosition={originPosition}
            radius={radius}
            height={depth}
            color={BACKWARD_COLOR}
            direction="backward"
          />
        </>
      )}
    </group>
  );
}
