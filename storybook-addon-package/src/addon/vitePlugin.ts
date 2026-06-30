import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const jsonUrlPath = '/dependency-previews.json'

function readDependencyPreviewsJson(): string {
	const jsonPath = resolve(
		process.cwd(),
		'.storybook/dependency-previews.json',
	)
	return existsSync(jsonPath) ? readFileSync(jsonPath, 'utf8') : '{}'
}

export function sbDepsVitePlugin(): Plugin {
	const virtId = 'virtual:dependency-previews-json'
	const resolved = '\0' + virtId
	return {
		name: 'sb-deps',
		resolveId(id: string) {
			return id === virtId ? resolved : null
		},
		load(id: string) {
			if (id !== resolved) return null
			return `export default ${readDependencyPreviewsJson()};`
		},
		// The manager-side panel (GraphView) fetches the JSON over HTTP — it
		// can't import the virtual module above because the manager bundle is
		// prebuilt by Storybook, not bundled by the project's Vite config.
		configureServer(server) {
			server.middlewares.use(jsonUrlPath, (_req, res) => {
				// Read per-request so `sb-deps --watch` regenerations are served
				// without restarting Storybook.
				res.setHeader('Content-Type', 'application/json')
				res.end(readDependencyPreviewsJson())
			})
		},
		// Emit the JSON into `storybook build` output so the panel's fetch also
		// works in deployed static Storybooks, mirroring the dev middleware.
		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: 'dependency-previews.json',
				source: readDependencyPreviewsJson(),
			})
		},
	}
}
