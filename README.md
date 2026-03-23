**Language:** English | [日本語](docs/ja-JP/README.md)

# Card Games

A web app where you can play various card games.

> **Note:** This project was created as a practice exercise for [Claude Code](https://claude.ai/code). All coding is done by Claude Code, and humans are responsible only for review and feedback.

## Games

Concentration / High & Low / Blackjack / Video Poker / Pyramid / Golf Solitaire / Spider / Ten Play / Tri Peaks / War

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Vitest

## Setup

```bash
npm install
npm run dev
```

## Claude Code Setup

This project shares Claude Code configuration (rules, skills, hooks) from [shared-claude-code](https://github.com/tatsushige-i/shared-claude-code).

After cloning, sync the shared config by running the following slash command in Claude Code:

```
/config-claude-sync
```

This syncs:
- **Rules** — `.claude/rules/shared/` (symlinks to shared rule files)
- **Skills** — `.claude/skills/` (symlinks to shared skill directories)
- **Hooks** — `.claude/settings.json` (shared hook commands)

## Docs

- [Architecture](.claude/rules/architecture.md) — Game structure, routing, component trees
- [Conventions](.claude/rules/conventions.md) — Coding rules, design requirements, workflow
- [CLAUDE.md](CLAUDE.md) — Commands, skills, agents
