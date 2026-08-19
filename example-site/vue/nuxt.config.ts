import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	typescript: {
		tsConfig: {
			// Nuxt only type-checks the folders it builds from, so the story
			// files sitting beside each component are never read — `pnpm check`
			// would pass without ever opening them. Add the folder back.
			include: ['../components/**/*'],
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
})
