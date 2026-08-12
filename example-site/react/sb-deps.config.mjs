import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	// TanStack Router page files take no props, so a story generated for one
	// has nothing to show.
	scaffoldIgnore: ['src/routes/**'],
})
