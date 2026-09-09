import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwind from '@tailwindcss/vite'

// Storybook reads this same file, so without this the step that writes the
// site's pages out joins Storybook's build too — and fails there, because
// Storybook has no site entry for it to start from ("Unable to detect
// prerender entry script"). Preact itself is still needed by Storybook, so it
// is only the page-writing part that is left out.
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

const prerenderOptions = {
	enabled: true,
	renderTarget: '#app',
	additionalPrerenderRoutes: ['/404'],
	previewMiddlewareEnabled: true,
	// `previewMiddlewareFallback` is left unset on purpose. The middleware
	// appends "/index.html" to whatever it says, so with nothing here an
	// address that has no file written for it serves the site itself and the
	// router draws the right page — which is what `public/_redirects` tells a
	// real host to do. Set to "/404" it would serve the not-found page instead,
	// and a meal page, which is deliberately not written ahead, would show
	// "not found" before its meal arrived.
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwind(),
		preact(isStorybook ? {} : { prerender: prerenderOptions }),
	],
})
