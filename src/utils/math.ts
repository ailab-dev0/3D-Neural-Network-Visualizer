import * as THREE from 'three';

/** Calculate positions for neurons in a layer arranged in a grid */
export function calculateNeuronPositions(
  count: number,
  layerPosition: THREE.Vector3,
  spacing: number = 1.2,
  maxPerRow: number = 16
): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  const cols = Math.min(count, maxPerRow);
  const rows = Math.ceil(count / maxPerRow);

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * spacing;
    const y = (row - (rows - 1) / 2) * spacing;
    positions.push(new THREE.Vector3(
      layerPosition.x + x,
      layerPosition.y + y,
      layerPosition.z
    ));
  }

  return positions;
}

/** Calculate positions for feature map volumes (CNN) */
export function calculateFeatureMapPositions(
  width: number,
  height: number,
  channels: number,
  layerPosition: THREE.Vector3,
  scale: number = 0.05
): { position: THREE.Vector3; size: THREE.Vector3 } {
  return {
    position: layerPosition.clone(),
    size: new THREE.Vector3(width * scale, height * scale, channels * scale * 0.3),
  };
}

/** Smooth interpolation for animation */
export function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Ease in-out cubic */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Generate bezier curve points between two positions (for connections) */
export function generateConnectionCurve(
  start: THREE.Vector3,
  end: THREE.Vector3,
  curvature: number = 0.3,
  segments: number = 20
): THREE.Vector3[] {
  const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
  const direction = new THREE.Vector3().subVectors(end, start);
  const distance = direction.length();

  // Add curvature perpendicular to the connection direction
  const up = new THREE.Vector3(0, 1, 0);
  const perpendicular = new THREE.Vector3().crossVectors(direction.normalize(), up).normalize();
  midPoint.add(perpendicular.multiplyScalar(distance * curvature * (Math.random() - 0.5)));

  const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
  return curve.getPoints(segments);
}

/** Map a value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/** Calculate layer Z positions with spacing */
export function calculateLayerDepths(layerCount: number, spacing: number = 5): number[] {
  return Array.from({ length: layerCount }, (_, i) => {
    return (i - (layerCount - 1) / 2) * spacing;
  });
}
