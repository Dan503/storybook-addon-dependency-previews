# CLAUDE.md

## Project Overview

Storybook Addon - Dependency Previews: a Storybook plugin that visualizes component dependency trees in both directions (built with / used by). Published as `storybook-addon-dependency-previews` on npm.

## Monorepo Structure

This is a **pnpm workspaces** monorepo with two main packages:

- `storybook-addon-package/` - The published addon (dual CJS/ESM)
- `example-site/` - Demo app showcasing the addon (TanStack React + Tailwind CSS)

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm (workspaces)
- **Build:** tsdown (addon), Vite (example-site)
- **Storybook:** v10
- **React:** v19 (example-site), v18+ (addon peer dep)
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint (flat config, TanStack config + Storybook plugin)
- **Formatting:** Prettier

## Key Commands

### Addon (`storybook-addon-package/`)

```sh
pnpm build        # Build addon (clean, tsdown, copy CSS, typecheck)
pnpm dev          # Watch mode (rebuilds on file changes)
pnpm typecheck    # Type-check both browser and CLI tsconfigs
```

### Example Site (`example-site/`)

```sh
pnpm dev          # Vite dev server on port 3000
pnpm test         # Run Vitest
pnpm lint         # ESLint
pnpm check        # Prettier + ESLint fix
pnpm sb           # Run Storybook with dependency watching (sb-deps --watch --run-storybook)
pnpm sb:build     # Generate deps then build static Storybook
pnpm sb:deps      # One-off dependency graph generation
```

## Code Style

- **No semicolons**
- **Single quotes**
- **Tabs** for indentation
- **Trailing commas** on all multiline
- ESM (`"type": "module"`) throughout

## Architecture Notes

- **Addon entry points:** `src/index.ts` (main), `src/manager.tsx` (Storybook manager UI), `src/preview.tsx` (decorators)
- **CLI tool:** `cli/sb-deps.ts` - uses dependency-cruiser to analyze and generate dependency graphs, outputs to `.storybook/dependency-previews.json`
- **CSS Modules:** `.module.css` files co-located with components, copied to `dist/` during build
- **Component organization (example-site):** Atomic design (01-atoms, 02-molecules, 03-organisms, 04-templates)
- **Addon has two tsconfigs:** one for browser code (`tsconfig.json`, ES2022/Bundler) and one for CLI/Node code (`cli/tsconfig.json`, NodeNext)

## Important Patterns

- The addon exports from three entry points: `.` (main), `./addon` (preset), `./cli/sb-deps` (CLI)
- The `sb-deps` CLI binary is provided via the `bin` field in package.json
- The example-site references the addon via `workspace:*`
- Dependency graph data is generated into `.storybook/dependency-previews.json` and imported in `.storybook/preview.tsx`
