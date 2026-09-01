import type { StorybookConfig } from '@storybook/preact-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/preact-vite"
};
export default config;