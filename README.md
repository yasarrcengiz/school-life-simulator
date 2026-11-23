# School Life Simulator

A 3D voxel-inspired school-life simulation built with Babylon.js, TypeScript and Vite. Designed for desktop and mobile browsers.

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Deploy to Render
Create a **Static Site** from this GitHub repository. Render can read `render.yaml` automatically:
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

## Controls
- Desktop: WASD / arrow keys, Shift to run, Space to jump, E to interact, C to switch camera.
- Mobile: on-screen direction pad, jump, interact and run controls.

## Current vertical slice
- 3D town blockout: school, family home, market, sports hall and park
- Third-person follow camera and first-person toggle
- Character movement, jump and collision setup
- Day clock, money, energy and hunger HUD
- First school quest, market purchase and park/rest interactions
- Responsive touch controls

## Roadmap
1. Character rig, animations and customization
2. Detailed school interiors and classroom activities
3. Family and student NPC schedules/dialogue
4. Grade progression from 5th to 8th grade
5. Save/load, inventory, home building and decoration
6. Android packaging and performance profiles

This is an early playable vertical slice, not a finished commercial game. Models and environments are currently procedural blockout assets; replace and expand them with optimized Blender/glTF assets during production.
