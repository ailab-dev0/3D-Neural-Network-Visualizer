# Component API Reference

> 3D Neural Network Visualizer -- Complete component, hook, and utility documentation.

---

## Table of Contents

1. [Canvas Components](#1-canvas-components)
   - [Scene](#scene)
2. [Shared 3D Components](#2-shared-3d-components)
   - [Neuron](#neuron)
   - [Connection](#connection)
   - [DataFlowParticle](#dataflowparticle)
   - [ActivationGlow](#activationglow)
   - [LayerTransition](#layertransition)
   - [ErrorBoundary](#errorboundary)
3. [UI Components](#3-ui-components)
   - [Sidebar](#sidebar)
   - [PlaybackControls](#playbackcontrols)
   - [LayerInspector](#layerinspector)
   - [ModelInfo](#modelinfo)
   - [KeyboardShortcuts](#keyboardshortcuts)
4. [Visualizer Components](#4-visualizer-components)
   - [ANNVisualizer](#annvisualizer)
   - [CNNVisualizer](#cnnvisualizer)
   - [LLMVisualizer](#llmvisualizer)
5. [Hooks](#5-hooks)
   - [useAnimationLoop](#useanimationloop)
6. [Utilities](#6-utilities)
   - [colors.ts](#colorsts)
   - [math.ts](#mathts)

---

## 1. Canvas Components

### Scene

**File:** `src/components/canvas/Scene.tsx`

**Purpose:** Root 3D canvas that sets up the React Three Fiber rendering context, post-processing bloom, environment lighting, camera controls, performance monitoring, and a starfield background. All 3D content is rendered as children of this component.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `children` | `React.ReactNode` | -- | Yes | The 3D content to render inside the canvas (typically a visualizer component). |

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `glowIntensity` | Controls the Bloom post-processing intensity. |
| `useVisualizationStore` | `autoRotate` | Enables or disables automatic camera orbit rotation (used by internal `SceneEnvironment`). |
| `useModelStore` | `modelType`, `currentModel` | Used by internal `CameraAutoAdjust` to animate camera to model-specific presets. |

#### Three.js Resources

- **Canvas** -- Created by `@react-three/fiber` with `antialias: true`, `alpha: false`, initial DPR of 1.5.
- **Camera** -- `PerspectiveCamera` at `[0, 5, 20]`, FOV 60, near 0.1, far 200. Automatically animated to model-specific presets (ANN: `[0, 5, 22]` FOV 58, CNN: `[0, 8, 18]` FOV 55, LLM: `[0, 12, 28]` FOV 52) via a 1200ms ease-out-cubic transition.
- **Lights** -- Ambient (0.15), two point lights (blue `#4fc3f7` and purple `#b388ff`), one directional.
- **Fog** -- Color `#0a0a0f`, near 40, far 120.
- **Stars** -- 3000 stars, radius 100, depth 50.
- **Grid** -- 80x80 grid at y=-4 with fade distance 50.
- **Bloom** -- `EffectComposer` with `Bloom` (luminance threshold 0.2, smoothing 0.9, mipmap blur).
- **PerformanceMonitor** -- Automatically adjusts DPR between 1 and 2 based on frame rate.

#### Usage Example

```tsx
import Scene from './components/canvas/Scene';
import ANNVisualizer from './components/visualizers/ann/ANNVisualizer';

function App() {
  return (
    <Scene>
      <ANNVisualizer model={annModel} />
    </Scene>
  );
}
```

#### Notes

- The `PerformanceMonitor` dynamically adjusts the device pixel ratio. On low-end hardware, DPR drops to 1; on high-end it rises to 2.
- Camera transitions are animated with `requestAnimationFrame`, not React state, to avoid re-renders.
- All 3D children are wrapped in `<Suspense fallback={null}>` for lazy loading support.
- `OrbitControls` has damping enabled (`dampingFactor: 0.05`), min distance 5, max distance 100.

---

## 2. Shared 3D Components

### Neuron

**File:** `src/components/shared/Neuron.tsx`

**Purpose:** Renders a single neuron as a glowing sphere in 3D space. Supports hover interactions, layer selection, labels, and a gentle pulse animation driven by `useFrame`.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `position` | `[number, number, number]` | -- | Yes | World-space position of the neuron. |
| `color` | `THREE.Color` | -- | Yes | Base color of the neuron sphere and its glow halo. |
| `size` | `number` | `0.3` | No | Base radius of the neuron sphere before scaling. |
| `label` | `string` | `undefined` | No | Text label shown as an HTML overlay on hover (when labels are enabled). |
| `layerId` | `string` | -- | Yes | ID of the layer this neuron belongs to, used for selection and hover events. |
| `neuronIndex` | `number` | -- | Yes | Index of this neuron in its layer, used to offset the pulse animation phase. |
| `activation` | `number` | `0` | No | Activation value from 0 to 1. Controls emissive intensity and glow halo opacity. |
| `isSelected` | `boolean` | `false` | No | When true, the neuron has a stronger emissive glow (intensity 2). |

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `neuronSize` | Global multiplier applied to the base `size` prop. |
| `useVisualizationStore` | `showLabels` | Controls whether the HTML label overlay is rendered on hover. |
| `useVisualizationStore` | `selectLayer` | Called on click to select this neuron's layer. |
| `useVisualizationStore` | `hoverLayer` | Called on pointer enter/leave to highlight the layer. |

#### Three.js Resources

- **Shared Geometries (module-level):**
  - `SHARED_NEURON_GEOMETRY` -- `SphereGeometry(1, 16, 16)` reused by all Neuron instances.
  - `SHARED_GLOW_GEOMETRY` -- `SphereGeometry(1, 12, 12)` for the outer glow halo.
- **Materials (per-instance):**
  - Main sphere: `MeshStandardMaterial` with emissive color, roughness 0.2, metalness 0.8, transparent (opacity 0.9).
  - Glow halo: `MeshBasicMaterial` rendered on `BackSide`, transparent with activation-modulated opacity.

#### Usage Example

```tsx
import Neuron from '../shared/Neuron';
import * as THREE from 'three';

<Neuron
  position={[0, 1, 0]}
  color={new THREE.Color('#4fc3f7')}
  size={0.3}
  label="Hidden 1"
  layerId="hidden-0"
  neuronIndex={0}
  activation={0.75}
  isSelected={false}
/>
```

#### Notes

- The pulse animation runs at `sin(Date.now() * 0.002 + neuronIndex * 0.5) * 0.05` -- a subtle 5% scale oscillation.
- Pointer events change `document.body.style.cursor` directly (to `pointer` on enter, `auto` on leave).
- Labels use `@react-three/drei` `Html` component with `distanceFactor={15}` for distance-based scaling.
- Geometries are shared at the module level and never disposed -- they persist for the application lifetime. This is intentional for performance.

---

### Connection

**File:** `src/components/shared/Connection.tsx`

**Purpose:** Renders a curved line between two 3D positions representing a weighted connection between neurons. The curve is a quadratic Bezier with a slight upward arc.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `start` | `[number, number, number]` | -- | Yes | Starting point of the connection. |
| `end` | `[number, number, number]` | -- | Yes | Ending point of the connection. |
| `color` | `THREE.Color` | `new THREE.Color('#4fc3f7')` | No | Color of the connection line. |
| `weight` | `number` | `0.5` | No | Connection weight from -1 to 1. Absolute value controls line opacity. |
| `animated` | `boolean` | `false` | No | When true, the line opacity pulsates using a sine wave in `useFrame`. |

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `connectionOpacity` | Global opacity multiplier for all connections. |

#### Three.js Resources

- **Geometry:** `BufferGeometry` created from 20 points along a `QuadraticBezierCurve3`. The midpoint is offset upward by 5% of the start-to-end distance.
- **Material:** `LineBasicMaterial` with transparent mode. Opacity = `connectionOpacity * abs(weight)`.
- **Disposal:** Both geometry and material are disposed in a `useEffect` cleanup when the `lineObj` changes or on unmount.

#### Usage Example

```tsx
import Connection from '../shared/Connection';
import * as THREE from 'three';

<Connection
  start={[0, 0, -3]}
  end={[1, 1, 3]}
  color={new THREE.Color('#b388ff')}
  weight={0.8}
  animated={true}
/>
```

#### Notes

- The component destructures array props to stable primitives (`sx, sy, sz, ex, ey, ez`) so `useMemo` dependencies are value-stable and avoid unnecessary recalculations.
- Uses `<primitive object={lineObj} />` to mount the imperatively created `THREE.Line`.
- When `animated` is true, opacity oscillates: `connectionOpacity * (0.5 + sin(Date.now() * 0.003) * 0.3)`.

---

### DataFlowParticle

**File:** `src/components/shared/DataFlowParticle.tsx`

**Purpose:** Animates a small glowing sphere traveling along a curved path between two points, simulating data flowing through the network. The particle loops continuously and pulses in size at the midpoint of its path.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `start` | `[number, number, number]` | -- | Yes | Starting point of the particle path. |
| `end` | `[number, number, number]` | -- | Yes | Ending point of the particle path. |
| `speed` | `number` | `1` | No | Speed multiplier for the particle's travel along the path. |
| `delay` | `number` | `0` | No | Time offset (in seconds) to stagger multiple particles. |
| `color` | `THREE.Color` | `COLORS.dataParticle` | No | Color of the particle sphere. Default is neon green `#76ff03`. |
| `size` | `number` | `0.12` | No | Base radius of the particle sphere. |

#### Store Dependencies

None. This component reads no Zustand store state.

#### Three.js Resources

- **Curve:** `QuadraticBezierCurve3` with midpoint arced upward by 8% of the path distance.
- **Geometry:** Inline `sphereGeometry` with args `[1, 8, 8]` (low-poly for performance).
- **Material:** `MeshBasicMaterial`, transparent, opacity 0.9.
- Scale is animated via `useFrame`: `size * (1 + sin(t * PI) * 0.5)` -- peaks at path midpoint.

#### Usage Example

```tsx
import DataFlowParticle from '../shared/DataFlowParticle';

<DataFlowParticle
  start={[0, 0, -3]}
  end={[2, 1, 3]}
  speed={0.8}
  delay={0.5}
/>
```

#### Notes

- The particle loops on a 2-second cycle: `t = ((Date.now() * 0.001 * speed + delay) % 2) / 2`.
- When `t` falls outside [0, 1], the mesh is hidden (`visible = false`).
- Array props are destructured to stable primitives for `useMemo` stability.

---

### ActivationGlow

**File:** `src/components/shared/ActivationGlow.tsx`

**Purpose:** Wraps a child element (typically a Neuron) with two concentric glow spheres that pulse based on simulated activation values. The glow amplitude is modulated by a sine wave synchronized with the animation speed.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `children` | `React.ReactNode` | -- | Yes | The child neuron or 3D element to wrap with the glow effect. |
| `activation` | `number` | `0.5` | No | Base activation value from 0 to 1. Modulates glow amplitude and opacity. |
| `color` | `THREE.Color` | `new THREE.Color('#4fc3f7')` | No | Color of both glow spheres. |
| `glowScale` | `number` | `1.8` | No | Radius multiplier for the outer glow sphere relative to the child. |
| `phaseOffset` | `number` | `0` | No | Offset added to the sine wave phase to stagger glow pulses across neurons. |

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `animationSpeed` | Controls the sine wave frequency (`animationSpeed * 1.5`). |
| `useVisualizationStore` | `animationState` | Determines whether glow is pulsing (playing) or static (paused/idle). |
| `useVisualizationStore` | `glowIntensity` | Global multiplier for glow brightness (`activation * glowIntensity`). |
| `useVisualizationStore` | `showActivations` | When false, glow is reduced to minimal baseline values. |

#### Three.js Resources

- **Outer Glow:** `Sphere` (drei) with args `[1, 12, 12]`, `MeshBasicMaterial` on `BackSide`, `depthWrite: false`.
- **Inner Ring:** `Sphere` (drei) with args `[1, 10, 10]`, `MeshBasicMaterial` on `BackSide`, `depthWrite: false`.
- Both spheres use transparent materials with per-frame opacity updates.

#### Usage Example

```tsx
import ActivationGlow from '../shared/ActivationGlow';
import Neuron from '../shared/Neuron';
import * as THREE from 'three';

<ActivationGlow activation={0.8} color={new THREE.Color('#b388ff')} phaseOffset={2}>
  <Neuron
    position={[0, 0, 0]}
    color={new THREE.Color('#b388ff')}
    layerId="hidden-0"
    neuronIndex={0}
  />
</ActivationGlow>
```

#### Notes

- When playing with activations visible:
  - Outer sphere opacity: `max(0.02, currentGlow * 0.15)` where `currentGlow = activation * glowIntensity + sin(...) * activation * 0.3`.
  - Outer sphere scale breathes: `glowScale * (1 + sin(...) * 0.1 * activation)`.
  - Inner sphere opacity: `max(0.01, currentGlow * 0.08)`.
- When paused or activations hidden, glow falls to static baseline values.
- `depthWrite: false` on both glow materials prevents depth-fighting artifacts.

---

### LayerTransition

**File:** `src/components/shared/LayerTransition.tsx`

**Purpose:** Renders an animated connection between two layers with a tube path, arrowhead, and a stream of flowing particles with trailing echoes. Visualizes the direction and flow of data between network layers.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `start` | `[number, number, number]` | -- | Yes | Start position of the transition path. |
| `end` | `[number, number, number]` | -- | Yes | End position of the transition path. |
| `particleCount` | `number` | `6` | No | Number of particles flowing simultaneously along the path. |
| `color` | `THREE.Color` | `new THREE.Color('#4fc3f7')` | No | Color of the tube, arrowhead, and particles. |
| `tubeRadius` | `number` | `0.02` | No | Radius of the tube path geometry. |
| `particleSize` | `number` | `0.06` | No | Base size of each flowing particle. |

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `animationSpeed` | Controls particle travel speed (`animationSpeed * 0.4`). |
| `useVisualizationStore` | `animationState` | Particles are only visible and animated when state is `'playing'`. |
| `useVisualizationStore` | `connectionOpacity` | Controls tube opacity (`connectionOpacity * 0.3`) and arrowhead opacity (`connectionOpacity * 0.6`). |

#### Three.js Resources

- **Tube:** `TubeGeometry` along a `QuadraticBezierCurve3` with 32 segments, 8 radial segments. Midpoint arced upward by 12% of distance.
- **Arrowhead:** `ConeGeometry` with radius `tubeRadius * 4` and height `tubeRadius * 10`, 6 segments. Positioned at 98% along the curve and oriented along the tangent.
- **Particles:** Each particle is a `sphereGeometry [1, 8, 8]` with `MeshBasicMaterial`. Each has a trailing echo at `sphereGeometry [1, 6, 6]` (smaller, dimmer).
- Particle opacity fades in/out using `sin(t * PI)`.

#### Usage Example

```tsx
import LayerTransition from '../shared/LayerTransition';
import * as THREE from 'three';

<LayerTransition
  start={[0, 0, -5]}
  end={[0, 0, 5]}
  particleCount={8}
  color={new THREE.Color('#69f0ae')}
  tubeRadius={0.03}
/>
```

#### Notes

- Particles are staggered with evenly-spaced phase offsets: `i / particleCount`.
- When paused, all particles and trails are hidden (`visible = false`).
- Trail particles are positioned 4% behind their main particle on the curve.
- Particle scale pulses: `particleSize * (1 + sin(t * PI) * 0.6)`.

---

### ErrorBoundary

**File:** `src/components/shared/ErrorBoundary.tsx`

**Purpose:** A React class component error boundary that catches WebGL and 3D rendering errors in its subtree. Displays a styled fallback UI with an error icon and a reload button.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `children` | `ReactNode` | -- | Yes | The component subtree to protect from unhandled errors. |

#### Store Dependencies

None.

#### Three.js Resources

None. This is a pure DOM component used to wrap the 3D canvas.

#### Usage Example

```tsx
import ErrorBoundary from '../shared/ErrorBoundary';
import Scene from '../canvas/Scene';

<ErrorBoundary>
  <Scene>
    {/* 3D content */}
  </Scene>
</ErrorBoundary>
```

#### Notes

- Implements `getDerivedStateFromError` and `componentDidCatch`.
- Logs errors to `console.error` with the prefix `[3D Render Error]` and includes the component stack.
- The fallback UI is absolutely positioned to fill its container with a dark background (`#0a0a0f`).
- The "Reload" button calls `window.location.reload()`.
- This is a **class component** because React error boundaries require class lifecycle methods.

---

## 3. UI Components

### Sidebar

**File:** `src/components/ui/Sidebar.tsx`

**Purpose:** A collapsible left-side panel with three tabs -- Models, Layers, and Settings -- providing controls for model selection, layer browsing, and visualization parameter tuning.

#### Props

None. This is a self-contained component that reads all state from stores.

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useUIStore` | `sidebarOpen`, `sidebarTab`, `toggleSidebar`, `setSidebarTab` | Controls panel open/closed state and active tab. |
| `useModelStore` | `loadPreset`, `currentPresetId` | Models tab: loads presets and highlights the active one. |
| `useModelStore` | `currentModel` | Layers tab: reads the model's layer list. |
| `useVisualizationStore` | `selectedLayerId`, `selectLayer` | Layers tab: highlights selected layer and handles selection. |
| `useVisualizationStore` | `glowIntensity`, `setGlowIntensity`, `neuronSize`, `setNeuronSize`, `connectionOpacity`, `setConnectionOpacity`, `showWeights`, `toggleWeights`, `showActivations`, `toggleActivations`, `showLabels`, `toggleLabels`, `showDataFlow`, `toggleDataFlow` | Settings tab: all visualization parameter controls. |

#### Three.js Resources

None. This is a pure DOM/HTML component.

#### Usage Example

```tsx
import Sidebar from './components/ui/Sidebar';

function App() {
  return (
    <>
      <Sidebar />
      {/* Canvas and other content */}
    </>
  );
}
```

#### Notes

- **Models Tab:** Groups presets by type (ANN, CNN, LLM) with color-coded headers. Active preset is highlighted with a blue border.
- **Layers Tab:** Lists all layers of the current model with index, label, and type. Clicking a selected layer deselects it.
- **Settings Tab:** Provides three sliders (Glow Intensity 0-1, Neuron Size 0.5-2.0, Connection Opacity 0-1) and four toggles (Weights, Activations, Labels, Data Flow).
- The sidebar animates its width from 0px to 280px on toggle.
- A collapse/expand button is always visible outside the sidebar panel.
- All store selectors use individual selectors (not full-store subscriptions) to minimize re-renders.

---

### PlaybackControls

**File:** `src/components/ui/PlaybackControls.tsx`

**Purpose:** A floating bottom-center transport bar with play/pause, stop, step-forward controls, a speed slider, and toggles for data flow and auto-rotation.

#### Props

None. This is a self-contained component that reads all state from stores.

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `animationState` | Determines which transport button is highlighted and icon displayed. |
| `useVisualizationStore` | `animationSpeed`, `setAnimationSpeed` | Speed slider value and handler (range 0.1 to 3.0, step 0.1). |
| `useVisualizationStore` | `showDataFlow`, `toggleDataFlow` | Data flow toggle button state. |
| `useVisualizationStore` | `autoRotate`, `setAutoRotate` | Auto-rotate toggle button state. |
| `useVisualizationStore` | `play`, `pause`, `stop`, `step` | Transport control action dispatchers. |

#### Three.js Resources

None. This is a pure DOM/HTML component.

#### Usage Example

```tsx
import PlaybackControls from './components/ui/PlaybackControls';

function App() {
  return (
    <>
      {/* Canvas */}
      <PlaybackControls />
    </>
  );
}
```

#### Notes

- Fixed-positioned at bottom center with `z-index: 50`.
- Uses the `glass-panel` CSS class for a frosted-glass background effect.
- The play/pause button changes icon and color: green play arrow or blue pause bars.
- Stop button turns red when animation is not idle.
- Speed is displayed as `{speed}x` in monospace font.
- Data Flow toggle: green when active, muted when inactive.
- Auto Rotate toggle: purple when active, muted when inactive.

---

### LayerInspector

**File:** `src/components/ui/LayerInspector.tsx`

**Purpose:** A floating top-right panel that displays detailed information about the currently selected layer, including type-specific details (neurons, filters, kernel size, attention heads, etc.) and parameter count.

#### Props

None. This is a self-contained component that reads all state from stores.

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `selectedLayerId`, `selectLayer` | Reads which layer is selected; close button calls `selectLayer(null)`. |
| `useModelStore` | `currentModel` | Reads the full model to look up layer details and compute parameter counts. |

#### Three.js Resources

None. This is a pure DOM/HTML component.

#### Usage Example

```tsx
import LayerInspector from './components/ui/LayerInspector';

function App() {
  return (
    <>
      {/* Canvas */}
      <LayerInspector />
    </>
  );
}
```

#### Notes

- Returns `null` when no layer is selected or no model is loaded.
- Renders type-specific detail sub-components:
  - **ANN:** Neurons, Activation, Dropout.
  - **CNN:** Spatial dimensions, Channels, Filters, Kernel Size, Stride, Padding, Pool Size, Neurons, Activation.
  - **LLM:** d_model, n_heads, d_ff, Activation.
- Parameter count is computed internally via `calculateParamCount()`:
  - ANN: `prevNeurons * currentNeurons + currentNeurons` (weights + biases).
  - CNN conv2d: `kernelSize^2 * inChannels * filters + filters`.
  - LLM layers: varies by type (embedding = `vocabSize * dModel`, attention = `4 * dModel^2`, etc.).
- Numbers are formatted with K/M suffixes via `formatNumber()`.
- Layer type badge is color-coded (input=blue, hidden=purple, output=green, conv2d=orange, attention=pink, etc.).

---

### ModelInfo

**File:** `src/components/ui/ModelInfo.tsx`

**Purpose:** A compact floating top-right badge that displays the currently loaded model's name, total parameter count, and layer count.

#### Props

None. This is a self-contained component that reads all state from stores.

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useModelStore` | `currentModel` | Reads the model name, metadata.parameters, and layers array. |

#### Three.js Resources

None. This is a pure DOM/HTML component.

#### Usage Example

```tsx
import ModelInfo from './components/ui/ModelInfo';

function App() {
  return (
    <>
      {/* Canvas */}
      <ModelInfo />
    </>
  );
}
```

#### Notes

- Returns `null` when no model is loaded.
- Parameter count is formatted with B/M/K suffixes via internal `formatParameterCount()`.
- Parameter row is only shown if `currentModel.metadata?.parameters` is defined.
- Positioned at `top: 4, right: 4` with `z-index: 50`.

---

### KeyboardShortcuts

**File:** `src/components/ui/KeyboardShortcuts.tsx`

**Purpose:** A modal overlay triggered by pressing `?` that displays all available keyboard shortcuts. Can be dismissed with `Esc`, clicking the backdrop, or pressing `?` again.

#### Props

None. This is a self-contained component that manages its own visibility state.

#### Store Dependencies

None. This component uses local React state only.

#### Three.js Resources

None. This is a pure DOM/HTML component.

#### Registered Shortcuts

| Key | Description |
|-----|-------------|
| `Space` | Play / Pause animation |
| `R` | Toggle auto-rotate |
| `L` | Toggle labels |
| `W` | Toggle weights |
| `F` | Toggle data flow |
| `1` | Switch to ANN tab |
| `2` | Switch to CNN tab |
| `3` | Switch to LLM tab |

#### Usage Example

```tsx
import KeyboardShortcuts from './components/ui/KeyboardShortcuts';

function App() {
  return (
    <>
      {/* Canvas and other UI */}
      <KeyboardShortcuts />
    </>
  );
}
```

#### Notes

- The modal is rendered at `z-index: 100`, above all other UI.
- The component only renders DOM when `visible` is true (returns `null` otherwise).
- The backdrop is a semi-transparent black overlay that closes the panel on click.
- This component only **displays** shortcuts. The actual key handlers must be registered elsewhere in the application.

---

## 4. Visualizer Components

### ANNVisualizer

**File:** `src/components/visualizers/ann/ANNVisualizer.tsx`

**Purpose:** Renders a complete Artificial Neural Network (ANN) as a 3D scene with neurons arranged in grid layers, weighted connections between layers, optional data flow particles, and layer labels.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `model` | `ANNModel` | -- | Yes | The ANN model definition containing layer specifications. |

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `showWeights` | Controls whether inter-layer connections are rendered. |
| `useVisualizationStore` | `showDataFlow` | Controls whether data flow particles are rendered. |
| `useVisualizationStore` | `showLabels` | Controls whether layer name and activation labels are rendered. |
| `useVisualizationStore` | `selectedLayerId` | Highlights neurons in the selected layer. |

#### Three.js Resources

- **Text labels:** `@react-three/drei` `Text` for layer names and activation function labels.
- Uses child components `Neuron`, `Connection`, and `DataFlowParticle` for actual 3D geometry.
- No direct geometry creation -- delegates to shared components.

#### Usage Example

```tsx
import ANNVisualizer from './components/visualizers/ann/ANNVisualizer';
import { createSimpleMLP } from './models/ann-schema';

const model = createSimpleMLP();

<Scene>
  <ANNVisualizer model={model} />
</Scene>
```

#### Notes

- Neurons per layer are visually capped at 32. Layers with more neurons show a count annotation (e.g., "Hidden (128 neurons)").
- Layer depths are computed with `calculateLayerDepths(layerCount, 6)` -- evenly spaced along the Z axis.
- Neuron positions are computed with `calculateNeuronPositions()` using a spacing of 1.0 and max 8 per row.
- Connection count is capped at 200 per layer pair using skip-sampling (`skipFrom`, `skipTo`).
- Connection weights and data flow particle assignments are pre-computed in `useMemo` to keep `Math.random()` out of the render path.
- Layer colors: input=blue (`#4fc3f7`), output=green (`#69f0ae`), hidden=activation-dependent or purple.
- Input neurons use size 0.25, output neurons 0.35, hidden neurons 0.3.

---

### CNNVisualizer

**File:** `src/components/visualizers/cnn/CNNVisualizer.tsx`

**Purpose:** Renders a Convolutional Neural Network as a sequence of 3D volumes (boxes) representing feature maps, with connecting arrows and optional kernel visualizations. Volumes scale proportionally to spatial dimensions and channel counts.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `model` | `CNNModel` | -- | Yes | The CNN model definition containing layer specifications. |

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `selectedLayerId` | Highlights the selected layer volume with increased emissive intensity. |
| `useVisualizationStore` | `showWeights` | Controls whether kernel visualizations are shown for conv2d layers. |
| `useVisualizationStore` | `showLabels` | Controls layer label text visibility (used by `FeatureMapVolume`). |
| `useVisualizationStore` | `selectLayer` | Called on volume click to select a layer (used by `FeatureMapVolume`). |

#### Three.js Resources

- **Feature Map Volumes:** `RoundedBox` (drei) with three layers:
  1. Main solid volume with `MeshStandardMaterial` (emissive, transparent, roughness 0.3, metalness 0.6, `DoubleSide`).
  2. Wireframe overlay with `MeshBasicMaterial`.
  3. Outer glow with `MeshBasicMaterial` on `BackSide`, scaled 1.1x.
- **Kernel Visualization:** `Box` (drei) with wireframe `MeshStandardMaterial` (emissive intensity 0.8).
- **Connection Arrows:** `Line` (drei) between adjacent layers, with a `ConeGeometry` arrowhead (radius 0.15, height 0.3, 8 segments).
- **Skip Connections:** `Line` (drei) drawn in green (`#69f0ae`) for layers with `skipTo` defined.

#### Usage Example

```tsx
import CNNVisualizer from './components/visualizers/cnn/CNNVisualizer';
import { createLeNet5 } from './models/cnn-schema';

const model = createLeNet5();

<Scene>
  <CNNVisualizer model={model} />
</Scene>
```

#### Notes

- Volume dimensions are computed as: `w = layer.width * 0.04`, `h = layer.height * 0.04`, `d = max(channels * 0.02, 0.2)`.
- Dense layers are visualized as flat squares: `side = ceil(sqrt(neurons)) * 0.08`.
- The entire visualization is centered on the Z axis using `centerOffset = -lastPosition.z / 2`.
- Layer spacing is dynamically computed: `max(depth, 1) + 1.5`.
- Layer type colors: input=blue, conv2d=orange, maxpool/avgpool=amber, batchnorm=blue-grey, flatten=cyan, dense=purple, output=green.

---

### LLMVisualizer

**File:** `src/components/visualizers/llm/LLMVisualizer.tsx`

**Purpose:** Renders a Large Language Model (transformer) architecture with token embeddings, multi-head attention beams, feed-forward expansion/compression tunnels, and transformer block containers.

#### Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `model` | `LLMModel` | -- | Yes | The LLM model definition containing transformer layer specifications and config. |

#### Store Dependencies

| Store | Selectors Used | Purpose |
|-------|---------------|---------|
| `useVisualizationStore` | `showLabels` | Controls whether text labels are rendered for tokens, blocks, and layers. |
| `useVisualizationStore` | `showDataFlow` | Controls whether attention beams are rendered (used by `AttentionLayerViz`). |

#### Three.js Resources

- **Token Blocks:** `RoundedBox` (drei) with `MeshStandardMaterial` (emissive, roughness 0.3, metalness 0.7). Each token bobs vertically via `useFrame`.
- **Attention Beams:** Imperatively created `THREE.Line` with `BufferGeometry` from a `QuadraticBezierCurve3` (16 points). Color-coded by head index using `ATTENTION_HEAD_COLORS`. Geometry and material are disposed on cleanup.
- **Head Indicators:** `Torus` (drei) rings, one per attention head (max 4), stacked vertically.
- **Feed-Forward Tunnels:** Two `Cylinder` (drei) geometries -- one expanding (radius ratio = dFF/dModel), one compressing, with `DoubleSide`, transparent material.
- **Block Containers:** `RoundedBox` for transformer block backgrounds.
- **Text Labels:** `Text` (drei) for block labels, token labels, embedding/output annotations.

#### Usage Example

```tsx
import LLMVisualizer from './components/visualizers/llm/LLMVisualizer';
import { createGPT2Small } from './models/llm-schema';

const model = createGPT2Small();

<Scene>
  <LLMVisualizer model={model} />
</Scene>
```

#### Notes

- Token count is capped at `min(config.maxSeqLen, 8)` for visual clarity.
- Attention beams are generated for up to 4 heads, with each token attending to 2-3 random other tokens. Beam strength is randomized (0.2 to 1.0).
- Attention beam opacity oscillates: `0.1 + strength * 0.6 + sin(Date.now() * 0.002) * 0.1`.
- Transformer blocks are grouped from the layer list: embedding/positional/output layers are standalone blocks; attention + layer_norm + feed_forward are grouped together.
- Blocks are stacked vertically downward with `blockSpacing = 5` units.
- Feed-forward cylinders use open-ended geometry (`openEnded: true`) for a tunnel effect.
- Attention beam geometry and material are properly disposed in `useEffect` cleanup.

---

## 5. Hooks

### useAnimationLoop

**File:** `src/hooks/useAnimationLoop.ts`

**Purpose:** A custom hook that provides a global animation clock synchronized with the visualization store's play/pause/speed settings. Returns a normalized time value cycling from 0 to 1 over a configurable duration.

#### Signature

```ts
function useAnimationLoop(cycleDuration?: number): AnimationLoopState
```

#### Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `cycleDuration` | `number` | `4` | Duration of one full 0-to-1 cycle in seconds. |

#### Return Type: `AnimationLoopState`

| Field | Type | Description |
|-------|------|-------------|
| `normalizedTime` | `number` | Current position in the cycle, from 0 to 1. Loops continuously. |
| `elapsed` | `number` | Total elapsed time in seconds since playback began. Freezes when paused. |
| `isPlaying` | `boolean` | Whether the animation is currently playing. |
| `speed` | `number` | The current speed multiplier from the store. |

#### Store Dependencies

| Store | Method | Purpose |
|-------|--------|---------|
| `useVisualizationStore` | `getState()` (non-reactive) | Reads `animationState` and `animationSpeed` every frame without subscribing to re-renders. |

#### Usage Example

```tsx
import { useAnimationLoop } from '../hooks/useAnimationLoop';

function MyAnimatedComponent() {
  const { normalizedTime, isPlaying } = useAnimationLoop(6);

  useFrame(() => {
    if (isPlaying) {
      // Use normalizedTime for animation
      mesh.position.x = Math.sin(normalizedTime * Math.PI * 2) * 5;
    }
  });

  return <mesh /* ... */ />;
}
```

#### Notes

- **Must be called within a React Three Fiber `<Canvas>` tree** because it uses `useFrame` internally.
- Reads store state imperatively via `useVisualizationStore.getState()` each frame rather than via React subscriptions -- this avoids triggering re-renders on every speed/state change.
- Delta time is clamped to `min(delta, 0.1)` to prevent large time jumps after tab switches or frame drops.
- The returned object is a ref's `.current` value, meaning it is mutated in place each frame rather than creating new objects. React components reading this value will not re-render from it -- use it inside `useFrame` callbacks.

---

## 6. Utilities

### colors.ts

**File:** `src/utils/colors.ts`

**Purpose:** Centralized color palette and color-mapping functions for the entire visualization. All colors are `THREE.Color` instances.

---

#### `COLORS` (constant)

A frozen object containing all named colors used throughout the application.

| Key | Hex Value | Description |
|-----|-----------|-------------|
| `input` | `#4fc3f7` | Light blue -- input layer neurons |
| `hidden` | `#b388ff` | Purple -- hidden layer neurons |
| `output` | `#69f0ae` | Green -- output layer neurons |
| `conv` | `#ff8a65` | Orange -- convolutional layers |
| `pool` | `#ffab40` | Amber -- pooling layers |
| `attention` | `#f48fb1` | Pink -- attention layers |
| `feedForward` | `#80cbc4` | Teal -- feed-forward layers |
| `norm` | `#90a4ae` | Blue-grey -- normalization layers |
| `embedding` | `#ce93d8` | Light purple -- embedding layers |
| `positiveWeight` | `#ffd54f` | Golden -- positive connection weights |
| `negativeWeight` | `#42a5f5` | Blue -- negative connection weights |
| `zeroWeight` | `#616161` | Grey -- near-zero connection weights |
| `dataParticle` | `#76ff03` | Neon green -- data flow particles |
| `gradientParticle` | `#ff1744` | Red -- gradient flow particles |
| `selected` | `#ffffff` | White -- selected elements |
| `hovered` | `#e0e0e0` | Light grey -- hovered elements |
| `background` | `#0a0a0f` | Near-black -- scene background |

---

#### `getActivationColor(activation?: string): THREE.Color`

Maps an activation function name to a color.

| Parameter | Type | Description |
|-----------|------|-------------|
| `activation` | `string \| undefined` | Name of the activation function. |

| Activation | Returned Color |
|------------|---------------|
| `'relu'` | `#ff5252` (Red) |
| `'sigmoid'` | `#ffab40` (Amber) |
| `'tanh'` | `#40c4ff` (Light blue) |
| `'softmax'` | `#69f0ae` (Green) |
| `'gelu'` | `#ea80fc` (Pink-purple) |
| `undefined` / other | `#9e9e9e` (Grey) |

**Returns:** A new `THREE.Color` instance (not a reference to the palette).

---

#### `weightToColor(weight: number): THREE.Color`

Maps a weight value in the range [-1, 1] to a color by interpolating between zero-weight grey and positive/negative colors.

| Parameter | Type | Description |
|-----------|------|-------------|
| `weight` | `number` | Weight value from -1 to 1. |

**Behavior:**
- `weight > 0.01`: Lerp from `COLORS.zeroWeight` (#616161) to `COLORS.positiveWeight` (#ffd54f).
- `weight < -0.01`: Lerp from `COLORS.zeroWeight` (#616161) to `COLORS.negativeWeight` (#42a5f5).
- `-0.01 <= weight <= 0.01`: Returns a clone of `COLORS.zeroWeight`.

**Returns:** A new `THREE.Color` instance.

---

#### `ATTENTION_HEAD_COLORS` (constant)

An array of 12 distinct `THREE.Color` values for coloring multi-head attention beams.

| Index | Color Name | Hex |
|-------|-----------|-----|
| 0 | Red | `#f44336` |
| 1 | Pink | `#e91e63` |
| 2 | Purple | `#9c27b0` |
| 3 | Indigo | `#3f51b5` |
| 4 | Blue | `#2196f3` |
| 5 | Cyan | `#00bcd4` |
| 6 | Teal | `#009688` |
| 7 | Green | `#4caf50` |
| 8 | Light green | `#8bc34a` |
| 9 | Yellow | `#ffeb3b` |
| 10 | Orange | `#ff9800` |
| 11 | Deep orange | `#ff5722` |

Access with modular indexing: `ATTENTION_HEAD_COLORS[headIndex % ATTENTION_HEAD_COLORS.length]`.

---

### math.ts

**File:** `src/utils/math.ts`

**Purpose:** Mathematical utility functions for computing neuron positions, layer spacing, curves, easing, and value mapping.

---

#### `calculateNeuronPositions(count, layerPosition, spacing?, maxPerRow?): THREE.Vector3[]`

Calculates grid positions for neurons in a layer, centered around the layer position.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | `number` | -- | Number of neurons to position. |
| `layerPosition` | `THREE.Vector3` | -- | Center position of the layer in world space. |
| `spacing` | `number` | `1.2` | Distance between adjacent neurons. |
| `maxPerRow` | `number` | `16` | Maximum neurons per row before wrapping to the next row. |

**Returns:** `THREE.Vector3[]` -- Array of world-space positions.

**Behavior:** Neurons are arranged in a grid centered on `layerPosition`. Columns = `min(count, maxPerRow)`, rows = `ceil(count / maxPerRow)`. Positions are offset from center: `x = (col - (cols-1)/2) * spacing`, `y = (row - (rows-1)/2) * spacing`, `z = layerPosition.z`.

---

#### `calculateFeatureMapPositions(width, height, channels, layerPosition, scale?): { position, size }`

Calculates the position and visual size for a CNN feature map volume.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | `number` | -- | Spatial width of the feature map. |
| `height` | `number` | -- | Spatial height of the feature map. |
| `channels` | `number` | -- | Number of channels/filters. |
| `layerPosition` | `THREE.Vector3` | -- | Center position for the volume. |
| `scale` | `number` | `0.05` | Multiplier to convert feature map dimensions to world units. |

**Returns:** `{ position: THREE.Vector3, size: THREE.Vector3 }` where size is `(width * scale, height * scale, channels * scale * 0.3)`.

---

#### `smoothStep(t: number): number`

Hermite smooth-step interpolation.

| Parameter | Type | Description |
|-----------|------|-------------|
| `t` | `number` | Input value, typically in [0, 1]. |

**Formula:** `t * t * (3 - 2 * t)`

**Returns:** Smoothly interpolated value with zero derivatives at 0 and 1.

---

#### `easeInOutCubic(t: number): number`

Cubic ease-in-out easing function.

| Parameter | Type | Description |
|-----------|------|-------------|
| `t` | `number` | Input value in [0, 1]. |

**Formula:** `t < 0.5 ? 4 * t^3 : 1 - (-2t + 2)^3 / 2`

**Returns:** Eased value that accelerates in the first half and decelerates in the second half.

---

#### `generateConnectionCurve(start, end, curvature?, segments?): THREE.Vector3[]`

Generates points along a quadratic Bezier curve between two positions with random perpendicular curvature.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start` | `THREE.Vector3` | -- | Starting point of the curve. |
| `end` | `THREE.Vector3` | -- | Ending point of the curve. |
| `curvature` | `number` | `0.3` | Maximum curvature amount as a fraction of the connection distance. |
| `segments` | `number` | `20` | Number of points to sample along the curve. |

**Returns:** `THREE.Vector3[]` -- Array of points along the curve.

**Behavior:** The midpoint is displaced perpendicular to the connection direction by `distance * curvature * (Math.random() - 0.5)`, creating a random arc. The perpendicular direction is computed as `cross(direction, up)`.

**Warning:** This function calls `Math.random()` internally. Do not call it during the React render path -- pre-compute results in `useMemo`.

---

#### `mapRange(value, inMin, inMax, outMin, outMax): number`

Linearly maps a value from one numeric range to another.

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `number` | The input value to remap. |
| `inMin` | `number` | Minimum of the input range. |
| `inMax` | `number` | Maximum of the input range. |
| `outMin` | `number` | Minimum of the output range. |
| `outMax` | `number` | Maximum of the output range. |

**Formula:** `((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin`

**Returns:** The remapped value. Does not clamp -- values outside the input range will extrapolate.

---

#### `calculateLayerDepths(layerCount, spacing?): number[]`

Generates evenly-spaced Z positions for layers, centered around zero.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `layerCount` | `number` | -- | Number of layers. |
| `spacing` | `number` | `5` | Distance between adjacent layers along the Z axis. |

**Returns:** `number[]` -- Array of Z positions.

**Formula:** `(i - (layerCount - 1) / 2) * spacing` for each layer index `i`.

**Example:** `calculateLayerDepths(3, 6)` returns `[-6, 0, 6]`.
