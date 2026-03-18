# Skills

Custom slash commands for Claude Code, defined in `.claude/skills/`. Each skill automates a specific project workflow.

## Naming Convention

- Format: `<category>-[<object>-]<verb>`
- Categories: `game` (game development), `git` (Git workflow), `docs` (documentation)
- Characters: lowercase, digits, hyphens only (max 64 chars)

## Available Skills

### `/docs-sync`

Verifies consistency between source code and documentation (README.md, CLAUDE.md, architecture.md), then updates any outdated sections.

### `/game-debug [game-name]`

Interactively operates a game's reducer to debug state transitions. Simulates actions in real-time without modifying any files.

- **Argument**: Game name in English kebab-case (e.g., `concentration`)

### `/game-refactor [game-name]`

Audits a specified game for adherence to project conventions and automatically refactors any violations found (naming, file structure, patterns).

- **Argument**: Game name in English kebab-case (e.g., `blackjack`)

### `/git-branch-cleanup`

Cleans up after a PR merge: deletes the local feature branch and updates main to the latest.

### `/git-issue-start [issue-number]`

Fetches a GitHub Issue, determines the branch prefix based on labels (`bug` → `fix/`, `enhancement` → `feature/`, `documentation` → `docs/`), pulls the latest main, and creates the feature branch. For game-addition issues, also starts the implementation following the architecture patterns.

- **Argument**: GitHub Issue number (e.g., `42`)

### `/git-pr-create [commit-message]`

Commits all changes, pushes the feature branch, and creates a GitHub PR. Auto-generates a commit message if omitted.

- **Argument** (optional): Commit message

### `/git-review-respond [pr-number]`

Retrieves PR review comments, determines whether each requires action, applies code fixes, runs quality checks, pushes changes, and replies to all comments.

- **Argument** (optional): PR number (defaults to current branch's PR)
