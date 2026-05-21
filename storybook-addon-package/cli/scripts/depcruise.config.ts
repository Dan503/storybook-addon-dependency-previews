import type { IConfiguration } from 'dependency-cruiser'

// Source-folder name is passed in from `sb-deps.ts` via env (see
// `runDepCruiseOnce`). Defaults to `'src'` so manual `depcruise` invocations
// outside the sb-deps pipeline still get sensible behaviour.
//
// `''` is a deliberate sentinel meaning "the project root is the source
// folder" — in that mode the `from` matchers can't anchor on `^src`; they
// have to allow everything-except-node_modules instead. The CLI-level
// `--include-only` flag set by `runDepCruiseOnce` does the same node_modules
// denylist so the two layers agree.
const SRC_DIR = process.env.SB_DEPS_SRC_DIR ?? 'src'
const fromAnchor = SRC_DIR === '' ? '^(?!node_modules/)' : `^${SRC_DIR}`
const componentsPath =
	SRC_DIR === ''
		? '^(components|ui|lib)/'
		: `^${SRC_DIR}/(components|ui|lib)/`

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
			from: { path: fromAnchor },
			to: { path: '^node_modules' },
		},

		// 2) Warn on orphan modules within components/ui/lib (valid `from`/`to` form)
		{
			name: 'no-orphans-in-components',
			severity: 'warn',
			from: {
				orphan: true,
				path: componentsPath,
			},
			to: {}, // must be present; empty matcher is fine
		},
	],
	options: {
		tsPreCompilationDeps: true,
		combinedDependencies: true,
		doNotFollow: { path: 'node_modules' },
		// `includeOnly` is set at the CLI level by `runDepCruiseOnce` so it can
		// tighten to `^(?!node_modules/)` when `SRC_DIR === ''`. CLI flags
		// override config-file options, so duplicating the value here would just
		// be confusing — keep this as the single source of truth (the CLI flag).
		// IMPORTANT: keep baseDir disabled to avoid the previous src\src issue
		// baseDir: 'src'
	},
}

export default config
