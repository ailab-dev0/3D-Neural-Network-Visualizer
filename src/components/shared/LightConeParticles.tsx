import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 64;
const SPRITE_SIZE = 0.12;

interface LightConeParticlesProps {
  originPosition: [number, number, number];
  radius: number;
  height: number;
  color: THREE.Color;
  direction: 'forward' | 'backward';
}

/** Create a small radial-gradient texture for soft glow particles */
function createParticleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Module-level shared particle texture
let sharedParticleTexture: THREE.Texture | null = null;
function getParticleTexture(): THREE.Texture {
  if (!sharedParticleTexture) {
    sharedParticleTexture = createParticleTexture();
  }
  return sharedParticleTexture;
}

export default function LightConeParticles({
  originPosition,
  radius,
  height,
  color,
  direction,
}: LightConeParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const ox = originPosition[0];
  const oy = originPosition[1];
  const oz = originPosition[2];

  // Pre-compute stable random seeds per particle for spiral paths
  const particleSeeds = useMemo(() => {
    const seeds: { angle: number; speed: number; radialOffset: number; spiralRate: number }[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      seeds.push({
        angle: (i / PARTICLE_COUNT) * Math.PI * 2 + (i * 137.508 * Math.PI) / 180, // golden angle distribution
        speed: 0.15 + (((i * 7 + 13) % 31) / 31) * 0.35, // deterministic pseudo-random speed
        radialOffset: 0.7 + (((i * 11 + 5) % 23) / 23) * 0.3, // how close to cone surface
        spiralRate: 0.5 + (((i * 3 + 17) % 19) / 19) * 1.5, // spiral tightness
      });
    }
    return seeds;
  }, []);

  const { positions, opacities, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const opa = new Float32Array(PARTICLE_COUNT);
    const siz = new Float32Array(PARTICLE_COUNT);
    return { positions: pos, opacities: opa, sizes: siz };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, opacities, sizes]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color,
      size: SPRITE_SIZE,
      map: getParticleTexture(),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, [color]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const time = Date.now() * 0.001;
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    const sign = direction === 'forward' ? 1 : -1;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const seed = particleSeeds[i];
      // t goes from 0 at origin to 1 at cone base, looping over time
      const t = ((time * seed.speed + seed.angle) % 1.0 + 1.0) % 1.0;

      // Cone radius at this t (linearly expanding)
      const coneRadiusAtT = t * radius * seed.radialOffset;

      // Spiral angle that increases with t
      const spiralAngle = seed.angle + t * seed.spiralRate * Math.PI * 4;

      const px = ox + Math.cos(spiralAngle) * coneRadiusAtT;
      const py = oy + Math.sin(spiralAngle) * coneRadiusAtT;
      const pz = oz + sign * t * height;

      posArray[i * 3] = px;
      posArray[i * 3 + 1] = py;
      posArray[i * 3 + 2] = pz;
    }

    posAttr.needsUpdate = true;

    // Global pulse on material opacity
    material.opacity = 0.5 + Math.sin(time * 2.0) * 0.2;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
