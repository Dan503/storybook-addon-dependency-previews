import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	tsxFramework: 'preact',
	// A page takes no props, so a story generated for one has nothing to show.
	// The React site leaves its own router folder alone for the same reason.
	scaffoldIgnore: ['src/pages/**'],
})
