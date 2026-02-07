# Contributing to 3D Neural Network Visualizer

Thank you for your interest in contributing to the 3D Neural Network Visualizer! Whether you are fixing a bug, adding a new neural network preset, improving documentation, or building an entirely new feature, your contribution is valued and welcome.

This guide will help you get oriented and make the contribution process smooth for everyone.

---

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Adding a New Neural Network Preset](#adding-a-new-neural-network-preset)
- [Adding a New Model Type](#adding-a-new-model-type)
- [Adding UI Components](#adding-ui-components)
- [Performance Guidelines](#performance-guidelines)
- [Code of Conduct](#code-of-conduct)

---

## Ways to Contribute

There are many ways to contribute, regardless of your experience level:

- **Bug reports** -- Found something broken? Open an issue with steps to reproduce, expected behavior, actual behavior, and your browser/OS.
- **Feature requests** -- Have an idea for a new visualization mode, interaction pattern, or educational feature? Open an issue and describe it.
- **Code contributions** -- Fix bugs, implement features, improve performance. See the sections below for detailed guidance.
- **Documentation** -- Improve this guide, add code comments, write tutorials, or fix typos.
- **Neural network presets** -- Add new architectures to the preset library (this is a great first contribution!).
- **Design and accessibility** -- Improve the visual design, color contrast, keyboard navigation, or screen reader support.

---

## Development Setup

Follow the [Development Guide](./DEVELOPMENT.md) to get the project running locally. The short version:

```bash
git clone <repository-url>
cd 3d-neural-network-visualizer
npm install
npm run dev
```

Make sure you can:
1. See the app in your browser at the URL Vite prints
2. Select a model preset and see the 3D visualization
3. Run `npm run build` without errors
4. Run `npm run lint` without warnings

---

## Making Changes

### Fork and Branch Strategy

1. **Fork** the repository to your own GitHub account.
2. **Clone** your fork locally.
3. **Create a branch** from `main` with a descriptive name:

```bash
# Feature branch
git checkout -b feat/recurrent-network-visualizer

# Bug fix branch
git checkout -b fix/neuron-glow-flickering

# Documentation branch
git checkout -b docs/add-cnn-tutorial
```

Branch naming convention: `<type>/<short-description>`

| Type | Use for |
|---|---|
| `feat` | New features or enhancements |
| `fix` | Bug fixes |
| `docs` | Documentation changes |
| `refactor` | Code restructuring without behavior changes |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build tooling, dependency updates, housekeeping |

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Examples:

```
feat(models): add ResNet-18 CNN preset

Add a simplified ResNet-18 architecture with skip connections.
Includes 8 residual blocks with batch normalization.

fix(neuron): prevent glow flicker when activation is zero

The emissive intensity calculation could produce negative values
when activation was exactly 0 and the hover state changed.
Clamp the minimum to 0.1.

docs(contributing): add preset creation tutorial

Step-by-step guide with code examples for adding new
neural network presets to the model library.
```

Scopes commonly used in this project:

| Scope | Covers |
|---|---|
| `models` | Schema files and factory functions |
| `store` | Zustand store changes |
| `scene` | Canvas, lighting, camera, postprocessing |
| `neuron` | Shared Neuron component |
| `connection` | Shared Connection component |
| `ann` | ANN visualizer |
| `cnn` | CNN visualizer |
| `llm` | LLM visualizer |
| `ui` | Sidebar, controls, inspector, overlays |
| `perf` | Performance-related changes |

### Code Review Process

1. Push your branch to your fork and open a **Pull Request** against `main`.
2. Fill in the PR template:
   - **What** does this change do?
   - **Why** is it needed?
   - **How** can it be tested?
   - **Screenshots/videos** for visual changes (highly encouraged for 3D work).
3. A maintainer will review your PR. Expect feedback on:
   - Code style consistency
   - Performance implications (see [Performance Guidelines](#performance-guidelines))
   - Memory management (geometry/material disposal)
   - Zustand selector patterns
4. Address review comments by pushing additional commits to your branch.
5. Once approved, a maintainer will merge your PR.

### Before Submitting

Run these checks locally:

```bash
# Type-check
npx tsc -b

# Lint
npm run lint

# Build
npm run build
```

All three must pass without errors.

---

## Adding a New Neural Network Preset

This is one of the best first contributions. A preset is a factory function that returns a model data structure, which the existing visualizer renders automatically.

### Step 1: Choose the Model Type

Decide which category your preset belongs to:

| Type | File | Examples |
|---|---|---|
| `ann` | `src/models/ann-schema.ts` | MLP, Autoencoder, XOR |
| `cnn` | `src/models/cnn-schema.ts` | LeNet-5, AlexNet, VGG-11, ResNet |
| `llm` | `src/models/llm-schema.ts` | GPT-2, BERT, Llama |

### Step 2: Define the Architecture

Study the schema interfaces for your model type. Here is an example for an ANN preset:

```ts
// In src/models/ann-schema.ts

/** Generate a Dropout Regularization Demo preset */
export function createDropoutDemo(): ANNModel {
  return {
    type: 'ann',
    name: 'Dropout Demo',
    description: 'A network demonstrating dropout regularization at different rates',
    layers: [
      { id: 'input', type: 'input', neurons: 10, label: 'Input' },
      { id: 'hidden1', type: 'hidden', neurons: 24, activation: 'relu', dropout: 0.5, label: 'Hidden 1 (50% dropout)' },
      { id: 'hidden2', type: 'hidden', neurons: 24, activation: 'relu', dropout: 0.3, label: 'Hidden 2 (30% dropout)' },
      { id: 'hidden3', type: 'hidden', neurons: 16, activation: 'relu', label: 'Hidden 3 (no dropout)' },
      { id: 'output', type: 'output', neurons: 5, activation: 'softmax', label: 'Output' },
    ],
    connections: [
      { fromLayer: 'input', toLayer: 'hidden1' },
      { fromLayer: 'hidden1', toLayer: 'hidden2' },
      { fromLayer: 'hidden2', toLayer: 'hidden3' },
      { fromLayer: 'hidden3', toLayer: 'output' },
    ],
    metadata: {
      parameters: 10 * 24 + 24 + 24 * 24 + 24 + 24 * 16 + 16 + 16 * 5 + 5,
      trainedOn: 'Fashion-MNIST',
      accuracy: 0.91,
    },
  };
}
```

Guidelines for defining architectures:
- **Cap visual neurons per layer at 64.** The visualizer already caps at 32 for rendering, but keeping the data reasonable helps.
- **Use descriptive labels.** Include dimensions in parentheses (e.g., `"FC1 (120)"`).
- **Calculate parameters accurately.** For fully connected layers: `input_neurons * output_neurons + output_neurons` (weights + biases).
- **Include metadata** when possible -- framework, dataset, accuracy, parameter count.

### Step 3: Register in modelStore

Open `src/stores/modelStore.ts` and add your preset to the `MODEL_PRESETS` array:

```ts
import { createDropoutDemo } from '../models/ann-schema';

export const MODEL_PRESETS: ModelPreset[] = [
  // ... existing presets
  {
    id: 'dropout-demo',
    name: 'Dropout Demo',
    type: 'ann',
    description: 'Network demonstrating dropout regularization',
    create: createDropoutDemo,
  },
];
```

Important:
- The `id` must be unique across all presets (use kebab-case).
- The `type` must match the model's `type` field (`'ann'`, `'cnn'`, or `'llm'`).
- The `create` function must be imported with a value import (not `import type`).

### Step 4: Test the Visualization

1. Run the dev server (`npm run dev`).
2. Open the sidebar and switch to the correct model type tab.
3. Click your new preset.
4. Verify:
   - All layers render with correct neuron counts
   - Connections draw between adjacent layers
   - Labels display correctly
   - Layer selection (click) and hover work
   - Data flow animation works (press `F` then `Space`)
   - No console errors or warnings
   - Performance is smooth (60fps)

### Step 5: Submit

Commit with a message like:

```
feat(models): add Dropout Demo ANN preset

Demonstrates dropout regularization with different rates per layer.
5-layer MLP trained on Fashion-MNIST with 50%, 30%, and 0% dropout.
```

---

## Adding a New Model Type

This is an advanced contribution. If you want to add support for an entirely new category of neural network (e.g., RNN, GAN, Graph Neural Network), here is the process:

### Step 1: Define the Schema

Create a new file `src/models/<type>-schema.ts`:

```ts
// src/models/rnn-schema.ts

export interface RNNLayer {
  id: string;
  type: 'input' | 'rnn' | 'lstm' | 'gru' | 'dense' | 'output';
  neurons: number;
  // ... type-specific fields
}

export interface RNNModel {
  type: 'rnn';  // Must be a unique string literal
  name: string;
  description?: string;
  layers: RNNLayer[];
  // ...
}

// Factory functions
export function createSimpleRNN(): RNNModel { ... }
```

### Step 2: Update the Model Store

In `src/stores/modelStore.ts`:

1. Add your model type to the `NetworkModel` union:
   ```ts
   export type NetworkModel = ANNModel | CNNModel | LLMModel | RNNModel;
   ```

2. Add to the `ModelType` union:
   ```ts
   export type ModelType = 'ann' | 'cnn' | 'llm' | 'rnn';
   ```

3. Add presets to `MODEL_PRESETS`.

### Step 3: Create the Visualizer

Create `src/components/visualizers/rnn/RNNVisualizer.tsx`:

```tsx
import { useMemo } from 'react';
import type { RNNModel } from '../../../models/rnn-schema';
import { useVisualizationStore } from '../../../stores/visualizationStore';
import Neuron from '../../shared/Neuron';
import Connection from '../../shared/Connection';

interface RNNVisualizerProps {
  model: RNNModel;
}

export default function RNNVisualizer({ model }: RNNVisualizerProps) {
  // Use individual selectors
  const showWeights = useVisualizationStore((s) => s.showWeights);

  // Compute layout with useMemo
  const layout = useMemo(() => {
    // ... compute 3D positions for each layer/neuron
  }, [model]);

  return (
    <group>
      {/* Render neurons, connections, etc. using shared components */}
    </group>
  );
}
```

### Step 4: Register in App.tsx

Add the new case to the `NetworkVisualization` switch:

```tsx
import RNNVisualizer from './components/visualizers/rnn/RNNVisualizer';
import type { RNNModel } from './models/rnn-schema';

// In the switch statement:
case 'rnn':
  return <RNNVisualizer model={currentModel as RNNModel} />;
```

### Step 5: Add Camera Preset

In `src/components/canvas/Scene.tsx`, add a camera preset for the new type:

```ts
const CAMERA_PRESETS: Record<ModelType, { position: [number, number, number]; fov: number }> = {
  ann: { position: [0, 5, 22], fov: 58 },
  cnn: { position: [0, 8, 18], fov: 55 },
  llm: { position: [0, 12, 28], fov: 52 },
  rnn: { position: [0, 6, 20], fov: 56 },  // New
};
```

### Step 6: Update UI

- Add a keyboard shortcut in `App.tsx` (e.g., key `4` for RNN)
- Add the model type tab to the Sidebar component
- Update the `KeyboardShortcuts` component

---

## Adding UI Components

The UI layer consists of HTML/CSS panels that overlay the 3D canvas. Follow these guidelines:

### Structure

- Place new UI components in `src/components/ui/`.
- Import and render them in `App.tsx` alongside the existing overlays.

### Styling

- Use the `glass-panel` CSS class for panels that float over the 3D scene:
  ```tsx
  <div className="glass-panel rounded-lg p-4">
    {/* Panel content */}
  </div>
  ```

- Use CSS custom properties for colors (never hardcode hex values in components):
  ```tsx
  <p style={{ color: 'var(--text-secondary)' }}>Description text</p>
  ```

- Use Tailwind utility classes for layout and spacing:
  ```tsx
  <div className="flex items-center gap-2 px-3 py-2">
  ```

### State

- Connect to Zustand stores using individual selectors.
- If your component needs new state, add it to the appropriate store (`uiStore` for UI concerns, `visualizationStore` for 3D visualization settings).
- Keep UI components thin -- business logic belongs in stores or hooks.

### Positioning

UI overlays use absolute positioning within the root container:

```tsx
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
  {/* Centered at bottom */}
</div>
```

Use `pointer-events-none` on wrapper divs and `pointer-events-auto` on interactive children to allow click-through to the 3D canvas:

```tsx
<div className="absolute inset-0 pointer-events-none z-30">
  <div className="pointer-events-auto absolute top-4 right-4">
    {/* This panel captures clicks; the rest passes through to 3D */}
  </div>
</div>
```

### Animations

Use `framer-motion` for UI panel transitions:

```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="glass-panel"
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## Performance Guidelines

The visualizer must maintain **60fps** on mid-range hardware. Every contribution should respect these rules:

### Do

- **Share geometries** across all instances of the same shape. Define `THREE.SphereGeometry`, `THREE.BoxGeometry`, etc. as module-level constants.
- **Dispose GPU resources** (`geometry.dispose()`, `material.dispose()`) in `useEffect` cleanup functions.
- **Cap visual elements** -- limit neurons per layer to 32-64 for rendering; limit connections to ~200 per layer pair.
- **Use `useMemo`** for expensive computations (layout calculations, curve generation, connection data).
- **Destructure array props to scalars** before using them as `useMemo` dependencies.
- **Use individual Zustand selectors** so components only re-render when their specific slice changes.
- **Use `useFrame` with ref mutations** for per-frame animation. Never call `setState` inside `useFrame`.
- **Pre-compute random values in `useMemo`**, never call `Math.random()` in the render path or `useFrame`.

### Do Not

- **Do not create geometries or materials inside render functions.** This leaks GPU memory every frame.
- **Do not use `useEffect` for animation.** Use R3F's `useFrame` which is synchronized with the render loop.
- **Do not destructure the entire Zustand store.** This causes the component to re-render on any state change.
- **Do not use `THREE.Mesh` constructors in JSX.** Use R3F's declarative `<mesh>` elements or `<primitive>` for pre-built objects.
- **Do not add heavy post-processing effects.** The single `Bloom` pass is intentional; additional passes significantly impact frame rate.
- **Do not use `requestAnimationFrame` directly.** R3F manages the render loop; use `useFrame` instead.

### Performance Checklist

Before submitting a PR, verify:

- [ ] No new geometries/materials created per frame
- [ ] All GPU resources disposed on unmount
- [ ] No `setState` calls inside `useFrame`
- [ ] No `Math.random()` in render path
- [ ] Array props destructured to scalars for `useMemo` deps
- [ ] Zustand selectors select individual fields
- [ ] Visual element counts are capped
- [ ] Frame rate stays at 60fps with the largest preset loaded

---

## Code of Conduct

### Our Standards

We are committed to providing a welcoming and respectful experience for everyone. All participants in this project are expected to:

- **Be respectful.** Treat everyone with dignity. Disagreements about code are fine; personal attacks are not.
- **Be constructive.** When providing feedback on code or ideas, focus on improvement rather than criticism.
- **Be inclusive.** Welcome newcomers. Use clear language. Avoid jargon in discussions when simpler words work.
- **Be collaborative.** We are all working toward the same goal: making neural networks understandable through visualization.
- **Be patient.** Not everyone has the same background. Review code with empathy, especially for first-time contributors.

### Unacceptable Behavior

- Harassment, intimidation, or discrimination of any kind
- Personal attacks or derogatory comments
- Publishing others' private information
- Disruptive behavior that prevents productive collaboration

### Reporting

If you experience or witness unacceptable behavior, please contact the project maintainers directly. All reports will be reviewed and handled confidentially.

### Enforcement

Project maintainers will address violations of this code of conduct through appropriate measures, which may include:
- A private conversation and request to modify behavior
- A temporary or permanent ban from the project

---

## Questions?

If anything in this guide is unclear, or if you are unsure whether your idea fits the project, open an issue or start a discussion. We would rather help you contribute successfully than have you give up because something was confusing.

Thank you for helping make neural networks more accessible and understandable through visualization.
