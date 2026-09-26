import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	// Only `Name.lit.ts` is a component, so a plain helper such as
	// `icons/iconSvg.ts` is left alone rather than given a story.
	litComponentSuffix: 'lit',
	// A page takes no props, so a story generated for one has nothing to show.
	// The React site leaves its own router folder alone for the same reason.
	scaffoldIgnore: ['src/pages/**'],
})
