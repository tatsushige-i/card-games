---
name: game-refactor
description: Checks convention compliance for specified game(s) (or all games) and refactors any violations found.
argument-hint: "[game-name (English kebab-case)]"
---

# Game Refactoring Skill

Inspects compliance with project conventions and fixes any violations found.

- **With argument**: Check only the specified game
- **Without argument**: Dynamically retrieve all games from `src/app/*/page.tsx` and check them sequentially

## Prerequisites

- The target game(s) must already be implemented

## Notation Rules

The following notation is used:

- `<game>` — the game name as-is (kebab-case, e.g., `high-and-low`)
- `<Game>` — the game name converted to PascalCase (e.g., `HighAndLow`)

## Execution Process

### Step 0: Branch preparation

1. Run `git pull` on the `main` branch to get the latest state
2. Create and switch to a branch:
   - With argument: `feature/refactor-$ARGUMENTS`
   - Without argument: `feature/refactor-all-games`

### Step 0.5: Determine target games

1. If `$ARGUMENTS` is specified, use that game name as the target
2. If `$ARGUMENTS` is empty, retrieve all game names from directory names of `src/app/*/page.tsx` (excluding the homepage `src/app/page.tsx`)
3. Present the target game list to the user

### Step 1: Load conventions

Load the following rule files and **dynamically build the check criteria**:

1. `.claude/rules/architecture.md` — understand file structure patterns, naming conventions, common patterns
2. `.claude/rules/conventions.md` — understand coding conventions, design requirements
3. `.claude/rules/pitfalls.md` — understand known pitfalls

These files are the **Single Source of Truth**. The check categories in Step 2 below are directional guidelines; specific check items must be derived from the content of the rule files above.

### Step 2: Convention checks

Based on the rules loaded in Step 1, inspect the specified game from the following perspectives and list any violations.

#### 2.1 File structure check

Verify the existence of required files and test files against the file structure defined in the "Game Addition Pattern" section of `architecture.md`.

#### 2.2 Naming convention check

Verify the following against naming conventions derived from the "Common Patterns" and "Game Addition Pattern" sections of `architecture.md`:

- Type names (`<Game>Phase`, `<Game>State`, etc.)
- Export names (`initial<Game>State`, `<game>Reducer`, etc.)
- Storage function names (`get<Game>BestScore`, etc.) and localStorage keys
- Hook names (`use<Game>`)
- Component names and file name prefixes

Determine specific required names by referencing the pattern definitions in `architecture.md` and implementations of existing convention-compliant games (e.g., `blackjack`).

#### 2.3 Pattern compliance check

Verify the following against patterns documented in the "Common Patterns" section of `architecture.md` and `pitfalls.md`:

- `"use client"` directive in Board components
- Server Component pages (no `"use client"`)
- `useSyncExternalStore` + cached snapshot pattern
- Other required patterns documented in rule files

#### 2.4 Home screen registration check

Verify registration requirements described in the "Home Screen Game Registration" section of `CLAUDE.md`.

#### 2.5 Comment language check

Verify that code comments are written in Japanese per the conventions in `conventions.md`.

**For multiple games**: Execute Steps 1–2 for each game sequentially and collect violations across all games.

### Step 3: Report violations and fix

1. Report all violations detected in Step 2 to the user as a list
   - For multiple games, group by game
2. If no violations are found, report "All conventions are met" and finish
3. If violations are found, fix them with the following approach:
   - File renames → use `git mv`
   - Type/export name renames → update both the definition and all reference sites
   - Import path updates → update all related files
   - Missing file creation → create following existing game patterns (e.g., `blackjack`)

### Step 4: Quality checks

After fixes, ensure all of the following pass:

```bash
npm run lint
npm run test
npm run build
```

If errors occur, fix them and repeat until all checks pass.

### Step 5: Completion report

Summarize detected violations and fixes, then report to the user. For multiple games, present a per-game results summary.
