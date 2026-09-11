import type { StorybookConfig } from '@storybook/preact-vite'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
	addons: [
		'@chromatic-com/storybook',
		'storybook-addon-dependency-previews/addon',
	],
	framework: '@storybook/preact-vite',
	// The site header draws the logo from here, and the document head takes its
	// icons from here too.
	staticDirs: ['../public'],
	// The addon's preview code imports `react`, and the Preact preset (picked up
	// from vite.config.ts) rewrites that to `preact/compat`. Vite then looks for
	// `preact/compat` starting from the file that imported it — the addon's
	// dist folder. pnpm gives every installed package its own isolated set of
	// dependencies, so that folder has `react` beside it but no `preact`, and
	// the production build fails there with "Could not load preact/compat".
	// (The same goes for any package of the addon's that imports `react`, and
	// for anyone installing the addon into a Preact project with pnpm.) Listing
	// `preact` here makes Vite resolve it from this site's root instead,
	// whichever file imports it.
	viteFinal: (config) =>
		mergeConfig(config, { resolve: { dedupe: ['preact'] } }),
}

export default config
