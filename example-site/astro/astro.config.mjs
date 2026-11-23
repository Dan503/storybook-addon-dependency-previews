// @ts-check
import { defineConfig } from 'astro/config'

import netlify from '@astrojs/netlify'
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Astro only makes pages from a folder named `pages` inside this folder, and
  // that folder can't be renamed. Pointing this at the app layer puts the
  // routes in `src/1-app/pages`, so FSD's `src/2-pages` layer can hold the
  // page code without Astro turning each of its files into a page.
  srcDir: './src/1-app',

  integrations: [react()],

  // The meal, category and 404 pages are built on request, which needs a
  // server. This runs them on Netlify, where the other example sites are hosted.
  adapter: netlify({
    devFeatures: {
      environmentVariables: false,
      images: true,
      // The site has no edge functions, and the Deno server that runs them
      // in `astro dev` fails to start: Netlify passes `deno eval` a
      // `--allow-scripts` flag that Deno 2.9.7 rejects. Turn this back on if
      // the site gains a `netlify/edge-functions` folder.
      edgeFunctions: false,
    },
  }),
})