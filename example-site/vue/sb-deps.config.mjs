import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	// Nuxt names its source root `app/` rather than `src/`. This is the only
	// example site that has to say so; the rest sit on the `src` default.
	srcDir: 'app',
	// Nuxt page files take no props, so a story generated for one has nothing to
	// show — and `[category]` is a name no template can put in front of
	// `export function` anyway. Same reason react and svelte ignore their own
	// router folders.
	scaffoldIgnore: ['app/pages/**'],
})
