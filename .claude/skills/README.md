# Skills

Custom slash commands for Claude Code, defined in `.claude/skills/`. Each skill automates a specific project workflow.

## Project-Specific Skills

### `/docs-sync`

Verifies consistency between source code and documentation (README.md, CLAUDE.md, architecture.md), then updates any outdated sections.

### `/game-debug [game-name]`

Interactively operates a game's reducer to debug state transitions. Simulates actions in real-time without modifying any files.

- **Argument**: Game name in English kebab-case (e.g., `concentration`)

### `/game-refactor [game-name]`

Audits games for adherence to project conventions and automatically refactors any violations found (naming, file structure, patterns). Without arguments, checks all games.

- **Argument** (optional): Game name in English kebab-case (e.g., `blackjack`). If omitted, all games are checked.

## Shared Skills (symlinks → shared-claude-rules)

- `/git-branch-cleanup` — Cleans up after a PR merge
- `/git-issue-start [issue-number]` — Fetches a GitHub Issue and creates a feature branch
- `/git-pr-create [commit-message]` — Commits, pushes, and creates a PR
- `/git-review-respond [pr-number]` — Handles PR review comments end-to-end
