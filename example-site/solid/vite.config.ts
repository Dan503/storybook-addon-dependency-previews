/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { nitroV2Plugin as nitro } from '@solidjs/vite-plugin-nitro-2'
import { solidStart } from '@solidjs/start/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import tailwind from '@tailwindcss/vite'

const dirname =
	typeof __dirname !== 'undefined'
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url))

// Storybook reads this same file, so without this the Solid Start and Nitro
// plugins join its build as well as the site's. They are built to take a whole
// build over — they replace the step that writes the output and choose where it
// goes — so the built Storybook ends up shaped by plugins that have nothing to
// do with it.
//
// Which command is running is read from the path of the program node was told
// to run, split into its parts. Asking whether that path merely contains
// "storybook" does not work here: this repository is itself called
// storybook-addon-dependency-previews, so every path inside it contains the
// word, and the site's own build would be treated as Storybook's. A part that
// is exactly "storybook" is the folder Storybook's own program lives in, which
// the site's build does not go through.
const commandParts = (process.argv[1] ?? '').split(/[\\/]/)
const isStorybook = commandParts.includes('storybook')

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [
		tailwind(),
		!isStorybook && solidStart(),
		!isStorybook && nitro({ preset: 'netlify' }),
	].filter(Boolean),
	test: {
		projects: [
			{
				extends: true,
				plugins: [
					tailwind(),
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(dirname, '.storybook'),
					}),
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: 'chromium',
							},
						],
					},
				},
			},
		],
	},
})
