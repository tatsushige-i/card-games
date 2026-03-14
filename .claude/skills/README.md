# Skills

Custom slash commands for Claude Code, defined in `.claude/skills/`. Each skill automates a specific project workflow.

## Available Skills

### `/add-game [game-name]`

Adds a new card game to the project. Follows the existing architecture pattern to implement type definitions, logic, tests, UI components, and page routing in a consistent manner.

- **Argument**: Game name in English kebab-case (e.g., `solitaire`)

### `/playground [game-name]`

Interactively operates a game's reducer to debug state transitions. Simulates actions in real-time without modifying any files.

- **Argument**: Game name in English kebab-case (e.g., `concentration`)

### `/refactor-game [game-name]`

Audits a specified game for adherence to project conventions and automatically refactors any violations found (naming, file structure, patterns).

- **Argument**: Game name in English kebab-case (e.g., `blackjack`)

### `/start-issue [issue-number]`

Fetches a GitHub Issue, determines the branch prefix based on labels (`bug` → `fix/`, `enhancement` → `feature/`, `documentation` → `docs/`), pulls the latest main, and creates the feature branch.

- **Argument**: GitHub Issue number (e.g., `42`)

### `/pr [commit-message]`

Commits all changes, pushes the feature branch, and creates a GitHub PR. Auto-generates a commit message if omitted.

- **Argument** (optional): Commit message

### `/review-respond [pr-number]`

Retrieves PR review comments, determines whether each requires action, applies code fixes, runs quality checks, pushes changes, and replies to all comments.

- **Argument** (optional): PR number (defaults to current branch's PR)

### `/post-merge`

Cleans up after a PR merge: deletes the local feature branch and updates main to the latest.

### `/update-docs`

Verifies consistency between source code and documentation (README.md, CLAUDE.md, architecture.md), then updates any outdated sections.
