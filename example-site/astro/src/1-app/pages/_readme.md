This folder contains Astro's routes.

Astro only makes pages from a folder named `pages` inside its source folder, and it doesn't allow that folder to be renamed. `astro.config.mjs` sets the source folder to `src/1-app`, so that the routes belong to the app layer.

Each file here only sets a page's address, wraps the page in `BaseLayout` and calls that page's component from the FSD page layer in `src/2-pages`. The page code, along with any blocks only that page uses, lives there, and Astro never turns those files into pages. `BaseLayout` is applied here rather than inside the page components because it lives in this app layer, and lower layers can't import from it.

The meal route is the exception: it also fetches the meal, because only a route file can send the visitor to the 404 page when the meal doesn't exist.

The `_` at the start of this file's name stops Astro serving it as a page.
