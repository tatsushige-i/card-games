# Card Games

A web app where you can play various card games.

> **Note:** This project was created as a practice exercise for [Claude Code](https://claude.ai/code). All coding is done by Claude Code, and humans are responsible only for review and feedback.

## Home Screen

- Displays available games in a card-style list
- Reads and shows best scores from localStorage for each game (hidden if unplayed)
- Best scores auto-refresh when returning from a game

## Games

### Concentration

A memory matching game where you flip cards to find pairs.

- 4x4 grid (8 pairs, 16 cards) card matching
- Cards with 3D flip animation
- Tracks number of attempts and elapsed time
- Best score saved to localStorage
- Completion dialog on game clear

### High & Low

A game where you guess whether the next playing card is higher or lower than the current one.

- Uses a standard 52-card deck (with suit and rank display)
- Starting score of 3 points; win at 10, lose at 0
- Ties result in a draw (score ±0)
- Cards stack horizontally during win streaks as a visual effect
- Best win streak saved

### Blackjack

A 1-on-1 card game: Player vs Dealer.

- Get your hand total as close to 21 as possible to beat the dealer
- A = 1 or 11 (auto-adjusted), J/Q/K = 10
- Choose to Hit (draw a card) or Stand (hold)
- Dealer automatically draws until reaching 17 or above
- Natural Blackjack (21 with initial 2 cards) is a special win
- Round-based: continue win streaks after each victory
- Best win streak saved

### Video Poker

A single-player Jacks or Better video poker game.

- 5 cards dealt from a 52-card deck
- Tap cards to Hold, then Draw to exchange
- Final hand evaluated for poker hands (Royal Flush to No Hand)
- 10-round format: earn points based on hand rank each round (intermediate rounds auto-advance)
- Pay table display with current hand highlighted
- Best total score saved

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS 4.x**
- **shadcn/ui** (Button, Dialog, Badge)
- **Vitest** + React Testing Library

## CI

GitHub Actions automatically runs the following on push to `main` and on PRs:

- **Lint** — `npm run lint`
- **Test** — `npm run test:run`
- **Build** — `npm run build`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint
npm run lint

# Run tests
npm run test:run

# Build
npm run build
```

## Claude Code Skills

This project uses [Claude Code](https://claude.ai/code) custom skills (slash commands).

| Command | Description |
|---------|-------------|
| `/add-game [game-name]` | Automates adding a new card game. Implements types, logic, tests, UI, and pages following existing patterns |
| `/refactor-game [game-name]` | Checks convention compliance for a specified game and refactors any violations |
| `/playground [game-name]` | Interactively operates a game's reducer to debug state transitions |
| `/pr [commit-message]` | Commits, pushes the feature branch, creates a PR, and deletes the local branch in one step |
| `/update-docs` | Verifies consistency between source code and docs (README.md, CLAUDE.md, architecture.md), updating as needed |

Skill definitions: `.claude/skills/<skill-name>/SKILL.md`

## Claude Code Agents

Specialized sub-agents defined for delegating specific tasks.

| Agent | Description |
|-------|-------------|
| `quality-checker` | Runs lint, tests, and build, reporting results only (fast and low-cost using the haiku model) |

Agent definitions: `.claude/agents/quality-checker.md`

## Project Structure

```
src/
├── app/
│   ├── blackjack/               # Blackjack page
│   ├── concentration/           # Concentration page
│   ├── high-and-low/            # High & Low page
│   ├── poker/                   # Video Poker page
│   ├── globals.css              # Theme, backgrounds, animations
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home (game selection)
├── components/
│   ├── ui/                      # shadcn/ui (auto-generated)
│   ├── home/                    # Home: game list & best score display
│   ├── concentration/           # Concentration: components
│   ├── high-and-low/            # High & Low: components
│   ├── blackjack/               # Blackjack: components
│   └── poker/                   # Video Poker: components
├── hooks/
│   ├── useConcentration.ts      # Concentration: game logic hook
│   ├── useHighAndLow.ts         # High & Low: game logic hook
│   ├── useBlackjack.ts          # Blackjack: game logic hook
│   └── usePoker.ts              # Video Poker: game logic hook
├── lib/
│   ├── concentration-cards.ts   # Concentration: card generation & shuffle
│   ├── concentration-reducer.ts # Concentration: Reducer
│   ├── concentration-storage.ts # Concentration: localStorage operations
│   ├── high-and-low-cards.ts    # High & Low: deck generation
│   ├── high-and-low-reducer.ts  # High & Low: Reducer
│   ├── high-and-low-storage.ts  # High & Low: localStorage operations
│   ├── blackjack-cards.ts       # Blackjack: deck & hand calculation
│   ├── blackjack-reducer.ts     # Blackjack: Reducer
│   ├── blackjack-storage.ts     # Blackjack: localStorage operations
│   ├── poker-cards.ts           # Video Poker: deck & hand evaluation
│   ├── poker-reducer.ts         # Video Poker: Reducer
│   ├── poker-storage.ts         # Video Poker: localStorage operations
│   └── utils.ts                 # shadcn cn()
├── types/
│   ├── concentration.ts         # Concentration: type definitions
│   ├── high-and-low.ts          # High & Low: type definitions
│   ├── blackjack.ts             # Blackjack: type definitions
│   └── poker.ts                 # Video Poker: type definitions
└── test/
    └── setup.ts                 # Test setup

.claude/
├── agents/                      # Claude Code sub-agents
│   └── quality-checker.md       # Quality check agent
├── rules/                       # Claude Code rule files
├── tasks/                       # Game requirement specs
└── skills/
    ├── add-game/SKILL.md        # Add game skill
    ├── playground/SKILL.md      # Reducer playground skill
    ├── refactor-game/SKILL.md   # Game refactoring skill
    ├── pr/SKILL.md              # PR creation skill
    └── update-docs/SKILL.md     # Doc sync skill
```

## Design

- **useReducer** for centralized game state management (each game has its own independent Reducer)
- **Fisher-Yates** algorithm for card shuffling
- **CSS 3D Transform** for card flipping (GPU-accelerated)
- **useSyncExternalStore** for subscribing to localStorage best scores
- Responsive design (mobile-friendly)
- Glassmorphism UI + gradient backgrounds
