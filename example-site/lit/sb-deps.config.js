import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	// Only `Name.lit.ts` is a component, so a plain helper such as
	// `icons/iconSvg.ts` is left alone rather than given a story.
	componentFileSuffix: 'lit',
	// A page draws from the address and the meal database, which a story cannot
	// set, so a story generated for one has nothing to show; the template each
	// page draws already has stories. The React site leaves its own router
	// folder alone too.
	scaffoldIgnore: ['src/pages/**'],
})
