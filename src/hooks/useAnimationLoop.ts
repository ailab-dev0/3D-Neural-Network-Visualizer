import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVisualizationStore } from '../stores/visualizationStore';

export interface AnimationLoopState {
  /** Normalized time cycling from 0 to 1, respects play/pause and speed */
  normalizedTime: number;
  /** Total elapsed time in seconds since playback began (pauses freeze this) */
  elapsed: number;
  /** Whether the animation is currently playing */
  isPlaying: boolean;
  /** The current speed multiplier */
  speed: number;
}

/**
 * Custom hook that manages a global animation clock synchronized with
 * the visualizationStore's play/pause/speed settings.
 *
 * Uses useFrame internally so it must be called within a R3F Canvas tree.
 *
 * @param cycleDuration - Duration of one full 0-1 cycle in seconds (default: 4)
 * @returns The current animation loop state, updated every frame
 */
export function useAnimationLoop(cycleDuration: number = 4): AnimationLoopState {
  const stateRef = useRef<AnimationLoopState>({
    normalizedTime: 0,
    elapsed: 0,
    isPlaying: false,
    speed: 1,
  });

  const elapsedRef = useRef(0);

  const getAnimationState = useCallback(() => {
    const store = useVisualizationStore.getState();
    return {
      animationState: store.animationState,
      animationSpeed: store.animationSpeed,
    };
  }, []);

  useFrame((_, delta) => {
    const { animationState, animationSpeed } = getAnimationState();
    const isPlaying = animationState === 'playing';
    const speed = animationSpeed;

    if (isPlaying) {
      const clampedDelta = Math.min(delta, 0.1);
      elapsedRef.current += clampedDelta * speed;
    }

    const normalizedTime = (elapsedRef.current / cycleDuration) % 1;

    stateRef.current = {
      normalizedTime,
      elapsed: elapsedRef.current,
      isPlaying,
      speed,
    };
  });

  return stateRef.current;
}
