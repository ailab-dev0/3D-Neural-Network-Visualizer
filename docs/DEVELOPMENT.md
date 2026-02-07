# Development Guide

This document covers everything you need to develop, build, and debug the **3D Neural Network Visualizer** -- an interactive WebGL application for exploring neural network architectures in 3D.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Setup](#project-setup)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Code Style and Conventions](#code-style-and-conventions)
- [Common Patterns](#common-patterns)
- [Debugging](#debugging)
- [Build and Deploy](#build-and-deploy)

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Requirement | Minimum Version | Notes |
|---|---|---|
| **Node.js** | 18.0+ | LTS recommended; required for Vite 7 and ESM module support |
| **npm** | 9.0+ | Ships with Node.js 18+ |
| **Modern browser** | Chrome 113+, Firefox 114+, Safari 16.4+, Edge 113+ | Must support **WebGL2** |
| **GPU** | Any discrete or modern integrated GPU | WebGL2 with shader compilation support |

Optional but recommended:

- **React Developer Tools** browser extension
- **Three.js Inspector** browser extension (for debugging the 3D scene graph)
- A code editor with TypeScript support (VS Code recommended)

### Verifying WebGL2 Support

Open your browser console and run:

```js
document.createElement('canvas').getContext('webgl2') ? 'WebGL2 OK' : 'No WebGL2';
```

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repository-url>
cd 3d-neural-network-visualizer

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in your browser
#    Vite will print the local URL (usually http://localhost:5173)
```

Once the app loads, select a neural network preset from the sidebar to see its 3D architecture. Use the mouse to orbit, zoom, and pan. Press `Space` to start the forward-pass animation.

---

## Project Setup

### Vite Configuration

The project uses **Vite 7** with two plugins:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- `@vitejs/plugin-react` -- Enables React Fast Refresh (HMR) and JSX transform
- `@tailwindcss/vite` -- Integrates Tailwind CSS 4 directly into the Vite pipeline (no PostCSS config needed)

### TypeScript Configuration

The project uses a **project references** layout with two config files:

| File | Scope | Target |
|---|---|---|
| `tsconfig.app.json` | All source code in `src/` | ES2022, React JSX |
| `tsconfig.node.json` | Build tooling (`vite.config.ts`) | ES2023, Node types |
| `tsconfig.json` | Root file that references both | -- |

Key compiler options in `tsconfig.app.json`:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,

    // Enforces `import type { X }` for type-only imports
    "verbatimModuleSyntax": true,

    // Prevents unused variables and parameters from compiling
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // Prevents switch statement fall-through without explicit `break`
    "noFallthroughCasesInSwitch": true,

    // Only allows erasable syntax (no enums, no namespaces)
    "erasableSyntaxOnly": true,

    // Ensures side-effect imports are explicit
    "noUncheckedSideEffectImports": true
  }
}
```

### Tailwind CSS 4

Tailwind is imported via the CSS-first approach at the top of `src/styles/globals.css`:

```css
@import "tailwindcss";
```

No `tailwind.config.js` is needed -- Tailwind CSS 4 uses automatic content detection. Custom design tokens are defined as CSS custom properties in the same file (see [CSS Variables](#css-variables)).

---

## Architecture Overview

```
src/
  main.tsx                          # Entry point: React 19 createRoot
  App.tsx                           # Root component: layout, keyboard shortcuts, routing
  styles/
    globals.css                     # CSS variables, glass-panel, glow effects, Tailwind import
  stores/
    modelStore.ts                   # Current model, presets, model type selection
    visualizationStore.ts           # Camera, animation, visual settings, layer selection
    uiStore.ts                      # Sidebar state, inspector, tooltips
  models/
    ann-schema.ts                   # ANN model types + factory functions (MLP, Autoencoder, XOR)
    cnn-schema.ts                   # CNN model types + factory functions (LeNet, ResNet, AlexNet, VGG)
    llm-schema.ts                   # LLM/Transformer types + factory functions (GPT-2, BERT, Llama)
  hooks/
    useAnimationLoop.ts             # Frame-synchronized animation clock (R3F useFrame)
  utils/
    colors.ts                       # Color palette, weight-to-color mapping, activation colors
    math.ts                         # Neuron positioning, layer depth calculation
  components/
    canvas/
      Scene.tsx                     # R3F Canvas, lighting, postprocessing, camera, performance
    shared/
      Neuron.tsx                    # Reusable 3D neuron sphere with glow, hover, selection
      Connection.tsx                # Bezier curve connection line between neurons
      DataFlowParticle.tsx          # Animated particle traveling along connections
      ActivationGlow.tsx            # Activation visualization effect
      LayerTransition.tsx           # Transition animation between layers
      ErrorBoundary.tsx             # Catches WebGL crashes, shows reload UI
    visualizers/
      ann/ANNVisualizer.tsx         # ANN-specific 3D layout (fully-connected layers)
      cnn/CNNVisualizer.tsx         # CNN-specific 3D layout (conv volumes, pooling, dense)
      llm/LLMVisualizer.tsx         # LLM-specific 3D layout (attention heads, FFN blocks)
    ui/
      Sidebar.tsx                   # Model selection, layer list, visual settings
      PlaybackControls.tsx          # Play/pause/step animation controls
      LayerInspector.tsx            # Detailed layer information panel
      ModelInfo.tsx                 # Model metadata overlay
      KeyboardShortcuts.tsx         # Keyboard shortcut help panel
```

### Data Flow

```
Model Schema (ann-schema.ts, etc.)
    |
    v
modelStore.loadPreset(presetId)   -- creates model data
    |
    v
App.tsx <NetworkVisualization />  -- switches on model.type
    |
    v
ANNVisualizer / CNNVisualizer / LLMVisualizer   -- reads model, renders 3D
    |
    v
Shared components (Neuron, Connection, DataFlowParticle)  -- reusable 3D primitives
    |
    v
Scene.tsx (Canvas, lights, postprocessing, camera controls)
```

### State Management

Three Zustand stores manage all application state:

| Store | Responsibility |
|---|---|
| `modelStore` | Which model is loaded, available presets, current model type |
| `visualizationStore` | Camera mode, animation state/speed, layer selection, visual toggles (weights, labels, data flow, glow, neuron size) |
| `uiStore` | Sidebar open/tab, inspector open, tooltip state |

---

## Development Workflow

### Dev Server with HMR

```bash
npm run dev
```

Vite provides sub-second Hot Module Replacement. When you edit a React component, only that component re-renders without losing 3D scene state. The Three.js scene graph is preserved across HMR updates.

### TypeScript Strict Mode

The `strict: true` flag enables all of these checks simultaneously:

- `strictNullChecks` -- `null` and `undefined` are distinct types; you must handle them explicitly
- `strictFunctionTypes` -- Function parameter types are checked contravariantly
- `strictBindCallApply` -- `bind`, `call`, and `apply` are type-checked
- `strictPropertyInitialization` -- Class properties must be initialized in the constructor
- `noImplicitAny` -- Every expression must have a known type
- `noImplicitThis` -- `this` must be typed explicitly in functions
- `alwaysStrict` -- Emits `"use strict"` in every file

Additionally, `verbatimModuleSyntax` requires that type-only imports use the `import type` syntax:

```ts
// Correct:
import type { ANNModel } from '../models/ann-schema';
import { useVisualizationStore } from '../stores/visualizationStore';

// Wrong -- will cause a compile error:
import { ANNModel } from '../models/ann-schema';  // ANNModel is only used as a type
```

### Linting

```bash
npm run lint
```

ESLint is configured with:
- `@eslint/js` base rules
- `typescript-eslint` for TypeScript-specific rules
- `eslint-plugin-react-hooks` to enforce the Rules of Hooks
- `eslint-plugin-react-refresh` to ensure components are HMR-compatible

### Build Process and Output

```bash
npm run build
```

This runs two steps:
1. `tsc -b` -- Type-checks the entire project using project references
2. `vite build` -- Bundles with Rollup, tree-shakes, and outputs to `dist/`

The output is a static site with:
- `dist/index.html` -- Entry HTML
- `dist/assets/*.js` -- Code-split JavaScript bundles
- `dist/assets/*.css` -- Compiled Tailwind CSS

Preview the production build locally:

```bash
npm run preview
```

---

## Code Style and Conventions

### TypeScript

- **Strict mode is non-negotiable.** Every variable, parameter, and return type should be explicitly or inferrably typed.
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`).
- Use `erasableSyntaxOnly` -- no `enum`, no `namespace`, no `const enum`. Use union types and plain objects instead.
- Prefer `interface` for object shapes that will be extended; use `type` for unions, intersections, and mapped types.

### React Components

- **Functional components only.** The only class component is `ErrorBoundary` (required by React's error boundary API).
- Export components as default exports from their file.
- Keep components focused: one component per file, named to match the filename.
- Use the `function` keyword for component declarations (not arrow functions at the top level).

```ts
// Preferred
export default function Neuron({ position, color }: NeuronProps) { ... }

// Avoid
const Neuron: React.FC<NeuronProps> = ({ position, color }) => { ... };
```

### Zustand Store Patterns

Use **individual selectors** to subscribe to specific state slices. Never destructure the entire store.

```ts
// Correct -- only re-renders when showLabels changes:
const showLabels = useVisualizationStore((s) => s.showLabels);
const selectLayer = useVisualizationStore((s) => s.selectLayer);

// Wrong -- re-renders on ANY state change:
const { showLabels, selectLayer } = useVisualizationStore();
```

Store definitions follow this pattern:

```ts
import { create } from 'zustand';

interface MyState {
  value: number;
  // Actions are part of the interface
  setValue: (v: number) => void;
  increment: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  value: 0,
  setValue: (v) => set({ value: v }),
  increment: () => set((s) => ({ value: s.value + 1 })),
}));
```

### React Three Fiber (R3F) Patterns

**useFrame** -- The per-frame render loop. Always use refs to mutate objects; never set state inside `useFrame`.

```ts
useFrame(() => {
  if (meshRef.current) {
    meshRef.current.rotation.y += 0.01;
  }
});
```

**useThree** -- Access the R3F state (camera, gl, scene, etc.). Use a selector:

```ts
const camera = useThree((s) => s.camera);
```

**primitive** -- Use the `<primitive object={...} />` JSX element when you need to manage a Three.js object manually (for example, a `THREE.Line` created in a `useMemo`):

```ts
const lineObj = useMemo(() => {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: '#4fc3f7' });
  return new THREE.Line(geometry, material);
}, [points]);

return <primitive ref={lineRef} object={lineObj} />;
```

### Three.js Memory Management

**Always dispose geometries and materials** when a component unmounts or when objects are recreated. GPU resources are not garbage-collected.

```ts
useEffect(() => {
  return () => {
    lineObj.geometry.dispose();
    (lineObj.material as THREE.LineBasicMaterial).dispose();
  };
}, [lineObj]);
```

### CSS Variables

Use CSS custom properties defined in `src/styles/globals.css` for consistent theming:

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-panel: #1a1a2e;
  --accent-blue: #4fc3f7;
  --accent-purple: #b388ff;
  --accent-green: #69f0ae;
  --accent-orange: #ffab40;
  --accent-red: #ff5252;
  --text-primary: #e0e0e0;
  --text-secondary: #9e9e9e;
  --text-muted: #616161;
  --border: #2a2a3e;
  --glow-blue: rgba(79, 195, 247, 0.3);
  --glow-purple: rgba(179, 136, 255, 0.3);
}
```

Use the `glass-panel` class for floating UI panels:

```css
.glass-panel {
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
}
```

---

## Common Patterns

### Creating a New 3D Component

Here is a minimal example of a reusable 3D component that renders a mesh with animation:

```tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1. Shared geometry at module level (never recreated)
const SHARED_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);

interface MyBoxProps {
  position: [number, number, number];
  color: THREE.Color;
  speed?: number;
}

export default function MyBox({ position, color, speed = 1 }: MyBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // 2. Per-frame animation via ref mutation (never setState here)
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * speed;
    }
  });

  // 3. Declarative JSX for the 3D object
  return (
    <mesh ref={meshRef} position={position} geometry={SHARED_GEOMETRY}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
}
```

Key points:
- Define shared geometries as **module-level constants** so all instances reuse the same GPU buffer.
- Use `useFrame` with **ref mutations** for animation -- never call `useState` setters inside `useFrame`.
- Use declarative JSX (`<mesh>`, `<meshStandardMaterial>`) wherever possible.

### Adding State to a Zustand Store

1. Add the state field and action to the interface:

```ts
interface VisualizationState {
  // ... existing fields
  showGrid: boolean;
  toggleGrid: () => void;
}
```

2. Add the default value and action implementation:

```ts
export const useVisualizationStore = create<VisualizationState>((set) => ({
  // ... existing state
  showGrid: true,
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
}));
```

3. Consume with an individual selector:

```ts
const showGrid = useVisualizationStore((s) => s.showGrid);
const toggleGrid = useVisualizationStore((s) => s.toggleGrid);
```

### Using Shared Geometries

Multiple instances of the same shape should share a single geometry to reduce GPU memory:

```ts
// At module level (outside the component)
const SHARED_NEURON_GEOMETRY = new THREE.SphereGeometry(1, 16, 16);
const SHARED_GLOW_GEOMETRY = new THREE.SphereGeometry(1, 12, 12);

// Inside the component -- reference it, do NOT create new ones
<mesh geometry={SHARED_NEURON_GEOMETRY} scale={scaledSize}>
  <meshStandardMaterial ... />
</mesh>
```

### Stable useMemo Dependencies

When a prop is an array (like `position: [number, number, number]`), destructure it into scalar values before using it as a `useMemo` dependency. Arrays create new references on every render, which would invalidate the memo.

```ts
// Props
interface ConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
}

// Inside the component
const [sx, sy, sz] = start;
const [ex, ey, ez] = end;

const curve = useMemo(() => {
  const startV = new THREE.Vector3(sx, sy, sz);
  const endV = new THREE.Vector3(ex, ey, ez);
  // ... compute curve
  return curve;
}, [sx, sy, sz, ex, ey, ez]);  // Scalars are stable
```

---

## Debugging

### React DevTools

Install the [React Developer Tools](https://react.dev/learn/react-developer-tools) browser extension. Use the Components tab to inspect:

- Component hierarchy and props
- Zustand store values (search for the store hook names)
- Re-render highlighting to find unnecessary renders

### Three.js Inspector

Install the [three-devtools](https://github.com/nicedoc/three-devtools) browser extension. It gives you:

- A scene graph tree view
- Geometry and material inspectors
- Real-time property editing
- Texture memory analysis

### Performance Profiling

The app includes a built-in `<PerformanceMonitor>` from `@react-three/drei`:

```tsx
<PerformanceMonitor
  onIncline={() => setDpr(2)}    // Performance is good: increase quality
  onDecline={() => setDpr(1)}    // Performance is poor: reduce quality
>
```

This automatically adjusts the device pixel ratio based on frame rate. To profile further:

1. Open Chrome DevTools > Performance tab
2. Record a few seconds of interaction
3. Look for long frames (> 16ms for 60fps)
4. Check the "GPU" lane for shader compilation stalls

### Common Errors

**WebGL context lost**

This happens when the GPU runs out of memory or the driver crashes. The `ErrorBoundary` component catches this and shows a reload button. To prevent it:
- Always dispose geometries and materials on unmount
- Limit the number of draw calls (share geometries, use instancing for large neuron counts)
- Cap visual neurons per layer (the visualizers already cap at 32)

**Shader compilation errors**

If you see `GL_INVALID_OPERATION` or shader compilation warnings in the console:
- Check that material properties are valid numbers (not `NaN` or `undefined`)
- Ensure emissive intensity values are non-negative
- Verify that geometry attributes match what the material expects

**R3F v9 gotchas**

React Three Fiber v9 introduced several breaking changes from v8:
- `<Canvas>` no longer accepts `frameloop` as a string -- use the new API
- Event system changes: `onPointerOver` is now `onPointerEnter`, `onPointerOut` is now `onPointerLeave`
- `useLoader` caching behavior changed -- check the migration guide
- `attach` prop on materials/geometries is now inferred by default

**Zustand v5 gotchas**

Zustand v5 changed the `create` API:
- `create` no longer needs a generic if the state type is inferred
- Middleware composition uses a different pattern
- `persist` middleware import path changed

---

## Build and Deploy

### Production Build

```bash
npm run build
```

Output lands in `dist/`. The build:
- Type-checks with `tsc -b`
- Tree-shakes unused code
- Minifies JavaScript and CSS
- Code-splits by route/dynamic import
- Hashes filenames for cache-busting

### Bundle Analysis

To inspect what is in the production bundle, install and run `vite-bundle-visualizer`:

```bash
npx vite-bundle-visualizer
```

This opens a treemap showing the size of each module. The largest dependencies will typically be:
- `three` (~600KB minified)
- `@react-three/fiber` and `@react-three/drei`
- `react` / `react-dom`
- `gsap` (if animation features are used)

### Deployment Options

The app is a fully static site. Any static hosting provider works.

**Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect the GitHub repository to Vercel for automatic deployments on push.

**Netlify**

1. Connect the repository in the Netlify dashboard
2. Set build command: `npm run build`
3. Set publish directory: `dist`

**GitHub Pages**

Add a `base` path to `vite.config.ts` if deploying to a subpath:

```ts
export default defineConfig({
  base: '/3d-neural-network-visualizer/',
  plugins: [react(), tailwindcss()],
});
```

Then build and deploy:

```bash
npm run build
# Use gh-pages or any static deployment tool to push dist/ to the gh-pages branch
npx gh-pages -d dist
```

**Docker**

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 19.x | UI framework |
| `react-dom` | 19.x | DOM renderer |
| `three` | 0.182.x | 3D rendering engine |
| `@react-three/fiber` | 9.x | React reconciler for Three.js |
| `@react-three/drei` | 10.x | Useful R3F helpers (OrbitControls, Text, Stars, Grid, Html, PerformanceMonitor) |
| `@react-three/postprocessing` | 3.x | Post-processing effects (Bloom) |
| `zustand` | 5.x | Lightweight state management |
| `framer-motion` | 12.x | UI animation library |
| `gsap` | 3.x | Advanced animation/tweening |
| `tailwindcss` | 4.x | Utility-first CSS framework |
| `vite` | 7.x | Build tool and dev server |
| `typescript` | 5.9.x | Type system |

---

## Keyboard Shortcuts Reference

| Key | Action |
|---|---|
| `Space` | Play / Pause animation |
| `R` | Toggle auto-rotate |
| `L` | Toggle labels |
| `W` | Toggle weight connections |
| `F` | Toggle data flow particles |
| `1` | Switch to ANN models |
| `2` | Switch to CNN models |
| `3` | Switch to LLM models |
