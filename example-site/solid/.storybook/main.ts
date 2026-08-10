import type { StorybookConfig } from 'storybook-solidjs-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "storybook-addon-dependency-previews/addon",
  ],
  "framework": "storybook-solidjs-vite",
  // The project's own vite.config.ts only registers Tailwind inside the Vitest
  // "storybook" test project, so the dev/build server never gets it. Without the
  // plugin, `@import "tailwindcss"` in app.css still delivers the theme and the
  // base reset, but no utility classes are ever generated — components render
  // completely unstyled.
  viteFinal: async (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
    }),
};
export default config;