# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Type checking

```bash
pnpm typecheck
```

This runs `vue-tsc` over `tsconfig.typecheck.json`, which covers the site's own code: everything under `app/`, every component those pages reach through their imports, and `.storybook/routePatterns.ts` — the last of those because the addresses the stand-in router uses come from the shared list, so something has to read them.

That one file is named rather than the whole `.storybook` folder, so that a fresh clone can run this before anyone has run Storybook: its neighbour `preview.ts` imports a dependency graph that `sb-deps` generates and the repository does not carry. (The config itself holds no comments, so that anything reading it with a plain JSON parser can. TypeScript accepts them — several tsconfigs here carry them — so this one is the exception rather than the rule, and its explanation lives here instead.)

Story files themselves are left out, and so is any component only a story reaches. That is not only to keep them cheap: Storybook's `Meta` does not line up with the four components here that take a type parameter, a pre-existing disagreement that has nothing to do with the code under test. Storybook is what exercises those.

Everything under `app/` is checked whoever uses it, though, which is why the example cards the stories draw from are assembled in `app/lib/storyExampleCards.ts` rather than in the stories — a card whose address stops matching the card component is caught there instead of going unnoticed in a story.

It deliberately does not use `nuxt typecheck`, which would also check `nuxt.config.ts` and report an error there that says nothing about the config being wrong. This workspace ends up with more than one copy of Vite installed, and that file is where two of them meet: `@tailwindcss/vite` is built against a newer copy than the one Nuxt's own config types are built against, so handing `tailwindcss()` to `vite.plugins` is reported as a type mismatch. The two really do differ — each Vite carries its own copy of Rollup, and the newer Rollup added a field to the shape describing a module — but nothing about it stops the config working. Putting it right would mean settling the whole workspace on one Vite version, which is a change of its own.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
