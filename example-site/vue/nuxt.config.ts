import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	typescript: {
		tsConfig: {
			// Nuxt only reads the folders it builds from, which means `app/` and
			// whatever those files import — so the story files sitting beside each
			// component go unread, along with the few components only a story uses.
			// Naming the folder here adds them; Nuxt merges this with its own list.
			// The path is relative to `.nuxt/`, where the config is written.
			include: ['../components/**/*'],
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
})
