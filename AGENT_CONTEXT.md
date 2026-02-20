# Agent Context - Flow-State

## Project Identity
**Flow-State** is a minimalist flowchart builder with Apple-inspired aesthetics focusing on buttery smooth interactions and professional performance.

## Key Information
- **Primary Goal**: Create fluid, 60fps interactions for flowchart creation
- **Design Language**: Apple-inspired minimalism (clean, uncluttered, intuitive)
- **Performance Priority**: Smooth dragging, repositioning, multi-select, connections, zooming

## Tech Stack
```
Frontend: React 19 + TypeScript + Vite
Styling: styled-components (CSS-in-JS)
Flowchart: @xyflow/react (React Flow library)
Build: Vite 7.3.1 (fast dev server + optimized builds)
```

## File Structure
```
src/
├── App.tsx              # Main flowchart component
├── components/
│   ├── BlockNodes.tsx   # Individual node implementations
│   └── NodeLibrary.tsx  # Node palette/library
├── index.css           # Global Apple-inspired styles
└── main.tsx            # React entry point
```

## Design System
- **Colors**: Background #f5f5f7, Primary #007aff, Surface white with blur
- **Typography**: Apple system fonts with antialiasing
- **Borders**: 12px radius, subtle shadows
- **Animations**: 0.2s ease transitions

## Development
- `npm run dev` → Local development at localhost:5173
- Hot reload enabled via Vite
- ESLint for code quality

## Important Notes
- **No BJJ references** - this is Flow-State, not a martial arts app
- Focus on **progressive enhancement** - build core features solidly first
- Maintain **60fps performance** for all interactions
- Keep **Apple aesthetic standards** throughout UI