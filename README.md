<div align="center">

# 🧠 3D Neural Network Visualizer

**Interactive 3D Architecture Explorer for Neural Networks**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r182-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Explore **ANN**, **CNN**, and **Transformer** architectures in an immersive 3D environment with real-time animations, data flow particles, multi-head attention beams, and interactive layer inspection.

[Quick Start](#-quick-start) &bull; [Features](#-features) &bull; [Model Presets](#-model-support) &bull; [Architecture](#-architecture) &bull; [Keyboard Shortcuts](#-keyboard-shortcuts)

</div>

---

## Overview

**3D Neural Network Visualizer** is a browser-based tool that renders neural network architectures as interactive 3D scenes. It transforms abstract model definitions into tangible, explorable structures -- neurons you can click, connections you can trace, and data flow you can watch propagate layer by layer.

The project was built for **students, educators, and ML practitioners** who want to build intuition about how neural networks are structured. Instead of staring at parameter tables or flat diagrams, you orbit around a living 3D model, inspect individual layers, toggle weight connections, and watch animated particles flow through the network in real time.

Under the hood, the application uses **React Three Fiber** for declarative 3D rendering, **Zustand** for lightweight state management, and a schema-driven approach where each model architecture (ANN, CNN, LLM) is defined by a typed configuration that the corresponding visualizer component interprets into geometry. The result is a system that is both visually striking and straightforward to extend with new architectures or presets.

---

## Screenshots / Demo

<!-- TODO: Add screenshots -->
<!-- Suggested screenshots:
  1. Hero shot: ANN Simple MLP with connections and labels visible
  2. CNN view: LeNet-5 or AlexNet with feature map volumes
  3. LLM view: GPT-2 with attention beams active
  4. Sidebar: Model selection panel
  5. Layer Inspector: Detailed layer information overlay
  6. Data Flow: Particles animating between layers
-->

---

## Features

### 3D Visualization

- **Three architecture types** -- Fully-connected ANNs with neuron grids, CNNs with volumetric feature maps and kernel indicators, and Transformers with attention beams, token blocks, and feed-forward expansion tunnels
- **Interactive orbit controls** -- Rotate, zoom, and pan around any model with smooth damping; auto-rotate for hands-free exploration
- **Bloom post-processing** -- Configurable glow intensity with HDR bloom that makes active neurons and connections visually pop
- **Starfield background** -- 3,000 stars and a subtle grid floor provide spatial grounding and depth perception
- **Fog and depth cues** -- Ambient fog fades distant geometry for natural depth perception
- **Camera auto-adjust** -- Animated camera transitions with ease-out cubic interpolation when switching between model types

### 13 Model Presets

- **4 ANN presets** -- From the minimal XOR network (9 parameters) to a deep MLP with dropout
- **4 CNN presets** -- Classic architectures from LeNet-5 to VGG-11, including ResNet skip connections
- **5 LLM presets** -- Decoder-only and encoder-only transformers, from Nano Transformer (52K params) to Tiny Llama (1.1B params)

### Animation System

- **Data flow particles** -- Neon-green particles travel along bezier curves between layers, pulsing in size as they transit
- **Activation glow** -- Neurons pulse with sine-wave-modulated glow synchronized to animation speed, with amplitude proportional to activation value
- **Layer transitions** -- Tube geometry paths with arrow-like particle streams showing data flow direction, with trailing particles that fade in and out
- **Attention beams** -- Multi-head attention visualized as color-coded quadratic bezier curves between token positions, with per-head colors and oscillating opacity
- **Play / Pause / Step** -- Full transport controls with adjustable speed from 0.1x to 3.0x
- **Animation loop hook** -- Global animation clock (`useAnimationLoop`) synchronized with store state, providing normalized time across all animated components

### Interactive Controls

- **Collapsible sidebar** with three tabs:
  - **Models** -- Browse and load presets organized by architecture type
  - **Layers** -- Click to select and highlight individual layers in the 3D scene
  - **Settings** -- Sliders for glow intensity, neuron size, and connection opacity; toggles for weights, activations, labels, and data flow
- **Playback controls** -- Floating glass-panel toolbar with transport buttons, speed slider, data flow toggle, and auto-rotate toggle
- **Layer inspector** -- Click any neuron or layer volume to open a detailed overlay showing layer type, dimensions, activation function, kernel size, parameter count, and more
- **Model info badge** -- Persistent overlay showing the current model name, total parameters, and layer count
- **Keyboard shortcuts panel** -- Press `?` to reveal all available shortcuts in a modal overlay

### Performance Optimizations

- **Adaptive device pixel ratio** -- `PerformanceMonitor` from drei dynamically adjusts DPR between 1.0 and 2.0 based on frame rate
- **Shared geometries** -- `SphereGeometry` instances for neurons and glow halos are allocated once at module level and reused by every `Neuron` instance
- **Connection count capping** -- ANN connections are sampled with skip factors when exceeding 200 to prevent frame drops on dense layers
- **Selective Zustand subscriptions** -- Every store consumer uses individual field selectors (e.g., `(s) => s.showWeights`) to avoid re-renders on unrelated state changes
- **Memoized layouts** -- Layer positions, connection data, and particle assignments are computed via `useMemo` with stable dependency arrays
- **Geometry disposal** -- Connection and attention beam geometries/materials are explicitly disposed on unmount or dependency change to prevent WebGL memory leaks
- **Stable primitive destructuring** -- Array props like `[x, y, z]` are destructured to stable scalar values before entering `useMemo` dependency arrays, preventing unnecessary recomputation
- **Visual neuron capping** -- Layers with more than 32 neurons cap the rendered count while displaying the actual count in the label

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or any compatible package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/3d-neural-network-visualizer.git
cd 3d-neural-network-visualizer

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Select a model preset from the sidebar to begin exploring.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 19.2 | UI framework with hooks and Strict Mode |
| [Three.js](https://threejs.org/) | r182 | 3D rendering engine (WebGL) |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | 9.5 | Declarative React renderer for Three.js |
| [@react-three/drei](https://github.com/pmndrs/drei) | 10.7 | Helpers: OrbitControls, Text, Stars, Grid, PerformanceMonitor, shapes |
| [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) | 3.0 | Bloom post-processing effect |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.0 | Lightweight state management with selectors |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1 | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | 12.33 | UI animations and transitions |
| [GSAP](https://gsap.com/) | 3.14 | Advanced animation timeline support |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Static typing with strict mode |
| [Vite](https://vite.dev/) | 7.2 | Build tool with HMR and optimized bundling |
| [ESLint](https://eslint.org/) | 9.39 | Code quality and style enforcement |

---

## Project Structure

```
3d-neural-network-visualizer/
├── public/
│   └── vite.svg                          # Favicon
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   └── Scene.tsx                 # R3F Canvas, lights, fog, bloom, camera, grid, PerformanceMonitor
│   │   ├── shared/
│   │   │   ├── ActivationGlow.tsx        # Sine-wave glow wrapper for neurons (synced to animation speed)
│   │   │   ├── Connection.tsx            # Bezier curve connection lines between neurons (with disposal)
│   │   │   ├── DataFlowParticle.tsx      # Animated particle traveling along a bezier path
│   │   │   ├── ErrorBoundary.tsx         # React error boundary for WebGL crash recovery
│   │   │   ├── LayerTransition.tsx       # Tube geometry with flowing arrow-like particle streams
│   │   │   └── Neuron.tsx                # Shared-geometry neuron sphere with hover/select/pulse
│   │   ├── ui/
│   │   │   ├── KeyboardShortcuts.tsx     # Modal overlay showing all keyboard shortcuts
│   │   │   ├── LayerInspector.tsx        # Detailed layer properties panel (params, dims, activation)
│   │   │   ├── ModelInfo.tsx             # Floating badge with model name, params, layer count
│   │   │   ├── PlaybackControls.tsx      # Transport bar: play/pause/stop/step, speed, toggles
│   │   │   └── Sidebar.tsx              # Collapsible sidebar with Models, Layers, Settings tabs
│   │   └── visualizers/
│   │       ├── ann/
│   │       │   └── ANNVisualizer.tsx     # Renders fully-connected layers as neuron grids + connections
│   │       ├── cnn/
│   │       │   └── CNNVisualizer.tsx     # Renders feature map volumes, kernels, skip connections
│   │       └── llm/
│   │           └── LLMVisualizer.tsx     # Renders token blocks, attention beams, FFN tunnels
│   ├── hooks/
│   │   └── useAnimationLoop.ts           # Global animation clock synced to play/pause/speed
│   ├── models/
│   │   ├── ann-schema.ts                 # ANN type definitions + 4 factory presets
│   │   ├── cnn-schema.ts                 # CNN type definitions + 4 factory presets
│   │   └── llm-schema.ts                # LLM type definitions + 5 factory presets
│   ├── stores/
│   │   ├── modelStore.ts                 # Current model, preset loading, model type selection
│   │   ├── uiStore.ts                    # Sidebar state, tab selection, tooltip management
│   │   └── visualizationStore.ts         # Camera, animation, visual settings, layer selection
│   ├── styles/
│   │   └── globals.css                   # CSS custom properties, glass panels, scrollbar styles
│   ├── utils/
│   │   ├── colors.ts                     # Color palette, activation colors, attention head colors
│   │   └── math.ts                       # Neuron positioning, bezier curves, easing functions
│   ├── App.tsx                           # Root component: layout, keyboard shortcuts, model routing
│   ├── main.tsx                          # Entry point: React 19 createRoot with StrictMode
│   └── vite-env.d.ts                     # Vite type declarations
├── eslint.config.js                      # ESLint 9 flat config
├── index.html                            # HTML entry point
├── package.json                          # Dependencies and scripts
├── tsconfig.json                         # TypeScript project references
├── tsconfig.app.json                     # App TypeScript config (strict mode)
├── tsconfig.node.json                    # Node TypeScript config (for Vite config)
└── vite.config.ts                        # Vite config with React and Tailwind plugins
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           App.tsx                                     │
│  ┌────────────┐  ┌───────────────────┐  ┌─────────────────────────┐ │
│  │  Sidebar    │  │   Scene (R3F)      │  │  Playback Controls     │ │
│  │  ├ Models   │  │   ├ Lights/Fog     │  │  ├ Play/Pause/Stop     │ │
│  │  ├ Layers   │  │   ├ Stars/Grid     │  │  ├ Speed Slider        │ │
│  │  └ Settings │  │   ├ OrbitControls  │  │  └ Flow/Rotate Toggles │ │
│  └──────┬─────┘  │   ├ Bloom FX       │  └───────────┬───────────┘ │
│         │        │   └ Visualizer ─┐   │              │             │
│         │        └────────────────┬┘   │              │             │
│         │                         │                    │             │
│   ┌─────▼─────────────────────────▼────────────────────▼───────┐    │
│   │                    Zustand Stores                           │    │
│   │  ┌─────────────┐ ┌───────────────────┐ ┌────────────────┐ │    │
│   │  │ modelStore  │ │ visualizationStore │ │   uiStore      │ │    │
│   │  │  - model    │ │  - animation       │ │  - sidebar     │ │    │
│   │  │  - presets  │ │  - visual settings │ │  - tabs        │ │    │
│   │  │  - type     │ │  - layer selection │ │  - tooltips    │ │    │
│   │  └──────┬──────┘ └────────┬──────────┘ └────────────────┘ │    │
│   └─────────┼─────────────────┼────────────────────────────────┘    │
│             │                 │                                      │
│   ┌─────────▼─────────────────▼────────────────────────────────┐    │
│   │                   Model Schemas                             │    │
│   │   ann-schema.ts    cnn-schema.ts    llm-schema.ts          │    │
│   │   (interfaces + factory functions for typed presets)        │    │
│   └────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

**How it works:**

1. **Model schemas** define typed interfaces (`ANNModel`, `CNNModel`, `LLMModel`) and factory functions that produce preset configurations with layers, connections, and metadata.

2. **Model store** holds the currently loaded model and exposes `loadPreset()`. When a user selects a preset from the sidebar, the store calls the factory function and stores the result.

3. **App.tsx** reads `currentModel.type` and renders the corresponding **visualizer component** (`ANNVisualizer`, `CNNVisualizer`, or `LLMVisualizer`) inside the R3F `Scene`.

4. **Visualizer components** transform model data into 3D geometry using **shared primitives** (`Neuron`, `Connection`, `DataFlowParticle`, `ActivationGlow`, `LayerTransition`).

5. **Visualization store** controls rendering options (glow, labels, weights, data flow, animation state) that the visualizers and shared components subscribe to via selective Zustand selectors.

6. **UI components** (Sidebar, PlaybackControls, LayerInspector, ModelInfo, KeyboardShortcuts) overlay the 3D canvas and interact with all three stores.

---

## Model Support

### ANN (Artificial Neural Networks)

| Preset | Description | Layers | Parameters |
|---|---|---|---|
| Simple MLP | 3-layer perceptron for classification | 4 | 400 |
| Deep MLP | Deep network with dropout regularization | 6 | 20,074 |
| Autoencoder | Encoder-decoder with compressed bottleneck | 7 | 5,412 |
| XOR Network | Minimal 2-2-1 network for XOR problem | 3 | 9 |

### CNN (Convolutional Neural Networks)

| Preset | Description | Layers | Parameters |
|---|---|---|---|
| LeNet-5 | Classic CNN for digit recognition (LeCun 1998) | 9 | 61.7K |
| Mini ResNet | ResNet with skip connections (CIFAR-10) | 10 | 47.5K |
| AlexNet | Simplified AlexNet (5 conv + 3 FC) | 13 | 62.4M |
| VGG-11 | Simplified VGG-11 with uniform 3x3 convolutions | 17 | 132.9M |

### LLM (Large Language Models / Transformers)

| Preset | Architecture | Description | Parameters |
|---|---|---|---|
| GPT-2 Small | Decoder-only | 4 of 12 layers shown, BPE tokenizer | 124M |
| BERT Tiny | Encoder-only | Minimal BERT for understanding attention | 4.4M |
| Nano Transformer | Decoder-only | Tiny transformer for learning basics | 52K |
| Tiny Llama | Decoder-only | Llama-style with RoPE and SwiGLU | 1.1B |
| Mini GPT | Decoder-only | Minimal GPT for tracing operations by hand | 436K |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause animation |
| `R` | Toggle auto-rotate |
| `L` | Toggle labels |
| `W` | Toggle weight connections |
| `F` | Toggle data flow particles |
| `1` | Switch to ANN models tab |
| `2` | Switch to CNN models tab |
| `3` | Switch to LLM models tab |
| `?` | Show / hide keyboard shortcuts panel |
| `Esc` | Close shortcuts panel |

---

## Configuration

All visualization settings are managed through the **Settings** tab in the sidebar or via keyboard shortcuts. Available options:

### Sliders

| Setting | Range | Default | Description |
|---|---|---|---|
| Glow Intensity | 0.0 -- 1.0 | 0.60 | Controls bloom post-processing strength |
| Neuron Size | 0.5 -- 2.0 | 1.00 | Scales all neuron spheres uniformly |
| Connection Opacity | 0.0 -- 1.0 | 0.40 | Base opacity for connection lines |
| Animation Speed | 0.1 -- 3.0 | 1.00 | Multiplier for all animation playback |

### Toggles

| Setting | Default | Description |
|---|---|---|
| Show Weights | On | Render connection lines between neurons/layers |
| Show Activations | On | Enable activation-based glow on neurons |
| Show Labels | On | Display layer names, neuron counts, and activation labels |
| Data Flow | Off | Animate particles flowing through connections |
| Auto Rotate | On | Slowly orbit the camera around the scene |

---

## Performance Optimizations

The application implements several strategies to maintain smooth frame rates even with complex network visualizations:

1. **Adaptive DPR** -- `PerformanceMonitor` from drei detects framerate drops and dynamically scales the device pixel ratio between 1.0 (performance) and 2.0 (quality).

2. **Shared geometry instances** -- All neurons reuse a single `SphereGeometry(1, 16, 16)` allocated at module scope. Glow halos share a separate `SphereGeometry(1, 12, 12)`. This eliminates per-neuron geometry allocation.

3. **Connection sampling** -- When the total number of fully-connected edges exceeds 200, the ANN visualizer applies skip factors (`skipFrom` / `skipTo`) to sample a representative subset of connections.

4. **Selective store subscriptions** -- Every Zustand consumer uses narrow field selectors like `(s) => s.showWeights` rather than subscribing to the entire store, minimizing React re-renders.

5. **Memoized computation** -- Layer positions, connection endpoints, particle assignments, and curve geometries are wrapped in `useMemo` with carefully chosen dependency arrays to avoid recomputation on unrelated state changes.

6. **Explicit resource disposal** -- `Connection` and `AttentionBeam` components dispose their `BufferGeometry` and `LineBasicMaterial` instances in `useEffect` cleanup functions, preventing WebGL memory leaks during model switching.

7. **Stable dependency arrays** -- Array props (`[x, y, z]`) are destructured into scalar primitives before being used in `useMemo` dependencies, preventing unnecessary recomputation from reference changes.

8. **Visual neuron cap** -- Layers with more than 32 neurons render only 32 spheres while showing the true neuron count in the label text, maintaining performance for large layers.

---

## Development

### Available Scripts

```bash
# Start development server with HMR
npm run dev

# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview

# Run ESLint across the project
npm run lint
```

### TypeScript

The project uses **TypeScript 5.9** with strict mode enabled. Type checking runs as part of the build step (`tsc -b && vite build`). The configuration is split across three tsconfig files:

- `tsconfig.json` -- Project references root
- `tsconfig.app.json` -- Application source configuration
- `tsconfig.node.json` -- Vite and tooling configuration

### Code Quality

- **ESLint 9** with flat config, including `react-hooks` and `react-refresh` plugins
- Strict TypeScript checking catches type errors at build time
- Zustand selectors enforced by convention to prevent unnecessary re-renders

---

## Contributing

Contributions are welcome. Here is how to get started:

1. **Fork** the repository and create a feature branch from `main`
2. **Install** dependencies with `npm install`
3. **Make your changes** -- follow the existing code style and component patterns
4. **Test locally** with `npm run dev` and verify the 3D scene renders correctly
5. **Run checks** -- ensure `npm run build` and `npm run lint` pass without errors
6. **Submit a pull request** with a clear description of what you changed and why

### Guidelines

- Keep components focused: one visualizer per architecture type, shared primitives for reusable 3D elements
- Use selective Zustand subscriptions (never subscribe to the entire store)
- Dispose Three.js geometries and materials in cleanup functions
- Add new model presets by creating factory functions in the appropriate schema file and registering them in `modelStore.ts`

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

This project builds on the incredible work of the open-source community:

- **[Three.js](https://threejs.org/)** -- The 3D rendering engine that makes WebGL accessible
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)** -- Declarative React bindings for Three.js
- **[drei](https://github.com/pmndrs/drei)** -- The Swiss-army knife of R3F helpers (OrbitControls, Text, Stars, Grid, PerformanceMonitor, and more)
- **[React Three Postprocessing](https://github.com/pmndrs/react-postprocessing)** -- Bloom and other post-processing effects
- **[Zustand](https://zustand-demo.pmnd.rs/)** -- Minimal, flexible state management that stays out of the way
- **[Vite](https://vite.dev/)** -- Lightning-fast build tooling with HMR
- **[Tailwind CSS](https://tailwindcss.com/)** -- Utility-first CSS for rapid UI development
- **[Framer Motion](https://www.framer.com/motion/)** & **[GSAP](https://gsap.com/)** -- Animation libraries for polished UI transitions

---

<div align="center">

Built with care for the ML education community.

**[Back to Top](#-3d-neural-network-visualizer)**

</div>
