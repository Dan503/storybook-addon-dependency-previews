# Preact

The Preact demo site for `storybook-addon-dependency-previews`, built with [Preact](https://preactjs.com), [Vite](https://vitejs.dev) and [`preact-iso`](https://github.com/preactjs/preact-iso) for routing.

It shows the same meal-browsing site as the React, Svelte, Vue, Angular and Solid demos, drawing on the same shared data and utilities, so the addon can be seen working in a realistic project. The components themselves are this site's own — every demo keeps a framework-specific set under `src/components`, and that per-site tree is what the addon graphs.

## Developing

```bash
pnpm dev
```

Starts a dev server at http://localhost:5173.

```bash
pnpm sb
```

Starts Storybook, watching for new components and keeping the dependency graph up to date as they appear. `pnpm sb:deps` builds that graph once without starting Storybook.

## Building

```bash
pnpm build
```

Writes the site into `dist/`. Each page is written out as a finished HTML file, and the pages to write are found by reading the links in the ones already written — starting at the home page and at `/404`, which `vite.config.ts` names because nothing links to it.

That crawl is deliberately stopped before the individual meal pages. Left alone it would follow every meal link it found and ask the meal database for one meal at a time until it had fetched the lot. `checkShouldBuildPageAhead` in `src/index.tsx` is what stops it, and its comment carries the measured figure — kept in that one place, because it grows as the database does. Meal pages fetch their meal when opened instead, and `public/_redirects` tells a static host to serve the site for an address that has no file.

The home page is also left to fetch its own meals in the browser, because they are a random seven per visit and building them would hand the same seven to everyone.

```bash
pnpm preview
```

Serves the built site at http://localhost:4173.
