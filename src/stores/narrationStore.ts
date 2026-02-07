import { create } from 'zustand';

export interface NarrationEntry {
  text: string;
  timestamp: number;
  icon: 'model' | 'layer' | 'action' | 'tip' | 'simulation';
}

interface NarrationState {
  /** The text currently being displayed / typed out */
  currentNarration: string | null;
  /** Icon type for the current narration */
  currentIcon: NarrationEntry['icon'];
  /** Recent narration history (last 3) */
  narrationHistory: NarrationEntry[];
  /** Whether the narration panel is visible */
  narrationEnabled: boolean;
  /** Whether the typewriter effect is still rendering characters */
  isTyping: boolean;
  /** Whether a step-by-step simulation is in progress */
  simulationRunning: boolean;
  /** Current simulation step index */
  simulationStep: number;
  /** Total simulation steps */
  simulationTotalSteps: number;

  // Actions
  setNarration: (text: string, icon?: NarrationEntry['icon']) => void;
  clearNarration: () => void;
  toggleNarration: () => void;
  setIsTyping: (typing: boolean) => void;
  startSimulation: (totalSteps: number) => void;
  stopSimulation: () => void;
  advanceSimulation: () => void;
}

export const useNarrationStore = create<NarrationState>((set) => ({
  currentNarration: null,
  currentIcon: 'tip',
  narrationHistory: [],
  narrationEnabled: true,
  isTyping: false,
  simulationRunning: false,
  simulationStep: 0,
  simulationTotalSteps: 0,

  setNarration: (text, icon = 'tip') =>
    set((state) => {
      const entry: NarrationEntry = { text, timestamp: Date.now(), icon };
      // Keep last 3 entries in history, avoid duplicate consecutive entries
      const history = [...state.narrationHistory];
      if (history.length === 0 || history[history.length - 1].text !== text) {
        history.push(entry);
        if (history.length > 3) history.shift();
      }
      return {
        currentNarration: text,
        currentIcon: icon,
        narrationHistory: history,
        isTyping: true,
      };
    }),

  clearNarration: () =>
    set({ currentNarration: null, isTyping: false }),

  toggleNarration: () =>
    set((state) => ({ narrationEnabled: !state.narrationEnabled })),

  setIsTyping: (typing) => set({ isTyping: typing }),

  startSimulation: (totalSteps) =>
    set({ simulationRunning: true, simulationStep: 0, simulationTotalSteps: totalSteps }),

  stopSimulation: () =>
    set({ simulationRunning: false, simulationStep: 0, simulationTotalSteps: 0 }),

  advanceSimulation: () =>
    set((state) => {
      const next = state.simulationStep + 1;
      if (next >= state.simulationTotalSteps) {
        return { simulationRunning: false, simulationStep: 0, simulationTotalSteps: 0 };
      }
      return { simulationStep: next };
    }),
}));
