import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	// Nuxt names its source root `app/` rather than `src/`. This is the only
	// example site that has to say so; the rest sit on the `src` default.
	srcDir: 'app',
})
