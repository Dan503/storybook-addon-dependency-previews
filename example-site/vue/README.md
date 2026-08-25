# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Type checking

```bash
pnpm typecheck
```

This runs `vue-tsc` over the project Nuxt generates, which covers the site's own code: everything under `app/`, plus every component those pages reach through their imports, plus the `components/` folder — which is where the story files live, along with the few components only a story uses.

Nuxt would not read `components/` on its own, because it only reads the folders it builds from. `nuxt.config.ts` names the folder so that it does.

**There are two scripts, and the difference is whether the addon gets built first.** Every story imports a type from `storybook-addon-dependency-previews`, and that package's types only exist once it has been built into its `dist/` folder — which the repository does not carry, and which `pnpm install` does not produce. So `pnpm typecheck` builds the addon and then checks, which is what you want on a fresh clone and what `sb:build` already does for the same reason. `pnpm typecheck:quick` skips the build and checks straight away, for when the addon is known to be built already.

Four components are written with `generic="..."`, which compiles to a generic function, and `Meta`'s `component` field only accepts a concrete component — a disagreement between two type systems rather than a fault in the code, which is why they work at runtime. `TextAreaMolecule`, `TextFieldMolecule`, `FormDataMolecule` and `FormDataPreviewAtom` each carry a marker in their story saying that one line is expected to fail. Every other line of those files is checked as normal, and TypeScript reports the marker itself once Storybook can type these components, so none of the four can outlive its reason.

`.storybook/` is outside it, and is left that way on purpose: `preview.ts` imports a dependency graph that `sb-deps` generates and the repository does not carry, so including it would stop this running on a fresh clone. The addresses lose nothing by it — the stand-in router takes them from `example-site-shared`, where they are checked already. `main.ts` and `preview.ts` themselves go unchecked, as they were before.

The example cards the stories draw from are assembled in `app/lib/storyExampleCards.ts` rather than in the stories, so that a card whose address stops matching the card component is caught in one place rather than in each story that happens to use it.

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
