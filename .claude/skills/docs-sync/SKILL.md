---
name: docs-sync
description: Verifies consistency between source code and documentation (README.md, CLAUDE.md, architecture.md), updating any discrepancies found.
---

# Documentation Sync Skill

Scans the source code state and verifies/updates consistency with three documentation files.

## Target Documents

1. `README.md`
2. `CLAUDE.md`
3. `.claude/rules/architecture.md`

## Execution Process

### Step 1: Scan the source code state

Investigate the following to understand the current project state:

1. **Game list**: Use Glob to find `src/app/*/page.tsx` and check the routing list of included games
2. **Component structure**: Check directories and files under `src/components/*/`
3. **Types, libraries, hooks**: Check actual files in `src/types/*.ts`, `src/lib/*.ts`, `src/hooks/*.ts`
4. **Skill list**: Use Glob to find `.claude/skills/*/SKILL.md` and read the `name` and `description` of each skill
5. **Agent list**: Use Glob to find `.claude/agents/*.md`
6. **Home screen registration**: Read the `games` array in `src/components/home/game-list.tsx`

### Step 2: Detect differences against each document

Compare the state identified in Step 1 with the contents of each document. Focus on the following sections:

#### README.md
- "Games" section — missing or extra games
- "Claude Code Skills" table — missing or extra skills
- "Claude Code Agents" table — missing or extra agents
- "Project Structure" tree — missing or extra files/directories

#### CLAUDE.md
- "Skills" section — missing or extra skills
- "Agents" section — missing or extra agents

#### .claude/rules/architecture.md
- "Routing" section — missing or extra routes
- "Games" section — missing or extra games, accuracy of component trees
- "Skills" table — missing or extra skills
- "Agents" table — missing or extra agents

### Step 3: Report differences and update

1. Report all detected differences to the user as a list
2. If no differences are found, report "All documents are up to date" and finish
3. If differences are found, update each document

### Step 4: Report update results

Summarize the updated files and changes, then report to the user.

## Notes

- This skill **only updates documentation**. It does not modify source code
- Maintain the existing document style and format
- Read game descriptions and feature details from `.claude/tasks/<game>.md` or source code
