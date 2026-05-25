import { defineSbDepsConfig } from 'storybook-addon-dependency-previews/config'

export default defineSbDepsConfig({
	// Nuxt convention: component source lives under `components/`, not `src/`.
	srcDir: 'components',
})
