import * as THREE from 'three';

/** Color palette for neural network visualization */
export const COLORS = {
  // Layer type colors
  input: new THREE.Color('#4fc3f7'),       // Light blue
  hidden: new THREE.Color('#b388ff'),      // Purple
  output: new THREE.Color('#69f0ae'),      // Green
  conv: new THREE.Color('#ff8a65'),        // Orange
  pool: new THREE.Color('#ffab40'),        // Amber
  attention: new THREE.Color('#f48fb1'),   // Pink
  feedForward: new THREE.Color('#80cbc4'), // Teal
  norm: new THREE.Color('#90a4ae'),        // Blue-grey
  embedding: new THREE.Color('#ce93d8'),   // Light purple

  // Weight colors
  positiveWeight: new THREE.Color('#ffd54f'), // Golden
  negativeWeight: new THREE.Color('#42a5f5'), // Blue
  zeroWeight: new THREE.Color('#616161'),     // Grey

  // Data flow
  dataParticle: new THREE.Color('#76ff03'),   // Neon green
  gradientParticle: new THREE.Color('#ff1744'), // Red

  // UI
  selected: new THREE.Color('#ffffff'),
  hovered: new THREE.Color('#e0e0e0'),
  background: new THREE.Color('#0a0a0f'),
} as const;

/** Get color for activation function */
export function getActivationColor(activation?: string): THREE.Color {
  switch (activation) {
    case 'relu': return new THREE.Color('#ff5252');
    case 'sigmoid': return new THREE.Color('#ffab40');
    case 'tanh': return new THREE.Color('#40c4ff');
    case 'softmax': return new THREE.Color('#69f0ae');
    case 'gelu': return new THREE.Color('#ea80fc');
    default: return new THREE.Color('#9e9e9e');
  }
}

/** Map a weight value (-1 to 1) to a color */
export function weightToColor(weight: number): THREE.Color {
  if (weight > 0.01) {
    return new THREE.Color().lerpColors(COLORS.zeroWeight, COLORS.positiveWeight, Math.min(weight, 1));
  } else if (weight < -0.01) {
    return new THREE.Color().lerpColors(COLORS.zeroWeight, COLORS.negativeWeight, Math.min(-weight, 1));
  }
  return COLORS.zeroWeight.clone();
}

/** Attention head colors (12 distinct colors for multi-head attention) */
export const ATTENTION_HEAD_COLORS = [
  new THREE.Color('#f44336'), // Red
  new THREE.Color('#e91e63'), // Pink
  new THREE.Color('#9c27b0'), // Purple
  new THREE.Color('#3f51b5'), // Indigo
  new THREE.Color('#2196f3'), // Blue
  new THREE.Color('#00bcd4'), // Cyan
  new THREE.Color('#009688'), // Teal
  new THREE.Color('#4caf50'), // Green
  new THREE.Color('#8bc34a'), // Light green
  new THREE.Color('#ffeb3b'), // Yellow
  new THREE.Color('#ff9800'), // Orange
  new THREE.Color('#ff5722'), // Deep orange
];
