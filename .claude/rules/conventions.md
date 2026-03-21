# Project-Specific Conventions

## Documentation Management

- Consolidate design patterns in `.claude/rules/architecture.md`
- **Keep README.md concise** (delegate details to documents under `.claude/rules/`)
  - Include: project overview, game list (names only), Tech Stack (one line), Setup commands, links to detailed documentation
  - Exclude: detailed game specs, directory structure, design patterns, skill/agent lists (all already documented in `.claude/rules/` or `CLAUDE.md`)

## Design Requirements (Apple-Style Design System)

- **Glassmorphism UI**: Semi-transparent with backdrop-blur effects
- **Gradient elements**: 8-color theme color system (kept to a minimum)
- **Micro-interactions**: Hover and click animations
- **Multi-layer backgrounds**: Beautiful 3-layer gradient backgrounds
- **Responsive design**: Mobile-first approach
- **60fps animations**: Smooth and meaningful motion
- **Readable UI**: Text and background color contrast meeting WCAG standards
- **Apple Human Interface Guidelines** compliance
- **Core Web Vitals** optimization required

## Infrastructure Constraints

- **No database** (use localStorage)

## Code

- **All code comments must be written in Japanese**
- **Light mode only** — dark mode not supported
- shadcn/ui components: Button, Dialog, Badge (style: "new-york")
- Tailwind CSS 4.x format: `@import "tailwindcss"`, `@theme inline` block
- Path alias: `@/*` → `./src/*`
- Test files placed alongside source: `src/lib/__tests__/`, `src/components/__tests__/`
- Vitest config: jsdom environment, globals enabled, `@testing-library/jest-dom` matchers (configured in `src/test/setup.ts`)
- ESLint: flat config (v9+), `eslint-config-next/core-web-vitals` + `/typescript`

## Skill Categories

In addition to the shared naming conventions (`shared/conventions.md`), this project uses the following categories:

- `game` (game development)
- `git` (Git workflows)
- `docs` (documentation management)

## Implementation Workflow (Fixed Process)

1. Understand the requirements
2. Set up ESLint
3. Design
4. Implement
5. Write tests
6. Refactor
7. Verify all quality checks pass
8. Summarize specs in README.md
