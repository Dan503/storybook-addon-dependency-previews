import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwind from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwind(),
		preact({
			prerender: {
				enabled: true,
				renderTarget: '#app',
				additionalPrerenderRoutes: ['/404'],
				previewMiddlewareEnabled: true,
				// Left unset on purpose. The middleware appends "/index.html" to
				// whatever this says, so with nothing here an address that has no
				// file written for it serves the site itself and the router draws
				// the right page — which is what `public/_redirects` tells a real
				// host to do. Set to "/404" it would serve the not-found page
				// instead, and a meal page, which is deliberately not written
				// ahead, would show "not found" before its meal arrived.
			},
		}),
	],
})
