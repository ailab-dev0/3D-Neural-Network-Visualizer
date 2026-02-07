import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizationStore } from '../../stores/visualizationStore';

interface ConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: THREE.Color;
  weight?: number; // -1 to 1
  animated?: boolean;
}

export default function Connection({
  start,
  end,
  color = new THREE.Color('#4fc3f7'),
  weight = 0.5,
  animated = false,
}: ConnectionProps) {
  const lineRef = useRef<THREE.Line>(null!);
  const connectionOpacity = useVisualizationStore((s) => s.connectionOpacity);

  const absWeight = Math.abs(weight);

  const lineObj = useMemo(() => {
    const startV = new THREE.Vector3(...start);
    const endV = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().lerpVectors(startV, endV, 0.5);
    mid.y += endV.distanceTo(startV) * 0.05;
    const curve = new THREE.QuadraticBezierCurve3(startV, mid, endV);
    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: connectionOpacity * absWeight,
    });
    return new THREE.Line(geometry, material);
  }, [start, end, color, connectionOpacity, absWeight]);

  useFrame(() => {
    if (animated && lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = connectionOpacity * (0.5 + Math.sin(Date.now() * 0.003) * 0.3);
    }
  });

  return <primitive ref={lineRef} object={lineObj} />;
}
