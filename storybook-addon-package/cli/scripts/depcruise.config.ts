import type { IConfiguration } from 'dependency-cruiser'
import {
	IS_CASE_INSENSITIVE_PATH_FS,
	escapeForRegex,
	escapeForRegexIgnoringCase,
} from './shared.js'

// Source-folder name is passed in from `sb-deps.ts` via env (see
// `runDepCruiseOnce`). Defaults to `'src'` so manual `depcruise` invocations
// outside the sb-deps pipeline still get sensible behaviour.
//
// `''` is a deliberate sentinel meaning "the project root is the source
// folder" — in that mode the `from` matchers can't anchor on `^src`; they
// have to allow everything-except-node_modules instead. The denylist rejects
// `node_modules` as any path segment (top-level *or* nested under workspace
// packages), and the CLI-level `--include-only` flag set by
// `runDepCruiseOnce` uses the same pattern so the two layers agree.
const SRC_DIR = process.env.SB_DEPS_SRC_DIR ?? 'src'
// SRC_DIR may legitimately contain `.` (e.g. `app.v2`) — the validator in
// sb-deps.ts accepts alphanumerics + `.`, `_`, `-`. Escape regex metacharacters
// before interpolating so `.` doesn't act as a wildcard and broaden the rule
// matchers to unrelated paths.
//
// dependency-cruiser compiles these rule matchers with a plain case-SENSITIVE
// `new RegExp(...)`, and module paths carry their on-disk spelling — so on the
// platforms whose file systems ignore case, every letter is written as a pair
// matching both of its cases (`s` → `[sS]`), the same treatment the CLI-level
// `--include-only` regex gets in `sb-deps.ts`. Otherwise srcDir `src` in the
// config with `Src` on disk would make these rules silently match nothing.
const escapedSrcDir = IS_CASE_INSENSITIVE_PATH_FS
	? escapeForRegexIgnoringCase(SRC_DIR)
	: escapeForRegex(SRC_DIR)
// Anchor the non-empty case to a directory boundary (`^<srcDir>/`) so a
// SRC_DIR of `src` doesn't accidentally also match sibling folders like
// `src2/` or `srcabc/`. Matches the trailing-slash anchor used by the
// CLI-level `--include-only` regex in `sb-deps.ts`.
const fromAnchor =
	SRC_DIR === '' ? '^(?!(?:[^/]*/)*node_modules/)' : `^${escapedSrcDir}/`
// The `components`/`ui`/`lib` folder names get the same both-case treatment as
// `escapedSrcDir` above — otherwise a `Src/Components/` layout on a
// case-insensitive file system would match the srcDir half of this anchor but
// not the folder-name half, and the orphan rule below would silently match
// nothing (the same half-tolerant state the srcDir escape just fixed).
const componentFolderNames = ['components', 'ui', 'lib']
const componentFolderPattern = componentFolderNames
	.map(
		IS_CASE_INSENSITIVE_PATH_FS ? escapeForRegexIgnoringCase : escapeForRegex,
	)
	.join('|')
const componentsPath =
	SRC_DIR === ''
		? `^(${componentFolderPattern})/`
		: `^${escapedSrcDir}/(${componentFolderPattern})/`

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
		// tighten to the any-segment node_modules denylist
		// `^(?!(?:[^/]*/)*node_modules/)` when `SRC_DIR === ''`. CLI flags
		// override config-file options, so duplicating the value here would
		// just be confusing — keep this as the single source of truth (the
		// CLI flag).
		// IMPORTANT: keep baseDir disabled to avoid the previous src\src issue
		// baseDir: 'src'
	},
}

export default config
