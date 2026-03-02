import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export const addons: Array<string> = [
	'@storybook/addon-docs',
	'@storybook/addon-links',
]

export async function managerEntries(entry: string[] = []): Promise<string[]> {
	// Register the dependency-previews panel in Storybook's manager UI.
	// The preset lives at dist/addon/preset.cjs, so '../manager.cjs' resolves
	// to dist/manager.cjs — the compiled manager entry that calls addons.register().
	return [...entry, require.resolve('../manager.cjs')]
}
