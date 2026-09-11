import type { StorybookConfig } from '@storybook/preact-vite'

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
	// dist folder, which has no `preact` of its own because pnpm keeps each
	// workspace package's dependencies separate. The production build fails
	// there with "Could not load preact/compat". Listing `preact` here makes
	// Vite resolve it from this site's root instead, whichever file imports it.
	viteFinal: (config) => ({
		...config,
		resolve: {
			...config.resolve,
			dedupe: [...(config.resolve?.dedupe ?? []), 'preact'],
		},
	}),
}

export default config
