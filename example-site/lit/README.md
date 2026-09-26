# Lit

The Lit demo site for `storybook-addon-dependency-previews`, built with [Lit](https://lit.dev) and [Vite](https://vitejs.dev).

It shows the same meal-browsing site as the other demos, drawing on the same shared data and utilities, so the addon can be seen working in a realistic project. The components themselves are this site's own, under `src/components`, and that tree is what the addon graphs.

**The pages are still to come.** For now the site draws its header and footer with a note in the middle, and the components are in Storybook. The contact form and the pages arrive in later pull requests.

## How it differs from the other demos

**Every component is a Lit element** in a `Name.lit.ts` file, registering a tag such as `app-button-atom`. The `.lit` part is what marks a file as a component, which `sb-deps.config.js` sets, so a plain helper such as `icons/iconSvg.ts` is not given a story.

**The components were translated from the Svelte demo**, because a Svelte component and a Lit one are shaped alike: one file holding the markup, the properties and the styles that belong to it, with whatever it wraps arriving through a slot. Addresses are the exception. They are written with a colon, `/meal/:mealId`, the way Lit's router matches them, so they follow the Preact demo instead.

**It does not use Tailwind.** Each Lit element draws into a shadow root, the element's own private area of the page, and a stylesheet loaded for the page does not reach inside one. So each component carries its own CSS in `static styles`, written out from the Tailwind classes on the Svelte original with the values taken from Tailwind's theme, so the look matches. Two things are shared instead of repeated:

- `src/app.css` declares the colours as CSS custom properties, because those do reach inside.
- `src/lib/baseStyles.ts` holds the handful of Tailwind's base rules the components rely on, such as removing the browser's default margins. A component that draws headings, paragraphs, lists, links, pictures or buttons lists it first.

**Its conventions come from Lit's own starter project**: the `override` keyword on `styles` and `render`, a tag-name declaration under each component, and doc comments on each class that name its slots.

## Developing

```bash
pnpm dev
```

Starts a dev server at http://localhost:5173.

```bash
pnpm sb
```

Starts Storybook, watching for new components and keeping the dependency graph up to date as they appear. `pnpm sb:deps` builds that graph once without starting Storybook.

Before Storybook starts, `pnpm sb:docs` reads the doc comments on every component and writes `custom-elements.json`, which lets a component's docs page list its properties and slots. It is generated, so git ignores it.

## Checking

```bash
pnpm check
```

Runs the type check, then `lit-analyzer`, which checks the markup inside each component's `html` template. The type check cannot see into those templates.

## Building

```bash
pnpm build
```

Writes the site into `dist/`.

```bash
pnpm preview
```

Serves the built site at http://localhost:4173.
