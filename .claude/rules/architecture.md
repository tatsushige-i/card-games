# Architecture

## Game Addition Pattern

Each game has an independent set of files with the following structure. Code is not shared between games (even small utilities like `shuffle` are duplicated per game).

```
src/
├── types/<game>.ts              — Type definitions (cards, state, actions, best score)
├── lib/<game>-cards.ts          — Card generation, shuffle, constants
├── lib/<game>-reducer.ts        — Pure Reducer (discriminated union actions)
├── lib/<game>-storage.ts        — localStorage best score persistence
├── lib/__tests__/<game>-*.ts    — Library tests
├── hooks/use<Game>.ts           — useReducer + useEffect + useSyncExternalStore
├── components/<game>/           — Game-specific components
│   ├── <game>-board.tsx         — Main client component (hook invocation)
│   ├── <game>-header.tsx        — Score, action buttons, back link
│   ├── ...other game-specific UI
│   └── __tests__/               — Component tests
└── app/<game>/page.tsx          — Route entry point (Server Component)
```

### Implementation Process

Implement in the following order. Refer to the corresponding files of existing games (`blackjack`, `high-and-low`, etc.) at each step.

#### Step 1: Requirements Gathering

Organize the game's functional requirements. If unclear, ask the user to clarify. Organize **only the requirements (what to build)**, not the design (how to build it).

#### Step 2: Design (Plan Mode)

Use EnterPlanMode to determine:

- Phase transition diagram (`idle` → ... → `gameOver`)
- State structure (`<Game>State` type)
- Action list (`<Game>Action` type)
- Best score criteria (`<Game>BestScore` type)
- Component tree
- File list

#### Step 3: Type Definitions

`src/types/<game>.ts` — Card type, Phase type (discriminated union), GameResult type, State type, Action type (discriminated union), BestScore type

#### Step 4: Card Utilities + Tests

`src/lib/<game>-cards.ts` — Card generation, shuffle (Fisher-Yates), game-specific calculation logic, constants, display helpers (`getCardLabel`, `SUIT_SYMBOLS`, `SUIT_COLORS`)

`src/lib/__tests__/<game>-cards.test.ts`

#### Step 5: Storage + Tests

`src/lib/<game>-storage.ts` — localStorage key `"<game>-best-score"`, `get/save/update<Game>BestScore()`, `typeof window === "undefined"` guard

`src/lib/__tests__/<game>-storage.test.ts` — localStorage mock pattern (`vi.fn()` + `Object.defineProperty`)

#### Step 6: Reducer + Tests

`src/lib/<game>-reducer.ts` — `initial<Game>State` constant, pure Reducer function (switch statement, discriminated union actions), phase transition logic

`src/lib/__tests__/<game>-reducer.test.ts`

#### Step 7: Custom Hook

`src/hooks/use<Game>.ts` — State management with `useReducer`, best score management with `useSyncExternalStore` (**cached snapshot required**), phase-based delayed processing with `useEffect` (`setTimeout`), phase transition detection and best score update with `prevPhaseRef`

#### Step 8: Components

Create under `src/components/<game>/`:

| File | Role |
|------|------|
| `<game>-board.tsx` | `"use client"`, hook invocation, overall integration |
| `<game>-header.tsx` | Score, Badge, action buttons, back link |
| `<game>-card.tsx` | Card display (3D flip CSS reuse) |
| `<game>-result.tsx` | Round result display |
| `<game>-game-over-dialog.tsx` | Game over dialog |
| Other game-specific UI | Add as needed |

Tests: under `src/components/<game>/__tests__/`

#### Step 9: Page

`src/app/<game>/page.tsx` — Server Component, renders `<Game>Board`

#### Step 10: Home Screen Registration

Update `src/components/home/game-list.tsx`: add entry to `games` array, add `format<Game>Best()` function, add case to `formatBestScore()` switch, add BestScore type import

#### Step 11: Quality Checks

Pass all of `npm run lint` / `npm run test` / `npm run build`

#### Step 12: Documentation Update

Follow the `/docs-sync` skill procedure to update README.md, CLAUDE.md, and architecture.md

### Common Patterns

- **State management**: `useReducer` + pure Reducer (discriminated union actions)
- **Delayed processing**: Implement result display delays with `setTimeout` inside `useEffect` (keyed on phase)
- **Best score persistence**: `useSyncExternalStore` + cached snapshot (see `pitfalls.md`)
- **localStorage key**: `"<game>-best-score"` naming convention
- **Home screen registration**: Add entry to the `games` array in `src/components/home/game-list.tsx`

## Routing

- `/` — Home (game selection screen, Server Component)
- `/concentration` — Concentration (Memory Match)
- `/high-and-low` — High & Low
- `/blackjack` — Blackjack
- `/poker` — Video Poker
- `/pyramid` — Pyramid
- `/golf` — Golf Solitaire
- `/spider` — Spider
- `/ten-play` — Ten Play
- `/tri-peaks` — Tri Peaks
- `/war` — War

## Games

### Concentration

A game where you flip cards to find matching pairs.

```
ConcentrationBoard → useConcentration
├── ConcentrationHeader (attempts, timer, pairs, best score)
├── ConcentrationCardGrid (4x4 grid)
│   └── ConcentrationCard (3D flip, accessibility label)
└── ConcentrationCompleteDialog
```

Key files: `src/types/concentration.ts`, `src/lib/concentration-reducer.ts`, `src/lib/concentration-cards.ts`, `src/lib/concentration-storage.ts`, `src/hooks/useConcentration.ts`

### High & Low

A game where you predict whether the next card is higher or lower than the current one. Starting score: 3 points, win at 10 points, lose at 0 points. Ties are a draw (±0). Cards stack horizontally during win streaks as a visual effect.

```
HighAndLowBoard → useHighAndLow
├── HighAndLowHeader (score, win streak, card count, best score)
├── HighAndLowCard (card display, suit coloring, 3D flip reuse)
├── HighAndLowResult (correct/incorrect/draw display)
└── HighAndLowGameOverDialog (win/lose)
```

Key files: `src/types/high-and-low.ts`, `src/lib/high-and-low-reducer.ts`, `src/lib/high-and-low-cards.ts`, `src/lib/high-and-low-storage.ts`, `src/hooks/useHighAndLow.ts`

### Blackjack

A 1-on-1 card game, player vs dealer. Get your hand total as close to 21 as possible. A=1 or 11 (auto-adjusted), J/Q/K=10. Round-based with continuous win streaks.

```
BlackjackBoard → useBlackjack
├── BlackjackHeader (win streak, round count, best score)
├── BlackjackHand (hand display, total value, hole card face-down)
│   └── BlackjackCard (card display, 3D flip reuse)
├── BlackjackResult (win/lose/draw/blackjack display)
└── BlackjackGameOverDialog (results/stats, next round/restart)
```

Key files: `src/types/blackjack.ts`, `src/lib/blackjack-reducer.ts`, `src/lib/blackjack-cards.ts`, `src/lib/blackjack-storage.ts`, `src/hooks/useBlackjack.ts`

### Video Poker

Jacks or Better style video poker. Deal 5 cards → select holds → exchange → hand evaluation. 10-round format competing for total score.

```
PokerBoard → usePoker
├── PokerHeader (round, score, best score, action buttons)
├── PokerPayTable (payout table, current hand highlight)
├── PokerHand (5 cards in a row)
│   └── PokerCard (3D flip, hold state visual)
├── PokerResult (large hand name display)
└── PokerGameOverDialog (final score, stats, new record display)
```

Key files: `src/types/poker.ts`, `src/lib/poker-reducer.ts`, `src/lib/poker-cards.ts`, `src/lib/poker-storage.ts`, `src/hooks/usePoker.ts`

### Pyramid

A solitaire game where 28 cards from a 52-card deck are arranged in a 7-row pyramid, and pairs summing to 13 are removed. K (value 13) can be removed alone. The stock pile can be recycled once. Timed (clear time is the best score).

```
PyramidBoard → usePyramid
├── PyramidHeader (time, removed count, best time)
├── PyramidGrid (7-row pyramid layout)
│   └── PyramidCardComponent (selected/exposed/invalid pair visual)
├── PyramidStockArea (stock pile, waste pile area)
└── PyramidGameOverDialog (cleared/stuck)
```

Key files: `src/types/pyramid.ts`, `src/lib/pyramid-reducer.ts`, `src/lib/pyramid-cards.ts`, `src/lib/pyramid-storage.ts`, `src/hooks/usePyramid.ts`

### Golf Solitaire

A solitaire where cards are drawn one at a time from the stock and removed from 7 columns by ±1 consecutive matches. No K→A wraparound. Best score is remaining card count (lower is better).

```
GolfBoard → useGolf
├── GolfHeader (remaining cards, timer, best score)
├── GolfColumns (7-column card layout)
│   └── GolfCard (selectable state visual)
├── GolfStockArea (stock pile, waste pile area)
└── GolfGameOverDialog (cleared/stuck)
```

Key files: `src/types/golf.ts`, `src/lib/golf-reducer.ts`, `src/lib/golf-cards.ts`, `src/lib/golf-storage.ts`, `src/hooks/useGolf.ts`

### Spider

A solitaire using 2 decks of 52 cards (104 cards) arranged in 10 columns. Complete 8 same-suit K→A sequences to win. 10 cards can be dealt from the stock at a time (all columns must have at least 1 card). Best score tracks fewest moves and fastest time independently.

```
SpiderBoard → useSpider
├── SpiderHeader (moves, completed sets, timer, stock count, best score)
├── SpiderColumns (10-column card layout)
│   └── SpiderCardComponent (selected/drag state visual)
├── SpiderStockArea (stock pile, deal button)
└── SpiderGameOverDialog (cleared/stuck, stats display)
```

Key files: `src/types/spider.ts`, `src/lib/spider-reducer.ts`, `src/lib/spider-cards.ts`, `src/lib/spider-storage.ts`, `src/hooks/useSpider.ts`

### Ten Play

A solitaire where cards placed in a 13-slot tableau (7+6 rows) are removed by selecting pairs that sum to 10. Clear by removing all cards. Best score is clear time (shorter is better).

```
TenPlayBoard → useTenPlay
├── TenPlayHeader (timer, removed count, remaining cards, stock count, best score)
├── TenPlayTableau (13 slots, 7+6 row layout)
│   └── TenPlayCard (selected/invalid state visual)
└── TenPlayGameOverDialog (cleared/stuck, stats display)
```

Key files: `src/types/ten-play.ts`, `src/lib/ten-play-reducer.ts`, `src/lib/ten-play-cards.ts`, `src/lib/ten-play-storage.ts`, `src/hooks/useTenPlay.ts`

### Tri Peaks

A solitaire where 28 cards are arranged in 3 pyramid shapes, and cards ±1 from the waste card are consecutively removed. K↔A wraparound enabled. Combo bonus on consecutive removals (adds 1, 2, 3...). Drawing from stock resets the combo. Best score is points (higher is better).

```
TriPeaksBoard → useTriPeaks
├── TriPeaksHeader (score, combo, timer, removed count, best score)
├── TriPeaksGrid (3 pyramid layout, 4 rows)
│   └── TriPeaksCard (face-up/face-down/removed state visual)
├── TriPeaksStockArea (stock pile, waste pile area)
└── TriPeaksGameOverDialog (cleared/stuck, final score)
```

Key files: `src/types/tri-peaks.ts`, `src/lib/tri-peaks-reducer.ts`, `src/lib/tri-peaks-cards.ts`, `src/lib/tri-peaks-storage.ts`, `src/hooks/useTriPeaks.ts`

### War

A game where 52 cards are equally distributed between player and CPU, and each round the top cards are compared — the higher card wins both. Ties trigger a war (3 face-down cards + 1 face-up card per side). The game ends when either deck is empty. Best score is round count on player victory (fewer is better).

```
WarBoard → useWar
├── WarHeader (round count, player card count, CPU card count, best score)
├── WarBattleField (battle area, deck display, war piles)
│   └── WarCardComponent (player/CPU card display)
├── WarResult (round result display: win/lose/war)
└── WarGameOverDialog (final winner, round stats)
```

Key files: `src/types/war.ts`, `src/lib/war-reducer.ts`, `src/lib/war-cards.ts`, `src/lib/war-storage.ts`, `src/hooks/useWar.ts`

## Shared Resources

- `src/app/page.tsx` — Home page (manages game list with `games` array)
- `src/app/globals.css` — Shared CSS: `.game-background` (3-layer gradient background), `.glass` (glassmorphism), `.card-container` / `.card-inner` / `.card-face` / `.card-back` (3D card flip), `.celebrate` (victory animation)
- `src/components/ui/` — shadcn/ui components (Button, Dialog, Badge)
- `src/lib/utils.ts` — `cn()` utility
