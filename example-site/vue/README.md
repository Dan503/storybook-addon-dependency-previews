# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Type checking

```bash
pnpm typecheck
```

This runs `vue-tsc` over `.nuxt/tsconfig.app.json`, which covers the site's own code: everything under `app/`, plus every component those pages import. Story files are imported by nothing, so they are not covered — Storybook is what exercises those.

It deliberately does not use `nuxt typecheck`, which would also check `nuxt.config.ts`. Two copies of Vite end up in this workspace's dependencies, and the config file sits on the seam between them: `@tailwindcss/vite` resolves the newer one while Nuxt's own config types resolve the older one, so handing `tailwindcss()` to `vite.plugins` reports a mismatch between two structurally identical types. Nothing is actually wrong with the config, and putting it right would mean settling the whole workspace on one Vite version.

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
