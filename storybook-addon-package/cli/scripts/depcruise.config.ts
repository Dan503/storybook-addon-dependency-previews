import type { IConfiguration } from 'dependency-cruiser'

const config: IConfiguration = {
	forbidden: [
		// 0) No circular dependencies anywhere
		{
			name: 'no-circular',
			severity: 'error',
			from: {},
			to: { circular: true },
		},

		// 1) Warn when importing directly from node_modules (optional)
		{
			name: 'no-node-modules-imports',
			severity: 'warn',
			from: { path: '^src' },
			to: { path: '^node_modules' },
		},

		// 2) Warn on orphan modules within components/ui/lib (valid `from`/`to` form)
		{
			name: 'no-orphans-in-components',
			severity: 'warn',
			from: {
				orphan: true,
				path: '^src/(components|ui|lib)/',
			},
			to: {}, // must be present; empty matcher is fine
		},
	],
	options: {
		tsPreCompilationDeps: true,
		combinedDependencies: true,
		doNotFollow: { path: 'node_modules' },
		includeOnly: '^src',
		// IMPORTANT: keep baseDir disabled to avoid the previous src\src issue
		// baseDir: 'src'
	},
}

export default config
