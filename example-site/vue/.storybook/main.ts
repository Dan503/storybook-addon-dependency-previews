import type { StorybookConfig } from '@storybook/vue3-vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
	stories: ['../components/**/*.stories.@(ts|tsx|mdx)'],
	addons: [
		// register your addon
		'storybook-addon-dependency-previews/addon',
	],
	framework: {
		name: '@storybook/vue3-vite',
		options: {
			// `vue-docgen-api` (the current default) uses a babel-based parser
			// that can't resolve imported types from other `.vue` files in
			// `defineProps<T>()` generics — it tries to read the imported SFC
			// as raw TypeScript and chokes on the `<script setup>` tag.
			// `vue-component-meta` uses Volar / Vue Language Tools (same engine
			// as TS), which understands cross-file type imports correctly.
			// Upstream `@storybook/vue3-vite` notes this will become the new
			// default in a future release.
			//
			// We deliberately do NOT pass a `tsconfig` option here: with no
			// `tsconfig.json` at the monorepo root, the plugin falls back to
			// its built-in `createCheckerByJson(projectRoot, { include: ["**/*"] })`
			// checker, which works correctly. Pointing at the Nuxt-generated
			// `tsconfig.app.json` causes Volar to throw silently (see
			// vue-component-meta's catch-all swallowing the error in the
			// plugin handler), producing empty docgen.
			docgen: 'vue-component-meta',
		},
	},
	staticDirs: ['../public'],
	// `@storybook/vue3-vite` ships only Storybook-specific Vue helpers (template
	// compilation, component-meta plugin) — it does NOT bundle `@vitejs/plugin-vue`.
	// We add it here so `.vue` SFC imports actually parse during the Storybook build.
	viteFinal: async (viteConfig) =>
		mergeConfig(viteConfig, {
			plugins: [vue(), tailwindcss()],
		}),
}

export default config
