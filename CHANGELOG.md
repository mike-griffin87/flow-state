# Changelog

All notable changes to Flow-State will be documented in this file.

## [Unreleased]

### Fixed
- Connection cursor issue: Added proper cursor state management during connection dragging
- Crosshair cursor now properly maintained throughout entire connection process
- Connection detection no longer interferes with cursor state
- Fixed overlapping handles causing connection drop conflicts
- Arrow direction now correctly points at target node (A → B instead of A ← B)

### Technical
- Added `isConnecting` state to track connection dragging
- Implemented `onConnectStart` and `onConnectEnd` handlers
- Enhanced FlowContainer with conditional cursor styling during connections
- Removed duplicate target handles to prevent connection conflicts
- Changed arrow marker from `markerStart` to `markerEnd` for correct direction

## [0.1.0] - 2026-02-20

### Added
- Initial Flow-State flowchart builder implementation
- Apple-inspired minimal design system
- React + TypeScript + Vite foundation
- @xyflow/react integration for flowchart functionality
- Smooth drag, drop, and zoom interactions
- Basic node library and block nodes components
- Project documentation and setup files
- Git repository initialized and connected to GitHub

### Changed
- Removed BJJ references from project documentation
- Updated project title to Flow-State throughout codebase

### Technical
- React 19.2.0 with TypeScript support
- Vite 7.3.1 for development and build tooling
- styled-components for CSS-in-JS styling
- ESLint configuration for code quality