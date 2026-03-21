---
name: game-debug
description: Interactively operate a game's reducer and debug state transitions.
argument-hint: "[game-name (English kebab-case)]"
---

# Reducer Playground Skill

A debugging tool that interactively operates the reducer of the game specified by `$ARGUMENTS` and inspects state transitions.

## Notation Rules

The following notation is used:

- `<game>` — the game name as-is from the argument (kebab-case, e.g., `high-and-low`)
- `<Game>` — the game name converted to PascalCase (e.g., `HighAndLow`)

## Step 1: Identify game and load files

Identify the game name from `$ARGUMENTS` and load the following files:

| File | Purpose |
|------|---------|
| `src/types/<game>.ts` | State type, Action type, Phase type |
| `src/lib/<game>-reducer.ts` | `<game>Reducer` function, `initial<Game>State` |
| `src/lib/<game>-cards.ts` | `createDeck()` / `createCards()`, utilities |

### Supported games and export names

| Game | reducer | initialState | deck generation |
|------|---------|-------------|-----------------|
| concentration | `concentrationReducer` | `initialConcentrationState` | `createCards()` |
| high-and-low | `highAndLowReducer` | `initialHighAndLowState` | `createDeck()` |
| blackjack | `blackjackReducer` | `initialBlackjackState` | `createDeck()` |
| poker | `pokerReducer` | `initialPokerState` | `createDeck()` |
| golf | `golfReducer` | `initialGolfState` | `createDeck()` |
| pyramid | `pyramidReducer` | `initialPyramidState` | `createDeck()` |
| spider | `spiderReducer` | `initialSpiderState` | `createDeck()` |

If the specified game is not in the list above, display an error and exit.

## Step 2: Display initial state

1. Format and display the contents of `initial<Game>State`
2. Read the Action type from `src/types/<game>.ts` and display the list of available actions
3. Prompt the user for command input

Display example:

```
🎮 Poker Playground
━━━━━━━━━━━━━━━━━━━━━━━

📋 Current state:
  phase: "idle"
  hand: []
  deck: []
  round: 0
  score: 0
  ...

🎯 Available actions:
  START_GAME    — { deck: PlayingCard[] }
  DEAL_COMPLETE
  TOGGLE_HOLD   — { index: number }
  DRAW
  DRAW_COMPLETE
  SHOW_RESULT
  SET_NEW_BEST  — { isNewBest: boolean }
  NEXT_ROUND
  DISMISS_DIALOG
  RESET

💡 Commands: dispatch / state / set / trace / reset / help
```

## Step 3: Interactive loop

Wait for user input and process the following commands. After each command execution, prompt for the next input using `AskUserQuestion`.

### Command reference

#### `dispatch [ACTION]` or `d [ACTION]`

Apply an action to the reducer and display **only the changed fields** as a diff.

- If the action requires a payload (e.g., `START_GAME` requires `deck`), auto-generate appropriate default values based on the reducer's type definition
  - `deck` / `cards` — generated with `createDeck()` / `createCards()`
  - `index` — defaults to `0`
  - `guess` — defaults to `"high"`
  - `isNewBest` — defaults to `false`
- If the user explicitly specifies a payload, that takes priority (e.g., `dispatch TOGGLE_HOLD index=2`)
- Action names are case-insensitive (`start_game` and `START_GAME` are both accepted)

Display example:

```
⚡ dispatch START_GAME

📋 State changes:
  phase: "idle" → "dealing"
  deck: [] → [52 cards]
  hand: [] → [♠A, ♥K, ♦10, ♣5, ♠7]
  round: 0 → 1
```

#### `state` or `s`

Format and display the entire current state. For arrays, show the element count and first few items.

#### `set [field] [value]`

Directly modify a specific field of the state. Use dot notation for nested fields.

Examples:
- `set phase "result"` — directly change phase
- `set score 100` — change score
- `set round 5` — change round

Display the changed field after modification.

#### `trace` or `t`

Display the action history and phase transitions in chronological order.

Display example:

```
📜 Action history:
  1. START_GAME    → phase: idle → dealing
  2. DEAL_COMPLETE → phase: dealing → holding
  3. TOGGLE_HOLD(index=0)
  4. TOGGLE_HOLD(index=2)
  5. DRAW          → phase: holding → drawing
```

#### `reset` or `r`

Reset the state to `initial<Game>State` and clear the action history.

#### `help` or `h`

Display the command reference and usage instructions.

### Interaction implementation

After each command execution, use `AskUserQuestion` to prompt the user for the next command. Present the main actions (candidates for `dispatch`) as choices, with an "Other" option for free-form command input.

## Important Constraints

- **Do not modify any files** — this skill is a read-only debugging tool
- **All state is managed within the skill's descriptive text** — no actual code execution
- Read the reducer's type definitions and logic, and Claude **simulates** the reducer's behavior
- State transition accuracy must faithfully follow the reducer code
