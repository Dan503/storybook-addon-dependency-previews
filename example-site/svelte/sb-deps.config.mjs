import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config';

export default defineSbDepsConfig({
	// SvelteKit page files take no props, so a story generated for one has
	// nothing to show — and `+page.svelte` / `[categoryName]` are names no
	// template can put in front of `export function` anyway.
	scaffoldIgnore: ['src/routes/**']
});
