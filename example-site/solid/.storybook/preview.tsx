import {
  defaultPreviewParameters,
  dependencyPreviewDecorators,
} from 'storybook-addon-dependency-previews'

import dependenciesJson from './dependency-previews.json'

import type { Preview } from 'storybook-solidjs-vite'

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
      sourceRootUrl: 'https://github.com/Dan503/storybook-addon-dependency-previews/blob/main/example-site/solid',
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;