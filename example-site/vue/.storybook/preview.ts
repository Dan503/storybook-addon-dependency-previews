import {
  defaultPreviewParameters,
  dependencyPreviewDecorators,
} from 'storybook-addon-dependency-previews';

import dependenciesJson from './dependency-previews.json';

import type { Preview } from '@storybook/vue3-vite';

const preview: Preview = {
  decorators: [...dependencyPreviewDecorators],
  parameters: {
    ...defaultPreviewParameters,
    dependencyPreviews: {
      dependenciesJson,
      projectRootPath: new URL('..', import.meta.url).pathname,
      storyModules: import.meta.glob(
        '/src/**/*.stories.{tsx,ts,jsx,js,svelte}',
        { eager: false },
      ),
      sourceRootUrl: 'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/vue',
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;
