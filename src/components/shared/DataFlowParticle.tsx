import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../../utils/colors';

interface DataFlowParticleProps {
  start: [number, number, number];
  end: [number, number, number];
  speed?: number;
  delay?: number;
  color?: THREE.Color;
  size?: number;
}

export default function DataFlowParticle({
  start,
  end,
  speed = 1,
  delay = 0,
  color = COLORS.dataParticle,
  size = 0.12,
}: DataFlowParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    const startV = new THREE.Vector3(...start);
    const endV = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().lerpVectors(startV, endV, 0.5);
    mid.y += startV.distanceTo(endV) * 0.08;
    return new THREE.QuadraticBezierCurve3(startV, mid, endV);
  }, [start, end]);

  useFrame(() => {
    if (!meshRef.current) return;
    const t = ((Date.now() * 0.001 * speed + delay) % 2) / 2; // 0 to 1 loop
    if (t < 0 || t > 1) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    const point = curve.getPointAt(t);
    meshRef.current.position.copy(point);

    // Pulse size
    const pulse = 1 + Math.sin(t * Math.PI) * 0.5;
    meshRef.current.scale.setScalar(size * pulse);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}
