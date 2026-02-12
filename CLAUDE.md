# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — ESLint (Next.js core-web-vitals + TypeScript rules)
- `npm run test:run` — Run all tests once
- `npm run test` — Run tests in watch mode
- Single test: `npx vitest run src/lib/__tests__/cards.test.ts`

## Architecture

Memory card matching game (神経衰弱) built with Next.js App Router + TypeScript.

### State Management

Uses a **useReducer pattern** with a pure reducer (`src/lib/game-reducer.ts`). The `useGame` hook (`src/hooks/useGame.ts`) orchestrates:

- `gameReducer` — Pure state transitions via discriminated union actions: `START_GAME`, `FLIP_CARD`, `CHECK_MATCH`, `TICK`, `SET_NEW_BEST`, `RESET`
- Timer — `setInterval` dispatching `TICK` every second, managed via `useEffect` keyed on `phase`
- Match delay — 800ms `setTimeout` after 2 cards flipped before `CHECK_MATCH`
- Best score persistence — `useSyncExternalStore` with a **cached snapshot** of localStorage (critical: `getSnapshot` must return stable references to avoid infinite re-render loops)

### Component Hierarchy

```
GameBoard (client component, calls useGame)
├── GameHeader (score, timer, best score, control buttons)
├── CardGrid (4x4 grid, conditionally rendered when phase !== "idle")
│   └── GameCard (3D flip animation, accessibility labels)
└── GameCompleteDialog (shadcn Dialog, shown on phase === "complete")
```

### Key Files

- `src/types/game.ts` — All type definitions (`Card`, `GameState`, `GameAction`, `BestScore`)
- `src/lib/cards.ts` — Card generation with Fisher-Yates shuffle
- `src/lib/storage.ts` — localStorage read/write for best scores
- `src/app/globals.css` — Custom CSS classes for glassmorphism (`.glass`), 3D card flip (`.card-inner`, `.card-face`, `.card-back`), and gradient background (`.game-background`)

## Conventions

- **All code comments must be in Japanese** (project requirement from TASK.md)
- **Light mode only** — no dark mode support
- shadcn/ui components: Button, Dialog, Badge (style: "new-york")
- Tailwind CSS 4.x format: `@import "tailwindcss"`, `@theme inline` blocks
- Path alias: `@/*` → `./src/*`
- Test files live alongside source: `src/lib/__tests__/`, `src/components/__tests__/`
- Vitest config: jsdom environment, globals enabled, `@testing-library/jest-dom` matchers via `src/test/setup.ts`
- ESLint: flat config (v9+), `eslint-config-next/core-web-vitals` + `/typescript`

## Known Pitfalls

- `useSyncExternalStore`'s `getSnapshot` must return a cached object reference. Calling `JSON.parse` directly creates new references each render, causing infinite loops.
- The strict React hooks ESLint rules forbid accessing refs during render and calling `setState` directly in effects. Use `dispatch` to the reducer instead for state visible in render.
