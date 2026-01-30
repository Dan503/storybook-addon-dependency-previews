import { defineConfig } from 'vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

// Check if we're running Storybook (set by Storybook CLI)
const isStorybook =
	process.argv[1]?.includes('storybook') ||
	process.argv.some((arg) => arg.includes('storybook'))

const config = defineConfig({
	plugins: [
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		tailwindcss(),
		// TanStack Start and Netlify plugins break Storybook build
		// (they set base: "." and outDir: "client/" which are incompatible)
		!isStorybook && tanstackStart(),
		!isStorybook && netlify(),
		viteReact(),
	].filter(Boolean),
	// For Storybook, ensure @storybook packages are properly resolved
	...(isStorybook && {
		resolve: {
			dedupe: ['@storybook/addon-docs'],
		},
	}),
})

export default config
