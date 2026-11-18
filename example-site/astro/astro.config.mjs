// @ts-check
import { defineConfig } from 'astro/config'

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Astro only makes pages from a folder named `pages` inside this folder, and
  // that folder can't be renamed. Pointing this at the app layer puts the
  // routes in `src/1-app/pages`, so FSD's `src/2-pages` layer can hold the
  // page code without Astro turning each of its files into a page.
  srcDir: './src/1-app',

  integrations: [react()],
})