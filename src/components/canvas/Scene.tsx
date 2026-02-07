import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useState } from 'react';
import { useVisualizationStore } from '../../stores/visualizationStore';

function SceneEnvironment() {
  const autoRotate = useVisualizationStore((s) => s.autoRotate);

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#4fc3f7" />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#b388ff" />
      <directionalLight position={[0, 5, 5]} intensity={0.3} />

      <Stars radius={100} depth={50} count={3000} factor={3} saturation={0.5} fade speed={0.5} />

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
