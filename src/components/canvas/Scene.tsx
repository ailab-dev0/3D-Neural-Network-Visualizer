import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, PerformanceMonitor, Grid } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useModelStore } from '../../stores/modelStore';
import type { ModelType } from '../../stores/modelStore';

/** Camera presets per model type */
const CAMERA_PRESETS: Record<ModelType, { position: [number, number, number]; fov: number }> = {
  ann: { position: [0, 5, 22], fov: 58 },
  cnn: { position: [0, 8, 18], fov: 55 },
  llm: { position: [0, 12, 28], fov: 52 },
};

/**
 * Auto-adjusts the camera position when the model type changes,
 * smoothly animating to the appropriate viewpoint.
 */
function CameraAutoAdjust() {
  const modelType = useModelStore((s) => s.modelType);
  const currentModel = useModelStore((s) => s.currentModel);
  const camera = useThree((s) => s.camera);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!currentModel) return;

    const preset = CAMERA_PRESETS[modelType];
    const targetPos = new THREE.Vector3(...preset.position);

    // Smooth animated transition to new camera position
    const startPos = camera.position.clone();
    const startTime = Date.now();
    const duration = 1200; // ms

    // Cancel any previous animation before starting a new one
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    function animate() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(startPos, targetPos, eased);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, preset.fov, eased * 0.1 + 0.02);
        camera.updateProjectionMatrix();
      }

      if (t < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    animate();

    // Cleanup: cancel the animation frame when effect re-runs or component unmounts
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [modelType, currentModel, camera]);

  return null;
}

/**
 * Subtle grid floor that visually fades at the edges using Grid from drei.
 * Provides spatial grounding for the 3D scene.
 */
function GridFloor() {
  return (
    <Grid
      position={[0, -4, 0]}
      args={[80, 80]}
      cellSize={1}
      cellThickness={0.4}
      cellColor="#1a1a3e"
      sectionSize={5}
      sectionThickness={0.8}
      sectionColor="#2a2a5e"
      fadeDistance={50}
      fadeStrength={1.5}
      infiniteGrid={false}
      followCamera={false}
    />
  );
}

function SceneEnvironment() {
  const autoRotate = useVisualizationStore((s) => s.autoRotate);

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#4fc3f7" />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#b388ff" />
      <directionalLight position={[0, 5, 5]} intensity={0.3} />

      {/* Ambient fog for depth perception — extended range so large models aren't hidden */}
      <fog attach="fog" args={['#0a0a0f', 60, 200]} />

      <Stars radius={100} depth={50} count={1500} factor={3} saturation={0.5} fade speed={0.5} />

      <GridFloor />
      <CameraAutoAdjust />

      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
        enablePan
      />
    </>
  );
}

interface SceneProps {
  children: React.ReactNode;
}

export default function Scene({ children }: SceneProps) {
  const glowIntensity = useVisualizationStore((s) => s.glowIntensity);
  const [dpr, setDpr] = useState(1.5);

  return (
    <Canvas
      camera={{ position: [0, 5, 20], fov: 60, near: 0.1, far: 200 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0a0a0f' }}
    >
      <PerformanceMonitor
        onIncline={() => setDpr(2)}
        onDecline={() => setDpr(1)}
      >
        <Suspense fallback={null}>
          <SceneEnvironment />
          {children}
          <EffectComposer>
            <Bloom
              intensity={glowIntensity}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </PerformanceMonitor>
    </Canvas>
  );
}
