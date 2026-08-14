# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Type checking

```bash
pnpm typecheck
```

This runs `vue-tsc` over `.nuxt/tsconfig.app.json`, which covers the site's own code: everything under `app/`, plus every component those pages reach through their imports. Anything reachable only from a story is left out, along with the story files themselves — Storybook is what exercises those.

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
