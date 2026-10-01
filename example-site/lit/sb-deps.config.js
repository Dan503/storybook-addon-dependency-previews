import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	// Only `Name.lit.ts` is a component, so a plain helper such as
	// `icons/iconSvg.ts` is left alone rather than given a story.
	componentFileSuffix: 'lit',
	// Most pages only fill in a template from the address and the meal
	// database, so a story generated for one would show nothing the template's
	// own stories do not. The not-found and load-failure pages draw their own
	// message, and are left without stories along with the rest. The React site
	// leaves its own router folder alone too.
	scaffoldIgnore: ['src/pages/**'],
})
