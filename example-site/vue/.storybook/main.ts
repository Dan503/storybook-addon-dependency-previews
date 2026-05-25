import type { StorybookConfig } from '@storybook-vue/nuxt';

const config: StorybookConfig = {
  "stories": [
    "../components/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  "addons": [],
  "framework": "@storybook-vue/nuxt"
};
export default config;