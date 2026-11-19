# About this site

## Why this site is structured differently

The other example sites organise their components with [atomic design](https://atomicdesign.bradfrost.com/chapter-2/) (atoms, molecules, organisms, templates). This site uses [Feature-Sliced Design](https://feature-sliced.design/) instead, on purpose, as an experiment to see how it compares to atomic design. It has the same components, the same pages and the same behaviour. Only the folder structure differs.

While working on projects using atomic design methodology, I kept running into three problems that were fundamental flaws in atomic design:

1. **Closely related components end up far apart.** Atomic design sorts components by size, so a list organism, the item molecules in it, and the image atom inside each list item go into three separate top-level folders, even though they only make sense together and usually change together. This makes keeping track of these components and making edits to them more difficult than it needs to be.

2. **Grouping by feature makes it inconsistent.** To avoid the first issue, the other sites group some components by feature instead. The card listing's organism and molecule share a `listings/card` folder, and the error message atom, molecule and organism share `forms/ErrorMessages`. But a common component like the button is still sorted by size into `01-atoms`. So you can't predict where a component lives without knowing which of the two rules it fell under.

3. **The line between an atom and a molecule is often a judgement call.** Small components made of more than one element don't fall cleanly on either side. `ExternalLinkAtom` (text plus an icon) is an atom, while `IconTextMolecule` (an icon plus text) is a molecule. They're nearly the same shape. And what if the value of a prop can change a single component from an atom to a molecule? does it get defined as an atom or a molecule? For example if we take a hard stance that text + icon = molecule, then we could have a link component that is just text when the url points internally (so the link is an atom) or text with an external icon attached when the href is external (so the link is a molecule)

Feature-Sliced Design sorts by what a component is for, not how big it is. Generic building blocks go in `shared/ui` once more than one part of the site uses them. Things about a meal live together in `entities/meal`. The contact form and everything only it uses, its button included, live in `pages/ContactPage/ContactForm`, because only the contact page uses them. Code stays in the folder of the one page that uses it, and only moves down a layer once something else needs it. Each layer may only import from the layers below it, so where something goes follows from what it depends on, not from counting its elements.

## Astro Starter Kit: Basics

```sh
pnpm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

### 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

### 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

### 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
